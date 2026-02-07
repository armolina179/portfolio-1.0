// Detect hover capability
const hasHover = window.matchMedia('(hover: hover)').matches;

const cursor = document.querySelector('.custom-cursor');

if (cursor) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
}

// GSAP Infinite Marquee Animation
(function() {
    const marqueeContent = document.querySelector('.marquee__content');
    if (!marqueeContent) return;

    // Ensure we have two copies of the content for a seamless loop
    const ensureClone = () => {
        if (marqueeContent.dataset.cloned === 'true') return;
        const clone = marqueeContent.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        marqueeContent.appendChild(clone);
        marqueeContent.dataset.cloned = 'true';
    };

    // Create infinite scroll animation
    const initMarquee = () => {
        ensureClone();
        const totalWidth = marqueeContent.scrollWidth;
        const singleWidth = totalWidth / 2;
        if (singleWidth === 0) return;

        // Reset any existing animation
        gsap.killTweensOf(marqueeContent);

        // Set initial position
        gsap.set(marqueeContent, { x: 0 });

        // Create the animation - move by one text width for seamless loop
        gsap.to(marqueeContent, {
            x: -singleWidth,
            duration: 50, // Adjust speed here (lower = faster)
            ease: 'none',
            repeat: -1, // Infinite repeat
        });
    };

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Wait a bit for fonts to load
            setTimeout(initMarquee, 100);
        });
    } else {
        setTimeout(initMarquee, 100);
    }

    // Reinitialize on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(initMarquee, 250);
    });
})();

// Hover preview for about-page links to works
(function () {
    const previewLinks = document.querySelectorAll('.work-preview-link');
    if (!previewLinks || previewLinks.length === 0) return;

    let previewEl = null;
    let isVisible = false;

    function ensurePreviewEl() {
        if (previewEl) return previewEl;
        previewEl = document.createElement('div');
        previewEl.className = 'hover-preview';
        document.body.appendChild(previewEl);
        return previewEl;
    }

    function showPreview(e, linkEl) {
        const target = ensurePreviewEl();
        const src = linkEl.getAttribute('data-preview');
        const type = (linkEl.getAttribute('data-preview-type') || '').toLowerCase();
        if (!src) return;

        // Clear existing content
        target.innerHTML = '';

        if (type === 'video' || src.endsWith('.mp4') || src.endsWith('.webm')) {
            const v = document.createElement('video');
            v.src = src;
            v.muted = true;
            v.autoplay = true;
            v.loop = true;
            v.playsInline = true;
            target.appendChild(v);
        } else {
            const img = document.createElement('img');
            img.src = src;
            img.alt = '';
            target.appendChild(img);
        }

        positionPreview(e);
        target.style.display = 'block';
        isVisible = true;
    }

    function hidePreview() {
        if (!previewEl) return;
        previewEl.style.display = 'none';
        isVisible = false;
    }

    function positionPreview(e) {
        if (!previewEl) return;
        const offsetX = 16; // slightly to the right
        const offsetY = 16; // slightly below
        let x = e.clientX + offsetX;
        let y = e.clientY + offsetY;

        // Keep inside viewport if near edge
        const w = 100;
        const h = 100;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (x + w > vw) x = e.clientX - w - offsetX;
        if (y + h > vh) y = e.clientY - h - offsetY;

        previewEl.style.left = x + 'px';
        previewEl.style.top = y + 'px';
    }

    previewLinks.forEach((link) => {
        // Only attach hover listeners if device supports hover
        if (hasHover) {
            link.addEventListener('mouseenter', (e) => showPreview(e, link));
            link.addEventListener('mouseleave', hidePreview);
            link.addEventListener('mousemove', (e) => positionPreview(e));
        }
        // Ensure hiding if link is focused out with keyboard
        link.addEventListener('blur', hidePreview);
    });

    // Also reposition on window scroll to keep relative placement sensible
    window.addEventListener('scroll', () => {
        if (!isVisible || !previewEl) return;
        // No position change here; will update on next mousemove
    }, { passive: true });
})();

