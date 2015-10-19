#!/usr/bin/env node

var numCPUs = require('os').cpus().length;

var finder = require('finder-on-steroids');
var child = require('child_process');
var uglify = require('uglify-js');

var queue = require('queue');

var q = queue();
var results = [];

// add jobs using the Array API

q.concurrency = numCPUs;

console.log("Finding files");
finder(process.argv[2]).files().name('*.js').find(launch);

function launch(err, files) {
	console.log(err);

// A worker function to simplify the q.push and to make the closure work right
// The return is a function, which closes around i, meaning the fname is
// correct
function worker(i) {
	var local = i;
	return function(cb) {

		var fname = files[local];

		// get the file source code
		console.log("   Worker: reading " + fname);
		child.exec('./uglify_js_single ' + fname, function (error, stdout, stderr) {
			console.log('   Worker stdout: ' + stdout);
			if (stderr !== null && stderr !== '' ) {
				console.log('   Worker stderr: ' + stderr);
			}
			if (error !== null) {
				console.log('exec error: ' + error);
			}
			cb();
		});

	}
}

for (var i=0; i<files.length; ++i) {
	q.push(worker(i));
	//results.push('two');
}

console.log("   Master: Done pushing onto queue");

// use the timeout feature to deal with jobs that
// take too long or forget to execute a callback

q.timeout = 30000;

q.on('timeout', function(next, job) {
	console.log('   Master: job timed out:', job.toString().replace(/\n/g, ''));
	next();
});


// get notified when jobs complete

q.on('success', function(result, job) {
	//console.log('job finished processing:', job.toString().replace(/\n/g, ''));
	console.log('   Master: job finished processing');
});

// begin processing, get notified on end / failure

q.start(function(err) {
	console.log('   Master: all done:', results);
});

}
