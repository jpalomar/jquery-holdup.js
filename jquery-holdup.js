
/*!  jquery-holdup - */

/* global define:false */

/*  *** USAGE ***
    JavaScript:
        // these are the open or commonly used api methods
        $(selector).holdup({override_options})     // create instance
        $(selector).holdup('render')               // will determine if element should be shown
        $(selector).holdup('show')                 // will force elements to be loaded

        // these are exposed really for debugging purposes...
        $(selector).holdup('observe')              // will add container ( window ) event listeners if listeners have not been added
        $(selector).holdup('ignore')               // will remove container ( window ) event listeners

    HTML:
        // NOTE: based on DEFAULT options
        // src-retina path is for displays that support hi-dpi images
        <img data-src="PATH_TO_IMG" data-src-retina="PATH_TO_RETINA_IMG" />
        <div data-src="PATH_TO_IMG" data-src-retina="PATH_TO_RETINA_IMG" ></div>

    CSS:
        // NOTE: based on DEFAULT options
        .heldup {
            rules ... rules
        }
        .heldup.heldup-success {
            rules ... rules
        }
        .heldup.heldup-error{
            rules ... rules
        }
*/
;( function ( factory )
{
    'use strict';

    if ( typeof define === 'function' && define.amd )
    {
        // AMD. Register as an anonymous module.
        define( ['jquery'], factory );
    }
    else
    {
        // Browser globals
        factory( jQuery );
    }
}
( function ( $ )
{
    'use strict';

    /* HELPER FUNCTIONS */
    // PURPOSE: check if element is in view to display
    // @param $container : $(DOMElement) of the scrollable view
    // @param $el : $(DOMElement)
    // @param threshold : Number
    // return bool
    var is_element_in_view = function( $container, $el, threshold )
    {
        // PURPOSE: check if element is in vertical viewport
        // @param el_top : Number
        // return bool
        var is_element_in_vertical_view = function( top )
        {
            var container_viewport_top = $container.scrollTop();
            return top + $el.height() >= container_viewport_top - threshold &&     // element bottom is within the viewport top
                top <= container_viewport_top + $container.height() + threshold    // element top is within the viewport bottom
                ;
        };

        // PURPOSE: check if element is in horizontal viewport
        // @param el_left : Number
        // return bool
        var is_element_in_horizontal_view = function( left )
        {
            var container_viewport_left = $container.scrollLeft();
            return left <= container_viewport_left + $container.width() &&         // element left is within the viewport right
                left + $el.width() >= container_viewport_left                      // element right is within the viewport left
                ;
        };

        // cache the element's coordinates on the page...
        var element_offset = $el.offset();

        return  is_element_in_vertical_view( element_offset.top ) &&
                is_element_in_horizontal_view( element_offset.left )
                ;
    };

    // PURPOSE: see if there are any more images to load -- see if rendering needs to be run
    // @param evt : $(Event)
    var do_render_view = function( evt )
    {
        // don't fire unless its by a human
        if ( evt.isTrigger )
        {
            return;
        }
        // selects the imgs waiting to be loaded
        var $imgs_not_loaded = $( '.' + pending_classname );

        // if there are images needing to load
        if ( $imgs_not_loaded.length )
        {
            // do the render method
            $imgs_not_loaded.holdup('render');
        }
        // or if the plugin observe has been initialized
        else if ( is_initialized )
        {
            // remove the events from the window
            HoldupProto.ignore();
        }
        // or nothing at all
    };

    // inspired by underscore's debounce and throttle routines
    var do_bottlenecked_event = function( fn, delay, is_resize )
    {
        var that;                       // pointer for scoped context
        var args;                       // pointer for scoped arguments
        var result;                     // pointer for returned value of function
        var timeout = null;             // window Timeout reference
        var last_timestap = 0;          // date int
        // invoked function routine with flag cleanup
        var do_call = function()
        {
            // store returned values from invoked function
            result = fn.apply(that, args);
            // reset flags
            timeout = that = args = null;
        };
        // out-of scope routine for the scroll function routine while setting flags
        var call_me_maybe = function()
        {
            // set compared flags
            last_timestap = is_resize ? 0 : $.now();
            // invoke the function
            do_call();
        };
        return function bottle_neck(/*arguments*/)
        {
            // set current timestamp
            var now = $.now();
            if ( ! last_timestap && is_resize )
            {
                // set current timestamp
                last_timestap = now;
            }
            // get time left
            var remaining = delay - ( now - last_timestap );
            // set scope references
            that = this;
            args = arguments;

            // do now
            if ( remaining <= 0 )
            {
                clearTimeout( timeout );
                last_timestap = now;
                do_call();
            }
            // do later
            else if ( !timeout && !is_resize )
            {
                timeout = setTimeout( call_me_maybe, remaining );
            }
            return result;
        };
    };

    // wrap deferments of invocation around render function
    var do_scroll_browser_event = do_bottlenecked_event(do_render_view, 300);
    var do_resize_browser_event = do_bottlenecked_event(do_render_view, 250, true);

    // PURPOSE: load image and handle error and fail events
    // @param $el : $(DOMElement)
    // @param options : { options }
    // return undefined
    var do_load_image = function( $el, options )
    {
        var do_handle_error = function()
        {
            // add error className
            $el
                .removeClass( pending_classname + ' ' + options.successClass )
                .addClass( options.errorClass )
                ;

            // run error callback... with arguments and the selected context...
            if ( options.onError )
            {
                options.onError.apply( $el, arguments );
            }
        };

        var do_handle_sucess = function()
        {
            // NOTE: this logic allows usage on elements -- not just <img>
            if ( $el.is( 'img' ) )
            {
                // set img.src property if element is an <img>
                // set src prop and add success className
                $el.prop( 'src', data_source_val )
                    .removeClass( pending_classname + ' ' + options.errorClass )
                    .addClass( options.successClass )
                    ;
            }
            // set background-image style tag if element is something else like a <div> or <a>
            else
            {
                $el.css('background-image', 'url("' + data_source_val + '")');
            }

            // run success callback... with arguments and the selected context...
            if ( options.onSuccess )
            {
                options.onSuccess.apply( $el, arguments );
            }
        };

        // get the path to the img in an html data-* attr
        var data_source_val = $el.data( options.srcAttr ) || $el.data( default_attr_name );
        var img;

        if ( data_source_val )
        {
            // create element
            img = new Image();
            // set events
            img.onerror = do_handle_error;
            img.onload = do_handle_sucess;
            // load image
            img.src = data_source_val;
        }
        else
        {
            do_handle_error();
        }
    };

    // constants
    var $el_scrollable = $(window);
    // the private resize event namespace
    var resize_event_name = 'resize.holdup';
    // the private scroll event namespace
    var scroll_event_name = 'scroll.holdup';
    // the additional className to define image load has successfully completed -- static to keep render routine consistent
    var pending_classname = 'holdup-pending';
    // 'original' is the default to support lazyload's default markup expectations
    var default_attr_name = 'src';
    // boolean to determine if plugin has been initialized for plugin window event logic
    var is_initialized = false;

    // reference for holdup jQuery PLUGIN
    var old = $.fn.holdup;

    /* Holdup CONSTRUCTOR */
    // @param element : DOMElement
    // @param options : { options }
    var Holdup = function( element, options )
    {
        var that = this;
        // define this instance's set of options
        var these_options = that.options = $.extend( {}, Holdup.DEFAULTS, options );

        // save reference to element
        that.$el = $( element )
            // add base className & add waiting state className
            .addClass( these_options.baseClass+' '+pending_classname )
            // and placeholder img
            .prop( 'src', these_options.placeholder )
            ;

        // set property
        that.isloaded = false;

        // do instance show
        that.observe();
        that.render();
    };

    // public methods
    var HoldupProto = Holdup.prototype;

    // PURPOSE: force show a specific element
    HoldupProto.show = function()
    {
        do_load_image(this.$el, this.options);
    };

    HoldupProto.render = function()
    {
        // proceed if element is visible and not loaded
        if (!this.isloaded && is_element_in_view($el_scrollable, this.$el, this.options.threshold) )
        {
            this.show();
        }
    };

    // PURPOSE: add plugin window events
    HoldupProto.observe = function()
    {
        // avoids binding events too much
        if (!is_initialized)
        {
            // bind events
            $el_scrollable
                .on(scroll_event_name, do_scroll_browser_event)
                .on(resize_event_name, do_resize_browser_event)
                ;
            // set flag
            is_initialized = true;
        }
    };

    // PURPOSE: remove plugin window events
    HoldupProto.ignore = function()
    {
        // unbind
        $el_scrollable
            .off(scroll_event_name)
            .off(resize_event_name)
            ;
        // set flag
        is_initialized = false;
    };

    // define initial default options
    Holdup.DEFAULTS = {
        // the initialized className to define image load has been bound to element
        'baseClass': 'heldup',
        // the additional className to define image load has unsuccessfully completed
        'errorClass': 'heldup-error',
        // the additional className to define image load has successfully completed
        'successClass': 'heldup-success',
        // define callbacks to null
        // will execute when user adds option
        'onSuccess': null,
        'onError': null,
        // default placeholder for when the images are not loaded which is a 1x1 transparent gif
        'placeholder': 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        // define slack of logic determining what' in the viewport
        'threshold': 0,
        // define the data attr to source the actual image -- if retina is found it toggles the default attr name
        'srcAttr': window.devicePixelRatio > 1 ? 'src-retina' : default_attr_name
    };

    // assign to {$.fn} namespace
    $.fn.holdup = function( option )
    {
        return this.each(function()
        {
            var $this = $( this );
            var data = $this.data( 'holdup' );
            var type = typeof option;

            // create new instance
            if ( !data )
            {
                $this.data( 'holdup', ( data = new Holdup( this, type === 'object' && option ) ) );
            }

            // execute instance method
            if ( type === 'string' && data[option] )
            {
                data[option]();
            }
        });
    };

    // set access to the plugin constructor to expose defaults and potentially allow DEFAULTS override...
    $.fn.holdup.Constructor = Holdup;

    /*
        // Holdup NO CONFLICT to reassign namespace
        **** USAGE
        var original_holdup = $.fn.holdup.noConflict()      // return $.fn.holdup to previously assigned value
        $.fn.someOtherNamespace = original_holdup           // give $().someOtherNamespace the yoholdup functionality
    */
    $.fn.holdup.noConflict = function()
    {
        $.fn.holdup = old;
        return this;
    };

    return $.fn.holdup;

}));
