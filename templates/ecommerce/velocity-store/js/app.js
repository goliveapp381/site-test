'use strict';

/* =========================================================
   VELOCITY STORE
   MAIN APPLICATION
   ---------------------------------------------------------
   Main controller only.

   Modules:
   - VelocityCore
   - VelocityCartUI
   - VelocityUI
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

            this.initialized =
                true;

            try {

                this.bindEvents();

                this.initializeModules();

                window.VelocityCore
                    .setupImageFallbacks();

                window.VelocityCore
                    .updateYear();

            } catch (error) {

                console.error(
                    '[Velocity Store] Application initialization error:',
                    error
                );

            } finally {

                window.VelocityCore
                    .hidePageLoader();

            }

            document.dispatchEvent(
                new CustomEvent(
                    'velocity:app-ready'
                )
            );
        },


        /* =====================================================
           MODULES
        ===================================================== */

        initializeModules() {

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

                    window.VelocityCore
                        .renderProducts();

                }

            } else {

                window.VelocityCore
                    .renderProducts();

            }
        },


        /* =====================================================
           EVENTS
        ===================================================== */

        bindEvents() {

            if (this.eventsBound) {
                return;
            }

            this.eventsBound =
                true;


            /* =================================================
               GLOBAL CLICK
            ================================================= */

            document.addEventListener(
                'click',
                event => {


                    /* =========================================
                       ADD TO CART
                    ========================================= */

                    const addButton =
                        event.target.closest(
                            '.add-cart-button, [data-cart-id]'
                        );

                    if (
                        addButton &&
                        !addButton.closest(
                            '#quick-view-modal'
                        )
                    ) {

                        /*
                         * We don't prevent the event.
                         *
                         * cart.js remains responsible
                         * for adding the product.
                         */

                        window.VelocityCartUI
                            .handleAddToCart(
                                addButton
                            );
                    }


                    /* =========================================
                       MOBILE MENU
                    ========================================= */

                    const menuButton =
                        event.target.closest(
                            '[data-mobile-menu]'
                        );

                    if (menuButton) {

                        event.preventDefault();

                        window.VelocityUI
                            .toggleMobileMenu();

                        return;
                    }


                    const mobileClose =
                        event.target.closest(
                            '#mobileMenuClose, [data-mobile-menu-close]'
                        );

                    if (mobileClose) {

                        event.preventDefault();

                        window.VelocityUI
                            .closeMobileMenu();

                        return;
                    }


                    const mobileLink =
                        event.target.closest(
                            '#mobileMenu a[href^="#"], .mobile-menu a[href^="#"]'
                        );

                    if (mobileLink) {

                        window.VelocityUI
                            .closeMobileMenu();
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

                        window.VelocityUI.scrollTo(
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

                        window.VelocityUI
                            .openSearch();

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

                        window.VelocityUI
                            .closeSearch();

                        return;
                    }


                    const searchOverlay =
                        document.querySelector(
                            '#searchOverlay'
                        );

                    if (
                        searchOverlay &&
                        event.target ===
                        searchOverlay
                    ) {

                        window.VelocityUI
                            .closeSearch();

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

                        window.VelocityUI
                            .performSearch();

                        return;
                    }


                    /* =========================================
                       CATEGORY
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

                            window.VelocityFilters
                                .setCategory(
                                    category
                                );

                        } else {

                            window.VelocityUI
                                .fallbackCategoryFilter(
                                    category
                                );
                        }

                        if (
                            categoryButton.classList.contains(
                                'category-card'
                            ) ||
                            categoryButton.closest(
                                '.category-card'
                            )
                        ) {

                            window.VelocityUI
                                .scrollTo(
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

                            window.VelocityCore
                                .renderProducts();
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
                       WISHLIST
                    ========================================= */

                    const wishlistOpen =
                        event.target.closest(
                            '[data-wishlist-open]'
                        );

                    if (wishlistOpen) {

                        event.preventDefault();

                        window.VelocityUI
                            .openWishlist();

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

                        window.VelocityUI
                            .openQuickView(
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

                        window.VelocityUI
                            .closeSearch();

                        window.VelocityUI
                            .openQuickView(
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

                        window.VelocityUI
                            .closeQuickView(
                                document.querySelector(
                                    '#quick-view-modal'
                                )
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

                        const product =
                            window.VelocityCore
                                .getProductById(
                                    productId
                                );

                        window.VelocityUI
                            .closeQuickView(
                                document.querySelector(
                                    '#quick-view-modal'
                                )
                            );

                        if (
                            window.VelocityCart &&
                            typeof window.VelocityCart.add ===
                            'function'
                        ) {

                            window.VelocityCart.add(
                                productId
                            );
                        }

                        if (product) {

                            const fakeButton =
                                document.querySelector(
                                    `[data-cart-id="${CSS.escape(String(productId))}"]`
                                );

                            if (fakeButton) {

                                window.VelocityCartUI
                                    .handleAddToCart(
                                        fakeButton
                                    );

                            } else {

                                window.VelocityCartUI
                                    .startExperience(
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

                        window.VelocityCartUI
                            .closeModal();

                        return;
                    }


                    /* =========================================
                       VIEW CART
                    ========================================= */

                    const viewCart =
                        event.target.closest(
                            '[data-added-cart-view]'
                        );

                    if (viewCart) {

                        event.preventDefault();

                        window.VelocityCartUI
                            .closeModal();

                        setTimeout(() => {

                            if (
                                window.VelocityCart &&
                                typeof window.VelocityCart.open ===
                                'function'
                            ) {

                                window.VelocityCart.open();
                            }

                        }, 220);

                        return;
                    }


                    /* =========================================
                       CONTINUE SHOPPING
                    ========================================= */

                    const continueShopping =
                        event.target.closest(
                            '[data-added-cart-continue]'
                        );

                    if (continueShopping) {

                        event.preventDefault();

                        window.VelocityCartUI
                            .closeModal();

                        return;
                    }

                }
            );


            /* =================================================
               INPUT
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

                    document
                        .querySelectorAll(
                            '[data-product-search]'
                        )
                        .forEach(other => {

                            if (
                                other !== input &&
                                other.value !== value
                            ) {

                                other.value =
                                    value;
                            }

                        });

                    if (
                        input.id === 'searchInput'
                    ) {

                        window.VelocityUI
                            .renderSearchResults(
                                value
                            );
                    }

                    if (
                        window.VelocityFilters &&
                        typeof window.VelocityFilters.setSearch ===
                        'function'
                    ) {

                        window.VelocityFilters
                            .setSearch(
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

                        window.VelocityFilters
                            .setSort(
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

                            window.VelocityUI
                                .showNotification(
                                    'المرجو إدخال بريد إلكتروني صحيح.',
                                    'error'
                                );

                            return;
                        }

                        window.VelocityUI
                            .showNotification(
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

                        window.VelocityUI
                            .closeMobileMenu();
                    }

                }
            );


            /* =================================================
               ESCAPE
            ================================================= */

            document.addEventListener(
                'keydown',
                event => {

                    if (
                        event.key !== 'Escape'
                    ) {
                        return;
                    }

                    window.VelocityUI
                        .closeMobileMenu();

                    window.VelocityUI
                        .closeSearch();

                    window.VelocityUI
                        .closeQuickView(
                            document.querySelector(
                                '#quick-view-modal'
                            )
                        );

                    window.VelocityCartUI
                        .closeModal();

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

                    window.VelocityCore
                        .setupImageFallbacks();

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
               IMAGE MANIFEST
            ================================================= */

            document.addEventListener(
                'velocity:image-manifest-ready',
                () => {

                    console.log(
                        '[Velocity Store] Image manifest ready.'
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
                                '[Velocity Store] Failed to refresh products:',
                                error
                            );

                            window.VelocityCore
                                .renderProducts();
                        }

                    } else {

                        window.VelocityCore
                            .renderProducts();
                    }

                    const searchInput =
                        document.querySelector(
                            '#searchInput'
                        );

                    if (
                        searchInput &&
                        searchInput.value.trim()
                    ) {

                        window.VelocityUI
                            .renderSearchResults(
                                searchInput.value.trim()
                            );
                    }

                    window.VelocityCore
                        .setupImageFallbacks();
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

                            window.VelocityCore
                                .renderProducts();
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

                        window.VelocityWishlist
                            .updateUI();
                    }
                }
            );


            /* =================================================
               CART CHANGED
            ================================================= */

            document.addEventListener(
                'velocity:cart-changed',
                () => {

                    window.VelocityCore
                        .setupImageFallbacks();

                    /*
                     * FIXED:
                     *
                     * No longer checking:
                     *
                     * !modalTimer
                     *
                     * because that could prevent the modal.
                     */

                    window.VelocityCartUI
                        .cartChanged();
                }
            );

        }

    };


    /* =========================================================
       DOM READY
    ========================================================= */

    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            () => {

                App.init();

            },
            {
                once: true
            }
        );

    } else {

        App.init();

    }


    window.VelocityApp =
        App;

})();
