'use strict';

/* =========================================================
   VELOCITY STORE
   SHOPPING CART
========================================================= */

(function () {

    const STORAGE_KEY =
        'velocity-store-cart';


    let cart = loadCart();


    /* =====================================================
       STORAGE
    ===================================================== */

    function loadCart() {

        try {

            const saved =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!saved) return [];

            const parsed =
                JSON.parse(saved);

            return Array.isArray(parsed)
                ? parsed
                : [];

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
                JSON.stringify(cart)
            );

        } catch (error) {

            console.warn(
                '[Velocity Cart] Could not save cart.',
                error
            );

        }

    }


    /* =====================================================
       ADD
    ===================================================== */

    function add(productId, quantity = 1) {

        if (!window.VelocityProducts) {
            return false;
        }

        const product =
            VelocityProducts.getProductById(
                productId
            );

        if (!product) {

            console.warn(
                '[Velocity Cart] Product not found:',
                productId
            );

            return false;
        }


        const existing =
            cart.find(
                item => item.productId === productId
            );


        if (existing) {

            existing.quantity += quantity;

        } else {

            cart.push({

                productId: product.id,

                quantity: Math.max(
                    1,
                    Number(quantity) || 1
                )

            });

        }


        saveCart();

        render();

        open();

        emitChange();

        showAddedMessage(product);

        return true;

    }


    /* =====================================================
       REMOVE
    ===================================================== */

    function remove(productId) {

        cart =
            cart.filter(
                item => item.productId !== productId
            );

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
                item => item.productId === productId
            );

        if (!item) return;

        const value =
            Math.floor(
                Number(quantity)
            );


        if (!Number.isFinite(value) || value <= 0) {

            remove(productId);

            return;
        }


        item.quantity = value;

        saveCart();

        render();

        emitChange();

    }


    /* =====================================================
       CLEAR
    ===================================================== */

    function clear() {

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
            (total, item) =>
                total + item.quantity,
            0
        );

    }


    /* =====================================================
       TOTAL PRICE
    ===================================================== */

    function getTotalPrice() {

        if (!window.VelocityProducts) {
            return 0;
        }

        return cart.reduce(
            (total, item) => {

                const product =
                    VelocityProducts.getProductById(
                        item.productId
                    );

                if (!product) {
                    return total;
                }

                return total +
                    (product.price * item.quantity);

            },
            0
        );

    }


    /* =====================================================
       GET CART
    ===================================================== */

    function getCart() {

        return cart.map(item => {

            const product =
                VelocityProducts.getProductById(
                    item.productId
                );

            return {

                ...item,

                product

            };

        }).filter(
            item => item.product
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


        if (!drawer) return;


        drawer.classList.add('active');

        if (overlay) {
            overlay.classList.add('active');
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
            drawer.classList.remove('active');
        }

        if (overlay) {
            overlay.classList.remove('active');
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
            document.createElement('div');

        overlay.id =
            'cart-overlay';

        overlay.className =
            'cart-overlay';


        const drawer =
            document.createElement('aside');

        drawer.id =
            'cart-drawer';

        drawer.className =
            'cart-drawer';

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


        document.body.appendChild(overlay);

        document.body.appendChild(drawer);


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

    function handleDrawerClick(event) {

        const closeButton =
            event.target.closest(
                '[data-cart-close]'
            );

        if (closeButton) {

            close();

            return;
        }


        const clearButton =
            event.target.closest(
                '[data-cart-clear]'
            );

        if (clearButton) {

            clear();

            return;
        }


        const checkoutButton =
            event.target.closest(
                '[data-cart-checkout]'
            );

        if (checkoutButton) {

            checkout();

            return;
        }


        const removeButton =
            event.target.closest(
                '[data-cart-remove]'
            );

        if (removeButton) {

            remove(
                removeButton.dataset.cartRemove
            );

            return;
        }


        const quantityButton =
            event.target.closest(
                '[data-cart-quantity]'
            );

        if (quantityButton) {

            const productId =
                quantityButton.dataset.productId;

            const change =
                Number(
                    quantityButton.dataset.cartQuantity
                );

            const item =
                cart.find(
                    item =>
                        item.productId === productId
                );

            if (!item) return;

            updateQuantity(
                productId,
                item.quantity + change
            );

        }

    }


    /* =====================================================
       RENDER CART
    ===================================================== */

    function render() {

        const itemsContainer =
            document.querySelector(
                '#cart-items'
            );

        const totalElement =
            document.querySelector(
                '#cart-total'
            );


        updateCartBadges();


        if (!itemsContainer) return;


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
                items.map(createCartItem).join('');

        }


        if (totalElement) {

            totalElement.textContent =
                VelocityProducts.formatPrice(
                    getTotalPrice()
                );

        }

    }


    /* =====================================================
       CART ITEM
    ===================================================== */

    function createCartItem(item) {

        const product =
            item.product;


        return `

            <div
                class="cart-item"
                data-cart-item="${product.id}"
            >

                <div class="cart-item-image">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                    />

                </div>


                <div class="cart-item-info">

                    <h4>
                        ${product.name}
                    </h4>

                    <strong>
                        ${VelocityProducts.formatPrice(
                            product.price,
                            product.currency
                        )}
                    </strong>


                    <div class="cart-item-controls">

                        <button
                            type="button"
                            data-product-id="${product.id}"
                            data-cart-quantity="-1"
                        >
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            type="button"
                            data-product-id="${product.id}"
                            data-cart-quantity="1"
                        >
                            +
                        </button>

                    </div>

                </div>


                <button
                    type="button"
                    class="cart-item-remove"
                    data-cart-remove="${product.id}"
                    aria-label="حذف المنتج"
                >
                    ×
                </button>

            </div>
        `;

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
            .forEach(element => {

                element.textContent =
                    total;

                element.classList.toggle(
                    'has-items',
                    total > 0
                );

            });

    }


    /* =====================================================
       ADDED MESSAGE
    ===================================================== */

    function showAddedMessage(product) {

        let toast =
            document.querySelector(
                '#velocity-toast'
            );


        if (!toast) {

            toast =
                document.createElement('div');

            toast.id =
                'velocity-toast';

            toast.className =
                'velocity-toast';

            document.body.appendChild(toast);

        }


        toast.textContent =
            `${product.name} تمت إضافته للسلة ✓`;

        toast.classList.add('show');


        clearTimeout(
            toast._timer
        );


        toast._timer =
            setTimeout(() => {

                toast.classList.remove(
                    'show'
                );

            }, 2500);

    }


    /* =====================================================
       CHECKOUT PLACEHOLDER
    ===================================================== */

    function checkout() {

        if (!cart.length) {

            return;

        }


        document.dispatchEvent(
            new CustomEvent(
                'velocity:checkout-requested',
                {
                    detail: {
                        cart: getCart(),
                        total: getTotalPrice()
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
                        items: getCart(),
                        totalItems: getTotalItems(),
                        totalPrice: getTotalPrice()
                    }
                }
            )
        );

    }


    /* =====================================================
       INIT
    ===================================================== */

    function init() {

        createDrawer();

        render();


        document.addEventListener(
            'click',
            event => {

                const openButton =
                    event.target.closest(
                        '[data-cart-open]'
                    );

                if (openButton) {

                    open();

                }


                const addButton =
                    event.target.closest(
                        '[data-cart-id]'
                    );

                if (
                    addButton &&
                    window.VelocityProducts
                ) {

                    add(
                        addButton.dataset.cartId
                    );

                }

            }
        );

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


    /*
    =========================================================
    WAIT FOR PRODUCTS
    =========================================================
    */

    if (
        document.readyState === 'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            init
        );

    } else {

        init();

    }

})();
