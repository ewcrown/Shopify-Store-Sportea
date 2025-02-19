
const handleDeclineSelector = document.getElementById('decline-btn-cok')
const handleAcceptSelector = document.getElementById('accept-btn-cok')

function getBannerEl() {
  return document.getElementById('cookies-banner');
}

function hideBanner(res) {
  getBannerEl().style.display = 'none';
}

function showBanner() {
  getBannerEl().style.display = 'block';
}
if(handleAcceptSelector != null) {
  handleAcceptSelector.addEventListener('click', handleAccept)
}
function handleAccept(e) {
  localStorage.setItem('kuki', 'kuki-acc')  
  window.Shopify.customerPrivacy.setTrackingConsent(true, hideBanner);

  document.addEventListener('trackingConsentAccepted',function() {
    // console.log('trackingConsentAccepted event fired');
  });
}

if(handleDeclineSelector != null) {
  handleDeclineSelector.addEventListener('click', handleDecline)
}

function handleDecline() {
  window.Shopify.customerPrivacy.setTrackingConsent(false,hideBanner);
}

function initCookieBanner() {
  const userCanBeTracked = window.Shopify.customerPrivacy.userCanBeTracked();
  const userTrackingConsent = window.Shopify.customerPrivacy.getTrackingConsent();

  if(!userCanBeTracked && userTrackingConsent === 'no_interaction') {
    showBanner();
  }
}

window.Shopify.loadFeatures([
  {
    name: 'consent-tracking-api',
    version: '0.1',
  }
],
function(error) {
  if (error) {
    throw error;
  }

  initCookieBanner();
});

// cookies end
// banner slider
function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', 'false');

  if(summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {

  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });

  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });

  document.querySelectorAll('video').forEach((video) => video.pause());

  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
  
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {

  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.input.addEventListener('change', this.onInputChange.bind(this));

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }
  connectedCallback() {
    this.validateQtyRules();
  }
  onInputChange(event) {
    this.validateQtyRules();
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    
    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }

  validateQtyRules() {
    const value = parseInt(this.input.value);
    if (this.input.min) {
      const min = parseInt(this.input.min);
      const buttonMinus = this.querySelector(".quantity__button[name='minus']");
      buttonMinus.classList.toggle('disabled', value <= min);
    }
    if (this.input.max) {
      const max = parseInt(this.input.max);
      const buttonPlus = this.querySelector(".quantity__button[name='plus']");
      buttonPlus.classList.toggle('disabled', value >= max);
    }
  }

  
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};



Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if(isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event !== undefined) {
      this.mainDetailsToggle.classList.remove('menu-opening');
      this.mainDetailsToggle.querySelectorAll('details').forEach(details =>  {
        details.removeAttribute('open');
        details.classList.remove('menu-opening');
      });
      document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
      removeTrapFocus(elementToFocus);
      this.closeAnimation(this.mainDetailsToggle);
    }
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus();
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }
      
      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.getElementById('shopify-section-header');
    this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }
}

