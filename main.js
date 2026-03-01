document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup Canvas Sequences
    setupHeroCanvas('hero-canvas', 120, 120);
    setupStickCanvas('stick-canvas', 109);
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.3 });

    // 3. Hamburger Menu Logic
    const hamburger = document.getElementById('hamburgerMenu');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent document click immediately
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // 4. Global Navbar Fill Logic
    const navbar = document.querySelector('.navbar');
    const stickSection = document.getElementById('ecosystem');

    let navTicking = false;
    window.addEventListener('scroll', () => {
        if (!stickSection || !navbar) return;

        if (!navTicking) {
            window.requestAnimationFrame(() => {
                // Fill navbar after the user scrolls entirely past the stick sequence
                if (window.scrollY >= stickSection.offsetTop + stickSection.offsetHeight - 50) {
                    navbar.classList.add('filled');
                } else {
                    navbar.classList.remove('filled');
                }
                navTicking = false;
            });
            navTicking = true;
        }
    });

    function initLogoPosition() {
        window.dispatchEvent(new Event('resize'));
        window.dispatchEvent(new Event('scroll'));
    }

    // Trigger initial positioning safely after layout is fully painted
    if (document.fonts) {
        document.fonts.ready.then(() => {
            requestAnimationFrame(() => requestAnimationFrame(initLogoPosition));
        });
    }
    window.addEventListener('load', initLogoPosition);
    setTimeout(initLogoPosition, 100);
    setTimeout(initLogoPosition, 500);
});

