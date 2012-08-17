This is a small node module for parsing individual CSV rows. This can be useful
if you have, say, a user-provided string that is a "comma-separated" set of
strings. Simply splitting on commas doesn't quite suffice.

It has been a little while, but when I last looked, existing node.js CSV
modules didn't make it straightforward to just parse a single row of CSV data
synchronously.

Follow <a href="https://twitter.com/intent/user?screen_name=trentmick" target="_blank">@trentmick</a>
for updates to this module.


# Installation

    npm install csvrow

This is also a single node.js module (lib/csvrow.js) with no external deps, so
you can alternatively just grab that file.


# Usage

Typical parsing as you'd expect:

    > var csvrow = require('csvrow');
    > csvrow.parse('a,b,c')
    [ 'a', 'b', 'c' ]
    > csvrow.parse(' a, b,, d')
    [ 'a', 'b', '', 'd' ]

And the reverse (stringifying):

    > csvrow.stringify(['a', 'b', 'c'])
    'a,b,c'
    > csvrow.stringify(['a', 'space y', 'c'])
    'a,"space y",c'

`parse` and `stringify` should always cycle to the same value, including with
some weird edge cases. See the test suite and
<http://en.wikipedia.org/wiki/Comma-separated_values>.

There is also a "normalize" function to get rid of spacing and empty columns:

    > csvrow.normalize('a, b, , d')
    'a,b,d'

Note: dropping empty entries might not be what you want. Patches
welcome to make that optional.



# Testing

    npm test   # tests with first node version on the path


# Versioning

The scheme I follow is most succintly described by the bootstrap guys
[here](https://github.com/twitter/bootstrap#versioning). 

tl;dr: All versions are `<major>.<minor>.<patch>` which will be incremented for
breaking backward compat and major reworks, new features without breaking
change, and bug fixes, respectively.



# License

MIT.

