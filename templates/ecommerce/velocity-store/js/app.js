'use strict';

/* =========================================================
VELOCITY STORE
MAIN APPLICATION

Main controller only.

Modules:

- VelocityCore
- VelocityCartUI
- VelocityUI
- VelocityCart
- VelocityWishlist
- VelocityFilters
  ========================================================= */

(function () {

const App = {

    initialized: false,
    eventsBound: false,


    /* =====================================================
       INIT
    ===================================================== */

    init() {

        if (App.initialized) {
            return;
        }

        App.initialized = true;

        try {

            App.bindEvents();

            App.initializeModules();

            if (
                window.VelocityCore &&
                typeof window.VelocityCore.setupImageFallbacks === 'function'
            ) {

                window.VelocityCore.setupImageFallbacks();

            }

            if (
                window.VelocityCore &&
                typeof window.VelocityCore.updateYear === 'function'
            ) {

                window.VelocityCore.updateYear();

            }

        } catch (error) {

            console.error(
                '[Velocity Store] Application initialization error:',
                error
            );

        } finally {

            if (
                window.VelocityCore &&
                typeof window.VelocityCore.hidePageLoader === 'function'
            ) {

                window.VelocityCore.hidePageLoader();

            }

        }

        document.dispatchEvent(
            new CustomEvent('velocity:app-ready')
        );

    },


    /* =====================================================
       MODULE INITIALIZATION
    ===================================================== */

    initializeModules() {

        /* =========================================
           CART
        ========================================= */

        if (
            window.VelocityCart &&
            typeof window.VelocityCart.init === 'function'
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


        /* =========================================
           WISHLIST
        ========================================= */

        if (
            window.VelocityWishlist &&
            typeof window.VelocityWishlist.init === 'function'
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


        /* =========================================
           PRODUCTS / FILTERS
        ========================================= */

        if (
            window.VelocityFilters &&
            typeof window.VelocityFilters.apply === 'function'
        ) {

            try {

                window.VelocityFilters.apply();

            } catch (error) {

                console.error(
                    '[Velocity Store] Filter rendering error:',
                    error
                );

                if (
                    window.VelocityCore &&
                    typeof window.VelocityCore.renderProducts === 'function'
                ) {

                    window.VelocityCore.renderProducts();

                }

            }

        } else if (
            window.VelocityCore &&
            typeof window.VelocityCore.renderProducts === 'function'
        ) {

            window.VelocityCore.renderProducts();

        }

    },


    /* =====================================================
       EVENTS
    ===================================================== */

    bindEvents() {

        if (App.eventsBound) {
            return;
        }

        App.eventsBound = true;


        /* =================================================
           GLOBAL CLICK
        ================================================= */

        document.addEventListener(
            'click',
            function (event) {

                /* =========================================
                   ADD TO CART
                   -----------------------------------------
                   IMPORTANT:
                   This ONLY starts the visual experience.

                   cart.js performs the real add().
                ========================================= */

                const addButton =
                    event.target.closest(
                        '.add-cart-button, [data-cart-id]'
                    );

                if (
                    addButton &&
                    !addButton.closest('#quick-view-modal') &&
                    !addButton.closest('#velocity-added-cart-modal') &&
                    !addButton.disabled
                ) {

                    if (
                        window.VelocityCartUI &&
                        typeof window.VelocityCartUI.handleAddToCart === 'function'
                    ) {

                        try {

                            window.VelocityCartUI.handleAddToCart(
                                addButton
                            );

                        } catch (error) {

                            console.error(
                                '[Velocity Store] Cart animation error:',
                                error
                            );

                        }

                    }

                    /*
                     * VERY IMPORTANT:
                     *
                     * Do NOT:
                     * event.preventDefault()
                     * event.stopPropagation()
                     * return
                     *
                     * here.
                     *
                     * cart.js must receive the same click
                     * and execute VelocityCart.add().
                     */

                }


                /* =========================================
                   MOBILE MENU
                ========================================= */

                const menuButton =
                    event.target.closest('[data-mobile-menu]');

                if (menuButton) {

                    event.preventDefault();

                    if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.toggleMobileMenu === 'function'
                    ) {

                        window.VelocityUI.toggleMobileMenu();

                    }

                    return;

                }


                const mobileClose =
                    event.target.closest(
                        '#mobileMenuClose, [data-mobile-menu-close]'
                    );

                if (mobileClose) {

                    event.preventDefault();

                    if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.closeMobileMenu === 'function'
                    ) {

                        window.VelocityUI.closeMobileMenu();

                    }

                    return;

                }


                const mobileLink =
                    event.target.closest(
                        '#mobileMenu a[href^="#"], .mobile-menu a[href^="#"]'
                    );

                if (mobileLink) {

                    if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.closeMobileMenu === 'function'
                    ) {

                        window.VelocityUI.closeMobileMenu();

                    }

                }


                /* =========================================
                   SCROLL
                ========================================= */

                const scrollButton =
                    event.target.closest('[data-scroll-to]');

                if (scrollButton) {

                    event.preventDefault();

                    if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.scrollTo === 'function'
                    ) {

                        window.VelocityUI.scrollTo(
                            scrollButton.dataset.scrollTo
                        );

                    }

                    return;

                }


                /* =========================================
                   SEARCH OPEN
                ========================================= */

                const searchOpen =
                    event.target.closest('[data-search-open]');

                if (searchOpen) {

                    event.preventDefault();

                    if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.openSearch === 'function'
                    ) {

                        window.VelocityUI.openSearch();

                    }

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

                    if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.closeSearch === 'function'
                    ) {

                        window.VelocityUI.closeSearch();

                    }

                    return;

                }


                const searchOverlay =
                    document.querySelector('#searchOverlay');

                if (
                    searchOverlay &&
                    event.target === searchOverlay
                ) {

                    if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.closeSearch === 'function'
                    ) {

                        window.VelocityUI.closeSearch();

                    }

                    return;

                }


                /* =========================================
                   SEARCH SUBMIT
                ========================================= */

                const searchSubmit =
                    event.target.closest('#searchSubmit');

                if (searchSubmit) {

                    event.preventDefault();

                    if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.performSearch === 'function'
                    ) {

                        window.VelocityUI.performSearch();

                    }

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
                        categoryButton.dataset.categoryFilter || 'all';

                    if (
                        window.VelocityFilters &&
                        typeof window.VelocityFilters.setCategory === 'function'
                    ) {

                        window.VelocityFilters.setCategory(category);

                    } else if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.fallbackCategoryFilter === 'function'
                    ) {

                        window.VelocityUI.fallbackCategoryFilter(category);

                    }

                    if (
                        categoryButton.classList.contains('category-card') ||
                        categoryButton.closest('.category-card')
                    ) {

                        if (
                            window.VelocityUI &&
                            typeof window.VelocityUI.scrollTo === 'function'
                        ) {

                            window.VelocityUI.scrollTo('#products');

                        }

                    }

                    return;

                }


                /* =========================================
                   FILTER RESET
                ========================================= */

                const resetButton =
                    event.target.closest('[data-filter-reset]');

                if (resetButton) {

                    event.preventDefault();

                    if (
                        window.VelocityFilters &&
                        typeof window.VelocityFilters.reset === 'function'
                    ) {

                        window.VelocityFilters.reset();

                    } else if (
                        window.VelocityCore &&
                        typeof window.VelocityCore.renderProducts === 'function'
                    ) {

                        window.VelocityCore.renderProducts();

                    }

                    return;

                }


                /* =========================================
                   CART OPEN
                ========================================= */

                const cartOpen =
                    event.target.closest('[data-cart-open]');

                if (cartOpen) {

                    event.preventDefault();

                    if (
                        window.VelocityCart &&
                        typeof window.VelocityCart.open === 'function'
                    ) {

                        window.VelocityCart.open();

                    }

                    return;

                }


                /* =========================================
                   WISHLIST
                ========================================= */

                const wishlistOpen =
                    event.target.closest('[data-wishlist-open]');

                if (wishlistOpen) {

                    event.preventDefault();

                    if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.openWishlist === 'function'
                    ) {

                        window.VelocityUI.openWishlist();

                    }

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

                    if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.openQuickView === 'function'
                    ) {

                        window.VelocityUI.openQuickView(
                            quickView.dataset.productId
                        );

                    }

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

                    if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.closeSearch === 'function'
                    ) {

                        window.VelocityUI.closeSearch();

                    }

                    if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.openQuickView === 'function'
                    ) {

                        window.VelocityUI.openQuickView(productId);

                    }

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

                    if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.closeQuickView === 'function'
                    ) {

                        window.VelocityUI.closeQuickView(
                            document.querySelector('#quick-view-modal')
                        );

                    }

                    return;

                }


                /* =========================================
                   QUICK VIEW ADD
                ========================================= */

                const quickAdd =
                    event.target.closest('[data-quick-add]');

                if (quickAdd) {

                    event.preventDefault();

                    const productId =
                        quickAdd.dataset.quickAdd;

                    const product =
                        window.VelocityCore &&
                        typeof window.VelocityCore.getProductById === 'function'
                            ? window.VelocityCore.getProductById(productId)
                            : null;

                    if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.closeQuickView === 'function'
                    ) {

                        window.VelocityUI.closeQuickView(
                            document.querySelector('#quick-view-modal')
                        );

                    }


                    /* =====================================
                       START CINEMATIC EXPERIENCE FIRST
                    ===================================== */

                    if (
                        product &&
                        window.VelocityCartUI &&
                        typeof window.VelocityCartUI.prepareExperience === 'function'
                    ) {

                        window.VelocityCartUI.prepareExperience(product);

                    }


                    /* =====================================
                       REAL CART ADD
                    ===================================== */

                    if (
                        window.VelocityCart &&
                        typeof window.VelocityCart.add === 'function'
                    ) {

                        window.VelocityCart.add(productId);

                    }

                    return;

                }


                /* =========================================
                   ADDED CART MODAL CLOSE
                ========================================= */

                const addedClose =
                    event.target.closest('[data-added-cart-close]');

                if (addedClose) {

                    event.preventDefault();

                    if (
                        window.VelocityCartUI &&
                        typeof window.VelocityCartUI.closeModal === 'function'
                    ) {

                        window.VelocityCartUI.closeModal();

                    }

                    return;

                }


                /* =========================================
                   VIEW CART
                ========================================= */

                const viewCart =
                    event.target.closest('[data-added-cart-view]');

                if (viewCart) {

                    event.preventDefault();

                    if (
                        window.VelocityCartUI &&
                        typeof window.VelocityCartUI.closeModal === 'function'
                    ) {

                        window.VelocityCartUI.closeModal();

                    }

                    setTimeout(function () {

                        if (
                            window.VelocityCart &&
                            typeof window.VelocityCart.open === 'function'
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

                    if (
                        window.VelocityCartUI &&
                        typeof window.VelocityCartUI.closeModal === 'function'
                    ) {

                        window.VelocityCartUI.closeModal();

                    }

                    return;

                }

            }
        );


        /* =================================================
           SEARCH INPUT
        ================================================= */

        document.addEventListener(
            'input',
            function (event) {

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
                    .querySelectorAll('[data-product-search]')
                    .forEach(function (other) {

                        if (
                            other !== input &&
                            other.value !== value
                        ) {

                            other.value = value;

                        }

                    });

                if (
                    input.id === 'searchInput' &&
                    window.VelocityUI &&
                    typeof window.VelocityUI.renderSearchResults === 'function'
                ) {

                    window.VelocityUI.renderSearchResults(value);

                }

                if (
                    window.VelocityFilters &&
                    typeof window.VelocityFilters.setSearch === 'function'
                ) {

                    window.VelocityFilters.setSearch(value);

                }

            }
        );


        /* =================================================
           SORT
        ================================================= */

        document.addEventListener(
            'change',
            function (event) {

                const sort =
                    event.target.closest('[data-product-sort]');

                if (!sort) {
                    return;
                }

                if (
                    window.VelocityFilters &&
                    typeof window.VelocityFilters.setSort === 'function'
                ) {

                    window.VelocityFilters.setSort(sort.value);

                }

            }
        );


        /* =================================================
           NEWSLETTER
        ================================================= */

        const newsletterForm =
            document.querySelector('#newsletterForm');

        if (newsletterForm) {

            newsletterForm.addEventListener(
                'submit',
                function (event) {

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
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                    ) {

                        if (
                            window.VelocityUI &&
                            typeof window.VelocityUI.showNotification === 'function'
                        ) {

                            window.VelocityUI.showNotification(
                                'المرجو إدخال بريد إلكتروني صحيح.',
                                'error'
                            );

                        }

                        return;

                    }

                    if (
                        window.VelocityUI &&
                        typeof window.VelocityUI.showNotification === 'function'
                    ) {

                        window.VelocityUI.showNotification(
                            'تم تسجيل بريدك الإلكتروني بنجاح.',
                            'success'
                        );

                    }

                    newsletterForm.reset();

                }
            );

        }


        /* =================================================
           RESIZE
        ================================================= */

        window.addEventListener(
            'resize',
            function () {

                if (
                    window.innerWidth > 900 &&
                    window.VelocityUI &&
                    typeof window.VelocityUI.closeMobileMenu === 'function'
                ) {

                    window.VelocityUI.closeMobileMenu();

                }

            }
        );


        /* =================================================
           ESCAPE
        ================================================= */

        document.addEventListener(
            'keydown',
            function (event) {

                if (event.key !== 'Escape') {
                    return;
                }

                if (
                    window.VelocityUI &&
                    typeof window.VelocityUI.closeMobileMenu === 'function'
                ) {

                    window.VelocityUI.closeMobileMenu();

                }

                if (
                    window.VelocityUI &&
                    typeof window.VelocityUI.closeSearch === 'function'
                ) {

                    window.VelocityUI.closeSearch();

                }

                if (
                    window.VelocityUI &&
                    typeof window.VelocityUI.closeQuickView === 'function'
                ) {

                    window.VelocityUI.closeQuickView(
                        document.querySelector('#quick-view-modal')
                    );

                }

                if (
                    window.VelocityCartUI &&
                    typeof window.VelocityCartUI.closeModal === 'function'
                ) {

                    window.VelocityCartUI.closeModal();

                }

                if (
                    window.VelocityCart &&
                    typeof window.VelocityCart.close === 'function'
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
            function () {

                if (
                    window.VelocityCore &&
                    typeof window.VelocityCore.setupImageFallbacks === 'function'
                ) {

                    window.VelocityCore.setupImageFallbacks();

                }

                if (
                    window.VelocityAnimations &&
                    typeof window.VelocityAnimations.refresh === 'function'
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
            function () {

                console.log(
                    '[Velocity Store] Image manifest ready.'
                );

                if (
                    window.VelocityFilters &&
                    typeof window.VelocityFilters.apply === 'function'
                ) {

                    try {

                        window.VelocityFilters.apply();

                    } catch (error) {

                        console.error(
                            '[Velocity Store] Failed to refresh products:',
                            error
                        );

                        if (
                            window.VelocityCore &&
                            typeof window.VelocityCore.renderProducts === 'function'
                        ) {

                            window.VelocityCore.renderProducts();

                        }

                    }

                } else if (
                    window.VelocityCore &&
                    typeof window.VelocityCore.renderProducts === 'function'
                ) {

                    window.VelocityCore.renderProducts();

                }


                const searchInput =
                    document.querySelector('#searchInput');

                if (
                    searchInput &&
                    searchInput.value.trim() &&
                    window.VelocityUI &&
                    typeof window.VelocityUI.renderSearchResults === 'function'
                ) {

                    window.VelocityUI.renderSearchResults(
                        searchInput.value.trim()
                    );

                }


                if (
                    window.VelocityCore &&
                    typeof window.VelocityCore.setupImageFallbacks === 'function'
                ) {

                    window.VelocityCore.setupImageFallbacks();

                }

            }
        );


        /* =================================================
           PRODUCTS READY
        ================================================= */

        document.addEventListener(
            'velocity:products-ready',
            function () {

                const grid =
                    document.querySelector('#products-grid');

                if (
                    grid &&
                    !grid.children.length
                ) {

                    if (
                        window.VelocityFilters &&
                        typeof window.VelocityFilters.apply === 'function'
                    ) {

                        window.VelocityFilters.apply();

                    } else if (
                        window.VelocityCore &&
                        typeof window.VelocityCore.renderProducts === 'function'
                    ) {

                        window.VelocityCore.renderProducts();

                    }

                }

            }
        );


        /* =================================================
           WISHLIST CHANGED
        ================================================= */

        document.addEventListener(
            'velocity:wishlist-changed',
            function () {

                if (
                    window.VelocityWishlist &&
                    typeof window.VelocityWishlist.updateUI === 'function'
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
            function () {

                if (
                    window.VelocityCore &&
                    typeof window.VelocityCore.setupImageFallbacks === 'function'
                ) {

                    window.VelocityCore.setupImageFallbacks();

                }

                if (
                    window.VelocityCartUI &&
                    typeof window.VelocityCartUI.cartChanged === 'function'
                ) {

                    window.VelocityCartUI.cartChanged();

                }

            }
        );

    }

};


/* =========================================================
   GLOBAL APP
========================================================= */

window.VelocityApp = App;


/* =========================================================
   DOM READY
========================================================= */

if (document.readyState === 'loading') {

    document.addEventListener(
        'DOMContentLoaded',
        function () {

            App.init();

        },
        {
            once: true
        }
    );

} else {

    App.init();

}

})();
