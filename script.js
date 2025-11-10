// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // CRITICAL FIX: Initialize Lenis with optimized settings for smoothness
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
        autoResize: true
    });
    window.lenis = lenis;

    // CRITICAL FIX: Single RAF loop to prevent conflicts
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // CRITICAL FIX: Debounced ScrollTrigger update (prevents over-refreshing)
    let scrollTimeout;
    lenis.on('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => ScrollTrigger.update(), 50);
    });

    // Initialize page transition
    initPageTransition();
    
    // Initialize animations (non-blocking)
    initVideoBackgrounds();
    initScrollAnimations();
    initNavbarBehavior();
    initMathJaxRefresh();
    initMetricAnimations();
    initCodeBlockAnimations();
    enableSmoothAnchorScrolling();

    // CRITICAL FIX: Single debounced resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            ScrollTrigger.refresh();
            if (lenis && typeof lenis.resize === 'function') {
                lenis.resize();
            }
        }, 300);
    }, { passive: true });
});

// Page Transition System
function initPageTransition() {
    // Fade in on load
    gsap.from('body', {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
    });

    // Handle all internal links
    document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            e.preventDefault();
            
            gsap.to('body', {
                opacity: 0,
                duration: 0.4,
                ease: 'power2.in',
                onComplete: () => {
                    window.location.href = href;
                }
            });
        });
    });
}

// CRITICAL FIX: Optimized video backgrounds
function initVideoBackgrounds() {
    const videoSections = document.querySelectorAll('.video-bg');
    
    const supportsVideo = !!document.createElement('video').canPlayType;
    if (!supportsVideo) {
        document.body.classList.add('no-video');
        return;
    }
    
    videoSections.forEach(section => {
        const video = section.querySelector('.bg-video');
        const fallback = section.querySelector('.bg-fallback');
        
        if (video) {
            // Optimize video playback
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.muted = true;
            video.loop = true;
            
            video.addEventListener('error', () => {
                video.style.display = 'none';
                if (fallback) fallback.style.display = 'block';
            }, { once: true });
            
            video.addEventListener('loadeddata', () => {
                video.play().catch(() => {
                    video.style.display = 'none';
                    if (fallback) fallback.style.display = 'block';
                });
            }, { once: true });
        }
    });
}

// CRITICAL FIX: Optimized metric counter animation
function initMetricAnimations() {
    document.querySelectorAll('.metric-value').forEach(el => {
        const endValue = parseFloat(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        const hasDecimal = el.getAttribute('data-decimal') === 'true';
        
        if (!isNaN(endValue)) {
            gsap.to(el, {
                innerText: endValue,
                duration: 2.5,
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
    
    // Existing metric animations
    gsap.utils.toArray('.metric').forEach((metric, index) => {
        gsap.fromTo(metric,
            {
                y: 50,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 0.9,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: metric,
                    start: "top 85%",
                    once: true
                },
                delay: index * 0.12
            }
        );
    });
}

// CRITICAL FIX: Simplified scroll animations (no transform conflicts)
function initScrollAnimations() {
    gsap.utils.toArray('.fade-in').forEach((element, index) => {
        gsap.fromTo(element, 
            {
                y: 40,
                opacity: 0
            },
            {
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    once: true
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
                delay: index * 0.015
            }
        );
    });

    // Headings
    gsap.utils.toArray('h1:not(.rolling-text), h2:not(.rolling-text)').forEach((heading, index) => {
        gsap.fromTo(heading,
            {
                y: 50,
                opacity: 0
            },
            {
                scrollTrigger: {
                    trigger: heading,
                    start: "top 90%",
                    once: true
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
                delay: index * 0.015
            }
        );
    });
}

// CRITICAL FIX: Bottom nav without transform conflicts
function initNavbarBehavior() {
    const navContainer = document.querySelector('.bottom-nav');
    if (!navContainer) return;

    const nav = navContainer.querySelector('nav');
    if (!nav) return;

    // Insert hamburger toggle
    const toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Toggle navigation');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    nav.prepend(toggle);

    const updateMode = () => {
        if (window.innerWidth <= 860) {
            navContainer.classList.add('collapsible');
        } else {
            navContainer.classList.remove('collapsible', 'open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    };
    updateMode();
    window.addEventListener('resize', updateMode, { passive: true });

    toggle.addEventListener('click', () => {
        const open = navContainer.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
    });
}

// Smooth anchor scrolling via Lenis
function enableSmoothAnchorScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    if (!links.length) return;

    links.forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (!href || !window.lenis) return;

            if (href === '#') {
                e.preventDefault();
                window.lenis.scrollTo(0, { duration: 1.2 });
                return;
            }
            const id = href.slice(1);
            const target = document.getElementById(id);
            if (target) {
                e.preventDefault();
                window.lenis.scrollTo(target, { duration: 1.2, offset: -100 });
            }
        });
    });
}

// CRITICAL FIX: Single MathJax refresh
function initMathJaxRefresh() {
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().then(() => {
            setTimeout(() => ScrollTrigger.refresh(), 800);
        });
    }
}

// CRITICAL FIX: Optimized code block animations (no hover transform during scroll)
function initCodeBlockAnimations() {
    const codeBlocks = document.querySelectorAll('pre');

    codeBlocks.forEach((block, index) => {
        gsap.fromTo(block,
            {
                x: -30,
                opacity: 0
            },
            {
                x: 0,
                opacity: 1,
                duration: 0.9,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: block,
                    start: "top 90%",
                    once: true
                },
                delay: index * 0.08
            }
        );
    });
}

// Utility: Check for reduced motion preference
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Disable animations if user prefers reduced motion
if (prefersReducedMotion()) {
    gsap.globalTimeline.pause();
    ScrollTrigger.disable();
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    if (window.lenis) window.lenis.destroy();
});