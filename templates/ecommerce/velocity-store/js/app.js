'use strict';

/* =========================================================
   VELOCITY STORE
   MAIN APPLICATION
========================================================= */

(function () {

    const App = {

        initialized: false,

        init() {

            if (this.initialized) return;

            this.initialized = true;

            this.renderProducts();

            this.bindEvents();

            this.updateYear();

            document.dispatchEvent(
                new CustomEvent('velocity:app-ready')
            );
        },


        /* =====================================================
           PRODUCTS
        ===================================================== */

        renderProducts() {

            if (
                !window.VelocityProducts ||
                typeof window.VelocityProducts.renderProducts !== 'function'
            ) {
                console.warn(
                    '[Velocity Store] Products module not ready.'
                );

                return;
            }

            const container =
                document.querySelector(
                    '#products-grid'
                );

            if (!container) return;

            VelocityProducts.renderProducts(
                container,
                VelocityProducts.getFeaturedProducts()
            );
        },


        /* =====================================================
           EVENTS
        ===================================================== */

        bindEvents() {

            document.addEventListener(
                'click',
                event => {

                    const menuButton =
                        event.target.closest(
                            '[data-mobile-menu]'
                        );

                    if (menuButton) {

                        this.toggleMobileMenu();

                        return;
                    }


                    const scrollButton =
                        event.target.closest(
                            '[data-scroll-to]'
                        );

                    if (scrollButton) {

                        const target =
                            scrollButton.dataset.scrollTo;

                        this.scrollTo(target);

                        return;
                    }


                    const quickView =
                        event.target.closest(
                            '[data-product-id]'
                        );

                    if (
                        quickView &&
                        quickView.classList.contains(
                            'quick-view-button'
                        )
                    ) {

                        this.openQuickView(
                            quickView.dataset.productId
                        );

                    }

                }
            );


            /* =================================================
               ESC KEY
            ================================================= */

            document.addEventListener(
                'keydown',
                event => {

                    if (event.key !== 'Escape') return;

                    this.closeMobileMenu();

                    if (
                        window.VelocityCart &&
                        typeof window.VelocityCart.close === 'function'
                    ) {
                        window.VelocityCart.close();
                    }

                }
            );

        },


        /* =====================================================
           MOBILE MENU
        ===================================================== */

        toggleMobileMenu() {

            document.body.classList.toggle(
                'mobile-menu-open'
            );

        },


        closeMobileMenu() {

            document.body.classList.remove(
                'mobile-menu-open'
            );

        },


        /* =====================================================
           SCROLL
        ===================================================== */

        scrollTo(selector) {

            if (!selector) return;

            const element =
                document.querySelector(selector);

            if (!element) return;

            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

        },


        /* =====================================================
           QUICK VIEW
        ===================================================== */

        openQuickView(productId) {

            if (!window.VelocityProducts) return;

            const product =
                VelocityProducts.getProductById(
                    productId
                );

            if (!product) return;

            let modal =
                document.querySelector(
                    '#quick-view-modal'
                );

            if (!modal) {

                modal =
                    document.createElement('div');

                modal.id =
                    'quick-view-modal';

                modal.className =
                    'quick-view-modal';

                document.body.appendChild(modal);

            }

            modal.innerHTML = `

                <div class="quick-view-backdrop"
                     data-close-quick-view>
                </div>

                <div class="quick-view-content">

                    <button
                        class="quick-view-close"
                        type="button"
                        data-close-quick-view
                        aria-label="إغلاق"
                    >
                        ×
                    </button>

                    <div class="quick-view-grid">

                        <div class="quick-view-image">

                            <img
                                src="${product.image}"
                                alt="${product.name}"
                            />

                        </div>

                        <div class="quick-view-info">

                            <span class="product-category">
                                ${product.categoryName}
                            </span>

                            <h2>
                                ${product.name}
                            </h2>

                            <div class="product-rating">

                                <div class="stars">
                                    ${VelocityProducts.renderStars(
                                        product.rating
                                    )}
                                </div>

                                <span>
                                    ${product.rating}
                                </span>

                            </div>

                            <div class="quick-view-price">

                                ${VelocityProducts.formatPrice(
                                    product.price,
                                    product.currency
                                )}

                            </div>

                            <p>
                                منتج مميز من مجموعة
                                Velocity Store.
                                تصميم عصري وجودة عالية
                                للاستخدام اليومي.
                            </p>

                            <button
                                class="btn btn-primary"
                                type="button"
                                data-quick-add="${product.id}"
                            >
                                أضف للسلة
                            </button>

                        </div>

                    </div>

                </div>
            `;

            requestAnimationFrame(() => {

                modal.classList.add('active');

            });


            modal.addEventListener(
                'click',
                event => {

                    if (
                        event.target.closest(
                            '[data-close-quick-view]'
                        )
                    ) {

                        this.closeQuickView(modal);

                        return;
                    }


                    const addButton =
                        event.target.closest(
                            '[data-quick-add]'
                        );

                    if (addButton) {

                        if (
                            window.VelocityCart &&
                            typeof window.VelocityCart.add === 'function'
                        ) {

                            VelocityCart.add(
                                addButton.dataset.quickAdd
                            );

                            this.closeQuickView(modal);
                        }

                    }

                }
            );

        },


        closeQuickView(modal) {

            if (!modal) return;

            modal.classList.remove('active');

            setTimeout(() => {

                modal.remove();

            }, 250);

        },


        /* =====================================================
           FOOTER YEAR
        ===================================================== */

        updateYear() {

            const year =
                document.querySelector(
                    '[data-current-year]'
                );

            if (year) {

                year.textContent =
                    new Date().getFullYear();

            }

        }

    };


    /*
    =========================================================
    DOM READY
    =========================================================
    */

    if (document.readyState === 'loading') {

        document.addEventListener(
            'DOMContentLoaded',
            () => App.init()
        );

    } else {

        App.init();

    }


    /*
    =========================================================
    GLOBAL
    =========================================================
    */

    window.VelocityApp = App;

})();
