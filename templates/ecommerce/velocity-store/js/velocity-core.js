'use strict';

/* =========================================================
   VELOCITY STORE
   CORE MODULE
   ---------------------------------------------------------
   - Page loader
   - Product helpers
   - Product rendering
   - Image resolver
   - Image fallback system
   - HTML escaping
   - Footer year
   - Safe module helpers
========================================================= */

(function () {

    const Core = {

        /* =====================================================
           PAGE LOADER
        ===================================================== */

        hidePageLoader() {

            const loader =
                document.querySelector('#pageLoader');

            if (!loader) {
                return;
            }

            loader.classList.add('loaded');
            loader.classList.add('hidden');

            loader.setAttribute(
                'aria-hidden',
                'true'
            );

            document.body.classList.remove('loading');
            document.body.classList.remove('page-loading');

            setTimeout(() => {

                if (!loader) {
                    return;
                }

                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                loader.style.pointerEvents = 'none';

            }, 350);

            setTimeout(() => {

                if (
                    loader &&
                    loader.parentNode
                ) {

                    loader.remove();

                }

            }, 900);
        },


        /* =====================================================
           PRODUCT RENDER
        ===================================================== */

        renderProducts() {

            const Products =
                window.VelocityProducts;

            if (
                !Products ||
                typeof Products.renderProducts !==
                'function'
            ) {

                console.warn(
                    '[Velocity Store] Products module not ready.'
                );

                return;
            }

            const container =
                document.querySelector(
                    '#products-grid'
                );

            if (!container) {
                return;
            }

            let productList = [];

            if (
                typeof Products.getProducts ===
                'function'
            ) {

                productList =
                    Products.getProducts() || [];

            }

            Products.renderProducts(
                container,
                productList
            );

            Core.setupImageFallbacks();
        },


        /* =====================================================
           GET PRODUCT
        ===================================================== */

        getProductById(productId) {

            const Products =
                window.VelocityProducts;

            if (
                !Products ||
                typeof Products.getProductById !==
                'function'
            ) {

                return null;
            }

            return Products.getProductById(
                productId
            );
        },


        /* =====================================================
           PRODUCT IMAGE
        ===================================================== */

        getProductImage(product) {

            if (!product) {
                return Core.getFallbackImage();
            }

            const Products =
                window.VelocityProducts;

            if (
                Products &&
                typeof Products.getProductImage ===
                'function'
            ) {

                const resolved =
                    Products.getProductImage(
                        product
                    );

                if (
                    typeof resolved === 'string' &&
                    resolved.trim()
                ) {

                    return resolved.trim();

                }
            }

            const candidates = [

                product.resolvedImage,
                product.localImage,
                product.image,
                product.webImage,
                product.imageUrl,
                product.remoteImage

            ];

            for (
                const candidate of candidates
            ) {

                if (
                    typeof candidate !== 'string'
                ) {

                    continue;

                }

                const value =
                    candidate.trim();

                if (!value) {
                    continue;
                }

                return value;
            }

            return Core.getFallbackImage();
        },


        /* =====================================================
           FALLBACK IMAGE
        ===================================================== */

        getFallbackImage() {

            const Products =
                window.VelocityProducts;

            if (
                Products &&
                typeof Products.getFallbackImage ===
                'function'
            ) {

                const fallback =
                    Products.getFallbackImage();

                if (fallback) {
                    return fallback;
                }
            }

            return (
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
                            fill="#101016"
                        />

                        <text
                            x="400"
                            y="400"
                            text-anchor="middle"
                            dominant-baseline="middle"
                            fill="#ffffff"
                            font-family="Arial"
                            font-size="54"
                        >
                            VELOCITY
                        </text>

                    </svg>
                `)
            );
        },


        /* =====================================================
           IMAGE FALLBACK SYSTEM
        ===================================================== */

        setupImageFallbacks() {

            Core.attachImageFallbacks(
                document
            );
        },


        attachImageFallbacks(container) {

            if (!container) {
                return;
            }

            const images =
                container.querySelectorAll
                    ? container.querySelectorAll('img')
                    : [];

            images.forEach(image => {

                if (
                    image.dataset.velocityFallbackBound ===
                    'true'
                ) {

                    return;

                }

                image.dataset.velocityFallbackBound =
                    'true';

                let candidates = [];

                if (
                    image.dataset.imageCandidates
                ) {

                    try {

                        const parsed =
                            JSON.parse(
                                image.dataset.imageCandidates
                            );

                        if (
                            Array.isArray(parsed)
                        ) {

                            candidates =
                                parsed.filter(
                                    value =>
                                        typeof value === 'string' &&
                                        value.trim()
                                );

                        }

                    } catch (error) {

                        console.warn(
                            '[Velocity Store] Invalid image candidates:',
                            error
                        );

                    }
                }

                const legacyWebFallback =
                    image.dataset.webFallback ||
                    image.dataset.webImage ||
                    image.dataset.remoteImage;

                if (
                    legacyWebFallback &&
                    !candidates.includes(
                        legacyWebFallback
                    )
                ) {

                    candidates.push(
                        legacyWebFallback
                    );
                }

                image._velocityImageCandidates =
                    candidates;

                image._velocityImageIndex = 0;

                image.addEventListener(
                    'error',
                    () => {

                        const list =
                            image._velocityImageCandidates ||
                            [];

                        let nextIndex =
                            Number(
                                image._velocityImageIndex || 0
                            );

                        if (
                            nextIndex < list.length
                        ) {

                            const nextImage =
                                list[nextIndex];

                            image._velocityImageIndex =
                                nextIndex + 1;

                            if (
                                nextImage &&
                                nextImage !== image.src
                            ) {

                                image.src =
                                    nextImage;

                                image.style.visibility =
                                    'visible';

                                return;

                            }
                        }

                        if (
                            image.dataset.fallbackUsed !==
                            'true'
                        ) {

                            const fallback =
                                image.dataset.fallback ||
                                Core.getFallbackImage();

                            image.dataset.fallbackUsed =
                                'true';

                            image.src =
                                fallback;

                            image.style.visibility =
                                'visible';

                            return;
                        }

                        image.style.visibility =
                            'hidden';

                    }
                );
            });
        },


        /* =====================================================
           ESCAPE HTML
        ===================================================== */

        escapeHTML(value) {

            return String(
                value ?? ''
            )
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        },


        /* =====================================================
           ESCAPE ATTRIBUTE
        ===================================================== */

        escapeAttribute(value) {

            return Core.escapeHTML(value);
        },


        /* =====================================================
           FOOTER YEAR
        ===================================================== */

        updateYear() {

            document
                .querySelectorAll(
                    '[data-current-year]'
                )
                .forEach(element => {

                    element.textContent =
                        new Date().getFullYear();

                });
        },


        /* =====================================================
           SAFE PRODUCT IMAGE CANDIDATES
        ===================================================== */

        getProductImageCandidates(product) {

            const Products =
                window.VelocityProducts;

            if (
                Products &&
                typeof Products.getProductImageCandidates ===
                'function'
            ) {

                const result =
                    Products.getProductImageCandidates(
                        product
                    );

                if (Array.isArray(result)) {
                    return result;
                }
            }

            return [];
        },


        /* =====================================================
           FORMAT PRICE
        ===================================================== */

        formatPrice(product) {

            if (!product) {
                return '';
            }

            const Products =
                window.VelocityProducts;

            if (
                Products &&
                typeof Products.formatPrice ===
                'function'
            ) {

                return Products.formatPrice(
                    product.price,
                    product.currency
                );
            }

            return `${product.price ?? 0} DH`;
        },


        /* =====================================================
           RATING
        ===================================================== */

        renderStars(rating) {

            const Products =
                window.VelocityProducts;

            if (
                Products &&
                typeof Products.renderStars ===
                'function'
            ) {

                return Products.renderStars(
                    Number(rating || 0)
                );
            }

            return '★★★★★';
        },


        /* =====================================================
           FIND PRODUCT CARD
        ===================================================== */

        findProductCard(productId) {

            if (!productId) {
                return null;
            }

            const selector =
                `[data-product-id="${CSS.escape(String(productId))}"]`;

            try {

                const direct =
                    document.querySelector(
                        selector
                    );

                if (direct) {
                    return direct.closest(
                        '.product-card'
                    ) || direct;
                }

            } catch (error) {
                // Continue with fallback search.
            }

            const cards =
                document.querySelectorAll(
                    '.product-card'
                );

            for (
                const card of cards
            ) {

                const id =
                    card.dataset.productId ||
                    card.dataset.id ||
                    card.querySelector(
                        '[data-cart-id]'
                    )?.dataset.cartId;

                if (
                    String(id || '') ===
                    String(productId)
                ) {

                    return card;
                }
            }

            return null;
        }

    };


    window.VelocityCore =
        Core;

})();
