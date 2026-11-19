'use strict';

/* =========================================================
   VELOCITY STORE
   CART CINEMATIC UI
   ---------------------------------------------------------
   - Add To Cart cinematic animation
   - EXACT 2 FULL ROTATIONS
   - 720deg rotateY
   - Glow effect
   - Premium Added To Cart modal
   - Cart modal actions
   - Safe animation timing
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
           PREPARE EXPERIENCE
        ===================================================== */

        prepareExperience(product) {

            if (!product) {
                return;
            }

            /*
             * Prevent duplicate animations.
             */
            if (CartUI.animationRunning) {
                return;
            }

            CartUI.animationRunning = true;

            CartUI.pendingProduct = product;

            CartUI.cartConfirmed = false;

            /*
             * Clear previous timers.
             */
            clearTimeout(CartUI.animationTimer);
            clearTimeout(CartUI.modalTimer);

            CartUI.animationTimer = null;
            CartUI.modalTimer = null;


            /*
             * Find the product card.
             */
            const card =
                CartUI.findProductCard(
                    product.id
                );


            /*
             * Start the 720deg animation.
             */
            if (card) {

                CartUI.animateCard(
                    card
                );

            }


            /*
             * =================================================
             * EXACT TIMELINE
             *
             * CSS animation:
             * 1400ms
             *
             * JS waits:
             * 1450ms
             *
             * Then modal:
             * +120ms
             *
             * Result:
             *
             * CLICK
             * ↓
             * 0°
             * ↓
             * 180°
             * ↓
             * 360°
             * ↓
             * 540°
             * ↓
             * 720°
             * ↓
             * MODAL
             * =================================================
             */

            CartUI.animationTimer =
                setTimeout(
                    function () {

                        CartUI.animationTimer = null;

                        CartUI.animationRunning = false;


                        const finishedProduct =
                            CartUI.pendingProduct;


                        CartUI.pendingProduct = null;


                        if (!finishedProduct) {
                            return;
                        }


                        /*
                         * The cart change may have already happened.
                         *
                         * We deliberately DO NOT depend on
                         * cartConfirmed here.
                         *
                         * The visual sequence always finishes
                         * before the modal appears.
                         */

                        CartUI.scheduleModal(
                            finishedProduct,
                            120
                        );

                    },
                    1450
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
             * If there is no product ID,
             * still animate the card if possible.
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
             */
            const product =
                window.VelocityCore &&
                typeof window.VelocityCore.getProductById === 'function'

                    ? window.VelocityCore.getProductById(
                        productId
                    )

                    : null;


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
             * This must happen BEFORE cart.js
             * processes the actual cart action.
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
                String(productId);


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
                    '';


                if (
                    String(cardProductId) === wanted
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
             * Force browser reflow.
             *
             * This allows the animation to restart
             * even when the same card is clicked again.
             */
            void card.offsetWidth;


            /*
             * EXACT TWO FULL ROTATIONS.
             *
             * CSS:
             * rotateY(0deg) → rotateY(720deg)
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
             * Cleanup AFTER animation.
             *
             * CSS duration = 1400ms
             * Cleanup = 1500ms
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
                1500
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
             * IMPORTANT:
             *
             * cart.js may dispatch:
             *
             * velocity:cart-changed
             *
             * immediately after adding.
             *
             * DO NOT OPEN THE MODAL HERE.
             *
             * The animation must finish first.
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
                         * Make sure another modal
                         * wasn't opened meanwhile.
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
             * Remove any old modal first.
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
                window.VelocityCore &&
                typeof window.VelocityCore.getProductImage === 'function'

                    ? window.VelocityCore.getProductImage(
                        product
                    )

                    : '';


            const fallback =
                window.VelocityCore &&
                typeof window.VelocityCore.getFallbackImage === 'function'

                    ? window.VelocityCore.getFallbackImage()

                    : '';


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
                typeof window.VelocityCore.escapeHTML === 'function'

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
                typeof window.VelocityCore.escapeAttribute === 'function'

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
                typeof window.VelocityProducts.renderStars === 'function'
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
                typeof window.VelocityProducts.formatPrice === 'function'
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
             * Give CSS exit animation time to finish.
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
       GLOBAL
    ========================================================= */

    window.VelocityCartUI =
        CartUI;


})();