try {
    customElements.define('header-drawer', class extends HTMLElement {
        // Your class definition here
    });
} catch (e) {
    if (e instanceof DOMException && e.name === 'NotSupportedError') {
        console.log('header-drawer has already been defined.');
    } else {
        throw e; // Re-throw unexpected errors
    }
}

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target.nodeName === 'MODAL-DIALOG') this.hide();
      });
    }
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('.product__media-icon_area');

    if (!button) return;

    button.addEventListener('click', () => {
      console.log(button);
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[id^="Slider-"]');
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.enableSliderLooping = false;
    this.currentPageElement = this.querySelector('.slider-counter--current');
    this.pageTotalElement = this.querySelector('.slider-counter--total');
    // this.prevButton = this.querySelector('button[name="previous"]');
    // this.nextButton = this.querySelector('button[name="next"]');

    // if (!this.slider || !this.nextButton) return;

    this.initPages();
    const resizeObserver = new ResizeObserver(entries => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    // this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    // this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }

  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
    this.sliderLastItem = this.sliderItemsToShow[this.sliderItemsToShow.length - 1];
    if (this.sliderItemsToShow.length === 0) return;
    this.slidesPerPage = Math.floor(this.slider.clientWidth / this.sliderItemsToShow[0].clientWidth);
    this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1;
    this.update();
  }

  resetPages() {
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.initPages();
  }

  update() {
    const previousPage = this.currentPage;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderLastItem.clientWidth) + 1;

    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage;
      this.pageTotalElement.textContent = this.totalPages;
    }

    if (this.currentPage != previousPage) {
      this.dispatchEvent(new CustomEvent('slideChanged', { detail: {
        currentPage: this.currentPage,
        currentElement: this.sliderItemsToShow[this.currentPage - 1]
      }}));
    }

    if (this.enableSliderLooping) return;

    // if (this.isSlideVisible(this.sliderItemsToShow[0])) {
    //   this.prevButton.setAttribute('disabled', 'disabled');
    // } else {
    //   this.prevButton.removeAttribute('disabled');
    // }

    // if (this.isSlideVisible(this.sliderLastItem)) {
    //   this.nextButton.setAttribute('disabled', 'disabled');
    // } else {
    //   this.nextButton.removeAttribute('disabled');
    // }
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
    return (element.offsetLeft + element.clientWidth) <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
  }

  onButtonClick(event) {
    event.preventDefault();
    const step = event.currentTarget.dataset.step || 1;
    this.slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + (step * this.sliderLastItem.clientWidth) : this.slider.scrollLeft - (step * this.sliderLastItem.clientWidth);
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }
}

customElements.define('slider-component', SliderComponent);

class SlideshowComponent extends SliderComponent {
  constructor() {
    super();
    this.sliderControlWrapper = this.querySelector('.slider-buttons');
    this.enableSliderLooping = true;

    if (!this.sliderControlWrapper) return;

    this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide');
    if (this.sliderItemsToShow.length > 0) this.currentPage = 1;

    this.sliderControlLinksArray = Array.from(this.sliderControlWrapper.querySelectorAll('.slider-counter__link'));
    this.sliderControlLinksArray.forEach(link => link.addEventListener('click', this.linkToSlide.bind(this)));
    this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this));
    this.setSlideVisibility();

    if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
  }

  setAutoPlay() {
    this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay');
    this.autoplaySpeed = this.slider.dataset.speed * 1000;

    this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this));
    this.addEventListener('mouseover', this.focusInHandling.bind(this));
    this.addEventListener('mouseleave', this.focusOutHandling.bind(this));
    this.addEventListener('focusin', this.focusInHandling.bind(this));
    this.addEventListener('focusout', this.focusOutHandling.bind(this));

    this.play();
    this.autoplayButtonIsSetToPlay = true;
  }

  onButtonClick(event) {
    super.onButtonClick(event);
    const isFirstSlide = this.currentPage === 1;
    const isLastSlide = this.currentPage === this.sliderItemsToShow.length;

    if (!isFirstSlide && !isLastSlide) return;

    if (isFirstSlide && event.currentTarget.name === 'previous') {
      this.slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length;
    } else if (isLastSlide && event.currentTarget.name === 'next') {
      this.slideScrollPosition = 0;
    }
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }

  update() {
    super.update();
    this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
    // this.prevButton.removeAttribute('disabled');

    if (!this.sliderControlButtons.length) return;

    this.sliderControlButtons.forEach(link => {
      link.classList.remove('slider-counter__link--active');
      link.removeAttribute('aria-current');
    });
    this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active');
    this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', true);
  }

  autoPlayToggle() {
    this.togglePlayButtonState(this.autoplayButtonIsSetToPlay);
    this.autoplayButtonIsSetToPlay ? this.pause() : this.play();
    this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay;
  }

  focusOutHandling(event) {
    const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
    if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return;
    this.play();
  }

  focusInHandling(event) {
    const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
    if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
      this.play();
    } else if (this.autoplayButtonIsSetToPlay) {
      this.pause();
    }
  }

  play() {
    this.slider.setAttribute('aria-live', 'off');
    clearInterval(this.autoplay);
    this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed);
  }

  pause() {
    this.slider.setAttribute('aria-live', 'polite');
    clearInterval(this.autoplay);
  }

  togglePlayButtonState(pauseAutoplay) {
    if (pauseAutoplay) {
      this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.playSlideshow);
    } else {
      this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.pauseSlideshow);
    }
  }

  autoRotateSlides() {
    const slideScrollPosition = this.currentPage === this.sliderItems.length ? 0 : this.slider.scrollLeft + this.slider.querySelector('.slideshow__slide').clientWidth;
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }

  setSlideVisibility() {
    this.sliderItemsToShow.forEach((item, index) => {
      const button = item.querySelector('a');
      if (index === this.currentPage - 1) {
        if (button) button.removeAttribute('tabindex');
        item.setAttribute('aria-hidden', 'false');
        item.removeAttribute('tabindex');
      } else {
        if (button) button.setAttribute('tabindex', '-1');
        item.setAttribute('aria-hidden', 'true');
        item.setAttribute('tabindex', '-1');
      }
    });
  }

  linkToSlide(event) {
    event.preventDefault();
    const slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * (this.sliderControlLinksArray.indexOf(event.currentTarget) + 1 - this.currentPage);
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }
}

