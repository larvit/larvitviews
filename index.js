'use strict';

const fs = require('fs');

let _ = require('lodash');

function renderInstance(options) {
	const compiledTmpls = new Map();

	function compileTmpl(staticFilename) {
		if (compiledTmpls.get(staticFilename) === undefined || process.env.NODE_ENV === 'development') {
			let tmplFileContent;

			options.log.debug('larvitviews: renderInstance() - compileTmpl() - Compiling previous uncompiled template "' + staticFilename + '"');

			try {
				tmplFileContent = fs.readFileSync(staticFilename, 'utf8');
			} catch (err) {
				options.log.warn('larvitviews: renderInstance() - compileTmpl() - Error reading file "' + staticFilename + '" from disk. Error: ' + err.message);

				return false;
			}

			try {
				compiledTmpls.set(staticFilename, _.template(tmplFileContent));
			} catch (err) {
				options.log.warn('larvitviews: renderInstance() - compileTmpl() - Could not compile template from file "' + staticFilename + '". Error: ' + err.message);

				return false;
			}
		} else {
			options.log.silly('larvitviews: renderInstance() - compileTmpl() - Template "' + staticFilename + '" already compiled');
		}

		return compiledTmpls.get(staticFilename);
	};

	return function render(fileName, data) {
		const tmplPath = options.tmplPath + '/' + fileName;

		let tmplFullPath;

		options.log.debug('larvitviews: renderInstance() - render() - Trying to render "' + fileName + '" with path "' + tmplPath);

		tmplFullPath = options.lfs.getPathSync(tmplPath);

		// If the exact filename was not found, look for a file with added .tmpl at the end
		if (tmplFullPath === false) {
			tmplFullPath = options.lfs.getPathSync(tmplPath + '.tmpl');
		}

		if (tmplFullPath !== false) {
			let compiledStr;
			let compiled;

			compiled = compileTmpl(tmplFullPath);

			if (!compiled) {
				return false;
			}

			try {
				compiledStr = compiled(data);
			} catch (err) {
				options.log.warn('larvitviews: renderInstance() - render() - Could not render "' + fileName + '". Error: ' + err.message);
				options.log.verbose('larvitviews: renderInstance() - render() - Could not render "' + fileName + '". Error: ' + err.message + '. Data: ' + JSON.stringify(data));

				return 'Error: ' + err.message;
			}

			return compiledStr;
		}

		return false;
	};
}

function Instance(options) {
	// Copy options object - set default vars
	this.options = _.extend({
		formatDateTime: 'YYYY-MM-DD HH:mm',
		tmplPath: 'public/tmpl',
		underscoreExt: {}, // Only kept for backward compability
		lodashExt: {}
	}, options);

	// Extend lodash with the extensions
	_ = _.extend(_, this.options.underscoreExt);
	_ = _.extend(_, this.options.lodashExt);

	// Instantiate libraries if they are not passed as options
	this.options.log = this.options.log || require('winston');
	this.options.lfs = this.options.lfs || new (require('larvitfs'))();

	// Extend lodash with the render method, so we can render other templates from within it.
	_.render = renderInstance(this.options);
}

Instance.prototype.render = function (fileName, data) {
	return renderInstance(this.options)(fileName, data);
};

exports = module.exports = function (options) {
	return new Instance(options);
};
