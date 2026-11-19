'use strict';

/* =========================================================
   VELOCITY STORE
   ADVANCED ANIMATION ENGINE
========================================================= */

(function () {

    const AnimationEngine = {

        initialized: false,

        init() {

            if (this.initialized) return;

            this.initialized = true;

            this.setupRevealAnimations();
            this.setupParallax();
            this.setupMagneticButtons();
            this.setupTiltCards();
            this.setupNavbarScroll();
            this.setupCursorGlow();

            document.dispatchEvent(
                new CustomEvent('velocity:animations-ready')
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

            if (!elements.length) return;

            if (
                !('IntersectionObserver' in window)
            ) {

                elements.forEach(element => {
                    element.classList.add('revealed');
                });

                return;
            }

            const observer =
                new IntersectionObserver(
                    entries => {

                        entries.forEach(entry => {

                            if (!entry.isIntersecting) {
                                return;
                            }

                            entry.target.classList.add(
                                'revealed'
                            );

                            observer.unobserve(
                                entry.target
                            );

                        });

                    },
                    {
                        threshold: 0.12,
                        rootMargin: '0px 0px -60px 0px'
                    }
                );


            elements.forEach(element => {

                observer.observe(element);

            });

        },


        /* =====================================================
           PARALLAX
        ===================================================== */

        setupParallax() {

            const elements =
                document.querySelectorAll(
                    '[data-parallax]'
                );

            if (!elements.length) return;

            let ticking = false;


            const update = () => {

                const scrollY =
                    window.scrollY;

                elements.forEach(element => {

                    const speed =
                        Number(
                            element.dataset.parallax
                        ) || 0.15;

                    const rect =
                        element.getBoundingClientRect();

                    const center =
                        rect.top +
                        rect.height / 2;

                    const viewportCenter =
                        window.innerHeight / 2;

                    const distance =
                        center -
                        viewportCenter;

                    const translate =
                        distance * speed;

                    element.style.transform =
                        `translate3d(0, ${translate}px, 0)`;

                });

                ticking = false;

            };


            window.addEventListener(
                'scroll',
                () => {

                    if (ticking) return;

                    ticking = true;

                    requestAnimationFrame(
                        update
                    );

                },
                {
                    passive: true
                }
            );

        },


        /* =====================================================
           MAGNETIC BUTTONS
        ===================================================== */

        setupMagneticButtons() {

            const buttons =
                document.querySelectorAll(
                    '[data-magnetic]'
                );

            if (!buttons.length) return;

            buttons.forEach(button => {

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
                            `translate(
                                ${x * strength}px,
                                ${y * strength}px
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

            });

        },


        /* =====================================================
           PRODUCT CARD TILT
        ===================================================== */

        setupTiltCards() {

            const cards =
                document.querySelectorAll(
                    '[data-tilt]'
                );

            if (!cards.length) return;


            cards.forEach(card => {

                card.addEventListener(
                    'mousemove',
                    event => {

                        const rect =
                            card.getBoundingClientRect();

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
                            ((y - centerY) /
                                centerY) * -5;

                        const rotateY =
                            ((x - centerX) /
                                centerX) * 5;

                        card.style.transform =
                            `perspective(900px)
                             rotateX(${rotateX}deg)
                             rotateY(${rotateY}deg)
                             translateY(-5px)`;

                    }
                );


                card.addEventListener(
                    'mouseleave',
                    () => {

                        card.style.transform =
                            '';

                    }
                );

            });

        },


        /* =====================================================
           NAVBAR SCROLL
        ===================================================== */

        setupNavbarScroll() {

            const navbar =
                document.querySelector(
                    '[data-navbar]'
                );

            if (!navbar) return;


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
                window.matchMedia(
                    '(hover: none)'
                ).matches
            ) {
                return;
            }

            const glow =
                document.querySelector(
                    '[data-cursor-glow]'
                );

            if (!glow) return;


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

                }
            );


            const animate = () => {

                currentX +=
                    (mouseX - currentX) *
                    0.12;

                currentY +=
                    (mouseY - currentY) *
                    0.12;


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
       INIT
    ========================================================= */

    if (
        document.readyState === 'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            () => AnimationEngine.init()
        );

    } else {

        AnimationEngine.init();

    }


    window.VelocityAnimations =
        AnimationEngine;

})();
