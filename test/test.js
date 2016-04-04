'use strict';

const assert = require('assert'),
      views  = require(__dirname + '/../index.js')();

describe('Compile templates', function() {
	it('should compile a template and verify its working', function(done) {
		const tmplFile     = __dirname + '/../public/tmpl/test.tmpl',
		      compiledTmpl = views.compileTmpl(tmplFile),
		      tmplData     = {'foo': 'bar'},
		      compiledStr  = compiledTmpl(tmplData);

		assert.deepEqual(compiledStr, 'Lur lurr bar', 'Should return "Lur lurr bar" but returned "' + compiledStr + '"');
		done();
	});

	it('should use the render function', function(done) {
		const tmplName    = 'test',
		      tmplData    = {'foo': 'bar'},
		      compiledStr = views.render(tmplName, tmplData);

		assert.deepEqual(compiledStr, 'Lur lurr bar', 'Should return "Lur lurr bar" but returned "' + compiledStr + '"');
		done();
	});
});