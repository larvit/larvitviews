'use strict';

const assert = require('assert'),
      views  = require(__dirname + '/../index.js')();

describe('Compile templates', function() {
	it('should use the render function', function(done) {
		const tmplName    = 'test',
		      tmplData    = {'foo': 'bar'},
		      compiledStr = views.render(tmplName, tmplData);

		assert.deepEqual(compiledStr, 'Lur lurr bar ((fjomp))', 'Should return "Lur lurr bar ((fjomp))" but returned "' + compiledStr + '"');
		done();
	});
});