customElements.define('slideshow-component', SlideshowComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.removeErrorMessage();
    this.updateVariantStatuses();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
    }
  }
  
  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(
      (variant) => this.querySelector(':checked').value === variant.option1
    );
    const inputWrappers = [...this.querySelectorAll('.product-form__input')];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [...option.querySelectorAll('input[type="radio"], option')];
      const previousOptionSelected = inputWrappers[index - 1].querySelector(':checked').value;
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter((variant) => variant.available && variant[`option${index}`] === previousOptionSelected)
        .map((variantOption) => variantOption[`option${index + 1}`]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue);
    });
  }


  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGallery = document.getElementById(`MediaGallery-${this.dataset.section}`);
    if(mediaGallery != null){
      mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true);
    }
    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    if(modalContent != null) {
      const newMediaModal = modalContent.querySelector( `[data-media-id="${this.currentVariant.featured_media.id}"]`);
      modalContent.prepend(newMediaModal);
    }
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
  
  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.innerText = input.getAttribute('value');
      } else {
       
          input.innerText = window.variantStrings.unavailable_with_option.replace('[value]', input.getAttribute('value'));
      
      }
    });
  }


  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
       
        const id = `price-${this.dataset.section}`;
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(id);
        const source = html.getElementById(id);

        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);

        const infoOther =  document.querySelector('.other-categorys')
        const newinfoOther =  html.querySelector('.other-categorys')

        if(newinfoOther != null) {
          infoOther.innerHTML = newinfoOther.innerHTML
        }
        
         
        const upperBox =  document.querySelector('.product-single-right-box .upper-box')
        const newUpperBox =  html.querySelector('.product-single-right-box .upper-box')
        if(newUpperBox != null) {
          upperBox.innerHTML = newUpperBox.innerHTML
        }
        
        const description =  document.querySelector('.product-single-right-box .upper-box.sin-prd-item')
        const newDescription =  html.querySelector('.product-single-right-box .upper-box.sin-prd-item')
        if(newDescription != null) {
          description.innerHTML = newDescription.innerHTML
        }
        
      
        // const varint =  document.querySelector('.product-single-right-box .variant_picker-area')
        // const newVarint =  html.querySelector('.product-single-right-box .variant_picker-area')
        // if(newVarint != null) {
        //   varint.innerHTML = newVarint.innerHTML
        // }

        // const counter =  document.querySelector('.product-single-right-box .product-form__input')
        // const newCounter =  html.querySelector('.product-single-right-box .product-form__input')
        // if(newCounter != null) {
        //   counter.innerHTML = newCounter.innerHTML
        // }

        
        const appBlock =  document.querySelector('.product-single-right-box .main-product-appblock')
        const newAppBlock =  html.querySelector('.product-single-right-box .main-product-appblock')
        if(newAppBlock != null) {
          appBlock.innerHTML = newAppBlock.innerHTML
        }

        const oldInfoprice =  document.querySelector('.product-single-right-box .title-of-product')
        const newPrice =  html.querySelector('.product-single-right-box .title-of-product')
        if(newPrice != null) {
          oldInfoprice.innerHTML = newPrice.innerHTML
        }
        
        // const newSingleFpRight = this.offsetParent
        // if(newSingleFpRight != null) {
            
        //   const newSingleFpTitle =  html.querySelector('.pesto-single-fp-area .title-of-product')
        //   if(newSingleFpTitle != null) {
        //     newSingleFpRight.querySelector('.title-of-product').innerHTML = newSingleFpTitle.innerHTML
        //   }
        // }

      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    const sku = document.getElementById(`Sku-${this.dataset.section}`);

    if (!addButton) return;

    if (sku) sku.classList.add('visibility-hidden-sku');
    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    const inventory = document.getElementById(`Inventory-${this.dataset.section}`);
    const sku = document.getElementById(`Sku-${this.dataset.section}`);

    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
    if (inventory) inventory.classList.add('visibility-hidden');
    if (sku) sku.classList.add('visibility-hidden');
  }


  

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }

}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.classList.remove('disabled');
      } else {
        input.classList.add('disabled');
      }
    });
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);


