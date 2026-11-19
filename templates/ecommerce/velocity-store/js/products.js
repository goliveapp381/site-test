'use strict';

/* =========================================================
   VELOCITY STORE
   PRODUCTS DATABASE + PRODUCT RENDERING
   ---------------------------------------------------------
   - Safe product database
   - Local image support
   - Web image fallback
   - Manifest support
   - Graceful image fallback
   - Wishlist integration
   - Dynamic rendering
========================================================= */

(function () {

    /* =====================================================
       CONFIG
    ===================================================== */

    const IMAGE_MANIFEST_URL =
        'assets/images/image-manifest.json';

    let imageManifest = {};
    let manifestLoaded = false;
    let manifestPromise = null;


    /* =====================================================
       PRODUCT DATABASE
    ===================================================== */

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
             * يمكن تغييرها لاحقاً إذا بغيتي
             * ولكن ماشي ضروري.
             */
            image: '',

            /*
             * حط هنا رابط الصورة من الويب إذا ما كانتش
             * صورة محلية.
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

            image: '',
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

            image: '',
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

            image: '',
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

            image: '',
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

            image: '',
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

            image: '',
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

            image: '',
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
                    fill="#111111"
                />

                <circle
                    cx="400"
                    cy="320"
                    r="100"
                    fill="#252525"
                />

                <path
                    d="M170 650
                       C210 490 300 440 400 440
                       C500 440 590 490 630 650
                       Z"
                    fill="#252525"
                />

                <text
                    x="400"
                    y="735"
                    text-anchor="middle"
                    font-family="Arial, sans-serif"
                    font-size="34"
                    font-weight="700"
                    fill="#ffffff"
                >
                    VELOCITY
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
       NORMALIZE
    ===================================================== */

    function normalizeText(value) {

        return String(value ?? '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

    }


    /* =====================================================
       LOAD IMAGE MANIFEST
       -----------------------------------------------------
       إذا كان الملف موجوداً:
       assets/images/image-manifest.json

       مثال:

       {
         "velocity-001": "assets/images/sneaker.jpg",
         "velocity-002": "assets/images/jacket.webp"
       }

       إذا الملف غير موجود، ماشي مشكل.
    ===================================================== */

    async function loadImageManifest() {

        if (manifestLoaded) {
            return imageManifest;
        }


        if (manifestPromise) {
            return manifestPromise;
        }


        manifestPromise =
            fetch(
                IMAGE_MANIFEST_URL,
                {
                    cache: 'no-cache'
                }
            )
            .then(response => {

                if (!response.ok) {
                    throw new Error(
                        `Manifest HTTP ${response.status}`
                    );
                }

                return response.json();

            })
            .then(data => {

                if (
                    data &&
                    typeof data === 'object' &&
                    !Array.isArray(data)
                ) {

                    imageManifest = data;

                } else {

                    imageManifest = {};

                }


                manifestLoaded = true;

                return imageManifest;

            })
            .catch(() => {

                /*
                 * Manifest اختياري.
                 * ما نوقفوش التطبيق إذا ما كانش.
                 */

                imageManifest = {};
                manifestLoaded = true;

                return imageManifest;

            });


        return manifestPromise;

    }


    /* =====================================================
       IMAGE PATH
    ===================================================== */

    function normalizeImagePath(path) {

        if (
            typeof path !== 'string' ||
            !path.trim()
        ) {

            return '';

        }


        const value =
            path.trim();


        if (
            /^https?:\/\//i.test(value) ||
            value.startsWith('data:image/') ||
            value.startsWith('/') ||
            value.startsWith('./') ||
            value.startsWith('../')
        ) {

            return value;

        }


        if (
            value.startsWith('assets/')
        ) {

            return value;

        }


        return `assets/images/${value}`;

    }


    /* =====================================================
       GET LOCAL IMAGE FROM MANIFEST
    ===================================================== */

    function getManifestImage(product) {

        if (!product) {
            return '';
        }


        const value =
            imageManifest[product.id];


        if (
            typeof value === 'string' &&
            value.trim()
        ) {

            return normalizeImagePath(value);

        }


        return '';

    }


    /* =====================================================
       GET PRODUCT IMAGE
    ===================================================== */

    function getProductImage(product) {

        if (!product) {
            return FALLBACK_IMAGE;
        }


        /*
         * 1. Explicit resolved image
         */

        if (
            typeof product.resolvedImage === 'string' &&
            product.resolvedImage.trim()
        ) {

            return product.resolvedImage.trim();

        }


        /*
         * 2. Manifest image
         */

        const manifestImage =
            getManifestImage(product);


        if (manifestImage) {

            return manifestImage;

        }


        /*
         * 3. Explicit local image
         */

        if (
            typeof product.localImage === 'string' &&
            product.localImage.trim()
        ) {

            return normalizeImagePath(
                product.localImage
            );

        }


        /*
         * 4. Explicit image
         *
         * مهم:
         * ما بقيناش نحطو product-1.jpg
         * تلقائياً.
         *
         * هادي هي اللي كانت كتسبب 404.
         */

        if (
            typeof product.image === 'string' &&
            product.image.trim()
        ) {

            return normalizeImagePath(
                product.image
            );

        }


        /*
         * 5. Web image
         */

        if (
            typeof product.webImage === 'string' &&
            product.webImage.trim()
        ) {

            return product.webImage.trim();

        }


        /*
         * 6. Remote image
         */

        if (
            typeof product.remoteImage === 'string' &&
            product.remoteImage.trim()
        ) {

            return product.remoteImage.trim();

        }


        /*
         * 7. Fallback
         */

        return FALLBACK_IMAGE;

    }


    /* =====================================================
       IMAGE FALLBACK ATTRIBUTE
       -----------------------------------------------------
       Local image -> Web image -> SVG fallback
    ===================================================== */

    function getImageFallbackAttribute(product) {

        const webImage =
            product &&
            typeof product.webImage === 'string'
                ? product.webImage.trim()
                : '';


        const remoteImage =
            product &&
            typeof product.remoteImage === 'string'
                ? product.remoteImage.trim()
                : '';


        const fallback =
            webImage ||
            remoteImage ||
            FALLBACK_IMAGE;


        return `
            data-fallback="${escapeHtml(fallback)}"
            onerror="
                if (
                    this.dataset.fallbackUsed !== 'true' &&
                    this.dataset.fallback
                ) {
                    this.dataset.fallbackUsed = 'true';
                    this.src = this.dataset.fallback;
                } else {
                    this.onerror = null;
                    this.src = '${FALLBACK_IMAGE}';
                }
            "
        `;

    }


    /* =====================================================
       GET PRODUCTS
    ===================================================== */

    function getProducts() {

        return products.map(
            product => ({
                ...product,

                colors:
                    Array.isArray(product.colors)
                        ? [...product.colors]
                        : [],

                sizes:
                    Array.isArray(product.sizes)
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
       FORMAT PRICE
    ===================================================== */

    function formatPrice(
        price,
        currency = 'DH'
    ) {

        const numericPrice =
            Number(price);


        if (
            !Number.isFinite(numericPrice)
        ) {

            return `0 ${escapeHtml(currency)}`;

        }


        return `
            ${numericPrice.toLocaleString('fr-FR')}
            ${escapeHtml(currency)}
        `.replace(/\s+/g, ' ').trim();

    }


    /* =====================================================
       STARS
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
       DISCOUNT
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
       CREATE PRODUCT CARD
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
                data-reveal
                data-tilt
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
                            isFavorite ? 'active' : ''
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
                        ${getImageFallbackAttribute(product)}
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
       EMPTY STATE
    ===================================================== */

    function renderEmptyState(element) {

        if (!element) {
            return;
        }


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

            renderEmptyState(element);


            element.dispatchEvent(
                new CustomEvent(
                    'velocity:products-rendered',
                    {
                        bubbles: true,
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
                    bubbles: true,
                    detail: {
                        products: safeProducts
                    }
                }
            )
        );

    }


    /* =====================================================
       FEATURED
    ===================================================== */

    function getFeaturedProducts() {

        return getProducts()
            .filter(
                product =>
                    product.featured === true
            );

    }


    /* =====================================================
       CATEGORY
    ===================================================== */

    function getProductsByCategory(category) {

        const normalizedCategory =
            normalizeText(category);


        if (
            !normalizedCategory ||
            normalizedCategory === 'all'
        ) {

            return getProducts();

        }


        return getProducts()
            .filter(
                product =>
                    normalizeText(
                        product.category
                    ) === normalizedCategory
            );

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    function searchProducts(query) {

        const value =
            normalizeText(query);


        if (!value) {
            return getProducts();
        }


        return getProducts()
            .filter(product => {

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

            });

    }


    /* =====================================================
       CATEGORIES
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
       FALLBACK
    ===================================================== */

    function getFallbackImage() {

        return FALLBACK_IMAGE;

    }


    /* =====================================================
       PUBLIC API
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

        getFallbackImage,

        loadImageManifest

    };


    /* =====================================================
       LOAD MANIFEST
    ===================================================== */

    loadImageManifest()
        .then(() => {

            document.dispatchEvent(
                new CustomEvent(
                    'velocity:products-images-ready'
                )
            );

        });


    /* =====================================================
       READY
    ===================================================== */

    document.dispatchEvent(
        new CustomEvent(
            'velocity:products-ready'
        )
    );

})();
