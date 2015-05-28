'use strict';

var fs            = require('fs'),
    _             = require('underscore'),
    path          = require('path'),
    appPath       = path.dirname(require.main.filename),
    log           = require('winston'),
    compiledTmpls = {},
    confFile      = require(appPath + '/config/view.json');

/**
 * Compile templates and cache the compiled ones
 *
 * @param str staticFilename
 * @param func callback(err, compiledObj) - compiledObj is runnable
 */
function compileTmpl(staticFilename, callback) {
	if (compiledTmpls[staticFilename] === undefined) {
		log.debug('larvitviews: Compiling previous uncompiled template "' + staticFilename + '"');

		fs.readFile(staticFilename, 'utf8', function(err, tmplFileContent){
			if ( ! err) {
				compiledTmpls[staticFilename] = _.template(tmplFileContent);

				callback(null, compiledTmpls[staticFilename]);
			} else {
				log.error('larvitviews: Could not compile template "' + staticFilename + '"');

				callback(err);
			}
		});
	} else {
		callback(null, compiledTmpls[staticFilename]);
	}
}

/**
 * Get a deep value from an object by a string path
 * For example:
 * var foo = {'bar': {'lurker': 'someValue'}}
 * getValByPath(foo, 'bar.lurker') returns 'someValue'
 *
 * @param obj obj
 * @param str path
 * @return mixed
 */
function getValByPath(obj, path) {
	var p;

	if (typeof path === 'string') {
		path = path.split('.');
	}

	if (path.length > 1) {
		p = path.shift();

		if (typeof obj[p] === 'object') {
			return getValByPath(obj[p], path);
		} else {
			return undefined;
		}

	} else {
		return obj[path[0]];
	}
}

exports = module.exports = function(options) {
	var returnObj = {};

	// Copy options object - set default vars
	options = _.extend({
		'viewPath':      appPath + confFile.viewPath,
		'tmplPath':      appPath + confFile.tmplPath,
		'underscoreExt': {}
	}, options);

	// Extend underscore with the underscoreExt options
	_ = _.extend(_, options.underscoreExt);

	/**
	 * Render template
	 *
	 * @param str tmplPath - filename, without ".tmpl" and relative to options.tmplPath
	 * @param obj data - data to be passed to the template rendering
	 * @param func callback(null, string)
	 */
	returnObj.render = function(tmplPath, data, callback) {
		compileTmpl(options.tmplPath + '/' + tmplPath + '.tmpl', function(err, compiled) {
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
	 * @param obj structure - what data should be where
	 *                        [
	 *                          {
	 *                            'partName': 'foo',     // The name of this partial in the "master" template
	 *                            'tmplPath': 'bar',     // The name of the template file to be loaded
	 *                            'data':     'data.foo' // String representation of path to data for this partial
	 *                          },
	 *                          etc
	 *                        ]
	 * @param obj data - data structure - pointers in the structure points here
	 * @param int partialNr - should be replaced by the callback in the initial call
	 * @param func callback(err, tmplStr)
	 */
	returnObj.renderPartials = function(structure, data, partialNr, callback) {
		var localData,
		    partial,
		    partialData;

		// If partialNr is not supplied, it should be the callback function
		if (typeof partialNr === 'function') {
			callback  = partialNr;
			partialNr = 0;
		}

		partial = structure[partialNr];

		localData = {
			'tmplPath':  partial.tmplPath,
			'tmplParts': data.tmplParts
		};

		if (partial.data !== undefined) {
			partialData = getValByPath(data, partial.data);

			if (partialData !== undefined && typeof partialData !== 'object') {
				log.warn('larvitviews: renderPartials() - given partial data is not an object. Given path is "' + partial.data + '" and type is: "' + (typeof partialData) + '" with value: "' + partialData + '"');
			}

			if (partialData !== undefined) {
				localData         = _.extend(partialData, localData);
				localData._global = data._global;
			} else {
				log.warn('larvitviews: renderPartials() - getValByPath() on partial.data: "' + partial.data + '" failed. Most common reason for this error is the view structure is done in the wrong order.');
			}
		} else {
			localData = _.extend(data, localData);
		}

		// If a _global magic object key exists, always attach it to the local data
		if (data._global !== undefined) {
			localData._global = data._global;
		} else {
			// Always make sure the global is set not to cause undefined errors in templates
			localData._global = {};
		}

		returnObj.render(partial.tmplPath, localData, function(err, tmplStr) {
			if (err) {
				callback(err);
				return;
			}

			data.tmplParts[partial.partName] = tmplStr;

			partialNr ++;

			if (structure[partialNr] !== undefined) {
				returnObj.renderPartials(structure, data, partialNr, callback);
			} else {
				callback(null, tmplStr);
			}
		});
	};

	return returnObj;
};