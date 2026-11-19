'use strict';

/* =========================================================
   VELOCITY STORE
   WISHLIST SYSTEM
   Persistent + Safe + Dynamic UI
========================================================= */

(function () {

    const STORAGE_KEY = 'velocity-store-wishlist';

    let wishlist = loadWishlist();
    let initialized = false;


    /* =====================================================
       NORMALIZE ID
    ===================================================== */

    function normalizeId(productId) {

        if (
            productId === null ||
            productId === undefined
        ) {
            return '';
        }

        return String(productId).trim();

    }


    /* =====================================================
       LOAD
    ===================================================== */

    function loadWishlist() {

        try {

            const saved =
                localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return [];
            }

            const parsed =
                JSON.parse(saved);

            if (!Array.isArray(parsed)) {
                return [];
            }

            /*
             * Keep only valid unique IDs.
             */

            return [
                ...new Set(
                    parsed
                        .map(normalizeId)
                        .filter(Boolean)
                )
            ];

        } catch (error) {

            console.warn(
                '[Velocity Wishlist] Failed to load wishlist.',
                error
            );

            return [];

        }

    }


    /* =====================================================
       SAVE
    ===================================================== */

    function saveWishlist() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(wishlist)
            );

            return true;

        } catch (error) {

            console.warn(
                '[Velocity Wishlist] Failed to save wishlist.',
                error
            );

            return false;

        }

    }


    /* =====================================================
       CHECK
    ===================================================== */

    function has(productId) {

        const id =
            normalizeId(productId);

        if (!id) {
            return false;
        }

        return wishlist.includes(id);

    }


    /* =====================================================
       ADD
    ===================================================== */

    function add(productId) {

        const id =
            normalizeId(productId);

        if (!id) {
            return false;
        }

        /*
         * If product database exists,
         * don't allow unknown products.
         */

        if (
            window.VelocityProducts &&
            typeof window.VelocityProducts.getProductById === 'function'
        ) {

            const product =
                window.VelocityProducts.getProductById(id);

            if (!product) {

                console.warn(
                    '[Velocity Wishlist] Product not found:',
                    id
                );

                return false;

            }

        }


        if (has(id)) {
            return false;
        }


        wishlist.push(id);

        saveWishlist();

        updateUI();

        emitChange();

        return true;

    }


    /* =====================================================
       REMOVE
    ===================================================== */

    function remove(productId) {

        const id =
            normalizeId(productId);

        if (!id) {
            return false;
        }

        const oldLength =
            wishlist.length;

        wishlist =
            wishlist.filter(
                wishlistId =>
                    wishlistId !== id
            );

        if (wishlist.length === oldLength) {
            return false;
        }

        saveWishlist();

        updateUI();

        emitChange();

        return true;

    }


    /* =====================================================
       TOGGLE
    ===================================================== */

    function toggle(productId) {

        const id =
            normalizeId(productId);

        if (!id) {
            return false;
        }


        if (has(id)) {

            remove(id);

            showMessage(
                'تمت إزالة المنتج من المفضلة'
            );

            return false;

        }


        const added =
            add(id);

        if (added) {

            showMessage(
                'تمت إضافة المنتج للمفضلة ❤️'
            );

        }

        return added;

    }


    /* =====================================================
       CLEAR
    ===================================================== */

    function clear() {

        if (!wishlist.length) {
            return;
        }

        wishlist = [];

        saveWishlist();

        updateUI();

        emitChange();

    }


    /* =====================================================
       GET IDS
    ===================================================== */

    function getIds() {

        return [...wishlist];

    }


    /* =====================================================
       GET PRODUCTS
    ===================================================== */

    function getProducts() {

        if (
            !window.VelocityProducts ||
            typeof window.VelocityProducts.getProductById !== 'function'
        ) {
            return [];
        }

        return wishlist
            .map(id =>
                window.VelocityProducts.getProductById(id)
            )
            .filter(Boolean);

    }


    /* =====================================================
       GET COUNT
    ===================================================== */

    function getCount() {

        return wishlist.length;

    }


    /* =====================================================
       UPDATE BUTTONS
    ===================================================== */

    function updateUI() {

        /*
         * Product wishlist buttons
         */

        document
            .querySelectorAll(
                '[data-wishlist-id]'
            )
            .forEach(button => {

                const productId =
                    normalizeId(
                        button.dataset.wishlistId
                    );

                const active =
                    has(productId);


                button.classList.toggle(
                    'active',
                    active
                );


                button.setAttribute(
                    'aria-pressed',
                    String(active)
                );


                button.setAttribute(
                    'aria-label',
                    active
                        ? 'إزالة من المفضلة'
                        : 'إضافة إلى المفضلة'
                );


                /*
                 * Don't destroy inner custom HTML
                 * if the button contains an icon.
                 */

                if (
                    button.dataset.wishlistIcon !== 'custom'
                ) {

                    button.textContent =
                        active
                            ? '♥'
                            : '♡';

                }

            });


        /*
         * Wishlist counters
         */

        document
            .querySelectorAll(
                '[data-wishlist-count]'
            )
            .forEach(element => {

                element.textContent =
                    wishlist.length;

                element.classList.toggle(
                    'has-items',
                    wishlist.length > 0
                );

                element.setAttribute(
                    'aria-label',
                    `المفضلة: ${wishlist.length}`
                );

            });


        /*
         * Header wishlist buttons
         */

        document
            .querySelectorAll(
                '[data-wishlist-open]'
            )
            .forEach(button => {

                button.classList.toggle(
                    'has-items',
                    wishlist.length > 0
                );

            });

    }


    /* =====================================================
       MESSAGE
    ===================================================== */

    function showMessage(message) {

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

            document.body.appendChild(
                toast
            );

        }


        toast.textContent =
            String(message || '');


        toast.classList.add(
            'show'
        );


        clearTimeout(
            toast._wishlistTimer
        );


        toast._wishlistTimer =
            setTimeout(() => {

                toast.classList.remove(
                    'show'
                );

            }, 2200);

    }


    /* =====================================================
       CHANGE EVENT
    ===================================================== */

    function emitChange() {

        document.dispatchEvent(
            new CustomEvent(
                'velocity:wishlist-changed',
                {
                    detail: {

                        ids: [
                            ...wishlist
                        ],

                        products:
                            getProducts(),

                        count:
                            wishlist.length

                    }
                }
            )
        );

    }


    /* =====================================================
       HANDLE CLICK
    ===================================================== */

    function handleClick(event) {

        const button =
            event.target.closest(
                '[data-wishlist-id]'
            );

        if (!button) {
            return;
        }

        if (
            !document.documentElement.contains(
                button
            )
        ) {
            return;
        }

        event.preventDefault();

        event.stopPropagation();

        toggle(
            button.dataset.wishlistId
        );

    }


    /* =====================================================
       INIT
    ===================================================== */

    function init() {

        if (initialized) {
            updateUI();
            return;
        }

        initialized = true;

        updateUI();


        document.addEventListener(
            'click',
            handleClick
        );


        /*
         * Product cards are dynamically generated.
         * Re-sync wishlist state whenever products
         * are rendered.
         */

        document.addEventListener(
            'velocity:products-rendered',
            () => {

                updateUI();

            }
        );


        document.addEventListener(
            'velocity:filters-applied',
            () => {

                updateUI();

            }
        );

    }


    /* =====================================================
       GLOBAL API
    ===================================================== */

    window.VelocityWishlist = {

        init,

        add,

        remove,

        toggle,

        has,

        clear,

        getIds,

        getProducts,

        getCount,

        updateUI

    };


    /* =====================================================
       AUTO INIT
    ===================================================== */

    if (
        document.readyState === 'loading'
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
