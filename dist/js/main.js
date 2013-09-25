/*

  -- OUTLINE: --

  + load
    - configure
    - build target container

  + resize over/under 768 threshold
    - detect mobile or desktop
    - desktop
      + build and style parallax container w/ bg image, clicktag, etc.
      + render desktop pixel

    - mobile
      + build a basic 300x250 image w/ clickthrough
      + render mobile pixel

*/

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
    parallax: true,
    creative: '',
    width: 1170,
    height: 460,
    backgroundColor: '#fff',
    bannerHTML: '',
    bannerCSS: {
      color: '#fff',
      fontSize: '32px',
      fontFamily: 'helvetica, arial, sans-serif',
      textShadow: '1px 1px #000',
      textDecoration: 'none',
      padding: '10px',
      position: 'absolute',
      zIndex: 20,
      bottom: 0,
      left: 0
    },
    mobile: {
      breakPoint: 768,
      creative: '',
      width: 300,
      height: 250
    }
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
      this.currentState = {
        desktop: false,
        mobile: false
      };
      this.$container = this.buildContainer().appendTo($(this.config.target));
      this.addListeners();
      return this;
    },

    /**
     * Builds the main container for the enterprise ad
     * @return {jQuery Object} Enterprise ad wrapper. All enterprise content will be in here.
     */
    buildContainer: function(){
      return $('<div></div>').addClass('enterprise-ad-container').css({
        position: 'relative'
      });
    },

    /**
     * Builds the Enterprise Ad
     */
    exec: function(){
      var mobileWidth = $window.width() < this.config.mobile.breakPoint ? true : false;

      //if desktop - render Enterprise ad:
      if(!this.currentState.desktop && !mobileWidth){
        this.currentState.desktop = true;
        this.currentState.mobile = false;
        this.buildEnterpriseAd();
      //else if mobile - render mobile ad:
      } else if(!this.currentState.mobile && mobileWidth){
        this.currentState.desktop = false;
        this.currentState.mobile = true;
        this.buildMobileAd();
      }
    },

    /**
     * Builds and renders the enterprise unit
     */
    buildEnterpriseAd: function(){
      this.$container.empty();
      this.$creative = $('<a></a>').addClass('enterprise-ad').attr({
        href: this.config.clickTracker + this.config.clickTag,
        target: '_blank'
      }).css({
        display: 'block',
        width: '100%',
        height: this.config.height + 'px',
        zIndex: 10,
        textDecoration: 'none',
        position: 'relative',
        background: this.config.backgroundColor + ' url(' + this.config.creative + ') no-repeat center top ' + (this.config.parallax ? 'fixed' : 'scroll')
      }).appendTo(this.$container);

      if(this.config.bannerHTML){
        this.$banner = $(this.config.bannerHTML).css(this.config.bannerCSS).appendTo(this.$container);
      }

    },

    /**
     * Builds and renders the mobile unit
     */
    buildMobileAd: function(){
      this.$container.empty();
      this.$creative = $('<a></a>').addClass('enterprise-mobile-ad').attr({
        href: this.config.clickTracker + this.config.clickTag,
        target: '_blank'
      }).css({
        width: this.config.mobile.width + 'px',
        height: this.config.mobile.height + 'px',
        border: 0
      }).append('<img src="' + this.config.mobile.creative + '" alt="Click here for more information" />').appendTo(this.$container);
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
    }

  };

  return Enterprise;

})(window.jQuery);
