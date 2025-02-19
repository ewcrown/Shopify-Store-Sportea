if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.querySelector('[name=id]').disabled = false;
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cartInfo = document.querySelector('cart-notification') || document.querySelector('cart-drawer')

      this.submitButton = this.querySelector('[type="submit"]');
   
    }
    onSubmitHandler(evt) {
      evt.preventDefault();
  
      if (this.submitButton.classList.contains('loading')) return;

      this.handleErrorMessage();

      this.submitButton.setAttribute('aria-disabled', true);
      this.submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];

      const formData = new FormData(this.form);

      if (this.cartInfo) {
        
        formData.append('sections', this.cartInfo.getSectionsToRender().map((section) => section.id) );
        formData.append('sections_url', window.location.pathname);


        this.productInit = document.querySelector('.data-m-x-rif')
        if( this.productInit != null ){
          
          setTimeout(() => {
            this.productInit.classList.add('active-popup-animate')
          }, 300);
          setTimeout(() => {
            this.productInit.classList.remove('active-popup')
            this.productInit.classList.remove('active-popup-animate')
            this.productInit.innerHTML = ''
            this.cartInfo.setActiveElement(document.activeElement);
          }, 500);
          
        }else{
          this.cartInfo.setActiveElement(document.activeElement);
        }


        
        // console.log(window.location.pathname);
        // console.log(this.cartInfo.getSectionsToRender().map((section) => section.id) );

      }
      config.body = formData;

      const productId = this.form.querySelector('input[name="id"]').value
      
      
      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);

            this.error = true;
            
            return;
          } else if (!this.cartInfo) {
            this.closest('.data-info-product') != null ? this.closest('.data-info-product').removeAttribute('aria-disabled') : ''
            this.closest('.data-m-x-rif') != null ? this.closest('.data-m-x-rif').innerHTML = '' : null
            
            window.location = window.routes.cart_url;
            return;
          }
          this.cartInfo.renderContents(response, productId);
          // this.cartInfo.open();
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
        
      
          this.submitButton.classList.remove('loading');
          if (this.cartInfo && this.cartInfo.classList.contains('is-empty')) this.cartInfo.classList.remove('is-empty');
          if (!this.error) this.submitButton.removeAttribute('aria-disabled');
          this.querySelector('.loading-overlay__spinner').classList.add('hidden');

        });

    }

    handleErrorMessage(errorMessage = false) {
   
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {

        if(errorMessage.email){
          this.errorMessage.textContent = errorMessage.email[0];
        }else{
          this.errorMessage.textContent = errorMessage;
        }
        this.errorMessageWrapper.classList.add('active')
      }
    }
  });
}

if (!customElements.get('close-form-x')) {
  customElements.define('close-form-x', class ProductForm extends HTMLElement {
    constructor() {
      super();
      this.addEventListener('click', this.closeXi.bind(this))
      this.thisBtn = this.closest('.data-m-x-rif')
    }
    closeXi(e){

           
      setTimeout(() => {
        this.thisBtn.classList.add('active-popup-animate')
      }, 200);
      setTimeout(() => {
        this.thisBtn.classList.remove('active-popup')
        this.thisBtn.classList.remove('active-popup-animate')
        this.thisBtn.innerHTML = ''
      }, 400);


    }
  })
}

