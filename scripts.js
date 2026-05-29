/* ─────────────────────────────────────────────────
   Dashboard
───────────────────────────────────────────────── */
(function () {
    if (!document.querySelector('.dashboard')) return;

    /* ── Theme ────────────────────────────────── */
    const html        = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const THEME_KEY   = 'am-theme';

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }

    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
        applyTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.setAttribute('data-theme', 'dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    /* ── Admin mode ───────────────────────────── */
    const isAdmin = new URLSearchParams(window.location.search).has('admin');
    const addBtn  = document.getElementById('add-btn');
    if (isAdmin && addBtn) {
        addBtn.hidden = false;
        addBtn.removeAttribute('aria-hidden');
    }

    /* ── Sidebar user dropdown ────────────────── */
    const userBtn  = document.getElementById('sidebar-user-btn');
    const dropdown = document.getElementById('sidebar-dropdown');

    if (userBtn && dropdown) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !dropdown.hidden;
            dropdown.hidden = isOpen;
            userBtn.setAttribute('aria-expanded', String(!isOpen));
        });

        document.addEventListener('click', () => {
            if (!dropdown.hidden) {
                dropdown.hidden = true;
                userBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ── Collect rows & compute badges ───────── */
    const rows = Array.from(document.querySelectorAll('.project-row'));

    function countByTag(tag) {
        return rows.filter(r => (r.dataset.tags || '').split(',').includes(tag)).length;
    }

    function setBadge(id, n) {
        const el = document.getElementById(id);
        if (el) el.textContent = n;
    }

    setBadge('badge-all',           rows.length);
    setBadge('badge-inprogress',    rows.filter(r => r.dataset.status === 'in-progress').length);
    setBadge('badge-webdesign',     countByTag('web-design'));
    setBadge('badge-mediastrategy', countByTag('media-strategy'));

    /* ── Filter state ─────────────────────────── */
    let activeStatus = 'all';
    let activeTag    = null;
    let searchQuery  = '';

    function collapseRow(row) {
        row.classList.remove('expanded');
        const trigger = row.querySelector('.project-row__trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        const v = row.querySelector('.project-row__panel video');
        if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
        const panel = row.querySelector('.project-row__panel');
        if (panel) panel.setAttribute('aria-hidden', 'true');
    }

    const BREADCRUMB_ICONS = {
        all: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
        inprogress: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>`,
        webdesign: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
        mediastrategy: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`
    };

    function updateResults() {
        let visible = 0;
        rows.forEach(row => {
            const title       = (row.querySelector('.project-row__title')?.textContent || '').toLowerCase();
            const status      = row.dataset.status || '';
            const tags        = (row.dataset.tags || '').split(',');
            const matchSearch = title.includes(searchQuery);
            const matchStatus = activeStatus === 'all' || status === activeStatus;
            const matchTag    = !activeTag || tags.includes(activeTag);
            const show        = matchSearch && matchStatus && matchTag;

            if (!show) collapseRow(row);
            row.hidden = !show;
            if (show) visible++;
        });

        const countEl = document.getElementById('results-count');
        if (countEl) countEl.textContent = visible + ' result' + (visible !== 1 ? 's' : '');

        const titleEl   = document.getElementById('content-title');
        const iconEl    = document.getElementById('breadcrumb-icon');
        let title = 'All Projects';
        let iconKey = 'all';

        if (activeTag === 'web-design')          { title = 'Web Design';     iconKey = 'webdesign'; }
        else if (activeTag === 'media-strategy') { title = 'Media Strategy'; iconKey = 'mediastrategy'; }
        else if (activeStatus === 'in-progress') { title = 'In Progress';    iconKey = 'inprogress'; }

        if (titleEl) titleEl.textContent = title;
        if (iconEl)  iconEl.innerHTML    = BREADCRUMB_ICONS[iconKey];
    }

    updateResults();

    /* ── Sidebar nav (status filter) ─────────── */
    const navItems = document.querySelectorAll('.sidebar__nav-item');
    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            activeStatus = btn.dataset.filterStatus || 'all';
            activeTag    = null;
            navItems.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.sidebar__filter-item').forEach(b => b.classList.remove('active'));
            updateResults();
        });
    });

    /* ── Sidebar tag filters ──────────────────── */
    const filterItems = document.querySelectorAll('.sidebar__filter-item');
    filterItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const tag = btn.dataset.filterTag;
            if (activeTag === tag) {
                activeTag = null;
                btn.classList.remove('active');
            } else {
                activeTag = tag;
                filterItems.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
            navItems.forEach(b => b.classList.toggle('active', b.dataset.filterStatus === 'all'));
            activeStatus = 'all';
            updateResults();
        });
    });

    /* ── Search ───────────────────────────────── */
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchQuery = searchInput.value.trim().toLowerCase();
            updateResults();
        });
    }

    /* ── Inline accordion ─────────────────────── */
    rows.forEach(row => {
        const trigger = row.querySelector('.project-row__trigger');
        const panel   = row.querySelector('.project-row__panel');
        if (!trigger) return;

        function toggle() {
            const isExpanded = row.classList.contains('expanded');

            // Collapse all other open rows
            rows.forEach(r => { if (r !== row) collapseRow(r); });

            if (isExpanded) {
                collapseRow(row);
            } else {
                row.classList.add('expanded');
                trigger.setAttribute('aria-expanded', 'true');
                if (panel) panel.setAttribute('aria-hidden', 'false');

                // Lazy-load the panel video from the row's data-video
                const v = panel && panel.querySelector('video');
                if (v && row.dataset.video) {
                    v.src = row.dataset.video;
                    v.load();
                    v.play().catch(() => {});
                }

                // Scroll the row into view smoothly
                setTimeout(() => row.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
            }
        }

        trigger.addEventListener('click', toggle);
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
    });

    /* ── Collapse buttons inside panels ──────── */
    document.querySelectorAll('.prp-close').forEach(btn => {
        const row = btn.closest('.project-row');
        if (row) btn.addEventListener('click', (e) => { e.stopPropagation(); collapseRow(row); });
    });

    /* ── Thumbnail hover: play video ─────────── */
    if (window.matchMedia('(hover: hover)').matches) {
        rows.forEach(row => {
            const trigger = row.querySelector('.project-row__trigger');
            const thumb   = row.querySelector('.project-row__thumb video');
            if (!trigger || !thumb) return;
            trigger.addEventListener('mouseenter', () => thumb.play().catch(() => {}));
            trigger.addEventListener('mouseleave', () => { thumb.pause(); thumb.currentTime = 0; });
        });
    }

    /* ── Ask modal ────────────────────────────── */
    const askBtn       = document.getElementById('ask-btn');
    const modal        = document.getElementById('ask-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose   = document.getElementById('modal-close');

    function openModal() {
        if (!modal) return;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        modalOverlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
        setTimeout(() => modalClose && modalClose.focus(), 50);
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        modalOverlay.classList.remove('visible');
        document.body.style.overflow = '';
    }

    if (askBtn)       askBtn.addEventListener('click', openModal);
    if (modalClose)   modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    /* ── Global keyboard handlers ─────────────── */
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (modal && modal.classList.contains('open')) { closeModal(); return; }
        rows.forEach(r => { if (r.classList.contains('expanded')) collapseRow(r); });
    });
})();

