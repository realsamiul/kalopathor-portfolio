// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // CRITICAL: Initialize Lenis with proper momentum settings
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
        autoResize: true,
        // IMPORTANT: Add these for momentum
        lerp: 0.1, // Lower value = more momentum
        smoothWheel: true,
        syncTouch: false,
        touchInertia: true
    });
    
    // Store globally
    window.lenis = lenis;

    // CRITICAL: Proper ScrollTrigger integration
    ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
            if (arguments.length) {
                lenis.scroll = value;
            }
            return lenis.scroll;
        }
    });

    // CRITICAL: Single RAF loop without conflicts
    let rafId;
    function raf(time) {
        lenis.raf(time);
        ScrollTrigger.update();
        rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // REMOVED: Don't call ScrollTrigger.update separately on scroll
    // This was causing the sudden stops

    // Initialize features after a small delay
    setTimeout(() => {
        initFullscreenMenu();
        initVideoBackgrounds();
        initScrollAnimations();
        initMetricAnimations();
        enableSmoothAnchorScrolling();
        
        // CRITICAL: Refresh after all animations are set up
        ScrollTrigger.refresh();
    }, 100);

    // CRITICAL: Debounced resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            lenis.resize();
            ScrollTrigger.refresh();
        }, 250);
    }, { passive: true });
});

// Fullscreen Menu (keep as is, but with fix)
function initFullscreenMenu() {
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

    const trigger = document.getElementById('menuTrigger');
    
    if (trigger) {
        trigger.addEventListener('click', () => {
            menuTl.play();
            // CRITICAL: Use lenis.stop() correctly
            if (window.lenis) {
                window.lenis.stop();
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            menuTl.reverse();
            // CRITICAL: Use lenis.start() correctly
            if (window.lenis) {
                window.lenis.start();
            }
        });
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                menuTl.reverse();
                if (window.lenis) {
                    window.lenis.start();
                }
                setTimeout(() => {
                    window.location.href = href;
                }, 600);
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            menuTl.reverse();
            if (window.lenis) {
                window.lenis.start();
            }
        }
    });
}

// Video Backgrounds (keep as is)
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

// CRITICAL: Optimized scroll animations
function initScrollAnimations() {
    // Use batch for better performance
    ScrollTrigger.batch('.fade-in', {
        onEnter: batch => gsap.fromTo(batch, 
            { opacity: 0 },
            { 
                opacity: 1, 
                duration: 0.8, 
                ease: "power2.out",
                stagger: 0.02,
                overwrite: 'auto'
            }
        ),
        start: "top 85%",
        once: true
    });

    // Headings
    ScrollTrigger.batch('h1, h2', {
        onEnter: batch => gsap.fromTo(batch,
            { opacity: 0 },
            { 
                opacity: 1, 
                duration: 0.8, 
                ease: "power2.out",
                stagger: 0.02,
                overwrite: 'auto'
            }
        ),
        start: "top 85%",
        once: true
    });

    // Code blocks
    ScrollTrigger.batch('pre', {
        onEnter: batch => gsap.fromTo(batch,
            { opacity: 0 },
            { 
                opacity: 1, 
                duration: 0.8, 
                ease: "power2.out",
                stagger: 0.05,
                overwrite: 'auto'
            }
        ),
        start: "top 85%",
        once: true
    });

    // Metrics
    ScrollTrigger.batch('.metric', {
        onEnter: batch => gsap.fromTo(batch,
            { opacity: 0 },
            { 
                opacity: 1, 
                duration: 0.8, 
                ease: "power2.out",
                stagger: 0.08,
                overwrite: 'auto'
            }
        ),
        start: "top 85%",
        once: true
    });
}

// Metric Animations (keep as is)
function initMetricAnimations() {
    document.querySelectorAll('.metric-value').forEach(el => {
        const endValue = parseFloat(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        const hasDecimal = el.getAttribute('data-decimal') === 'true';
        
        if (!isNaN(endValue)) {
            const obj = { value: 0 };
            
            ScrollTrigger.create({
                trigger: el,
                start: "top 80%",
                once: true,
                onEnter: () => {
                    gsap.to(obj, {
                        value: endValue,
                        duration: 2,
                        ease: "power2.out",
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
    });
}

// CRITICAL: Fixed anchor scrolling
function enableSmoothAnchorScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href || !window.lenis) return;

            e.preventDefault();

            if (href === '#') {
                window.lenis.scrollTo(0, { 
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                window.lenis.scrollTo(target, { 
                    duration: 1.2,
                    offset: -80,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });
}

// Cleanup
window.addEventListener('beforeunload', () => {
    if (window.rafId) cancelAnimationFrame(window.rafId);
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    if (window.lenis) window.lenis.destroy();
});
