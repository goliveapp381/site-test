'use strict';

/* =========================================================
   VELOCITY STORE
   UI MODULE
   ---------------------------------------------------------
   - Search
   - Mobile menu
   - Quick View
   - Wishlist
   - Categories
   - Notifications
   - Scroll
   - Add To Cart Experience Bridge
========================================================= */

(function () {

    const UI = {


        /* =====================================================
           SEARCH
        ===================================================== */

        openSearch() {

            const overlay =
                document.querySelector(
                    '#searchOverlay'
                );

            if (!overlay) {
                return;
            }

            overlay.classList.add(
                'active'
            );

            overlay.setAttribute(
                'aria-hidden',
                'false'
            );

            document.body.classList.add(
                'search-open'
            );

            const input =
                overlay.querySelector(
                    '#searchInput, input'
                );

            if (input) {

                setTimeout(() => {

                    input.focus();
                    input.select();

                }, 100);

            }

            UI.renderSearchResults(
                input
                    ? input.value.trim()
                    : ''
            );
        },


        closeSearch() {

            const overlay =
                document.querySelector(
                    '#searchOverlay'
                );

            if (!overlay) {
                return;
            }

            overlay.classList.remove(
                'active'
            );

            overlay.setAttribute(
                'aria-hidden',
                'true'
            );

            document.body.classList.remove(
                'search-open'
            );
        },


        performSearch() {

            const input =
                document.querySelector(
                    '#searchInput'
                );

            const value =
                input
                    ? input.value.trim()
                    : '';

            if (
                window.VelocityFilters &&
                typeof window.VelocityFilters.setSearch ===
                'function'
            ) {

                window.VelocityFilters.setSearch(
                    value
                );
            }

            UI.closeSearch();

            UI.scrollTo(
                '#products'
            );
        },


        renderSearchResults(query) {

            const container =
                document.querySelector(
                    '#searchResults'
                );

            if (!container) {
                return;
            }

            const value =
                String(
                    query || ''
                ).trim();

            if (!value) {

                container.innerHTML = `

                    <div class="search-results-empty">

                        <span>⌕</span>

                        <p>
                            Search for products, shoes,
                            fashion or tech.
                        </p>

                    </div>

                `;

                return;
            }

            const Products =
                window.VelocityProducts;

            if (
                !Products ||
                typeof Products.searchProducts !==
                'function'
            ) {

                return;
            }

            const results =
                Products
                    .searchProducts(value)
                    .slice(0, 8);

            if (!results.length) {

                container.innerHTML = `

                    <div class="search-results-empty">

                        <span>×</span>

                        <p>
                            No products found.
                        </p>

                    </div>

                `;

                return;
            }

            container.innerHTML =
                results
                    .map(product => {

                        const image =
                            window.VelocityCore
                                .getProductImage(
                                    product
                                );

                        const fallback =
                            window.VelocityCore
                                .getFallbackImage();

                        const candidates =
                            window.VelocityCore
                                .getProductImageCandidates(
                                    product
                                )
                                .slice(1);

                        const name =
                            window.VelocityCore
                                .escapeHTML(
                                    product.name
                                );

                        const category =
                            window.VelocityCore
                                .escapeHTML(
                                    product.categoryName ||
                                    product.category ||
                                    ''
                                );

                        const price =
                            window.VelocityCore
                                .formatPrice(
                                    product
                                );

                        return `

                            <button
                                type="button"
                                class="search-result-item"
                                data-search-product-id="${window.VelocityCore.escapeAttribute(product.id)}"
                            >

                                <span class="search-result-image">

                                    <img
                                        src="${window.VelocityCore.escapeAttribute(image)}"
                                        alt="${window.VelocityCore.escapeAttribute(product.name)}"
                                        data-image-candidates="${window.VelocityCore.escapeAttribute(JSON.stringify(candidates))}"
                                        data-fallback="${window.VelocityCore.escapeAttribute(fallback)}"
                                        loading="lazy"
                                        decoding="async"
                                    >

                                </span>

                                <span class="search-result-info">

                                    <strong>
                                        ${name}
                                    </strong>

                                    <small>
                                        ${category}
                                    </small>

                                    <b>
                                        ${price}
                                    </b>

                                </span>

                            </button>

                        `;

                    })
                    .join('');

            window.VelocityCore.attachImageFallbacks(
                container
            );
        },


        /* =====================================================
           MOBILE MENU
        ===================================================== */

        toggleMobileMenu() {

            const open =
                document.body.classList.toggle(
                    'mobile-menu-open'
                );

            const button =
                document.querySelector(
                    '[data-mobile-menu]'
                );

            if (button) {

                button.setAttribute(
                    'aria-expanded',
                    String(open)
                );

            }

            const menu =
                document.querySelector(
                    '#mobileMenu'
                );

            if (menu) {

                menu.setAttribute(
                    'aria-hidden',
                    String(!open)
                );

            }
        },


        closeMobileMenu() {

            document.body.classList.remove(
                'mobile-menu-open'
            );

            const button =
                document.querySelector(
                    '[data-mobile-menu]'
                );

            if (button) {

                button.setAttribute(
                    'aria-expanded',
                    'false'
                );

            }

            const menu =
                document.querySelector(
                    '#mobileMenu'
                );

            if (menu) {

                menu.setAttribute(
                    'aria-hidden',
                    'true'
                );

            }
        },


        /* =====================================================
           SCROLL
        ===================================================== */

        scrollTo(selector) {

            if (!selector) {
                return;
            }

            let element;

            try {

                element =
                    document.querySelector(
                        selector
                    );

            } catch (error) {

                console.warn(
                    '[Velocity Store] Invalid selector:',
                    selector
                );

                return;
            }

            if (!element) {
                return;
            }

            const header =
                document.querySelector(
                    '#mainHeader'
                );

            const headerHeight =
                header
                    ? header.offsetHeight
                    : 0;

            const rect =
                element.getBoundingClientRect();

            const targetPosition =
                window.scrollY +
                rect.top -
                headerHeight -
                20;

            window.scrollTo({

                top:
                    Math.max(
                        0,
                        targetPosition
                    ),

                behavior:
                    'smooth'

            });
        },


        /* =====================================================
           ADD TO CART EXPERIENCE
           -----------------------------------------------------
           Important:
           VelocityCartUI owns the visual animation.
           This bridge makes every UI entry point use
           the same experience.
        ===================================================== */

        prepareAddToCart(productId) {

            if (!productId) {
                return null;
            }

            const product =
                window.VelocityCore.getProductById(
                    productId
                );

            if (!product) {
                return null;
            }

            const CartUI =
                window.VelocityCartUI;

            if (
                CartUI &&
                typeof CartUI.prepareExperience ===
                'function'
            ) {

                CartUI.prepareExperience(
                    product
                );

            } else if (
                CartUI &&
                typeof CartUI.handleAddToCart ===
                'function'
            ) {

                const card =
                    window.VelocityCore
                        .findProductCard(
                            productId
                        );

                if (card) {

                    const button =
                        card.querySelector(
                            '[data-cart-id]'
                        );

                    if (button) {

                        CartUI.handleAddToCart(
                            button
                        );

                    }

                }

            }

            return product;
        },


        /* =====================================================
           QUICK VIEW
        ===================================================== */

        openQuickView(productId) {

            const product =
                window.VelocityCore.getProductById(
                    productId
                );

            if (!product) {
                return;
            }

            let modal =
                document.querySelector(
                    '#quick-view-modal'
                );

            if (!modal) {

                modal =
                    document.createElement(
                        'div'
                    );

                modal.id =
                    'quick-view-modal';

                modal.className =
                    'quick-view-modal';

                document.body.appendChild(
                    modal
                );
            }

            const image =
                window.VelocityCore.getProductImage(
                    product
                );

            const fallback =
                window.VelocityCore.getFallbackImage();

            const candidates =
                window.VelocityCore
                    .getProductImageCandidates(
                        product
                    )
                    .slice(1);

            const name =
                window.VelocityCore.escapeHTML(
                    product.name
                );

            const category =
                window.VelocityCore.escapeHTML(
                    product.categoryName ||
                    product.category ||
                    ''
                );

            const rating =
                Number(
                    product.rating || 0
                );

            const stars =
                window.VelocityCore.renderStars(
                    rating
                );

            const price =
                window.VelocityCore.formatPrice(
                    product
                );

            const productIdSafe =
                window.VelocityCore.escapeAttribute(
                    product.id
                );

            modal.innerHTML = `

                <div
                    class="quick-view-backdrop"
                    data-close-quick-view
                ></div>

                <div
                    class="quick-view-content"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Product quick view"
                >

                    <button
                        class="quick-view-close"
                        type="button"
                        data-close-quick-view
                        aria-label="Close"
                    >
                        ×
                    </button>

                    <div class="quick-view-grid">

                        <div class="quick-view-image">

                            <img
                                src="${window.VelocityCore.escapeAttribute(image)}"
                                alt="${window.VelocityCore.escapeAttribute(product.name)}"
                                data-image-candidates="${window.VelocityCore.escapeAttribute(JSON.stringify(candidates))}"
                                data-fallback="${window.VelocityCore.escapeAttribute(fallback)}"
                                loading="eager"
                                decoding="async"
                            >

                        </div>

                        <div class="quick-view-info">

                            <span class="product-category">
                                ${category}
                            </span>

                            <h2>
                                ${name}
                            </h2>

                            <div class="product-rating">

                                <div class="stars">
                                    ${stars}
                                </div>

                                <span>
                                    ${rating.toFixed(1)}
                                </span>

                            </div>

                            <div class="quick-view-price">
                                ${price}
                            </div>

                            <p>
                                Premium product from
                                Velocity Store.
                            </p>

                            <button
                                class="btn btn-primary"
                                type="button"
                                data-quick-add="${productIdSafe}"
                            >
                                Add to cart
                            </button>

                        </div>

                    </div>

                </div>
            `;

            window.VelocityCore.attachImageFallbacks(
                modal
            );

            requestAnimationFrame(() => {

                modal.classList.add(
                    'active'
                );

            });

            document.body.classList.add(
                'quick-view-open'
            );
        },


        closeQuickView(modal) {

            if (!modal) {
                return;
            }

            modal.classList.remove(
                'active'
            );

            document.body.classList.remove(
                'quick-view-open'
            );

            setTimeout(() => {

                if (
                    modal &&
                    modal.parentNode
                ) {

                    modal.remove();

                }

            }, 300);
        },


        /* =====================================================
           WISHLIST
        ===================================================== */

        openWishlist() {

            const Wishlist =
                window.VelocityWishlist;

            if (
                Wishlist &&
                typeof Wishlist.getProducts ===
                'function'
            ) {

                const products =
                    Wishlist.getProducts();

                if (!products.length) {

                    UI.showNotification(
                        'قائمة المفضلة فارغة.',
                        'info'
                    );

                    return;
                }

                UI.showNotification(
                    `لديك ${products.length} منتج في المفضلة.`,
                    'success'
                );

                UI.scrollTo(
                    '#products'
                );

                return;
            }

            UI.showNotification(
                'قائمة المفضلة غير متاحة حالياً.',
                'error'
            );
        },


        /* =====================================================
           NOTIFICATION
        ===================================================== */

        showNotification(
            message,
            type = 'info'
        ) {

            let notification =
                document.querySelector(
                    '#velocity-notification'
                );

            if (!notification) {

                notification =
                    document.createElement(
                        'div'
                    );

                notification.id =
                    'velocity-notification';

                notification.className =
                    'velocity-notification';

                document.body.appendChild(
                    notification
                );
            }

            notification.className =
                `velocity-notification ${type}`;

            notification.textContent =
                message;

            requestAnimationFrame(() => {

                notification.classList.add(
                    'show'
                );

            });

            clearTimeout(
                notification._velocityTimer
            );

            notification._velocityTimer =
                setTimeout(() => {

                    notification.classList.remove(
                        'show'
                    );

                }, 3000);
        },


        /* =====================================================
           CATEGORY FALLBACK
        ===================================================== */

        fallbackCategoryFilter(category) {

            const Products =
                window.VelocityProducts;

            if (!Products) {
                return;
            }

            const container =
                document.querySelector(
                    '#products-grid'
                );

            if (!container) {
                return;
            }

            if (
                typeof Products.getProducts !==
                'function' ||
                typeof Products.renderProducts !==
                'function'
            ) {

                return;
            }

            let productList =
                Products.getProducts() || [];

            if (
                category &&
                category !== 'all'
            ) {

                const normalized =
                    String(category)
                        .toLowerCase()
                        .trim();

                productList =
                    productList.filter(
                        product => {

                            const productCategory =
                                String(
                                    product.category ||
                                    ''
                                )
                                    .toLowerCase()
                                    .trim();

                            return (
                                productCategory ===
                                normalized
                            );
                        }
                    );
            }

            Products.renderProducts(
                container,
                productList
            );

            window.VelocityCore
                .setupImageFallbacks();

            UI.scrollTo(
                '#products'
            );
        },


        /* =====================================================
           SEARCH RESULT CLICK
        ===================================================== */

        openSearchProduct(productId) {

            if (!productId) {
                return;
            }

            UI.closeSearch();

            UI.openQuickView(
                productId
            );
        },


        /* =====================================================
           CLOSE ALL OVERLAYS
        ===================================================== */

        closeAllOverlays() {

            UI.closeSearch();
            UI.closeMobileMenu();

            const quickView =
                document.querySelector(
                    '#quick-view-modal'
                );

            if (quickView) {
                UI.closeQuickView(
                    quickView
                );
            }
        }

    };


    /* =========================================================
       GLOBAL MODULE
    ========================================================= */

    window.VelocityUI =
        UI;


    /* =========================================================
       UI → CART BRIDGE
       ---------------------------------------------------------
       This listener catches Quick View add-to-cart buttons.
       Normal product cards continue to be handled by app.js /
       velocity-cart-ui.js.
    ========================================================= */

    document.addEventListener(
        'click',
        function (event) {

            const quickAdd =
                event.target.closest(
                    '[data-quick-add]'
                );

            if (!quickAdd) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const productId =
                quickAdd.dataset.quickAdd;

            if (!productId) {
                return;
            }

            const product =
                window.VelocityCore.getProductById(
                    productId
                );

            if (!product) {
                return;
            }

            /*
             * IMPORTANT:
             * Prepare the 720° animation BEFORE adding
             * the product to the cart.
             */
            UI.prepareAddToCart(
                productId
            );

            /*
             * Close quick view after preparing animation.
             */
            const modal =
                quickAdd.closest(
                    '#quick-view-modal'
                );

            if (modal) {

                UI.closeQuickView(
                    modal
                );

            }

            /*
             * Add the actual product.
             */
            setTimeout(() => {

                if (
                    window.VelocityCart &&
                    typeof window.VelocityCart.add ===
                    'function'
                ) {

                    window.VelocityCart.add(
                        productId
                    );

                }

            }, 20);

        },
        true
    );

})();