/* ─────────────────────────────────────────────────
   Project pages: lightbox + hover triggers
───────────────────────────────────────────────── */
(function () {
    const lightbox        = document.getElementById('lightbox');
    const lightboxImage   = document.querySelector('.lightbox-image');
    const lightboxClose   = document.querySelector('.lightbox-close');
    const lightboxOverlay = document.querySelector('.lightbox-overlay');

    if (!lightbox) return;

    function openLightbox(src) {
        lightboxImage.src = src;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }

    lightboxClose   && lightboxClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
    lightboxOverlay && lightboxOverlay.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.style.display === 'flex') closeLightbox();
    });

    const projectVideo    = document.querySelector('.project-video');
    const projectImage    = document.querySelector('.project-image');
    const projectImageCon = document.querySelector('.project-image-container');
    const hoverTriggers   = document.querySelectorAll('.hover-trigger');
    const hasHover        = window.matchMedia('(hover: hover)').matches;

    if (!projectVideo || !projectImage || hoverTriggers.length === 0) return;

    let locked = false;

    function showImage(src) { projectImage.src = src; projectImageCon.style.display = 'flex'; projectVideo.style.display = 'none'; }
    function hideImage()    { if (!locked) { projectImageCon.style.display = 'none'; projectVideo.style.display = 'block'; } }
    function lockImage(src) { locked = true; showImage(src); }
    function unlockImage()  { locked = false; projectImageCon.style.display = 'none'; projectVideo.style.display = 'block'; }

    let tooltip, tooltipArrow;
    if (hasHover) {
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip-element';
        tooltip.textContent = 'Click to stamp image';
        document.body.appendChild(tooltip);

        tooltipArrow = document.createElement('div');
        tooltipArrow.className = 'tooltip-arrow';
        document.body.appendChild(tooltipArrow);
    }

    hoverTriggers.forEach(trigger => {
        const src = trigger.getAttribute('data-image');
        if (!src) return;

        function updateTooltip() {
            if (!tooltip) return;
            const rect  = trigger.getBoundingClientRect();
            const above = rect.top > 60;
            tooltip.style.left      = (rect.left + rect.width / 2) + 'px';
            tooltip.style.top       = above ? (rect.top - 48) + 'px' : (rect.bottom + 8) + 'px';
            tooltipArrow.style.left = tooltip.style.left;
            tooltipArrow.style.top  = above ? (rect.top - 13) + 'px' : (rect.bottom + 2) + 'px';
            tooltipArrow.classList.toggle('below', !above);
        }

        if (hasHover) {
            trigger.addEventListener('mouseenter', () => { tooltip.classList.add('visible'); tooltipArrow.classList.add('visible'); if (!locked) showImage(src); updateTooltip(); });
            trigger.addEventListener('mouseleave', () => { tooltip.classList.remove('visible'); tooltipArrow.classList.remove('visible'); hideImage(); });
            window.addEventListener('scroll', () => { if (trigger.matches(':hover')) updateTooltip(); }, { passive: true });
        }

        trigger.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            if (hasHover) lockImage(src);
            else window.open(new URL(src, location.href).href, '_blank');
        });
    });

    if (projectImage) {
        projectImage.style.cursor = 'pointer';
        projectImage.addEventListener('click', (e) => {
            e.stopPropagation();
            if (projectImageCon.style.display !== 'none') openLightbox(projectImage.src);
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.hover-trigger') && !e.target.closest('.lightbox') && locked) unlockImage();
    });
})();

/* ─────────────────────────────────────────────────
   Project pages: phase toggles
───────────────────────────────────────────────── */
(function () {
    const toggles = document.querySelectorAll('.phase-toggle');
    if (!toggles.length) return;

    toggles.forEach(toggle => {
        const content = toggle.nextElementSibling;
        if (!content || !content.classList.contains('phase-content')) return;

        content.style.maxHeight = '0';
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('tabindex', '0');
        toggle.setAttribute('aria-expanded', 'false');

        function handleToggle() {
            const expanded = content.classList.contains('expanded');
            if (expanded) {
                content.classList.remove('expanded');
                content.style.maxHeight = '0';
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            } else {
                content.classList.add('expanded');
                content.style.maxHeight = content.scrollHeight + 'px';
                toggle.classList.add('active');
                toggle.setAttribute('aria-expanded', 'true');
            }
        }

        toggle.addEventListener('click', handleToggle);
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle(); }
        });
    });
})();
