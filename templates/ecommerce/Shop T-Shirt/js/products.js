'use strict';

(() => {
    const MAX_TEES = 40;
    const IMAGE_MANIFEST_URL = 'assets/images/image-manifest.json';

    const DEFAULT_TEASERS = [
        { title: 'Studio Heavy Tee', category: 'heavyweight', quality: '320 GSM Combed Cotton', price: 39, oldPrice: 49, badge: 'SLOT #01' },
        { title: 'Boxy Rack Tee', category: 'boxy', quality: '300 GSM Boxy Jersey', price: 42, oldPrice: 54, badge: 'SLOT #02' },
        { title: 'Archive Rail Tee', category: 'graphic', quality: '290 GSM Ring-Spun Cotton', price: 45, oldPrice: 59, badge: 'SLOT #03' },
        { title: 'Minimalist Knit Tee', category: 'heavyweight', quality: '340 GSM Organic Cotton', price: 44, oldPrice: 55, badge: 'SLOT #04' },
        { title: 'Dropped Shoulder Tee', category: 'boxy', quality: '310 GSM Heavy Jersey', price: 41, oldPrice: 50, badge: 'SLOT #05' }
    ];

    function padIndex(num) {
        return String(num).padStart(2, '0');
    }

    function createInitialTees(count = MAX_TEES) {
        const list = [];
        const safeCount = Math.min(Math.max(1, Number(count) || MAX_TEES), MAX_TEES);

        for (let i = 1; i <= safeCount; i++) {
            const preset = DEFAULT_TEASERS[(i - 1) % DEFAULT_TEASERS.length];
            const idxLabel = padIndex(i);
            list.push({
                id: `tee-${idxLabel}`,
                index: i,
                indexLabel: idxLabel,
                name: `${preset.title} #${idxLabel}`,
                category: preset.category,
                categoryName: preset.category.toUpperCase(),
                price: preset.price + ((i - 1) % 5) * 2,
                oldPrice: preset.oldPrice + ((i - 1) % 5) * 2,
                currency: '$',
                quality: preset.quality,
                description: `${preset.quality} • Indexed slot #${idxLabel} in Shop T-Shirt collection. Ready to customize from the Edit page.`,
                rating: 4.8,
                reviews: 20 + i * 3,
                badge: i <= 3 ? `TOP #${idxLabel}` : `SLOT #${idxLabel}`,
                imageId: `tee-image-${idxLabel}`,
                image: '',
                localImage: '',
                webImage: '',
                remoteImage: '',
                resolvedImage: '',
                colors: ['Black', 'Bone', 'Slate'],
                sizes: ['S', 'M', 'L', 'XL'],
                stock: 25,
                featured: i <= 8,
                newest: i <= 6
            });
        }
        return list;
    }

    let tees = createInitialTees(MAX_TEES);
    let selectedTeeId = tees[0].id;
    let imageManifest = { version: 1, products: {} };

    const FALLBACK_IMAGE =
        'data:image/svg+xml;charset=UTF-8,' +
        encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="600" height="720" viewBox="0 0 600 720">
                <rect width="600" height="720" fill="#121218"/>
                <path d="M180 180 L250 130 L350 130 L420 180 L500 240 L455 315 L405 280 L405 560 L195 560 L195 280 L145 315 L100 240 Z" fill="#1e2433" stroke="#38bdf8" stroke-width="4"/>
                <text x="300" y="635" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#38bdf8">SHOP T-SHIRT</text>
            </svg>
        `);

    function escapeHtml(val) {
        return String(val ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function normalizeText(val) {
        return String(val ?? '').trim().toLowerCase();
    }

    function buildImageUrl(raw) {
        if (typeof raw !== 'string') return '';
        const s = raw.trim();
        if (!s) return '';
        if (/^https?:\/\//i.test(s) || s.startsWith('data:image/') || s.startsWith('/')) return s;
        if (s.startsWith('assets/')) return s;
        return `assets/images/${s}`;
    }

    function getTeeImage(tee) {
        if (!tee) return FALLBACK_IMAGE;
        const manifestImg = tee.imageId ? imageManifest?.products?.[tee.imageId] : '';
        const candidates = [
            tee.resolvedImage,
            tee.localImage,
            manifestImg,
            tee.image,
            tee.webImage,
            tee.remoteImage,
            FALLBACK_IMAGE
        ];
        for (const c of candidates) {
            const url = buildImageUrl(c);
            if (url) return url;
        }
        return FALLBACK_IMAGE;
    }

    function formatTeePrice(price, currency = '$') {
        const n = Number(price);
        const safe = Number.isFinite(n) ? n : 0;
        return `${escapeHtml(currency)}${safe}`;
    }

    function getTeeById(id) {
        const key = String(id ?? '').trim();
        return tees.find(t => t.id === key || `tee-${padIndex(key)}` === t.id) || null;
    }

    function getTeeByIndex(idx) {
        const num = Number(idx);
        return tees.find(t => t.index === num) || null;
    }

    function updateDetailAndSpotlight(tee) {
        if (!tee) return;
        selectedTeeId = tee.id;

        const imgUrl = getTeeImage(tee);
        const idxStr = `INDEX #${tee.indexLabel}`;

        const activeImg = document.getElementById('activeTeeImage');
        const activeBadge = document.getElementById('activeTeeIndexBadge');
        const activeTitle = document.getElementById('activeTeeTitle');
        const activePrice = document.getElementById('activeTeePrice');
        const activeQuality = document.getElementById('activeTeeQuality');

        if (activeImg) {
            activeImg.src = imgUrl;
            activeImg.alt = tee.name;
        }
        if (activeBadge) activeBadge.textContent = idxStr;
        if (activeTitle) activeTitle.textContent = tee.name;
        if (activePrice) activePrice.textContent = formatTeePrice(tee.price, tee.currency);
        if (activeQuality) activeQuality.textContent = tee.quality;

        const detailIdx = document.getElementById('detailIndexLabel');
        const detailTitle = document.getElementById('detailTitle');
        const detailPrice = document.getElementById('detailPrice');
        const detailDesc = document.getElementById('detailDescription');
        const detailQuality = document.getElementById('detailQuality');
        const detailColors = document.getElementById('detailColors');
        const detailSizes = document.getElementById('detailSizes');
        const rackPos = document.getElementById('rackPositionLabel');

        if (detailIdx) detailIdx.textContent = idxStr;
        if (detailTitle) detailTitle.textContent = tee.name;
        if (detailPrice) detailPrice.textContent = formatTeePrice(tee.price, tee.currency);
        if (detailDesc) detailDesc.textContent = tee.description;
        if (detailQuality) detailQuality.textContent = tee.quality;
        if (detailColors) detailColors.textContent = (tee.colors || []).join(', ');
        if (detailSizes) detailSizes.textContent = (tee.sizes || []).join(', ');
        if (rackPos) rackPos.textContent = `${tee.indexLabel} / ${padIndex(tees.length)}`;

        document.querySelectorAll('.hanger-item, .product-card').forEach(el => {
            el.classList.toggle('active-tee', el.dataset.productId === tee.id);
        });

        window.__selectedShopTshirt = tee;
    }

    function renderHangingRack() {
        const track = document.getElementById('hangingRackTrack');
        if (!track) return;

        track.innerHTML = tees.map(tee => `
            <button
                type="button"
                class="hanger-item ${tee.id === selectedTeeId ? 'active-tee' : ''}"
                data-product-id="${escapeHtml(tee.id)}"
                data-select-tee="${escapeHtml(tee.id)}"
            >
                <span class="hanger-hook" aria-hidden="true"></span>
                <span class="hanger-index">#${escapeHtml(tee.indexLabel)}</span>
                <div class="hanger-img-box">
                    <img src="${escapeHtml(getTeeImage(tee))}" alt="${escapeHtml(tee.name)}" loading="lazy">
                </div>
                <strong class="hanger-title">${escapeHtml(tee.name)}</strong>
                <span class="hanger-meta">${escapeHtml(tee.quality)}</span>
                <span class="hanger-price">${formatTeePrice(tee.price, tee.currency)}</span>
            </button>
        `).join('');
    }

    function createProductCard(tee) {
        if (!tee) return '';
        const pid = escapeHtml(tee.id);
        const imgUrl = escapeHtml(getTeeImage(tee));

        return `
            <article
                class="product-card ${tee.id === selectedTeeId ? 'active-tee' : ''}"
                data-product-id="${pid}"
                data-cart-animation-id="${pid}"
                data-tee-index="${tee.index}"
                data-category="${escapeHtml(tee.category)}"
                data-editable="product_${pid}"
                data-editable-type="product"
            >
                <div class="product-image-wrapper">
                    <span class="product-badge" data-product-id="${pid}" data-product-field="badge">
                        #${escapeHtml(tee.indexLabel)}
                    </span>
                    <img
                        class="product-image"
                        src="${imgUrl}"
                        alt="${escapeHtml(tee.name)}"
                        loading="lazy"
                        data-product-id="${pid}"
                        data-product-field="image"
                        data-editable="product_${pid}_image"
                        data-editable-type="image"
                    >
                    <div class="product-overlay">
                        <button type="button" class="quick-view-button" data-select-tee="${pid}">
                            Details
                        </button>
                        <button type="button" class="add-cart-button" data-cart-id="${pid}" data-product-id="${pid}">
                            Add to Cart
                        </button>
                    </div>
                </div>

                <div class="product-info">
                    <div class="product-category" data-product-id="${pid}" data-product-field="quality">
                        ${escapeHtml(tee.quality)}
                    </div>
                    <h3 class="product-name" data-product-id="${pid}" data-product-field="name">
                        ${escapeHtml(tee.name)}
                    </h3>
                    <div class="product-bottom">
                        <span class="product-price" data-product-id="${pid}" data-product-field="price">
                            ${formatTeePrice(tee.price, tee.currency)}
                        </span>
                    </div>
                </div>
            </article>
        `;
    }

    function renderProducts(container, list = tees) {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        const emptyEl = document.getElementById('productsEmpty');
        const countEl = document.querySelector('[data-products-count]');

        if (countEl) countEl.textContent = String(list.length);
        if (!el) return;

        if (!list.length) {
            el.innerHTML = '';
            if (emptyEl) emptyEl.hidden = false;
            return;
        }

        if (emptyEl) emptyEl.hidden = true;
        el.innerHTML = list.map(createProductCard).join('');
    }

    function updateTee(id, changes = {}) {
        const tee = getTeeById(id);
        if (!tee || !changes || typeof changes !== 'object') return null;

        Object.assign(tee, changes);
        renderHangingRack();
        if (window.ShopTshirtFilters && typeof window.ShopTshirtFilters.refresh === 'function') {
            window.ShopTshirtFilters.refresh();
        } else {
            renderProducts('#products-grid', tees);
        }
        if (selectedTeeId === tee.id) {
            updateDetailAndSpotlight(tee);
        }
        return tee;
    }

    function updateTeeField(id, field, value) {
        const tee = getTeeById(id);
        if (!tee || !field) return null;

        if (field === 'price' || field === 'oldPrice' || field === 'index') {
            const num = Number(value);
            if (Number.isFinite(num)) value = num;
        }
        if ((field === 'colors' || field === 'sizes') && typeof value === 'string') {
            value = value.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (field === 'image') {
            tee.resolvedImage = value;
            tee.image = value;
        } else {
            tee[field] = value;
        }

        renderHangingRack();
        if (window.ShopTshirtFilters && typeof window.ShopTshirtFilters.refresh === 'function') {
            window.ShopTshirtFilters.refresh();
        } else {
            renderProducts('#products-grid', tees);
        }
        if (selectedTeeId === tee.id) {
            updateDetailAndSpotlight(tee);
        }
        return tee;
    }

    // Scroll-driven rack movement ("كل ما هبت ماوس تشرتات كيجيو فديك سكة لمعلقين فيها")
    function bindScrollRackMotion() {
        const track = document.getElementById('hangingRackTrack');
        if (!track) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
                const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
                const maxShift = Math.max(0, track.scrollWidth - track.clientWidth);
                track.scrollLeft = progress * maxShift;

                const activeIdx = Math.min(
                    tees.length,
                    Math.max(1, Math.round(progress * (tees.length - 1)) + 1)
                );
                const teeByScroll = getTeeByIndex(activeIdx);
                if (teeByScroll && !window.__manualTeeLock) {
                    updateDetailAndSpotlight(teeByScroll);
                }
                ticking = false;
            });
        }, { passive: true });
    }

    // External Edit page bridge
    window.addEventListener('message', event => {
        const msg = event.data;
        if (!msg || typeof msg !== 'object') return;

        if (msg.type === 'SET_PRODUCT') {
            updateTee(msg.productId || msg.id, msg.product || msg.data || msg.changes || {});
        } else if (msg.type === 'SET_PRODUCT_FIELD') {
            updateTeeField(msg.productId || msg.id, msg.field, msg.value);
        } else if (msg.type === 'SELECT_TEE_INDEX') {
            const target = getTeeByIndex(msg.index);
            if (target) updateDetailAndSpotlight(target);
        }
    });

    document.addEventListener('click', event => {
        const trigger = event.target.closest('[data-select-tee], .product-card');
        if (trigger && !event.target.closest('.add-cart-button')) {
            const id = trigger.dataset.selectTee || trigger.dataset.productId;
            const found = getTeeById(id);
            if (found) {
                window.__manualTeeLock = true;
                updateDetailAndSpotlight(found);
            }
        }

        const idxTrigger = event.target.closest('[data-select-index]');
        if (idxTrigger) {
            const found = getTeeByIndex(idxTrigger.dataset.selectIndex);
            if (found) {
                window.__manualTeeLock = true;
                updateDetailAndSpotlight(found);
            }
        }

        if (event.target.closest('#rackPrevBtn')) {
            const current = getTeeById(selectedTeeId) || tees[0];
            const prevIdx = current.index > 1 ? current.index - 1 : tees.length;
            window.__manualTeeLock = true;
            updateDetailAndSpotlight(getTeeByIndex(prevIdx));
        }

        if (event.target.closest('#rackNextBtn')) {
            const current = getTeeById(selectedTeeId) || tees[0];
            const nextIdx = current.index < tees.length ? current.index + 1 : 1;
            window.__manualTeeLock = true;
            updateDetailAndSpotlight(getTeeByIndex(nextIdx));
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        fetch(IMAGE_MANIFEST_URL, { cache: 'no-cache' })
            .then(r => (r.ok ? r.json() : null))
            .then(data => {
                if (data && data.products) {
                    imageManifest = data;
                    renderHangingRack();
                    renderProducts('#products-grid', tees);
                    updateDetailAndSpotlight(getTeeById(selectedTeeId) || tees[0]);
                }
            })
            .catch(() => {});

        renderHangingRack();
        renderProducts('#products-grid', tees);
        updateDetailAndSpotlight(tees[0]);
        bindScrollRackMotion();
    });

    window.VelocityProducts = {
        MAX_TEES,
        getProducts: () => tees.map(t => ({ ...t })),
        getProductById: getTeeById,
        getProductByIndex: getTeeByIndex,
        renderProducts,
        renderHangingRack,
        selectTee: updateDetailAndSpotlight,
        updateProduct: updateTee,
        updateProductField: updateTeeField,
        searchProducts: q => {
            const s = normalizeText(q);
            if (!s) return [...tees];
            return tees.filter(t =>
                normalizeText(t.name).includes(s) ||
                normalizeText(t.quality).includes(s) ||
                normalizeText(`#${t.indexLabel}`).includes(s) ||
                String(t.index) === s
            );
        }
    };
})();
