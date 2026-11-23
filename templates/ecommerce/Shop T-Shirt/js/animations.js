/* js/animations.js, velocity-core.js, velocity-cart-ui.js, velocity-ui.js, velocity-background.js */
'use strict';

(() => {
    document.addEventListener('mousemove', event => {
        const glow = document.querySelector('[data-cursor-glow]');
        if (!glow) return;
        glow.style.left = `${event.clientX}px`;
        glow.style.top = `${event.clientY}px`;
    });

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', event => {
            event.preventDefault();
            newsletterForm.reset();
        });
    }
})();
