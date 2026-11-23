'use strict';

(() => {
    const MAX_TEES = 40;
    const IMAGE_MANIFEST_URL = 'assets/images/image-manifest.json';

    const DEFAULT_PRESETS = [
        { title: 'Studio Heavy Tee', category: 'heavyweight', quality: '320 GSM Combed Cotton', price: 39, oldPrice: 49 },
        { title: 'Boxy Rack Tee', category: 'boxy', quality: '300 GSM Boxy Jersey', price: 42, oldPrice: 54 },
        { title: 'Archive Rail Tee', category: 'graphic', quality: '290 GSM Ring-Spun Cotton', price: 45, oldPrice: 59 },
        { title: 'Minimalist Knit Tee', category: 'heavyweight', quality: '340 GSM Organic Cotton', price: 44, oldPrice: 55 },
        { title: 'Dropped Shoulder Tee', category: 'boxy', quality: '310 GSM Heavy Jersey', price: 41, oldPrice: 50 }
    ];

    function padIndex(num) {
        return String(num).padStart(2, '0');
    }

    function createInitialTees(count = MAX_TEES) {
        const list = [];
        const safeCount = Math.min(Math.max(1, Number(count) || MAX_TEES), MAX_TEES);

        for (let i = 1; i <= safeCount; i++) {
            const preset = DEFAULT_PRESETS[(i - 1) % DEFAULT_PRESETS.length];
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
                description: `${preset.quality} • Indexed slot #${idxLabel} in Shop T-Shirt collection.`,
                rating: 4.8,
                reviews: 20 + i * 3,
                badge: `#${idxLabel}`,
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

    function makeTeeSvg(indexLabel, title) {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="400" height="480" viewBox="0 0 400 480">
                <rect width="400" height="480" rx="20" fill="#141824"/>
                <path d="M120 120 L168 86 L232 86 L280 120 L334 162 L302 214 L268 190 L268 380 L132 380 L132 190 L98 214 L66 162 Z"
                      fill="#1e293b" stroke="#38bdf8" stroke-width="5"/>
                <text x="200" y="255" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="#f8fafc">#${indexLabel}</text>
                <text x="200" y="425" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#38bdf8">${title}</text>
            </svg>
        `.trim();
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

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
        if (!tee) return makeTeeSvg('01', 'SHOP T-SHIRT');
        const manifestImg = tee.imageId ? imageManifest?.products?.[tee.imageId] : '';
        const candidates = [
            tee.resolvedImage,
            tee.localImage,
            manifestImg,
            tee.image,
            tee.webImage,
            tee.remoteImage
        ];
        for (const c of candidates) {
            const url = buildImageUrl(c);
            if (url) return url;
        }
        return makeTeeSvg(tee.indexLabel, 'SHOP T-SHIRT');
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

        track.innerHTML = tees.map((tee, idx) => {
            const dropPx = Math.min(28, idx * 2);
            const zIndex = tees.length - idx;
            const isActive = tee.id === selectedTeeId;

            return `
                <button
                    type="button"
                    class="hanger-item ${isActive ? 'active-tee' : ''}"
                    style="--rack-drop: ${dropPx}px; z-index: ${isActive ? 30 : zIndex};"
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
            `;
        }).join('');
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

    let scrollBound = false;
    function bindScrollRackMotion() {
        if (scrollBound) return;
        const track = document.getElementById('hangingRackTrack');
        if (!track) return;
        scrollBound = true;

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

    let eventsBound = false;
    function bindEvents() {
        if (eventsBound) return;
        eventsBound = true;

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
    }

    function bootTees() {
        bindEvents();
        renderHangingRack();
        if (window.ShopTshirtFilters && typeof window.ShopTshirtFilters.refresh === 'function') {
            window.ShopTshirtFilters.refresh();
        } else {
            renderProducts('#products-grid', tees);
        }
        updateDetailAndSpotlight(getTeeById(selectedTeeId) || tees[0]);
        bindScrollRackMotion();
    }

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootTees, { once: true });
    } else {
        bootTees();
    }

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
})();
