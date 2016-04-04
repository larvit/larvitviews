[![Build Status](https://travis-ci.org/larvit/larvitviews.svg?branch=master)](https://travis-ci.org/larvit/larvitviews) [![Dependencies](https://david-dm.org/larvit/larvitviews.svg)](https://david-dm.org/larvit/larvitviews.svg)

# Larvitviews

Templating wrapper for lodash templates, adding support for partials and hierarchy.

When we selected template driver we had the following requirements:

1. **All** HTML should reside in the templates and **nowhere** else. This is not debatable.
2. It should resemble HTML as much as possible. Especially since the front enders normally just know HTML/CSS/js. It should not be a totally "new" language. This issue have been a burden in the past for us, for example when we used XSLT.
3. It should be fast. **Really** fast.

Used as the "view" part of the MVC micro framework [larvitbase](https://github.com/larvit/larvitbase).

## Usage

Template file /public/tmpl/test.tmpl:

```HTML
<p>Hello <%= user %></p>
```

Javascript file:

```javascript
const views = require('larvitviews')(),
      data  = {'user': 'Lilleman'};

console.log(views.render('test', data)); // <p>Hello Lilleman</p>
```

[Full documentation on the upstream Lodash templates](https://lodash.com/docs#template).

### Template partials

Template file /public/tmpl/foo.tmpl:

```HTML
<h1>Boo</h1>
<p><%= _.render('bar', obj) %></p>
```

Template file /public/tmpl/bar.tmpl:

```HTML
Value is: <%= obj.value %>
```

And to render this write this javascript code:

```javascript
const views = require('larvitviews');

console.log(views.render('foo', {'value': 'rev'}));
// Renders:
// <h1>Boo</h1>
// <p>Value is: rev</p>
```


