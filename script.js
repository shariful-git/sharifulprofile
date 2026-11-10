(() => {
    'use strict';

    // =============================================
    // CUSTOM CURSOR — Desktop mouse only
    // =============================================
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');

    function initCursor() {
        if (!cursor || !follower) return;
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        let followerX = 0;
        let followerY = 0;

        document.body.classList.add('has-cursor');

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const hoverEls = document.querySelectorAll('a, button, [data-hover]');
        hoverEls.forEach((el) => {
            el.addEventListener('mouseenter', () => follower.classList.add('hovering'));
            el.addEventListener('mouseleave', () => follower.classList.remove('hovering'));
        });

        function animate() {
            cursorX += (mouseX - cursorX) * 0.25;
            cursorY += (mouseY - cursorY) * 0.25;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';

            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';

            requestAnimationFrame(animate);
        }

        animate();
    }

    initCursor();

    // =============================================
    // INTERSECTION OBSERVER — Scroll reveals
    // =============================================
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
        );
        revealEls.forEach((el) => revealObserver.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('visible'));
    }

    // =============================================
    // HERO ANIMATIONS — Staggered entry on load
    // =============================================
    let heroAnimated = false;
    function animateHero() {
        if (heroAnimated) return;
        heroAnimated = true;
        const heroEls = document.querySelectorAll('.anim-hero');
        heroEls.forEach((el) => {
            const delay = parseInt(el.dataset.delay || '0', 10) * 120;
            setTimeout(() => el.classList.add('in'), 200 + delay);
        });
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(animateHero);
    } else {
        window.addEventListener('load', animateHero);
    }
    // Safety fallback if web fonts are slow or blocked
    setTimeout(animateHero, 450);

    // =============================================
    // COUNTER ANIMATION — Stats
    // =============================================
    function animateCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        if (!('IntersectionObserver' in window)) {
            counters.forEach((c) => {
                c.textContent = c.dataset.count;
            });
            return;
        }

        const counterObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const target = parseInt(el.dataset.count, 10);
                        let current = 0;
                        const step = Math.max(target / 30, 1);
                        const interval = setInterval(() => {
                            current += step;
                            if (current >= target) {
                                current = target;
                                clearInterval(interval);
                            }
                            el.textContent = Math.floor(current);
                        }, 40);
                        counterObserver.unobserve(el);
                    }
                });
            },
            { threshold: 0.5 }
        );

        counters.forEach((c) => counterObserver.observe(c));
    }

    animateCounters();

    // =============================================
    // NAV — Scroll behavior, active state & liquid pill
    // =============================================
    const navbar = document.getElementById('navbar');
    const navLinksContainer = document.getElementById('navLinks');
    const navLiquidPill = document.getElementById('navLiquidPill');
    const navPillLinks = navLinksContainer ? navLinksContainer.querySelectorAll('a[data-nav]') : [];
    const navDataLinks = document.querySelectorAll('[data-nav]');
    const sections = Array.from(document.querySelectorAll('section[id]'));
    let isHoveringNav = false;
    let pillMoveTimer = null;
    let pillSettleTimer = null;
    let lastPillLeft = null;

    function moveLiquidPill(targetLink) {
        if (!navLiquidPill || !navLinksContainer || !targetLink) {
            if (navLiquidPill) navLiquidPill.style.opacity = '0';
            return;
        }

        const li = targetLink.parentElement;
        if (!li || li.offsetWidth === 0 || targetLink.offsetWidth === 0) {
            navLiquidPill.style.opacity = '0';
            return;
        }

        const left = li.offsetLeft + targetLink.offsetLeft;
        const width = targetLink.offsetWidth;
        const moved = lastPillLeft !== null && Math.abs(lastPillLeft - left) > 2;
        lastPillLeft = left;

        clearTimeout(pillMoveTimer);
        clearTimeout(pillSettleTimer);

        if (moved) {
            navLiquidPill.classList.add('is-moving');
            pillMoveTimer = setTimeout(() => {
                navLiquidPill.classList.remove('is-moving');
            }, 220);
        }

        navLiquidPill.style.width = width + 'px';
        navLiquidPill.style.transform = moved
            ? `translateX(${left}px) scaleX(1.06) scaleY(0.93)`
            : `translateX(${left}px) scaleX(1) scaleY(1)`;
        navLiquidPill.style.opacity = '1';

        if (moved) {
            pillSettleTimer = setTimeout(() => {
                navLiquidPill.style.transform = `translateX(${left}px) scaleX(1) scaleY(1)`;
            }, 90);
        }
    }

    function syncActiveLiquidPill() {
        if (isHoveringNav || !navLinksContainer) return;
        const activeLink = navLinksContainer.querySelector('a.active');
        if (activeLink) {
            moveLiquidPill(activeLink);
        } else if (navLiquidPill) {
            navLiquidPill.style.opacity = '0';
        }
    }

    function getActiveSectionId() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;

        if (scrollY + winHeight >= docHeight - 10 && sections.length > 0) {
            return sections[sections.length - 1].id;
        }

        const triggerPoint = scrollY + Math.min(200, winHeight * 0.28);
        let currentId = '';

        for (let i = 0; i < sections.length; i++) {
            const sec = sections[i];
            const top = sec.getBoundingClientRect().top + scrollY;
            if (triggerPoint >= top) {
                currentId = sec.id;
            }
        }

        return currentId;
    }

    function handleNavScroll() {
        if (!navbar) return;
        const scrollY = window.scrollY;
        navbar.classList.toggle('scrolled', scrollY > 30);

        const currentId = getActiveSectionId();
        navDataLinks.forEach((link) => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === '#' + currentId);
        });

        syncActiveLiquidPill();
    }

    if (navLinksContainer) {
        navPillLinks.forEach((link) => {
            link.addEventListener('pointerenter', (e) => {
                if (e.pointerType === 'mouse') {
                    isHoveringNav = true;
                    moveLiquidPill(link);
                }
            });
            link.addEventListener('click', () => {
                isHoveringNav = false;
                moveLiquidPill(link);
            });
        });

        navLinksContainer.addEventListener('pointerleave', () => {
            isHoveringNav = false;
            syncActiveLiquidPill();
        });

        window.addEventListener('resize', syncActiveLiquidPill);

        if (typeof ResizeObserver !== 'undefined') {
            const navResizeObserver = new ResizeObserver(syncActiveLiquidPill);
            navResizeObserver.observe(navLinksContainer);
        }

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(syncActiveLiquidPill);
        }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // =============================================
    // MOBILE MENU
    // =============================================
    const hamburger = document.getElementById('hamburger');
    const mobNav = document.getElementById('mobNav');
    const mobLinks = mobNav ? mobNav.querySelectorAll('a') : [];

    function toggleMob() {
        if (!hamburger || !mobNav) return;
        const isOpen = hamburger.classList.toggle('open');
        mobNav.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        mobNav.setAttribute('aria-hidden', String(!isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMob() {
        if (!hamburger || !mobNav) return;
        hamburger.classList.remove('open');
        mobNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', toggleMob);
    }
    mobLinks.forEach((link) => link.addEventListener('click', closeMob));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMob();
    });

    // =============================================
    // SMOOTH SCROLL — Anchor links
    // =============================================
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - 68;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
})();

