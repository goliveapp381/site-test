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
   - Wishlist
   - Cart
   - Global UI events
   - Image fallback support
   - Page loader protection
   - Dynamic product rendering support
========================================================= */

(function () {

    const App = {

        initialized: false,
        eventsBound: false,


        /* =====================================================
           INIT
        ===================================================== */

        init() {

            if (this.initialized) {
                return;
            }

            this.initialized = true;

            try {

                this.initializeModules();

                this.bindEvents();

                this.setupImageFallbacks();

                this.updateYear();

            } catch (error) {

                console.error(
                    '[Velocity Store] Application initialization error:',
                    error
                );

            } finally {

                /*
                 * مهم:
                 * مهما وقع شي error، loader خاصو يختفي.
                 */

                this.hidePageLoader();

            }


            document.dispatchEvent(
                new CustomEvent(
                    'velocity:app-ready'
                )
            );

        },


        /* =====================================================
           PAGE LOADER
        ===================================================== */

        hidePageLoader() {

            const loader =
                document.querySelector(
                    '#pageLoader'
                );


            if (!loader) {
                return;
            }


            loader.classList.add(
                'loaded'
            );

            loader.classList.add(
                'hidden'
            );


            loader.setAttribute(
                'aria-hidden',
                'true'
            );


            document.body.classList.remove(
                'loading'
            );

            document.body.classList.remove(
                'page-loading'
            );


            setTimeout(
                () => {

                    if (!loader) {
                        return;
                    }

                    loader.style.opacity =
                        '0';

                    loader.style.visibility =
                        'hidden';

                    loader.style.pointerEvents =
                        'none';

                },
                350
            );


            setTimeout(
                () => {

                    if (
                        loader &&
                        loader.parentNode
                    ) {

                        loader.remove();

                    }

                },
                900
            );

        },


        /* =====================================================
           MODULE INITIALIZATION
        ===================================================== */

        initializeModules() {

            /*
             * Filters هو المسؤول الرئيسي
             * على rendering ديال products.
             */

            if (
                window.VelocityFilters &&
                typeof window.VelocityFilters.apply ===
                'function'
            ) {

                window.VelocityFilters.apply();

            } else {

                this.renderProducts();

            }


            /*
             * CART
             */

            if (
                window.VelocityCart &&
                typeof window.VelocityCart.init ===
                'function'
            ) {

                window.VelocityCart.init();

            }


            /*
             * WISHLIST
             */

            if (
                window.VelocityWishlist &&
                typeof window.VelocityWishlist.init ===
                'function'
            ) {

                window.VelocityWishlist.init();

            }

        },


        /* =====================================================
           PRODUCTS FALLBACK RENDER
        ===================================================== */

        renderProducts() {

            if (
                !window.VelocityProducts ||
                typeof window.VelocityProducts.renderProducts !==
                'function'
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


            let products = [];


            if (
                typeof window.VelocityProducts.getProducts ===
                'function'
            ) {

                products =
                    window.VelocityProducts.getProducts();

            }


            window.VelocityProducts.renderProducts(
                container,
                products
            );


            this.setupImageFallbacks();

        },


        /* =====================================================
           EVENTS
        ===================================================== */

        bindEvents() {

            if (this.eventsBound) {
                return;
            }

            this.eventsBound = true;


            /* =================================================
               GLOBAL CLICK
            ================================================= */

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
                       MOBILE MENU LINK
                    ========================================= */

                    const mobileLink =
                        event.target.closest(
                            '#mobileMenu a[href^="#"], .mobile-menu a[href^="#"]'
                        );


                    if (mobileLink) {

                        this.closeMobileMenu();

                    }


                    /* =========================================
                       SCROLL LINKS
                    ========================================= */

                    const scrollButton =
                        event.target.closest(
                            '[data-scroll-to]'
                        );


                    if (scrollButton) {

                        event.preventDefault();

                        this.scrollTo(
                            scrollButton.dataset.scrollTo
                        );

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
                       SEARCH SUBMIT
                    ========================================= */

                    const searchSubmit =
                        event.target.closest(
                            '#searchSubmit'
                        );


                    if (searchSubmit) {

                        event.preventDefault();

                        this.performSearch();

                        return;

                    }


                    /* =========================================
                       CATEGORY FILTER
                    ========================================= */

                    const categoryButton =
                        event.target.closest(
                            '[data-category-filter]'
                        );


                    if (categoryButton) {

                        event.preventDefault();


                        const category =
                            categoryButton.dataset.categoryFilter ||
                            'all';


                        if (
                            window.VelocityFilters &&
                            typeof window.VelocityFilters.setCategory ===
                            'function'
                        ) {

                            window.VelocityFilters.setCategory(
                                category
                            );

                        } else {

                            this.fallbackCategoryFilter(
                                category
                            );

                        }


                        /*
                         * إلا كانت category card،
                         * نمشيو مباشرة للمنتجات.
                         */

                        if (
                            categoryButton.classList.contains(
                                'category-card'
                            )
                        ) {

                            this.scrollTo(
                                '#products'
                            );

                        }


                        return;

                    }


                    /* =========================================
                       FILTER RESET
                    ========================================= */

                    const resetButton =
                        event.target.closest(
                            '[data-filter-reset]'
                        );


                    if (resetButton) {

                        event.preventDefault();


                        if (
                            window.VelocityFilters &&
                            typeof window.VelocityFilters.reset ===
                            'function'
                        ) {

                            window.VelocityFilters.reset();

                        }


                        return;

                    }


                    /* =========================================
                       CART OPEN
                    ========================================= */

                    const cartOpen =
                        event.target.closest(
                            '[data-cart-open]'
                        );


                    if (cartOpen) {

                        event.preventDefault();


                        if (
                            window.VelocityCart &&
                            typeof window.VelocityCart.open ===
                            'function'
                        ) {

                            window.VelocityCart.open();

                        }


                        return;

                    }


                    /* =========================================
                       WISHLIST OPEN
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
                       SEARCH RESULT
                    ========================================= */

                    const searchResult =
                        event.target.closest(
                            '[data-search-product-id]'
                        );


                    if (searchResult) {

                        event.preventDefault();


                        const productId =
                            searchResult.dataset.searchProductId;


                        this.closeSearch();

                        this.openQuickView(
                            productId
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

                        event.preventDefault();


                        this.closeQuickView(
                            document.querySelector(
                                '#quick-view-modal'
                            )
                        );


                        return;

                    }


                    /* =========================================
                       QUICK VIEW ADD TO CART
                    ========================================= */

                    const quickAdd =
                        event.target.closest(
                            '[data-quick-add]'
                        );


                    if (quickAdd) {

                        event.preventDefault();


                        const productId =
                            quickAdd.dataset.quickAdd;


                        if (
                            window.VelocityCart &&
                            typeof window.VelocityCart.add ===
                            'function'
                        ) {

                            window.VelocityCart.add(
                                productId
                            );

                        }


                        this.closeQuickView(
                            document.querySelector(
                                '#quick-view-modal'
                            )
                        );


                        return;

                    }

                }
            );


            /* =================================================
               INPUT EVENTS
            ================================================= */

            document.addEventListener(
                'input',
                event => {

                    const input =
                        event.target.closest(
                            '[data-product-search]'
                        );


                    if (!input) {
                        return;
                    }


                    const value =
                        input.value.trim();


                    /*
                     * Synchronize search inputs.
                     */

                    document
                        .querySelectorAll(
                            '[data-product-search]'
                        )
                        .forEach(
                            other => {

                                if (
                                    other !== input &&
                                    other.value !== value
                                ) {

                                    other.value =
                                        value;

                                }

                            }
                        );


                    /*
                     * Search overlay results.
                     */

                    if (
                        input.id === 'searchInput'
                    ) {

                        this.renderSearchResults(
                            value
                        );

                    }


                    /*
                     * Products filter.
                     */

                    if (
                        window.VelocityFilters &&
                        typeof window.VelocityFilters.setSearch ===
                        'function'
                    ) {

                        window.VelocityFilters.setSearch(
                            value
                        );

                    }

                }
            );


            /* =================================================
               SORT
            ================================================= */

            document.addEventListener(
                'change',
                event => {

                    const sort =
                        event.target.closest(
                            '[data-product-sort]'
                        );


                    if (!sort) {
                        return;
                    }


                    if (
                        window.VelocityFilters &&
                        typeof window.VelocityFilters.setSort ===
                        'function'
                    ) {

                        window.VelocityFilters.setSort(
                            sort.value
                        );

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


                        if (
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                                .test(email)
                        ) {

                            this.showNotification(
                                'المرجو إدخال بريد إلكتروني صحيح.',
                                'error'
                            );


                            return;

                        }


                        this.showNotification(
                            'تم تسجيل بريدك الإلكتروني بنجاح.',
                            'success'
                        );


                        newsletterForm.reset();

                    }
                );

            }


            /* =================================================
               RESIZE
            ================================================= */

            window.addEventListener(
                'resize',
                () => {

                    if (
                        window.innerWidth > 900
                    ) {

                        this.closeMobileMenu();

                    }

                }
            );


            /* =================================================
               ESCAPE KEY
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


                    this.closeQuickView(
                        document.querySelector(
                            '#quick-view-modal'
                        )
                    );


                    if (
                        window.VelocityCart &&
                        typeof window.VelocityCart.close ===
                        'function'
                    ) {

                        window.VelocityCart.close();

                    }

                }
            );


            /* =================================================
               PRODUCTS RENDERED
            ================================================= */

            document.addEventListener(
                'velocity:products-rendered',
                () => {

                    /*
                     * إعادة تفعيل image fallback
                     * بعد كل render.
                     */

                    this.setupImageFallbacks();


                    /*
                     * إعادة تشغيل animations
                     * للـ products الجديدة.
                     */

                    if (
                        window.VelocityAnimations &&
                        typeof window.VelocityAnimations.refresh ===
                        'function'
                    ) {

                        window.VelocityAnimations.refresh();

                    }

                }
            );


            /* =================================================
               WISHLIST CHANGED
            ================================================= */

            document.addEventListener(
                'velocity:wishlist-changed',
                () => {

                    if (
                        window.VelocityWishlist &&
                        typeof window.VelocityWishlist.updateUI ===
                        'function'
                    ) {

                        window.VelocityWishlist.updateUI();

                    }

                }
            );


            /* =================================================
               CART CHANGED
            ================================================= */

            document.addEventListener(
                'velocity:cart-changed',
                () => {

                    this.setupImageFallbacks();

                }
            );

        },


        /* =====================================================
           SEARCH OPEN
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
                    '#searchInput, input'
                );


            if (input) {

                setTimeout(
                    () => {

                        input.focus();

                        input.select();

                    },
                    100
                );

            }


            this.renderSearchResults(
                input
                    ? input.value.trim()
                    : ''
            );

        },


        /* =====================================================
           SEARCH CLOSE
        ===================================================== */

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
           PERFORM SEARCH
        ===================================================== */

        performSearch() {

            const input =
                document.querySelector(
                    '#searchInput'
                );


            const value =
                input
                    ? input.value.trim()
                    : '';


            if (
                window.VelocityFilters &&
                typeof window.VelocityFilters.setSearch ===
                'function'
            ) {

                window.VelocityFilters.setSearch(
                    value
                );

            }


            this.closeSearch();


            this.scrollTo(
                '#products'
            );

        },


        /* =====================================================
           SEARCH RESULTS
        ===================================================== */

        renderSearchResults(query) {

            const container =
                document.querySelector(
                    '#searchResults'
                );


            if (!container) {
                return;
            }


            const value =
                String(
                    query || ''
                ).trim();


            if (!value) {

                container.innerHTML = `
                    <div class="search-results-empty">
                        <span>⌕</span>
                        <p>
                            Search for products, shoes,
                            fashion or tech.
                        </p>
                    </div>
                `;

                return;

            }


            if (
                !window.VelocityProducts ||
                typeof window.VelocityProducts.searchProducts !==
                'function'
            ) {

                return;

            }


            const results =
                window.VelocityProducts
                    .searchProducts(value)
                    .slice(0, 6);


            if (!results.length) {

                container.innerHTML = `
                    <div class="search-results-empty">
                        <span>×</span>
                        <p>
                            No products found.
                        </p>
                    </div>
                `;

                return;

            }


            container.innerHTML =
                results
                    .map(
                        product => {

                            const image =
                                this.getProductImage(
                                    product
                                );


                            const fallback =
                                this.getFallbackImage();


                            const name =
                                this.escapeHTML(
                                    product.name
                                );


                            const category =
                                this.escapeHTML(
                                    product.categoryName ||
                                    product.category ||
                                    ''
                                );


                            const price =
                                window.VelocityProducts &&
                                typeof window.VelocityProducts.formatPrice ===
                                'function'

                                    ? window.VelocityProducts.formatPrice(
                                        product.price,
                                        product.currency
                                    )

                                    : `${product.price} DH`;


                            return `
                                <button
                                    type="button"
                                    class="search-result-item"
                                    data-search-product-id="${this.escapeAttribute(product.id)}"
                                >

                                    <span class="search-result-image">

                                        <img
                                            src="${this.escapeAttribute(image)}"
                                            alt="${this.escapeAttribute(product.name)}"
                                            data-fallback="${this.escapeAttribute(fallback)}"
                                        >

                                    </span>

                                    <span class="search-result-info">

                                        <strong>
                                            ${name}
                                        </strong>

                                        <small>
                                            ${category}
                                        </small>

                                        <b>
                                            ${price}
                                        </b>

                                    </span>

                                </button>
                            `;

                        }
                    )
                    .join('');


            this.attachImageFallbacks(
                container
            );

        },


        /* =====================================================
           WISHLIST
        ===================================================== */

        openWishlist() {

            if (
                window.VelocityWishlist &&
                typeof window.VelocityWishlist.getProducts ===
                'function'
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


                return;

            }


            this.showNotification(
                'قائمة المفضلة غير متاحة حالياً.',
                'error'
            );

        },


        /* =====================================================
           MOBILE MENU
        ===================================================== */

        toggleMobileMenu() {

            const open =
                document.body.classList.toggle(
                    'mobile-menu-open'
                );


            const button =
                document.querySelector(
                    '[data-mobile-menu]'
                );


            if (button) {

                button.setAttribute(
                    'aria-expanded',
                    String(open)
                );

            }


            const menu =
                document.querySelector(
                    '#mobileMenu'
                );


            if (menu) {

                menu.setAttribute(
                    'aria-hidden',
                    String(!open)
                );

            }

        },


        closeMobileMenu() {

            document.body.classList.remove(
                'mobile-menu-open'
            );


            const button =
                document.querySelector(
                    '[data-mobile-menu]'
                );


            if (button) {

                button.setAttribute(
                    'aria-expanded',
                    'false'
                );

            }


            const menu =
                document.querySelector(
                    '#mobileMenu'
                );


            if (menu) {

                menu.setAttribute(
                    'aria-hidden',
                    'true'
                );

            }

        },


        /* =====================================================
           CATEGORY FALLBACK
        ===================================================== */

        fallbackCategoryFilter(category) {

            if (
                !window.VelocityProducts
            ) {
                return;
            }


            const container =
                document.querySelector(
                    '#products-grid'
                );


            if (!container) {
                return;
            }


            let products =
                window.VelocityProducts.getProducts();


            if (
                category &&
                category !== 'all'
            ) {

                products =
                    products.filter(
                        product => {

                            const productCategory =
                                String(
                                    product.category ||
                                    ''
                                )
                                    .toLowerCase()
                                    .trim();


                            return (
                                productCategory ===
                                String(
                                    category
                                )
                                    .toLowerCase()
                                    .trim()
                            );

                        }
                    );

            }


            window.VelocityProducts.renderProducts(
                container,
                products
            );


            this.scrollTo(
                '#products'
            );

        },


        /* =====================================================
           SCROLL
        ===================================================== */

        scrollTo(selector) {

            if (!selector) {
                return;
            }


            let element;


            try {

                element =
                    document.querySelector(
                        selector
                    );

            } catch (error) {

                console.warn(
                    '[Velocity Store] Invalid selector:',
                    selector
                );


                return;

            }


            if (!element) {
                return;
            }


            const header =
                document.querySelector(
                    '#mainHeader'
                );


            const headerHeight =
                header
                    ? header.offsetHeight
                    : 0;


            const rect =
                element.getBoundingClientRect();


            const targetPosition =
                window.scrollY +
                rect.top -
                headerHeight -
                20;


            window.scrollTo({

                top:
                    Math.max(
                        0,
                        targetPosition
                    ),

                behavior:
                    'smooth'

            });

        },


        /* =====================================================
           QUICK VIEW
        ===================================================== */

        openQuickView(productId) {

            if (
                !window.VelocityProducts ||
                typeof window.VelocityProducts.getProductById !==
                'function'
            ) {
                return;
            }


            const product =
                window.VelocityProducts.getProductById(
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


            const image =
                this.getProductImage(
                    product
                );


            const fallback =
                this.getFallbackImage();


            const name =
                this.escapeHTML(
                    product.name
                );


            const category =
                this.escapeHTML(
                    product.categoryName ||
                    product.category ||
                    ''
                );


            const rating =
                Number(
                    product.rating || 0
                );


            const stars =
                window.VelocityProducts &&
                typeof window.VelocityProducts.renderStars ===
                'function'

                    ? window.VelocityProducts.renderStars(
                        rating
                    )

                    : '★★★★★';


            const price =
                window.VelocityProducts &&
                typeof window.VelocityProducts.formatPrice ===
                'function'

                    ? window.VelocityProducts.formatPrice(
                        product.price,
                        product.currency
                    )

                    : `${product.price} DH`;


            modal.innerHTML = `

                <div
                    class="quick-view-backdrop"
                    data-close-quick-view
                ></div>


                <div
                    class="quick-view-content"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Product quick view"
                >

                    <button
                        class="quick-view-close"
                        type="button"
                        data-close-quick-view
                        aria-label="Close"
                    >
                        ×
                    </button>


                    <div class="quick-view-grid">


                        <div class="quick-view-image">

                            <img
                                src="${this.escapeAttribute(image)}"
                                alt="${this.escapeAttribute(product.name)}"
                                data-fallback="${this.escapeAttribute(fallback)}"
                            >

                        </div>


                        <div class="quick-view-info">

                            <span class="product-category">
                                ${category}
                            </span>


                            <h2>
                                ${name}
                            </h2>


                            <div class="product-rating">

                                <div class="stars">
                                    ${stars}
                                </div>

                                <span>
                                    ${rating.toFixed(1)}
                                </span>

                            </div>


                            <div class="quick-view-price">
                                ${price}
                            </div>


                            <p>
                                Premium product from
                                Velocity Store.
                            </p>


                            <button
                                class="btn btn-primary"
                                type="button"
                                data-quick-add="${this.escapeAttribute(product.id)}"
                            >
                                Add to cart
                            </button>

                        </div>

                    </div>

                </div>

            `;


            this.attachImageFallbacks(
                modal
            );


            requestAnimationFrame(
                () => {

                    modal.classList.add(
                        'active'
                    );

                }
            );


            document.body.classList.add(
                'quick-view-open'
            );

        },


        /* =====================================================
           CLOSE QUICK VIEW
        ===================================================== */

        closeQuickView(modal) {

            if (!modal) {
                return;
            }


            modal.classList.remove(
                'active'
            );


            document.body.classList.remove(
                'quick-view-open'
            );


            setTimeout(
                () => {

                    if (
                        modal &&
                        modal.parentNode
                    ) {

                        modal.remove();

                    }

                },
                300
            );

        },


        /* =====================================================
           PRODUCT IMAGE
        ===================================================== */

        getProductImage(product) {

            if (!product) {
                return this.getFallbackImage();
            }


            /*
             * المنتجات module هو المصدر الرئيسي
             * لحل الصورة.
             */

            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.getProductImage ===
                'function'
            ) {

                const resolved =
                    window.VelocityProducts.getProductImage(
                        product
                    );


                if (
                    typeof resolved === 'string' &&
                    resolved.trim()
                ) {

                    return resolved.trim();

                }

            }


            /*
             * Fallback candidates.
             */

            const candidates = [

                product.resolvedImage,
                product.localImage,
                product.image,
                product.webImage,
                product.imageUrl,
                product.remoteImage

            ];


            for (
                const candidate of candidates
            ) {

                if (
                    typeof candidate !== 'string'
                ) {
                    continue;
                }


                const value =
                    candidate.trim();


                if (!value) {
                    continue;
                }


                return value;

            }


            return this.getFallbackImage();

        },


        /* =====================================================
           FALLBACK IMAGE
        ===================================================== */

        getFallbackImage() {

            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.getFallbackImage ===
                'function'
            ) {

                const fallback =
                    window.VelocityProducts.getFallbackImage();


                if (fallback) {
                    return fallback;
                }

            }


            return (
                'data:image/svg+xml;charset=UTF-8,' +
                encodeURIComponent(`
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="800"
                        height="800"
                        viewBox="0 0 800 800"
                    >

                        <rect
                            width="800"
                            height="800"
                            fill="#101016"
                        />

                        <text
                            x="400"
                            y="400"
                            text-anchor="middle"
                            dominant-baseline="middle"
                            fill="#ffffff"
                            font-family="Arial"
                            font-size="54"
                        >
                            VELOCITY
                        </text>

                    </svg>
                `)
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
                        'img'
                    )
                    : [];


            images.forEach(
                image => {

                    if (
                        image.dataset.velocityFallbackBound ===
                        'true'
                    ) {

                        return;

                    }


                    image.dataset.velocityFallbackBound =
                        'true';


                    image.addEventListener(
                        'error',
                        () => {

                            /*
                             * المرحلة 1:
                             * إذا عندنا web fallback،
                             * جربوه أولاً.
                             */

                            const webFallback =
                                image.dataset.webFallback ||
                                image.dataset.webImage ||
                                image.dataset.remoteImage;


                            if (
                                webFallback &&
                                image.dataset.webFallbackUsed !==
                                'true'
                            ) {

                                image.dataset.webFallbackUsed =
                                    'true';


                                image.src =
                                    webFallback;


                                image.style.visibility =
                                    'visible';


                                return;

                            }


                            /*
                             * المرحلة 2:
                             * fallback النهائي.
                             */

                            if (
                                image.dataset.fallbackUsed ===
                                'true'
                            ) {

                                image.style.visibility =
                                    'hidden';


                                return;

                            }


                            const fallback =
                                image.dataset.fallback;


                            if (!fallback) {

                                image.style.visibility =
                                    'hidden';


                                return;

                            }


                            image.dataset.fallbackUsed =
                                'true';


                            image.src =
                                fallback;


                            image.style.visibility =
                                'visible';

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


            requestAnimationFrame(
                () => {

                    notification.classList.add(
                        'show'
                    );

                }
            );


            clearTimeout(
                notification._velocityTimer
            );


            notification._velocityTimer =
                setTimeout(
                    () => {

                        notification.classList.remove(
                            'show'
                        );

                    },
                    3000
                );

        },


        /* =====================================================
           HTML ESCAPE
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


        /* =====================================================
           ATTRIBUTE ESCAPE
        ===================================================== */

        escapeAttribute(value) {

            return this.escapeHTML(
                value
            );

        },


        /* =====================================================
           FOOTER YEAR
        ===================================================== */

        updateYear() {

            document
                .querySelectorAll(
                    '[data-current-year]'
                )
                .forEach(
                    element => {

                        element.textContent =
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
