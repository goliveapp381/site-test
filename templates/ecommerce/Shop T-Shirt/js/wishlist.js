/* js/wishlist.js */
'use strict';

(() => {
    let count = 0;
    document.addEventListener('click', event => {
        if (!event.target.closest('[data-wishlist-open]')) return;
        count += 1;
        document.querySelectorAll('[data-wishlist-count], #wishlistCount').forEach(el => {
            el.textContent = String(count);
        });
    });
})();
