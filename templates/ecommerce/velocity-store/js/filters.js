'use strict';

/* =========================================================
   VELOCITY STORE
   SEARCH / FILTER / SORT SYSTEM
   ---------------------------------------------------------
   - Search
   - Category filtering
   - Price filtering
   - Sorting
   - Empty state
   - Result count
   - Dynamic product rendering
   - Safe initialization
========================================================= */

(function () {

    const state = {

        query: '',

        category: 'all',

        minPrice: 0,

        maxPrice: Infinity,

        sort: 'featured'

    };


    let initialized = false;


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

            clothes: 'fashion',

            apparel: 'fashion',


            shoes: 'shoes',

            sneaker: 'shoes',

            sneakers: 'shoes',

            footwear: 'shoes',


            tech: 'tech',

            technology: 'tech',

            electronics: 'tech',

            electronic: 'tech',


            accessories: 'accessories',

            accessory: 'accessories',

            bags: 'accessories',

            bag: 'accessories'

        };


        return (
            aliases[value] ||
            value ||
            'all'
        );

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
       NORMALIZE PRICE
    ===================================================== */

    function normalizePrice(value, fallback) {

        const number =
            Number(value);


        if (
            Number.isFinite(number)
        ) {

            return number;

        }


        return fallback;

    }


    /* =====================================================
       GET ALL PRODUCTS
    ===================================================== */

    function getAllProducts() {

        if (
            !window.VelocityProducts ||
            typeof window.VelocityProducts.getProducts !==
                'function'
        ) {

            return [];

        }


        const products =
            window.VelocityProducts
                .getProducts();


        return Array.isArray(products)
            ? [...products]
            : [];

    }


    /* =====================================================
       SEARCH MATCH
    ===================================================== */

    function productMatchesSearch(
        product,
        query
    ) {

        if (!query) {

            return true;

        }


        const searchableFields = [

            product.name,

            product.categoryName,

            product.category,

            product.description,

            product.brand,

            product.tags,

            product.sku

        ];


        const searchableText =
            searchableFields
                .map(value => {

                    if (
                        Array.isArray(value)
                    ) {

                        return value.join(' ');

                    }

                    return String(
                        value || ''
                    );

                })
                .join(' ')
                .toLowerCase();


        return searchableText.includes(
            query
        );

    }


    /* =====================================================
       CATEGORY MATCH
    ===================================================== */

    function productMatchesCategory(
        product,
        category
    ) {

        if (
            !category ||
            category === 'all'
        ) {

            return true;

        }


        const productCategory =
            normalizeCategory(
                product.category
            );


        return (
            productCategory ===
            category
        );

    }


    /* =====================================================
       PRICE MATCH
    ===================================================== */

    function productMatchesPrice(
        product,
        minPrice,
        maxPrice
    ) {

        const price =
            Number(product.price);


        if (
            !Number.isFinite(price)
        ) {

            return false;

        }


        return (
            price >= minPrice &&
            price <= maxPrice
        );

    }


    /* =====================================================
       GET FILTERED PRODUCTS
    ===================================================== */

    function getFilteredProducts() {

        let result =
            getAllProducts();


        if (!result.length) {

            return [];

        }


        /* =================================================
           SEARCH
        ================================================= */

        const query =
            normalizeSearch(
                state.query
            );


        if (query) {

            result =
                result.filter(
                    product =>
                        productMatchesSearch(
                            product,
                            query
                        )
                );

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
                result.filter(
                    product =>
                        productMatchesCategory(
                            product,
                            category
                        )
                );

        }


        /* =================================================
           PRICE
        ================================================= */

        const minPrice =
            Math.max(
                0,
                normalizePrice(
                    state.minPrice,
                    0
                )
            );


        const maxPriceRaw =
            normalizePrice(
                state.maxPrice,
                Infinity
            );


        const maxPrice =
            maxPriceRaw >= minPrice
                ? maxPriceRaw
                : minPrice;


        result =
            result.filter(
                product =>
                    productMatchesPrice(
                        product,
                        minPrice,
                        maxPrice
                    )
            );


        /* =================================================
           SORT
        ================================================= */

        sortProducts(
            result,
            state.sort
        );


        return result;

    }


    /* =====================================================
       SORT PRODUCTS
    ===================================================== */

    function sortProducts(
        products,
        sort
    ) {

        if (
            !Array.isArray(products)
        ) {

            return;

        }


        switch (sort) {

            /* ---------------------------------------------
               PRICE LOW → HIGH
            --------------------------------------------- */

            case 'price-low':

                products.sort(
                    (a, b) =>
                        Number(a.price || 0) -
                        Number(b.price || 0)
                );

                break;


            /* ---------------------------------------------
               PRICE HIGH → LOW
            --------------------------------------------- */

            case 'price-high':

                products.sort(
                    (a, b) =>
                        Number(b.price || 0) -
                        Number(a.price || 0)
                );

                break;


            /* ---------------------------------------------
               HIGHEST RATED
            --------------------------------------------- */

            case 'rating':

                products.sort(
                    (a, b) => {

                        const ratingA =
                            Number(
                                a.rating || 0
                            );


                        const ratingB =
                            Number(
                                b.rating || 0
                            );


                        if (
                            ratingA !==
                            ratingB
                        ) {

                            return (
                                ratingB -
                                ratingA
                            );

                        }


                        return (
                            Number(
                                b.reviews || 0
                            ) -
                            Number(
                                a.reviews || 0
                            )
                        );

                    }
                );

                break;


            /* ---------------------------------------------
               NEWEST
            --------------------------------------------- */

            case 'newest':

                products.sort(
                    (a, b) => {

                        const newestA =
                            Boolean(
                                a.newest
                            );


                        const newestB =
                            Boolean(
                                b.newest
                            );


                        if (
                            newestA !==
                            newestB
                        ) {

                            return (
                                Number(
                                    newestB
                                ) -
                                Number(
                                    newestA
                                )
                            );

                        }


                        /*
                         * إذا كان عندنا createdAt
                         * نستعمله أولاً.
                         */

                        const dateA =
                            Date.parse(
                                a.createdAt ||
                                ''
                            );


                        const dateB =
                            Date.parse(
                                b.createdAt ||
                                ''
                            );


                        if (
                            Number.isFinite(
                                dateA
                            ) &&
                            Number.isFinite(
                                dateB
                            )
                        ) {

                            return (
                                dateB -
                                dateA
                            );

                        }


                        return String(
                            b.id || ''
                        ).localeCompare(
                            String(
                                a.id || ''
                            )
                        );

                    }
                );

                break;


            /* ---------------------------------------------
               FEATURED
            --------------------------------------------- */

            case 'featured':

            default:

                products.sort(
                    (a, b) => {

                        const featuredA =
                            Boolean(
                                a.featured
                            );


                        const featuredB =
                            Boolean(
                                b.featured
                            );


                        if (
                            featuredA !==
                            featuredB
                        ) {

                            return (
                                Number(
                                    featuredB
                                ) -
                                Number(
                                    featuredA
                                )
                            );

                        }


                        const ratingA =
                            Number(
                                a.rating || 0
                            );


                        const ratingB =
                            Number(
                                b.rating || 0
                            );


                        if (
                            ratingA !==
                            ratingB
                        ) {

                            return (
                                ratingB -
                                ratingA
                            );

                        }


                        return (
                            Number(
                                b.reviews || 0
                            ) -
                            Number(
                                a.reviews || 0
                            )
                        );

                    }
                );

                break;

        }

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


        if (container) {

            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts
                    .renderProducts === 'function'
            ) {

                window.VelocityProducts.renderProducts(
                    container,
                    filteredProducts
                );

            } else {

                console.warn(
                    '[Velocity Filters] Products renderer is not ready.'
                );

            }

        }


        updateResultsCount(
            filteredProducts.length
        );


        updateEmptyState(
            filteredProducts.length
        );


        updateCategoryUI();


        /*
         * بعد إعادة رسم المنتجات
         * نرجعو حالة Wishlist.
         */

        if (
            window.VelocityWishlist &&
            typeof window.VelocityWishlist
                .updateUI === 'function'
        ) {

            window.VelocityWishlist.updateUI();

        }


        /*
         * نعطي فرصة لـApp أو modules أخرى
         * باش يتعاملو مع Cards الجديدة.
         */

        document.dispatchEvent(
            new CustomEvent(
                'velocity:products-filtered',
                {
                    detail: {
                        products:
                            filteredProducts,

                        count:
                            filteredProducts.length
                    }
                }
            )
        );

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
            normalizeCategory(
                category
            );


        updateCategoryUI();

        apply();

    }


    /* =====================================================
       PRICE
    ===================================================== */

    function setPrice(
        min,
        max
    ) {

        const normalizedMin =
            normalizePrice(
                min,
                0
            );


        const normalizedMax =
            normalizePrice(
                max,
                Infinity
            );


        state.minPrice =
            Math.max(
                0,
                normalizedMin
            );


        state.maxPrice =
            normalizedMax >=
            state.minPrice
                ? normalizedMax
                : state.minPrice;


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
            allowedSorts.includes(
                sort
            )
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
            .forEach(
                button => {

                    const buttonCategory =
                        normalizeCategory(
                            button.dataset
                                .categoryFilter
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

                }
            );

    }


    /* =====================================================
       RESULT COUNT
    ===================================================== */

    function updateResultsCount(
        count
    ) {

        const safeCount =
            Math.max(
                0,
                Number(count) || 0
            );


        document
            .querySelectorAll(
                '[data-products-count]'
            )
            .forEach(
                element => {

                    element.textContent =
                        safeCount;

                }
            );

    }


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    function updateEmptyState(
        count
    ) {

        const emptyElement =
            document.querySelector(
                '#productsEmpty'
            );


        if (!emptyElement) {
            return;
        }


        const hasProducts =
            Number(count) > 0;


        emptyElement.hidden =
            hasProducts;


        emptyElement.setAttribute(
            'aria-hidden',
            hasProducts
                ? 'true'
                : 'false'
        );

    }


    /* =====================================================
       RESET
    ===================================================== */

    function reset() {

        state.query =
            '';

        state.category =
            'all';

        state.minPrice =
            0;

        state.maxPrice =
            Infinity;

        state.sort =
            'featured';


        /* ---------------------------------------------
           SEARCH INPUTS
        --------------------------------------------- */

        document
            .querySelectorAll(
                '[data-product-search]'
            )
            .forEach(
                input => {

                    input.value =
                        '';

                }
            );


        /* ---------------------------------------------
           SORT
        --------------------------------------------- */

        document
            .querySelectorAll(
                '[data-product-sort]'
            )
            .forEach(
                select => {

                    select.value =
                        'featured';

                }
            );


        updateCategoryUI();

        apply();

    }


    /* =====================================================
       CATEGORY SCROLL
    ===================================================== */

    function scrollToProducts() {

        const productsSection =
            document.querySelector(
                '#products'
            );


        if (!productsSection) {
            return;
        }


        productsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

    }


    /* =====================================================
       EVENTS
    ===================================================== */

    function bindEvents() {

        if (initialized) {
            return;
        }


        initialized = true;


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
                    button.dataset
                        .categoryFilter
                );


                /*
                 * Category card:
                 * نرجعو المستخدم للمنتجات.
                 */

                if (
                    button.classList.contains(
                        'category-card'
                    )
                ) {

                    scrollToProducts();

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

        if (
            document.body.dataset
                .velocityFiltersInitialized ===
            'true'
        ) {

            return;

        }


        document.body.dataset
            .velocityFiltersInitialized =
            'true';


        bindEvents();

        updateCategoryUI();

        apply();

    }


    /* =====================================================
       GLOBAL API
    ===================================================== */

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

        updateResultsCount,

        updateEmptyState

    };


    /* =====================================================
       READY
    ===================================================== */

    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            init,
            {
                once: true
            }
        );

    } else {

        init();

    }

})();