// Project Page: Hover-trigger images, lightbox, and tooltip functionality
(function() {
    const projectVideo = document.querySelector('.project-video');
    const projectImage = document.querySelector('.project-image');
    const projectImageContainer = document.querySelector('.project-image-container');
    const hoverTriggers = document.querySelectorAll('.hover-trigger');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxOverlay = document.querySelector('.lightbox-overlay');
    
    function openLightbox(imagePath) {
        if (lightbox && lightboxImage) {
            lightboxImage.src = imagePath;
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeLightbox() {
        if (lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    // Initialize lightbox functionality if it exists
    function initLightbox() {
        if (!lightbox || !lightboxImage || !lightboxClose) return;
        
        // Close lightbox handlers
        lightboxClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeLightbox();
        });
        
        if (lightboxOverlay) {
            lightboxOverlay.addEventListener('click', () => {
                closeLightbox();
            });
        }
        
        // Close lightbox on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox && lightbox.style.display === 'flex') {
                closeLightbox();
            }
        });
    }
    
    // Initialize lightbox functionality (always, if it exists)
    initLightbox();
    
    // Only initialize hover-trigger functionality if we have the required elements
    if (!projectVideo || !projectImage || !projectImageContainer || hoverTriggers.length === 0) {
        return;
    }
    
    let isImageLocked = false;
    let lockedImagePath = null;
    
    function showImage(imagePath) {
        projectImage.src = imagePath;
        projectImageContainer.style.display = 'flex';
        projectVideo.style.display = 'none';
    }
    
    function hideImage() {
        if (!isImageLocked) {
            projectImageContainer.style.display = 'none';
            projectVideo.style.display = 'block';
        }
    }
    
    function lockImage(imagePath) {
        isImageLocked = true;
        lockedImagePath = imagePath;
        showImage(imagePath);
    }
    
    function unlockImage() {
        isImageLocked = false;
        lockedImagePath = null;
        projectImageContainer.style.display = 'none';
        projectVideo.style.display = 'block';
    }
    
    // openLightbox and closeLightbox are already defined above
    
    // Create tooltip elements only if hover-triggers exist and device supports hover
    let tooltip = null;
    let tooltipArrow = null;
    
    if (hoverTriggers.length > 0 && hasHover) {
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip-element';
        tooltip.textContent = 'Click to stamp image';
        document.body.appendChild(tooltip);
        
        tooltipArrow = document.createElement('div');
        tooltipArrow.className = 'tooltip-arrow';
        document.body.appendChild(tooltipArrow);
    }
    
    hoverTriggers.forEach(trigger => {
        const imagePath = trigger.getAttribute('data-image');
        if (!imagePath) return;
        
        // Position tooltip dynamically to avoid clipping
        function updateTooltipPosition() {
            if (!tooltip || !tooltipArrow) return;
            
            const rect = trigger.getBoundingClientRect();
            const tooltipHeight = 40; // Approximate tooltip height
            const tooltipArrowHeight = 5;
            const spacing = 8;
            const minTopMargin = 10; // Minimum margin from top of viewport
            const spaceAbove = rect.top;
            
            // Calculate tooltip position - use viewport coordinates for fixed positioning
            let tooltipTop, arrowTop;
            
            if (spaceAbove < tooltipHeight + tooltipArrowHeight + spacing + minTopMargin) {
                // Not enough space above, position below
                tooltipTop = rect.bottom + spacing;
                arrowTop = rect.bottom + spacing - tooltipArrowHeight;
                tooltipArrow.classList.add('below');
            } else {
                // Position above
                tooltipTop = rect.top - tooltipHeight - spacing;
                arrowTop = rect.top - spacing;
                tooltipArrow.classList.remove('below');
            }
            
            // Set tooltip position (viewport coordinates for fixed positioning)
            const tooltipLeft = rect.left + (rect.width / 2);
            tooltip.style.top = tooltipTop + 'px';
            tooltip.style.left = tooltipLeft + 'px';
            tooltipArrow.style.top = arrowTop + 'px';
            tooltipArrow.style.left = tooltipLeft + 'px';
        }
        
        function showTooltip() {
            if (!tooltip || !tooltipArrow) return;
            updateTooltipPosition();
            tooltip.classList.add('visible');
            tooltipArrow.classList.add('visible');
        }
        
        function hideTooltip() {
            if (!tooltip || !tooltipArrow) return;
            tooltip.classList.remove('visible');
            tooltipArrow.classList.remove('visible');
        }
        
        // Only attach hover listeners if device supports hover
        if (hasHover) {
            trigger.addEventListener('mouseenter', (e) => {
                showTooltip();
                
                if (!isImageLocked) {
                    showImage(imagePath);
                }
            });
            
            // Update tooltip position on scroll while hovering
            let scrollHandler = () => {
                if (trigger.matches(':hover')) {
                    updateTooltipPosition();
                }
            };
            window.addEventListener('scroll', scrollHandler, { passive: true });
            
            trigger.addEventListener('mouseleave', () => {
                hideTooltip();
                hideImage();
            });
        }
        
        // Click behavior: stamp image for hover devices, open in new tab for touch devices
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (hasHover) {
                // Hover devices: stamp image
                lockImage(imagePath);
            } else {
                // Touch devices: open image in new tab
                // Resolve relative path to absolute URL
                const absolutePath = new URL(imagePath, window.location.href).href;
                window.open(absolutePath, '_blank');
            }
        });
    });
    
    // Click on the image to open lightbox
    if (projectImage) {
        projectImage.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentImageSrc = projectImage.src;
            if (currentImageSrc && projectImageContainer.style.display !== 'none') {
                openLightbox(currentImageSrc);
            }
        });
        
        // Make image cursor indicate it's clickable
        projectImage.style.cursor = 'pointer';
    }
    
    // Also allow clicking the container to open lightbox
    if (projectImageContainer) {
        projectImageContainer.addEventListener('click', (e) => {
            // Only open if clicking the image or text, not the container itself
            if (e.target === projectImage || e.target.classList.contains('image-expand-text')) {
                const currentImageSrc = projectImage.src;
                if (currentImageSrc && projectImageContainer.style.display !== 'none') {
                    openLightbox(currentImageSrc);
                }
            }
        });
    }
    
    // Click anywhere else on the page to unlock (but not if lightbox is open)
    document.addEventListener('click', (e) => {
        // Check if click is on a hover trigger or lightbox
        const clickedTrigger = e.target.closest('.hover-trigger');
        const clickedLightbox = e.target.closest('.lightbox');
        if (!clickedTrigger && !clickedLightbox && isImageLocked) {
            unlockImage();
        }
    });
})();