class SearchIconArea extends HTMLElement {
  constructor(){
    super()
    this.init()
    this.addEventListener('click', (event) => {
      event.preventDefault();
      document.body.classList.add('active-search')
      document.documentElement.classList.add('active-search-html')
      let inputField = this.nextElementSibling.querySelector('.search__input')
      setTimeout(function() { 
        inputField.focus()
      }, 100)
    });
    this.addEventListener('keydown', (e)=> {
      if (e.key === 'Escape') {
          e.preventDefault();
          document.body.classList.remove('active-search')
          document.documentElement.classList.remove('active-search-html')
      }
    });
  }
  init(){

  }
}
customElements.define('search-icon-area', SearchIconArea);

class SearchPopupArea extends HTMLElement {
  constructor(){
    super()
    this.searchBtn = this.querySelector('.button-search-uns');
    this.submitBtn = this.querySelector('.search__button');
    this.closeBtn = this.querySelector('.close-the-search');
    this.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.documentElement.classList.remove('active-search-html')
        document.body.classList.remove('active-search')
        this.previousElementSibling.querySelector('.header-search-btn-click').focus()
    })
    this.addEventListener('keydown', (e)=> {
      if (e.key === 'Escape') {
          e.preventDefault();
          document.body.classList.remove('active-search')
          this.previousElementSibling.querySelector('.header-search-btn-click').focus()
      }
    });
    this.init()
  }

  init(){
    this.submitBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            this.searchBtn.focus()
        }
    });
    this.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
          e.preventDefault();
          let itemArea = this.querySelector('#predictive-search-results-list')
          if( itemArea != null ){
            let itemAreaLink = this.querySelector('#predictive-search-results-list .shop-block a')
            itemAreaLink.focus()
          }
      }
    });
  } 
}
customElements.define('search-popup-area', SearchPopupArea);

window.addEventListener('load', e => {
  const loaderRapper = document.querySelector('.loader-wrap')
  if( loaderRapper != null )
    loaderRapper.style.display = 'none';  
} )

