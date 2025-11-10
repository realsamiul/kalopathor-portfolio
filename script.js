// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Register GSAP plugins including ScrollSmoother
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    
    // Initialize ScrollSmoother for smooth scrolling
    initSmoothScrolling();
    
    // Initialize animations
    initScrollAnimations();
    initParallaxEffects();
    initNavbarBehavior();
    initMathJaxRefresh();
    
    // Additional initialization
    initMetricAnimations();
    initCodeBlockAnimations();
    
    // Refresh ScrollTrigger on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 250);
    });
});

// Initialize ScrollSmoother for smooth scrolling
function initSmoothScrolling() {
    // Create ScrollSmoother instance
    const smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.5, // Adjust for your preferred smoothness
        effects: true,
        smoothTouch: 0.1,
        ease: 'power2.inOut'
    });
    
    // Wrap content if not already wrapped
    if (!document.querySelector('#smooth-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.id = 'smooth-wrapper';
        wrapper.style.overflow = 'hidden';
        document.body.appendChild(wrapper);
        
        const content = document.createElement('div');
        content.id = 'smooth-content';
        while (document.body.firstChild) {
            content.appendChild(document.body.firstChild);
        }
        wrapper.appendChild(content);
    }
    
    return smoother;
}

// Scroll-triggered fade-in animations
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
                    toggleActions: "play none none reverse"
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
    
    // Special animation for h1 and h2 elements
    gsap.utils.toArray('h1, h2').forEach((heading, index) => {
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
                    toggleActions: "play none none reverse"
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

// Parallax effect for hero and parallax sections
function initParallaxEffects() {
    const parallaxSections = document.querySelectorAll('.hero, .parallax-section');
    
    parallaxSections.forEach(section => {
        gsap.to(section, {
            backgroundPosition: `50% ${window.innerHeight * 0.5}px`,
            ease: "none",
            scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "bottom top",
                scrub: 1
            }
        });
        
        // Add subtle zoom effect on scroll
        const content = section.querySelector('.content-wrapper');
        if (content) {
            gsap.fromTo(content,
                {
                    scale: 1,
                    opacity: 1
                },
                {
                    scale: 0.95,
                    opacity: 0.8,
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top top",
                        end: "bottom top",
                        scrub: 1
                    }
                }
            );
        }
    });
}

// Bottom navigation auto-hide behavior
function initNavbarBehavior() {
    let lastScroll = 0;
    const nav = document.querySelector('.bottom-nav');
    
    if (!nav) return;
    
    ScrollTrigger.create({
        onUpdate: (self) => {
            const currentScroll = self.scroll();
            
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
        }
    });
    
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

// Smooth scrolling for navigation links (now works with ScrollSmoother)
function initSmoothScrollingLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            if (href === '#') {
                e.preventDefault();
                gsap.to(window, {
                    scrollTo: 0,
                    duration: 1.5,
                    ease: "power2.inOut"
                });
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const navHeight = document.querySelector('.bottom-nav')?.offsetHeight || 0;
                const offset = 100;
                
                gsap.to(window, {
                    scrollTo: {
                        y: target,
                        offsetY: offset
                    },
                    duration: 1.5,
                    ease: "power2.inOut"
                });
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

// Animate metrics on scroll
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
                },
                delay: index * 0.15
            }
        );
    });
}

// Enhance code block interactions
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
