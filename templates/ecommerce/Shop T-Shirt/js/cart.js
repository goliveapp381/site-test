/* js/cart.js */
'use strict';

(() => {
    let count = 0;
    function syncBadge() {
        document.querySelectorAll('[data-cart-count], #cartCount').forEach(el => {
            el.textContent = String(count);
        });
    }
    document.addEventListener('click', e => {
        const addBtn = e.target.closest('.add-cart-button, #detailAddCartBtn');
        if (!addBtn) return;
        count += 1;
        syncBadge();
    });
})();
