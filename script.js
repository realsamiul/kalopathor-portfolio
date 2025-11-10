// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis WITHOUT wrapper manipulation
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
        autoResize: true
    });
    
    // Store globally
    window.lenis = lenis;

    // RAF loop
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Update ScrollTrigger on scroll
    lenis.on('scroll', ScrollTrigger.update);

    // Initialize all features
    initFullscreenMenu();
    initVideoBackgrounds();
    initScrollAnimations();
    initMetricAnimations();
    enableSmoothAnchorScrolling();

    // Resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            ScrollTrigger.refresh();
            lenis.resize();
        }, 250);
    }, { passive: true });
});

// Fullscreen Menu
function initFullscreenMenu() {
    // Check if menu already exists
    if (document.getElementById('fullscreenMenu')) return;
    
    // Create menu HTML
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
        .set(menu, {
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

    // Find menu trigger
    const trigger = document.getElementById('menuTrigger');
    
    if (trigger) {
        trigger.addEventListener('click', () => {
            menuTl.play();
            if (window.lenis) window.lenis.stop();
        });
    }

    // Close menu
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            menuTl.reverse();
            if (window.lenis) window.lenis.start();
        });
    }

    // Close on link click
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                menuTl.reverse();
                if (window.lenis) window.lenis.start();
                setTimeout(() => {
                    window.location.href = href;
                }, 600);
            }
        });
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            menuTl.reverse();
            if (window.lenis) window.lenis.start();
        }
    });
}

// Video Backgrounds
function initVideoBackgrounds() {
    const videoSections = document.querySelectorAll('.video-bg, [data-video]');
    
    videoSections.forEach(section => {
        const basePath = section.dataset.video;
        
        if (basePath) {
            let video = section.querySelector('.bg-video');
            let fallback = section.querySelector('.bg-fallback');
            
            if (!video) {
                video = document.createElement('video');
                video.className = 'bg-video';
                video.setAttribute('autoplay', '');
                video.setAttribute('muted', '');
                video.setAttribute('loop', '');
                video.setAttribute('playsinline', '');
                video.setAttribute('webkit-playsinline', '');
                
                const mp4Source = document.createElement('source');
                mp4Source.src = `${basePath}.mp4`;
                mp4Source.type = 'video/mp4';
                
                const webmSource = document.createElement('source');
                webmSource.src = `${basePath}.webm`;
                webmSource.type = 'video/webm';
                
                video.appendChild(mp4Source);
                video.appendChild(webmSource);
                section.insertBefore(video, section.firstChild);
            }
            
            if (!fallback) {
                fallback = document.createElement('img');
                fallback.className = 'bg-fallback';
                fallback.src = `${basePath}.webp`;
                fallback.alt = '';
                fallback.loading = 'lazy';
                section.insertBefore(fallback, video.nextSibling);
            }
            
            video.addEventListener('error', () => {
                video.style.display = 'none';
                fallback.style.display = 'block';
            });
            
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    video.style.display = 'none';
                    fallback.style.display = 'block';
                });
            }
        }
    });
}

// Scroll Animations - FADE ONLY
function initScrollAnimations() {
    // Fade in elements
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

    // Headings
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

    // Code blocks
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

    // Metrics
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

// Metric Animations
function initMetricAnimations() {
    document.querySelectorAll('.metric-value').forEach(el => {
        const endValue = parseFloat(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        const hasDecimal = el.getAttribute('data-decimal') === 'true';
        
        if (!isNaN(endValue)) {
            const obj = { value: 0 };
            
            gsap.to(obj, {
                value: endValue,
                duration: 2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 80%",
                    once: true
                },
                onUpdate: function() {
                    const current = obj.value;
                    const formatted = hasDecimal ? 
                        current.toFixed(1) : 
                        Math.round(current);
                    el.textContent = formatted + suffix;
                }
            });
        }
    });
}

// Smooth Anchor Scrolling
function enableSmoothAnchorScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href || !window.lenis) return;

            if (href === '#') {
                e.preventDefault();
                window.lenis.scrollTo(0, { duration: 1.2 });
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                window.lenis.scrollTo(target, { 
                    duration: 1.2,
                    offset: -80 
                });
            }
        });
    });
}

// Cleanup
window.addEventListener('beforeunload', () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    if (window.lenis) window.lenis.destroy();
});
