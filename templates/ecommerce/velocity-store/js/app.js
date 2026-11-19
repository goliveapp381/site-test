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
   - Cinematic Add To Cart animation
   - Added To Cart premium modal
   - Global UI events
   - Smart image fallback
   - Image manifest synchronization
   - Page loader protection
   - Dynamic product rendering support

   IMAGE PRIORITY:
   1. resolvedImage
   2. localImage
   3. image-manifest.json
   4. legacy image
   5. webImage
   6. remoteImage
   7. generated fallback
========================================================= */

(function () {

    const App = {

        initialized: false,
        eventsBound: false,

        /* =====================================================
           CART CINEMATIC STATE
        ===================================================== */

        cartAnimationRunning: false,
        pendingCartProduct: null,
        cartAnimationTimer: null,
        cartModalTimer: null,


        /* =====================================================
           INIT
        ===================================================== */

        init() {

            if (this.initialized) {
                return;
            }

            this.initialized = true;

            try {

                /*
                 * Bind events first.
                 */

                this.bindEvents();


                /*
                 * Initialize modules.
                 */

                this.initializeModules();


                /*
                 * Initial image fallback scan.
                 */

                this.setupImageFallbacks();


                /*
                 * Footer year.
                 */

                this.updateYear();

            } catch (error) {

                console.error(
                    '[Velocity Store] Application initialization error:',
                    error
                );

            } finally {

                /*
                 * Loader must always disappear.
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
             * -----------------------------------------------
             * CART
             * -----------------------------------------------
             */

            if (
                window.VelocityCart &&
                typeof window.VelocityCart.init ===
                'function'
            ) {

                try {

                    window.VelocityCart.init();

                } catch (error) {

                    console.error(
                        '[Velocity Store] Cart initialization error:',
                        error
                    );

                }

            }


            /*
             * -----------------------------------------------
             * WISHLIST
             * -----------------------------------------------
             */

            if (
                window.VelocityWishlist &&
                typeof window.VelocityWishlist.init ===
                'function'
            ) {

                try {

                    window.VelocityWishlist.init();

                } catch (error) {

                    console.error(
                        '[Velocity Store] Wishlist initialization error:',
                        error
                    );

                }

            }


            /*
             * -----------------------------------------------
             * PRODUCTS / FILTERS
             * -----------------------------------------------
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
                        '[Velocity Store] Filter rendering error:',
                        error
                    );

                    this.renderProducts();

                }

            } else {

                this.renderProducts();

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


            let productList = [];


            if (
                typeof window.VelocityProducts.getProducts ===
                'function'
            ) {

                productList =
                    window.VelocityProducts.getProducts();

            }


            window.VelocityProducts.renderProducts(
                container,
                productList
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
                       ADD TO CART CINEMATIC EFFECT
                       -----------------------------------------
                       IMPORTANT:
                       We DO NOT add product here.

                       cart.js remains responsible for adding
                       the product.

                       We only start the visual experience.
                    ========================================= */

                    const addButton =
                        event.target.closest(
                            '.add-cart-button, [data-cart-id]'
                        );


                    if (
                        addButton &&
                        !addButton.closest(
                            '.quick-view-modal'
                        ) &&
                        !addButton.closest(
                            '#quick-view-modal'
                        )
                    ) {

                        this.handleAddToCartVisual(
                            addButton
                        );

                        /*
                         * Do NOT preventDefault.
                         *
                         * cart.js must receive the click.
                         */

                    }


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
                         * Category card → scroll.
                         */

                        if (
                            categoryButton.classList.contains(
                                'category-card'
                            ) ||
                            categoryButton.closest(
                                '.category-card'
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

                        } else {

                            this.renderProducts();

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


                        /*
                         * Close quick view first.
                         */

                        this.closeQuickView(
                            document.querySelector(
                                '#quick-view-modal'
                            )
                        );


                        /*
                         * Trigger cart through Cart module.
                         */

                        if (
                            window.VelocityCart &&
                            typeof window.VelocityCart.add ===
                            'function'
                        ) {

                            window.VelocityCart.add(
                                productId
                            );


                            /*
                             * Start cinematic experience
                             * using product data.
                             */

                            const fakeButton =
                                document.querySelector(
                                    `[data-cart-id="${CSS.escape(String(productId))}"]`
                                );


                            if (fakeButton) {

                                this.handleAddToCartVisual(
                                    fakeButton
                                );

                            } else {

                                const product =
                                    this.getProductById(
                                        productId
                                    );


                                this.startAddedToCartExperience(
                                    product
                                );

                            }

                        }


                        return;

                    }


                    /* =========================================
                       ADDED MODAL CLOSE
                    ========================================= */

                    const addedClose =
                        event.target.closest(
                            '[data-added-cart-close]'
                        );


                    if (addedClose) {

                        event.preventDefault();

                        this.closeAddedToCartModal();

                        return;

                    }


                    /* =========================================
                       VIEW CART FROM ADDED MODAL
                    ========================================= */

                    const addedViewCart =
                        event.target.closest(
                            '[data-added-cart-view]'
                        );


                    if (addedViewCart) {

                        event.preventDefault();

                        this.closeAddedToCartModal();


                        setTimeout(
                            () => {

                                if (
                                    window.VelocityCart &&
                                    typeof window.VelocityCart.open ===
                                    'function'
                                ) {

                                    window.VelocityCart.open();

                                }

                            },
                            220
                        );


                        return;

                    }


                    /* =========================================
                       CONTINUE SHOPPING
                    ========================================= */

                    const addedContinue =
                        event.target.closest(
                            '[data-added-cart-continue]'
                        );


                    if (addedContinue) {

                        event.preventDefault();

                        this.closeAddedToCartModal();

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
                     * Synchronize all search inputs.
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
                     * Search overlay.
                     */

                    if (
                        input.id === 'searchInput'
                    ) {

                        this.renderSearchResults(
                            value
                        );

                    }


                    /*
                     * Main filter.
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


                    this.closeAddedToCartModal();


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

                    }

                }
            );


            /* =================================================
               IMAGE MANIFEST READY
            ================================================= */

            document.addEventListener(
                'velocity:image-manifest-ready',
                () => {

                    console.log(
                        '[Velocity Store] Image manifest ready. Refreshing products.'
                    );


                    if (
                        window.VelocityFilters &&
                        typeof window.VelocityFilters.apply ===
                        'function'
                    ) {

                        try {

                            window.VelocityFilters.apply();

                        } catch (error) {

                            console.error(
                                '[Velocity Store] Failed to refresh products after manifest:',
                                error
                            );

                            this.renderProducts();

                        }

                    } else {

                        this.renderProducts();

                    }


                    const searchInput =
                        document.querySelector(
                            '#searchInput'
                        );


                    if (
                        searchInput &&
                        searchInput.value.trim()
                    ) {

                        this.renderSearchResults(
                            searchInput.value.trim()
                        );

                    }


                    this.setupImageFallbacks();

                }
            );


            /* =================================================
               PRODUCTS READY
            ================================================= */

            document.addEventListener(
                'velocity:products-ready',
                () => {

                    const grid =
                        document.querySelector(
                            '#products-grid'
                        );


                    if (
                        grid &&
                        !grid.children.length
                    ) {

                        if (
                            window.VelocityFilters &&
                            typeof window.VelocityFilters.apply ===
                            'function'
                        ) {

                            window.VelocityFilters.apply();

                        } else {

                            this.renderProducts();

                        }

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


                    /*
                     * If cart.js emits this event after a normal
                     * Add To Cart click, finish the cinematic
                     * experience.
                     */

                    if (
                        this.pendingCartProduct &&
                        !this.cartModalTimer
                    ) {

                        const product =
                            this.pendingCartProduct;


                        this.pendingCartProduct =
                            null;


                        this.scheduleAddedToCartModal(
                            product
                        );

                    }

                }
            );

        },


        /* =====================================================
           ADD TO CART VISUAL EXPERIENCE
        ===================================================== */

        handleAddToCartVisual(button) {

            if (
                this.cartAnimationRunning
            ) {

                return;

            }


            if (!button) {
                return;
            }


            /*
             * Product ID can come from:
             *
             * data-cart-id
             */

            const productId =
                button.dataset.cartId;


            if (!productId) {

                /*
                 * Still allow a generic visual effect
                 * if the product ID is unavailable.
                 */

                const card =
                    button.closest(
                        '.product-card'
                    );


                if (card) {

                    this.animateProductCard(
                        card
                    );

                }


                return;

            }


            const product =
                this.getProductById(
                    productId
                );


            if (!product) {

                console.warn(
                    '[Velocity Store] Product not found:',
                    productId
                );


                return;

            }


            const card =
                button.closest(
                    '.product-card'
                );


            if (!card) {

                this.startAddedToCartExperience(
                    product
                );

                return;

            }


            this.cartAnimationRunning =
                true;


            this.pendingCartProduct =
                product;


            /*
             * Start spectacular card animation.
             */

            this.animateProductCard(
                card
            );


            /*
             * Safety fallback.
             *
             * If cart.js does not emit velocity:cart-changed,
             * the modal still opens after the animation.
             */

            clearTimeout(
                this.cartAnimationTimer
            );


            this.cartAnimationTimer =
                setTimeout(
                    () => {

                        if (
                            this.pendingCartProduct
                        ) {

                            const pending =
                                this.pendingCartProduct;


                            this.pendingCartProduct =
                                null;


                            this.scheduleAddedToCartModal(
                                pending
                            );

                        }

                    },
                    1350
                );

        },


        /* =====================================================
           PRODUCT CARD ROTATION
           ===================================================== */

        animateProductCard(card) {

            if (!card) {
                return;
            }


            /*
             * Restart animation even if user previously
             * clicked the same card.
             */

            card.classList.remove(
                'velocity-cart-spin'
            );


            card.classList.remove(
                'velocity-cart-launch'
            );


            /*
             * Force browser reflow.
             */

            void card.offsetWidth;


            card.classList.add(
                'velocity-cart-spin'
            );


            card.classList.add(
                'velocity-cart-launch'
            );


            /*
             * Add temporary glow layer.
             */

            let glow =
                card.querySelector(
                    '.velocity-cart-glow'
                );


            if (!glow) {

                glow =
                    document.createElement(
                        'div'
                    );


                glow.className =
                    'velocity-cart-glow';


                glow.setAttribute(
                    'aria-hidden',
                    'true'
                );


                card.appendChild(
                    glow
                );

            }


            glow.classList.remove(
                'active'
            );


            void glow.offsetWidth;


            glow.classList.add(
                'active'
            );


            /*
             * Remove classes after animation.
             */

            setTimeout(
                () => {

                    card.classList.remove(
                        'velocity-cart-spin'
                    );

                    card.classList.remove(
                        'velocity-cart-launch'
                    );

                    if (glow) {

                        glow.classList.remove(
                            'active'
                        );

                    }

                    this.cartAnimationRunning =
                        false;

                },
                1250
            );

        },


        /* =====================================================
           START ADDED TO CART EXPERIENCE
        ===================================================== */

        startAddedToCartExperience(product) {

            if (!product) {
                return;
            }


            /*
             * If product card exists, animate it.
             */

            const productId =
                String(
                    product.id
                );


            let card = null;


            try {

                card =
                    document.querySelector(
                        `.product-card[data-product-id="${CSS.escape(productId)}"]`
                    );

            } catch (error) {

                card = null;

            }


            if (!card) {

                try {

                    card =
                        document.querySelector(
                            `[data-cart-id="${CSS.escape(productId)}"]`
                        )?.closest(
                            '.product-card'
                        ) || null;

                } catch (error) {

                    card = null;

                }

            }


            if (card) {

                this.animateProductCard(
                    card
                );

            }


            this.scheduleAddedToCartModal(
                product
            );

        },


        /* =====================================================
           SCHEDULE ADDED MODAL
        ===================================================== */

        scheduleAddedToCartModal(product) {

            if (!product) {
                return;
            }


            clearTimeout(
                this.cartModalTimer
            );


            this.cartModalTimer =
                setTimeout(
                    () => {

                        this.cartModalTimer =
                            null;

                        this.openAddedToCartModal(
                            product
                        );

                    },
                    120
                );

        },


        /* =====================================================
           OPEN ADDED TO CART MODAL
        ===================================================== */

        openAddedToCartModal(product) {

            if (!product) {
                return;
            }


            /*
             * Close quick view if somehow still open.
             */

            this.closeQuickView(
                document.querySelector(
                    '#quick-view-modal'
                )
            );


            let modal =
                document.querySelector(
                    '#velocity-added-cart-modal'
                );


            if (!modal) {

                modal =
                    document.createElement(
                        'div'
                    );


                modal.id =
                    'velocity-added-cart-modal';


                modal.className =
                    'velocity-added-cart-modal';


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


            let candidates = [];


            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.getProductImageCandidates ===
                'function'
            ) {

                candidates =
                    window.VelocityProducts
                        .getProductImageCandidates(
                            product
                        )
                        .slice(1);

            }


            const name =
                this.escapeHTML(
                    product.name ||
                    'Product'
                );


            const category =
                this.escapeHTML(
                    product.categoryName ||
                    product.category ||
                    'Premium Collection'
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

                    : `${product.price ?? ''} DH`;


            const productDescription =
                this.escapeHTML(
                    product.description ||
                    'Premium product selected for your Velocity collection.'
                );


            const productId =
                this.escapeAttribute(
                    product.id
                );


            modal.innerHTML = `

                <div
                    class="velocity-added-backdrop"
                    data-added-cart-close
                    aria-hidden="true"
                ></div>


                <div
                    class="velocity-added-shell"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="velocity-added-title"
                >

                    <!-- =====================================
                         ANIMATED BACKGROUND
                    ====================================== -->

                    <div
                        class="velocity-added-noise"
                        aria-hidden="true"
                    ></div>


                    <div
                        class="velocity-added-grid-bg"
                        aria-hidden="true"
                    ></div>


                    <div
                        class="velocity-added-orb velocity-added-orb-one"
                        aria-hidden="true"
                    ></div>


                    <div
                        class="velocity-added-orb velocity-added-orb-two"
                        aria-hidden="true"
                    ></div>


                    <div
                        class="velocity-added-orb velocity-added-orb-three"
                        aria-hidden="true"
                    ></div>


                    <div
                        class="velocity-added-wave velocity-added-wave-one"
                        aria-hidden="true"
                    ></div>


                    <div
                        class="velocity-added-wave velocity-added-wave-two"
                        aria-hidden="true"
                    ></div>


                    <button
                        type="button"
                        class="velocity-added-close"
                        data-added-cart-close
                        aria-label="Close"
                    >
                        <span>×</span>
                    </button>


                    <!-- =====================================
                         CONTENT
                    ====================================== -->

                    <div class="velocity-added-grid">

                        <!-- =================================
                             LEFT / PRODUCT VISUAL
                        ================================== -->

                        <div class="velocity-added-visual">

                            <div
                                class="velocity-added-ring velocity-added-ring-one"
                                aria-hidden="true"
                            ></div>


                            <div
                                class="velocity-added-ring velocity-added-ring-two"
                                aria-hidden="true"
                            ></div>


                            <div class="velocity-added-image-wrap">

                                <div
                                    class="velocity-added-image-glow"
                                    aria-hidden="true"
                                ></div>


                                <div class="velocity-added-image-card">

                                    <img
                                        src="${this.escapeAttribute(image)}"
                                        alt="${this.escapeAttribute(product.name)}"
                                        data-image-candidates="${this.escapeAttribute(JSON.stringify(candidates))}"
                                        data-fallback="${this.escapeAttribute(fallback)}"
                                        data-product-id="${productId}"
                                        loading="eager"
                                        decoding="async"
                                    >


                                    <div
                                        class="velocity-added-image-shine"
                                        aria-hidden="true"
                                    ></div>

                                </div>


                                <div
                                    class="velocity-added-floating-dot dot-one"
                                    aria-hidden="true"
                                ></div>


                                <div
                                    class="velocity-added-floating-dot dot-two"
                                    aria-hidden="true"
                                ></div>


                                <div
                                    class="velocity-added-floating-dot dot-three"
                                    aria-hidden="true"
                                ></div>

                            </div>


                            <div
                                class="velocity-added-success-badge"
                            >

                                <span class="velocity-added-check">
                                    ✓
                                </span>

                                <span>
                                    ADDED
                                </span>

                            </div>

                        </div>


                        <!-- =================================
                             RIGHT / PRODUCT INFO
                        ================================== -->

                        <div class="velocity-added-info">

                            <div class="velocity-added-kicker">

                                <span class="velocity-added-kicker-dot"></span>

                                ADDED TO CART

                            </div>


                            <h2
                                id="velocity-added-title"
                            >
                                ${name}
                            </h2>


                            <p class="velocity-added-category">
                                ${category}
                            </p>


                            <div class="velocity-added-rating">

                                <span class="velocity-added-stars">
                                    ${stars}
                                </span>

                                <span class="velocity-added-rating-number">
                                    ${rating > 0 ? rating.toFixed(1) : 'New'}
                                </span>

                            </div>


                            <p class="velocity-added-description">
                                ${productDescription}
                            </p>


                            <div class="velocity-added-divider"></div>


                            <div class="velocity-added-meta">

                                <div class="velocity-added-price-box">

                                    <span>
                                        PRICE
                                    </span>

                                    <strong>
                                        ${price}
                                    </strong>

                                </div>


                                <div class="velocity-added-status">

                                    <span class="velocity-added-status-icon">
                                        ✓
                                    </span>

                                    <div>

                                        <strong>
                                            Ready in cart
                                        </strong>

                                        <small>
                                            1 item added
                                        </small>

                                    </div>

                                </div>

                            </div>


                            <div class="velocity-added-actions">

                                <button
                                    type="button"
                                    class="velocity-added-btn velocity-added-btn-primary"
                                    data-added-cart-view
                                >

                                    <span>
                                        View Cart
                                    </span>

                                    <span class="velocity-added-btn-arrow">
                                        →
                                    </span>

                                </button>


                                <button
                                    type="button"
                                    class="velocity-added-btn velocity-added-btn-secondary"
                                    data-added-cart-continue
                                >

                                    Continue Shopping

                                </button>

                            </div>


                            <div class="velocity-added-footer-line">

                                <span></span>

                                <small>
                                    VELOCITY STORE
                                </small>

                                <span></span>

                            </div>

                        </div>

                    </div>

                </div>

            `;


            this.attachImageFallbacks(
                modal
            );


            /*
             * Open.
             */

            requestAnimationFrame(
                () => {

                    requestAnimationFrame(
                        () => {

                            modal.classList.add(
                                'active'
                            );

                        }
                    );

                }
            );


            document.body.classList.add(
                'velocity-added-cart-open'
            );


            /*
             * Accessibility.
             */

            modal.setAttribute(
                'aria-hidden',
                'false'
            );


            /*
             * Focus close button.
             */

            setTimeout(
                () => {

                    const close =
                        modal.querySelector(
                            '.velocity-added-close'
                        );


                    if (close) {

                        close.focus();

                    }

                },
                300
            );

        },


        /* =====================================================
           CLOSE ADDED TO CART MODAL
        ===================================================== */

        closeAddedToCartModal() {

            clearTimeout(
                this.cartModalTimer
            );


            this.cartModalTimer =
                null;


            const modal =
                document.querySelector(
                    '#velocity-added-cart-modal'
                );


            if (!modal) {

                document.body.classList.remove(
                    'velocity-added-cart-open'
                );


                return;

            }


            modal.classList.remove(
                'active'
            );


            modal.setAttribute(
                'aria-hidden',
                'true'
            );


            document.body.classList.remove(
                'velocity-added-cart-open'
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
                500
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
                    .slice(0, 8);


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


                            let candidates = [];


                            if (
                                window.VelocityProducts &&
                                typeof window.VelocityProducts.getProductImageCandidates ===
                                'function'
                            ) {

                                candidates =
                                    window.VelocityProducts
                                        .getProductImageCandidates(
                                            product
                                        )
                                        .slice(1);

                            }


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


                            const candidatesAttribute =
                                this.escapeAttribute(
                                    JSON.stringify(
                                        candidates
                                    )
                                );


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
                                            data-image-candidates="${candidatesAttribute}"
                                            data-fallback="${this.escapeAttribute(fallback)}"
                                            loading="lazy"
                                            decoding="async"
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


                this.scrollTo(
                    '#products'
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


        /* =====================================================
           CLOSE MOBILE MENU
        ===================================================== */

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


            let productList =
                window.VelocityProducts.getProducts();


            if (
                category &&
                category !== 'all'
            ) {

                const normalized =
                    String(
                        category
                    )
                        .toLowerCase()
                        .trim();


                productList =
                    productList.filter(
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
                                normalized
                            );

                        }
                    );

            }


            window.VelocityProducts.renderProducts(
                container,
                productList
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


            let candidates = [];


            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.getProductImageCandidates ===
                'function'
            ) {

                candidates =
                    window.VelocityProducts
                        .getProductImageCandidates(
                            product
                        )
                        .slice(1);

            }


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
                                data-image-candidates="${this.escapeAttribute(JSON.stringify(candidates))}"
                                data-fallback="${this.escapeAttribute(fallback)}"
                                loading="eager"
                                decoding="async"
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
           GET PRODUCT
        ===================================================== */

        getProductById(productId) {

            if (
                !window.VelocityProducts ||
                typeof window.VelocityProducts.getProductById !==
                'function'
            ) {

                return null;

            }


            return window.VelocityProducts.getProductById(
                productId
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
             * Main Products resolver.
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
             * Local / remote fallback.
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


                    let candidates = [];


                    if (
                        image.dataset.imageCandidates
                    ) {

                        try {

                            const parsed =
                                JSON.parse(
                                    image.dataset.imageCandidates
                                );


                            if (
                                Array.isArray(parsed)
                            ) {

                                candidates =
                                    parsed.filter(
                                        value =>
                                            typeof value === 'string' &&
                                            value.trim()
                                    );

                            }

                        } catch (error) {

                            console.warn(
                                '[Velocity Store] Invalid image candidates:',
                                error
                            );

                        }

                    }


                    /*
                     * Legacy fallback.
                     */

                    const legacyWebFallback =
                        image.dataset.webFallback ||
                        image.dataset.webImage ||
                        image.dataset.remoteImage;


                    if (
                        legacyWebFallback &&
                        !candidates.includes(
                            legacyWebFallback
                        )
                    ) {

                        candidates.push(
                            legacyWebFallback
                        );

                    }


                    image._velocityImageCandidates =
                        candidates;


                    image._velocityImageIndex =
                        0;


                    image.addEventListener(
                        'error',
                        () => {

                            const list =
                                image._velocityImageCandidates ||
                                [];


                            let nextIndex =
                                Number(
                                    image._velocityImageIndex || 0
                                );


                            if (
                                nextIndex < list.length
                            ) {

                                const nextImage =
                                    list[nextIndex];


                                image._velocityImageIndex =
                                    nextIndex + 1;


                                if (
                                    nextImage &&
                                    nextImage !== image.src
                                ) {

                                    image.src =
                                        nextImage;

                                    image.style.visibility =
                                        'visible';

                                    return;

                                }

                            }


                            if (
                                image.dataset.fallbackUsed !==
                                'true'
                            ) {

                                const fallback =
                                    image.dataset.fallback ||
                                    this.getFallbackImage();


                                image.dataset.fallbackUsed =
                                    'true';


                                image.src =
                                    fallback;


                                image.style.visibility =
                                    'visible';


                                return;

                            }


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
