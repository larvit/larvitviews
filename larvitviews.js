'use strict';

var fs            = require('fs'),
    _             = require('underscore'),
    log           = require('winston'),
    compiledTmpls = {},
    larvitrouter  = require('larvitrouter')();

/**
 * Compile templates and cache the compiled ones
 *
 * @param str staticFilename
 * @return func compileObj
 */
function compileTmpl(staticFilename) {
	var tmplFileContent;

	if (compiledTmpls[staticFilename] === undefined) {
		log.debug('larvitviews: compileTmpl() - Compiling previous uncompiled template "' + staticFilename + '"');

		tmplFileContent               = fs.readFileSync(staticFilename, 'utf8');
		compiledTmpls[staticFilename] = _.template(tmplFileContent);
	}

	return compiledTmpls[staticFilename];
}

exports = module.exports = function(options) {
	var returnObj = {};

	// Copy options object - set default vars
	options = _.extend({
		'formatDateTime': 'YYYY-MM-DD HH:mm',
		'tmplPath':       'public/tmpl',
		'underscoreExt':  {}
	}, options);

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
		    compiled;

		log.debug('larvitviews: render() - Trying to render "' + tmplName + '" with full path "' + tmplPath);

		tmplFullPath = larvitrouter.fileExists(tmplPath);

		if (tmplFullPath !== false) {
			compiled = compileTmpl(tmplFullPath);

			return compiled(data);
		}
	};

	// Extend underscore with the underscoreExt options
	_ = _.extend(_, options.underscoreExt);

	// Extend underscore with the render method, so we can render other templates from within it.
	_ = _.extend(_, {'render': returnObj.render});

	return returnObj;
};