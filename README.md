# Larvitviews

Used as the "view" part of the MVC micro framework [larvitbase](https://github.com/larvit/larvitbase), see usage documentation over there.

It is essentially a wrapper for lodash templates, adding support for partials and hierarchy.

When we selected template driver we had the following requirements:

1. **All** HTML should reside in the templates and **nowhere** else. This is not debatable.
2. It should resemble HTML as much as possible. Especially since the front enders normally just know HTML/CSS/js. It should not be a totally "new" language. This issue have been a burden in the past for us, for example when we used XSLT.
3. It should be fast. **Really** fast.
