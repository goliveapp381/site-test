'use strict';

/* =========================================================
   VELOCITY STORE
   PRODUCTS DATABASE + PRODUCT RENDERING
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
            image: 'assets/images/products/product-1.jpg',
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
            colors: ['Black', 'Brown'],
            sizes: [],
            stock: 19,
            featured: true,
            newest: false
        }

    ];


    /*
    ========================================================
    GET ALL PRODUCTS
    ========================================================
    */

    function getProducts() {
        return [...products];
    }


    /*
    ========================================================
    GET PRODUCT BY ID
    ========================================================
    */

    function getProductById(productId) {

        return products.find(
            product => product.id === productId
        ) || null;
    }


    /*
    ========================================================
    FORMAT PRICE
    ========================================================
    */

    function formatPrice(price, currency = 'DH') {

        return `${Number(price).toLocaleString('fr-FR')} ${currency}`;
    }


    /*
    ========================================================
    STAR RATING
    ========================================================
    */

    function renderStars(rating) {

        const rounded = Math.max(
            0,
            Math.min(
                5,
                Math.round(Number(rating) || 0)
            )
        );

        let stars = '';

        for (let i = 1; i <= 5; i++) {

            stars += i <= rounded
                ? '<span class="star active">★</span>'
                : '<span class="star">☆</span>';
        }

        return stars;
    }


    /*
    ========================================================
    PRODUCT CARD
    ========================================================
    */

    function createProductCard(product) {

        if (!product) return '';

        const discount =
            product.oldPrice &&
            Number(product.price) < Number(product.oldPrice)
                ? Math.round(
                    (
                        (Number(product.oldPrice) -
                            Number(product.price)) /
                        Number(product.oldPrice)
                    ) * 100
                )
                : 0;

        return `
            <article
                class="product-card"
                data-product-id="${product.id}"
                data-category="${product.category}"
            >

                <div class="product-image-wrapper">

                    ${product.badge ? `
                        <span class="product-badge">
                            ${product.badge}
                        </span>
                    ` : ''}

                    ${discount > 0 ? `
                        <span class="discount-badge">
                            -${discount}%
                        </span>
                    ` : ''}

                    <button
                        class="wishlist-button"
                        type="button"
                        data-wishlist-id="${product.id}"
                        aria-label="إضافة إلى المفضلة"
                    >
                        ♡
                    </button>

                    <img
                        class="product-image"
                        src="${product.image}"
                        alt="${product.name}"
                        loading="lazy"
                        decoding="async"
                        onerror="this.classList.add('image-error')"
                    />

                    <div class="product-overlay">

                        <button
                            class="quick-view-button"
                            type="button"
                            data-product-id="${product.id}"
                        >
                            عرض سريع
                        </button>

                        <button
                            class="add-cart-button"
                            type="button"
                            data-cart-id="${product.id}"
                        >
                            أضف للسلة
                        </button>

                    </div>

                </div>


                <div class="product-info">

                    <div class="product-category">
                        ${product.categoryName}
                    </div>

                    <h3 class="product-name">
                        ${product.name}
                    </h3>

                    <div class="product-rating">

                        <div class="stars">
                            ${renderStars(product.rating)}
                        </div>

                        <span class="rating-value">
                            ${product.rating}
                        </span>

                        <span class="review-count">
                            (${product.reviews})
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

                            ${product.oldPrice ? `
                                <span class="product-old-price">
                                    ${formatPrice(
                                        product.oldPrice,
                                        product.currency
                                    )}
                                </span>
                            ` : ''}

                        </div>

                    </div>

                </div>

            </article>
        `;
    }


    /*
    ========================================================
    RENDER PRODUCTS
    ========================================================
    */

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
                ? productsToRender
                : [];

        if (!safeProducts.length) {

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

            element.dispatchEvent(
                new CustomEvent('velocity:products-rendered', {
                    detail: {
                        products: []
                    }
                })
            );

            return;
        }

        element.innerHTML =
            safeProducts
                .map(createProductCard)
                .join('');

        element.dispatchEvent(
            new CustomEvent('velocity:products-rendered', {
                detail: {
                    products: safeProducts
                }
            })
        );
    }


    /*
    ========================================================
    FEATURED PRODUCTS
    ========================================================
    */

    function getFeaturedProducts() {

        return products.filter(
            product => product.featured
        );
    }


    /*
    ========================================================
    CATEGORY PRODUCTS
    ========================================================
    */

    function getProductsByCategory(category) {

        const normalizedCategory =
            String(category || '')
                .trim()
                .toLowerCase();

        if (
            !normalizedCategory ||
            normalizedCategory === 'all'
        ) {
            return getProducts();
        }

        return products.filter(
            product =>
                String(product.category)
                    .toLowerCase() === normalizedCategory
        );
    }


    /*
    ========================================================
    SEARCH PRODUCTS
    ========================================================
    */

    function searchProducts(query) {

        const value =
            String(query || '')
                .trim()
                .toLowerCase();

        if (!value) {
            return getProducts();
        }

        return products.filter(product => {

            return (
                String(product.name)
                    .toLowerCase()
                    .includes(value) ||

                String(product.categoryName)
                    .toLowerCase()
                    .includes(value) ||

                String(product.category)
                    .toLowerCase()
                    .includes(value)
            );

        });
    }


    /*
    ========================================================
    GLOBAL API
    ========================================================
    */

    window.VelocityProducts = {

        getProducts,
        getProductById,
        getFeaturedProducts,
        getProductsByCategory,
        searchProducts,
        renderProducts,
        createProductCard,
        formatPrice,
        renderStars

    };


    /*
    ========================================================
    READY
    ========================================================
    */

    document.dispatchEvent(
        new CustomEvent('velocity:products-ready')
    );

})();
