# unicode lookup table

loads http://unicode.org/Public/UNIDATA/UnicodeData.txt into [nodejs](http://nodejs.org).

[![Build Status](https://secure.travis-ci.org/dodo/node-unicodetable.png)](http://travis-ci.org/dodo/node-unicodetable)


## install

```bash
# debian
sudo apt-get install unicode-data # optional
# gentoo
sudo emerge unicode-data # optional

npm install unicode
```

If you have problems installing `UnicodeData.txt` because unicode.org is down or you're behind a proxy, try installing unicode-data via your system package installer.

If you got the file already at hand you can specify the path to it in the environment varialbe `NODE_UNICODETABLE_UNICODEDATA_TXT`.

## example

```bash
master//node-unicodetable » node
> require('unicode/category/So')["♥".charCodeAt(0)]
{ value: '2665',
  name: 'BLACK HEART SUIT',
  category: 'So',
  class: '0',
  bidirectional_category: 'ON',
  mapping: '',
  decimal_digit_value: '',
  digit_value: '',
  numeric_value: '',
  mirrored: 'N',
  unicode_name: '',
  comment: '',
  uppercase_mapping: '',
  lowercase_mapping: '',
  titlecase_mapping: '',
  symbol: '♥' }
```