// Realtime timestamp (home page)
(function(){
    const pad = n => String(n).padStart(2,'0');
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof updateRealtimeTimestamp === 'function') updateRealtimeTimestamp();
    });
    const d = new Date();
    const ts = pad(pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + String(d.getFullYear()).slice(-2) + ' @ ' + pad(d.getHours()) + ':' + pad(d.getMinutes()));
    const realtimeEl = document.getElementById('realtime-timestamp');
    if (realtimeEl) realtimeEl.textContent = ts;
})();

// Phase Dropdown Toggle Functionality
(function() {
    const phaseToggles = document.querySelectorAll('.phase-toggle');
    
    if (phaseToggles.length === 0) return;
    
    phaseToggles.forEach(toggle => {
        const phaseContent = toggle.nextElementSibling;
        
        if (!phaseContent || !phaseContent.classList.contains('phase-content')) {
            return;
        }
        
        // Set initial state - collapsed by default
        phaseContent.style.maxHeight = '0';
        
        // Handle keyboard accessibility
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('tabindex', '0');
        toggle.setAttribute('aria-expanded', 'false');
        
        function handleToggle() {
            const isExpanded = phaseContent.classList.contains('expanded');
            
            if (isExpanded) {
                // Collapse
                phaseContent.classList.remove('expanded');
                phaseContent.style.maxHeight = '0';
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            } else {
                // Expand
                phaseContent.classList.add('expanded');
                // Set max-height to scrollHeight for smooth animation
                phaseContent.style.maxHeight = phaseContent.scrollHeight + 'px';
                toggle.classList.add('active');
                toggle.setAttribute('aria-expanded', 'true');
            }
        }
        
        toggle.addEventListener('click', handleToggle);
        
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggle();
            }
        });
    });
})();
