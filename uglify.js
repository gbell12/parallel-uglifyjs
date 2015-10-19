#!/usr/bin/env node

var uglify = require('uglify-js');

		var fname = process.argv[2];
	    	
		// get the file source code
		console.log("   Uglify: reading " + fname);

		var fs = require('fs');
		fs.readFile(fname, function(error, source) {
			if (error) {
				console.log("ERROR:" + error);
				return;
			}

			//convert the buffer to a string
			var source = source.toString();

			// check the file is not empty or only contains whitespace (uglify-js will throw an error)
			if (source.replace(/\S/, '').length === 0) {
				console.log('   Uglify: Skipped empty file: ' + fname);
				return;
			}

			// uglify the code
			console.log('   Uglify: uglifying ' + fname);
			var code;
			setTimeout(function() {
				try {
					code = uglify.minify(source, {fromString: true}).code;
				} catch (error) {
					console.log(error);
					return;
				}

				// write the code back to the file
				fs.writeFile(fname, code, function(error) {
					if (error) {
						console.log(error);
						return;
					}
					console.log('   Uglify: Uglified: ' + fname);
				});
			});

		});

