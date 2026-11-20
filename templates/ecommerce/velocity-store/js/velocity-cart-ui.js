
'use strict';

/* =========================================================
   VELOCITY STORE
   PREMIUM CINEMATIC PRODUCT EXPERIENCE

   - Product card click preview
   - Smooth scale-up + EXACT 720deg rotation
   - Cinematic product modal
   - Product image manifest preserved
   - Product details
   - Add to Cart from preview modal
   - Existing cart experience preserved
   - Safe event handling
========================================================= */

(function () {

    const CartUI = {

        /* =====================================================
           STATE
        ===================================================== */

        animationRunning: false,

        pendingProduct: null,

        cartConfirmed: false,

        animationTimer: null,

        modalTimer: null,

        animationToken: 0,


        /* =====================================================
           CONSTANTS
        ===================================================== */

        ANIMATION_DURATION: 1800,

        ANIMATION_CLEANUP_DELAY: 1900,

        MODAL_DELAY: 100,

        CLOSE_DURATION: 450,


        /* =====================================================
           SAFE HELPERS
        ===================================================== */

        escapeHTML(value) {

            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

        },


        escapeAttribute(value) {

            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

        },


        getProductById(productId) {

            let product = null;

            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.getProductById === 'function'
            ) {

                product =
                    window.VelocityProducts.getProductById(
                        productId
                    );

            }

            if (
                !product &&
                window.VelocityCore &&
                typeof window.VelocityCore.getProductById === 'function'
            ) {

                product =
                    window.VelocityCore.getProductById(
                        productId
                    );

            }

            return product;

        },


        getProductImage(product) {

            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.getProductImage === 'function'
            ) {

                return window.VelocityProducts.getProductImage(
                    product
                ) || '';

            }

            if (
                window.VelocityCore &&
                typeof window.VelocityCore.getProductImage === 'function'
            ) {

                return window.VelocityCore.getProductImage(
                    product
                ) || '';

            }

            return '';

        },


        getFallbackImage() {

            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.getFallbackImage === 'function'
            ) {

                return window.VelocityProducts.getFallbackImage() || '';

            }

            if (
                window.VelocityCore &&
                typeof window.VelocityCore.getFallbackImage === 'function'
            ) {

                return window.VelocityCore.getFallbackImage() || '';

            }

            return '';

        },


        getImageCandidates(product) {

            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.getProductImageCandidates === 'function'
            ) {

                try {

                    const candidates =
                        window.VelocityProducts.getProductImageCandidates(
                            product
                        );

                    return Array.isArray(candidates)
                        ? candidates.slice(1)
                        : [];

                } catch (error) {

                    console.warn(
                        '[Velocity Store] Image candidates error:',
                        error
                    );

                }

            }

            return [];

        },


        formatPrice(product) {

            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.formatPrice === 'function'
            ) {

                try {

                    return window.VelocityProducts.formatPrice(
                        product.price,
                        product.currency
                    );

                } catch (error) {

                    console.warn(
                        '[Velocity Store] Price formatting error:',
                        error
                    );

                }

            }

            return `${product.price ?? ''} ${product.currency || 'DH'}`;

        },


        getStars(rating) {

            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.renderStars === 'function'
            ) {

                try {

                    return window.VelocityProducts.renderStars(
                        rating
                    );

                } catch (error) {

                    console.warn(
                        '[Velocity Store] Rating rendering error:',
                        error
                    );

                }

            }

            return '★★★★★';

        },


        /* =====================================================
           PREPARE ADD TO CART EXPERIENCE
        ===================================================== */

        prepareExperience(product) {

            if (!product || CartUI.animationRunning) {
                return;
            }

            CartUI.startCardExperience(
                product,
                false
            );

        },


        /* =====================================================
           HANDLE PRODUCT CARD CLICK

           Click card:
           1. Scale up
           2. Smooth 720deg spin
           3. Open product details

           Does NOT add to cart.
        ===================================================== */

        handleCardClick(product, card) {

            if (!product || !card) {
                return;
            }

            if (CartUI.animationRunning) {
                return;
            }

            CartUI.startCardExperience(
                product,
                true,
                card
            );

        },


        /* =====================================================
           SHARED CARD EXPERIENCE
        ===================================================== */

        startCardExperience(
            product,
            preview = false,
            suppliedCard = null
        ) {

            if (!product || CartUI.animationRunning) {
                return;
            }

            clearTimeout(CartUI.animationTimer);
            clearTimeout(CartUI.modalTimer);

            CartUI.animationTimer = null;
            CartUI.modalTimer = null;

            CartUI.animationToken++;

            const currentToken =
                CartUI.animationToken;

            CartUI.animationRunning = true;

            CartUI.pendingProduct = product;

            CartUI.cartConfirmed = false;

            CartUI.closeExistingModal();

            const card =
                suppliedCard ||
                CartUI.findProductCard(product.id);

            if (card) {

                CartUI.animateCard(card);

            } else {

                console.warn(
                    '[Velocity Store] Product card not found:',
                    product.id
                );

            }

            CartUI.animationTimer =
                setTimeout(
                    function () {

                        if (
                            currentToken !== CartUI.animationToken
                        ) {
                            return;
                        }

                        CartUI.animationTimer = null;

                        CartUI.animationRunning = false;

                        const finishedProduct =
                            CartUI.pendingProduct;

                        CartUI.pendingProduct = null;

                        if (!finishedProduct) {
                            return;
                        }

                        /*
                         * Add-to-cart mode:
                         * Only open modal if cart confirms addition.
                         */

                        if (!preview && !CartUI.cartConfirmed) {

                            console.warn(
                                '[Velocity Store] Cart addition not confirmed.'
                            );

                            return;

                        }

                        CartUI.scheduleModal(
                            finishedProduct,
                            CartUI.MODAL_DELAY,
                            preview
                        );

                    },
                    CartUI.ANIMATION_DURATION + 50
                );

        },


        /* =====================================================
           COMPATIBILITY ALIAS
        ===================================================== */

        openProductExperience(product, card) {

            return CartUI.handleCardClick(
                product,
                card
            );

        },


        /* =====================================================
           HANDLE ADD TO CART BUTTON
        ===================================================== */

        handleAddToCart(button) {

            if (!button) {
                return;
            }

            const productId =
                button.dataset.cartId ||
                button.dataset.productId;

            if (!productId) {

                const card =
                    button.closest('.product-card');

                if (card) {
                    CartUI.animateCard(card);
                }

                return;

            }

            const product =
                CartUI.getProductById(productId);

            if (!product) {

                console.warn(
                    '[Velocity Store] Product not found:',
                    productId
                );

                return;

            }

            CartUI.prepareExperience(product);

        },


        /* =====================================================
           FIND PRODUCT CARD
        ===================================================== */

        findProductCard(productId) {

            if (
                productId === undefined ||
                productId === null
            ) {
                return null;
            }

            const wanted =
                String(productId);

            const cards =
                document.querySelectorAll(
                    '.product-card'
                );

            for (let i = 0; i < cards.length; i++) {

                const card = cards[i];

                const ids = [

                    card.dataset.productId,

                    card.dataset.id,

                    card.dataset.cartAnimationId

                ];

                if (
                    ids.some(
                        id => String(id || '') === wanted
                    )
                ) {

                    return card;

                }

            }

            return null;

        },


        /* =====================================================
           CARD ANIMATION

           CSS animation must use:
           velocityPremiumCardSpin

           Duration:
           1800ms

           Rotation:
           720deg
        ===================================================== */

        animateCard(card) {

            if (!card) {
                return;
            }

            card.classList.remove(
                'velocity-cart-spin',
                'velocity-cart-spinning',
                'velocity-cart-launch'
            );

            const oldGlow =
                card.querySelector(
                    '.velocity-cart-glow'
                );

            if (oldGlow) {

                oldGlow.classList.remove(
                    'active'
                );

            }

            /*
             * Force animation restart.
             */

            void card.offsetWidth;

            card.classList.add(
                'velocity-cart-spin',
                'velocity-cart-launch'
            );

            let glow =
                card.querySelector(
                    '.velocity-cart-glow'
                );

            if (!glow) {

                glow =
                    document.createElement('div');

                glow.className =
                    'velocity-cart-glow';

                glow.setAttribute(
                    'aria-hidden',
                    'true'
                );

                card.appendChild(glow);

            }

            glow.classList.remove('active');

            void glow.offsetWidth;

            glow.classList.add('active');

            /*
             * Cleanup after animation.
             */

            setTimeout(
                function () {

                    if (!card) {
                        return;
                    }

                    card.classList.remove(
                        'velocity-cart-spin',
                        'velocity-cart-spinning',
                        'velocity-cart-launch'
                    );

                    if (glow && glow.parentNode) {

                        glow.classList.remove(
                            'active'
                        );

                    }

                },
                CartUI.ANIMATION_CLEANUP_DELAY
            );

        },


        /* =====================================================
           START EXPERIENCE
        ===================================================== */

        startExperience(product) {

            if (!product) {
                return;
            }

            CartUI.prepareExperience(product);

        },


        /* =====================================================
           CART CHANGED
        ===================================================== */

        cartChanged() {

            CartUI.cartConfirmed = true;

        },


        /* =====================================================
           SCHEDULE MODAL
        ===================================================== */

        scheduleModal(
            product,
            delay = 100,
            preview = false
        ) {

            if (!product) {
                return;
            }

            clearTimeout(
                CartUI.modalTimer
            );

            CartUI.modalTimer =
                setTimeout(
                    function () {

                        CartUI.modalTimer = null;

                        if (CartUI.animationRunning) {
                            return;
                        }

                        CartUI.openModal(
                            product,
                            {
                                preview: preview
                            }
                        );

                    },
                    delay
                );

        },


        /* =====================================================
           OPEN PRODUCT MODAL
        ===================================================== */

        openModal(
            product,
            options = {}
        ) {

            if (!product) {
                return;
            }

            const isPreview =
                options.preview === true;

            CartUI.closeExistingModal();

            const modal =
                document.createElement('div');

            modal.id =
                'velocity-added-cart-modal';

            modal.className =
                'velocity-added-cart-modal';

            modal.setAttribute(
                'aria-hidden',
                'false'
            );


            /* =================================================
               IMAGE SYSTEM
               Manifest system remains untouched.
            ================================================= */

            const image =
                CartUI.getProductImage(product);

            const fallback =
                CartUI.getFallbackImage();

            const candidates =
                CartUI.getImageCandidates(product);


            /* =================================================
               PRODUCT INFORMATION
            ================================================= */

            const name =
                CartUI.escapeHTML(
                    product.name || 'Product'
                );

            const category =
                CartUI.escapeHTML(
                    product.categoryName ||
                    product.category ||
                    'Premium Collection'
                );

            const rating =
                Number(product.rating || 0);

            const stars =
                CartUI.getStars(rating);

            const price =
                CartUI.escapeHTML(
                    CartUI.formatPrice(product)
                );

            const description =
                CartUI.escapeHTML(
                    product.description ||
                    'Premium product selected for your Velocity collection.'
                );

            const productId =
                CartUI.escapeAttribute(
                    product.id
                );

            const safeImage =
                CartUI.escapeAttribute(
                    image || fallback
                );

            const safeFallback =
                CartUI.escapeAttribute(
                    fallback
                );

            const safeCandidates =
                CartUI.escapeAttribute(
                    JSON.stringify(candidates)
                );

            const safeProductName =
                CartUI.escapeAttribute(
                    product.name || 'Product'
                );


            /* =================================================
               OPTIONAL PRODUCT INFORMATION
            ================================================= */

            const sku =
                CartUI.escapeHTML(
                    product.sku ||
                    product.id ||
                    'VELOCITY'
                );

            const stock =
                product.stock;

            const stockText =
                stock === undefined || stock === null
                    ? 'Available'
                    : Number(stock) > 0
                        ? `${Number(stock)} available`
                        : 'Out of stock';

            const safeStock =
                CartUI.escapeHTML(stockText);


            /* =================================================
               MODAL MODE
            ================================================= */

            const kicker =
                isPreview
                    ? 'PRODUCT DETAILS'
                    : 'ADDED TO CART';

            const badge =
                isPreview
                    ? 'VIEW'
                    : 'ADDED';

            const statusTitle =
                isPreview
                    ? 'Product Details'
                    : 'Ready in cart';

            const statusSubtitle =
                isPreview
                    ? 'Premium selection'
                    : '1 item added';

            const statusIcon =
                isPreview
                    ? '◆'
                    : '✓';


            const primaryButton =
                isPreview
                    ? `
                        <button
                            type="button"
                            class="velocity-added-btn velocity-added-btn-primary"
                            data-added-cart-add
                            data-product-id="${productId}"
                        >
                            <span>Add to Cart</span>
                            <span class="velocity-added-btn-arrow">→</span>
                        </button>
                    `
                    : `
                        <button
                            type="button"
                            class="velocity-added-btn velocity-added-btn-primary"
                            data-added-cart-view
                        >
                            <span>View Cart</span>
                            <span class="velocity-added-btn-arrow">→</span>
                        </button>
                    `;


            /* =================================================
               MODAL HTML
            ================================================= */

            modal.innerHTML = `

                <div
                    class="velocity-added-backdrop"
                    data-added-cart-close
                ></div>


                <div
                    class="velocity-added-shell"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="velocity-added-title"
                >

                    <div
                        class="velocity-added-noise"
                        aria-hidden="true"
                    ></div>

                    <div
                        class="velocity-added-grid-bg"
                        aria-hidden="true"
                    ></div>


                    <!-- DECORATIVE ORBS -->

                    <div
                        class="velocity-added-orb velocity-added-orb-one"
                        aria-hidden="true"
                    ></div>

                    <div
                        class="velocity-added-orb velocity-added-orb-two"
                        aria-hidden="true"
                    ></div>

                    <div
                        class="velocity-added-orb velocity-added-orb-three"
                        aria-hidden="true"
                    ></div>


                    <!-- WAVES -->

                    <div
                        class="velocity-added-wave velocity-added-wave-one"
                        aria-hidden="true"
                    ></div>

                    <div
                        class="velocity-added-wave velocity-added-wave-two"
                        aria-hidden="true"
                    ></div>


                    <!-- CLOSE -->

                    <button
                        type="button"
                        class="velocity-added-close"
                        data-added-cart-close
                        aria-label="Close"
                    >
                        ×
                    </button>


                    <div class="velocity-added-grid">


                        <!-- PRODUCT IMAGE -->

                        <div class="velocity-added-visual">

                            <div
                                class="velocity-added-ring velocity-added-ring-one"
                                aria-hidden="true"
                            ></div>

                            <div
                                class="velocity-added-ring velocity-added-ring-two"
                                aria-hidden="true"
                            ></div>


                            <div class="velocity-added-image-wrap">

                                <div
                                    class="velocity-added-image-glow"
                                    aria-hidden="true"
                                ></div>


                                <div class="velocity-added-image-card">

                                    <img
                                        src="${safeImage}"
                                        alt="${safeProductName}"
                                        data-image-candidates="${safeCandidates}"
                                        data-fallback="${safeFallback}"
                                        data-product-id="${productId}"
                                        loading="eager"
                                        decoding="async"
                                    >

                                    <div
                                        class="velocity-added-image-shine"
                                        aria-hidden="true"
                                    ></div>

                                </div>


                                <div
                                    class="velocity-added-floating-dot dot-one"
                                    aria-hidden="true"
                                ></div>

                                <div
                                    class="velocity-added-floating-dot dot-two"
                                    aria-hidden="true"
                                ></div>

                                <div
                                    class="velocity-added-floating-dot dot-three"
                                    aria-hidden="true"
                                ></div>

                            </div>


                            <div class="velocity-added-success-badge">

                                <span class="velocity-added-check">
                                    ${statusIcon}
                                </span>

                                <span>
                                    ${badge}
                                </span>

                            </div>

                        </div>


                        <!-- PRODUCT DETAILS -->

                        <div class="velocity-added-info">


                            <div class="velocity-added-kicker">

                                <span
                                    class="velocity-added-kicker-dot"
                                ></span>

                                ${kicker}

                            </div>


                            <h2 id="velocity-added-title">
                                ${name}
                            </h2>


                            <p class="velocity-added-category">
                                ${category}
                            </p>


                            <!-- RATING -->

                            <div class="velocity-added-rating">

                                <span class="velocity-added-stars">
                                    ${stars}
                                </span>

                                <span class="velocity-added-rating-number">

                                    ${
                                        rating > 0
                                            ? rating.toFixed(1)
                                            : 'New'
                                    }

                                </span>

                            </div>


                            <!-- DESCRIPTION -->

                            <p class="velocity-added-description">
                                ${description}
                            </p>


                            <div class="velocity-added-divider"></div>


                            <!-- PRODUCT META -->

                            <div class="velocity-added-meta">

                                <div class="velocity-added-price-box">

                                    <span>
                                        PRICE
                                    </span>

                                    <strong>
                                        ${price}
                                    </strong>

                                </div>


                                <div class="velocity-added-status">

                                    <span class="velocity-added-status-icon">
                                        ${statusIcon}
                                    </span>

                                    <div>

                                        <strong>
                                            ${statusTitle}
                                        </strong>

                                        <small>
                                            ${statusSubtitle}
                                        </small>

                                    </div>

                                </div>

                            </div>


                            <!-- EXTRA INFORMATION -->

                            <div class="velocity-added-extra">

                                <div>

                                    <span>PRODUCT ID</span>

                                    <strong>
                                        ${sku}
                                    </strong>

                                </div>

                                <div>

                                    <span>AVAILABILITY</span>

                                    <strong>
                                        ${safeStock}
                                    </strong>

                                </div>

                            </div>


                            <!-- ACTIONS -->

                            <div class="velocity-added-actions">

                                ${primaryButton}

                                <button
                                    type="button"
                                    class="velocity-added-btn velocity-added-btn-secondary"
                                    data-added-cart-continue
                                >
                                    Continue Shopping
                                </button>

                            </div>


                            <!-- FOOTER -->

                            <div class="velocity-added-footer-line">

                                <span></span>

                                <small>
                                    VELOCITY STORE
                                </small>

                                <span></span>

                            </div>

                        </div>

                    </div>

                </div>

            `;


            /* =================================================
               APPEND MODAL
            ================================================= */

            document.body.appendChild(modal);


            /* =================================================
               IMAGE FALLBACK SYSTEM
            ================================================= */

            if (
                window.VelocityCore &&
                typeof window.VelocityCore.attachImageFallbacks === 'function'
            ) {

                try {

                    window.VelocityCore.attachImageFallbacks(
                        modal
                    );

                } catch (error) {

                    console.warn(
                        '[Velocity Store] Modal image fallback failed:',
                        error
                    );

                }

            }


            /* =================================================
               OPEN ANIMATION
            ================================================= */

            requestAnimationFrame(
                function () {

                    requestAnimationFrame(
                        function () {

                            if (
                                modal &&
                                modal.parentNode
                            ) {

                                modal.classList.add('active');

                            }

                        }
                    );

                }
            );


            document.body.classList.add(
                'velocity-added-cart-open'
            );


            /* =================================================
               FOCUS CLOSE BUTTON
            ================================================= */

            setTimeout(
                function () {

                    if (!modal.parentNode) {
                        return;
                    }

                    const close =
                        modal.querySelector(
                            '.velocity-added-close'
                        );

                    if (close) {
                        close.focus();
                    }

                },
                350
            );


            /* =================================================
               MODAL EVENTS
            ================================================= */

            modal.addEventListener(
                'click',
                function (event) {

                    const closeButton =
                        event.target.closest(
                            '[data-added-cart-close]'
                        );

                    if (closeButton) {

                        event.preventDefault();

                        CartUI.closeModal();

                        return;

                    }


                    const continueButton =
                        event.target.closest(
                            '[data-added-cart-continue]'
                        );

                    if (continueButton) {

                        event.preventDefault();

                        CartUI.closeModal();

                        return;

                    }


                    const viewCartButton =
                        event.target.closest(
                            '[data-added-cart-view]'
                        );

                    if (viewCartButton) {

                        event.preventDefault();

                        CartUI.closeModal();

                        setTimeout(
                            function () {

                                if (
                                    window.VelocityCart &&
                                    typeof window.VelocityCart.open === 'function'
                                ) {

                                    window.VelocityCart.open();

                                } else {

                                    const cartButton =
                                        document.querySelector(
                                            '[data-cart-open], #cartButton'
                                        );

                                    if (cartButton) {
                                        cartButton.click();
                                    }

                                }

                            },
                            180
                        );

                        return;

                    }


                    const addButton =
                        event.target.closest(
                            '[data-added-cart-add]'
                        );

                    if (addButton) {

                        event.preventDefault();

                        const id =
                            addButton.dataset.productId;

                        if (
                            !id ||
                            !window.VelocityCart ||
                            typeof window.VelocityCart.add !== 'function'
                        ) {

                            console.warn(
                                '[Velocity Store] Cart add API unavailable.'
                            );

                            return;

                        }

                        addButton.disabled = true;

                        addButton.classList.add('loading');

                        window.VelocityCart.add(id);

                        CartUI.closeModal();

                    }

                }
            );


            /* =================================================
               ESC KEY
            ================================================= */

            modal._velocityEscapeHandler =
                function (event) {

                    if (event.key === 'Escape') {

                        CartUI.closeModal();

                    }

                };

            document.addEventListener(
                'keydown',
                modal._velocityEscapeHandler
            );

        },


        /* =====================================================
           CLOSE MODAL
        ===================================================== */

        closeModal() {

            clearTimeout(
                CartUI.modalTimer
            );

            CartUI.modalTimer = null;

            const modal =
                document.querySelector(
                    '#velocity-added-cart-modal'
                );

            if (!modal) {

                document.body.classList.remove(
                    'velocity-added-cart-open'
                );

                return;

            }

            if (modal._velocityEscapeHandler) {

                document.removeEventListener(
                    'keydown',
                    modal._velocityEscapeHandler
                );

                modal._velocityEscapeHandler = null;

            }

            modal.classList.remove('active');

            modal.setAttribute(
                'aria-hidden',
                'true'
            );

            document.body.classList.remove(
                'velocity-added-cart-open'
            );

            setTimeout(
                function () {

                    if (
                        modal &&
                        modal.parentNode
                    ) {

                        modal.remove();

                    }

                },
                CartUI.CLOSE_DURATION
            );

        },


        /* =====================================================
           COMPATIBILITY
        ===================================================== */

        closeProductModal() {

            CartUI.closeModal();

        },


        /* =====================================================
           CLOSE EXISTING MODAL
        ===================================================== */

        closeExistingModal() {

            clearTimeout(
                CartUI.modalTimer
            );

            CartUI.modalTimer = null;

            const old =
                document.querySelector(
                    '#velocity-added-cart-modal'
                );

            if (old) {

                if (old._velocityEscapeHandler) {

                    document.removeEventListener(
                        'keydown',
                        old._velocityEscapeHandler
                    );

                }

                old.remove();

            }

            document.body.classList.remove(
                'velocity-added-cart-open'
            );

        }

    };


    /* =========================================================
       GLOBAL API
    ========================================================= */

    window.VelocityCartUI = CartUI;


})();
