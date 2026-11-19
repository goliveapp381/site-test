'use strict';

/* =========================================================
   VELOCITY STORE
   PRODUCTS DATABASE + PRODUCT RENDERING
   ---------------------------------------------------------
   IMAGE SYSTEM
   ---------------------------------------------------------
   Product ID
       ↓
   imageSlot / product ID
       ↓
   image-manifest.json
       ↓
   assets/images/products/real-image.jpg

   Supports:
   - Local image manifest
   - Remote web image
   - Fallback image
   - Future TemplateCraft Editor image replacement
========================================================= */

(function () {

    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const IMAGE_MANIFEST_URL =
        'assets/images/image-manifest.json';

    const MANIFEST_CACHE_KEY =
        'velocity-image-manifest';

    let imageManifest = null;

    let manifestPromise = null;


    /* =====================================================
       PRODUCT DATABASE
    ===================================================== */

    const products = [

        {
            id: 'velocity-001',
            imageSlot: 'velocity-001',

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
             * Legacy fallback.
             * Manifest has priority.
             */
            image: '',

            /*
             * Optional remote image.
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
            imageSlot: 'velocity-002',

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
            imageSlot: 'velocity-003',

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
            imageSlot: 'velocity-004',

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
            imageSlot: 'velocity-005',

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
            imageSlot: 'velocity-006',

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
            imageSlot: 'velocity-007',

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
            imageSlot: 'velocity-008',

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
                    fill="#111118"
                />

                <circle
                    cx="400"
                    cy="300"
                    r="90"
                    fill="#272733"
                />

                <path
                    d="M180 650
                       C210 500 300 440 400 440
                       C500 440 590 500 620 650
                       Z"
                    fill="#272733"
                />

                <text
                    x="400"
                    y="735"
                    text-anchor="middle"
                    font-family="Arial, sans-serif"
                    font-size="34"
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
       NORMALIZE TEXT
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
    ===================================================== */

    async function loadImageManifest() {

        if (imageManifest) {
            return imageManifest;
        }


        if (manifestPromise) {
            return manifestPromise;
        }


        manifestPromise =
            fetch(
                IMAGE_MANIFEST_URL,
                {
                    method: 'GET',
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
                .then(manifest => {

                    if (
                        !manifest ||
                        typeof manifest !== 'object'
                    ) {

                        throw new Error(
                            'Invalid image manifest'
                        );

                    }


                    imageManifest =
                        manifest;


                    /*
                     * Keep a browser cache copy.
                     */

                    try {

                        localStorage.setItem(
                            MANIFEST_CACHE_KEY,
                            JSON.stringify(manifest)
                        );

                    } catch (error) {

                        /*
                         * localStorage may be unavailable.
                         */

                    }


                    document.dispatchEvent(
                        new CustomEvent(
                            'velocity:image-manifest-ready',
                            {
                                detail: {
                                    manifest
                                }
                            }
                        )
                    );


                    return manifest;

                })
                .catch(error => {

                    console.warn(
                        '[Velocity Store] Image manifest could not be loaded:',
                        error.message
                    );


                    /*
                     * Try localStorage cache.
                     */

                    try {

                        const cached =
                            localStorage.getItem(
                                MANIFEST_CACHE_KEY
                            );


                        if (cached) {

                            const parsed =
                                JSON.parse(cached);


                            if (
                                parsed &&
                                typeof parsed === 'object'
                            ) {

                                imageManifest =
                                    parsed;


                                return parsed;

                            }

                        }

                    } catch (cacheError) {

                        /*
                         * Ignore cache errors.
                         */

                    }


                    /*
                     * Empty manifest.
                     *
                     * Important:
                     * The website must continue working
                     * even when manifest is missing.
                     */

                    imageManifest = {
                        version: 1,
                        basePath: 'products/',
                        products: {}
                    };


                    return imageManifest;

                });


        return manifestPromise;

    }


    /* =====================================================
       BUILD LOCAL IMAGE URL
    ===================================================== */

    function buildLocalImageUrl(
        fileName,
        basePath = 'products/'
    ) {

        if (
            typeof fileName !== 'string' ||
            !fileName.trim()
        ) {

            return '';

        }


        let value =
            fileName.trim();


        /*
         * Already complete URL.
         */

        if (
            /^https?:\/\//i.test(value) ||
            value.startsWith('data:image/')
        ) {

            return value;

        }


        /*
         * Remove leading slash.
         */

        value =
            value.replace(/^\/+/, '');


        /*
         * If manifest already gives
         * assets/images/... use it directly.
         */

        if (
            value.startsWith(
                'assets/images/'
            )
        ) {

            return value;

        }


        /*
         * If manifest entry is already
         * products/file.jpg
         */

        if (
            value.startsWith(
                'products/'
            )
        ) {

            return `assets/images/${value}`;

        }


        /*
         * Normal manifest format:
         *
         * basePath = products/
         * filename = 12345.jpg
         */

        const safeBase =
            String(basePath || 'products/')
                .replace(/^\/+/, '')
                .replace(/\/+$/, '');


        return (
            `assets/images/${safeBase}/${value}`
        );

    }


    /* =====================================================
       GET MANIFEST IMAGE
    ===================================================== */

    function getManifestImage(product) {

        if (
            !product ||
            !imageManifest
        ) {

            return '';

        }


        const productsMap =
            imageManifest.products;


        if (
            !productsMap ||
            typeof productsMap !== 'object'
        ) {

            return '';

        }


        /*
         * First use imageSlot.
         */

        const slot =
            product.imageSlot ||
            product.id;


        if (!slot) {
            return '';
        }


        const entry =
            productsMap[slot];


        /*
         * Manifest may contain:
         *
         * "velocity-001": "123.jpg"
         *
         * OR
         *
         * "velocity-001": {
         *    "file": "123.jpg"
         * }
         */

        if (
            typeof entry === 'string'
        ) {

            return buildLocalImageUrl(
                entry,
                imageManifest.basePath
            );

        }


        if (
            entry &&
            typeof entry === 'object'
        ) {

            if (
                typeof entry.url === 'string' &&
                entry.url.trim()
            ) {

                return buildLocalImageUrl(
                    entry.url,
                    imageManifest.basePath
                );

            }


            if (
                typeof entry.file === 'string' &&
                entry.file.trim()
            ) {

                return buildLocalImageUrl(
                    entry.file,
                    imageManifest.basePath
                );

            }


            if (
                typeof entry.src === 'string' &&
                entry.src.trim()
            ) {

                return buildLocalImageUrl(
                    entry.src,
                    imageManifest.basePath
                );

            }

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

            return product.localImage.trim();

        }


        /*
         * 4. Legacy image field
         */

        if (
            typeof product.image === 'string' &&
            product.image.trim()
        ) {

            return product.image.trim();

        }


        /*
         * 5. Remote web image
         */

        if (
            typeof product.webImage === 'string' &&
            product.webImage.trim()
        ) {

            return product.webImage.trim();

        }


        /*
         * 6. Remote image alias
         */

        if (
            typeof product.remoteImage === 'string' &&
            product.remoteImage.trim()
        ) {

            return product.remoteImage.trim();

        }


        return FALLBACK_IMAGE;

    }


    /* =====================================================
       ASYNC RESOLVE PRODUCT IMAGE
    ===================================================== */

    async function resolveProductImage(product) {

        if (!product) {

            return FALLBACK_IMAGE;

        }


        /*
         * Load manifest first.
         */

        await loadImageManifest();


        return getProductImage(product);

    }


    /* =====================================================
       RESOLVE ALL PRODUCT IMAGES
    ===================================================== */

    async function resolveProductsImages(
        productList
    ) {

        await loadImageManifest();


        return (
            Array.isArray(productList)
                ? productList
                : []
        ).map(product => {

            if (!product) {
                return product;
            }


            return {
                ...product,

                resolvedImage:
                    getProductImage(product)

            };

        });

    }


    /* =====================================================
       IMAGE FALLBACK ATTRIBUTE
    ===================================================== */

    function getImageFallbackAttribute(
        product
    ) {

        const webImage =
            product &&
            typeof product.webImage === 'string'
                ? product.webImage.trim()
                : '';


        const fallback =
            escapeHtml(
                FALLBACK_IMAGE
            );


        /*
         * If remote image exists:
         *
         * local fails
         * ↓
         * web image
         * ↓
         * fallback
         */

        if (webImage) {

            return `
                data-web-image="${escapeHtml(webImage)}"
                onerror="
                    if (
                        this.dataset.webFallbackUsed !== 'true' &&
                        this.dataset.webImage
                    ) {
                        this.dataset.webFallbackUsed='true';
                        this.onerror=null;
                        this.src=this.dataset.webImage;
                    } else {
                        this.onerror=null;
                        this.src='${fallback}';
                        this.classList.add('image-error');
                    }
                "
            `;

        }


        return `
            onerror="
                this.onerror=null;
                this.src='${fallback}';
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


        if (
            !Number.isFinite(
                numericPrice
            )
        ) {

            return `0 ${escapeHtml(currency)}`;

        }


        return (
            `${numericPrice.toLocaleString('fr-FR')} ` +
            `${escapeHtml(currency)}`
        );

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
            typeof window.VelocityWishlist.has ===
            'function'
                ? window.VelocityWishlist.has(
                    product.id
                )
                : false;


        return `
            <article
                class="product-card"
                data-product-id="${productId}"
                data-category="${category}"
                data-image-slot="${escapeHtml(
                    product.imageSlot || product.id
                )}"
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
                typeof window.VelocityWishlist.updateUI ===
                'function'
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

        return getProducts().filter(
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


        return getProducts().filter(
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


        return getProducts().filter(
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

        resolveProductImage,

        resolveProductsImages,

        loadImageManifest,

        getFallbackImage

    };


    /* =====================================================
       LOAD MANIFEST
    ===================================================== */

    loadImageManifest()
        .then(() => {

            /*
             * Re-render after manifest arrives.
             *
             * This is important because products.js
             * may load before the manifest.
             */

            document.dispatchEvent(
                new CustomEvent(
                    'velocity:image-ready'
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
