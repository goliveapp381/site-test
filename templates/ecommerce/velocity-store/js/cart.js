'use strict';

/* =========================================================
   VELOCITY STORE
   SHOPPING CART
   ---------------------------------------------------------
   - LocalStorage cart
   - Add / remove / quantity
   - Dynamic cart drawer
   - Product image fallback
   - Cart badges
   - Checkout event
   - Safe initialization
========================================================= */

(function () {

    const STORAGE_KEY =
        'velocity-store-cart';


    let cart =
        loadCart();


    let initialized =
        false;


    /* =====================================================
       STORAGE
    ===================================================== */

    function loadCart() {

        try {

            const saved =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (!saved) {
                return [];
            }


            const parsed =
                JSON.parse(
                    saved
                );


            if (
                !Array.isArray(
                    parsed
                )
            ) {

                return [];

            }


            /*
             * تنظيف البيانات القديمة
             * أو corrupted cart data.
             */

            return parsed
                .filter(
                    item =>
                        item &&
                        typeof item.productId ===
                            'string' &&
                        Number(item.quantity) > 0
                )
                .map(
                    item => ({
                        productId:
                            item.productId,

                        quantity:
                            Math.max(
                                1,
                                Math.floor(
                                    Number(
                                        item.quantity
                                    )
                                )
                            )
                    })
                );

        } catch (error) {

            console.warn(
                '[Velocity Cart] Could not load cart.',
                error
            );


            return [];

        }

    }


    function saveCart() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    cart
                )
            );


            return true;

        } catch (error) {

            console.warn(
                '[Velocity Cart] Could not save cart.',
                error
            );


            return false;

        }

    }


    /* =====================================================
       PRODUCT
    ===================================================== */

    function getProduct(
        productId
    ) {

        if (
            !window.VelocityProducts ||
            typeof window.VelocityProducts
                .getProductById !==
                'function'
        ) {

            return null;

        }


        return window.VelocityProducts
            .getProductById(
                productId
            );

    }


    /* =====================================================
       ADD
    ===================================================== */

    function add(
        productId,
        quantity = 1
    ) {

        const product =
            getProduct(
                productId
            );


        if (!product) {

            console.warn(
                '[Velocity Cart] Product not found:',
                productId
            );


            return false;

        }


        const normalizedQuantity =
            Math.max(
                1,
                Math.floor(
                    Number(quantity) || 1
                )
            );


        const existing =
            cart.find(
                item =>
                    item.productId ===
                    String(productId)
            );


        if (existing) {

            existing.quantity +=
                normalizedQuantity;

        } else {

            cart.push({

                productId:
                    String(
                        product.id
                    ),

                quantity:
                    normalizedQuantity

            });

        }


        /*
         * Stock protection.
         */

        if (
            Number.isFinite(
                Number(product.stock)
            ) &&
            Number(product.stock) >= 0
        ) {

            const item =
                cart.find(
                    entry =>
                        entry.productId ===
                        String(product.id)
                );


            if (item) {

                item.quantity =
                    Math.min(
                        item.quantity,
                        Number(
                            product.stock
                        )
                    );


                if (
                    item.quantity <= 0
                ) {

                    cart =
                        cart.filter(
                            entry =>
                                entry.productId !==
                                String(product.id)
                        );

                    saveCart();

                    render();

                    emitChange();

                    return false;

                }

            }

        }


        saveCart();

        render();

        open();

        emitChange();

        showAddedMessage(
            product
        );


        return true;

    }


    /* =====================================================
       REMOVE
    ===================================================== */

    function remove(
        productId
    ) {

        const before =
            cart.length;


        cart =
            cart.filter(
                item =>
                    item.productId !==
                    String(productId)
            );


        if (
            cart.length ===
            before
        ) {

            return;

        }


        saveCart();

        render();

        emitChange();

    }


    /* =====================================================
       UPDATE QUANTITY
    ===================================================== */

    function updateQuantity(
        productId,
        quantity
    ) {

        const item =
            cart.find(
                entry =>
                    entry.productId ===
                    String(productId)
            );


        if (!item) {
            return;
        }


        let value =
            Math.floor(
                Number(quantity)
            );


        if (
            !Number.isFinite(
                value
            ) ||
            value <= 0
        ) {

            remove(
                productId
            );

            return;

        }


        const product =
            getProduct(
                productId
            );


        /*
         * Respect stock if available.
         */

        if (
            product &&
            Number.isFinite(
                Number(product.stock)
            ) &&
            Number(product.stock) >= 0
        ) {

            value =
                Math.min(
                    value,
                    Number(
                        product.stock
                    )
                );

        }


        if (
            value <= 0
        ) {

            remove(
                productId
            );

            return;

        }


        item.quantity =
            value;


        saveCart();

        render();

        emitChange();

    }


    /* =====================================================
       CLEAR
    ===================================================== */

    function clear() {

        if (!cart.length) {
            return;
        }


        cart = [];


        saveCart();

        render();

        emitChange();

    }


    /* =====================================================
       TOTAL ITEMS
    ===================================================== */

    function getTotalItems() {

        return cart.reduce(
            (
                total,
                item
            ) => {

                const quantity =
                    Number(
                        item.quantity
                    );


                if (
                    !Number.isFinite(
                        quantity
                    )
                ) {

                    return total;

                }


                return (
                    total +
                    Math.max(
                        0,
                        quantity
                    )
                );

            },
            0
        );

    }


    /* =====================================================
       TOTAL PRICE
    ===================================================== */

    function getTotalPrice() {

        if (
            !window.VelocityProducts
        ) {

            return 0;

        }


        return cart.reduce(
            (
                total,
                item
            ) => {

                const product =
                    getProduct(
                        item.productId
                    );


                if (!product) {

                    return total;

                }


                const price =
                    Number(
                        product.price
                    );


                const quantity =
                    Number(
                        item.quantity
                    );


                if (
                    !Number.isFinite(
                        price
                    ) ||
                    !Number.isFinite(
                        quantity
                    )
                ) {

                    return total;

                }


                return (
                    total +
                    (
                        price *
                        quantity
                    )
                );

            },
            0
        );

    }


    /* =====================================================
       GET CART
    ===================================================== */

    function getCart() {

        return cart
            .map(
                item => {

                    const product =
                        getProduct(
                            item.productId
                        );


                    return {

                        ...item,

                        product

                    };

                }
            )
            .filter(
                item =>
                    Boolean(
                        item.product
                    )
            );

    }


    /* =====================================================
       PRODUCT IMAGE
    ===================================================== */

    function getProductImage(
        product
    ) {

        if (!product) {
            return '';
        }


        /*
         * الأفضل:
         * products.js يكون فيه getProductImage().
         */

        if (
            window.VelocityProducts &&
            typeof window.VelocityProducts
                .getProductImage ===
                'function'
        ) {

            return window.VelocityProducts
                .getProductImage(
                    product
                );

        }


        /*
         * URL مباشرة.
         */

        if (
            product.image &&
            /^https?:\/\//i.test(
                product.image
            )
        ) {

            return product.image;

        }


        /*
         * Local path.
         */

        if (
            product.image
        ) {

            if (
                String(
                    product.image
                ).startsWith(
                    'assets/'
                )
            ) {

                return product.image;

            }


            return (
                `assets/images/` +
                product.image
            );

        }


        /*
         * Web fallback.
         */

        return (
            product.imageUrl ||
            product.fallbackImage ||
            ''
        );

    }


    /* =====================================================
       OPEN CART
    ===================================================== */

    function open() {

        const drawer =
            document.querySelector(
                '#cart-drawer'
            );


        const overlay =
            document.querySelector(
                '#cart-overlay'
            );


        if (!drawer) {
            return;
        }


        drawer.classList.add(
            'active'
        );


        if (overlay) {

            overlay.classList.add(
                'active'
            );

        }


        document.body.classList.add(
            'cart-open'
        );

    }


    /* =====================================================
       CLOSE CART
    ===================================================== */

    function close() {

        const drawer =
            document.querySelector(
                '#cart-drawer'
            );


        const overlay =
            document.querySelector(
                '#cart-overlay'
            );


        if (drawer) {

            drawer.classList.remove(
                'active'
            );

        }


        if (overlay) {

            overlay.classList.remove(
                'active'
            );

        }


        document.body.classList.remove(
            'cart-open'
        );

    }


    /* =====================================================
       CREATE DRAWER
    ===================================================== */

    function createDrawer() {

        if (
            document.querySelector(
                '#cart-drawer'
            )
        ) {

            return;

        }


        const overlay =
            document.createElement(
                'div'
            );


        overlay.id =
            'cart-overlay';


        overlay.className =
            'cart-overlay';


        const drawer =
            document.createElement(
                'aside'
            );


        drawer.id =
            'cart-drawer';


        drawer.className =
            'cart-drawer';


        drawer.setAttribute(
            'aria-hidden',
            'true'
        );


        drawer.innerHTML = `

            <div class="cart-header">

                <div>

                    <span class="cart-eyebrow">
                        VELOCITY
                    </span>

                    <h2>
                        سلة التسوق
                    </h2>

                </div>

                <button
                    type="button"
                    class="cart-close"
                    data-cart-close
                    aria-label="إغلاق السلة"
                >
                    ×
                </button>

            </div>


            <div
                class="cart-items"
                id="cart-items"
            ></div>


            <div class="cart-footer">

                <div class="cart-total-row">

                    <span>
                        المجموع
                    </span>

                    <strong id="cart-total">
                        0 DH
                    </strong>

                </div>


                <button
                    type="button"
                    class="btn btn-primary cart-checkout"
                    data-cart-checkout
                >
                    إتمام الطلب
                </button>


                <button
                    type="button"
                    class="cart-clear"
                    data-cart-clear
                >
                    إفراغ السلة
                </button>

            </div>

        `;


        document.body.appendChild(
            overlay
        );


        document.body.appendChild(
            drawer
        );


        overlay.addEventListener(
            'click',
            close
        );


        drawer.addEventListener(
            'click',
            handleDrawerClick
        );


        render();

    }


    /* =====================================================
       DRAWER EVENTS
    ===================================================== */

    function handleDrawerClick(
        event
    ) {

        /* ---------------------------------------------
           CLOSE
        --------------------------------------------- */

        const closeButton =
            event.target.closest(
                '[data-cart-close]'
            );


        if (closeButton) {

            close();

            return;

        }


        /* ---------------------------------------------
           CLEAR
        --------------------------------------------- */

        const clearButton =
            event.target.closest(
                '[data-cart-clear]'
            );


        if (clearButton) {

            clear();

            return;

        }


        /* ---------------------------------------------
           CHECKOUT
        --------------------------------------------- */

        const checkoutButton =
            event.target.closest(
                '[data-cart-checkout]'
            );


        if (checkoutButton) {

            checkout();

            return;

        }


        /* ---------------------------------------------
           REMOVE
        --------------------------------------------- */

        const removeButton =
            event.target.closest(
                '[data-cart-remove]'
            );


        if (removeButton) {

            remove(
                removeButton.dataset
                    .cartRemove
            );

            return;

        }


        /* ---------------------------------------------
           QUANTITY
        --------------------------------------------- */

        const quantityButton =
            event.target.closest(
                '[data-cart-quantity]'
            );


        if (quantityButton) {

            const productId =
                quantityButton.dataset
                    .productId;


            const change =
                Number(
                    quantityButton.dataset
                        .cartQuantity
                );


            if (
                !productId ||
                !Number.isFinite(
                    change
                )
            ) {

                return;

            }


            const item =
                cart.find(
                    entry =>
                        entry.productId ===
                        productId
                );


            if (!item) {
                return;
            }


            updateQuantity(
                productId,
                item.quantity +
                    change
            );

        }

    }


    /* =====================================================
       RENDER CART
    ===================================================== */

    function render() {

        updateCartBadges();


        const itemsContainer =
            document.querySelector(
                '#cart-items'
            );


        const totalElement =
            document.querySelector(
                '#cart-total'
            );


        const drawer =
            document.querySelector(
                '#cart-drawer'
            );


        if (drawer) {

            drawer.setAttribute(
                'aria-hidden',
                drawer.classList.contains(
                    'active'
                )
                    ? 'false'
                    : 'true'
            );

        }


        if (!itemsContainer) {
            return;
        }


        const items =
            getCart();


        if (!items.length) {

            itemsContainer.innerHTML = `

                <div class="cart-empty">

                    <div class="cart-empty-icon">
                        🛒
                    </div>

                    <h3>
                        السلة فارغة
                    </h3>

                    <p>
                        أضف بعض المنتجات الرائعة
                        باش تبدا التسوق.
                    </p>

                </div>

            `;

        } else {

            itemsContainer.innerHTML =
                items
                    .map(
                        createCartItem
                    )
                    .join('');

        }


        if (
            totalElement &&
            window.VelocityProducts &&
            typeof window.VelocityProducts
                .formatPrice ===
                'function'
        ) {

            totalElement.textContent =
                VelocityProducts.formatPrice(
                    getTotalPrice()
                );

        }


        /*
         * الصور الجديدة:
         * local first → Web fallback.
         */

        setupCartImageFallbacks(
            itemsContainer
        );

    }


    /* =====================================================
       CART ITEM
    ===================================================== */

    function createCartItem(
        item
    ) {

        const product =
            item.product;


        if (!product) {
            return '';
        }


        const image =
            getProductImage(
                product
            );


        const fallback =
            product.imageUrl ||
            product.fallbackImage ||
            '';


        const name =
            escapeHTML(
                product.name || ''
            );


        const productId =
            escapeAttribute(
                product.id
            );


        const price =
            window.VelocityProducts &&
            typeof window.VelocityProducts
                .formatPrice ===
                'function'
                ? VelocityProducts.formatPrice(
                    product.price,
                    product.currency
                )
                : `${product.price || 0} DH`;


        return `

            <div
                class="cart-item"
                data-cart-item="${productId}"
            >

                <div class="cart-item-image">

                    <img
                        src="${escapeAttribute(image)}"
                        data-fallback="${escapeAttribute(fallback)}"
                        alt="${escapeAttribute(product.name || '')}"
                        loading="lazy"
                    />

                </div>


                <div class="cart-item-info">

                    <h4>
                        ${name}
                    </h4>

                    <strong>
                        ${price}
                    </strong>


                    <div
                        class="cart-item-controls"
                    >

                        <button
                            type="button"
                            data-product-id="${productId}"
                            data-cart-quantity="-1"
                            aria-label="نقص الكمية"
                        >
                            −
                        </button>


                        <span>
                            ${item.quantity}
                        </span>


                        <button
                            type="button"
                            data-product-id="${productId}"
                            data-cart-quantity="1"
                            aria-label="زيادة الكمية"
                        >
                            +
                        </button>

                    </div>

                </div>


                <button
                    type="button"
                    class="cart-item-remove"
                    data-cart-remove="${productId}"
                    aria-label="حذف المنتج"
                >
                    ×
                </button>

            </div>

        `;

    }


    /* =====================================================
       CART IMAGE FALLBACK
    ===================================================== */

    function setupCartImageFallbacks(
        container
    ) {

        if (!container) {
            return;
        }


        container
            .querySelectorAll(
                'img[data-fallback]'
            )
            .forEach(
                image => {

                    if (
                        image.dataset
                            .velocityFallbackReady
                    ) {

                        return;

                    }


                    image.dataset
                        .velocityFallbackReady =
                        'true';


                    image.addEventListener(
                        'error',
                        () => {

                            const fallback =
                                image.dataset
                                    .fallback;


                            if (
                                !fallback ||
                                image.dataset
                                    .fallbackUsed ===
                                    'true'
                            ) {

                                image.style.visibility =
                                    'hidden';

                                return;

                            }


                            image.dataset
                                .fallbackUsed =
                                'true';


                            image.src =
                                fallback;

                        }
                    );

                }
            );

    }


    /* =====================================================
       CART BADGES
    ===================================================== */

    function updateCartBadges() {

        const total =
            getTotalItems();


        document
            .querySelectorAll(
                '[data-cart-count]'
            )
            .forEach(
                element => {

                    element.textContent =
                        total;


                    element.classList.toggle(
                        'has-items',
                        total > 0
                    );


                    element.setAttribute(
                        'aria-label',
                        `${total} منتجات في السلة`
                    );

                }
            );

    }


    /* =====================================================
       ADDED MESSAGE
    ===================================================== */

    function showAddedMessage(
        product
    ) {

        if (!product) {
            return;
        }


        let toast =
            document.querySelector(
                '#velocity-toast'
            );


        if (!toast) {

            toast =
                document.createElement(
                    'div'
                );


            toast.id =
                'velocity-toast';


            toast.className =
                'velocity-toast';


            document.body.appendChild(
                toast
            );

        }


        toast.textContent =
            `${product.name} تمت إضافته للسلة ✓`;


        toast.classList.add(
            'show'
        );


        clearTimeout(
            toast._timer
        );


        toast._timer =
            setTimeout(
                () => {

                    toast.classList.remove(
                        'show'
                    );

                },
                2500
            );

    }


    /* =====================================================
       CHECKOUT
    ===================================================== */

    function checkout() {

        if (!cart.length) {

            showAddedMessage({
                name:
                    'السلة فارغة'
            });

            return;

        }


        document.dispatchEvent(
            new CustomEvent(
                'velocity:checkout-requested',
                {
                    detail: {

                        cart:
                            getCart(),

                        total:
                            getTotalPrice()

                    }
                }
            )
        );


        console.log(
            '[Velocity Cart] Checkout requested.'
        );

    }


    /* =====================================================
       CHANGE EVENT
    ===================================================== */

    function emitChange() {

        document.dispatchEvent(
            new CustomEvent(
                'velocity:cart-changed',
                {
                    detail: {

                        items:
                            getCart(),

                        totalItems:
                            getTotalItems(),

                        totalPrice:
                            getTotalPrice()

                    }
                }
            )
        );

    }


    /* =====================================================
       HTML SAFETY
    ===================================================== */

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ''
        )
            .replace(
                /&/g,
                '&amp;'
            )
            .replace(
                /</g,
                '&lt;'
            )
            .replace(
                />/g,
                '&gt;'
            )
            .replace(
                /"/g,
                '&quot;'
            )
            .replace(
                /'/g,
                '&#039;'
            );

    }


    function escapeAttribute(
        value
    ) {

        return escapeHTML(
            value
        );

    }


    /* =====================================================
       INIT
    ===================================================== */

    function init() {

        if (initialized) {
            return;
        }


        initialized = true;


        createDrawer();

        render();


        /*
         * Event delegation:
         * حتى Product Cards اللي كتتولد
         * من بعد تبقى خدامة.
         */

        document.addEventListener(
            'click',
            event => {

                /* -----------------------------------------
                   OPEN CART
                ----------------------------------------- */

                const openButton =
                    event.target.closest(
                        '[data-cart-open]'
                    );


                if (openButton) {

                    event.preventDefault();

                    open();

                    return;

                }


                /* -----------------------------------------
                   ADD PRODUCT
                ----------------------------------------- */

                const addButton =
                    event.target.closest(
                        '[data-cart-id]'
                    );


                if (
                    addButton &&
                    window.VelocityProducts
                ) {

                    event.preventDefault();


                    add(
                        addButton.dataset
                            .cartId
                    );

                }

            }
        );


        /*
         * إذا products.js كان جاهز
         * نعيد رسم السلة.
         */

        if (
            window.VelocityProducts
        ) {

            render();

        }

    }


    /* =====================================================
       GLOBAL API
    ===================================================== */

    window.VelocityCart = {

        init,

        add,

        remove,

        updateQuantity,

        clear,

        open,

        close,

        render,

        getCart,

        getTotalItems,

        getTotalPrice

    };


    /* =====================================================
       DOM READY
    ===================================================== */

    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            init,
            {
                once: true
            }
        );

    } else {

        init();

    }

})();