const overlayHeader = document.querySelector('.overlay_header_area')
if( overlayHeader != null )
  document.body.classList.add('paddin-for-header')



  class FeaturePro extends HTMLElement {
    constructor() {
        super();
        this.getProduct = null
        this.onVariantChange()
        this.addEventListener('change', this.onVariantChange.bind(this))
    }
    onVariantChange() {
        const dataInfo = this.querySelector('.data-info-feature-product')
        const variant = JSON.parse(dataInfo.getAttribute('data-info'))

        
        const typeRadios = this.querySelector('.variant-radios-type')
        const typeSelects = this.querySelector('.variant-radios-selects')
       

        if(typeSelects != null) {
          const selectedValues = Array.from(this.querySelectorAll('select')).map(select => select.value);
          const selectedVariant = variant.find(variant => {
            return JSON.stringify(variant.options) === JSON.stringify(selectedValues)
          });
          if(selectedVariant != undefined){
            this.getProduct = selectedVariant.id
            this.priceUpdate(selectedVariant)
            this.imgUpdate(selectedVariant)
            this.skuUpdate(selectedVariant)
          }else{
            if(this.querySelector('.pesto-single-fp-content-sku') != null) this.querySelector('.pesto-single-fp-content-sku').classList.add('hide-item')
          }
        }

        if(typeRadios != null) {
          const radValues = Array.from(this.querySelectorAll('input[type=radio]')).filter(input => input.checked).map(input => {
            return input.value;
          });
          const selectedRadValues = variant.find(variant => {
            return JSON.stringify(variant.options) === JSON.stringify(radValues)
          });
          if(selectedRadValues != undefined){
              this.getProduct = selectedRadValues.id
              this.priceUpdate(selectedRadValues)
              this.imgUpdate(selectedRadValues)
              this.skuUpdate(selectedRadValues)
          }else{
            if(this.querySelector('.pesto-single-fp-content-sku') != null) this.querySelector('.pesto-single-fp-content-sku').classList.add('hide-item')
          }
        }
    
    }


    skuUpdate(dataPrd){
      if(dataPrd.sku != null){
        if(this.querySelector('.pesto-single-fp-content-sku') != null){
          this.querySelector('.pesto-single-fp-content-sku').classList.remove('hide-item')
          this.querySelector('.pesto-single-fp-content-sku-count').innerHTML = dataPrd.sku
        }
      }else{
        if(this.querySelector('.pesto-single-fp-content-sku') != null) this.querySelector('.pesto-single-fp-content-sku').classList.add('hide-item')
      }
    }
  
    priceUpdate(dataPrd){}
    imgUpdate(dataPrd){
      const img = this.querySelector('.pesto-single-fp-image-item img');
      if( dataPrd.featured_media != undefined){
        img.src = dataPrd.featured_media.preview_image.src
      }
    }

  }
  customElements.define('feature-pro', FeaturePro);


  /* global YT, Vimeo */
