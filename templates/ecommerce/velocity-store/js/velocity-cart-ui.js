'use strict';

/* =========================================================
   VELOCITY STORE
   CART CINEMATIC UI
   ---------------------------------------------------------
   - Add To Cart animation
   - Two full rotations
   - Glow
   - Premium added cart modal
   - Cart modal actions
========================================================= */

(function () {

    const CartUI = {

        animationRunning: false,
        pendingProduct: null,
        animationTimer: null,
        modalTimer: null,


        /* =====================================================
           HANDLE ADD TO CART
        ===================================================== */

        handleAddToCart(button) {

            if (!button) {
                return;
            }

            if (this.animationRunning) {
                return;
            }

            const productId =
                button.dataset.cartId;

            if (!productId) {

                const card =
                    button.closest(
                        '.product-card'
                    );

                if (card) {
                    this.animateCard(card);
                }

                return;
            }

            const product =
                window.VelocityCore.getProductById(
                    productId
                );

            if (!product) {

                console.warn(
                    '[Velocity Store] Product not found:',
                    productId
                );

                return;
            }

            const card =
                button.closest(
                    '.product-card'
                );

            if (!card) {

                this.startExperience(
                    product
                );

                return;
            }

            this.animationRunning =
                true;

            this.pendingProduct =
                product;

            this.animateCard(card);

            clearTimeout(
                this.animationTimer
            );

            this.animationTimer =
                setTimeout(() => {

                    if (this.pendingProduct) {

                        const pending =
                            this.pendingProduct;

                        this.pendingProduct =
                            null;

                        this.scheduleModal(
                            pending
                        );

                    }

                    this.animationRunning =
                        false;

                }, 1280);
        },


        /* =====================================================
           CARD ANIMATION
        ===================================================== */

        animateCard(card) {

            if (!card) {
                return;
            }

            card.classList.remove(
                'velocity-cart-spin',
                'velocity-cart-launch'
            );

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

            glow.classList.remove(
                'active'
            );

            void glow.offsetWidth;

            glow.classList.add(
                'active'
            );

            setTimeout(() => {

                card.classList.remove(
                    'velocity-cart-spin',
                    'velocity-cart-launch'
                );

                glow.classList.remove(
                    'active'
                );

            }, 1260);
        },


        /* =====================================================
           START EXPERIENCE
        ===================================================== */

        startExperience(product) {

            if (!product) {
                return;
            }

            const productId =
                String(product.id);

            let card = null;

            try {

                card =
                    document.querySelector(
                        `.product-card[data-product-id="${CSS.escape(productId)}"]`
                    );

            } catch (error) {

                card = null;

            }

            if (!card) {

                try {

                    const button =
                        document.querySelector(
                            `[data-cart-id="${CSS.escape(productId)}"]`
                        );

                    if (button) {

                        card =
                            button.closest(
                                '.product-card'
                            );

                    }

                } catch (error) {

                    card = null;

                }
            }

            if (card) {
                this.animateCard(card);
            }

            this.scheduleModal(product);
        },


        /* =====================================================
           SCHEDULE MODAL
        ===================================================== */

        scheduleModal(product) {

            if (!product) {
                return;
            }

            clearTimeout(
                this.modalTimer
            );

            this.modalTimer =
                setTimeout(() => {

                    this.modalTimer =
                        null;

                    this.openModal(
                        product
                    );

                }, 120);
        },


        /* =====================================================
           CART CHANGED
        ===================================================== */

        cartChanged() {

            /*
             * IMPORTANT FIX:
             *
             * Don't check modalTimer here.
             *
             * cart.js may fire the event while the timer
             * already exists.
             */

            if (!this.pendingProduct) {
                return;
            }

            const product =
                this.pendingProduct;

            this.pendingProduct =
                null;

            clearTimeout(
                this.animationTimer
            );

            this.animationTimer =
                null;

            this.scheduleModal(
                product
            );
        },


        /* =====================================================
           OPEN MODAL
        ===================================================== */

        openModal(product) {

            if (!product) {
                return;
            }

            this.closeExistingModal();

            const modal =
                document.createElement(
                    'div'
                );

            modal.id =
                'velocity-added-cart-modal';

            modal.className =
                'velocity-added-cart-modal';

            const image =
                window.VelocityCore.getProductImage(
                    product
                );

            const fallback =
                window.VelocityCore.getFallbackImage();

            let candidates = [];

            if (
                window.VelocityProducts &&
                typeof window.VelocityProducts.getProductImageCandidates ===
                'function'
            ) {

                candidates =
                    window.VelocityProducts
                        .getProductImageCandidates(
                            product
                        )
                        .slice(1);
            }

            const name =
                window.VelocityCore.escapeHTML(
                    product.name ||
                    'Product'
                );

            const category =
                window.VelocityCore.escapeHTML(
                    product.categoryName ||
                    product.category ||
                    'Premium Collection'
                );

            const rating =
                Number(
                    product.rating || 0
                );

            const stars =
                window.VelocityProducts &&
                typeof window.VelocityProducts.renderStars ===
                'function'

                    ? window.VelocityProducts.renderStars(
                        rating
                    )

                    : '★★★★★';

            const price =
                window.VelocityProducts &&
                typeof window.VelocityProducts.formatPrice ===
                'function'

                    ? window.VelocityProducts.formatPrice(
                        product.price,
                        product.currency
                    )

                    : `${product.price ?? ''} DH`;

            const description =
                window.VelocityCore.escapeHTML(
                    product.description ||
                    'Premium product selected for your Velocity collection.'
                );

            const productId =
                window.VelocityCore.escapeAttribute(
                    product.id
                );

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
                                        src="${window.VelocityCore.escapeAttribute(image)}"
                                        alt="${window.VelocityCore.escapeAttribute(product.name)}"
                                        data-image-candidates="${window.VelocityCore.escapeAttribute(JSON.stringify(candidates))}"
                                        data-fallback="${window.VelocityCore.escapeAttribute(fallback)}"
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

                        <div class="velocity-added-info">

                            <div class="velocity-added-kicker">

                                <span class="velocity-added-kicker-dot"></span>

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

            document.body.appendChild(
                modal
            );

            window.VelocityCore.attachImageFallbacks(
                modal
            );

            requestAnimationFrame(() => {

                requestAnimationFrame(() => {

                    modal.classList.add(
                        'active'
                    );

                });

            });

            document.body.classList.add(
                'velocity-added-cart-open'
            );

            modal.setAttribute(
                'aria-hidden',
                'false'
            );

            setTimeout(() => {

                const close =
                    modal.querySelector(
                        '.velocity-added-close'
                    );

                if (close) {
                    close.focus();
                }

            }, 300);
        },


        /* =====================================================
           CLOSE MODAL
        ===================================================== */

        closeModal() {

            clearTimeout(
                this.modalTimer
            );

            this.modalTimer =
                null;

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

            setTimeout(() => {

                if (
                    modal &&
                    modal.parentNode
                ) {

                    modal.remove();

                }

            }, 500);
        },


        /* =====================================================
           CLOSE EXISTING
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


    window.VelocityCartUI =
        CartUI;

})();
