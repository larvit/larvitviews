'use strict';

var fs           = require('fs'),
    _            = require('lodash'),
    log          = require('winston'),
    larvitrouter = require('larvitrouter')();

exports = module.exports = function(options) {
	var returnObj = {'compiledTmpls': {}};

	// Copy options object - set default vars
	options = _.extend({
		'formatDateTime': 'YYYY-MM-DD HH:mm',
		'tmplPath':       'public/tmpl',
		'underscoreExt':  {}, // Only kept for backward compability
		'lodashExt':      {}
	}, options);

	/**
	 * Compile templates and cache the compiled ones
	 *
	 * @param str staticFilename
	 * @return func compileObj or err object
	 */
	returnObj.compileTmpl = function(staticFilename) {
		var tmplFileContent;

		if (returnObj.compiledTmpls[staticFilename] === undefined) {
			log.debug('larvitviews: compileTmpl() - Compiling previous uncompiled template "' + staticFilename + '"');

			try {
				tmplFileContent = fs.readFileSync(staticFilename, 'utf8');
			} catch(err) {
				log.warn('larvitviews: compileTmpl() - Error reading file "' + staticFilename + '" from disk. Error: ' + err.message);
				return err;
			}

			try {
				returnObj.compiledTmpls[staticFilename] = _.template(tmplFileContent);
			} catch(err) {
				log.warn('larvitviews: compileTmpl() - Could not compile template from file "' + staticFilename + '". Error: ' + err.message);
				return err;
			}
		} else {
			log.silly('larvitviews: compileTmpl() - Template "' + staticFilename + '" already compiled');
		}

		return returnObj.compiledTmpls[staticFilename];
	};

	/**
	 * Render template
	 *
	 * @param str tmplName - template name, without ".tmpl" and relative to options.tmplPath - will be looked for by larvitrouter.fileExists() recursively
	 * @param obj data - data to be passed to the template rendering
	 * @return str
	 */
	returnObj.render = function(tmplName, data) {
		var tmplPath = options.tmplPath + '/' + tmplName + '.tmpl',
		    tmplFullPath,
		    compiledStr,
		    compiled;

		log.debug('larvitviews: render() - Trying to render "' + tmplName + '" with full path "' + tmplPath);

		tmplFullPath = larvitrouter.fileExists(tmplPath);

		if (tmplFullPath !== false) {
			compiled = returnObj.compileTmpl(tmplFullPath);

			if (compiled instanceof Error) {
				// Error is logged upstream. We should return it though
				return compiled;
			}

			try {
				compiledStr = compiled(data);
			} catch(err) {
				log.warn('larvitviews: render() - Could not render "' + tmplName + '". Error: ' + err.message);
				return 'Error: ' + err.message;
			}

			return compiledStr;
		}
	};

	// Extend lodash with the extensions
	_ = _.extend(_, options.underscoreExt);
	_ = _.extend(_, options.lodashExt);

	// Extend lodash with the render method, so we can render other templates from within it.
	_ = _.extend(_, {'render': returnObj.render});

	return returnObj;
};