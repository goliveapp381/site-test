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
   - Image fallback
   - Page loader control
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


            /*
             * ما نخليوش loader يبقى إلى الأبد.
             */

            this.hidePageLoader();


            /*
             * Modules
             */

            this.initializeModules();


            /*
             * Events
             */

            this.bindEvents();


            /*
             * Images
             */

            this.setupImageFallbacks();


            /*
             * Footer
             */

            this.updateYear();


            /*
             * App ready
             */

            document.dispatchEvent(
                new CustomEvent(
                    'velocity:app-ready'
                )
            );


            /*
             * Hide loader مرة أخرى بعد render.
             */

            requestAnimationFrame(
                () => {

                    this.hidePageLoader();

                }
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


            /*
             * أولاً نخليه visible حتى ما يبقاش
             * عنصر مخفي بطريقة غريبة.
             */

            loader.setAttribute(
                'aria-hidden',
                'true'
            );


            loader.classList.add(
                'loaded'
            );


            document.body.classList.remove(
                'loading'
            );


            /*
             * Fallback قوي حتى إذا CSS ما عندوش
             * class loaded.
             */

            setTimeout(
                () => {

                    loader.style.opacity =
                        '0';

                    loader.style.pointerEvents =
                        'none';

                },
                150
            );


            setTimeout(
                () => {

                    if (
                        loader &&
                        loader.parentNode
                    ) {

                        loader.style.display =
                            'none';

                    }

                },
                700
            );

        },


        /* =====================================================
           MODULES
        ===================================================== */

        initializeModules() {

            /*
             * filters.js هو المسؤول على products rendering.
             *
             * مهم جداً:
             * ما نعاودوش نرسمو featured products من بعد.
             */

            if (
                window.VelocityFilters &&
                typeof window.VelocityFilters.apply ===
                'function'
            ) {

                try {

                    window.VelocityFilters.apply();

                } catch (error) {

                    console.error(
                        '[Velocity Store] Filters initialization error:',
                        error
                    );


                    this.renderProducts();

                }


                return;

            }


            /*
             * Fallback إذا filters.js ما كانش.
             */

            this.renderProducts();

        },


        /* =====================================================
           FALLBACK PRODUCT RENDER
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


            let productList = [];


            if (
                typeof window.VelocityProducts.getProducts ===
                'function'
            ) {

                productList =
                    window.VelocityProducts.getProducts();

            }


            try {

                window.VelocityProducts.renderProducts(
                    container,
                    productList
                );

            } catch (error) {

                console.error(
                    '[Velocity Store] Product render error:',
                    error
                );

            }


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
                       MOBILE MENU
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
                       MOBILE CLOSE
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
                       MOBILE LINK
                    ========================================= */

                    const mobileLink =
                        event.target.closest(
                            '#mobileMenu a[href^="#"], .mobile-menu a[href^="#"]'
                        );


                    if (mobileLink) {

                        this.closeMobileMenu();

                    }


                    /* =========================================
                       SCROLL
                    ========================================= */

                    const scrollButton =
                        event.target.closest(
                            '[data-scroll-to]'
                        );


                    if (scrollButton) {

                        event.preventDefault();


                        const target =
                            scrollButton.dataset.scrollTo;


                        this.scrollTo(
                            target
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

                    const overlay =
                        document.querySelector(
                            '#searchOverlay'
                        );


                    if (
                        overlay &&
                        event.target === overlay
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
                         * إذا ضغط من category cards
                         * نهبطو للمنتجات.
                         */

                        if (
                            categoryButton.closest(
                                '#categories'
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
                       QUICK VIEW CLOSE
                    ========================================= */

                    const quickViewClose =
                        event.target.closest(
                            '[data-close-quick-view]'
                        );


                    if (quickViewClose) {

                        event.preventDefault();


                        const modal =
                            document.querySelector(
                                '#quick-view-modal'
                            );


                        this.closeQuickView(
                            modal
                        );


                        return;

                    }


                    /* =========================================
                       QUICK VIEW ADD
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

                }
            );


            /* =================================================
               SEARCH INPUT
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
                     * Sync all search inputs.
                     */

                    document
                        .querySelectorAll(
                            '[data-product-search]'
                        )
                        .forEach(
                            otherInput => {

                                if (
                                    otherInput !== input &&
                                    otherInput.value !== value
                                ) {

                                    otherInput.value =
                                        value;

                                }

                            }
                        );


                    /*
                     * Search overlay preview.
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
               ESC
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

                    this.setupImageFallbacks();


                    if (
                        window.VelocityAnimations &&
                        typeof window.VelocityAnimations.refresh ===
                        'function'
                    ) {

                        try {

                            window.VelocityAnimations.refresh();

                        } catch (error) {

                            console.warn(
                                '[Velocity Store] Animation refresh failed:',
                                error
                            );

                        }

                    } else if (
                        window.VelocityAnimations &&
                        typeof window.VelocityAnimations.init ===
                        'function'
                    ) {

                        try {

                            window.VelocityAnimations.init();

                        } catch (error) {

                            console.warn(
                                '[Velocity Store] Animation init failed:',
                                error
                            );

                        }

                    }


                    this.hidePageLoader();

                }
            );


            /* =================================================
               IMAGES READY
            ================================================= */

            document.addEventListener(
                'velocity:products-images-ready',
                () => {

                    /*
                     * إذا manifest تبدل الصور،
                     * نعيد render من filters.
                     */

                    if (
                        window.VelocityFilters &&
                        typeof window.VelocityFilters.apply ===
                        'function'
                    ) {

                        try {

                            window.VelocityFilters.apply();

                        } catch (error) {

                            console.warn(
                                '[Velocity Store] Image refresh failed:',
                                error
                            );

                        }

                    }

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
           SEARCH SUBMIT
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
                !window.VelocityProducts
            ) {

                container.innerHTML = '';

                return;

            }


            let results = [];


            if (
                typeof window.VelocityProducts.searchProducts ===
                'function'
            ) {

                results =
                    window.VelocityProducts.searchProducts(
                        value
                    );

            }


            results =
                Array.isArray(results)
                    ? results.slice(0, 6)
                    : [];


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
                    .map(product => {

                        const image =
                            this.getProductImage(
                                product
                            );


                        const name =
                            this.escapeHTML(
                                product.name ||
                                'Product'
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
                                : `${Number(
                                    product.price || 0
                                ).toFixed(2)} DH`;


                        return `
                            <button
                                type="button"
                                class="search-result-item"
                                data-search-product-id="${this.escapeAttribute(product.id)}"
                            >

                                <span class="search-result-image">

                                    <img
                                        src="${this.escapeAttribute(image)}"
                                        alt="${this.escapeAttribute(product.name || '')}"
                                        data-fallback="${this.escapeAttribute(this.getFallbackImage())}"
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

                    })
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
                typeof window.VelocityWishlist.open ===
                'function'
            ) {

                window.VelocityWishlist.open();

                return;

            }


            if (
                !window.VelocityWishlist
            ) {

                this.showNotification(
                    'قائمة المفضلة غير متاحة حالياً.',
                    'error'
                );

                return;

            }


            if (
                typeof window.VelocityWishlist.getProducts !==
                'function'
            ) {

                this.showNotification(
                    'قائمة المفضلة غير متاحة حالياً.',
                    'error'
                );

                return;

            }


            const wishlistProducts =
                window.VelocityWishlist.getProducts();


            if (!wishlistProducts.length) {

                this.showNotification(
                    'قائمة المفضلة فارغة.',
                    'info'
                );

                return;

            }


            this.showNotification(
                `لديك ${wishlistProducts.length} منتج في المفضلة.`,
                'success'
            );

        },


        /* =====================================================
           MOBILE MENU
        ===================================================== */

        toggleMobileMenu() {

            const isOpen =
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
                    String(isOpen)
                );

            }


            const menu =
                document.querySelector(
                    '#mobileMenu'
                );


            if (menu) {

                menu.setAttribute(
                    'aria-hidden',
                    String(!isOpen)
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
           FALLBACK CATEGORY
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


            let list =
                typeof window.VelocityProducts.getProducts ===
                'function'
                    ? window.VelocityProducts.getProducts()
                    : [];


            if (
                category &&
                category !== 'all'
            ) {

                list =
                    list.filter(
                        product =>
                            String(
                                product.category || ''
                            ).toLowerCase() ===
                            String(category).toLowerCase()
                    );

            }


            window.VelocityProducts.renderProducts(
                container,
                list
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


            let element = null;


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
                    product.name || ''
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
                typeof window.VelocityProducts.renderStars ===
                'function'
                    ? window.VelocityProducts.renderStars(
                        rating
                    )
                    : '★★★★★';


            const price =
                typeof window.VelocityProducts.formatPrice ===
                'function'
                    ? window.VelocityProducts.formatPrice(
                        product.price,
                        product.currency
                    )
                    : `${Number(
                        product.price || 0
                    ).toFixed(2)} DH`;


            modal.innerHTML = `

                <div
                    class="quick-view-backdrop"
                    data-close-quick-view
                ></div>


                <div
                    class="quick-view-content"
                    role="dialog"
                    aria-modal="true"
                    aria-label="${name}"
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
                                alt="${this.escapeAttribute(product.name || '')}"
                                data-fallback="${this.escapeAttribute(fallback)}"
                            />

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
                                Designed with a modern
                                aesthetic and built for
                                everyday use.
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
                250
            );

        },


        /* =====================================================
           GET PRODUCT IMAGE
        ===================================================== */

        getProductImage(product) {

            if (!product) {
                return this.getFallbackImage();
            }


            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.getProductImage ===
                'function'
            ) {

                const resolved =
                    window.VelocityProducts.getProductImage(
                        product
                    );


                if (resolved) {
                    return resolved;
                }

            }


            const candidates = [

                product.resolvedImage,

                product.localImage,

                product.image,

                product.webImage,

                product.imageUrl,

                product.remoteImage,

                product.fallbackImage

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


                if (
                    /^https?:\/\//i.test(value) ||
                    value.startsWith('data:image/') ||
                    value.startsWith('/') ||
                    value.startsWith('./') ||
                    value.startsWith('../') ||
                    value.startsWith('assets/')
                ) {

                    return value;

                }


                return `assets/images/${value}`;

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

                return window.VelocityProducts.getFallbackImage();

            }


            return `
                data:image/svg+xml;charset=UTF-8,
                <svg xmlns="http://www.w3.org/2000/svg"
                    width="800"
                    height="800"
                    viewBox="0 0 800 800">

                    <rect
                        width="800"
                        height="800"
                        fill="%23101016"
                    />

                    <text
                        x="50%"
                        y="50%"
                        dominant-baseline="middle"
                        text-anchor="middle"
                        fill="%23ffffff"
                        font-family="Arial"
                        font-size="54"
                    >
                        VELOCITY
                    </text>

                </svg>
            `.replace(
                /\s+/g,
                ' '
            );

        },


        /* =====================================================
           IMAGE FALLBACK SETUP
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

                            const fallback =
                                image.dataset.fallback;


                            if (
                                fallback &&
                                image.dataset.fallbackUsed !==
                                'true'
                            ) {

                                image.dataset.fallbackUsed =
                                    'true';


                                image.src =
                                    fallback;


                                return;

                            }


                            image.onerror =
                                null;


                            image.style.visibility =
                                'hidden';

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
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

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

    function startApp() {

        try {

            App.init();

        } catch (error) {

            /*
             * حتى إذا وقع خطأ في module آخر،
             * ما نخليوش الصفحة محبوسة فالـloader.
             */

            console.error(
                '[Velocity Store] Fatal application error:',
                error
            );


            App.hidePageLoader();

        }

    }


    if (
        document.readyState === 'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            startApp,
            {
                once: true
            }
        );

    } else {

        startApp();

    }


    /* =====================================================
       GLOBAL
    ===================================================== */

    window.VelocityApp =
        App;

})();