if (!customElements.get('youtube-vimio')) {
  class Video extends HTMLElement {
    constructor() {
      super();
      this.autoplay = this.dataset.autoplay;
      this.background = this.dataset.background === 'true';
      this.naturalWidth = this.dataset.naturalWidth === 'true';
    
      this.playInit = this.querySelector('.video-inner')
      this.handleResize = this.handleResize.bind(this);

      this.playInit.addEventListener('click', (e)=> {
        e.preventDefault();
        this.init();
        this.querySelector('.video-inner').classList.add('none');
 
      })
      
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.handleResize);
    }
    
    handleResize() {
        if (this.autoplay && !this.naturalWidth && this.iframe) {
        this.style.width = `${this.clientHeight * 1.7778}px`;
        }
    }

    connectedCallback() {
        // this.init();
        // window.addEventListener('resize', this.handleResize);
    }

    init() {
      const url = this.dataset.videoUrl;
      if (url) {
        if (url.includes('youtube.com')) {
          if (url.includes('v=')) {
            this.videoId = url.split('v=').pop().split('&')[0];
          } else {
            this.videoId = url.split('?')[0].split('/').pop();
          }
          
          this.type = 'youtube';
          this.initYouTube();
        } else if (url.includes('vimeo.com')) {
          this.videoId = url.split('?')[0].split('/').pop();
          this.type = 'vimeo';
          this.initVimeo();
        }
      } else {
        this.type = 'tag';
        this.initVideoTag();
      }
      // Allow for videos which haven't played to play on tap
      if (this.background) {
      //   this.closest('.video-section').addEventListener('click', this.play.bind(this));
      }
    }
    /**
     * Loads a player API script.
     * @param {string} src - Url of script to load.
     * @returns {Promise}
     */
    loadScript(src) {
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onerror = reject;
        if (this.type === 'vimeo') s.onload = resolve;
        document.body.appendChild(s);
        if (this.type === 'youtube') {
          window.onYouTubeIframeAPIReady = () => resolve(window.YT);
        }
      });
    }
    /**
     * Initialises a YouTube video.
     */
    async initYouTube() {
      if (!window.YT) await this.loadScript('//www.youtube.com/iframe_api');
      YT.ready(() => {
        
        this.player = new YT.Player(this.querySelector('div'), {
          videoId: this.videoId,
          width: '1280',
          height: '720',
          playerVars: {
            controls: 1,
            disablekb: this.background ? 1 : 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0
          },
          events: {
            onReady: this.handleYTReady.bind(this),
            onStateChange: this.handleYTStateChange.bind(this)
          }
        });
        
      });
    }
    /**
     * Initialises a Vimeo video.
     */
    async initVimeo() {
      if (!window.Vimeo) await this.loadScript('//player.vimeo.com/api/player.js');
      this.player = new Vimeo.Player(this, {
        id: this.videoId,
        width: '1280',
        height: '720',
        autoplay: this.autoplay,
        controls: true,
        title: true,
        byline: true,
        portrait: true
      });
      await this.player.ready();
      this.setupIframe('js-vimeo');
      this.player.on('pause', () => {
        if (this.inViewport) this.pausedByUser = true;
      });
      this.player.on('play', () => {
        this.closest('.video-section')?.classList.add('video-section--played');
      });
      this.play();
    }
    /**
     * Initialises a video tag.
     */
    initVideoTag() {
      this.player = this.querySelector('video');
      this.player.addEventListener('pause', () => {
        if (this.inViewport) this.pausedByUser = true;
      });
      // If the video is already playing
      if (this.player.currentTime > 0 && !this.player.paused && !this.player.ended
        && this.player.readyState > 2) {
        this.closest('.video-section')?.classList.add('video-section--played');
      } else {
        this.player.addEventListener('play', () => {
          this.closest('.video-section')?.classList.add('video-section--played');
        });
        this.addObserver(this.player);
        this.play();
      }
    }
    /**
     * Handles a YouTube ready event.
     */
    handleYTReady() {
      this.setupIframe('js-youtube');
      if (this.autoplay) this.player.mute();
      this.play();
    }
    /**
     * Handles a YouTube state change event.
     * @param {object} e - Event object.
     */
    handleYTStateChange(e) {
      if (e.data === YT.PlayerState.PAUSED) {
        if (this.inViewport) this.pausedByUser = true;
      } else if (e.data === YT.PlayerState.ENDED) {
        // Looping this way rather than 'loop' API parameter to avoid flash of black background
        if (this.background) this.player.playVideo();
      } else if (e.data === YT.PlayerState.PLAYING) {
        this.closest('.video-section')?.classList.add('video-section--played');
      }
    }
    /**
     * Sets up the injected iframe.
     * @param {string} jsClass - Class name to add to the iframe.
     */
    setupIframe(jsClass) {
      // Enable iframe to cover entire container height.
      if (this.autoplay && !this.naturalWidth) {
        this.style.width = `${this.clientHeight * 1.7778}px`;

      //   window.addEventListener('resize', window.debounce(() => {
      //     this.style.width = `${this.clientHeight * 1.7778}px`;
      //   }, 200));
      }

      this.iframe = this.querySelector('iframe');
      this.iframe.title = this.dataset.description;
      this.iframe.classList.add(jsClass);
      this.addObserver(this.iframe);
    }

    /**
     * Plays the video when scrolled into view (if not paused by the user).
     */
    play() {
      if (!this.player || this.pausedByUser) return;

      if (this.type === 'youtube') {
        this.player.playVideo();
      } else {
        this.player.play();
      }
    }

    /**
     * Pauses the video when scrolled out of view (if playing).
     */
    pause() {
      if (!this.player) return;

      if (this.type === 'youtube') {
        if (this.player.getPlayerState() !== 2) {
          this.player.pauseVideo();
          this.pausedByUser = false;
        }
      } else if (this.type === 'vimeo') {
        this.player.getPaused().then((paused) => {
          if (!paused) {
            this.player.pause();
            this.pausedByUser = false;
          }
        });
      } else if (!this.player.paused) {
        this.player.pause();
        this.pausedByUser = false;
      }
    }

    /**
     * Adds an observer to pause the video when not in the viewport.
     * @param {Element} el - Element to observe.
     */
    addObserver(el) {
      if ('IntersectionObserver' in window === false) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.inViewport = true;
            this.play();
          } else {
            this.inViewport = false;
            this.pause();
          }
        });
      });

      observer.observe(el);
    }
  }

  customElements.define('youtube-vimio', Video);
}

