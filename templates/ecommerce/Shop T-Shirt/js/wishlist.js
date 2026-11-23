/* js/wishlist.js */
'use strict';

(() => {
    let count = 0;
    document.addEventListener('click', e => {
        if (!e.target.closest('[data-wishlist-open], #detailAddWishlistBtn')) return;
        count += 1;
        document.querySelectorAll('[data-wishlist-count], #wishlistCount').forEach(el => {
            el.textContent = String(count);
        });
    });
})();
