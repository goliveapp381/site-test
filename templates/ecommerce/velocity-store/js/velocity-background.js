'use strict';

/* =========================================================
   VELOCITY BACKGROUND
   PREMIUM CLICK INTERACTION

   - Click-origin waves
   - Soft glow
   - Minimal grid interaction
   - No blocking
   - No dependency
========================================================= */

(function () {

    const BackgroundFX = {

        layer: null,

        initialized: false,

        MAX_EFFECTS: 8,


        /* =====================================================
           INIT
        ===================================================== */

        init() {

            if (this.initialized) {
                return;
            }

            this.initialized = true;

            this.createLayer();

            this.bindEvents();

        },


        /* =====================================================
           CREATE LAYER
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


            this.layer =
                document.createElement('div');

            this.layer.className =
                'velocity-background-layer';

            this.layer.setAttribute(
                'aria-hidden',
                'true'
            );

            document.body.appendChild(
                this.layer
            );

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


            this.cleanupOverflow();


            const fragment =
                document.createDocumentFragment();


            /* ---------------------------------------------
               GLOW
            --------------------------------------------- */

            const glow =
                document.createElement('span');

            glow.className =
                'velocity-background-glow';

            glow.style.left =
                `${x}px`;

            glow.style.top =
                `${y}px`;


            /* ---------------------------------------------
               MAIN WAVE
            --------------------------------------------- */

            const wave =
                document.createElement('span');

            wave.className =
                'velocity-background-wave';

            wave.style.left =
                `${x}px`;

            wave.style.top =
                `${y}px`;


            /* ---------------------------------------------
               RING
            --------------------------------------------- */

            const ring =
                document.createElement('span');

            ring.className =
                'velocity-background-ring';

            ring.style.left =
                `${x}px`;

            ring.style.top =
                `${y}px`;


            /* ---------------------------------------------
               ENERGY LINE 1
            --------------------------------------------- */

            const energyOne =
                document.createElement('span');

            energyOne.className =
                'velocity-background-energy';

            energyOne.style.left =
                `${x}px`;

            energyOne.style.top =
                `${y}px`;


            /* ---------------------------------------------
               ENERGY LINE 2
            --------------------------------------------- */

            const energyTwo =
                document.createElement('span');

            energyTwo.className =
                'velocity-background-energy energy-two';

            energyTwo.style.left =
                `${x}px`;

            energyTwo.style.top =
                `${y}px`;


            /* ---------------------------------------------
               CLICK POINT
            --------------------------------------------- */

            const point =
                document.createElement('span');

            point.className =
                'velocity-click-point';

            point.style.left =
                `${x}px`;

            point.style.top =
                `${y}px`;


            fragment.appendChild(glow);
            fragment.appendChild(wave);
            fragment.appendChild(ring);
            fragment.appendChild(energyOne);
            fragment.appendChild(energyTwo);
            fragment.appendChild(point);


            this.layer.appendChild(
                fragment
            );


            /* ---------------------------------------------
               AUTO CLEANUP
            --------------------------------------------- */

            window.setTimeout(() => {

                [
                    glow,
                    wave,
                    ring,
                    energyOne,
                    energyTwo,
                    point
                ].forEach((element) => {

                    if (
                        element &&
                        element.parentNode
                    ) {

                        element.remove();

                    }

                });

            }, 1500);

        },


        /* =====================================================
           LIMIT DOM EFFECTS
        ===================================================== */

        cleanupOverflow() {

            if (!this.layer) {
                return;
            }

            const effects =
                this.layer.children;

            if (
                effects.length <=
                this.MAX_EFFECTS
            ) {
                return;
            }


            const removeCount =
                effects.length -
                this.MAX_EFFECTS;


            for (
                let i = 0;
                i < removeCount;
                i++
            ) {

                if (effects[0]) {
                    effects[0].remove();
                }

            }

        }

    };


    /* =========================================================
       START AFTER DOM
    ========================================================= */

    if (
        document.readyState === 'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            () => BackgroundFX.init(),
            {
                once: true
            }
        );

    } else {

        BackgroundFX.init();

    }


    /* =========================================================
       GLOBAL API
    ========================================================= */

    window.VelocityBackground =
        BackgroundFX;

})();
