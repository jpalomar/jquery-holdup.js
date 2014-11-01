holdup
=======

yo, holdup -- another image lazy loader? yup.


## Usage Help

### JavaScript:
these are the open or commonly used api methods
```javascript
$(selector).holdup({override_options})     // create instance
$(selector).holdup('render')               // will determine if element should be shown
$(selector).holdup('show')                 // will force elements to be loaded
```

these are exposed really for debugging purposes...
```javascript
$(selector).holdup('observe')              // will add container ( window ) event listeners if listeners have not been added
$(selector).holdup('ignore')               // will remove container ( window ) event listeners
```

### HTML:
##### NOTE: based on DEFAULT options
src-retina path is for displays that support hi-dpi images
```html
<img data-src="PATH_TO_IMG" data-src-retina="PATH_TO_RETINA_IMG" />
<div data-src="PATH_TO_IMG" data-src-retina="PATH_TO_RETINA_IMG" ></div>
```

### CSS:
##### NOTE: based on DEFAULT options
```css
.heldup
{
    /* rules ... rules */
}
.heldup.heldup-success
{
    /* rules ... rules */
}
.heldup.heldup-error
{
    /* rules ... rules */
}
```