function setupHeroCanvas(canvasId, seq1Frames, seq2Frames) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const context = canvas.getContext('2d');

    canvas.width = 1920;
    canvas.height = 1080;

    const totalFrames = seq1Frames + seq2Frames;
    const getFrameUrl = index => {
        if (index <= seq1Frames) {
            return `./heroSequence1/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;
        } else {
            const seq2Index = index - seq1Frames;
            return `./heroSequence2/ezgif-frame-${seq2Index.toString().padStart(3, '0')}.jpg`;
        }
    };

    const images = [];
    let state = { frame: 0 };
    let preloaded = 0;

    // Load first frame specifically to render immediately
    const firstImg = new Image();
    firstImg.onload = () => {
        images[0] = firstImg;
        render();
        preloadRest();
    };
    firstImg.src = getFrameUrl(1);

    function preloadRest() {
        for (let i = 2; i <= totalFrames; i++) {
            const img = new Image();
            img.onload = () => {
                images[i - 1] = img;
                preloaded++;
            };
            img.src = getFrameUrl(i);
            images[i - 1] = img; // store reference even if not loaded yet
        }
    }

    function render() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        const img = images[state.frame];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.min(hRatio, vRatio); // contain logic to show full product
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;

        context.drawImage(img, 0, 0, img.width, img.height,
            centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    }

    const section = canvas.closest('.sequence-hero');
    const heroIntro = document.getElementById('heroIntro');
    const overlaySeq1 = document.getElementById('overlay-seq-1');
    const overlaySeq2 = document.getElementById('overlay-seq-2');

    let logoAnimCache = null;
    function cacheLogoBounds() {
        const logoTarget = document.getElementById('logoTarget');
        const ghost = document.getElementById('heroTitleGhost');
        const sticky = document.querySelector('.sticky-container');
        if (!logoTarget || !ghost || !sticky) return;

        const targetRect = logoTarget.getBoundingClientRect();
        const stickyRect = sticky.getBoundingClientRect();
        const gRect = ghost.getBoundingClientRect();

        // If not painted yet, cancel caching so it tries again later
        if (gRect.width === 0 || gRect.height === 0) return;

        const stuckTop = gRect.top - stickyRect.top;
        const stuckLeft = gRect.left - stickyRect.left;

        const ghostStyle = window.getComputedStyle(ghost);
        const targetStyle = window.getComputedStyle(logoTarget);

        logoAnimCache = {
            startX: stuckLeft,
            startY: stuckTop,
            endX: targetRect.left,
            endY: targetRect.top,
            startFontSize: parseFloat(ghostStyle.fontSize),
            endFontSize: parseFloat(targetStyle.fontSize)
        };
    }

    let heroTicking = false;
    window.addEventListener('scroll', () => {
        if (!heroTicking) {
            window.requestAnimationFrame(() => {
                const scrollTop = window.scrollY;

                // Custom Scroll Progress
                const scrollProgressBar = document.getElementById('scrollProgressBar');
                if (scrollProgressBar) {
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                    scrollProgressBar.style.height = `${scrollPercent}%`;
                }

                const sectionTop = section.offsetTop;
                const sectionHeight = section.scrollHeight - window.innerHeight;

                if (scrollTop >= sectionTop && scrollTop <= sectionTop + sectionHeight) {
                    let scrollFraction = (scrollTop - sectionTop) / sectionHeight;
                    scrollFraction = Math.max(0, Math.min(1, scrollFraction));

                    // fade out scroll indicator
                    const scrollIndicator = document.getElementById('scrollIndicator');
                    if (scrollIndicator) {
                        if (scrollFraction > 0.05) {
                            scrollIndicator.style.opacity = '0';
                            scrollIndicator.style.pointerEvents = 'none';
                        } else {
                            scrollIndicator.style.opacity = '1';
                            scrollIndicator.style.pointerEvents = 'auto';
                        }
                    }

                    const frameIndex = Math.min(totalFrames - 1, Math.floor(scrollFraction * totalFrames));

                    // Animate Logo from Hero to Navbar
                    const heroSubtitle = document.getElementById('heroSubtitle');
                    const navLogoText = document.getElementById('navLogoText');

                    if (!logoAnimCache) cacheLogoBounds();

                    // Fade out "Introducing" between 0.35 and 0.40
                    let subtitleOpacity = 1;
                    if (scrollFraction > 0.35 && scrollFraction <= 0.40) {
                        subtitleOpacity = 1 - ((scrollFraction - 0.35) / 0.05);
                    } else if (scrollFraction > 0.40) {
                        subtitleOpacity = 0;
                    }
                    if (heroSubtitle) heroSubtitle.style.opacity = subtitleOpacity;

                    // Animate "Netra Sathi" from 0.40 to 0.55
                    let logoProgress = 0;
                    if (scrollFraction > 0.40 && scrollFraction <= 0.55) {
                        logoProgress = (scrollFraction - 0.40) / 0.15;
                    } else if (scrollFraction > 0.55) {
                        logoProgress = 1;
                    }

                    // easeInOutCubic for smooth motion
                    const ease = logoProgress < 0.5 ? 4 * logoProgress * logoProgress * logoProgress : 1 - Math.pow(-2 * logoProgress + 2, 3) / 2;

                    if (logoAnimCache && navLogoText) {
                        const currentX = logoAnimCache.startX * (1 - ease) + logoAnimCache.endX * ease;
                        const currentY = logoAnimCache.startY * (1 - ease) + logoAnimCache.endY * ease;
                        const currentFontSize = logoAnimCache.startFontSize * (1 - ease) + logoAnimCache.endFontSize * ease;

                        navLogoText.style.transform = `translate(${currentX}px, ${currentY}px)`;
                        navLogoText.style.fontSize = `${currentFontSize}px`;
                        navLogoText.style.opacity = 1;
                    }

                    // Fade in "Empowering Every Step." during heroSequence2 (scrollFraction > 0.5)
                    const heroDynamicText = document.getElementById('heroDynamicText');
                    let heroTextOpacity = 0;
                    if (scrollFraction > 0.60) {
                        // start fading in after logo is settled in navbar
                        heroTextOpacity = Math.min(1, (scrollFraction - 0.60) / 0.15);
                    }
                    if (heroDynamicText) heroDynamicText.style.opacity = heroTextOpacity;

                    if (state.frame !== frameIndex) {
                        requestAnimationFrame(() => {
                            state.frame = frameIndex;
                            render();
                        });
                    }
                }
                heroTicking = false;
            });
            heroTicking = true;
        }
    });

    window.addEventListener('resize', () => {
        logoAnimCache = null;
        render();
    });
}

// --- Stick Parallax System Logic ---
function setupStickCanvas(canvasId, totalFrames) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const context = canvas.getContext('2d');

    canvas.width = 1920;
    canvas.height = 1080;

    const getFrameUrl = index => `./stickSequence1/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;
    const images = [];
    let loadedImages = 0;

    for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
        img.onload = () => {
            loadedImages++;
            if (loadedImages === totalFrames) {
                // Initial draw when all are loaded
                context.drawImage(images[0], 0, 0, canvas.width, canvas.height);
            }
        };
        images.push(img);
    }

    const section = canvas.closest('.sequence-stick');
    if (!section) return;

    // Helper to get true absolute top offset
    function getAbsoluteOffsetTop(element) {
        let offsetTop = 0;
        while (element) {
            offsetTop += element.offsetTop;
            element = element.offsetParent;
        }
        return offsetTop;
    }

    let stickTicking = false;
    window.addEventListener('scroll', () => {
        if (!stickTicking) {
            window.requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                const sectionTop = getAbsoluteOffsetTop(section);

                const sectionHeight = section.scrollHeight - window.innerHeight;

                if (scrollTop >= sectionTop && scrollTop <= sectionTop + sectionHeight) {
                    let scrollFraction = (scrollTop - sectionTop) / sectionHeight;
                    scrollFraction = Math.max(0, Math.min(1, scrollFraction));
                    const frameIndex = Math.min(totalFrames - 1, Math.floor(scrollFraction * totalFrames));

                    if (images[frameIndex]) {
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        context.drawImage(images[frameIndex], 0, 0, canvas.width, canvas.height);
                    }

                    // Fade in text once scrolling starts
                    const visionText = section.querySelector('.dynamic-vision-text');
                    if (visionText) {
                        // Start fading in early in the scroll, fully visible by 10%
                        const textOpacity = Math.min(1, scrollFraction * 10);
                        visionText.style.opacity = textOpacity.toString();
                    }

                    // Fade in "Smarter Mobility..." text early in the scroll
                    const stickDynamicText = section.querySelector('.stick-dynamic-text');
                    if (stickDynamicText) {
                        const textOpacity = Math.min(1, scrollFraction * 10);
                        stickDynamicText.style.opacity = textOpacity.toString();
                    }
                }
                stickTicking = false;
            });
            stickTicking = true;
        }
    });

    window.addEventListener('resize', () => {
        if (images.length > 0 && images[0]) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(images[0], 0, 0, canvas.width, canvas.height);
        }
    });
}

