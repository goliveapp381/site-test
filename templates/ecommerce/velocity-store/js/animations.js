'use strict';

/* =========================================================
   VELOCITY STORE
   ADVANCED ANIMATION ENGINE
   ---------------------------------------------------------
   - Reveal animations
   - Parallax
   - Magnetic buttons
   - Product tilt
   - Navbar scroll
   - Cursor glow
   - Dynamic product support
========================================================= */

(function () {

    const AnimationEngine = {

        initialized: false,

        /* =====================================================
           INIT
        ===================================================== */

        init() {

            if (this.initialized) {
                return;
            }

            this.initialized = true;

            this.setupRevealAnimations();

            this.setupParallax();

            this.setupMagneticButtons();

            this.setupTiltCards();

            this.setupNavbarScroll();

            this.setupCursorGlow();


            document.dispatchEvent(
                new CustomEvent(
                    'velocity:animations-ready'
                )
            );

        },


        /* =====================================================
           REVEAL ON SCROLL
        ===================================================== */

        setupRevealAnimations() {

            const elements =
                document.querySelectorAll(
                    '[data-reveal]'
                );


            if (!elements.length) {
                return;
            }


            if (
                !(
                    'IntersectionObserver'
                    in window
                )
            ) {

                elements.forEach(
                    element => {

                        element.classList.add(
                            'revealed'
                        );

                    }
                );

                return;

            }


            const observer =
                new IntersectionObserver(
                    entries => {

                        entries.forEach(
                            entry => {

                                if (
                                    !entry.isIntersecting
                                ) {

                                    return;

                                }


                                entry.target.classList.add(
                                    'revealed'
                                );


                                observer.unobserve(
                                    entry.target
                                );

                            }
                        );

                    },
                    {
                        threshold: 0.12,

                        rootMargin:
                            '0px 0px -60px 0px'
                    }
                );


            elements.forEach(
                element => {

                    observer.observe(
                        element
                    );

                }
            );

        },


        /* =====================================================
           PARALLAX
        ===================================================== */

        setupParallax() {

            const elements =
                document.querySelectorAll(
                    '[data-parallax]'
                );


            if (!elements.length) {
                return;
            }


            /*
             * على الأجهزة اللي ما فيهاش hover
             * نخففو المؤثرات الثقيلة.
             */

            const isTouch =
                window.matchMedia(
                    '(hover: none)'
                ).matches;


            if (isTouch) {

                elements.forEach(
                    element => {

                        element.style.transform =
                            '';

                    }
                );

                return;

            }


            let ticking = false;


            const update = () => {

                const viewportCenter =
                    window.innerHeight / 2;


                elements.forEach(
                    element => {

                        /*
                         * إذا العنصر تحيد من DOM
                         * ما نبقاوش نخدمو عليه.
                         */

                        if (
                            !element.isConnected
                        ) {

                            return;

                        }


                        const speed =
                            Number(
                                element.dataset.parallax
                            ) || 0.15;


                        const rect =
                            element.getBoundingClientRect();


                        /*
                         * إذا خارج بزاف على الشاشة
                         * ما نحتاجوش نحسبوه.
                         */

                        if (
                            rect.bottom < -200 ||
                            rect.top >
                                window.innerHeight + 200
                        ) {

                            return;

                        }


                        const center =
                            rect.top +
                            rect.height / 2;


                        const distance =
                            center -
                            viewportCenter;


                        const translate =
                            distance * speed;


                        element.style.setProperty(
                            '--velocity-parallax-y',
                            `${translate}px`
                        );


                        /*
                         * ما نفرضوش transform مباشرة
                         * باش ما نخربوش transform
                         * ديال CSS أو animation أخرى.
                         */

                        element.style.transform =
                            `translate3d(
                                0,
                                ${translate}px,
                                0
                            )`;

                    }
                );


                ticking = false;

            };


            const requestUpdate =
                () => {

                    if (ticking) {
                        return;
                    }

                    ticking = true;

                    requestAnimationFrame(
                        update
                    );

                };


            window.addEventListener(
                'scroll',
                requestUpdate,
                {
                    passive: true
                }
            );


            window.addEventListener(
                'resize',
                requestUpdate,
                {
                    passive: true
                }
            );


            requestUpdate();

        },


        /* =====================================================
           MAGNETIC BUTTONS
        ===================================================== */

        setupMagneticButtons() {

            const buttons =
                document.querySelectorAll(
                    '[data-magnetic]'
                );


            if (!buttons.length) {
                return;
            }


            /*
             * Magnetic effect غير مناسب
             * للشاشات اللمسية.
             */

            if (
                window.matchMedia(
                    '(hover: none)'
                ).matches
            ) {

                return;

            }


            buttons.forEach(
                button => {

                    if (
                        button.dataset.velocityMagneticReady
                    ) {

                        return;

                    }


                    button.dataset.velocityMagneticReady =
                        'true';


                    button.addEventListener(
                        'mousemove',
                        event => {

                            const rect =
                                button.getBoundingClientRect();


                            const x =
                                event.clientX -
                                rect.left -
                                rect.width / 2;


                            const y =
                                event.clientY -
                                rect.top -
                                rect.height / 2;


                            const strength =
                                Number(
                                    button.dataset.magnetic
                                ) || 0.18;


                            button.style.transform =
                                `translate3d(
                                    ${x * strength}px,
                                    ${y * strength}px,
                                    0
                                )`;

                        }
                    );


                    button.addEventListener(
                        'mouseleave',
                        () => {

                            button.style.transform =
                                '';

                        }
                    );


                    button.addEventListener(
                        'blur',
                        () => {

                            button.style.transform =
                                '';

                        }
                    );

                }
            );

        },


        /* =====================================================
           PRODUCT CARD TILT
        ===================================================== */

        setupTiltCards() {

            /*
             * Product cards ممكن يتولدو من products.js
             * بعد ما animations.js يخدم.
             *
             * لذلك نستخدم delegation على document.
             */

            if (
                window.matchMedia(
                    '(hover: none)'
                ).matches
            ) {

                return;

            }


            if (
                document.documentElement.dataset
                    .velocityTiltReady === 'true'
            ) {

                return;

            }


            document.documentElement.dataset
                .velocityTiltReady = 'true';


            document.addEventListener(
                'mousemove',
                event => {

                    const card =
                        event.target.closest(
                            '[data-tilt]'
                        );


                    if (!card) {
                        return;
                    }


                    if (
                        !card.isConnected
                    ) {

                        return;

                    }


                    const rect =
                        card.getBoundingClientRect();


                    if (
                        rect.width <= 0 ||
                        rect.height <= 0
                    ) {

                        return;

                    }


                    const x =
                        event.clientX -
                        rect.left;


                    const y =
                        event.clientY -
                        rect.top;


                    const centerX =
                        rect.width / 2;


                    const centerY =
                        rect.height / 2;


                    const rotateX =
                        (
                            (y - centerY) /
                            centerY
                        ) * -5;


                    const rotateY =
                        (
                            (x - centerX) /
                            centerX
                        ) * 5;


                    card.style.transform =
                        `perspective(900px)
                         rotateX(${rotateX}deg)
                         rotateY(${rotateY}deg)
                         translate3d(0, -5px, 0)`;

                }
            );


            document.addEventListener(
                'mouseleave',
                event => {

                    const card =
                        event.target.closest?.(
                            '[data-tilt]'
                        );


                    if (!card) {
                        return;
                    }


                    card.style.transform =
                        '';

                },
                true
            );


            document.addEventListener(
                'mouseout',
                event => {

                    const card =
                        event.target.closest?.(
                            '[data-tilt]'
                        );


                    if (!card) {
                        return;
                    }


                    const related =
                        event.relatedTarget;


                    if (
                        related &&
                        card.contains(
                            related
                        )
                    ) {

                        return;

                    }


                    card.style.transform =
                        '';

                }
            );

        },


        /* =====================================================
           NAVBAR SCROLL
        ===================================================== */

        setupNavbarScroll() {

            const navbar =
                document.querySelector(
                    '[data-navbar]'
                );


            if (!navbar) {
                return;
            }


            const updateNavbar =
                () => {

                    navbar.classList.toggle(
                        'scrolled',
                        window.scrollY > 40
                    );

                };


            updateNavbar();


            window.addEventListener(
                'scroll',
                updateNavbar,
                {
                    passive: true
                }
            );

        },


        /* =====================================================
           CURSOR GLOW
        ===================================================== */

        setupCursorGlow() {

            if (
                !window.matchMedia(
                    '(hover: hover)'
                ).matches
            ) {

                return;

            }


            const glow =
                document.querySelector(
                    '[data-cursor-glow]'
                );


            if (!glow) {
                return;
            }


            let mouseX = 0;
            let mouseY = 0;

            let currentX = 0;
            let currentY = 0;


            document.addEventListener(
                'mousemove',
                event => {

                    mouseX =
                        event.clientX;

                    mouseY =
                        event.clientY;

                },
                {
                    passive: true
                }
            );


            /*
             * نستعمل visibility بدل display
             * باش يبقى transition سلس.
             */

            glow.style.willChange =
                'transform';


            const animate =
                () => {

                    currentX +=
                        (
                            mouseX -
                            currentX
                        ) * 0.12;


                    currentY +=
                        (
                            mouseY -
                            currentY
                        ) * 0.12;


                    glow.style.transform =
                        `translate3d(
                            ${currentX}px,
                            ${currentY}px,
                            0
                        )`;


                    requestAnimationFrame(
                        animate
                    );

                };


            animate();

        }

    };


    /* =========================================================
       DOM READY
    ========================================================= */

    if (
        document.readyState === 'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            () => AnimationEngine.init(),
            {
                once: true
            }
        );

    } else {

        AnimationEngine.init();

    }


    /* =========================================================
       GLOBAL
    ========================================================= */

    window.VelocityAnimations =
        AnimationEngine;

})();
