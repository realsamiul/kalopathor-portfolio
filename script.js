// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger, SplitText);

    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
        duration: 1,
        easing: (t) => t, // linear, inertia feel
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

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Run Lenis raf
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Initialize animations (non-blocking)
    initScrollAnimations();
    initNavbarBehavior();
    initMathJaxRefresh();
    initRollingText();
    initMetricAnimations();
    initCodeBlockAnimations();
    enableSmoothAnchorScrolling();

    // Refresh ScrollTrigger on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            ScrollTrigger.refresh();
            if (lenis && typeof lenis.resize === 'function') {
                lenis.resize();
            }
        }, 250);
    });
});

// Rolling Text Animation (non-blocking)
function initRollingText() {
    document.querySelectorAll('.rolling-text').forEach(element => {
        const repeatCount = parseInt(element.dataset.repeat) || 8;
        const duration = parseFloat(element.dataset.duration) || 4;
        const ease = element.dataset.ease || "power4.inOut";
        const trigger = element.dataset.trigger || "scroll";

        const tl = gsap.timeline({ paused: true });
        const split = new SplitText(element, { type: "chars" });

        split.chars.forEach((obj, i) => {
            let txt = obj.innerText;
            let clone = `<div class="cloneText">${txt}</div>`;
            let newHTML = `<div class="originalText">${txt}</div>${clone}`;
            obj.innerHTML = newHTML;
            gsap.set(obj.childNodes[1], {
                yPercent: i % 2 === 0 ? -100 : 100
            });
            let tween = gsap.to(obj.childNodes, {
                repeat: repeatCount,
                ease: "none",
                yPercent: i % 2 === 0 ? "+=100" : "-=100"
            });
            tl.add(tween, 0);
        });

        const mainAnimation = gsap.to(tl, { 
            progress: 1, 
            duration: duration, 
            ease: ease,
            paused: true
        });

        if (trigger === "scroll") {
            ScrollTrigger.create({
                trigger: element,
                start: "top 80%",
                onEnter: () => mainAnimation.play(),
                once: true
            });
        } else if (trigger === "hover") {
            element.addEventListener('mouseenter', () => mainAnimation.play());
            element.addEventListener('mouseleave', () => mainAnimation.reverse());
        } else if (trigger === "load") {
            mainAnimation.play();
        }
    });
}

// Scroll-triggered fade-in animations (non-blocking, no scaling to keep text crisp)
function initScrollAnimations() {
    gsap.utils.toArray('.fade-in').forEach((element, index) => {
        gsap.fromTo(element, 
            {
                y: 60,
                opacity: 0
            },
            {
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    end: "top 55%",
                    toggleActions: "play none none none",
                    once: true
                },
                y: 0,
                opacity: 1,
                duration: 0.7,
                ease: "power2.out",
                delay: index * 0.02
            }
        );
    });

    // Headings (skip rolling-text elements), keep crisp (no scale)
    gsap.utils.toArray('h1:not(.rolling-text), h2:not(.rolling-text)').forEach((heading, index) => {
        gsap.fromTo(heading,
            {
                y: 80,
                opacity: 0
            },
            {
                scrollTrigger: {
                    trigger: heading,
                    start: "top 90%",
                    end: "top 60%",
                    toggleActions: "play none none none",
                    once: true
                },
                y: 0,
                opacity: 1,
                duration: 0.7,
                ease: "power2.out",
                delay: index * 0.02
            }
        );
    });
}

// Bottom navigation: island style, always visible; collapsible on small screens
function initNavbarBehavior() {
    const navContainer = document.querySelector('.bottom-nav');
    if (!navContainer) return;

    const nav = navContainer.querySelector('nav');
    if (!nav) return;

    // Insert a hamburger toggle for small screens
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
            navContainer.classList.remove('collapsible');
            navContainer.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    };
    updateMode();
    window.addEventListener('resize', updateMode);

    toggle.addEventListener('click', () => {
        const open = navContainer.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
    });
}

// Smooth anchor scrolling via Lenis (prevents native jump)
function enableSmoothAnchorScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    if (!links.length) return;

    links.forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (!href) return;
            if (!window.lenis) return;

            if (href === '#') {
                e.preventDefault();
                window.lenis.scrollTo(0, { duration: 1, easing: t => 1 - Math.pow(1 - t, 3) });
                return;
            }
            const id = href.slice(1);
            const target = document.getElementById(id);
            if (target) {
                e.preventDefault();
                window.lenis.scrollTo(target, { duration: 1.1, easing: t => 1 - Math.pow(1 - t, 3) });
            }
        });
    });
}

// Refresh ScrollTrigger after MathJax renders
function initMathJaxRefresh() {
    if (window.MathJax) {
        if (window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise().then(() => {
                setTimeout(() => {
                    ScrollTrigger.refresh();
                }, 500);
            });
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    ScrollTrigger.refresh();
                }, 1500);
            });
        }
    }
}

// Animate metrics on scroll (non-blocking)
function initMetricAnimations() {
    gsap.utils.toArray('.metric').forEach((metric, index) => {
        const value = metric.querySelector('.metric-value');

        if (value) {
            const finalText = value.textContent;
            const hasDecimal = finalText.includes('.');
            const numericValue = parseFloat(finalText.replace(/[^\d.-]/g, ''));

            if (!isNaN(numericValue)) {
                gsap.fromTo(value,
                    {
                        textContent: 0,
                        opacity: 0
                    },
                    {
                        textContent: numericValue,
                        opacity: 1,
                        duration: 2,
                        ease: "power2.out",
                        snap: { textContent: hasDecimal ? 0.01 : 1 },
                        scrollTrigger: {
                            trigger: metric,
                            start: "top 80%",
                            toggleActions: "play none none none",
                            once: true
                        },
                        onUpdate: function() {
                            const current = this.targets()[0].textContent;
                            const formatted = hasDecimal ? 
                                parseFloat(current).toFixed(2) : 
                                Math.round(current);

                            const suffix = finalText.replace(/[\d.-]/g, '');
                            this.targets()[0].textContent = formatted + suffix;
                        },
                        delay: index * 0.1
                    }
                );
            }
        }

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
                    toggleActions: "play none none none",
                    once: true
                },
                delay: index * 0.12
            }
        );
    });
}

// Enhance code block interactions (non-blocking)
function initCodeBlockAnimations() {
    const codeBlocks = document.querySelectorAll('pre');

    codeBlocks.forEach((block, index) => {
        block.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(12px) translateY(-4px)';
        });
        block.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(8px) translateY(-2px)';
        });

        gsap.fromTo(block,
            {
                x: -40,
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
                    toggleActions: "play none none none",
                    once: true
                },
                delay: index * 0.08
            }
        );
    });
}

// Utility function to detect if user prefers reduced motion
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
});
