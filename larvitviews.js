'use strict';

var fs            = require('fs'),
    _             = require('underscore'),
    path          = require('path'),
    appPath       = path.dirname(require.main.filename),
    log           = require('winston'),
    compiledTmpls = {};

/**
 * Compile templates and cache the compiled ones
 *
 * @param str staticFilename
 * @param func callback(err, compiledObj) - compiledObj is runnable
 */
function compileTmpl(staticFilename, callback) {
	if (compiledTmpls[staticFilename] === undefined) {
		log.debug('Comipling previous uncompiled template "' + staticFilename + '"');

		fs.readFile(staticFilename, 'utf8', function(err, tmplFileContent){
			if ( ! err) {
				compiledTmpls[staticFilename] = _.template(tmplFileContent);

				callback(null, compiledTmpls[staticFilename]);
			} else {
				log.error('Could not compile template "' + staticFilename + '"');

				callback(err);
			}
		});
	} else {
		callback(null, compiledTmpls[staticFilename]);
	}
}

exports = module.exports = function(options) {
	var returnObj = {};

	// Copy options object - set default vars
	options = _.extend({
		'viewPath': appPath + '/public',
		'tmplPath': appPath + '/public/views/tmpl'
	}, options);

	/**
	 * Render template
	 *
	 * @param str tmplName - filename, without ".tmpl" and relative to options.tmplPath
	 * @param obj data - data to be passed to the template rendering
	 * @param func callback(null, string)
	 */
	returnObj.render = function(tmplName, data, callback) {
		compileTmpl(options.tmplPath + '/' + tmplName + '.tmpl', function(err, compiled) {
			if (err) {
				callback(err);
				return;
			}

			callback(null, compiled(data));
		});
	};

	/**
	 * Render partials
	 *
	 * @param arr partials - one partial should consist of
	 *                      {
	 *                      	'partName': 'foo', // The name of this partial in the "master" template
	 *                      	'tmplName': 'bar', // The name of the template file to be loaded
	 *                        'data': {}'        // Local data for this partial rendering
	 *                      }
	 * @param obj rootData - the root data object, as given in the original call
	 * @param int partialNr - can be replaced by the callback
	 * @param func callback(err, tmplStr)
	 */
	returnObj.renderPartials = function(partials, rootData, partialNr, callback) {
		var localData,
		    partial;

		// If partialNr is not supplied, it should be the callback function
		if (typeof partialNr === 'function') {
			callback  = partialNr;
			partialNr = 0;
		}

		partial = partials[partialNr];

		localData = _.extend(partial.data, {'tmplParts': rootData.tmplParts});

		returnObj.render(partial.tmplName, localData, function(err, tmplStr) {
			if (err) {
				callback(err);
				return;
			}

			rootData.tmplParts[partial.partName] = tmplStr;

			partialNr ++;

			if (partials[partialNr] !== undefined) {
				returnObj.renderPartials(partials, rootData, partialNr, callback);
			} else {
				callback(null, tmplStr);
			}
		});
	};

	return returnObj;
};