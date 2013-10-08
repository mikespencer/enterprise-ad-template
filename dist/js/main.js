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
    creative: [],
    backgroundColor: '#fff',
    bannerHTML: '',
    thirdPartyTrackingPixels: [],
    customStylesheet: ''
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

      this.$target = $(this.config.target);
      this.$container = this.buildContainer().appendTo(this.$target);

      //add the custom stylesheet, if there is one:
      if(this.config.customStylesheet){
        $(document.createElement('link')).attr({
          href: this.config.customStylesheet,
          rel: 'stylesheet',
          type: 'text/css'
        }).appendTo('head');
      }

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
        creative = this.config.creative,
        l = creative.length,
        creativeIndex = null;

      while(l--){
        if((!creative[l].breakpoints[0] || w >= creative[l].breakpoints[0]) &&
           (!creative[l].breakpoints[1] || w <= creative[l].breakpoints[1])){
          creativeIndex = l;
          break;
        }
      }

      if(creativeIndex !== null && creativeIndex !== this.currentCreativeIndex){
        this.currentCreativeIndex = creativeIndex;
        this.buildEnterpriseAd();
      }
    },

    /**
     * Builds and renders the enterprise unit
     */
    buildEnterpriseAd: function(){
      var creative = this.config.creative[this.currentCreativeIndex];

      if(!creative.url){
        return false;
      }

      //set some default fallbacks
      creative.width = creative.width || creative.breakpoints[1] || creative.breakpoints[0];
      creative.height = creative.height || 460;

      //remove old creative
      this.$container.empty();

      this.$creative = $('<a></a>').addClass('enterprise-ad sz-' + creative.width).attr({
        href: this.config.clickTracker + (creative.clickTag || this.config.clickTag),
        target: '_blank'
      }).css({
        display: 'block',
        height: creative.height + 'px',
        zIndex: 10,
        textDecoration: 'none',
        position: 'relative',
        background: this.config.backgroundColor + ' url(' + creative.url + ') no-repeat center center ' + (creative.fixed ? 'fixed' : 'scroll')
      }).appendTo(this.$container);

      this.$container.css({
        maxWidth: creative.width + 'px'
      });

      if(creative.banner && this.config.bannerHTML){
        this.$banner = $(this.config.bannerHTML).appendTo(this.$creative);
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
          }, 50);
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