// --- Modal System Logic ---
const modalData = {
    'user-manual': {
        title: 'User Manual',
        content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>'
    },
    'about-us': {
        title: 'About Us',
        content: '<p>Netra Sathi is dedicated to revolutionizing accessibility. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.</p><p>Pellentesque id interdum arcu. Vestibulum mattis vulputate convallis. Sed accumsan viverra interdum. Quisque volutpat felis nec egestas imperdiet.</p>'
    },
    'mission': {
        title: 'Our Mission',
        content: '<p>Our mission is to empower individuals with visual impairments through cutting-edge technology. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.</p><p>Eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>'
    },
    'contact': {
        title: 'Contact Us',
        content: '<p>We would love to hear from you. Reach out to our team regarding inquiries, support, or partnerships.</p><br><p style="font-size: 1.5rem; color: white; margin-bottom: 0.5rem;"><strong>hello@netrasathi.com</strong></p><p style="font-size: 1.5rem; color: white;"><strong>+91 90624 67387</strong></p>'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('infoModal');
    const modalClose = document.getElementById('modalClose');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalTriggers = document.querySelectorAll('.modal-trigger');

    if (!modalOverlay || !modalClose) return;

    const openModal = (modalId) => {
        const data = modalData[modalId];
        if (data) {
            modalTitle.textContent = data.title;
            modalBody.innerHTML = data.content;
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    };

    const closeModal = () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    modalClose.addEventListener('click', closeModal);

    // Close when clicking outside content
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
});
