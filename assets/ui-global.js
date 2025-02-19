
const filterActive = document.querySelector('.fillter-action-optn-btn')

if(filterActive != null)
    filterActive.addEventListener('click', e => {
        const facetSidebar = document.querySelector('facet-form-sidebar')
        e.preventDefault()

        filterActive.classList.toggle('active')
        document.querySelector('.facets__wrapper').classList.toggle('active')
        document.querySelector('.active-facets-column').classList.toggle('active')

        if(facetSidebar != null){
            document.querySelector('facet-form-sidebar').classList.toggle('active')
        }        
    })
const rawHeader = document.querySelector('.raw-header-me')
if(rawHeader != null){
    document.body.classList.add('raw-header-bg')
}

// Back to top
    const backToTopBtn = document.querySelector(".back-to-top");
    const isSticky = document.querySelector(".main-header.scroll-up");

    if (backToTopBtn != null) {
        const scrollTrigger = 400;
        const backToTop = () => {
            backToTopBtn.classList.toggle("show", window.scrollY > scrollTrigger);
        };

        backToTop();
        window.addEventListener("scroll", backToTop);
        backToTopBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });

            if(isSticky){
                isSticky.classList.remove("sticky");
                isSticky.classList.add("remove-sticky");

                setTimeout(() => {
                    isSticky.classList.remove("remove-sticky");
                }, 1000);
            }
        });
    }


    const menuOuter = document.querySelector('.menu-outer')
    const menuBackdrop = document.querySelector('.menu-backdrop')
    const navLogo = document.querySelector('.nav-logo')
    const mobileMenu = document.querySelector('.mobile-menu')
    const closeBtn = document.querySelector('.close-btn')
    const menuLastBtn = document.querySelector('.this-is-menu-hidden')

    if (mobileMenu && closeBtn && menuLastBtn) {
        mobileMenu.addEventListener('keydown', function(event) {
            if (event.key === 'Tab') {
                if (document.activeElement === menuLastBtn) {
                    closeBtn.focus();
                }
            }
        });
    }

    class AnnouncementBar extends HTMLElement {
        constructor() {
            super()
            this.init()
        }
        get items() {
            return this._items=this._items||Array.from(this.children)
        }
        get watchCSS() {
            return this.hasAttribute("watch-css")
        }
        get initialIndex() {
            return parseInt(this.getAttribute("initial-index")||0)
        }
        init() {
            if (this.items.length > 1) {
                this.carousel = new Flickity(this, {
                    watchCSS: this.watchCSS,
                    // fade: true,
                    prevNextButtons: true,
                    adaptiveHeight: false,
                    wrapAround: true,
                    initialIndex: this.initialIndex,
                    pageDots: false
                });
        
                this.addEventListener("control:select", event => this.select(event.detail.index));
                this.carousel.on("change", this.onChange.bind(this));
                Shopify.designMode && this.addEventListener("shopify:block:select", event => {
                    console.log(event);
                    return this.carousel.resize()
                })
                // window.addEventListener('resize', () => {
                //     this.carousel.resize();
                //     console.log('resize');
                // });
                // const mutationObserver = new MutationObserver(() => {
                //     this.carousel.resize();
                //     console.log('mutationObserver');
                // });
                // mutationObserver.observe(this, { childList: true, subtree: true });
                setTimeout(() => {
                    this.select(this.initialIndex, true);
                }, 100);
            }
        }

        disconnectedCallback() {
            this.carousel&&this.carousel.destroy()
        }
        select(index=0,immediate=!1) {
            if(!immediate) {
                const {
                    selectedIndex,slides
                }
                =this.carousel;
                immediate=Math.abs(index-selectedIndex)>3,index===0&&selectedIndex===slides.length-1&&(immediate=!1),index===slides.length-1&&selectedIndex===0&&(immediate=!1)
            }
            this.carousel.select(index,!1,immediate)
        }
        onChange(index) {
            this.dispatchEvent(new CustomEvent("carousel:change", {
                bubbles:!0,detail: {
                    index
                }
            }))
        }
    }
    customElements.define("announcement-bar",AnnouncementBar);


    if (!customElements.get("items-carousel")) {
        customElements.define("items-carousel", class extends HTMLElement {
            constructor() {
                super();
            }
            // connectedCallback() {
            //     this.theCarousel = this.querySelector('.items-carousel-selector')
            //     this.initialize();
            // }
            connectedCallback() {
                this.theCarousel = this.querySelector('.items-carousel-selector');
                const flickityData = this.theCarousel.getAttribute("data-flickity");
                const flickityOptions = flickityData ? JSON.parse(flickityData) : {};
                this.initialize(flickityOptions);
            }
            reHap(){
                if (this.flickity.selectedElements.length >= this.flickity.cells.length) {
                    this.flickity.options.draggable = false;
                    this.flickity.updateDraggable();
                } else {
                    this.flickity.options.draggable = true;
                    this.flickity.updateDraggable();
                }
                this.flickity.resize();
            }
            initialize(options) {
                const defaultOptions = {
                    cellAlign: "left",
                    groupCells: true,
                    contain: !0,
                    resize: !0,
                    draggable: !0,
                    fade: !1,
                    cellSelector: ".items-carousel-items",
                    initialIndex: 0,
                    pageDots: !1,
                    freeScroll: !1,
                    wrapAround: !0,
                    prevNextButtons: !0,
                    accessibility: !1,
                    watchCSS: !0
                }; 
                const mergedOptions = { ...defaultOptions, ...options };
                
                this.flickity = new Flickity(this.theCarousel, mergedOptions);
                
                this.theCarousel.style.display = "block";
     
                // this.theCarousel.style.display = "block";
    
                // this.flickity = new Flickity(this.theCarousel, {
                //     cellAlign: "left",
                //     groupCells: true,
                //     contain: !0,
                //     resize: !0,
                //     draggable: !0,
                //     fade: !1,
                //     cellSelector: ".items-carousel-items",
                //     initialIndex: 0,
                //     pageDots: !1,
                //     freeScroll: !0,
                //     wrapAround: !0,
                //     prevNextButtons: !0,
                //     accessibility: !1,
                //     watchCSS: !0
                // });
    
                // slider height equal
                Flickity.prototype._createResizeClass = function() {
                    this.element.classList.add('flickity-resize');
                  };
                  
                  Flickity.createMethods.push('_createResizeClass');
                  
                  var resize = Flickity.prototype.resize;
                  Flickity.prototype.resize = function() {
                    this.element.classList.remove('flickity-resize');
                    resize.call( this );
                    this.element.classList.add('flickity-resize');
                  };
                  
                window.addEventListener('resize', () => {
                    this.reHap()
                }); 
                setTimeout(() => {
                    this.reHap()
                }, 500);
    
                Shopify.designMode && this.addEventListener("shopify:block:select", event => {
                    this.flickity.stopPlayer()
                    this.flickity.pausePlayer()
                    const slideIndex = [...event.target.parentElement.childNodes].indexOf(event.target)
                    setTimeout(() => {
                        this.flickity.select(slideIndex, true)
                    }, 200);
                    return
                })
                Shopify.designMode && this.addEventListener("shopify:block:deselect", event => {
                    console.log('shopify:block:deselect');
                    this.flickity.playPlayer()
                })
                this.flickity.on("change", index => {
                    const event = new CustomEvent("slider:slide-change", {
                        detail: {
                            id: this.getAttribute("id"),
                            index
                        }
                    })
                    document.dispatchEvent(event)
                });
            }
        })
    }
    




