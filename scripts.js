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
            trigger.addEventListener('mouseleave', () => { thumb.pause(); thumb.currentTime = 0.3; });
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

    /* ── Brief Drawer ─────────────────────────── */
    const briefDrawer  = document.getElementById('brief-drawer');
    const briefOverlay = document.getElementById('brief-overlay');
    const briefClose   = document.getElementById('brief-drawer-close');
    const briefBody    = document.getElementById('brief-drawer-body');
    let lastBriefTrigger = null;

    function loadMarked() {
        if (window.marked) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
            s.onload  = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    function parseFrontmatter(text) {
        const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (!match) return { meta: {}, body: text };
        const meta = {};
        match[1].split('\n').forEach(line => {
            const colon = line.indexOf(':');
            if (colon === -1) return;
            const key = line.slice(0, colon).trim();
            const val = line.slice(colon + 1).trim().replace(/^['"]|['"]$/g, '');
            if (key) meta[key] = val;
        });
        return { meta, body: match[2] };
    }

    function buildDrawerHTML(meta, renderedBody) {
        const thumbHTML = meta.video
            ? `<div class="brief-drawer__thumb"><video src="${meta.video}" autoplay loop muted playsinline></video></div>`
            : meta.image
                ? `<div class="brief-drawer__thumb"><img src="${meta.image}" alt=""></div>`
                : '';

        const tagType = meta.type ? `<span class="prp-tag">${meta.type}</span>` : '';
        const tagRole = meta.role ? `<span class="prp-tag">${meta.role}</span>` : '';

        const metaRows = [
            meta.dates       && `<p><strong>Dates:</strong> ${meta.dates}</p>`,
            meta.updated       && `<p><strong>Updated:</strong> ${meta.updated}</p>`,
            meta.supervisor  && `<p><strong>Supervisor:</strong> ${meta.supervisor}</p>`,
            meta.stack       && `<p><strong>Tech Stack:</strong> ${meta.stack}</p>`,
            meta.tools       && `<p><strong>Design Tools:</strong> ${meta.tools}</p>`,
        ].filter(Boolean).join('');

        const linkHTML = meta.link
            ? `<a class="brief-drawer__meta-link" href="${meta.link}" target="_blank" rel="noopener">${meta.linkLabel || 'Visit the website'} <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>`
            : '';

        return `<div class="brief-drawer__content-wrap">
                <div class="brief-drawer__hero">
                    <div class="brief-drawer__hero-left">
                        <div class="brief-drawer__tags">${tagType}${tagRole}</div>
                        <h1 class="brief-drawer__title">${meta.title || ''}</h1>
                        <div class="brief-drawer__meta">${metaRows}${linkHTML}</div>
                    </div>
                    ${thumbHTML}
                </div>
                <div class="brief-drawer__prose">${renderedBody}</div>
            </div>`;
    }

    function initBriefAccordions(container) {
        const prose = container.querySelector('.brief-drawer__prose');
        if (!prose) return;

        // Collect all rendered elements and group them under their h2
        const nodes = Array.from(prose.children);
        const groups = [];
        let current = null;

        nodes.forEach(node => {
            if (node.tagName === 'H2') {
                current = { title: node.textContent.trim(), innerHTML: node.innerHTML, nodes: [] };
                groups.push(current);
            } else if (current) {
                current.nodes.push(node);
            }
        });

        // Rebuild prose as accordion sections
        prose.innerHTML = '';

        groups.forEach(({ title, innerHTML, nodes: bodyNodes }) => {
            const isOverview = title === 'Overview';
            const section = document.createElement('div');
            section.className = 'brief-section';

            if (isOverview) {
                const heading = document.createElement('div');
                heading.className = 'brief-section__heading';
                heading.textContent = title;
                section.appendChild(heading);
            } else {
                const toggle = document.createElement('button');
                toggle.className = 'brief-section__toggle';
                toggle.setAttribute('aria-expanded', 'false');
                toggle.innerHTML = `<span>${innerHTML}</span><svg class="brief-section__chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
                section.appendChild(toggle);
            }

            const body = document.createElement('div');
            body.className = isOverview
                ? 'brief-section__body brief-section__body--always-open'
                : 'brief-section__body';
            if (!isOverview) body.style.maxHeight = '0';
            bodyNodes.forEach(n => body.appendChild(n));
            section.appendChild(body);

            prose.appendChild(section);
        });

        // Toggle behavior
        prose.querySelectorAll('.brief-section__toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const body = toggle.nextElementSibling;
                const expanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', String(!expanded));
                toggle.classList.toggle('active', !expanded);
                body.style.maxHeight = expanded ? '0' : body.scrollHeight + 'px';
            });
        });

        // Inline images — float alternating left/right, click to expand
        let imgIndex = 0;
        prose.querySelectorAll('.brief-section__body img').forEach(img => {
            const parent = img.parentElement;
            if (!parent) return;

            // Wrap the containing <p> if it only holds this image
            const wrap = (parent.tagName === 'P' && parent.childElementCount === 1)
                ? parent
                : (() => {
                    const w = document.createElement('div');
                    img.replaceWith(w);
                    w.appendChild(img);
                    return w;
                })();

            const floatDir = imgIndex % 2 === 0 ? 'brief-img-wrap--float-right' : 'brief-img-wrap--float-left';
            wrap.classList.add('brief-img-wrap', floatDir);
            imgIndex++;

            wrap.addEventListener('click', () => {
                const isExpanded = wrap.classList.contains('brief-img-wrap--expanded');
                wrap.classList.toggle('brief-img-wrap--expanded', !isExpanded);

                // If inside an open accordion, recalculate its max-height
                const sectionBody = wrap.closest('.brief-section__body');
                if (sectionBody && sectionBody.style.maxHeight !== 'none') {
                    sectionBody.style.maxHeight = sectionBody.scrollHeight + 'px';
                }
            });
        });
    }

    async function openBrief(id, triggerEl) {
        if (triggerEl) lastBriefTrigger = triggerEl;
        briefBody.innerHTML = '<p class="brief-drawer__loading">Loading…</p>';
        briefDrawer.classList.add('open');
        briefDrawer.setAttribute('aria-hidden', 'false');
        briefOverlay.classList.add('visible');
        briefBody.scrollTop = 0;
        history.pushState({ project: id }, '', `?project=${id}`);

        try {
            await loadMarked();
            const res = await fetch(`/data/projects/${id}.md`);
            if (!res.ok) throw new Error('Not found');
            const text = await res.text();
            const { meta, body } = parseFrontmatter(text);
            briefBody.innerHTML = buildDrawerHTML(meta, window.marked.parse(body));
            initBriefAccordions(briefBody);
            briefClose && briefClose.focus();
        } catch (_) {
            briefBody.innerHTML = '<p class="brief-drawer__error">Brief could not be loaded.</p>';
        }
    }

    function closeBrief() {
        if (!briefDrawer || !briefDrawer.classList.contains('open')) return;
        const v = briefBody && briefBody.querySelector('video');
        if (v) { v.pause(); v.src = ''; }
        briefDrawer.classList.remove('open');
        briefDrawer.setAttribute('aria-hidden', 'true');
        briefOverlay.classList.remove('visible');
        history.pushState({}, '', location.pathname);
        if (lastBriefTrigger) { lastBriefTrigger.focus(); lastBriefTrigger = null; }
    }

    if (briefClose)   briefClose.addEventListener('click', closeBrief);
    if (briefOverlay) briefOverlay.addEventListener('click', closeBrief);

    document.querySelectorAll('.prp-link[data-project]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openBrief(link.dataset.project, link);
        });
    });

    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.project) openBrief(e.state.project);
        else closeBrief();
    });

    const initialProject = new URLSearchParams(location.search).get('project');
    if (initialProject) openBrief(initialProject);

    /* ── Global keyboard handlers ─────────────── */
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (briefDrawer && briefDrawer.classList.contains('open')) { closeBrief(); return; }
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
