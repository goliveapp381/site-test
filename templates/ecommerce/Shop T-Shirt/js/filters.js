/* js/filters.js */
'use strict';

(() => {
    const state = { category: 'all', search: '', sort: 'index-asc' };

    function refresh() {
        const all = window.VelocityProducts ? window.VelocityProducts.getProducts() : [];
        let list = all.filter(item => {
            const matchCat = state.category === 'all' || item.category === state.category;
            const q = state.search.trim().toLowerCase();
            const matchSearch = !q ||
                String(item.name || '').toLowerCase().includes(q) ||
                String(item.quality || '').toLowerCase().includes(q) ||
                String(item.indexLabel || '').toLowerCase().includes(q) ||
                String(item.index) === q;
            return matchCat && matchSearch;
        });

        if (state.sort === 'index-desc') list.sort((a, b) => b.index - a.index);
        else if (state.sort === 'price-low') list.sort((a, b) => a.price - b.price);
        else if (state.sort === 'price-high') list.sort((a, b) => b.price - a.price);
        else list.sort((a, b) => a.index - b.index);

        document.querySelectorAll('[data-category-filter]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.categoryFilter === state.category);
        });

        window.VelocityProducts?.renderProducts('#products-grid', list);
    }

    window.ShopTshirtFilters = { refresh };

    document.addEventListener('DOMContentLoaded', refresh);

    document.addEventListener('click', e => {
        const cat = e.target.closest('[data-category-filter]');
        if (cat) {
            state.category = cat.dataset.categoryFilter || 'all';
            refresh();
            return;
        }
        if (e.target.closest('[data-filter-reset]')) {
            state.category = 'all';
            state.search = '';
            state.sort = 'index-asc';
            document.querySelectorAll('[data-product-search]').forEach(inp => { inp.value = ''; });
            const sel = document.querySelector('[data-product-sort]');
            if (sel) sel.value = 'index-asc';
            refresh();
        }
    });

    document.addEventListener('input', e => {
        const inp = e.target.closest('[data-product-search]');
        if (!inp) return;
        state.search = inp.value || '';
        refresh();
    });

    document.addEventListener('change', e => {
        const sel = e.target.closest('[data-product-sort]');
        if (!sel) return;
        state.sort = sel.value || 'index-asc';
        refresh();
    });
})();