if (!customElements.get("renders-sub-popup")) {
    customElements.define("renders-sub-popup", class extends HTMLElement {
        constructor() {
            super();
            this.cBtn = this.querySelector('[data-close="close-btn"]')
            this.testMode = this.getAttribute('mode')
            this.delay = parseInt(this.getAttribute('delay'))
            this.expiry = parseInt(this.getAttribute('expiry'))
            this.cookieName = 'pesto:newsletter-popup'
            this.cBtn.addEventListener('click', this.afterHide.bind(this));
   
        }
        connectedCallback() {
            this.init()
        }
        init(){
            Shopify.designMode ? this.testMode == 'true' && this.load(0) : !this.getCookie(this.cookieName) && this.load(this.delay)
        }
        load(delay) {
            setTimeout(() => this.show(), delay * 1000);
        }
        show(){
            this.classList.add("active");
            setTimeout(() => this.afterShow(), 500);
        }
        getCookie(name) {
            const match = document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`);
            return match ? match[2] : null;
        }
        setCookie(name, expiry) {
            document.cookie = `${name}=true; max-age=${expiry * 24 * 60 * 60}; path=/`;
        }
        removeCookie(name) {
            document.cookie = `${name}=; max-age=0`;
        }
        afterShow() {
            this.classList.add("image-show");
        }
        afterHide() {
            this.classList.remove("image-show");
            setTimeout(() => this.classList.remove("active"), 1000);
            
            if (this.testMode == 'true' ) {
            
                this.removeCookie(this.cookieName);
                return;
            }

            this.setCookie(this.cookieName, this.expiry);
        }
    })
}


class LaTab extends HTMLElement {
    constructor() {
        super();
        this.tabHeaders = this.querySelectorAll('.la-tab-heading-item');
        this.tabContents = this.querySelectorAll('.la-tab-content-single');



        this.currentTabIndex = 0;

        
        this.clickTabFun = this.clickTab.bind(this);
        this.addEventListener('click', this.clickTabFun);
        
        
        this.init();
        // this.startAutoPlay();
    }
    init(){
        // console.log('init');
    }
    clickTab(event){
        this.target = event.target;
        this.tabHead =  this.target.classList.contains('la-tab-heading-item')

        if(this.tabHead){
            const tabIndex = Array.from(this.tabHeaders).indexOf(this.target);
            if (tabIndex !== -1) {
                this.tabHide(tabIndex); 
            }
        }
    }
    tabHide(target){
        this.tabRemoved()
        this.tabHeaders[target].classList.add('active');
        this.tabContents[target].classList.add('active');
    }
    tabRemoved(){
        this.tabHeaders.forEach((header, index) => {
            header.classList.remove('active');
            this.tabContents[index].classList.remove('active');
        });
    }
}
customElements.define('la-tab', LaTab);