class mainHeader extends HTMLElement {
  constructor() {
    super()


    this.menuInner = this.querySelector('.has-mega-menu')

    this.scrollDown = this.classList.contains('scroll-down')
    this.scrollUp = this.classList.contains('scroll-up')
    
    
    this.currentScrollPosition = window.pageYOffset;
    this.lastScrollPosition =  window.pageYOffset

    this.menuInt()
    


    this.mobileMenuOpen =  this.querySelector('.mobile-menu')


    this.innerClose =  this.querySelector('.this-is-menu-hidden')
    if(this.innerClose){
      this.innerClose.addEventListener('click', this.menuClose.bind(this))
    }

    this.close =  this.querySelector('.close-btn')
    if(this.close){
      this.close.addEventListener('click', this.menuClose.bind(this))
    }

    this.menuBackdrop =  this.querySelector('.menu-backdrop')
    if(this.menuBackdrop){
      this.menuBackdrop.addEventListener('click', this.menuClose.bind(this))
    }

    this.toggleBtn =  this.querySelector('.mobile-nav-toggler')
    if(this.toggleBtn){
      this.toggleBtn.addEventListener('click', this.menuOpen.bind(this))
    }

    if(this.mobileMenuOpen){
      this.mobileMenuOpen.addEventListener('keydown', (e) => {

        if (e.key === 'Escape') {
            e.preventDefault();
            this.menuClose()
        }
      });
    }

    window.addEventListener('scroll', this.hanScr.bind(this));

  }
  disconnectedCallback() {
    // window.removeEventListener('scroll', this.hanScr.bind(this));
  }

  menuClose(){
    var htmlElement = document.querySelector('html');
    htmlElement.classList.remove('overflow-block-html');
    document.body.classList.remove('mobile-menu-visible')
    this.toggleBtn.focus()
  }
  
  menuOpen(){
    var htmlElement = document.querySelector('html');
    htmlElement.classList.add('overflow-block-html');

    document.body.classList.add('mobile-menu-visible')
    setTimeout(() => { 
      this.close.focus()
    }, 100)
  }

  menuInt(){
  
    var dropdownBtns = this.querySelectorAll('.dropdown');
    dropdownBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var dropdown = this.parentNode;
        dropdown.classList.toggle('open');
      });
    });

    var dropdownBtnsTwo = this.querySelectorAll('.dropdown-btn');
    dropdownBtnsTwo.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var dropdown = this.parentNode;
        dropdown.classList.toggle('open');
      });
    });

    var collapsibleDropdown = this.querySelectorAll('.collapsible-dropdown-prnt');
    collapsibleDropdown.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        this.closest('.collapsible-dropdown').classList.toggle('active');
      });
    });
    
    var collapsibleDropdownNext = this.querySelectorAll('.collapsible-dropdown-next');
    collapsibleDropdownNext.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        this.closest('.collapsible-dropdown').classList.toggle('active');
      });
    });
    
  }
  hanScr(){

    if(this.scrollDown){
      if (window.pageYOffset > 200) {
        this.classList.add("sticky");
      } 
      if (window.pageYOffset < 190){
        this.classList.remove("sticky");
      }
    }
    if(this.scrollUp){
        if (window.scrollY > this.lastScrollPosition) {
          this.classList.remove("sticky");
        }else{
          this.classList.add("sticky");
        }
        if(window.pageYOffset < 200) {
          this.classList.remove("sticky")
        }
        this.lastScrollPosition = window.scrollY;
    }

  }
}
try {
  customElements.define('main-header', mainHeader);
} catch (error) {
  // console.warn('Failed to define custom element main-header:', error);
}


