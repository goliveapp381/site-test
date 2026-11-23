/* js/filters.js */
'use strict';

(() => {
    const state = {
        category: 'all',
        search: '',
        sort: 'featured'
    };

    function applyFilters() {
        const base = [...(window.SHOP_TSHIRT_CATALOG || [])];
        let filtered = base.filter(item => {
            const matchCat = state.category === 'all' || item.category === state.category;
            const q = state.search.trim().toLowerCase();
            const matchSearch = !q ||
                item.name.toLowerCase().includes(q) ||
                item.material.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q);
            return matchCat && matchSearch;
        });

        if (state.sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
        if (state.sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
        if (state.sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
        if (state.sort === 'newest') filtered.sort((a, b) => (b.createdOrder || 0) - (a.createdOrder || 0));

        document.querySelectorAll('[data-category-filter]').forEach(btn => {
            const val = btn.getAttribute('data-category-filter');
            btn.classList.toggle('active', val === state.category);
        });

        window.ShopTshirtCatalogUI?.renderGarmentGrid(filtered);
    }

    document.addEventListener('DOMContentLoaded', () => {
        applyFilters();
        window.ShopTshirtCatalogUI?.selectGarmentById('heavyweight-tee');
    });

    document.addEventListener('click', event => {
        const catBtn = event.target.closest('[data-category-filter]');
        if (catBtn) {
            state.category = catBtn.getAttribute('data-category-filter') || 'all';
            applyFilters();
            return;
        }

        if (event.target.closest('[data-filter-reset]')) {
            state.category = 'all';
            state.search = '';
            state.sort = 'featured';
            document.querySelectorAll('[data-product-search]').forEach(input => {
                input.value = '';
            });
            const sortSelect = document.querySelector('[data-product-sort]');
            if (sortSelect) sortSelect.value = 'featured';
            applyFilters();
        }
    });

    document.addEventListener('input', event => {
        const searchInput = event.target.closest('[data-product-search]');
        if (!searchInput) return;
        state.search = searchInput.value || '';
        applyFilters();
    });

    document.addEventListener('change', event => {
        const sortSelect = event.target.closest('[data-product-sort]');
        if (!sortSelect) return;
        state.sort = sortSelect.value || 'featured';
        applyFilters();
    });
})();
