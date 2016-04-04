'use strict';

const lfs = require('larvitfs'),
      log = require('winston'),
      fs  = require('fs');

let _ = require('lodash');

function Instance(options) {
	this.compiledTmpls = new Map();

	// Copy options object - set default vars
	this.options = _.extend({
		'formatDateTime': 'YYYY-MM-DD HH:mm',
		'tmplPath':       'public/tmpl',
		'underscoreExt':  {}, // Only kept for backward compability
		'lodashExt':      {}
	}, options);

	// Extend lodash with the extensions
	_ = _.extend(_, this.options.underscoreExt);
	_ = _.extend(_, this.options.lodashExt);

	// Extend lodash with the render method, so we can render other templates from within it.
	_ = _.extend(_, {'render': this.render});
}

/**
 * Compile templates and cache the compiled ones
 *
 * @param str staticFilename - Full exact path
 * @return func compileObj or false
 */
Instance.prototype.compileTmpl = function compileTmpl(staticFilename) {
	if (this.compiledTmpls.get(staticFilename) === undefined) {
		let tmplFileContent;

		log.debug('larvitviews: compileTmpl() - Compiling previous uncompiled template "' + staticFilename + '"');

		try {
			tmplFileContent = fs.readFileSync(staticFilename, 'utf8');
		} catch(err) {
			log.warn('larvitviews: compileTmpl() - Error reading file "' + staticFilename + '" from disk. Error: ' + err.message);
			return false;
		}

		try {
			this.compiledTmpls.set(staticFilename, _.template(tmplFileContent));
		} catch(err) {
			log.warn('larvitviews: compileTmpl() - Could not compile template from file "' + staticFilename + '". Error: ' + err.message);
			return false;
		}
	} else {
		log.silly('larvitviews: compileTmpl() - Template "' + staticFilename + '" already compiled');
	}

	return this.compiledTmpls.get(staticFilename);
};

/**
 * Render template or other file
 *
 * @param str fileName - filename to render. Will search for exact match first and then with added .tmpl, relative to options.tmplPath - will be looked for by lfs.getPathSync()
 * @param obj data - data to be passed to the template rendering
 * @return str or false
 */
Instance.prototype.render = function render(fileName, data) {
	const tmplPath = this.options.tmplPath + '/' + fileName;

	let tmplFullPath;

	log.debug('larvitviews: render() - Trying to render "' + fileName + '" with path "' + tmplPath);

	tmplFullPath = lfs.getPathSync(tmplPath);

	// If the exact filename was not found, look for a file with added .tmpl at the end
	if (tmplFullPath === false)
		tmplFullPath = lfs.getPathSync(tmplPath + '.tmpl');

	if (tmplFullPath !== false) {
		let compiledStr,
		    compiled;

		compiled = this.compileTmpl(tmplFullPath);

		if ( ! compiled) {
			return false;
		}

		try {
			compiledStr = compiled(data);
		} catch(err) {
			log.warn('larvitviews: render() - Could not render "' + fileName + '". Error: ' + err.message);
			return 'Error: ' + err.message;
		}

		return compiledStr;
	}

	return false;
};

exports = module.exports = function(options) {
	return new Instance(options);
};