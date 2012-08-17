/*
 * Test maintenance windows in the Amon Master.
 */


var debug = console.log;
var fs = require('fs');
var format = require('util').format;
var test = require('tap').test;
var uuid = require('node-uuid');
var Logger = require('bunyan');

// 'raw' test stuff
var maintenances = require('../lib/maintenances'),
  Maintenance = maintenances.Maintenance;
//var redis = require('redis');



//---- globals

//var configPath = path.resolve(__dirname, '../cfg/amon-master.json');
//var config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

var log = new Logger({
  name: 'maintenances.test',
  stream: process.stderr,
  level: 'trace'
});


//---- support functions

/**
 * From http://stackoverflow.com/a/8618383/122384
 */
function arrayEqual(a,b) {
  return !!a && !!b && !(a<b || b<a);
}


/**
 * Merge all the given objects into a new one. Fields in last given object
 * wins.
 */
function objMerge() {
  var o = {};
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    Object.keys(arg).forEach(function (k) {
      o[k] = arg[k];
    });
  }
  return o;
}


//---- test: raw working with Maintenance Window objects

test('raw maintenance window creation', function (t) {
  var userUuid = uuid();
  var data = {
    user: userUuid,
    id: 123,
    start: Date.now(),
    end: Date.now() + 60 * 1000,  // one minute from now
    notes: 'yo yo yo',
    all: true
  };
  var maint = new Maintenance(data, log);
  t.equal(maint.user, data.user, 'maint.user');
  t.equal(maint.id, 123, 'maint.id');
  t.equal(maint.start, data.start, 'maint.id');
  t.equal(maint.end, data.end, 'maint.id');
  t.equal(maint.notes, data.notes, 'maint.notes');
  t.equal(maint.all, true, 'maint.all');
  t.equal(maint.probes, undefined, 'maint.probes');
  t.equal(maint.machines, undefined, 'maint.machines');

  // Check serializations.
  var pub = maint.serializePublic();
  var db = maint.serializeDb();
  t.equal(pub.id, 123, 'serializePublic id');
  t.equal(db.id, 123, 'serializeDb id');
  t.equal(pub.user, userUuid, 'serializePublic user');
  t.equal(db.user, userUuid, 'serializeDb user');
  t.equal(pub.v, undefined, 'serializePublic v is undefined');
  t.equal(db.v, maintenances.MAINTENANCE_MODEL_VERSION, 'serializeDb v');
  // ...

  var base = {
    id: 123,
    user: userUuid,
    start: Date.now(),
    end: Date.now() + 60 * 1000,  // one minute from now
    all: true
  };
  var errData = [
    [{all: false}, 'exactly one'],
    [{user: 'bogus'}, 'UUID'],
    [{id: -1}, 'integer'],
    [{id: 0}, 'integer'],
    [{id: 1.5}, 'integer'],
    [{start: 'now'}, 'timestamp'],
    [{end: '1d'}, 'timestamp'],
    [{machines: uuid()}, 'exactly one'],
  ];
  errData.forEach(function (errDatum) {
    var data = objMerge(base, errDatum[0]);
    try {
      var maint = new Maintenance(data, log);
    } catch (err) {
      t.equal(err.name, 'TypeError', 'TypeError for bad Maintenance data');
      t.ok(err.toString().indexOf(errDatum[1]) !== -1,
        format('bad Maintenance data error included "%s"', errDatum[1]));
    }
  });

  t.end();
});




//---- test: CSV parsing

test('csv parsing', function (t) {
  var p = maintenances.parseCSVRow;

  var samples = [
    ['a,b,c', ['a', 'b', 'c']],
    ['a', ['a']],

    // Trimming
    [' a', ['a']],
    ['a ', ['a']],
    [' a ', ['a']],
    ['\t a\t', ['a']],

    // Quoting
    ['"a"', ['a']],
    ['"a b"', ['a b']],
    ['"a "" b"', ['a " b']],
    ['"a ""b"""', ['a "b"']],
    ['"a b",c ,"d "', ['a b', 'c', 'd ']],
    ['" a "', [' a ']],

    // Gross edge cases.
    ['', []],
    [',a', ['', 'a']],
    [',', ['', '']],
    ['""', ['']]
  ];

  samples.forEach(function (samples) {
    t.ok(arrayEqual(p(samples[0]), samples[1]),
      format('parseCSVRow(\'%s\') => %s', samples[0], JSON.stringify(samples[1])));
  });
  t.end();
});
