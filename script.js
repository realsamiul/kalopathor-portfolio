// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger, SplitText);
    
    // Initialize Lenis for buttery smooth, uninterrupted scrolling
    const lenis = new Lenis({
        duration: 1,
        easing: (t) => t, // Linear easing for pure inertia feel
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false, // Don't interfere with touch scrolling
        touchMultiplier: 2,
        infinite: false,
        autoResize: true
    });
    
    // Connect Lenis to GSAP ScrollTrigger (read-only connection)
    lenis.on('scroll', ScrollTrigger.update);
    
    // Run Lenis raf
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    
    // Initialize animations (one-way, non-blocking)
    initScrollAnimations();
    initParallaxEffects();
    initNavbarBehavior();
    initMathJaxRefresh();
    initRollingText();
    initMetricAnimations();
    initCodeBlockAnimations();
    
    // Refresh ScrollTrigger on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            ScrollTrigger.refresh();
            lenis.resize();
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
        
        // Set up trigger based on data attribute
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

// Scroll-triggered fade-in animations (non-blocking)
function initScrollAnimations() {
    gsap.utils.toArray('.fade-in').forEach((element, index) => {
        gsap.fromTo(element, 
            {
                y: 80,
                opacity: 0,
                scale: 0.98
            },
            {
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    end: "top 55%",
                    toggleActions: "play none none reverse",
                    // No scrub - animations play independently of scroll
                },
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "power2.out",
                delay: index * 0.03
            }
        );
    });
    
    // Special animation for h1 and h2 elements (skip rolling-text elements)
    gsap.utils.toArray('h1:not(.rolling-text), h2:not(.rolling-text)').forEach((heading, index) => {
        gsap.fromTo(heading,
            {
                y: 100,
                opacity: 0,
                letterSpacing: "0.1em"
            },
            {
                scrollTrigger: {
                    trigger: heading,
                    start: "top 90%",
                    end: "top 60%",
                    toggleActions: "play none none reverse",
                    // No scrub - animations play independently
                },
                y: 0,
                opacity: 1,
                letterSpacing: heading.tagName === 'H1' ? "-0.06em" : "-0.035em",
                duration: 0.8,
                ease: "power2.out",
                delay: index * 0.03
            }
        );
    });
}

// Parallax effect - using transform instead of background-position for performance
function initParallaxEffects() {
    const parallaxSections = document.querySelectorAll('.hero, .parallax-section');
    
    parallaxSections.forEach(section => {
        // Create a separate parallax layer if needed
        const parallaxBg = section.querySelector('.parallax-bg');
        if (parallaxBg) {
            gsap.to(parallaxBg, {
                yPercent: 50,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: "bottom top",
                    scrub: true // True for parallax, but won't affect scroll smoothness
                }
            });
        }
        
        // Subtle fade effect on content (non-blocking)
        const content = section.querySelector('.content-wrapper');
        if (content) {
            ScrollTrigger.create({
                trigger: section,
                start: "top top",
                end: "bottom top",
                onUpdate: self => {
                    const progress = self.progress;
                    gsap.set(content, {
                        opacity: 1 - (progress * 0.2),
                        scale: 1 - (progress * 0.05)
                    });
                }
            });
        }
    });
}

// Bottom navigation auto-hide behavior (passive observation)
function initNavbarBehavior() {
    let lastScroll = 0;
    const nav = document.querySelector('.bottom-nav');
    
    if (!nav) return;
    
    // Use passive scroll observation
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 100) {
            nav.classList.remove('hidden');
            return;
        }
        
        if (currentScroll > lastScroll && currentScroll > 500) {
            nav.classList.add('hidden');
        } else if (currentScroll < lastScroll - 5) {
            nav.classList.remove('hidden');
        }
        
        lastScroll = currentScroll;
    }, { passive: true }); // Passive listener for better performance
    
    // Add active state to current section
    const navLinks = nav.querySelectorAll('a[href^="#"]');
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onToggle: self => {
                if (self.isActive) {
                    navLinks.forEach(link => {
                        link.style.opacity = '0.55';
                        const href = link.getAttribute('href');
                        if (href === `#${section.id}`) {
                            link.style.opacity = '1';
                        }
                    });
                }
            }
        });
    });
}

// Refresh ScrollTrigger after MathJax renders
function initMathJaxRefresh() {
    if (window.MathJax) {
        // Wait for MathJax to fully load
        if (window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise().then(() => {
                setTimeout(() => {
                    ScrollTrigger.refresh();
                }, 500);
            });
        } else {
            // Fallback for older MathJax versions
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
        const label = metric.querySelector('.metric-label');
        
        if (value) {
            const finalText = value.textContent;
            const hasDecimal = finalText.includes('.');
            const numericValue = parseFloat(finalText.replace(/[^\d.-]/g, ''));
            
            if (!isNaN(numericValue)) {
                gsap.fromTo(value,
                    {
                        textContent: 0,
                        scale: 0.8,
                        opacity: 0
                    },
                    {
                        textContent: numericValue,
                        scale: 1,
                        opacity: 1,
                        duration: 2,
                        ease: "power2.out",
                        snap: { textContent: hasDecimal ? 0.01 : 1 },
                        scrollTrigger: {
                            trigger: metric,
                            start: "top 80%",
                            toggleActions: "play none none reverse"
                            // No scrub - plays independently
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
                y: 60,
                opacity: 0,
                rotateX: -10
            },
            {
                y: 0,
                opacity: 1,
                rotateX: 0,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: metric,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                    // No scrub
                },
                delay: index * 0.15
            }
        );
    });
}

// Enhance code block interactions (non-blocking)
function initCodeBlockAnimations() {
    const codeBlocks = document.querySelectorAll('pre');
    
    codeBlocks.forEach((block, index) => {
        // Use CSS transitions for hover instead of JS
        block.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(12px) translateY(-4px)';
        });
        
        block.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(8px) translateY(-2px)';
        });
        
        gsap.fromTo(block,
            {
                x: -50,
                opacity: 0
            },
            {
                x: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: block,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                    // No scrub
                },
                delay: index * 0.1
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
