'use strict';

/* =========================================================
   VELOCITY STORE
   PRODUCTS DATABASE + PRODUCT RENDERING
   ---------------------------------------------------------
   IMAGE SYSTEM

   - Products use logical image IDs
   - image-manifest.json resolves IDs to real files
   - Local images have priority
   - Remote image can be used as fallback
   - Final fallback is generated SVG
   - Ready for future Template Editor
========================================================= */

(function () {

    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const IMAGE_MANIFEST_URL =
        'assets/images/image-manifest.json';


    /* =====================================================
       PRODUCT DATABASE
       -----------------------------------------------------
       IMPORTANT:
       imageId is the stable identifier.

       The actual filename is NOT stored here.

       This means later the Template Editor can change
       the image without touching product structure.
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

            imageId: 'image-1',
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

            imageId: 'image-2',
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

            imageId: 'image-3',
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

            imageId: 'image-4',
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

            imageId: 'image-5',
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

            imageId: 'image-6',
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

            imageId: 'image-7',
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

            imageId: 'image-8',
            webImage: '',

            colors: ['Black', 'Brown'],
            sizes: [],
            stock: 19,
            featured: true,
            newest: false
        }

    ];


    /* =====================================================
       IMAGE MANIFEST
    ===================================================== */

    let imageManifest = {
        version: 1,
        products: {}
    };


    let imageManifestLoaded = false;

    let imageManifestPromise = null;


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

                <defs>

                    <linearGradient
                        id="bg"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                    >

                        <stop
                            offset="0%"
                            stop-color="#111116"
                        />

                        <stop
                            offset="100%"
                            stop-color="#24242b"
                        />

                    </linearGradient>

                </defs>


                <rect
                    width="800"
                    height="800"
                    fill="url(#bg)"
                />


                <circle
                    cx="400"
                    cy="320"
                    r="110"
                    fill="#303038"
                />


                <path
                    d="
                        M180 670
                        C210 500
                        300 445
                        400 445
                        C500 445
                        590 500
                        620 670
                        Z
                    "
                    fill="#303038"
                />


                <text
                    x="400"
                    y="735"
                    text-anchor="middle"
                    font-family="Arial, sans-serif"
                    font-size="34"
                    font-weight="700"
                    letter-spacing="5"
                    fill="#caff00"
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
       NORMALIZE MANIFEST
    ===================================================== */

    function normalizeManifest(data) {

        if (
            !data ||
            typeof data !== 'object'
        ) {

            return {
                version: 1,
                products: {}
            };

        }


        const productsMap =
            data.products &&
            typeof data.products === 'object'
                ? data.products
                : {};


        const normalized = {};


        Object.keys(productsMap)
            .forEach(key => {

                const value =
                    productsMap[key];


                if (
                    typeof value === 'string' &&
                    value.trim()
                ) {

                    normalized[key] =
                        value.trim();

                }

            });


        return {

            version:
                Number(data.version) || 1,

            products:
                normalized

        };

    }


    /* =====================================================
       LOAD IMAGE MANIFEST
    ===================================================== */

    function loadImageManifest() {

        if (imageManifestPromise) {

            return imageManifestPromise;

        }


        imageManifestPromise =
            fetch(
                IMAGE_MANIFEST_URL,
                {
                    cache: 'no-cache'
                }
            )
                .then(response => {

                    if (!response.ok) {

                        throw new Error(
                            `Image manifest HTTP ${response.status}`
                        );

                    }

                    return response.json();

                })
                .then(data => {

                    imageManifest =
                        normalizeManifest(data);

                    imageManifestLoaded =
                        true;

                    console.log(
                        '[Velocity Store] Image manifest loaded:',
                        imageManifest
                    );


                    /*
                     * Notify other modules.
                     */

                    document.dispatchEvent(
                        new CustomEvent(
                            'velocity:image-manifest-ready',
                            {
                                detail: {
                                    manifest:
                                        imageManifest
                                }
                            }
                        )
                    );


                    return imageManifest;

                })
                .catch(error => {

                    imageManifestLoaded =
                        false;

                    imageManifest = {
                        version: 1,
                        products: {}
                    };


                    console.warn(
                        '[Velocity Store] Image manifest could not be loaded:',
                        error
                    );


                    return imageManifest;

                });


        return imageManifestPromise;

    }


    /* =====================================================
       GET MANIFEST IMAGE
    ===================================================== */

    function getManifestImage(imageId) {

        if (
            !imageId ||
            !imageManifest ||
            !imageManifest.products
        ) {

            return '';

        }


        const value =
            imageManifest.products[imageId];


        if (
            typeof value !== 'string' ||
            !value.trim()
        ) {

            return '';

        }


        return value.trim();

    }


    /* =====================================================
       BUILD IMAGE URL
    ===================================================== */

    function buildImageUrl(value) {

        if (
            typeof value !== 'string'
        ) {

            return '';

        }


        const image =
            value.trim();


        if (!image) {
            return '';
        }


        /*
         * Absolute URLs.
         */

        if (
            /^https?:\/\//i.test(image)
        ) {

            return image;

        }


        /*
         * Data URLs.
         */

        if (
            image.startsWith('data:image/')
        ) {

            return image;

        }


        /*
         * Already rooted path.
         */

        if (
            image.startsWith('/')
        ) {

            return image;

        }


        /*
         * Already starts from assets.
         */

        if (
            image.startsWith('assets/')
        ) {

            return image;

        }


        /*
         * Manifest paths are relative to
         * assets/images/.
         */

        return `assets/images/${image}`;

    }


    /* =====================================================
       GET ALL PRODUCTS
    ===================================================== */

    function getProducts() {

        return products.map(product => ({

            ...product,

            colors:
                Array.isArray(product.colors)
                    ? [...product.colors]
                    : [],

            sizes:
                Array.isArray(product.sizes)
                    ? [...product.sizes]
                    : []

        }));

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
         * 1. resolvedImage
         *
         * Future editor can directly inject
         * a resolved image here.
         */

        if (
            typeof product.resolvedImage === 'string' &&
            product.resolvedImage.trim()
        ) {

            return buildImageUrl(
                product.resolvedImage
            );

        }


        /*
         * 2. localImage
         */

        if (
            typeof product.localImage === 'string' &&
            product.localImage.trim()
        ) {

            return buildImageUrl(
                product.localImage
            );

        }


        /*
         * 3. imageId
         *
         * This is the main system now.
         */

        if (
            product.imageId
        ) {

            const manifestImage =
                getManifestImage(
                    product.imageId
                );


            if (manifestImage) {

                return buildImageUrl(
                    manifestImage
                );

            }

        }


        /*
         * 4. Legacy image field.
         */

        if (
            typeof product.image === 'string' &&
            product.image.trim()
        ) {

            return buildImageUrl(
                product.image
            );

        }


        /*
         * 5. Web image.
         */

        if (
            typeof product.webImage === 'string' &&
            product.webImage.trim()
        ) {

            return buildImageUrl(
                product.webImage
            );

        }


        /*
         * 6. Remote image.
         */

        if (
            typeof product.remoteImage === 'string' &&
            product.remoteImage.trim()
        ) {

            return buildImageUrl(
                product.remoteImage
            );

        }


        return FALLBACK_IMAGE;

    }


    /* =====================================================
       GET PRODUCT IMAGE CANDIDATES
       -----------------------------------------------------
       Used by app.js to perform:
       LOCAL → WEB → FALLBACK
    ===================================================== */

    function getProductImageCandidates(product) {

        if (!product) {

            return [
                FALLBACK_IMAGE
            ];

        }


        const candidates = [];


        function addCandidate(value) {

            const url =
                buildImageUrl(value);


            if (
                !url
            ) {

                return;

            }


            if (
                !candidates.includes(url)
            ) {

                candidates.push(url);

            }

        }


        /*
         * Local / resolved image.
         */

        if (
            product.resolvedImage
        ) {

            addCandidate(
                product.resolvedImage
            );

        }


        if (
            product.localImage
        ) {

            addCandidate(
                product.localImage
            );

        }


        /*
         * Manifest image.
         */

        if (
            product.imageId
        ) {

            const manifestImage =
                getManifestImage(
                    product.imageId
                );


            if (manifestImage) {

                addCandidate(
                    manifestImage
                );

            }

        }


        /*
         * Legacy image.
         */

        if (
            product.image
        ) {

            addCandidate(
                product.image
            );

        }


        /*
         * Web fallback.
         */

        if (
            product.webImage
        ) {

            addCandidate(
                product.webImage
            );

        }


        if (
            product.remoteImage
        ) {

            addCandidate(
                product.remoteImage
            );

        }


        /*
         * Final fallback.
         */

        addCandidate(
            FALLBACK_IMAGE
        );


        return candidates;

    }


    /* =====================================================
       IMAGE FALLBACK ATTRIBUTE
       -----------------------------------------------------
       LOCAL IMAGE FAILS:
       → WEB IMAGE
       → FALLBACK
    ===================================================== */

    function getImageFallbackAttribute(product) {

        const candidates =
            getProductImageCandidates(
                product
            );


        const fallbackCandidates =
            candidates.slice(1);


        const encoded =
            JSON.stringify(
                fallbackCandidates
            )
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;');


        return `
            data-image-candidates="${encoded}"
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


        if (
            !Number.isFinite(
                numericPrice
            )
        ) {

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
                        Number.isFinite(
                            numericRating
                        )
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
                ? document.querySelector(
                    container
                )
                : container;


        if (!element) {

            console.warn(
                '[Velocity Store] Products container not found.'
            );

            return;

        }


        const safeProducts =
            Array.isArray(
                productsToRender
            )
                ? productsToRender.filter(Boolean)
                : [];


        if (
            !safeProducts.length
        ) {

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


            return;

        }


        element.innerHTML =
            safeProducts
                .map(
                    createProductCard
                )
                .join('');


        if (
            window.VelocityWishlist &&
            typeof window.VelocityWishlist.updateUI ===
            'function'
        ) {

            window.VelocityWishlist.updateUI();

        }


        element.dispatchEvent(
            new CustomEvent(
                'velocity:products-rendered',
                {
                    detail: {
                        products:
                            safeProducts
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
       GET FALLBACK IMAGE
    ===================================================== */

    function getFallbackImage() {

        return FALLBACK_IMAGE;

    }


    /* =====================================================
       GET IMAGE MANIFEST
    ===================================================== */

    function getImageManifest() {

        return {
            version:
                imageManifest.version,

            products:
                {
                    ...imageManifest.products
                }
        };

    }


    /* =====================================================
       IS MANIFEST LOADED
    ===================================================== */

    function isImageManifestLoaded() {

        return imageManifestLoaded;

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

        getProductImageCandidates,

        getFallbackImage,

        getImageManifest,

        isImageManifestLoaded,

        loadImageManifest

    };


    /* =====================================================
       START IMAGE MANIFEST LOADING
    ===================================================== */

    loadImageManifest();


    /* =====================================================
       READY
    ===================================================== */

    document.dispatchEvent(
        new CustomEvent(
            'velocity:products-ready'
        )
    );

})();
