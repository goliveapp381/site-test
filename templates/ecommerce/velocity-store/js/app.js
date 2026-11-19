'use strict';

/* =========================================================
   VELOCITY STORE
   MAIN APPLICATION
   ---------------------------------------------------------
   - Main application controller
   - Product rendering
   - Quick View
   - Search overlay
   - Mobile menu
   - Newsletter
   - Global UI events
   - Image fallback support
========================================================= */

(function () {

    const App = {

        initialized: false,

        /* =====================================================
           INIT
        ===================================================== */

        init() {

            if (this.initialized) {
                return;
            }

            this.initialized = true;

            /*
             * لا نعتمد على App وحده في رسم المنتجات.
             * filters.js هو المسؤول على الفلترة والرسم.
             * إذا لم يكن جاهزاً، نستعمل featured products كـfallback.
             */

            this.initializeModules();

            this.bindEvents();

            this.setupImageFallbacks();

            this.updateYear();

            document.dispatchEvent(
                new CustomEvent(
                    'velocity:app-ready'
                )
            );

        },


        /* =====================================================
           MODULE INITIALIZATION
        ===================================================== */

        initializeModules() {

            /*
             * Filters module عادةً كيبدأ بوحدو.
             * هنا فقط نتأكد أنه موجود.
             */

            if (
                window.VelocityFilters &&
                typeof window.VelocityFilters.apply === 'function'
            ) {

                /*
                 * نخلي filters.js يتحكم في الرسم.
                 */

                window.VelocityFilters.apply();

                return;
            }


            /*
             * Fallback إذا filters.js غير موجود.
             */

            this.renderProducts();

        },


        /* =====================================================
           PRODUCTS FALLBACK
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

            if (!container) {
                return;
            }


            const featured =
                typeof VelocityProducts.getFeaturedProducts === 'function'
                    ? VelocityProducts.getFeaturedProducts()
                    : VelocityProducts.getProducts();


            VelocityProducts.renderProducts(
                container,
                featured
            );


            this.setupImageFallbacks();

        },


        /* =====================================================
           EVENTS
        ===================================================== */

        bindEvents() {

            /*
             * نستعمل Event Delegation
             * باش حتى العناصر اللي كتتولد من JavaScript
             * يبقاو خدامين.
             */

            document.addEventListener(
                'click',
                event => {

                    /* =========================================
                       MOBILE MENU OPEN
                    ========================================= */

                    const menuButton =
                        event.target.closest(
                            '[data-mobile-menu]'
                        );

                    if (menuButton) {

                        event.preventDefault();

                        this.toggleMobileMenu();

                        return;

                    }


                    /* =========================================
                       MOBILE MENU CLOSE
                    ========================================= */

                    const mobileClose =
                        event.target.closest(
                            '#mobileMenuClose, [data-mobile-menu-close]'
                        );

                    if (mobileClose) {

                        event.preventDefault();

                        this.closeMobileMenu();

                        return;

                    }


                    /* =========================================
                       MOBILE NAVIGATION
                    ========================================= */

                    const mobileLink =
                        event.target.closest(
                            '.mobile-menu a[href^="#"]'
                        );

                    if (mobileLink) {

                        this.closeMobileMenu();

                    }


                    /* =========================================
                       SCROLL BUTTON
                    ========================================= */

                    const scrollButton =
                        event.target.closest(
                            '[data-scroll-to]'
                        );

                    if (scrollButton) {

                        event.preventDefault();

                        const target =
                            scrollButton.dataset.scrollTo;

                        this.scrollTo(target);

                        return;

                    }


                    /* =========================================
                       SEARCH OPEN
                    ========================================= */

                    const searchOpen =
                        event.target.closest(
                            '[data-search-open]'
                        );

                    if (searchOpen) {

                        event.preventDefault();

                        this.openSearch();

                        return;

                    }


                    /* =========================================
                       SEARCH CLOSE
                    ========================================= */

                    const searchClose =
                        event.target.closest(
                            '#closeSearch, [data-search-close]'
                        );

                    if (searchClose) {

                        event.preventDefault();

                        this.closeSearch();

                        return;

                    }


                    /* =========================================
                       SEARCH BACKDROP
                    ========================================= */

                    const searchOverlay =
                        document.querySelector(
                            '#searchOverlay'
                        );

                    if (
                        searchOverlay &&
                        event.target === searchOverlay
                    ) {

                        this.closeSearch();

                        return;

                    }


                    /* =========================================
                       WISHLIST HEADER
                    ========================================= */

                    const wishlistOpen =
                        event.target.closest(
                            '[data-wishlist-open]'
                        );

                    if (wishlistOpen) {

                        event.preventDefault();

                        this.openWishlist();

                        return;

                    }


                    /* =========================================
                       QUICK VIEW
                    ========================================= */

                    const quickView =
                        event.target.closest(
                            '.quick-view-button[data-product-id]'
                        );

                    if (quickView) {

                        event.preventDefault();

                        this.openQuickView(
                            quickView.dataset.productId
                        );

                        return;

                    }


                    /* =========================================
                       QUICK VIEW CLOSE
                    ========================================= */

                    const quickViewClose =
                        event.target.closest(
                            '[data-close-quick-view]'
                        );

                    if (quickViewClose) {

                        const modal =
                            document.querySelector(
                                '#quick-view-modal'
                            );

                        this.closeQuickView(
                            modal
                        );

                        return;

                    }

                }
            );


            /* =================================================
               NEWSLETTER
            ================================================= */

            const newsletterForm =
                document.querySelector(
                    '#newsletterForm'
                );

            if (newsletterForm) {

                newsletterForm.addEventListener(
                    'submit',
                    event => {

                        event.preventDefault();

                        const input =
                            newsletterForm.querySelector(
                                'input[type="email"]'
                            );

                        const email =
                            input
                                ? input.value.trim()
                                : '';


                        if (!email) {

                            this.showNotification(
                                'المرجو إدخال البريد الإلكتروني.',
                                'error'
                            );

                            return;

                        }


                        if (
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                email
                            )
                        ) {

                            this.showNotification(
                                'المرجو إدخال بريد إلكتروني صحيح.',
                                'error'
                            );

                            return;

                        }


                        /*
                         * حالياً Demo فقط.
                         * من بعد نقدروا نربطوها بالBackend.
                         */

                        this.showNotification(
                            'تم تسجيل بريدك الإلكتروني بنجاح.',
                            'success'
                        );


                        newsletterForm.reset();

                    }
                );

            }


            /* =================================================
               ESC KEY
            ================================================= */

            document.addEventListener(
                'keydown',
                event => {

                    if (
                        event.key !== 'Escape'
                    ) {
                        return;
                    }


                    this.closeMobileMenu();

                    this.closeSearch();


                    const modal =
                        document.querySelector(
                            '#quick-view-modal'
                        );

                    if (modal) {

                        this.closeQuickView(
                            modal
                        );

                    }


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
           SEARCH
        ===================================================== */

        openSearch() {

            const overlay =
                document.querySelector(
                    '#searchOverlay'
                );

            if (!overlay) {
                return;
            }


            overlay.classList.add(
                'active'
            );

            overlay.setAttribute(
                'aria-hidden',
                'false'
            );


            document.body.classList.add(
                'search-open'
            );


            const input =
                overlay.querySelector(
                    'input'
                );

            if (input) {

                setTimeout(() => {

                    input.focus();

                }, 100);

            }

        },


        closeSearch() {

            const overlay =
                document.querySelector(
                    '#searchOverlay'
                );

            if (!overlay) {
                return;
            }


            overlay.classList.remove(
                'active'
            );

            overlay.setAttribute(
                'aria-hidden',
                'true'
            );


            document.body.classList.remove(
                'search-open'
            );

        },


        /* =====================================================
           WISHLIST
        ===================================================== */

        openWishlist() {

            /*
             * إذا كان wishlist module عنده drawer
             * نستعمله مباشرة.
             */

            if (
                window.VelocityWishlist &&
                typeof window.VelocityWishlist.open === 'function'
            ) {

                window.VelocityWishlist.open();

                return;

            }


            /*
             * إذا ما كانش drawer:
             * نعرض المنتجات الموجودة في wishlist
             * بطريقة بسيطة داخل رسالة.
             */

            if (
                window.VelocityWishlist &&
                typeof window.VelocityWishlist.getProducts === 'function'
            ) {

                const products =
                    window.VelocityWishlist.getProducts();


                if (!products.length) {

                    this.showNotification(
                        'قائمة المفضلة فارغة.',
                        'info'
                    );

                    return;

                }


                this.showNotification(
                    `لديك ${products.length} منتج في المفضلة.`,
                    'success'
                );

            }

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

            if (!selector) {
                return;
            }


            let element = null;


            try {

                element =
                    document.querySelector(
                        selector
                    );

            } catch (error) {

                console.warn(
                    '[Velocity Store] Invalid scroll selector:',
                    selector
                );

                return;

            }


            if (!element) {
                return;
            }


            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

        },


        /* =====================================================
           QUICK VIEW
        ===================================================== */

        openQuickView(productId) {

            if (
                !window.VelocityProducts
            ) {
                return;
            }


            const product =
                VelocityProducts.getProductById(
                    productId
                );


            if (!product) {
                return;
            }


            let modal =
                document.querySelector(
                    '#quick-view-modal'
                );


            if (!modal) {

                modal =
                    document.createElement(
                        'div'
                    );

                modal.id =
                    'quick-view-modal';

                modal.className =
                    'quick-view-modal';

                document.body.appendChild(
                    modal
                );

            }


            /*
             * Image system:
             * نستعمل helper إذا كان products.js
             * كيوفره.
             */

            let imageSource =
                this.getProductImage(
                    product
                );


            const fallbackImage =
                product.imageUrl ||
                product.fallbackImage ||
                '';


            const safeName =
                this.escapeHTML(
                    product.name || ''
                );


            const safeCategory =
                this.escapeHTML(
                    product.categoryName || ''
                );


            const rating =
                Number(
                    product.rating || 0
                );


            modal.innerHTML = `

                <div
                    class="quick-view-backdrop"
                    data-close-quick-view
                ></div>

                <div
                    class="quick-view-content"
                    role="dialog"
                    aria-modal="true"
                    aria-label="${safeName}"
                >

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
                                src="${this.escapeAttribute(imageSource)}"
                                alt="${this.escapeAttribute(product.name || '')}"
                                data-fallback="${this.escapeAttribute(fallbackImage)}"
                            />

                        </div>

                        <div class="quick-view-info">

                            <span class="product-category">
                                ${safeCategory}
                            </span>

                            <h2>
                                ${safeName}
                            </h2>

                            <div class="product-rating">

                                <div class="stars">

                                    ${VelocityProducts.renderStars(
                                        rating
                                    )}

                                </div>

                                <span>
                                    ${rating}
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
                                data-quick-add="${this.escapeAttribute(product.id)}"
                            >
                                أضف للسلة
                            </button>

                        </div>

                    </div>

                </div>
            `;


            this.attachImageFallbacks(
                modal
            );


            requestAnimationFrame(() => {

                modal.classList.add(
                    'active'
                );

            });


            /*
             * ما نزيدوش EventListener كل مرة
             * بلا cleanup.
             */

            if (
                modal._velocityQuickViewHandler
            ) {

                modal.removeEventListener(
                    'click',
                    modal._velocityQuickViewHandler
                );

            }


            const handler =
                event => {

                    const closeButton =
                        event.target.closest(
                            '[data-close-quick-view]'
                        );


                    if (closeButton) {

                        this.closeQuickView(
                            modal
                        );

                        return;

                    }


                    const addButton =
                        event.target.closest(
                            '[data-quick-add]'
                        );


                    if (addButton) {

                        if (
                            window.VelocityCart &&
                            typeof VelocityCart.add === 'function'
                        ) {

                            VelocityCart.add(
                                addButton.dataset.quickAdd
                            );

                            this.closeQuickView(
                                modal
                            );

                        }

                    }

                };


            modal._velocityQuickViewHandler =
                handler;


            modal.addEventListener(
                'click',
                handler
            );

        },


        /* =====================================================
           QUICK VIEW IMAGE
        ===================================================== */

        getProductImage(product) {

            if (!product) {
                return '';
            }


            /*
             * إذا products.js فيه helper خاص بالصور.
             */

            if (
                window.VelocityProducts &&
                typeof VelocityProducts.getProductImage === 'function'
            ) {

                return VelocityProducts.getProductImage(
                    product
                );

            }


            /*
             * الصورة المحلية الجديدة.
             */

            if (product.image) {

                /*
                 * إذا كانت URL كاملة
                 */

                if (
                    /^https?:\/\//i.test(
                        product.image
                    )
                ) {

                    return product.image;

                }


                /*
                 * إذا كان المسار يبدأ بـ assets/
                 */

                if (
                    product.image.startsWith(
                        'assets/'
                    )
                ) {

                    return product.image;

                }


                return `assets/images/${product.image}`;

            }


            /*
             * Web fallback.
             */

            return (
                product.imageUrl ||
                product.fallbackImage ||
                ''
            );

        },


        /* =====================================================
           IMAGE FALLBACK SYSTEM
        ===================================================== */

        setupImageFallbacks() {

            this.attachImageFallbacks(
                document
            );

        },


        attachImageFallbacks(container) {

            if (!container) {
                return;
            }


            const images =
                container.querySelectorAll
                    ? container.querySelectorAll(
                        'img[data-fallback]'
                    )
                    : [];


            images.forEach(
                image => {

                    if (
                        image.dataset.velocityFallbackBound
                    ) {
                        return;
                    }


                    image.dataset.velocityFallbackBound =
                        'true';


                    image.addEventListener(
                        'error',
                        () => {

                            const fallback =
                                image.dataset.fallback;


                            if (
                                !fallback ||
                                image.dataset.fallbackUsed === 'true'
                            ) {

                                /*
                                 * منع broken icon
                                 */

                                image.style.visibility =
                                    'hidden';

                                return;

                            }


                            image.dataset.fallbackUsed =
                                'true';


                            image.src =
                                fallback;

                        },
                        {
                            once: false
                        }
                    );

                }
            );

        },


        /* =====================================================
           NOTIFICATION
        ===================================================== */

        showNotification(
            message,
            type = 'info'
        ) {

            let notification =
                document.querySelector(
                    '#velocity-notification'
                );


            if (!notification) {

                notification =
                    document.createElement(
                        'div'
                    );

                notification.id =
                    'velocity-notification';

                notification.className =
                    'velocity-notification';

                document.body.appendChild(
                    notification
                );

            }


            notification.className =
                `velocity-notification ${type}`;


            notification.textContent =
                message;


            requestAnimationFrame(() => {

                notification.classList.add(
                    'show'
                );

            });


            clearTimeout(
                notification._velocityTimer
            );


            notification._velocityTimer =
                setTimeout(() => {

                    notification.classList.remove(
                        'show'
                    );

                }, 3000);

        },


        /* =====================================================
           HTML SAFETY
        ===================================================== */

        escapeHTML(value) {

            return String(
                value ?? ''
            )
                .replace(
                    /&/g,
                    '&amp;'
                )
                .replace(
                    /</g,
                    '&lt;'
                )
                .replace(
                    />/g,
                    '&gt;'
                )
                .replace(
                    /"/g,
                    '&quot;'
                )
                .replace(
                    /'/g,
                    '&#039;'
                );

        },


        escapeAttribute(value) {

            return this.escapeHTML(
                value
            );

        },


        /* =====================================================
           FOOTER YEAR
        ===================================================== */

        updateYear() {

            const years =
                document.querySelectorAll(
                    '[data-current-year]'
                );


            years.forEach(
                year => {

                    year.textContent =
                        new Date().getFullYear();

                }
            );

        }

    };


    /* =========================================================
       DOM READY
    ========================================================= */

    if (
        document.readyState === 'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            () => App.init(),
            {
                once: true
            }
        );

    } else {

        App.init();

    }


    /* =========================================================
       GLOBAL
    ========================================================= */

    window.VelocityApp =
        App;

})();
