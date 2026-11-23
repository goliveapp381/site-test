/* js/cart.js */
'use strict';

(() => {
    const STORAGE_KEY = 'shop_tshirt_cart_v1';
    let cart = [];

    function loadCart() {
        try {
            cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            if (!Array.isArray(cart)) cart = [];
        } catch {
            cart = [];
        }
        updateBadge();
    }

    function saveCart() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        } catch {}
        updateBadge();
    }

    function updateBadge() {
        const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
        document.querySelectorAll('[data-cart-count], #cartCount').forEach(el => {
            el.textContent = String(totalQty);
        });
    }

    function addToCart(item) {
        if (!item) return;
        const existing = cart.find(x => x.id === item.id);
        if (existing) {
            existing.qty = (existing.qty || 1) + 1;
        } else {
            cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
        }
        saveCart();
    }

    window.ShopTshirtCart = { addToCart, getItems: () => [...cart] };

    document.addEventListener('DOMContentLoaded', loadCart);
    document.addEventListener('click', event => {
        const addBtn = event.target.closest('[data-add-garment]');
        if (addBtn) {
            const id = addBtn.getAttribute('data-add-garment');
            const item = (window.SHOP_TSHIRT_CATALOG || []).find(g => g.id === id);
            if (item) {
                addToCart(item);
                window.ShopTshirtCatalogUI?.selectGarmentById(id);
            }
            return;
        }

        if (event.target.closest('#detailAddToCart')) {
            const selected = window.__selectedShopTshirtGarment || window.SHOP_TSHIRT_CATALOG?.[0];
            if (selected) addToCart(selected);
        }
    });
})();
