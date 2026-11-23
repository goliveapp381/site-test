/* js/velocity-background.js */
'use strict';

(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const wires = document.querySelectorAll('.wire-wave');
        wires.forEach((wire, index) => {
            wire.style.animationDelay = `${(index * 0.25).toFixed(2)}s`;
        });
    });
})();

