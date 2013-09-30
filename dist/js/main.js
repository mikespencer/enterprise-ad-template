var wpAd = wpAd || {};
wpAd.Enterprise = (function($){

  'use strict';

  //console.log polyfill for older browsers:
  var console = window.console || {
    log: function(){}
  };

  //if no jQuery, bail:
  if(!$){
    return function(){
      console.log('jQuery is undefined');
    };
  }

  //default configuration:
  var defaults = {
    clickTracker: '',
    clickTrackerEsc: '',
    clickTag: '',
    target: '',
    creative: {},
    backgroundColor: '#fff',
    bannerHTML: '',
    bannerCSS: {},
    thirdPartyTrackingPixels: []
  };

  //cache a reference to the jQuery window object
  var $window = $(window);

  //cache buster
  var random = Math.floor(Math.random() * 1E9);

  /**
   * Constructor
   * @param {Object} config Configuration Object. Possible properties listed above, in "defaults".
   */
  function Enterprise(config){
    this.configure(config).init().exec();
  }

  /**
   * Configure the Enterprise prototype
   */
  Enterprise.prototype = {

    /**
     * Configures the Enterprise Ad. Assigns properties to "this.config". Extends defaults (or optional
     * second argument) with the first argument.
     * @param {Object} newConfig Properties to merge in.
     * @param {Object} opt_existingConfig Object to receive the new properties.
     * @return {Object} returns this, for chaining purposes.
     */
    configure: function(newConfig, opt_existingConfig){
      var existingConfig = opt_existingConfig || defaults;
      this.config = $.extend(true, existingConfig, newConfig);
      return this;
    },

    /**
     * Called once on initial load
     */
    init: function(){
      var val, key, largest = 0, smallest = 0;

      this.$target = $(this.config.target);
      this.breakpoints = [];

      for(key in this.config.creative){
        if(this.config.creative.hasOwnProperty(key)){
          val = parseInt(key.replace(/_/, ''), 10);
          if(val){
            largest = val > largest ? val : largest;
            smallest = !smallest || val < smallest ? val : smallest;
            this.breakpoints.push(val);
          }
        }
      }
      this.largestBreakpoint = largest;
      this.smallestBreakpoint = smallest;
      this.$container = this.buildContainer().appendTo(this.$target);
      this.addPixels(this.config.thirdPartyTrackingPixels);
      this.addListeners();

      return this;
    },

    /**
     * Builds the main container for the enterprise ad
     * @return {jQuery Object} Enterprise ad wrapper. All enterprise content will be in here.
     */
    buildContainer: function(){
      return $('<div></div>').addClass('enterprise-ad-container').css({
        position: 'relative',
        margin: '0 auto'
      });
    },

    /**
     * Builds the Enterprise Ad, based on container size
     */
    exec: function(){
      var w = this.$target.outerWidth(),
        l = this.breakpoints.length,
        size = 0,
        i;

      //try to avoid loop in mobile environments to help performance
      if(w <= this.smallestBreakpoint){
        size = this.smallestBreakpoint;

      //check for large screens
      } else if(w >= this.largestBreakpoint){
        size = this.largestBreakpoint;

      //otherwise, determine best size creative to show
      } else {
        for(i = 0; i < l; i++){
          if(w <= this.breakpoints[i] && w > size){
            size = this.breakpoints[i];
          }
        }
      }

      //only swap out the creative if it's differnet to current one
      if((!this.currentSize || this.currentSize !== size) && this.config.creative['_' + size]){
        this.currentSize = size;
        this.buildEnterpriseAd();
      }
    },

    /**
     * Builds and renders the enterprise unit
     */
    buildEnterpriseAd: function(){
      var creative = this.config.creative['_' + this.currentSize];
      this.$container.empty();

      this.$creative = $('<a></a>').addClass('enterprise-ad').attr({
        href: this.config.clickTracker + this.config.clickTag,
        target: '_blank'
      }).css({
        display: 'block',
        maxWidth: creative.width + 'px',
        height: creative.height + 'px',
        zIndex: 10,
        textDecoration: 'none',
        position: 'relative',
        background: this.config.backgroundColor + ' url(' + creative.url + ') no-repeat center center ' + (creative.parallax ? 'fixed' : 'scroll')
      }).appendTo(this.$container);

      //for centering with "margin: 0 auto":
      this.$container.css({
        width: creative.width + 'px'
      });

      if(creative.banner && this.config.bannerHTML){
        this.$banner = $(this.config.bannerHTML).css(this.config.bannerCSS).css(creative.bannerCSS).appendTo(this.$container);
      }

    },

    /**
     * Adds event listeners. (Resize).
     */
    addListeners: function(){
      var _this = this;
      this.resizing = false;
      var resizeFn = function(){
        if(!_this.resizing){
          _this.resizing = true;
          _this.exec();
          _this.resizeTimeout = setTimeout(function(){
            _this.resizing = false;
          }, 200);
        }
      };
      $window.on('resize.enterprise', resizeFn);
    },

    addPixels: function(pixels){
      var l = pixels.length;
      while(l--){
        if(pixels[l]){
          this.addPixel(pixels[l]);
        }
      }
    },

    addPixel: function(url){
      $(document.createElement('img')).attr({
        src: url.replace(/timestamp|random|ord/ig, random),
        height: '1',
        width: '1',
        alt: ''
      }).css({
        border: 0,
        display: 'none'
      }).appendTo(this.$target);
    }

  };

  return Enterprise;

})(window.jQuery);
