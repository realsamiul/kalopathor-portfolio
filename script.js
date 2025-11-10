// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis with better momentum settings
    const lenis = new Lenis({
        duration: 1.4, // Slightly longer for smoother deceleration
        easing: (t) => 1 - Math.pow(1 - t, 3), // Cubic ease-out for natural feel
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9, // Slightly reduced for better control
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
        autoResize: true,
        lerp: 0.1 // Lower lerp for smoother momentum
    });
    window.lenis = lenis;

    // Optimized RAF loop
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Direct ScrollTrigger update (no debounce for smoother sync)
    lenis.on('scroll', ScrollTrigger.update);

    // Initialize all features
    initFullscreenMenu();
    initPageTransition();
    initVideoBackgrounds();
    initScrollAnimations();
    initMathJaxRefresh();
    initMetricAnimations();
    enableSmoothAnchorScrolling();

    // Optimized resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            ScrollTrigger.refresh();
            lenis.resize();
        }, 250);
    }, { passive: true });
});

// NEW: Fullscreen Menu with GSAP
function initFullscreenMenu() {
    // Create fullscreen menu overlay
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
        
        // Open menu
        trigger.addEventListener('click', () => {
            menuTl.play();
            // Stop body scroll
            if (window.lenis) window.lenis.stop();
        });
    }

    // Close menu
    closeBtn.addEventListener('click', () => {
        menuTl.reverse();
        // Resume body scroll
        if (window.lenis) window.lenis.start();
    });

    // Close on link click
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                menuTl.reverse();
                setTimeout(() => {
                    window.location.href = href;
                }, 600);
            }
        });
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            menuTl.reverse();
            if (window.lenis) window.lenis.start();
        }
    });
}

// Page Transitions (simplified)
function initPageTransition() {
    gsap.from('body', {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
    });
}

// Video Backgrounds
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
            
            // Try to play
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

// SIMPLIFIED: Scroll animations - ONLY FADE, NO MOVEMENT
function initScrollAnimations() {
    // Fade in elements - NO Y MOVEMENT
    gsap.utils.toArray('.fade-in').forEach((element, index) => {
        gsap.fromTo(element, 
            {
                opacity: 0
            },
            {
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    once: true
                },
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
                delay: index * 0.02
            }
        );
    });

    // Headings - ONLY FADE
    gsap.utils.toArray('h1, h2').forEach((heading, index) => {
        gsap.fromTo(heading,
            {
                opacity: 0
            },
            {
                scrollTrigger: {
                    trigger: heading,
                    start: "top 85%",
                    once: true
                },
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
                delay: index * 0.02
            }
        );
    });

    // Code blocks - ONLY FADE
    gsap.utils.toArray('pre').forEach((block, index) => {
        gsap.fromTo(block,
            {
                opacity: 0
            },
            {
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: block,
                    start: "top 85%",
                    once: true
                },
                delay: index * 0.05
            }
        );
    });

    // Metrics - ONLY FADE
    gsap.utils.toArray('.metric').forEach((metric, index) => {
        gsap.fromTo(metric,
            {
                opacity: 0
            },
            {
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: metric,
                    start: "top 85%",
                    once: true
                },
                delay: index * 0.08
            }
        );
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
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 80%",
                    once: true
                },
                snap: {innerText: hasDecimal ? 0.1 : 1},
                onUpdate: function() {
                    const value = hasDecimal ? 
                        parseFloat(this.targets()[0].innerText).toFixed(1) : 
                        Math.round(this.targets()[0].innerText);
                    el.textContent = value + suffix;
                }
            });
        }
    });
}

// Smooth anchor scrolling
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

// MathJax refresh
function initMathJaxRefresh() {
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().then(() => {
            setTimeout(() => ScrollTrigger.refresh(), 500);
        });
    }
}

// Check reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.globalTimeline.pause();
    ScrollTrigger.disable();
}

// Cleanup
window.addEventListener('beforeunload', () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    if (window.lenis) window.lenis.destroy();
});
