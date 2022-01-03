var ATBS = ATBS || {};

(function($){

	// USE STRICT
	"use strict";

	var $window = $(window);
	var $document = $(document);
	var $goToTopEl = $('.js-go-top-el');
	var $overlayBg = $('.js-overlay-bg');
	var $shareButton = $('.single-content__top-left');

	ATBS.header = {

		init: function(){
			ATBS.header.offCanvasMenu();
			ATBS.header.priorityNavInit();
			ATBS.header.smartAffix.init({
	            fixedHeader: '.js-sticky-header',
	            headerPlaceHolder: '.js-sticky-header-holder',
	        });
		},
		/* ============================================================================
	     * Fix sticky navbar padding when open modal
	     * ==========================================================================*/
		stickyNavbarPadding: function() {
            var oldSSB = $.fn.modal.Constructor.prototype.setScrollbar;
            var $stickyHeader = $('.sticky-header .navigation-bar');

            $.fn.modal.Constructor.prototype.setScrollbar = function () 
            {
                oldSSB.apply(this);
                if(this.bodyIsOverflowing && this.scrollbarWidth) 
                {
                    $stickyHeader.css('padding-right', this.scrollbarWidth);
                }       
            }

            var oldRSB = $.fn.modal.Constructor.prototype.resetScrollbar;
            $.fn.modal.Constructor.prototype.resetScrollbar = function () 
            {
                oldRSB.apply(this);
                $stickyHeader.css('padding-right', '');
            }
		},

		/* ============================================================================
	     * Offcanvas Menu
	     * ==========================================================================*/
		offCanvasMenu: function() {
			var $backdrop = $('<div class="mnmd-offcanvas-backdrop"></div>');
			var $offCanvas = $('.js-mnmd-offcanvas');
			var $offCanvasToggle = $('.js-mnmd-offcanvas-toggle');
			var $offCanvasClose = $('.js-mnmd-offcanvas-close');
			var $offCanvasMenuHasChildren = $('.navigation--offcanvas').find('li.menu-item-has-children > a');
			var menuExpander = ('<div class="submenu-toggle"><i class="mdicon mdicon-expand_more"></i></div>');

			$backdrop.on('click', function(){
				$offCanvas.removeClass('is-active');
				$(this).fadeOut(200, function(){
					$(this).detach();
				});
			});

			$offCanvasToggle.on('click', function(e){
				e.preventDefault();
				var targetID = $(this).attr('href');
				var $target = $(targetID);
				$target.toggleClass('is-active');
				$backdrop.hide().appendTo(document.body).fadeIn(200);
			});

			$offCanvasClose.on('click', function(e){
				e.preventDefault();
				var targetID = $(this).attr('href');
				var $target = $(targetID);
				$target.removeClass('is-active');
				$backdrop.fadeOut(200, function(){
					$(this).detach();
				});
			});

            $offCanvasMenuHasChildren.append(function() {
            	return $(menuExpander).on('click', function(e){
            		e.preventDefault();
            		var $subMenu = $(this).parent().siblings('.sub-menu');

					$subMenu.slideToggle(200);
				});
            }); 
		},

		/* ============================================================================
	     * Prority+ menu init
	     * ==========================================================================*/
		priorityNavInit: function() {
			var $menus = $('.js-priority-nav');
			$menus.each(function() {
				ATBS.priorityNav($(this));
			})
		},

		/* ============================================================================
	     * Smart sticky header
	     * ==========================================================================*/
	    smartAffix: {
	        //settings
	        $headerPlaceHolder: null, //the affix menu (this element will get the mdAffixed)
	        $fixedHeader: null, //the menu wrapper / placeholder
	        isDestroyed: false,
	        isDisabled: false,
	        isFixed: false, //the current state of the menu, true if the menu is affix
	        isShown: false,
	        windowScrollTop: 0, 
	        lastWindowScrollTop: 0, //last scrollTop position, used to calculate the scroll direction
	        offCheckpoint: 0, // distance from top where fixed header will be hidden
	        onCheckpoint: 0, // distance from top where fixed header can show up
	        breakpoint: 992, // media breakpoint in px that it will be disabled

	        init : function init (options) {

	            //read the settings
	            this.$fixedHeader = $(options.fixedHeader);
	            this.$headerPlaceHolder = $(options.headerPlaceHolder);

	            // Check if selectors exist.
	            if ( !this.$fixedHeader.length || !this.$headerPlaceHolder.length ) {
	                this.isDestroyed = true;
	            } else if ( !this.$fixedHeader.length || !this.$headerPlaceHolder.length || ( ATBS.documentOnResize.windowWidth <= ATBS.header.smartAffix.breakpoint ) ) { // Check if device width is smaller than breakpoint.
	                this.isDisabled = true;
	            }

	        },// end init

	        compute: function compute(){
	        	if (ATBS.header.smartAffix.isDestroyed || ATBS.header.smartAffix.isDisabled) {
	        		return;
	        	}

	            // Set where from top fixed header starts showing up
	            if( !this.$headerPlaceHolder.length ) {
	                this.offCheckpoint = 400;
	            } else {
	            	this.offCheckpoint = $(this.$headerPlaceHolder).offset().top + 400;
	            }
	            
	            this.onCheckpoint = this.offCheckpoint + 500;

	            // Set menu top offset
	            this.windowScrollTop = ATBS.documentOnScroll.windowScrollTop;
	            if (this.offCheckpoint < this.windowScrollTop) {
	                this.isFixed = true;
	            }
	        },

	        updateState: function updateState(){
	            //update affixed state
	            if (this.isFixed) {
	                this.$fixedHeader.addClass('is-fixed');
	            } else {
	                this.$fixedHeader.removeClass('is-fixed');
	                $window.trigger('stickyHeaderHidden');
	            }

	            if (this.isShown) {
	                this.$fixedHeader.addClass('is-shown');
	            } else {
	                this.$fixedHeader.removeClass('is-shown');
	            }
	        },

	        /**
	         * called by events on scroll
	         */
	        eventScroll: function eventScroll(scrollTop) {

	            var scrollDirection = '';
	            var scrollDelta = 0;

	            // check the direction
	            if (scrollTop != this.lastWindowScrollTop) { //compute direction only if we have different last scroll top

	                // compute the direction of the scroll
	                if (scrollTop > this.lastWindowScrollTop) {
	                    scrollDirection = 'down';
	                } else {
	                    scrollDirection = 'up';
	                }

	                //calculate the scroll delta
	                scrollDelta = Math.abs(scrollTop - this.lastWindowScrollTop);
	                this.lastWindowScrollTop = scrollTop;

	                // update affix state
	                if (this.offCheckpoint < scrollTop) {
	                    this.isFixed = true;
	                } else {
	                    this.isFixed = false;
	                }
	                
	                // check affix state
	                if (this.isFixed) {
	                    // We're in affixed state, let's do some check
	                    if ((scrollDirection === 'down') && (scrollDelta > 14)) {
	                        if (this.isShown) {
	                            this.isShown = false; // hide menu
	                        }
	                    } else {
	                        if ((!this.isShown) && (scrollDelta > 14) && (this.onCheckpoint < scrollTop)) {
	                            this.isShown = true; // show menu
	                        }
	                    }
	                } else {
	                    this.isShown = false;
	                }

	                this.updateState(); // update state
	            }
	        }, // end eventScroll function

			/**
			* called by events on resize
			*/
	        eventResize: function eventResize(windowWidth) {
	        	// Check if device width is smaller than breakpoint.
	            if ( ATBS.documentOnResize.windowWidth < ATBS.header.smartAffix.breakpoint ) {
	                this.isDisabled = true;
	            } else {
	            	this.isDisabled = false;
	            	ATBS.header.smartAffix.compute();
	            }
	        }
	    },
	};

	ATBS.documentOnScroll = {
		ticking: false,
		windowScrollTop: 0, //used to store the scrollTop

        init: function() {
			window.addEventListener('scroll', function(e) {
				if (!ATBS.documentOnScroll.ticking) {
					window.requestAnimationFrame(function() {
						ATBS.documentOnScroll.windowScrollTop = $window.scrollTop();

						// Functions to call here
						if (!ATBS.header.smartAffix.isDisabled && !ATBS.header.smartAffix.isDestroyed) {
							ATBS.header.smartAffix.eventScroll(ATBS.documentOnScroll.windowScrollTop);
						}

						ATBS.documentOnScroll.goToTopScroll(ATBS.documentOnScroll.windowScrollTop);

						ATBS.documentOnScroll.shareButton(ATBS.documentOnScroll.windowScrollTop);

						ATBS.documentOnScroll.ticking = false;
					});
				}
				ATBS.documentOnScroll.ticking = true;
			});
        },

        /* ============================================================================
	     * Go to top scroll event
	     * ==========================================================================*/
        goToTopScroll: function(windowScrollTop){
			if ($goToTopEl.length) {
				if(windowScrollTop > 800) {
					if (!$goToTopEl.hasClass('is-active')) $goToTopEl.addClass('is-active');
				} else {
					$goToTopEl.removeClass('is-active');
				}
			}
		},
		shareButton: function(windowScrollTop){
			if ($shareButton.length) {
				if(windowScrollTop > 600) {
					if (!$shareButton.hasClass('is-active')) $shareButton.addClass('is-active');
				} else {
					$shareButton.removeClass('is-active');
				}
			}
		},
    };

	ATBS.documentOnResize = {
		ticking: false,
		windowWidth: $window.width(),

		init: function() {
			window.addEventListener('resize', function(e) {
				if (!ATBS.documentOnResize.ticking) {
					window.requestAnimationFrame(function() {
						ATBS.documentOnResize.windowWidth = $window.width();

						// Functions to call here
						if (!ATBS.header.smartAffix.isDestroyed) {
							ATBS.header.smartAffix.eventResize(ATBS.documentOnResize.windowWidth);
						}

						ATBS.clippedBackground();

						ATBS.documentOnResize.ticking = false;
					});
				}
				ATBS.documentOnResize.ticking = true;
			});
        },
	};

	ATBS.documentOnReady = {

		init: function(){
			ATBS.header.init();
			ATBS.header.smartAffix.compute();
			ATBS.documentOnScroll.init();
            ATBS.documentOnReady.ghost_infinity_pagination();
			ATBS.documentOnReady.goToTop();
			ATBS.documentOnReady.newsTicker();
			ATBS.documentOnReady.carousel_1i();

		},

		/* ============================================================================
	     * News ticker
	     * ==========================================================================*/
		newsTicker: function() {
			var $tickers = $('.js-mnmd-news-ticker');
			$tickers.each( function() {
				var $ticker = $(this);
				var $next = $ticker.siblings('.mnmd-news-ticker__control').find('.mnmd-news-ticker__next');
				var $prev = $ticker.siblings('.mnmd-news-ticker__control').find('.mnmd-news-ticker__prev');

				$ticker.addClass('initialized').vTicker('init', {
					speed: 300,
					pause: 3000,
				    showItems: 1,
				});

				$next.on('click', function() {
					$ticker.vTicker('next', {animate:true});
				});

				$prev.on('click', function() {
					$ticker.vTicker('prev', {animate:true});
				});
			})
		},


		carousel_1i: function() {
			var $carousels = $('.js-mnmd-carousel-1i');
			$carousels.each( function() {
				$(this).owlCarousel({
					items: 1,
					margin: 0,
					nav: true,
					loop: true,
					dots: true,
					autoHeight: true,
					navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
					smartSpeed: 500,
					responsive: {
						0 : {
					        items: 1,
					    },

					    768 : {
					        items: 1,
					    },
					},
				});
			})
		},


        ghost_infinity_pagination: function() {
            pagination();
            function pagination() {
                'use strict';
                var infScroll;
                var body = document.body;
                if (body.classList.contains('paged-next')) {
                    infScroll = new InfiniteScroll('.post-feed', {
                        append: '.feed',
                        button: '.infinite-scroll-button',
                        debug: false,
                        hideNav: '.pagination',
                        history: false,
                        path: '.pagination .older-posts',
                        scrollThreshold: false,
                    });
            
                    var button = document.querySelector('.infinite-scroll-button');
            
                    infScroll.on('request', function (_path, _fetchPromise) {
                        button.classList.add('loading');
                    });
            
                    infScroll.on('append', function (_response, _path, items) {
                        items[0].classList.add('feed-paged');
                        button.classList.remove('loading');
                    });
                }
            }
        },
        
        /* ============================================================================
	     * Slider
	     * ==========================================================================*/
       
		/* ============================================================================
	     * Scroll top
	     * ==========================================================================*/
		goToTop: function() {
			if ($goToTopEl.length) {
				$goToTopEl.on('click', function() {
					$('html,body').stop(true).animate({scrollTop:0},400);
					return false;
				});
			}
		},

		/* ============================================================================
	     * Sticky sidebar
	     * ==========================================================================*/
		stickySidebar: function() {
			setTimeout(function() {
				var $stickySidebar = $('.js-sticky-sidebar');
				var $stickyHeader = $('.js-sticky-header');

				var marginTop = ($stickyHeader.length) ? ($stickyHeader.outerHeight() + 20) : 0; // check if there's sticky header
				if ( $.isFunction($.fn.theiaStickySidebar) ) {
					$stickySidebar.theiaStickySidebar({
						additionalMarginTop: marginTop,
						additionalMarginBottom: 20,
					});
				}
			}, 250); // wait a bit for precise height;
		},
	};

	ATBS.documentOnLoad = {

		init: function() {
			ATBS.clippedBackground();
            ATBS.header.smartAffix.compute(); //recompute when all the page + logos are loaded
            ATBS.header.smartAffix.updateState(); // update state
            ATBS.header.stickyNavbarPadding(); // fix bootstrap modal backdrop causes sticky navbar to shift
			ATBS.documentOnReady.stickySidebar();
		}

	};


	/* ============================================================================
     * Blur background mask
     * ==========================================================================*/
	ATBS.clippedBackground = function() {
		if ($overlayBg.length) {
			$overlayBg.each(function() {
				var $mainArea = $(this).find('.js-overlay-bg-main-area');
				if (!$mainArea.length) {
					$mainArea = $(this);
				}

				var $subArea = $(this).find('.js-overlay-bg-sub-area');
				var $subBg = $(this).find('.js-overlay-bg-sub');

				var leftOffset = $mainArea.offset().left - $subArea.offset().left;
				var topOffset = $mainArea.offset().top - $subArea.offset().top;
				
				$subBg.css('display', 'block');
				$subBg.css('position', 'absolute');
				$subBg.css('width', $mainArea.outerWidth() + 'px');
				$subBg.css('height', $mainArea.outerHeight() + 'px');
				$subBg.css('left', leftOffset + 'px');
				$subBg.css('top', topOffset + 'px');
			});
		};
	}

	/* ============================================================================
     * Priority+ menu
     * ==========================================================================*/
    ATBS.priorityNav = function($menu) {
    	var $btn = $menu.find('button');
    	var $menuWrap = $menu.find('.navigation');
    	var $menuItem = $menuWrap.children('li');
		var hasMore = false;

		if(!$menuWrap.length) {
			return;
		}

		function calcWidth() {
			if ($menuWrap[0].getBoundingClientRect().width === 0)
				return;

			var navWidth = 0;

			$menuItem = $menuWrap.children('li');
			$menuItem.each(function() {
				navWidth += $(this)[0].getBoundingClientRect().width;
			});

			if (hasMore) {
				var $more = $menu.find('.priority-nav__more');
				var moreWidth = $more[0].getBoundingClientRect().width;
				var availableSpace = $menu[0].getBoundingClientRect().width;

				//Remove the padding width (assumming padding are px values)
				availableSpace -= (parseInt($menu.css("padding-left"), 10) + parseInt($menu.css("padding-right"), 10));
				//Remove the border width
				availableSpace -= ($menu.outerWidth(false) - $menu.innerWidth());

				if (navWidth > availableSpace) {
					var $menuItems = $menuWrap.children('li:not(.priority-nav__more)');
					var itemsToHideCount = 1;

					$($menuItems.get().reverse()).each(function(index){
						navWidth -= $(this)[0].getBoundingClientRect().width;
						if (navWidth > availableSpace) {
							itemsToHideCount++;
						} else {
							return false;
						}
					});

					var $itemsToHide = $menuWrap.children('li:not(.priority-nav__more)').slice(-itemsToHideCount);

					$itemsToHide.each(function(index){
						$(this).attr('data-width', $(this)[0].getBoundingClientRect().width);
					});

					$itemsToHide.prependTo($more.children('ul'));
				} else {
					var $moreItems = $more.children('ul').children('li');
					var itemsToShowCount = 0;

					if ($moreItems.length === 1) { // if there's only 1 item in "More" dropdown
						if (availableSpace >= (navWidth - moreWidth + $moreItems.first().data('width'))) {
							itemsToShowCount = 1;
						}
					} else {
						$moreItems.each(function(index){
							navWidth += $(this).data('width');
							if (navWidth <= availableSpace) {
								itemsToShowCount++;
							} else {
								return false;
							}
						});
					}

					if (itemsToShowCount > 0) {
						var $itemsToShow = $moreItems.slice(0, itemsToShowCount);

						$itemsToShow.insertBefore($menuWrap.children('.priority-nav__more'));
						$moreItems = $more.children('ul').children('li');

						if ($moreItems.length <= 0) {
							$more.remove();
							hasMore = false;
						}
					}
				}
			} else {
				var $more = $('<li class="priority-nav__more"><a href="#"><span>More</span><i class="mdicon mdicon-more_vert"></i></a><ul class="sub-menu"></ul></li>');
				var availableSpace = $menu[0].getBoundingClientRect().width;

				//Remove the padding width (assumming padding are px values)
				availableSpace -= (parseInt($menu.css("padding-left"), 10) + parseInt($menu.css("padding-right"), 10));
				//Remove the border width
				availableSpace -= ($menu.outerWidth(false) - $menu.innerWidth());

				if (navWidth > availableSpace) {
					var $menuItems = $menuWrap.children('li');
					var itemsToHideCount = 1;

					$($menuItems.get().reverse()).each(function(index){
						navWidth -= $(this)[0].getBoundingClientRect().width;
						if (navWidth > availableSpace) {
							itemsToHideCount++;
						} else {
							return false;
						}
					});

					var $itemsToHide = $menuWrap.children('li:not(.priority-nav__more)').slice(-itemsToHideCount);

					$itemsToHide.each(function(index){
						$(this).attr('data-width', $(this)[0].getBoundingClientRect().width);
					});

					$itemsToHide.prependTo($more.children('ul'));
					$more.appendTo($menuWrap);
					hasMore = true;
				}
			}
		}

		$window.on('load webfontLoaded', calcWidth );
		$window.on('resize', $.throttle( 50, calcWidth ));
    }

	$document.ready( ATBS.documentOnReady.init );
	$window.on('load', ATBS.documentOnLoad.init );
	$window.on( 'resize', ATBS.documentOnResize.init );

})(jQuery);