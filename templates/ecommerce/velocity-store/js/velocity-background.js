'use strict';

/* =========================================================
   VELOCITY STORE
   PREMIUM BACKGROUND INTERACTION
   ---------------------------------------------------------
   - Subtle grid
   - Click waves
   - Soft glow
   - No effects over products/buttons
   - No interference with UI
========================================================= */

(function () {

    const VelocityBackground = {

        layer: null,

        initialized: false,

        MAX_EFFECTS: 5,

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
           CREATE BACKGROUND LAYER
        ===================================================== */

        createLayer() {

            if (
                document.querySelector(
                    '.velocity-background-layer'
                )
            ) {
                this.layer =
                    document.querySelector(
                        '.velocity-background-layer'
                    );

                return;
            }

            const layer =
                document.createElement('div');

            layer.className =
                'velocity-background-layer';

            layer.setAttribute(
                'aria-hidden',
                'true'
            );

            document.body.prepend(layer);

            this.layer = layer;
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
                     * only left click
                     */

                    if (
                        event.pointerType === 'mouse' &&
                        event.button !== 0
                    ) {
                        return;
                    }


                    /*
                     * DO NOT CREATE BACKGROUND EFFECT
                     * OVER INTERACTIVE ELEMENTS
                     */

                    const target =
                        event.target instanceof Element
                            ? event.target
                            : null;

                    if (!target) {
                        return;
                    }


                    const blocked =
                        target.closest(
                            [
                                '.product-card',
                                'button',
                                'a',
                                'input',
                                'textarea',
                                'select',
                                'option',
                                'label',
                                '[role="button"]',
                                '[role="link"]',
                                '.modal',
                                '.overlay',
                                '.drawer',
                                '.cart',
                                '.wishlist',
                                '.search-overlay',
                                '.mobile-menu',
                                '.velocity-added-cart-modal',
                                '.velocity-added-modal'
                            ].join(',')
                        );


                    if (blocked) {
                        return;
                    }


                    /*
                     * BACKGROUND ONLY
                     */

                    this.createEffect(
                        event.clientX,
                        event.clientY
                    );

                },
                {
                    passive: true
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
             * LIMIT ACTIVE EFFECTS
             */

            const activeEffects =
                this.layer.children;

            if (
                activeEffects.length >=
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
             * MAIN WAVE
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
             * SECONDARY RING
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
             * SMALL ENERGY LINE
             */

            const energy =
                document.createElement('span');

            energy.className =
                'velocity-background-energy';

            energy.style.left =
                `${x}px`;

            energy.style.top =
                `${y}px`;


            /*
             * SECOND ENERGY LINE
             */

            const energyTwo =
                document.createElement('span');

            energyTwo.className =
                'velocity-background-energy energy-two';

            energyTwo.style.left =
                `${x}px`;

            energyTwo.style.top =
                `${y}px`;


            /*
             * CLICK POINT
             */

            const point =
                document.createElement('span');

            point.className =
                'velocity-click-point';

            point.style.left =
                `${x}px`;

            point.style.top =
                `${y}px`;


            /*
             * ADD TO LAYER
             */

            this.layer.appendChild(glow);
            this.layer.appendChild(wave);
            this.layer.appendChild(ring);
            this.layer.appendChild(energy);
            this.layer.appendChild(energyTwo);
            this.layer.appendChild(point);


            /*
             * CLEANUP
             */

            window.setTimeout(() => {

                glow.remove();
                wave.remove();
                ring.remove();
                energy.remove();
                energyTwo.remove();
                point.remove();

            }, 1200);

        },


        /* =====================================================
           CLEANUP
        ===================================================== */

        cleanupOverflow() {

            if (!this.layer) {
                return;
            }

            while (
                this.layer.children.length >
                this.MAX_EFFECTS
            ) {
                this.layer.firstElementChild?.remove();
            }
        }

    };


    /* =========================================================
       START
    ========================================================= */

    function start() {

        VelocityBackground.init();

    }


    if (
        document.readyState === 'loading'
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