class CountDown extends HTMLElement {
  constructor() {
      super();
      this.countdownVisibility = true;
      this.countdownTimer = this.querySelector('.countdown-timer')
      this.timerInner = this.querySelector('.countdown-timer-inner')
      this.timerVisibility = this.timerInner.dataset.timerVisibility
      

      this.countdownSection = this.querySelector('.pesto-countdown-section')
      
      this.message = this.querySelector('.timer-end-message')

      this.days = this.querySelector('.id-days')
      this.hours = this.querySelector('.id-hours')
      this.minutes = this.querySelector('.id-minutes')
      this.seconds = this.querySelector('.id-seconds')

      this.init()
  }
  init(){
      this.startTimer()
  }
  startTimer(){
    const { day, hour, min, month, year } = this.countdownTimer.dataset
    const timerTime = new Date(year, month, day, hour, min, 0).getTime();
    const timerInterval = setInterval( () => {
    const now = new Date().getTime();
    const distance = timerTime - now;
      if (distance < 0) {
        clearInterval(timerInterval)
        this.message.classList.add("active")
        // this.timerInner.classList.add("d-none")
        // this.timerVisibility === true ? this.timerInner.classList.add("inActive") : ''
        return;
      }
      this.timeTime(distance)
    }, 1000);
  }
  timeTime(distance){
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      this.days.textContent = days
      this.hours.textContent = ("0" + hours).slice(-2);
      this.minutes.textContent = ("0" + minutes).slice(-2);
      this.seconds.textContent = ("0" + seconds).slice(-2);
      this.timerInner.classList.add("active")
  }
}
customElements.define('count-down', CountDown); 


class SingleItemCollaps extends HTMLElement {
  constructor() {
    super();
    this.itemsList = this.querySelectorAll('.single-item');
    this.collapse();
  }

  collapse() {
    this.itemsList.forEach(item => {
      item.addEventListener('click', this.openClose.bind(item)); // Bind the item to maintain context
    });
  }

  openClose() {
    let openItem = this.classList.contains('open');
    let itemContent = this.querySelector('p');
    
    if (openItem) {
      this.classList.remove('open');
      itemContent.style.maxHeight = null; // Reset max-height for closing animation
    } else {
      this.classList.add('open');
      itemContent.style.maxHeight = itemContent.scrollHeight + "px"; // Set max-height for opening animation
    }
  }
}

customElements.define('single-item-collaps', SingleItemCollaps);


class QButton extends HTMLElement {
  constructor() {
    super();
    this.dataRif = document.querySelector('.data-m-x-rif')
    this.productUrl = this.dataset.product
    this.btn = this.querySelector('.qview')
    this.btn.addEventListener('click', this.onVariantChange.bind(this));
  }
  onVariantChange(){
    this.setAttribute('aria-disabled', true);
    this.classList.add('loading');

    const sectionUrl = `${this.productUrl}?view=quick-view`;
    fetch(sectionUrl)
      .then(response => response.text())
      .then(responseText => {
        const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
        this.productElement = responseHTML.querySelector('.shop-details-modal-area');
        this.setInnerHTML(this.dataRif, this.productElement.innerHTML);
        setTimeout(() => {
          this.dataRif.classList.add('active-popup')
        }, 100);
      })
      .catch(e => {
        console.error(e);
      })
      .finally(() => {
        this.classList.remove('loading');
      });
  }
  setInnerHTML(element, html) {
    element.innerHTML = html;

    element.querySelectorAll('script').forEach((oldScriptTag) => {
      const newScriptTag = document.createElement('script');
      Array.from(oldScriptTag.attributes).forEach((attribute) => {
        newScriptTag.setAttribute(attribute.name, attribute.value);
      });
      newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
      oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);

      window.Shopify && Shopify.PaymentButton && Shopify.PaymentButton.init()
    });
  }
}
customElements.define('q-button', QButton);






// Mega Menu
let dropdownLinks = document.querySelectorAll('.collapsible-dropdown-old > a');
  dropdownLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
          let parentItem = this.parentElement;
          parentItem.classList.toggle('active');
          event.preventDefault();
      });
});
   
function addHoverEffect() {
  let dropdownItems = document.querySelectorAll('.collapsible-dropdown');

  dropdownItems.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
          this.classList.add('active');
      });
      item.addEventListener('mouseleave', function () {
          this.classList.remove('active');
      });
  });
}
function addClickEffect() {
  let dropdownLinks = document.querySelectorAll('.collapsible-dropdown > a');
  dropdownLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
          let parentItem = this.parentElement;
          parentItem.classList.toggle('active');
          event.preventDefault(); 
      });
  });
}
