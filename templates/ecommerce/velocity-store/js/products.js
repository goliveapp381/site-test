'use strict';

/* =========================================================
   VELOCITY STORE
   PRODUCTS DATABASE + PRODUCT RENDERING
   ---------------------------------------------------------
   UNIVERSAL TEMPLATE EDITOR READY

   Product editing support:

   - data-product-id
   - data-product-field
   - data-editable
   - data-editable-type

   Editable product fields:

   - name
   - price
   - oldPrice
   - currency
   - category
   - categoryName
   - rating
   - reviews
   - badge
   - image
   - stock
   - colors
   - sizes

   IMAGE SYSTEM

   - image-manifest.json priority
   - local image priority
   - web image fallback
   - final SVG fallback

   CART SUPPORT

   - data-product-id
   - data-cart-id
   - data-cart-animation-id

========================================================= */

(function () {

    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const IMAGE_MANIFEST_URL =
        'assets/images/image-manifest.json';


    /* =====================================================
       DEFAULT IMAGE MAP
    ===================================================== */

    const DEFAULT_IMAGE_MAP = {

        'image-1':
            'products/1795097464794.jpg',

        'image-2':
            'products/1795097469929.jpg',

        'image-3':
            'products/1795097472776.jpg',

        'image-4':
            'products/1795097475536.jpg',

        'image-5':
            'products/1795097479173.jpg',

        'image-6':
            'products/1795097483617.jpg',

        'image-7':
            'products/1795097486368.jpg',

        'image-8':
            'products/1795097490170.jpg'

    };


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

            imageId: 'image-1',

            image: '',

            localImage: '',

            webImage: '',

            remoteImage: '',

            resolvedImage: '',

            colors: [
                'Black',
                'White'
            ],

            sizes: [
                '40',
                '41',
                '42',
                '43',
                '44'
            ],

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

            image: '',

            localImage: '',

            webImage: '',

            remoteImage: '',

            resolvedImage: '',

            colors: [
                'Black',
                'Gray'
            ],

            sizes: [
                'S',
                'M',
                'L',
                'XL'
            ],

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

            image: '',

            localImage: '',

            webImage: '',

            remoteImage: '',

            resolvedImage: '',

            colors: [
                'Black',
                'Silver'
            ],

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

            image: '',

            localImage: '',

            webImage: '',

            remoteImage: '',

            resolvedImage: '',

            colors: [
                'Black',
                'Brown'
            ],

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

            image: '',

            localImage: '',

            webImage: '',

            remoteImage: '',

            resolvedImage: '',

            colors: [
                'Black',
                'Cream',
                'Gray'
            ],

            sizes: [
                'S',
                'M',
                'L',
                'XL'
            ],

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

            image: '',

            localImage: '',

            webImage: '',

            remoteImage: '',

            resolvedImage: '',

            colors: [
                'White',
                'Black'
            ],

            sizes: [
                '40',
                '41',
                '42',
                '43',
                '44'
            ],

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

            image: '',

            localImage: '',

            webImage: '',

            remoteImage: '',

            resolvedImage: '',

            colors: [
                'Black',
                'White'
            ],

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

            image: '',

            localImage: '',

            webImage: '',

            remoteImage: '',

            resolvedImage: '',

            colors: [
                'Black',
                'Brown'
            ],

            sizes: [],

            stock: 19,

            featured: true,

            newest: false
        }

    ];


    /* =====================================================
       IMAGE MANIFEST STATE
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
                        C210 500 300 445 400 445
                        C500 445 590 500 620 670
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
       ESCAPE HTML
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


        const source =
            data.products &&
            typeof data.products === 'object'
                ? data.products
                : {};


        const normalized = {};


        Object.keys(source).forEach(
            key => {

                const value =
                    source[key];


                if (
                    typeof value === 'string' &&
                    value.trim()
                ) {

                    normalized[key] =
                        value.trim();

                    return;

                }


                if (
                    value &&
                    typeof value === 'object' &&
                    typeof value.src === 'string' &&
                    value.src.trim()
                ) {

                    normalized[key] =
                        value.src.trim();

                }

            }
        );


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


        const manifestUrl =
            new URL(
                IMAGE_MANIFEST_URL,
                document.baseURI
            ).href;


        imageManifestPromise =
            fetch(
                manifestUrl,
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


                    document.dispatchEvent(
                        new CustomEvent(
                            'velocity:images-ready'
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
                        '[Velocity Store] image-manifest.json unavailable. Using built-in image map.',
                        error
                    );


                    document.dispatchEvent(
                        new CustomEvent(
                            'velocity:images-ready'
                        )
                    );


                    return imageManifest;

                });


        return imageManifestPromise;

    }


    /* =====================================================
       GET MANIFEST IMAGE
    ===================================================== */

    function getManifestImage(imageId) {

        if (!imageId) {

            return '';

        }


        const value =
            imageManifest &&
            imageManifest.products
                ? imageManifest.products[imageId]
                : '';


        if (
            typeof value === 'string' &&
            value.trim()
        ) {

            return value.trim();

        }


        return '';

    }


    /* =====================================================
       GET DEFAULT LOCAL IMAGE
    ===================================================== */

    function getDefaultLocalImage(imageId) {

        if (!imageId) {

            return '';

        }


        const value =
            DEFAULT_IMAGE_MAP[imageId];


        if (
            typeof value !== 'string'
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


        if (
            /^https?:\/\//i.test(image)
        ) {

            return image;

        }


        if (
            image.startsWith('data:image/')
        ) {

            return image;

        }


        if (
            image.startsWith('/')
        ) {

            return image;

        }


        if (
            image.startsWith('assets/')
        ) {

            return image;

        }


        return `assets/images/${image}`;

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
            String(
                productId ?? ''
            ).trim();


        return products.find(
            product =>
                product.id === id
        ) || null;

    }


    /* =====================================================
       UPDATE PRODUCT
       -----------------------------------------------------
       Used by Universal Template Editor
    ===================================================== */

    function updateProduct(
        productId,
        changes = {}
    ) {

        const product =
            getProductById(
                productId
            );


        if (!product) {

            return null;

        }


        if (
            !changes ||
            typeof changes !== 'object'
        ) {

            return product;

        }


        const allowedFields = [

            'name',
            'price',
            'oldPrice',
            'currency',
            'category',
            'categoryName',
            'rating',
            'reviews',
            'badge',
            'image',
            'localImage',
            'webImage',
            'remoteImage',
            'resolvedImage',
            'stock',
            'featured',
            'newest'

        ];


        allowedFields.forEach(
            field => {

                if (
                    Object.prototype.hasOwnProperty.call(
                        changes,
                        field
                    )
                ) {

                    product[field] =
                        changes[field];

                }

            }
        );


        if (
            Object.prototype.hasOwnProperty.call(
                changes,
                'colors'
            )
        ) {

            product.colors =
                Array.isArray(
                    changes.colors
                )
                    ? [
                        ...changes.colors
                    ]
                    : [];

        }


        if (
            Object.prototype.hasOwnProperty.call(
                changes,
                'sizes'
            )
        ) {

            product.sizes =
                Array.isArray(
                    changes.sizes
                )
                    ? [
                        ...changes.sizes
                    ]
                    : [];

        }


        document.dispatchEvent(
            new CustomEvent(
                'velocity:product-updated',
                {
                    detail: {

                        product:
                            getProductById(
                                productId
                            ),

                        productId

                    }
                }
            )
        );


        return product;

    }


    /* =====================================================
       UPDATE PRODUCT FIELD
    ===================================================== */

    function updateProductField(
        productId,
        field,
        value
    ) {

        const product =
            getProductById(
                productId
            );


        if (!product || !field) {

            return null;

        }


        if (
            field === 'price' ||
            field === 'oldPrice' ||
            field === 'rating' ||
            field === 'reviews' ||
            field === 'stock'
        ) {

            const numberValue =
                Number(value);


            if (
                Number.isFinite(
                    numberValue
                )
            ) {

                value =
                    numberValue;

            }

        }


        if (
            field === 'colors' ||
            field === 'sizes'
        ) {

            if (
                typeof value === 'string'
            ) {

                value =
                    value
                        .split(',')
                        .map(
                            item =>
                                item.trim()
                        )
                        .filter(Boolean);

            }

        }


        product[field] =
            value;


        document.dispatchEvent(
            new CustomEvent(
                'velocity:product-field-updated',
                {
                    detail: {

                        productId,

                        field,

                        value,

                        product

                    }
                }
            )
        );


        return product;

    }


    /* =====================================================
       GET PRODUCT IMAGE CANDIDATES
    ===================================================== */

    function getProductImageCandidates(
        product
    ) {

        if (!product) {

            return [
                FALLBACK_IMAGE
            ];

        }


        const candidates = [];


        function addCandidate(value) {

            const url =
                buildImageUrl(value);


            if (!url) {

                return;

            }


            if (
                !candidates.includes(url)
            ) {

                candidates.push(url);

            }

        }


        /* 1. Editor resolved image */

        addCandidate(
            product.resolvedImage
        );


        /* 2. Explicit local image */

        addCandidate(
            product.localImage
        );


        /* 3. Manifest */

        if (
            product.imageId
        ) {

            addCandidate(
                getManifestImage(
                    product.imageId
                )
            );

        }


        /* 4. Built-in local image */

        if (
            product.imageId
        ) {

            addCandidate(
                getDefaultLocalImage(
                    product.imageId
                )
            );

        }


        /* 5. Explicit image */

        addCandidate(
            product.image
        );


        /* 6. Web image */

        addCandidate(
            product.webImage
        );


        /* 7. Remote image */

        addCandidate(
            product.remoteImage
        );


        /* 8. Final fallback */

        addCandidate(
            FALLBACK_IMAGE
        );


        return candidates;

    }


    /* =====================================================
       GET PRODUCT IMAGE
    ===================================================== */

    function getProductImage(product) {

        const candidates =
            getProductImageCandidates(
                product
            );


        return candidates[0] ||
            FALLBACK_IMAGE;

    }


    /* =====================================================
       IMAGE CANDIDATES ATTRIBUTE
    ===================================================== */

    function getImageCandidatesAttribute(
        product
    ) {

        const candidates =
            getProductImageCandidates(
                product
            );


        const fallbackCandidates =
            candidates.slice(1);


        const encoded =
            escapeHtml(
                JSON.stringify(
                    fallbackCandidates
                )
            );


        return `data-image-candidates="${encoded}"`;

    }


    /* =====================================================
       LEGACY FALLBACK ATTRIBUTE
    ===================================================== */

    function getImageFallbackAttribute(
        product
    ) {

        const candidates =
            getProductImageCandidates(
                product
            );


        const fallback =
            candidates[1] ||
            FALLBACK_IMAGE;


        return `
            data-fallback="${escapeHtml(
                fallback
            )}"
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
            Number(
                product.price
            );


        const oldPrice =
            Number(
                product.oldPrice
            );


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
                (
                    oldPrice -
                    price
                ) /
                oldPrice
            ) * 100
        );

    }


    /* =====================================================
       PRODUCT FIELD ATTRIBUTE
    ===================================================== */

    function productFieldAttributes(
        product,
        field,
        type = 'text'
    ) {

        const productId =
            escapeHtml(
                product.id
            );


        const fieldName =
            escapeHtml(
                field
            );


        const editableKey =
            escapeHtml(
                `product_${product.id}_${field}`
            );


        return `
            data-product-id="${productId}"
            data-product-field="${fieldName}"
            data-editable="${editableKey}"
            data-editable-type="${type}"
        `;

    }


    /* =====================================================
       CREATE PRODUCT CARD
    ===================================================== */

    function createProductCard(product) {

        if (!product) {

            return '';

        }


        const productId =
            escapeHtml(
                product.id
            );


        const productName =
            escapeHtml(
                product.name
            );


        const category =
            escapeHtml(
                product.category
            );


        const categoryName =
            escapeHtml(
                product.categoryName
            );


        const badge =
            escapeHtml(
                product.badge
            );


        const image =
            getProductImage(
                product
            );


        const discount =
            getDiscount(
                product
            );


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

                data-cart-animation-id="${productId}"

                data-image-id="${escapeHtml(
                    product.imageId || ''
                )}"

                data-category="${category}"

                data-editable="product_${productId}"

                data-editable-type="product"

            >


                <!-- =====================================
                     PRODUCT IMAGE
                ====================================== -->

                <div class="product-image-wrapper">


                    ${
                        product.badge
                            ? `

                                <span

                                    class="product-badge"

                                    ${productFieldAttributes(
                                        product,
                                        'badge',
                                        'text'
                                    )}

                                >
                                    ${badge}
                                </span>

                            `
                            : ''

                    }


                    ${
                        discount > 0
                            ? `

                                <span
                                    class="discount-badge"
                                    data-product-id="${productId}"
                                    data-product-field="discount"
                                >
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

                        src="${escapeHtml(image)}"

                        alt="${productName}"

                        loading="lazy"

                        decoding="async"

                        ${getImageCandidatesAttribute(product)}

                        ${getImageFallbackAttribute(product)}

                        ${productFieldAttributes(
                            product,
                            'image',
                            'image'
                        )}

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

                            data-product-id="${productId}"

                            data-cart-animation-id="${productId}"

                        >
                            أضف للسلة
                        </button>


                    </div>

                </div>


                <!-- =====================================
                     PRODUCT INFORMATION
                ====================================== -->

                <div class="product-info">


                    <!-- CATEGORY -->

                    <div

                        class="product-category"

                        ${productFieldAttributes(
                            product,
                            'categoryName',
                            'text'
                        )}

                    >
                        ${categoryName}
                    </div>


                    <!-- PRODUCT NAME -->

                    <h3

                        class="product-name"

                        ${productFieldAttributes(
                            product,
                            'name',
                            'text'
                        )}

                    >
                        ${productName}
                    </h3>


                    <!-- RATING -->

                    <div class="product-rating">


                        <div class="stars">

                            ${renderStars(
                                product.rating
                            )}

                        </div>


                        <span

                            class="rating-value"

                            ${productFieldAttributes(
                                product,
                                'rating',
                                'number'
                            )}

                        >
                            ${escapeHtml(
                                product.rating
                            )}
                        </span>


                        <span

                            class="review-count"

                            ${productFieldAttributes(
                                product,
                                'reviews',
                                'number'
                            )}

                        >
                            (${escapeHtml(
                                product.reviews
                            )})
                        </span>


                    </div>


                    <!-- PRICE -->

                    <div class="product-bottom">


                        <div class="product-price-wrapper">


                            <span

                                class="product-price"

                                ${productFieldAttributes(
                                    product,
                                    'price',
                                    'number'
                                )}

                            >

                                ${formatPrice(
                                    product.price,
                                    product.currency
                                )}

                            </span>


                            ${
                                product.oldPrice
                                    ? `

                                        <span

                                            class="product-old-price"

                                            ${productFieldAttributes(
                                                product,
                                                'oldPrice',
                                                'number'
                                            )}

                                        >

                                            ${formatPrice(
                                                product.oldPrice,
                                                product.currency
                                            )}

                                        </span>

                                    `
                                    : ''
                            }


                            <span

                                class="product-currency"

                                hidden

                                ${productFieldAttributes(
                                    product,
                                    'currency',
                                    'text'
                                )}

                            >
                                ${escapeHtml(
                                    product.currency
                                )}
                            </span>


                        </div>


                    </div>


                    <!-- =================================
                         HIDDEN EDITOR DATA
                    ================================== -->

                    <div
                        class="product-editor-data"
                        hidden
                        aria-hidden="true"
                    >


                        <span

                            ${productFieldAttributes(
                                product,
                                'category',
                                'text'
                            )}

                        >
                            ${category}
                        </span>


                        <span

                            ${productFieldAttributes(
                                product,
                                'stock',
                                'number'
                            )}

                        >
                            ${escapeHtml(
                                product.stock
                            )}
                        </span>


                        <span

                            ${productFieldAttributes(
                                product,
                                'featured',
                                'boolean'
                            )}

                        >
                            ${product.featured
                                ? 'true'
                                : 'false'}
                        </span>


                        <span

                            ${productFieldAttributes(
                                product,
                                'newest',
                                'boolean'
                            )}

                        >
                            ${product.newest
                                ? 'true'
                                : 'false'}
                        </span>


                        <span

                            ${productFieldAttributes(
                                product,
                                'colors',
                                'text'
                            )}

                        >
                            ${escapeHtml(
                                Array.isArray(
                                    product.colors
                                )
                                    ? product.colors.join(
                                        ', '
                                    )
                                    : ''
                            )}
                        </span>


                        <span

                            ${productFieldAttributes(
                                product,
                                'sizes',
                                'text'
                            )}

                        >
                            ${escapeHtml(
                                Array.isArray(
                                    product.sizes
                                )
                                    ? product.sizes.join(
                                        ', '
                                    )
                                    : ''
                            )}
                        </span>


                    </div>


                </div>

            </article>

        `;

    }


    /* =====================================================
       RENDER EMPTY STATE
    ===================================================== */

    function renderEmptyState(
        element
    ) {

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
                    product =>
                        createProductCard(
                            product
                        )
                )
                .join('');


        bindProductImageFallbacks(
            element
        );


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
                    bubbles: true,

                    detail: {

                        products:
                            safeProducts,

                        count:
                            safeProducts.length

                    }
                }
            )
        );


        document.dispatchEvent(
            new CustomEvent(
                'velocity:products-rendered',
                {
                    detail: {

                        products:
                            safeProducts,

                        count:
                            safeProducts.length

                    }
                }
            )
        );

    }


    /* =====================================================
       IMAGE FALLBACK HANDLER
    ===================================================== */

    function bindProductImageFallbacks(
        container
    ) {

        if (!container) {

            return;

        }


        const images =
            container.querySelectorAll(
                '.product-image'
            );


        images.forEach(
            image => {

                if (
                    image.dataset.velocityImageBound ===
                    'true'
                ) {

                    return;

                }


                image.dataset.velocityImageBound =
                    'true';


                let candidates = [];


                try {

                    candidates =
                        JSON.parse(
                            image.dataset.imageCandidates ||
                            '[]'
                        );

                } catch (
                    error
                ) {

                    candidates = [];

                }


                let index = 0;


                image.addEventListener(
                    'error',
                    function () {

                        if (
                            index >=
                            candidates.length
                        ) {

                            if (
                                image.src !==
                                FALLBACK_IMAGE
                            ) {

                                image.src =
                                    FALLBACK_IMAGE;

                            }

                            return;

                        }


                        const next =
                            candidates[index];


                        index++;


                        if (
                            next &&
                            image.src !== next
                        ) {

                            image.src =
                                next;

                        }

                    }
                );

            }
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
            normalizeText(
                category
            );


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
       SEARCH PRODUCTS
    ===================================================== */

    function searchProducts(
        query
    ) {

        const value =
            normalizeText(
                query
            );


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
       GET IMAGE MANIFEST
    ===================================================== */

    function getImageManifest() {

        return {

            version:
                imageManifest.version,

            products: {

                ...imageManifest.products

            }

        };

    }


    /* =====================================================
       GET DEFAULT IMAGE MAP
    ===================================================== */

    function getDefaultImageMap() {

        return {

            ...DEFAULT_IMAGE_MAP

        };

    }


    /* =====================================================
       IS MANIFEST LOADED
    ===================================================== */

    function isImageManifestLoaded() {

        return imageManifestLoaded;

    }


    /* =====================================================
       GET PRODUCT IMAGE ID
    ===================================================== */

    function getProductImageId(
        productId
    ) {

        const product =
            getProductById(
                productId
            );


        return product
            ? product.imageId
            : null;

    }


    /* =====================================================
       SET PRODUCT IMAGE
       -----------------------------------------------------
       Universal Editor helper
    ===================================================== */

    function setProductImage(
        productId,
        image
    ) {

        const product =
            getProductById(
                productId
            );


        if (!product) {

            return null;

        }


        product.resolvedImage =
            String(
                image ?? ''
            ).trim();


        product.image =
            product.resolvedImage;


        document.dispatchEvent(
            new CustomEvent(
                'velocity:product-image-updated',
                {
                    detail: {

                        productId,

                        image:
                            product.resolvedImage,

                        product

                    }
                }
            )
        );


        return product;

    }


    /* =====================================================
       REFRESH PRODUCT CARD
    ===================================================== */

    function refreshProductCard(
        productId
    ) {

        const card =
            document.querySelector(
                `[data-product-id="${CSS.escape(
                    String(productId)
                )}"].product-card`
            );


        const product =
            getProductById(
                productId
            );


        if (
            !card ||
            !product
        ) {

            return;

        }


        const parent =
            card.parentElement;


        if (!parent) {

            return;

        }


        const cards =
            Array.from(
                parent.children
            );


        const index =
            cards.indexOf(
                card
            );


        const newHtml =
            createProductCard(
                product
            );


        const temporary =
            document.createElement(
                'div'
            );


        temporary.innerHTML =
            newHtml;


        const newCard =
            temporary.firstElementChild;


        if (!newCard) {

            return;

        }


        if (index >= 0) {

            parent.replaceChild(
                newCard,
                card
            );

        } else {

            card.replaceWith(
                newCard
            );

        }


        bindProductImageFallbacks(
            parent
        );


        document.dispatchEvent(
            new CustomEvent(
                'velocity:product-card-refreshed',
                {
                    detail: {

                        productId,

                        product

                    }
                }
            )
        );

    }


    /* =====================================================
       EDITOR MESSAGE BRIDGE
       -----------------------------------------------------
       Allows template-bridge.js / editor.js
       to update product data directly.
    ===================================================== */

    window.addEventListener(
        'message',
        event => {

            const message =
                event.data;


            if (
                !message ||
                typeof message !== 'object'
            ) {

                return;

            }


            if (
                message.type ===
                'SET_PRODUCT'
            ) {

                const productId =
                    message.productId ||
                    message.id;


                const changes =
                    message.product ||
                    message.data ||
                    message.changes ||
                    {};


                const product =
                    updateProduct(
                        productId,
                        changes
                    );


                if (product) {

                    refreshProductCard(
                        productId
                    );

                }


                return;

            }


            if (
                message.type ===
                'SET_PRODUCT_FIELD'
            ) {

                const productId =
                    message.productId ||
                    message.id;


                const field =
                    message.field;


                const value =
                    message.value;


                const product =
                    updateProductField(
                        productId,
                        field,
                        value
                    );


                if (product) {

                    refreshProductCard(
                        productId
                    );

                }

            }

        }
    );


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

        getImageCandidatesAttribute,

        getImageFallbackAttribute,

        getFallbackImage,

        getImageManifest,

        getDefaultImageMap,

        getProductImageId,

        isImageManifestLoaded,

        loadImageManifest,

        updateProduct,

        updateProductField,

        setProductImage,

        refreshProductCard

    };


    /* =====================================================
       START IMAGE MANIFEST
    ===================================================== */

    loadImageManifest();


    /* =====================================================
       PRODUCTS READY
    ===================================================== */

    document.dispatchEvent(
        new CustomEvent(
            'velocity:products-ready',
            {
                detail: {

                    count:
                        products.length,

                    products:
                        getProducts()

                }
            }
        )
    );


})();
