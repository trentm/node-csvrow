/*
 * Copyright 2012 Joyent Inc.  All rights reserved.
 * Copyright 2012 Trent Mick.  All rights reserved.
 *
 * csvrow -- parsing a single CSV string
 */



/**
 * Parse a CSV row (i.e. a single row) into an array of strings.
 *
 * c.f. http://en.wikipedia.org/wiki/Comma-separated_values
 *
 * I didn't use one of the existing node CSV modules (bad me) because the
 * few I looked at were all async APIs.
 *
 * Limitations/Opinions:
 * - don't support elements with line-breaks
 * - leading a trailing spaces are trimmed, unless the entry is quoted
 *
 * @throws {TypeError} if the given CSV row is invalid
 */
function parseCSVRow(s) {
  var DEBUG = false;
  var row = [];
  var i = 0;
  var ch;

  if (s.indexOf('\n') !== -1 || s.indexOf('\r') !== -1) {
    throw new TypeError(
      format('illegal char: newlines not supported: "%s"', s));
  }

  DEBUG && console.warn('--\ns: %j', s);
  while (i < s.length) {
    DEBUG && console.warn('start cell');
    var cell = [];
    var quoted = false;
    var iQuote;

    // Find first non-whitespace cell char.
    while (i < s.length) {
      var ch = s[i];
      if (ch === ' ' || ch === '\t') {
        cell.push(ch);
      } else if (ch === '"') {
        quoted = true;
        iQuote = i;
        cell = [ch]; // wipe out leading whitespace
        i++;
        break;
      } else if (ch === ',') {
        // Empty cell.
        break;
      } else {
        cell.push(ch);
        i++;
        break;
      }
      i++;
    }
    DEBUG && console.warn('after first non-ws char: cell=%j, quoted=%j, i=%j', cell, quoted, i);

    if (quoted) {
      // Slurp up until end of string or close-quote.
      while (true) {
        if (i >= s.length) {
          throw new TypeError(format(
            "unterminated quoted string starting at position %d: '%s'",
            iQuote, s));
        }
        var ch = s[i];
        cell.push(ch);
        if (ch === '"') {
          if (i + 1 < s.length && s[i + 1] === '"') {
            // Escaped quote.
            i++;
          } else {
            // End of quoted string.
            i++;
            break;
          }
        }
        i++;
      }

      // Advance to comma (or end of string).
      while (i < s.length) {
        var ch = s[i];
        if (ch === ',') {
          i++;
          break;
        } else if (ch !== ' ' && ch !== '\t') {
          throw new TypeError(format(
            "illegal char outside of quoted cell at position %d: '%s'",
            i, s));
        }
        i++;
      }
    } else {
      // Slurp up cell until end of string or comma.
      while (i < s.length) {
        var ch = s[i];
        if (ch === ',') {
          i++;
          break;
        } else if (ch === '"') {
          throw new TypeError(
            format("illegal double-quote at position %d: '%s'", i, s));
        } else {
          cell.push(ch);
        }
        i++;
      }
    }

    // Post-process cell.
    if (quoted) {
      cell = cell.slice(1, cell.length - 1); // drop the quotes
      cell = cell.join('');
    } else {
      cell = cell.join('').trim();
    }
    DEBUG && console.warn('cell: cell=%j i=%j', cell, i);
    row.push(cell);
  }

  // Special case for trailing ','.
  if (s[s.length - 1] === ',') {
    DEBUG && console.warn('special case: add cell for trailing comma');
    row.push('');
  }

  DEBUG && console.warn('return: %j\n', row);
  return row;
}

/**
 * Serialize the given array to a CSV row.
 */
function serializeCSVRow(a) {
  var row = [];
  for (var i = 0; i < a.length; i++) {
    var elem = a[i];
    if (elem.indexOf(' ') !== -1 || elem.indexOf('\t') !== -1 ||
        elem.indexOf(',') !== -1 || elem.indexOf('"') !== -1) {
      row.push('"' + elem.replace(/"/g, '""') + '"')
    } else {
      row.push(elem);
    }
  }
  return row.join(',');
}

/**
 * Normalize the given CSV line.
 */
function normalizeCSVRow(s) {
  var row = parseCSVRow(s);
  var noEmpties = row.filter(function (elem) { return !!elem });
  return serializeCSVRow(noEmpties);
}




//---- exports

module.exports = {
  parse: parseCSVRow,
  stringify: serializeCSVRow,
  normalize: normalizeCSVRow
};
