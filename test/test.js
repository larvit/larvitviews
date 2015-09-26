'use strict';

var assert       = require('assert'),
    larvitrouter = require('larvitrouter')(),
    larvitviews  = require('../larvitviews')();

describe('Compile templates', function() {
	it('should compile a template and verify its working', function(done) {
		var tmplFile     = process.cwd() + '/public/tmpl/test.tmpl',
		    compiledTmpl = larvitviews.compileTmpl(tmplFile),
		    tmplData     = {'foo': 'bar'},
		    compiledStr  = compiledTmpl(tmplData);

		assert.deepEqual(compiledStr, 'Lur lurr bar', 'Should return "Lur lurr bar" but returned "' + compiledStr + '"');
		done();
	});

	it('should use the render function', function(done) {
		larvitrouter.on('pathsLoaded', function() {
			var tmplName    = 'test',
			    tmplData    = {'foo': 'bar'},
			    compiledStr = larvitviews.render(tmplName, tmplData);

			assert.deepEqual(compiledStr, 'Lur lurr bar', 'Should return "Lur lurr bar" but returned "' + compiledStr + '"');
			done();
		});
	});
});