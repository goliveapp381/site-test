'use strict';

/* =========================================================
   VELOCITY STORE
   CINEMATIC WATER BACKGROUND
   ---------------------------------------------------------
   - Canvas based background
   - Subtle grid
   - Real water-like distortion
   - Small waves from click position
   - No circular DOM elements
   - No hover effects
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

        lastFrame: 0,


        /* =====================================================
           CONFIG
        ===================================================== */

        config: {

            gridSize: 48,

            gridOpacity: 0.035,

            gridColor: 255,

            rippleLife: 720,

            rippleStrength: 8,

            rippleRadius: 145,

            rippleSpeed: 0.9,

            maxRipples: 3,

            animationSpeed: 1

        },


        /* =====================================================
           INIT
        ===================================================== */

        init() {

            if (this.initialized) {
                return;
            }


            this.createCanvas();

            this.resize();

            this.bindEvents();

            window.addEventListener(
                'resize',
                () => {
                    this.resize();
                },
                {
                    passive: true
                }
            );


            this.initialized = true;

            requestAnimationFrame(
                (time) => {
                    this.animate(time);
                }
            );
        },


        /* =====================================================
           CREATE CANVAS
        ===================================================== */

        createCanvas() {

            /*
             * Remove old canvas if exists
             */

            const oldCanvas =
                document.getElementById(
                    'velocityBackgroundCanvas'
                );

            if (oldCanvas) {
                oldCanvas.remove();
            }


            const canvas =
                document.createElement('canvas');

            canvas.id =
                'velocityBackgroundCanvas';

            canvas.setAttribute(
                'aria-hidden',
                'true'
            );


            document.body.prepend(
                canvas
            );


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


            this.dpr =
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                );


            this.width =
                window.innerWidth;

            this.height =
                window.innerHeight;


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
           EVENT PROTECTION
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
             * PRODUCT CARD
             */

            if (
                target.closest(
                    '.product-card'
                )
            ) {
                return false;
            }


            /*
             * BUTTONS / LINKS
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
             * MODALS / OVERLAYS
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
             * EXTRA PRODUCT CHECK
             */

            const pointElement =
                document.elementFromPoint(
                    event.clientX,
                    event.clientY
                );


            if (
                pointElement &&
                pointElement.closest &&
                pointElement.closest(
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
                     * Only left mouse button
                     */

                    if (
                        event.pointerType === 'mouse' &&
                        event.button !== 0
                    ) {
                        return;
                    }


                    /*
                     * ONLY BACKGROUND
                     */

                    if (
                        !this.isBackgroundClick(
                            event
                        )
                    ) {
                        return;
                    }


                    this.addRipple(
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
           ADD RIPPLE
        ===================================================== */

        addRipple(x, y) {

            /*
             * Keep only a few active waves
             */

            if (
                this.ripples.length >=
                this.config.maxRipples
            ) {

                this.ripples.shift();

            }


            this.ripples.push({

                x: x,

                y: y,

                start:
                    performance.now(),

                life:
                    this.config.rippleLife,

                strength:
                    this.config.rippleStrength,

                radius:
                    this.config.rippleRadius

            });
        },


        /* =====================================================
           DRAW BACKGROUND
        ===================================================== */

        drawBackground(time) {

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


            /*
             * Draw only subtle grid.
             */

            const size =
                this.config.gridSize;


            const color =
                this.config.gridColor;


            const baseOpacity =
                this.config.gridOpacity;


            ctx.lineWidth = 1;


            /*
             * Vertical lines
             */

            for (
                let x = 0;
                x <= this.width + size;
                x += size
            ) {

                this.drawDistortedLine(
                    ctx,
                    true,
                    x,
                    time,
                    color,
                    baseOpacity
                );
            }


            /*
             * Horizontal lines
             */

            for (
                let y = 0;
                y <= this.height + size;
                y += size
            ) {

                this.drawDistortedLine(
                    ctx,
                    false,
                    y,
                    time,
                    color,
                    baseOpacity
                );
            }
        },


        /* =====================================================
           DRAW DISTORTED LINE
        ===================================================== */

        drawDistortedLine(
            ctx,
            vertical,
            position,
            time,
            color,
            opacity
        ) {

            const step = 14;


            ctx.beginPath();


            let first = true;


            if (vertical) {

                for (
                    let y = -step;
                    y <= this.height + step;
                    y += step
                ) {

                    const distortion =
                        this.getDistortion(
                            position,
                            y,
                            time,
                            true
                        );


                    const px =
                        position +
                        distortion;


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

                    const distortion =
                        this.getDistortion(
                            x,
                            position,
                            time,
                            false
                        );


                    const py =
                        position +
                        distortion;


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
                    ${color},
                    ${color},
                    ${color},
                    ${opacity}
                )`;


            ctx.stroke();
        },


        /* =====================================================
           DISTORTION
        ===================================================== */

        getDistortion(
            x,
            y,
            time,
            vertical
        ) {

            let total =
                0;


            for (
                let i = 0;
                i < this.ripples.length;
                i++
            ) {

                const ripple =
                    this.ripples[i];


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


                const elapsed =
                    time -
                    ripple.start;


                const progress =
                    elapsed /
                    ripple.life;


                if (
                    progress < 0 ||
                    progress > 1
                ) {
                    continue;
                }


                /*
                 * Wave travels outward
                 */

                const waveRadius =
                    progress *
                    ripple.radius;


                const waveWidth =
                    38;


                const difference =
                    Math.abs(
                        distance -
                        waveRadius
                    );


                if (
                    difference >
                    waveWidth
                ) {
                    continue;
                }


                /*
                 * Smooth wave strength
                 */

                const envelope =
                    1 -
                    (
                        difference /
                        waveWidth
                    );


                const fade =
                    1 -
                    progress;


                const wave =
                    Math.sin(
                        (
                            difference /
                            waveWidth
                        ) *
                        Math.PI
                    );


                /*
                 * Direction of distortion
                 */

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


                total +=

                    direction *

                    wave *

                    envelope *

                    fade *

                    ripple.strength;
            }


            return total;
        },


        /* =====================================================
           CLEAN RIPPLE DATA
        ===================================================== */

        cleanupRipples(time) {

            this.ripples =
                this.ripples.filter(
                    (ripple) => {

                        return (
                            time -
                            ripple.start
                        ) <
                        ripple.life;
                    }
                );
        },


        /* =====================================================
           ANIMATION LOOP
        ===================================================== */

        animate(time) {

            this.lastFrame =
                time;


            this.cleanupRipples(
                time
            );


            this.drawBackground(
                time
            );


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
