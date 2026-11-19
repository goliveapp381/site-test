'use strict';

/* =========================================================
   VELOCITY STORE
   PRODUCTS DATABASE + PRODUCT RENDERING
   Safe + Dynamic + Image Ready
========================================================= */

(function () {

    /*
    ========================================================
    PRODUCT DATABASE
    ========================================================
    */

    const products = [

        {
            id: 'velocity-001',
            name: 'Velocity X1 Sneakers',
            category: 'shoes',
            categoryName: 'Sneakers',
            price: 899,
            oldPrice: 1099,
            currency: 'DH',
            rating: 4.9,
            reviews: 128,
            badge: 'الأكثر مبيعاً',

            /*
             * Local image candidate.
             * Future image resolver can replace this
             * automatically when a real local image exists.
             */
            image: 'assets/images/products/product-1.jpg',

            /*
             * Optional remote fallback.
             * Add your web image URL here later if needed.
             */
            webImage: '',

            colors: ['Black', 'White'],
            sizes: ['40', '41', '42', '43', '44'],
            stock: 15,
            featured: true,
            newest: true
        },

        {
            id: 'velocity-002',
            name: 'Urban Shadow Jacket',
            category: 'fashion',
            categoryName: 'Fashion',
            price: 749,
            oldPrice: 899,
            currency: 'DH',
            rating: 4.8,
            reviews: 94,
            badge: 'جديد',

            image: 'assets/images/products/product-2.jpg',
            webImage: '',

            colors: ['Black', 'Gray'],
            sizes: ['S', 'M', 'L', 'XL'],
            stock: 8,
            featured: true,
            newest: true
        },

        {
            id: 'velocity-003',
            name: 'Aero Smart Watch',
            category: 'tech',
            categoryName: 'Technology',
            price: 1299,
            oldPrice: 1599,
            currency: 'DH',
            rating: 4.7,
            reviews: 211,
            badge: 'خصم',

            image: 'assets/images/products/product-3.jpg',
            webImage: '',

            colors: ['Black', 'Silver'],
            sizes: [],
            stock: 21,
            featured: true,
            newest: false
        },

        {
            id: 'velocity-004',
            name: 'Premium Leather Bag',
            category: 'accessories',
            categoryName: 'Accessories',
            price: 599,
            oldPrice: 699,
            currency: 'DH',
            rating: 4.8,
            reviews: 76,
            badge: 'مميز',

            image: 'assets/images/products/product-4.jpg',
            webImage: '',

            colors: ['Black', 'Brown'],
            sizes: [],
            stock: 12,
            featured: true,
            newest: false
        },

        {
            id: 'velocity-005',
            name: 'Essential Oversized Hoodie',
            category: 'fashion',
            categoryName: 'Fashion',
            price: 449,
            oldPrice: 549,
            currency: 'DH',
            rating: 4.6,
            reviews: 63,
            badge: 'جديد',

            image: 'assets/images/products/product-5.jpg',
            webImage: '',

            colors: ['Black', 'Cream', 'Gray'],
            sizes: ['S', 'M', 'L', 'XL'],
            stock: 30,
            featured: true,
            newest: true
        },

        {
            id: 'velocity-006',
            name: 'Velocity Runner Pro',
            category: 'shoes',
            categoryName: 'Sneakers',
            price: 799,
            oldPrice: 999,
            currency: 'DH',
            rating: 4.9,
            reviews: 154,
            badge: 'ترند',

            image: 'assets/images/products/product-6.jpg',
            webImage: '',

            colors: ['White', 'Black'],
            sizes: ['40', '41', '42', '43', '44'],
            stock: 17,
            featured: true,
            newest: true
        },

        {
            id: 'velocity-007',
            name: 'Wireless Pro Headphones',
            category: 'tech',
            categoryName: 'Technology',
            price: 999,
            oldPrice: 1199,
            currency: 'DH',
            rating: 4.8,
            reviews: 187,
            badge: 'الأكثر طلباً',

            image: 'assets/images/products/product-7.jpg',
            webImage: '',

            colors: ['Black', 'White'],
            sizes: [],
            stock: 25,
            featured: true,
            newest: false
        },

        {
            id: 'velocity-008',
            name: 'Minimal Crossbody Bag',
            category: 'accessories',
            categoryName: 'Accessories',
            price: 399,
            oldPrice: 499,
            currency: 'DH',
            rating: 4.5,
            reviews: 52,
            badge: '',

            image: 'assets/images/products/product-8.jpg',
            webImage: '',

            colors: ['Black', 'Brown'],
            sizes: [],
            stock: 19,
            featured: true,
            newest: false
        }

    ];


    /* =====================================================
       FALLBACK IMAGE
    ===================================================== */

    const FALLBACK_IMAGE =
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
                    fill="#f3f4f6"
                />

                <circle
                    cx="400"
                    cy="330"
                    r="95"
                    fill="#d1d5db"
                />

                <path
                    d="M190 650
                       C220 500 300 450 400 450
                       C500 450 580 500 610 650
                       Z"
                    fill="#d1d5db"
                />

                <text
                    x="400"
                    y="735"
                    text-anchor="middle"
                    font-family="Arial, sans-serif"
                    font-size="34"
                    fill="#6b7280"
                >
                    VELOCITY STORE
                </text>
            </svg>
        `);


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeHtml(value) {

        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    }


    /* =====================================================
       NORMALIZE SEARCH
    ===================================================== */

    function normalizeText(value) {

        return String(value ?? '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

    }


    /* =====================================================
       GET ALL PRODUCTS
    ===================================================== */

    function getProducts() {

        return products.map(
            product => ({
                ...product,

                colors: Array.isArray(product.colors)
                    ? [...product.colors]
                    : [],

                sizes: Array.isArray(product.sizes)
                    ? [...product.sizes]
                    : []

            })
        );

    }


    /* =====================================================
       GET PRODUCT BY ID
    ===================================================== */

    function getProductById(productId) {

        const id =
            String(productId ?? '').trim();

        return products.find(
            product =>
                product.id === id
        ) || null;

    }


    /* =====================================================
       GET PRODUCT IMAGE
    ===================================================== */

    function getProductImage(product) {

        if (!product) {
            return FALLBACK_IMAGE;
        }


        /*
         * If another image resolver exists,
         * allow it to control the final image.
         */

        if (
            typeof product.resolvedImage === 'string' &&
            product.resolvedImage.trim()
        ) {

            return product.resolvedImage.trim();

        }


        /*
         * Local image has priority.
         */

        if (
            typeof product.localImage === 'string' &&
            product.localImage.trim()
        ) {

            return product.localImage.trim();

        }


        /*
         * Existing image field.
         */

        if (
            typeof product.image === 'string' &&
            product.image.trim()
        ) {

            return product.image.trim();

        }


        /*
         * Remote/web fallback.
         */

        if (
            typeof product.webImage === 'string' &&
            product.webImage.trim()
        ) {

            return product.webImage.trim();

        }


        if (
            typeof product.remoteImage === 'string' &&
            product.remoteImage.trim()
        ) {

            return product.remoteImage.trim();

        }


        return FALLBACK_IMAGE;

    }


    /* =====================================================
       IMAGE FALLBACK ATTRIBUTE
    ===================================================== */

    function getImageFallbackAttribute() {

        return `
            onerror="
                this.onerror=null;
                this.src='${FALLBACK_IMAGE}';
                this.classList.add('image-error');
            "
        `;

    }


    /* =====================================================
       FORMAT PRICE
    ===================================================== */

    function formatPrice(
        price,
        currency = 'DH'
    ) {

        const numericPrice =
            Number(price);

        if (!Number.isFinite(numericPrice)) {

            return `0 ${escapeHtml(currency)}`;

        }

        return `${numericPrice.toLocaleString('fr-FR')} ${escapeHtml(currency)}`;

    }


    /* =====================================================
       STAR RATING
    ===================================================== */

    function renderStars(rating) {

        const numericRating =
            Number(rating);

        const rounded =
            Math.max(
                0,
                Math.min(
                    5,
                    Math.round(
                        Number.isFinite(numericRating)
                            ? numericRating
                            : 0
                    )
                )
            );


        let stars = '';


        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            stars +=
                i <= rounded
                    ? '<span class="star active">★</span>'
                    : '<span class="star">☆</span>';

        }


        return stars;

    }


    /* =====================================================
       GET DISCOUNT
    ===================================================== */

    function getDiscount(product) {

        if (!product) {
            return 0;
        }

        const price =
            Number(product.price);

        const oldPrice =
            Number(product.oldPrice);


        if (
            !Number.isFinite(price) ||
            !Number.isFinite(oldPrice) ||
            oldPrice <= 0 ||
            price >= oldPrice
        ) {

            return 0;

        }


        return Math.round(
            (
                (oldPrice - price) /
                oldPrice
            ) * 100
        );

    }


    /* =====================================================
       PRODUCT CARD
    ===================================================== */

    function createProductCard(product) {

        if (!product) {
            return '';
        }


        const productId =
            escapeHtml(product.id);

        const productName =
            escapeHtml(product.name);

        const category =
            escapeHtml(product.category);

        const categoryName =
            escapeHtml(product.categoryName);

        const badge =
            escapeHtml(product.badge);

        const image =
            escapeHtml(
                getProductImage(product)
            );

        const discount =
            getDiscount(product);


        /*
         * Wishlist state
         */

        const isFavorite =
            window.VelocityWishlist &&
            typeof window.VelocityWishlist.has === 'function'
                ? window.VelocityWishlist.has(
                    product.id
                )
                : false;


        return `
            <article
                class="product-card"
                data-product-id="${productId}"
                data-category="${category}"
            >

                <div class="product-image-wrapper">

                    ${
                        product.badge
                            ? `
                                <span class="product-badge">
                                    ${badge}
                                </span>
                            `
                            : ''
                    }


                    ${
                        discount > 0
                            ? `
                                <span class="discount-badge">
                                    -${discount}%
                                </span>
                            `
                            : ''
                    }


                    <button
                        class="wishlist-button ${
                            isFavorite
                                ? 'active'
                                : ''
                        }"
                        type="button"
                        data-wishlist-id="${productId}"
                        aria-label="${
                            isFavorite
                                ? 'إزالة من المفضلة'
                                : 'إضافة إلى المفضلة'
                        }"
                        aria-pressed="${isFavorite}"
                    >
                        ${
                            isFavorite
                                ? '♥'
                                : '♡'
                        }
                    </button>


                    <img
                        class="product-image"
                        src="${image}"
                        alt="${productName}"
                        loading="lazy"
                        decoding="async"
                        ${getImageFallbackAttribute()}
                    />


                    <div class="product-overlay">

                        <button
                            class="quick-view-button"
                            type="button"
                            data-product-id="${productId}"
                        >
                            عرض سريع
                        </button>


                        <button
                            class="add-cart-button"
                            type="button"
                            data-cart-id="${productId}"
                        >
                            أضف للسلة
                        </button>

                    </div>

                </div>


                <div class="product-info">

                    <div class="product-category">
                        ${categoryName}
                    </div>


                    <h3 class="product-name">
                        ${productName}
                    </h3>


                    <div class="product-rating">

                        <div class="stars">
                            ${renderStars(product.rating)}
                        </div>


                        <span class="rating-value">
                            ${escapeHtml(product.rating)}
                        </span>


                        <span class="review-count">
                            (${escapeHtml(product.reviews)})
                        </span>

                    </div>


                    <div class="product-bottom">

                        <div class="product-price-wrapper">

                            <span class="product-price">
                                ${formatPrice(
                                    product.price,
                                    product.currency
                                )}
                            </span>


                            ${
                                product.oldPrice
                                    ? `
                                        <span class="product-old-price">
                                            ${formatPrice(
                                                product.oldPrice,
                                                product.currency
                                            )}
                                        </span>
                                    `
                                    : ''
                            }

                        </div>

                    </div>

                </div>

            </article>
        `;

    }


    /* =====================================================
       RENDER EMPTY STATE
    ===================================================== */

    function renderEmptyState(element) {

        element.innerHTML = `
            <div class="products-empty">

                <div class="products-empty-icon">
                    🛍️
                </div>

                <h3>
                    لا توجد منتجات
                </h3>

                <p>
                    جرب تغيير الفلاتر أو البحث عن منتج آخر.
                </p>

            </div>
        `;

    }


    /* =====================================================
       RENDER PRODUCTS
    ===================================================== */

    function renderProducts(
        container,
        productsToRender = products
    ) {

        const element =
            typeof container === 'string'
                ? document.querySelector(container)
                : container;


        if (!element) {

            console.warn(
                '[Velocity Store] Products container not found.'
            );

            return;

        }


        const safeProducts =
            Array.isArray(productsToRender)
                ? productsToRender.filter(Boolean)
                : [];


        if (!safeProducts.length) {

            renderEmptyState(
                element
            );


            element.dispatchEvent(
                new CustomEvent(
                    'velocity:products-rendered',
                    {
                        detail: {
                            products: []
                        }
                    }
                )
            );


            if (
                window.VelocityWishlist &&
                typeof window.VelocityWishlist.updateUI === 'function'
            ) {

                window.VelocityWishlist.updateUI();

            }

            return;

        }


        element.innerHTML =
            safeProducts
                .map(createProductCard)
                .join('');


        /*
         * Re-sync wishlist after dynamic rendering.
         */

        if (
            window.VelocityWishlist &&
            typeof window.VelocityWishlist.updateUI === 'function'
        ) {

            window.VelocityWishlist.updateUI();

        }


        element.dispatchEvent(
            new CustomEvent(
                'velocity:products-rendered',
                {
                    detail: {
                        products: safeProducts
                    }
                }
            )
        );

    }


    /* =====================================================
       FEATURED PRODUCTS
    ===================================================== */

    function getFeaturedProducts() {

        return products.filter(
            product =>
                product.featured === true
        );

    }


    /* =====================================================
       CATEGORY PRODUCTS
    ===================================================== */

    function getProductsByCategory(
        category
    ) {

        const normalizedCategory =
            normalizeText(category);


        if (
            !normalizedCategory ||
            normalizedCategory === 'all'
        ) {

            return getProducts();

        }


        return products.filter(
            product =>
                normalizeText(
                    product.category
                ) === normalizedCategory
        );

    }


    /* =====================================================
       SEARCH PRODUCTS
    ===================================================== */

    function searchProducts(
        query
    ) {

        const value =
            normalizeText(query);


        if (!value) {

            return getProducts();

        }


        return products.filter(
            product => {

                const name =
                    normalizeText(
                        product.name
                    );

                const categoryName =
                    normalizeText(
                        product.categoryName
                    );

                const category =
                    normalizeText(
                        product.category
                    );

                const id =
                    normalizeText(
                        product.id
                    );


                return (
                    name.includes(value) ||
                    categoryName.includes(value) ||
                    category.includes(value) ||
                    id.includes(value)
                );

            }
        );

    }


    /* =====================================================
       GET CATEGORIES
    ===================================================== */

    function getCategories() {

        return [
            ...new Set(
                products
                    .map(
                        product =>
                            product.category
                    )
                    .filter(Boolean)
            )
        ];

    }


    /* =====================================================
       GET IMAGE FALLBACK
    ===================================================== */

    function getFallbackImage() {

        return FALLBACK_IMAGE;

    }


    /* =====================================================
       GLOBAL API
    ===================================================== */

    window.VelocityProducts = {

        getProducts,

        getProductById,

        getFeaturedProducts,

        getProductsByCategory,

        getCategories,

        searchProducts,

        renderProducts,

        createProductCard,

        formatPrice,

        renderStars,

        getProductImage,

        getFallbackImage

    };


    /* =====================================================
       READY
    ===================================================== */

    document.dispatchEvent(
        new CustomEvent(
            'velocity:products-ready'
        )
    );

})();
