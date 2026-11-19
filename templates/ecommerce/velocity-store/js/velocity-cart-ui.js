'use strict';

/* =========================================================
   VELOCITY STORE
   CART CINEMATIC UI
   ---------------------------------------------------------
   - Add To Cart cinematic animation
   - EXACT 2 FULL ROTATIONS
   - EXACT 720deg rotateY
   - Glow effect
   - Premium Added To Cart modal
   - Cart modal actions
   - Safe animation timing
   - Manifest/image system untouched
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


        /* =====================================================
           CONSTANTS
        ===================================================== */

        ANIMATION_DURATION: 1400,

        ANIMATION_CLEANUP_DELAY: 1500,

        MODAL_DELAY: 120,


        /* =====================================================
           PREPARE EXPERIENCE
        ===================================================== */

        prepareExperience(product) {

            if (!product) {
                return;
            }


            /*
             * Prevent two cinematic animations
             * from running at the same time.
             */
            if (CartUI.animationRunning) {

                return;

            }


            CartUI.animationRunning = true;

            CartUI.pendingProduct = product;

            CartUI.cartConfirmed = false;


            /*
             * Clear old timers.
             */
            clearTimeout(
                CartUI.animationTimer
            );

            clearTimeout(
                CartUI.modalTimer
            );


            CartUI.animationTimer = null;

            CartUI.modalTimer = null;


            /*
             * Find the exact product card.
             */
            const card =
                CartUI.findProductCard(
                    product.id
                );


            /*
             * Start cinematic animation.
             */
            if (card) {

                CartUI.animateCard(
                    card
                );

            } else {

                /*
                 * If the card disappeared because
                 * the products were re-rendered,
                 * don't leave the system locked.
                 */
                console.warn(
                    '[Velocity Store] Product card not found for animation:',
                    product.id
                );

            }


            /*
             * =================================================
             * EXACT TIMELINE
             *
             * 0ms
             *    ↓
             * 0°
             *
             * 175ms
             *    ↓
             * 90°
             *
             * 350ms
             *    ↓
             * 180°
             *
             * 525ms
             *    ↓
             * 270°
             *
             * 700ms
             *    ↓
             * 360°
             *
             * 875ms
             *    ↓
             * 450°
             *
             * 1050ms
             *    ↓
             * 540°
             *
             * 1225ms
             *    ↓
             * 630°
             *
             * 1400ms
             *    ↓
             * 720°
             *
             * +120ms
             *    ↓
             * PREMIUM MODAL
             * =================================================
             */

            CartUI.animationTimer =
                setTimeout(
                    function () {

                        CartUI.animationTimer = null;


                        /*
                         * Animation has visually finished.
                         */
                        CartUI.animationRunning = false;


                        const finishedProduct =
                            CartUI.pendingProduct;


                        CartUI.pendingProduct = null;


                        if (!finishedProduct) {

                            return;

                        }


                        /*
                         * IMPORTANT:
                         *
                         * Do NOT open the modal unless
                         * cart.js confirmed the addition.
                         */
                        if (
                            !CartUI.cartConfirmed
                        ) {

                            console.warn(
                                '[Velocity Store] Cart addition was not confirmed. Modal cancelled.'
                            );

                            return;

                        }


                        /*
                         * Open premium modal after
                         * the 720deg animation.
                         */
                        CartUI.scheduleModal(
                            finishedProduct,
                            CartUI.MODAL_DELAY
                        );

                    },
                    CartUI.ANIMATION_DURATION + 50
                );

        },


        /* =====================================================
           HANDLE ADD TO CART
        ===================================================== */

        handleAddToCart(button) {

            if (!button) {
                return;
            }


            const productId =
                button.dataset.cartId;


            /*
             * No product ID.
             */
            if (!productId) {

                const card =
                    button.closest(
                        '.product-card'
                    );


                if (card) {

                    CartUI.animateCard(
                        card
                    );

                }

                return;

            }


            /*
             * Get product safely.
             *
             * Prefer VelocityProducts because it is
             * the actual product database.
             *
             * VelocityCore remains supported.
             */
            let product = null;


            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.getProductById ===
                'function'
            ) {

                product =
                    window.VelocityProducts.getProductById(
                        productId
                    );

            }


            if (
                !product &&
                window.VelocityCore &&
                typeof window.VelocityCore.getProductById ===
                'function'
            ) {

                product =
                    window.VelocityCore.getProductById(
                        productId
                    );

            }


            if (!product) {

                console.warn(
                    '[Velocity Store] Product not found:',
                    productId
                );

                return;

            }


            /*
             * IMPORTANT:
             *
             * Start the cinematic experience BEFORE
             * cart.js processes the actual add.
             */
            CartUI.prepareExperience(
                product
            );

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
                String(
                    productId
                );


            /*
             * First try the exact animation ID.
             */
            const animationCard =
                document.querySelector(
                    `.product-card[data-cart-animation-id="${CSS.escape(wanted)}"]`
                );


            if (animationCard) {

                return animationCard;

            }


            /*
             * Normal product ID fallback.
             */
            const cards =
                document.querySelectorAll(
                    '.product-card'
                );


            for (
                let i = 0;
                i < cards.length;
                i++
            ) {

                const card =
                    cards[i];


                const cardProductId =
                    card.dataset.productId ||
                    card.dataset.id ||
                    card.dataset.cartAnimationId ||
                    '';


                if (
                    String(
                        cardProductId
                    ) === wanted
                ) {

                    return card;

                }

            }


            return null;

        },


        /* =====================================================
           CARD ANIMATION
        ===================================================== */

        animateCard(card) {

            if (!card) {
                return;
            }


            /*
             * Remove old animation classes.
             */
            card.classList.remove(
                'velocity-cart-spin',
                'velocity-cart-launch'
            );


            /*
             * Remove old glow state.
             */
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
             * Force browser reflow.
             *
             * This guarantees the animation
             * restarts every time.
             */
            void card.offsetWidth;


            /*
             * =================================================
             * EXACT 2 FULL ROTATIONS
             *
             * 360deg = 1 rotation
             *
             * 720deg = 2 rotations
             * =================================================
             */
            card.classList.add(
                'velocity-cart-spin',
                'velocity-cart-launch'
            );


            /* =================================================
               GLOW
            ================================================= */

            let glow =
                card.querySelector(
                    '.velocity-cart-glow'
                );


            if (!glow) {

                glow =
                    document.createElement(
                        'div'
                    );


                glow.className =
                    'velocity-cart-glow';


                glow.setAttribute(
                    'aria-hidden',
                    'true'
                );


                card.appendChild(
                    glow
                );

            }


            /*
             * Restart glow animation.
             */
            glow.classList.remove(
                'active'
            );


            void glow.offsetWidth;


            glow.classList.add(
                'active'
            );


            /*
             * Cleanup.
             */
            setTimeout(
                function () {

                    if (!card) {

                        return;

                    }


                    card.classList.remove(
                        'velocity-cart-spin',
                        'velocity-cart-launch'
                    );


                    if (glow) {

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


            CartUI.prepareExperience(
                product
            );

        },


        /* =====================================================
           CART CHANGED
        ===================================================== */

        cartChanged() {

            /*
             * cart.js dispatches:
             *
             * velocity:cart-changed
             *
             * This means the product was successfully
             * added to the cart.
             */
            CartUI.cartConfirmed = true;

        },


        /* =====================================================
           SCHEDULE MODAL
        ===================================================== */

        scheduleModal(
            product,
            delay = 120
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


                        /*
                         * If another experience started
                         * while waiting, don't open an
                         * outdated modal.
                         */
                        if (
                            CartUI.animationRunning
                        ) {

                            return;

                        }


                        /*
                         * Open modal.
                         */
                        CartUI.openModal(
                            product
                        );

                    },
                    delay
                );

        },


        /* =====================================================
           OPEN MODAL
        ===================================================== */

        openModal(product) {

            if (!product) {
                return;
            }


            /*
             * Remove previous modal.
             */
            CartUI.closeExistingModal();


            const modal =
                document.createElement(
                    'div'
                );


            modal.id =
                'velocity-added-cart-modal';


            modal.className =
                'velocity-added-cart-modal';


            modal.setAttribute(
                'aria-hidden',
                'false'
            );


            /* =================================================
               PRODUCT IMAGE
            ================================================= */

            const image =
                window.VelocityProducts &&
                typeof window.VelocityProducts.getProductImage ===
                'function'

                    ? window.VelocityProducts.getProductImage(
                        product
                    )

                    : (
                        window.VelocityCore &&
                        typeof window.VelocityCore.getProductImage ===
                        'function'

                            ? window.VelocityCore.getProductImage(
                                product
                            )

                            : ''
                    );


            const fallback =
                window.VelocityProducts &&
                typeof window.VelocityProducts.getFallbackImage ===
                'function'

                    ? window.VelocityProducts.getFallbackImage()

                    : (
                        window.VelocityCore &&
                        typeof window.VelocityCore.getFallbackImage ===
                        'function'

                            ? window.VelocityCore.getFallbackImage()

                            : ''
                    );


            let candidates = [];


            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.getProductImageCandidates ===
                'function'
            ) {

                try {

                    candidates =
                        window.VelocityProducts
                            .getProductImageCandidates(
                                product
                            )
                            .slice(1);

                } catch (error) {

                    console.warn(
                        '[Velocity Store] Could not get image candidates:',
                        error
                    );

                    candidates = [];

                }

            }


            /* =================================================
               SAFE HELPERS
            ================================================= */

            const escapeHTML =
                window.VelocityCore &&
                typeof window.VelocityCore.escapeHTML ===
                'function'

                    ? window.VelocityCore.escapeHTML

                    : function (value) {

                        return String(value ?? '')
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&#039;');

                    };


            const escapeAttribute =
                window.VelocityCore &&
                typeof window.VelocityCore.escapeAttribute ===
                'function'

                    ? window.VelocityCore.escapeAttribute

                    : function (value) {

                        return String(value ?? '')
                            .replace(/&/g, '&amp;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&#039;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;');

                    };


            /* =================================================
               PRODUCT DATA
            ================================================= */

            const name =
                escapeHTML(
                    product.name ||
                    'Product'
                );


            const category =
                escapeHTML(
                    product.categoryName ||
                    product.category ||
                    'Premium Collection'
                );


            const rating =
                Number(
                    product.rating || 0
                );


            let stars =
                '★★★★★';


            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.renderStars ===
                'function'
            ) {

                try {

                    stars =
                        window.VelocityProducts.renderStars(
                            rating
                        );

                } catch (error) {

                    stars =
                        '★★★★★';

                }

            }


            let price =
                `${product.price ?? ''} DH`;


            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.formatPrice ===
                'function'
            ) {

                try {

                    price =
                        window.VelocityProducts.formatPrice(
                            product.price,
                            product.currency
                        );

                } catch (error) {

                    price =
                        `${product.price ?? ''} DH`;

                }

            }


            const description =
                escapeHTML(
                    product.description ||
                    'Premium product selected for your Velocity collection.'
                );


            const productId =
                escapeAttribute(
                    product.id
                );


            const safeImage =
                escapeAttribute(
                    image || fallback
                );


            const safeFallback =
                escapeAttribute(
                    fallback
                );


            const safeCandidates =
                escapeAttribute(
                    JSON.stringify(
                        candidates
                    )
                );


            const safeProductName =
                escapeAttribute(
                    product.name ||
                    'Product'
                );


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


                    <div
                        class="velocity-added-wave velocity-added-wave-one"
                        aria-hidden="true"
                    ></div>


                    <div
                        class="velocity-added-wave velocity-added-wave-two"
                        aria-hidden="true"
                    ></div>


                    <button
                        type="button"
                        class="velocity-added-close"
                        data-added-cart-close
                        aria-label="Close"
                    >
                        ×
                    </button>


                    <div class="velocity-added-grid">

                        <!-- =================================
                             VISUAL
                        ================================= -->

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
                                    ✓
                                </span>

                                <span>
                                    ADDED
                                </span>

                            </div>

                        </div>


                        <!-- =================================
                             INFORMATION
                        ================================= -->

                        <div class="velocity-added-info">

                            <div class="velocity-added-kicker">

                                <span
                                    class="velocity-added-kicker-dot"
                                ></span>

                                ADDED TO CART

                            </div>


                            <h2 id="velocity-added-title">
                                ${name}
                            </h2>


                            <p class="velocity-added-category">
                                ${category}
                            </p>


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


                            <p class="velocity-added-description">
                                ${description}
                            </p>


                            <div class="velocity-added-divider"></div>


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
                                        ✓
                                    </span>


                                    <div>

                                        <strong>
                                            Ready in cart
                                        </strong>

                                        <small>
                                            1 item added
                                        </small>

                                    </div>

                                </div>

                            </div>


                            <div class="velocity-added-actions">

                                <button
                                    type="button"
                                    class="velocity-added-btn velocity-added-btn-primary"
                                    data-added-cart-view
                                >

                                    <span>
                                        View Cart
                                    </span>

                                    <span class="velocity-added-btn-arrow">
                                        →
                                    </span>

                                </button>


                                <button
                                    type="button"
                                    class="velocity-added-btn velocity-added-btn-secondary"
                                    data-added-cart-continue
                                >

                                    Continue Shopping

                                </button>

                            </div>


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

            document.body.appendChild(
                modal
            );


            /* =================================================
               IMAGE FALLBACK
            ================================================= */

            if (
                window.VelocityCore &&
                typeof window.VelocityCore.attachImageFallbacks ===
                'function'
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

                                modal.classList.add(
                                    'active'
                                );

                            }

                        }
                    );

                }
            );


            /*
             * Lock background.
             */
            document.body.classList.add(
                'velocity-added-cart-open'
            );


            /* =================================================
               FOCUS CLOSE BUTTON
            ================================================= */

            setTimeout(
                function () {

                    if (
                        !modal ||
                        !modal.parentNode
                    ) {

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
                300
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


            modal.classList.remove(
                'active'
            );


            modal.setAttribute(
                'aria-hidden',
                'true'
            );


            document.body.classList.remove(
                'velocity-added-cart-open'
            );


            /*
             * Give CSS exit animation time.
             */
            setTimeout(
                function () {

                    if (
                        modal &&
                        modal.parentNode
                    ) {

                        modal.remove();

                    }

                },
                500
            );

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

    window.VelocityCartUI =
        CartUI;


})();
