'use strict';

/* =========================================================
   VELOCITY STORE
   SEARCH / FILTER / SORT SYSTEM
========================================================= */

(function () {

    const state = {

        query: '',

        category: 'all',

        minPrice: 0,

        maxPrice: Infinity,

        sort: 'featured'

    };


    /* =====================================================
       NORMALIZE CATEGORY
    ===================================================== */

    function normalizeCategory(category) {

        const value =
            String(category || '')
                .trim()
                .toLowerCase();

        const aliases = {

            all: 'all',

            fashion: 'fashion',
            clothing: 'fashion',

            shoes: 'shoes',
            sneakers: 'shoes',

            tech: 'tech',
            technology: 'tech',
            electronics: 'tech',

            accessories: 'accessories',
            bags: 'accessories'

        };

        return aliases[value] || value || 'all';
    }


    /* =====================================================
       NORMALIZE SEARCH
    ===================================================== */

    function normalizeSearch(value) {

        return String(value || '')
            .trim()
            .toLowerCase();

    }


    /* =====================================================
       GET FILTERED PRODUCTS
    ===================================================== */

    function getFilteredProducts() {

        if (
            !window.VelocityProducts ||
            typeof window.VelocityProducts.getProducts !==
                'function'
        ) {

            return [];

        }


        let result =
            window.VelocityProducts
                .getProducts();


        /* =================================================
           SEARCH
        ================================================= */

        const query =
            normalizeSearch(state.query);

        if (query) {

            result =
                result.filter(product => {

                    const name =
                        String(product.name || '')
                            .toLowerCase();

                    const categoryName =
                        String(
                            product.categoryName || ''
                        ).toLowerCase();

                    const category =
                        String(
                            product.category || ''
                        ).toLowerCase();

                    return (
                        name.includes(query) ||
                        categoryName.includes(query) ||
                        category.includes(query)
                    );

                });

        }


        /* =================================================
           CATEGORY
        ================================================= */

        const category =
            normalizeCategory(
                state.category
            );

        if (
            category &&
            category !== 'all'
        ) {

            result =
                result.filter(product => {

                    const productCategory =
                        normalizeCategory(
                            product.category
                        );

                    return (
                        productCategory ===
                        category
                    );

                });

        }


        /* =================================================
           PRICE
        ================================================= */

        const minPrice =
            Number.isFinite(
                Number(state.minPrice)
            )
                ? Number(state.minPrice)
                : 0;

        const maxPrice =
            Number.isFinite(
                Number(state.maxPrice)
            )
                ? Number(state.maxPrice)
                : Infinity;


        result =
            result.filter(product => {

                const price =
                    Number(product.price);

                if (!Number.isFinite(price)) {
                    return false;
                }

                return (
                    price >= minPrice &&
                    price <= maxPrice
                );

            });


        /* =================================================
           SORT
        ================================================= */

        switch (state.sort) {

            /* ---------------------------------------------
               PRICE LOW → HIGH
            --------------------------------------------- */

            case 'price-low':

                result.sort(
                    (a, b) =>
                        Number(a.price || 0) -
                        Number(b.price || 0)
                );

                break;


            /* ---------------------------------------------
               PRICE HIGH → LOW
            --------------------------------------------- */

            case 'price-high':

                result.sort(
                    (a, b) =>
                        Number(b.price || 0) -
                        Number(a.price || 0)
                );

                break;


            /* ---------------------------------------------
               HIGHEST RATED
            --------------------------------------------- */

            case 'rating':

                result.sort(
                    (a, b) =>
                        Number(b.rating || 0) -
                        Number(a.rating || 0)
                );

                break;


            /* ---------------------------------------------
               NEWEST
            --------------------------------------------- */

            case 'newest':

                result.sort(
                    (a, b) => {

                        const newestA =
                            Boolean(a.newest);

                        const newestB =
                            Boolean(b.newest);

                        if (
                            newestA !==
                            newestB
                        ) {

                            return (
                                Number(newestB) -
                                Number(newestA)
                            );

                        }

                        return String(b.id || '')
                            .localeCompare(
                                String(a.id || '')
                            );

                    }
                );

                break;


            /* ---------------------------------------------
               FEATURED
            --------------------------------------------- */

            case 'featured':

            default:

                result.sort(
                    (a, b) => {

                        const featuredA =
                            Boolean(a.featured);

                        const featuredB =
                            Boolean(b.featured);

                        if (
                            featuredA !==
                            featuredB
                        ) {

                            return (
                                Number(featuredB) -
                                Number(featuredA)
                            );

                        }

                        return (
                            Number(b.rating || 0) -
                            Number(a.rating || 0)
                        );

                    }
                );

                break;

        }


        return result;

    }


    /* =====================================================
       APPLY FILTERS
    ===================================================== */

    function apply() {

        const filteredProducts =
            getFilteredProducts();


        const container =
            document.querySelector(
                '#products-grid'
            );

        if (!container) {
            return;
        }


        if (
            window.VelocityProducts &&
            typeof window.VelocityProducts
                .renderProducts === 'function'
        ) {

            window.VelocityProducts.renderProducts(
                container,
                filteredProducts
            );

        }


        updateResultsCount(
            filteredProducts.length
        );


        updateEmptyState(
            filteredProducts.length
        );


        if (
            window.VelocityWishlist &&
            typeof window.VelocityWishlist
                .updateUI === 'function'
        ) {

            window.VelocityWishlist.updateUI();

        }

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    function setSearch(query) {

        state.query =
            String(query || '');

        apply();

    }


    /* =====================================================
       CATEGORY
    ===================================================== */

    function setCategory(category) {

        state.category =
            normalizeCategory(category);

        updateCategoryUI();

        apply();

    }


    /* =====================================================
       PRICE
    ===================================================== */

    function setPrice(min, max) {

        const normalizedMin =
            Number(min);

        const normalizedMax =
            Number(max);


        state.minPrice =
            Number.isFinite(normalizedMin)
                ? Math.max(0, normalizedMin)
                : 0;


        state.maxPrice =
            Number.isFinite(normalizedMax)
                ? Math.max(
                    state.minPrice,
                    normalizedMax
                )
                : Infinity;


        apply();

    }


    /* =====================================================
       SORT
    ===================================================== */

    function setSort(sort) {

        const allowedSorts = [

            'featured',
            'price-low',
            'price-high',
            'rating',
            'newest'

        ];


        state.sort =
            allowedSorts.includes(sort)
                ? sort
                : 'featured';


        apply();

    }


    /* =====================================================
       CATEGORY UI
    ===================================================== */

    function updateCategoryUI() {

        const currentCategory =
            normalizeCategory(
                state.category
            );


        document
            .querySelectorAll(
                '[data-category-filter]'
            )
            .forEach(button => {

                const buttonCategory =
                    normalizeCategory(
                        button.dataset.categoryFilter
                    );


                const active =
                    buttonCategory ===
                    currentCategory;


                button.classList.toggle(
                    'active',
                    active
                );


                button.setAttribute(
                    'aria-pressed',
                    active
                        ? 'true'
                        : 'false'
                );

            });

    }


    /* =====================================================
       RESULT COUNT
    ===================================================== */

    function updateResultsCount(count) {

        document
            .querySelectorAll(
                '[data-products-count]'
            )
            .forEach(element => {

                element.textContent =
                    Number(count) || 0;

            });

    }


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    function updateEmptyState(count) {

        const emptyElement =
            document.querySelector(
                '#productsEmpty'
            );


        if (!emptyElement) {
            return;
        }


        emptyElement.hidden =
            Number(count) > 0;

    }


    /* =====================================================
       RESET
    ===================================================== */

    function reset() {

        state.query = '';

        state.category = 'all';

        state.minPrice = 0;

        state.maxPrice = Infinity;

        state.sort = 'featured';


        /* ---------------------------------------------
           CLEAR SEARCH INPUTS
        --------------------------------------------- */

        const searchInputs =
            document.querySelectorAll(
                '[data-product-search]'
            );


        searchInputs.forEach(input => {

            input.value = '';

        });


        /* ---------------------------------------------
           RESET SORT
        --------------------------------------------- */

        const sortSelect =
            document.querySelector(
                '[data-product-sort]'
            );


        if (sortSelect) {

            sortSelect.value =
                'featured';

        }


        /* ---------------------------------------------
           UPDATE UI
        --------------------------------------------- */

        updateCategoryUI();

        apply();

    }


    /* =====================================================
       EVENTS
    ===================================================== */

    function bindEvents() {


        /* =================================================
           SEARCH
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


                setSearch(
                    input.value
                );

            }
        );


        /* =================================================
           CATEGORY
        ================================================= */

        document.addEventListener(
            'click',
            event => {

                const button =
                    event.target.closest(
                        '[data-category-filter]'
                    );


                if (!button) {
                    return;
                }


                event.preventDefault();


                setCategory(
                    button.dataset.categoryFilter
                );


                /*
                 * Category cards and filter buttons
                 * both use data-category-filter.
                 *
                 * When a category card is clicked,
                 * automatically scroll to products.
                 */

                if (
                    button.classList.contains(
                        'category-card'
                    )
                ) {

                    const productsSection =
                        document.querySelector(
                            '#products'
                        );


                    if (productsSection) {

                        productsSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });

                    }

                }

            }
        );


        /* =================================================
           SORT
        ================================================= */

        document.addEventListener(
            'change',
            event => {

                const select =
                    event.target.closest(
                        '[data-product-sort]'
                    );


                if (!select) {
                    return;
                }


                setSort(
                    select.value
                );

            }
        );


        /* =================================================
           RESET
        ================================================= */

        document.addEventListener(
            'click',
            event => {

                const button =
                    event.target.closest(
                        '[data-filter-reset]'
                    );


                if (!button) {
                    return;
                }


                event.preventDefault();

                reset();

            }
        );

    }


    /* =====================================================
       INIT
    ===================================================== */

    function init() {

        bindEvents();

        updateCategoryUI();

        apply();

    }


    /* =====================================================
       GLOBAL API
    ================================================= */

    window.VelocityFilters = {

        state,

        init,

        apply,

        reset,

        setSearch,

        setCategory,

        setPrice,

        setSort,

        getFilteredProducts,

        updateCategoryUI,

        updateResultsCount

    };


    /* =====================================================
       READY
    ===================================================== */

    if (
        document.readyState === 'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            init,
            { once: true }
        );

    } else {

        init();

    }

})();
