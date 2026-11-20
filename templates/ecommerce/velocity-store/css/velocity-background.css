'use strict';

/* =========================================================
   VELOCITY STORE
   CINEMATIC BACKGROUND DISTORTION
   ---------------------------------------------------------
   - Subtle grid
   - Small water-like distortion
   - No circles
   - No rings
   - No hover effects
   - No changes to website layout
   - Product cards protected
========================================================= */

(function () {

    const VelocityBackground = {

        canvas: null,
        ctx: null,

        width: 0,
        height: 0,
        dpr: 1,

        initialized: false,

        ripples: [],

        config: {

            gridSize: 52,

            gridOpacity: 0.028,

            lineWidth: 1,

            rippleLife: 650,

            rippleRadius: 115,

            rippleWidth: 32,

            rippleStrength: 5,

            maxRipples: 3

        },


        /* =====================================================
           INIT
        ===================================================== */

        init() {

            if (this.initialized) {
                return;
            }

            this.createCanvas();

            if (!this.canvas || !this.ctx) {
                return;
            }

            this.resize();

            this.bindEvents();

            window.addEventListener(
                'resize',
                () => this.resize(),
                { passive: true }
            );

            this.initialized = true;

            requestAnimationFrame(
                (time) => this.animate(time)
            );
        },


        /* =====================================================
           CREATE CANVAS
        ===================================================== */

        createCanvas() {

            const existing =
                document.getElementById(
                    'velocityBackgroundCanvas'
                );

            if (existing) {
                existing.remove();
            }

            const canvas =
                document.createElement('canvas');

            canvas.id =
                'velocityBackgroundCanvas';

            canvas.setAttribute(
                'aria-hidden',
                'true'
            );

            /*
             * Put canvas directly inside body.
             * No other website element is modified.
             */

            document.body.prepend(canvas);

            this.canvas = canvas;

            this.ctx =
                canvas.getContext(
                    '2d',
                    {
                        alpha: true
                    }
                );
        },


        /* =====================================================
           RESIZE
        ===================================================== */

        resize() {

            if (!this.canvas || !this.ctx) {
                return;
            }

            this.width =
                window.innerWidth;

            this.height =
                window.innerHeight;

            this.dpr =
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                );

            this.canvas.width =
                Math.floor(
                    this.width * this.dpr
                );

            this.canvas.height =
                Math.floor(
                    this.height * this.dpr
                );

            this.canvas.style.width =
                `${this.width}px`;

            this.canvas.style.height =
                `${this.height}px`;

            this.ctx.setTransform(
                this.dpr,
                0,
                0,
                this.dpr,
                0,
                0
            );
        },


        /* =====================================================
           CHECK BACKGROUND
        ===================================================== */

        isBackgroundClick(event) {

            const target =
                event.target;

            if (
                !(target instanceof Element)
            ) {
                return false;
            }


            /*
             * Product cards
             */

            if (
                target.closest(
                    '.product-card'
                )
            ) {
                return false;
            }


            /*
             * Interactive elements
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
             * UI overlays
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
             * Final physical-point check.
             */

            const element =
                document.elementFromPoint(
                    event.clientX,
                    event.clientY
                );

            if (
                element &&
                element.closest &&
                element.closest(
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

                    this.createRipple(
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
           CREATE RIPPLE
        ===================================================== */

        createRipple(x, y) {

            if (
                this.ripples.length >=
                this.config.maxRipples
            ) {
                this.ripples.shift();
            }

            this.ripples.push({

                x,

                y,

                start:
                    performance.now()

            });
        },


        /* =====================================================
           DRAW GRID
        ===================================================== */

        draw(time) {

            const ctx =
                this.ctx;

            if (!ctx) {
                return;
            }

            ctx.clearRect(
                0,
                0,
                this.width,
                this.height
            );

            const size =
                this.config.gridSize;

            const step =
                18;

            ctx.lineWidth =
                this.config.lineWidth;


            /*
             * Vertical grid
             */

            for (
                let x = 0;
                x <= this.width + size;
                x += size
            ) {

                this.drawLine(
                    true,
                    x,
                    step,
                    time
                );
            }


            /*
             * Horizontal grid
             */

            for (
                let y = 0;
                y <= this.height + size;
                y += size
            ) {

                this.drawLine(
                    false,
                    y,
                    step,
                    time
                );
            }
        },


        /* =====================================================
           DRAW ONE DISTORTED LINE
        ===================================================== */

        drawLine(
            vertical,
            position,
            step,
            time
        ) {

            const ctx =
                this.ctx;

            ctx.beginPath();

            let first =
                true;


            if (vertical) {

                for (
                    let y = -step;
                    y <= this.height + step;
                    y += step
                ) {

                    const offset =
                        this.getWaveOffset(
                            position,
                            y,
                            time,
                            true
                        );

                    const px =
                        position + offset;

                    if (first) {

                        ctx.moveTo(
                            px,
                            y
                        );

                        first = false;

                    } else {

                        ctx.lineTo(
                            px,
                            y
                        );
                    }
                }

            } else {

                for (
                    let x = -step;
                    x <= this.width + step;
                    x += step
                ) {

                    const offset =
                        this.getWaveOffset(
                            x,
                            position,
                            time,
                            false
                        );

                    const py =
                        position + offset;

                    if (first) {

                        ctx.moveTo(
                            x,
                            py
                        );

                        first = false;

                    } else {

                        ctx.lineTo(
                            x,
                            py
                        );
                    }
                }
            }


            ctx.strokeStyle =
                `rgba(
                    255,
                    255,
                    255,
                    ${this.config.gridOpacity}
                )`;

            ctx.stroke();
        },


        /* =====================================================
           WATER DISTORTION
        ===================================================== */

        getWaveOffset(
            x,
            y,
            time,
            vertical
        ) {

            let result = 0;


            for (
                let i = 0;
                i < this.ripples.length;
                i++
            ) {

                const ripple =
                    this.ripples[i];

                const elapsed =
                    time -
                    ripple.start;

                const progress =
                    elapsed /
                    this.config.rippleLife;

                if (
                    progress < 0 ||
                    progress > 1
                ) {
                    continue;
                }


                const dx =
                    x -
                    ripple.x;

                const dy =
                    y -
                    ripple.y;

                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                const radius =
                    progress *
                    this.config.rippleRadius;


                const difference =
                    distance -
                    radius;


                const width =
                    this.config.rippleWidth;


                if (
                    Math.abs(difference) >
                    width
                ) {
                    continue;
                }


                /*
                 * Small soft wave.
                 */

                const envelope =
                    1 -
                    Math.abs(difference) /
                    width;


                const fade =
                    1 - progress;


                const wave =
                    Math.sin(
                        difference *
                        0.28
                    );


                let direction;


                if (vertical) {

                    direction =
                        dx /
                        Math.max(
                            distance,
                            1
                        );

                } else {

                    direction =
                        dy /
                        Math.max(
                            distance,
                            1
                        );
                }


                result +=

                    direction *

                    wave *

                    envelope *

                    fade *

                    this.config.rippleStrength;
            }


            return result;
        },


        /* =====================================================
           CLEAN OLD WAVES
        ===================================================== */

        cleanup(time) {

            this.ripples =
                this.ripples.filter(
                    (ripple) => {

                        return (
                            time -
                            ripple.start
                        ) <
                        this.config.rippleLife;

                    }
                );
        },


        /* =====================================================
           ANIMATION
        ===================================================== */

        animate(time) {

            this.cleanup(time);

            this.draw(time);

            requestAnimationFrame(
                (nextTime) => {

                    this.animate(
                        nextTime
                    );

                }
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
