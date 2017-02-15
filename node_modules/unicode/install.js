#!/usr/bin/env node
//

var fs  = require('fs'),
    path = require('path'),
    http = require('http'),
    BufferStream = require('bufferstream'),

// http://www.ksu.ru/eng/departments/ktk/test/perl/lib/unicode/UCDFF301.html
keys =  ['value', 'name', 'category', 'class',
    'bidirectional_category', 'mapping', 'decimal_digit_value', 'digit_value',
    'numeric_value', 'mirrored', 'unicode_name', 'comment', 'uppercase_mapping',
    'lowercase_mapping', 'titlecase_mapping'],
systemfiles = [
    "/usr/share/unicode/UnicodeData.txt", // debian
    "/usr/share/unicode-data/UnicodeData.txt", // gentoo
    process.env.NODE_UNICODETABLE_UNICODEDATA_TXT || "UnicodeData.txt", // manually downloaded
],
unicodedatafile = {
    host: "unicode.org",
    path: "/Public/UNIDATA/UnicodeData.txt",
    method: 'GET',
    port:80,
},

 proxyServer = process.env.HTTPS_PROXY
            || process.env.https_proxy
            || process.env.HTTP_PROXY
            || process.env.http_proxy,

refs = 0;


// based on https://github.com/mathiasbynens/jsesc
function escape(charValue) {
    var hexadecimal = charValue.replace(/^0*/, ''); // is already in hexadecimal
    var longhand = hexadecimal.length > 2;
    return '\\' + (longhand ? 'u' : 'x') +
            ('0000' + hexadecimal).slice(longhand ? -4 : -2);
}

function stringify(key, value) {
    return key + ":" + JSON.stringify(value).replace(/\\\\(u|x)/, "\\$1");
}

function newFile(name, callback) {
    var filename = path.join(__dirname, "category", name + ".js"),
        file = fs.createWriteStream(filename, {encoding:'utf8'});
    file.once('close', function () {
        if (!--refs) {
            console.log("done.");
            callback();
        }
    });
    refs++;
    return file;
}

function parser(callback) {
    var data = {},
        buffer = new BufferStream({encoding:'utf8', size:'flexible'}),
        resume = buffer.resume.bind(buffer);

    buffer.split('\n', function (line) {
        var v, c, char = {},
            values = line.toString().split(';');
        for(var i = 0 ; i < 15 ; i++)
            char[keys[i]] = values[i];
        v = parseInt(char.value, 16);
        char.symbol = escape(char.value);
        c = char.category;
        if (!data[c]) {
            data[c] = newFile(c, callback)
                .on('drain', resume)
                .once('open', function () {
                    console.log("saving data as %s.js …", c);
                    if (this.write('module.exports={' + stringify(v, char)))
                        buffer.resume();
                });
            buffer.pause();
        } else if (!data[c].write("," + stringify(v, char))) {
            buffer.pause();
        }
    });


    buffer.on('end', function () {
        var cat, categories = Object.keys(data),
            len = categories.length;
        for(var i = 0 ; i < len ; i++) {
            cat = categories[i];
            data[cat].end("};");
        }
    });

    buffer.on('error', function (err) {
        if (typeof err === 'string')
            err = new Error(err);
        throw err;
    });

    return buffer;
}

function read_file(success_cb, error_cb) {
    var systemfile, sysfiles = systemfiles.slice(),
    try_reading = function (success, error) {
        systemfile = sysfiles.shift();
        if (!systemfile) return error_cb();
        console.log("try to read file %s …", systemfile);
        fs.exists(systemfile, function (exists) {
            if (!exists) {
                console.error("%s not found.", systemfile);
                return try_reading(success_cb, error_cb);
            }
            console.log("parsing …");
            fs.createReadStream(systemfile, {encoding:'utf8'}).pipe(parser(success_cb));
        });

    };
    try_reading(success_cb, error_cb);
}

function download_file(callback) {
    var timeouthandle = null;
    console.log("%s %s:%d%s", unicodedatafile.method, unicodedatafile.host,
                unicodedatafile.port, unicodedatafile.path);

    if (proxyServer) {
        var proxyVars = proxyServer.match(/^([^:/]*:[/]{2})?([^:/]+)(:([0-9]+))?/i);

        console.log('Proxy server detected, using proxy settings to download (%s)', proxyServer);

        unicodedatafile.path = unicodedatafile.host
                             + ":"
                             + unicodedatafile.port
                             + unicodedatafile.path;
        unicodedatafile.host = proxyVars[2];
        unicodedatafile.port = proxyVars[4];
    }

    http.get(unicodedatafile, function (res) {
        console.log("fetching …");

        // stop timeout couting
        if (timeouthandle)
            clearTimeout(timeouthandle);

        res.setEncoding('utf8');
        res.pipe(parser(callback));
    }).on('error', function (err) {
        console.error("Error while downloading %s: %s",
                      path.basename(unicodedatafile.path), err);
        console.log("Please download file manually,",
                    "put it next to the install.js file and",
                    "run `node install.js` again.");
        callback(1);
    });
    timeouthandle = setTimeout(function () {
        console.error("request timed out.");
        callback(1);
    }, 30 * 1000);
}


// run
if (!module.parent) { // not required
    read_file(process.exit, function () {
        console.log("try to download …");
        download_file(process.exit);
    });
} else {
    module.exports = {
        escape:escape,
        stringify:stringify,
        newFile:newFile,
        parser:parser,
        read_file:read_file,
        download_file:download_file,
    };
}

