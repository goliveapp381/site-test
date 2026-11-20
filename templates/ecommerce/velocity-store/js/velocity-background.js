'use strict';

/* =========================================================
   VELOCITY STORE
   PREMIUM BACKGROUND EFFECT
   ---------------------------------------------------------
   - Small grid
   - Very small click waves
   - No large circles
   - No hover effects
   - Background only
   - Product cards protected
========================================================= */

(function () {

    const VelocityBackground = {

        layer: null,

        initialized: false,

        config: {

            waveDuration: 430,

            secondWaveDelay: 55,

            glowDuration: 300,

            clickPointDuration: 260,

            maxEffects: 2

        },


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

            const oldLayer =
                document.querySelector(
                    '.velocity-background-layer'
                );

            if (oldLayer) {

                oldLayer.remove();

            }


            const layer =
                document.createElement(
                    'div'
                );

            layer.className =
                'velocity-background-layer';

            layer.setAttribute(
                'aria-hidden',
                'true'
            );


            document.body.appendChild(
                layer
            );


            this.layer = layer;

        },


        /* =====================================================
           CHECK BACKGROUND CLICK
        ===================================================== */

        isBackgroundClick(event) {

            const target =
                event.target;


            if (
                !(target instanceof Element)
            ) {

                return false;

            }


            /* PRODUCT CARDS */

            if (
                target.closest(
                    '.product-card'
                )
            ) {

                return false;

            }


            /* BUTTONS / LINKS / FORM */

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


            /* MODALS / OVERLAYS */

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


            return true;

        },


        /* =====================================================
           EVENTS
        ===================================================== */

        bindEvents() {

            document.addEventListener(
                'pointerdown',
                (event) => {

                    if (
                        event.pointerType === 'mouse' &&
                        event.button !== 0
                    ) {

                        return;

                    }


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
                    passive: true
                }
            );

        },


        /* =====================================================
           CREATE SMALL EFFECT
        ===================================================== */

        createEffect(x, y) {

            if (!this.layer) {

                return;

            }


            /* ---------------------------------------------
               CLICK POINT
            --------------------------------------------- */

            const point =
                document.createElement(
                    'div'
                );

            point.className =
                'velocity-click-point';

            point.style.left =
                `${x}px`;

            point.style.top =
                `${y}px`;


            this.layer.appendChild(
                point
            );


            /* ---------------------------------------------
               VERY SMALL GLOW
            --------------------------------------------- */

            const glow =
                document.createElement(
                    'div'
                );

            glow.className =
                'velocity-background-glow';

            glow.style.left =
                `${x}px`;

            glow.style.top =
                `${y}px`;


            this.layer.appendChild(
                glow
            );


            /* ---------------------------------------------
               MAIN WAVE
            --------------------------------------------- */

            const wave =
                document.createElement(
                    'div'
                );

            wave.className =
                'velocity-background-wave';

            wave.style.left =
                `${x}px`;

            wave.style.top =
                `${y}px`;


            this.layer.appendChild(
                wave
            );


            /* ---------------------------------------------
               SECOND VERY SMALL WAVE
            --------------------------------------------- */

            const secondWave =
                document.createElement(
                    'div'
                );

            secondWave.className =
                'velocity-background-ring';

            secondWave.style.left =
                `${x}px`;

            secondWave.style.top =
                `${y}px`;

            secondWave.style.animationDelay =
                `${this.config.secondWaveDelay}ms`;


            this.layer.appendChild(
                secondWave
            );


            /* ---------------------------------------------
               CLEANUP
            --------------------------------------------- */

            const cleanupTime =
                this.config.waveDuration +
                this.config.secondWaveDelay +
                100;


            setTimeout(
                () => {

                    point.remove();

                    glow.remove();

                    wave.remove();

                    secondWave.remove();

                },
                cleanupTime
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
