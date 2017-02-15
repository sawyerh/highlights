var rp = require("request-promise");
var merge = require("merge");
var request;

function Siteleaf(options) {
  this.options = options || {};
  this.options = merge({
    apiKey: process.env['SITELEAF_APIKEY'],
    apiSecret: process.env['SITELEAF_APISECRET']
  }, this.options);

  request = rp.defaults({
    baseUrl: "https://api.siteleaf.com/v2/",
    auth: {
      user: this.options.apiKey,
      pass: this.options.apiSecret
    },
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Siteleaf-Node/0.1.0'
    },
    json: true
  });
};

Siteleaf.prototype.request = function(uri, options){
  options = options || {};
  options = merge(options, { uri: uri });
  var self = this;

  return request(options).catch(function(err){
    self.onerror(err)
  });
};

Siteleaf.prototype.onerror = function(err) {
  console.error(err.response.body);
};

module.exports = Siteleaf;
