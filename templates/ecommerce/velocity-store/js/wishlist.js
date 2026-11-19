'use strict';

/* =========================================================
   VELOCITY STORE
   WISHLIST SYSTEM
========================================================= */

(function () {

    const STORAGE_KEY = 'velocity-store-wishlist';

    let wishlist = loadWishlist();


    /* =====================================================
       LOAD
    ===================================================== */

    function loadWishlist() {

        try {

            const saved =
                localStorage.getItem(STORAGE_KEY);

            if (!saved) return [];

            const parsed = JSON.parse(saved);

            return Array.isArray(parsed)
                ? parsed
                : [];

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

        } catch (error) {

            console.warn(
                '[Velocity Wishlist] Failed to save wishlist.',
                error
            );

        }

    }


    /* =====================================================
       CHECK
    ===================================================== */

    function has(productId) {

        return wishlist.includes(productId);

    }


    /* =====================================================
       ADD
    ===================================================== */

    function add(productId) {

        if (!productId) return false;

        if (has(productId)) {
            return false;
        }

        wishlist.push(productId);

        saveWishlist();

        updateUI();

        emitChange();

        return true;

    }


    /* =====================================================
       REMOVE
    ===================================================== */

    function remove(productId) {

        wishlist =
            wishlist.filter(
                id => id !== productId
            );

        saveWishlist();

        updateUI();

        emitChange();

    }


    /* =====================================================
       TOGGLE
    ===================================================== */

    function toggle(productId) {

        if (has(productId)) {

            remove(productId);

            showMessage('تمت إزالة المنتج من المفضلة');

            return false;

        }

        add(productId);

        showMessage('تمت إضافة المنتج للمفضلة ❤️');

        return true;

    }


    /* =====================================================
       GET PRODUCTS
    ===================================================== */

    function getProducts() {

        if (!window.VelocityProducts) {
            return [];
        }

        return wishlist
            .map(id =>
                VelocityProducts.getProductById(id)
            )
            .filter(Boolean);

    }


    /* =====================================================
       UPDATE BUTTONS
    ===================================================== */

    function updateUI() {

        document
            .querySelectorAll(
                '[data-wishlist-id]'
            )
            .forEach(button => {

                const productId =
                    button.dataset.wishlistId;

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

                button.innerHTML =
                    active ? '♥' : '♡';

            });


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

            document.body.appendChild(toast);

        }

        toast.textContent = message;

        toast.classList.add('show');

        clearTimeout(
            toast._wishlistTimer
        );

        toast._wishlistTimer =
            setTimeout(() => {

                toast.classList.remove('show');

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
                        ids: [...wishlist],
                        products: getProducts(),
                        count: wishlist.length
                    }
                }
            )
        );

    }


    /* =====================================================
       INIT
    ===================================================== */

    function init() {

        updateUI();

        document.addEventListener(
            'click',
            event => {

                const button =
                    event.target.closest(
                        '[data-wishlist-id]'
                    );

                if (!button) return;

                event.preventDefault();

                toggle(
                    button.dataset.wishlistId
                );

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
        getProducts,
        updateUI

    };


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
