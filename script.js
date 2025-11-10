// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Wrap all content in a scroll container if not already wrapped
    if (!document.querySelector('.scroll-container')) {
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'scroll-container';
        while (document.body.firstChild) {
            scrollContainer.appendChild(document.body.firstChild);
        }
        document.body.appendChild(scrollContainer);
    }

    // Initialize Lenis with better settings
    const lenis = new Lenis({
        wrapper: window,
        content: document.querySelector('.scroll-container'),
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth exponential ease-out
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
        autoResize: true
    });

    // Store globally
    window.lenis = lenis;

    // Single RAF loop
    let time = 0;
    function raf(currentTime) {
        time = currentTime;
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis scroll with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Configure ScrollTrigger to use Lenis as the scroller
    ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
            return arguments.length ? 
                lenis.scrollTo(value, { immediate: true }) : 
                lenis.animatedScroll;
        },
        getBoundingClientRect() {
            return {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight
            };
        },
        pinType: 'transform'
    });

    // Refresh ScrollTrigger after everything is set
    ScrollTrigger.addEventListener('refresh', () => lenis.resize());
    ScrollTrigger.refresh();

    // Initialize features with small delay to ensure DOM readiness
    setTimeout(() => {
        initFullscreenMenu();
        initScrollAnimations();
        initMetricAnimations();
        enableSmoothAnchorScrolling();
        initVideoBackgrounds();
        initMathJaxRefresh();
    }, 100);

    // Optimized resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            lenis.resize();
            ScrollTrigger.refresh();
        }, 250);
    }, { passive: true });

    // Reduced motion support
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.globalTimeline.pause();
        ScrollTrigger.disable();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        if (window.lenis) window.lenis.destroy();
    });
});

// NEW: Fullscreen Menu with GSAP
function initFullscreenMenu() {
    // Only create menu if it doesn't already exist
    if (document.getElementById('fullscreenMenu')) return;

    const menuHTML = `
        <div class="fullscreen-menu" id="fullscreenMenu">
            <button class="menu-close" id="menuClose">
                <span></span>
                <span></span>
            </button>
            <div class="fullscreen-menu-content">
                <nav>
                    <a href="/">Home</a>
                    <a href="/flood/">Flood Intelligence</a>
                    <a href="/disease/">Disease Forecasting</a>
                    <a href="/nightlights/">Nightlights Analysis</a>
                    <a href="/crops/">Crop Monitoring</a>
                    <a href="/lpg/">LPG Demand</a>
                    <a href="/freights/">Freight Prediction</a>
                </nav>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', menuHTML);

    const menu = document.getElementById('fullscreenMenu');
    const menuLinks = menu.querySelectorAll('a');
    const closeBtn = document.getElementById('menuClose');

    // Create timeline
    const menuTl = gsap.timeline({ paused: true });
    menuTl
        .to(menu, {
            duration: 0,
            visibility: 'visible',
            pointerEvents: 'all'
        })
        .from(menu, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.inOut'
        })
        .from(menuLinks, {
            opacity: 0,
            y: 30,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out'
        }, '-=0.2')
        .from(closeBtn, {
            opacity: 0,
            rotation: -90,
            duration: 0.4,
            ease: 'power2.out'
        }, '-=0.4');

    // Replace bottom nav with simplified version
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.innerHTML = `
            <nav>
                <a href="/" class="nav-logo">M0NARQ</a>
                <button class="menu-trigger" id="menuTrigger">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </nav>
        `;
        const trigger = document.getElementById('menuTrigger');

        if (trigger) {
            trigger.addEventListener('click', () => {
                menuTl.play();
                if (window.lenis) window.lenis.stop();
                menu.classList.add('active');
            });
        }
    }

    // Close menu
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            menuTl.reverse();
            if (window.lenis) window.lenis.start();
            menu.classList.remove('active');
        });
    }

    // Close on link click
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                menuTl.reverse();
                menu.classList.remove('active');
                setTimeout(() => {
                    if (window.lenis) window.lenis.start();
                    window.location.href = href;
                }, 600);
            }
        });
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            menuTl.reverse();
            menu.classList.remove('active');
            if (window.lenis) window.lenis.start();
        }
    });
}

// Simplified scroll animations (fade only, no movement)
function initScrollAnimations() {
    // Fade in generic elements
    gsap.utils.toArray('.fade-in').forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0 }, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true
            },
            delay: i * 0.02
        });
    });

    // Headings
    gsap.utils.toArray('h1, h2').forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0 }, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true
            },
            delay: i * 0.02
        });
    });

    // Code blocks
    gsap.utils.toArray('pre').forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0 }, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true
            },
            delay: i * 0.05
        });
    });

    // Metrics
    gsap.utils.toArray('.metric').forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0 }, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true
            },
            delay: i * 0.08
        });
    });
}

// Metric counter animations
function initMetricAnimations() {
    document.querySelectorAll('.metric-value').forEach(el => {
        const endValue = parseFloat(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        const hasDecimal = el.getAttribute('data-decimal') === 'true';
        if (!isNaN(endValue)) {
            gsap.to(el, {
                innerText: endValue,
                duration: 2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 80%',
                    once: true
                },
                snap: { innerText: hasDecimal ? 0.1 : 1 },
                onUpdate: function() {
                    const value = hasDecimal
                        ? parseFloat(this.targets()[0].innerText).toFixed(1)
                        : Math.round(this.targets()[0].innerText);
                    el.textContent = value + suffix;
                }
            });
        }
    });
}

// Smooth anchor scrolling using Lenis
function enableSmoothAnchorScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href || !window.lenis) return;
            if (href === '#') {
                e.preventDefault();
                window.lenis.scrollTo(0, { duration: 1.4 });
                return;
            }
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                window.lenis.scrollTo(target, {
                    duration: 1.4,
                    offset: -80
                });
            }
        });
    });
}

// Video backgrounds fallback handling
function initVideoBackgrounds() {
    const videoSections = document.querySelectorAll('.video-bg');
    videoSections.forEach(section => {
        const video = section.querySelector('.bg-video');
        const fallback = section.querySelector('.bg-fallback');
        if (video) {
            video.setAttribute('playsinline', '');
            video.muted = true;
            video.loop = true;
            video.addEventListener('error', () => {
                video.style.display = 'none';
                if (fallback) fallback.style.display = 'block';
            });
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    video.style.display = 'none';
                    if (fallback) fallback.style.display = 'block';
                });
            }
        }
    });
}

// MathJax support
function initMathJaxRefresh() {
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise().then(() => {
            setTimeout(() => ScrollTrigger.refresh(), 500);
        }).catch(console.warn);
    }
}
