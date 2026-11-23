/* js/app.js & js/template-bridge.js */
'use strict';

(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            loader.style.display = 'none';
        }
        document.querySelectorAll('[data-current-year]').forEach(el => {
            el.textContent = String(new Date().getFullYear());
        });
    });

    window.TemplateCraftBridge = window.TemplateCraftBridge || {
        template: 'shop-tshirt',
        version: '1.0.0'
    };
})();
