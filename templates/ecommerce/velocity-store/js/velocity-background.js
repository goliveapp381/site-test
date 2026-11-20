'use strict';

/* =========================================================
   VELOCITY STORE
   BACKGROUND INTERACTION
   ---------------------------------------------------------
   - Grid background
   - Click effect ONLY on empty background
   - NEVER on product cards
   - NEVER on buttons / links / inputs
   - NEVER on UI overlays
   - No hover effects
========================================================= */

(function () {

    const VelocityBackground = {

        layer: null,

        initialized: false,

        MAX_EFFECTS: 3,


        /* =====================================================
           INIT
        ===================================================== */

        init() {

            if (this.initialized) {
                return;
            }

            this.createLayer();

            this.bindEvents();

            this.initialized = true;
        },


        /* =====================================================
           CREATE LAYER
        ===================================================== */

        createLayer() {

            let layer =
                document.querySelector(
                    '.velocity-background-layer'
                );

            if (!layer) {

                layer =
                    document.createElement('div');

                layer.className =
                    'velocity-background-layer';

                layer.setAttribute(
                    'aria-hidden',
                    'true'
                );

                document.body.prepend(layer);
            }

            this.layer = layer;
        },


        /* =====================================================
           CHECK IF CLICK IS ALLOWED
        ===================================================== */

        isBackgroundClick(event) {

            const target = event.target;

            if (
                !(target instanceof Element)
            ) {
                return false;
            }


            /*
             * IMPORTANT:
             * Anything inside a product card = BLOCK
             */

            if (
                target.closest(
                    '.product-card'
                )
            ) {
                return false;
            }


            /*
             * BLOCK ALL INTERACTIVE ELEMENTS
             */

            if (
                target.closest(
                    [
                        'button',
                        'a',
                        'input',
                        'textarea',
                        'select',
                        'option',
                        'label',
                        '[role="button"]',
                        '[role="link"]'
                    ].join(',')
                )
            ) {
                return false;
            }


            /*
             * BLOCK MODALS / DRAWERS / OVERLAYS
             */

            if (
                target.closest(
                    [
                        '.modal',
                        '.overlay',
                        '.drawer',
                        '.cart-drawer',
                        '.search-overlay',
                        '.mobile-menu',
                        '.wishlist',
                        '.velocity-added-cart-modal',
                        '.velocity-added-modal'
                    ].join(',')
                )
            ) {
                return false;
            }


            /*
             * EXTRA SAFETY:
             * Check the actual element at the click point.
             *
             * This catches cases where another transparent
             * element is involved.
             */

            const elementAtPoint =
                document.elementFromPoint(
                    event.clientX,
                    event.clientY
                );

            if (
                elementAtPoint &&
                elementAtPoint.closest &&
                elementAtPoint.closest(
                    '.product-card'
                )
            ) {
                return false;
            }


            return true;
        },


        /* =====================================================
           EVENTS
        ===================================================== */

        bindEvents() {

            document.addEventListener(
                'pointerdown',
                (event) => {

                    /*
                     * Mouse:
                     * only LEFT click
                     */

                    if (
                        event.pointerType === 'mouse' &&
                        event.button !== 0
                    ) {
                        return;
                    }


                    /*
                     * TOUCH / PEN / MOUSE:
                     * ONLY EMPTY BACKGROUND
                     */

                    if (
                        !this.isBackgroundClick(
                            event
                        )
                    ) {
                        return;
                    }


                    this.createEffect(
                        event.clientX,
                        event.clientY
                    );

                },
                {
                    passive: true,
                    capture: false
                }
            );
        },


        /* =====================================================
           CREATE EFFECT
        ===================================================== */

        createEffect(x, y) {

            if (!this.layer) {
                return;
            }


            /*
             * LIMIT EFFECTS
             */

            while (
                this.layer.children.length >=
                this.MAX_EFFECTS
            ) {
                this.layer.firstElementChild?.remove();
            }


            /*
             * GLOW
             */

            const glow =
                document.createElement('span');

            glow.className =
                'velocity-background-glow';

            glow.style.left =
                `${x}px`;

            glow.style.top =
                `${y}px`;


            /*
             * SMALL WAVE
             */

            const wave =
                document.createElement('span');

            wave.className =
                'velocity-background-wave';

            wave.style.left =
                `${x}px`;

            wave.style.top =
                `${y}px`;


            /*
             * SMALL RING
             */

            const ring =
                document.createElement('span');

            ring.className =
                'velocity-background-ring';

            ring.style.left =
                `${x}px`;

            ring.style.top =
                `${y}px`;


            /*
             * ADD
             */

            this.layer.appendChild(glow);

            this.layer.appendChild(wave);

            this.layer.appendChild(ring);


            /*
             * REMOVE
             */

            window.setTimeout(
                () => {

                    glow.remove();

                    wave.remove();

                    ring.remove();

                },
                1000
            );
        }

    };


    /* =========================================================
       START
    ========================================================= */

    function start() {

        VelocityBackground.init();

    }


    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            start,
            {
                once: true
            }
        );

    } else {

        start();

    }


    window.VelocityBackground =
        VelocityBackground;

})();
