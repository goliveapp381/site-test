'use strict';

window.SHOP_TSHIRT_CATALOG = [
    {
        id: 'heavyweight-tee',
        name: 'Heavyweight Studio Tee',
        category: 'tshirts',
        price: 49,
        rating: 4.9,
        material: '320 GSM Combed Organic Cotton',
        colors: ['Obsidian', 'Bone', 'Slate'],
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Structured boxy t-shirt made from heavyweight organic cotton with double-stitched collar and clean drape.'
    },
    {
        id: 'oversized-hoodie',
        name: 'Structured Boxy Hoodie',
        category: 'hoodies',
        price: 89,
        rating: 4.8,
        material: '460 GSM Loopback French Terry',
        colors: ['Charcoal', 'Sand', 'Espresso'],
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Architectural hoodie with dropped shoulders, double-lined hood, and zero-twist rib cuffs.'
    },
    {
        id: 'long-coat',
        name: 'Long Wool Coat',
        category: 'outerwear',
        price: 165,
        rating: 4.9,
        material: '80% Virgin Wool / 20% Polyamide Blend',
        colors: ['Jet Black', 'Oatmeal', 'Stone'],
        sizes: ['M', 'L', 'XL'],
        description: 'Minimalist longline coat inspired by interactive lookbooks, tailored for clean layering and movement.'
    },
    {
        id: 'minimal-cap',
        name: 'Embroidered Cap',
        category: 'accessories',
        price: 29,
        rating: 4.7,
        material: '100% Brushed Cotton Twill',
        colors: ['Black', 'Cream'],
        sizes: ['One Size'],
        description: 'Six-panel low-profile cap with tonal embroidery and adjustable strap.'
    }
];

(() => {
    function selectGarmentById(garmentId) {
        const catalog = window.SHOP_TSHIRT_CATALOG || [];
        const item = catalog.find(g => g.id === garmentId) || catalog[0];
        if (!item) return;

        const heroTitle = document.getElementById('heroSelectedTitle');
        const heroPrice = document.getElementById('heroSelectedPrice');
        const heroMeta = document.getElementById('heroSelectedMeta');

        const detailTitle = document.getElementById('detailTitle');
        const detailPrice = document.getElementById('detailPrice');
        const detailDescription = document.getElementById('detailDescription');
        const detailMaterial = document.getElementById('detailMaterial');
        const detailColors = document.getElementById('detailColors');
        const detailSizes = document.getElementById('detailSizes');

        if (heroTitle) heroTitle.textContent = item.name;
        if (heroPrice) heroPrice.textContent = `$${item.price}`;
        if (heroMeta) {
            heroMeta.textContent = `Material: ${item.material} • Colors: ${item.colors.join(', ')} • Sizes: ${item.sizes.join(', ')}`;
        }

        if (detailTitle) detailTitle.textContent = item.name;
        if (detailPrice) detailPrice.textContent = `$${item.price}`;
        if (detailDescription) detailDescription.textContent = item.description;
        if (detailMaterial) detailMaterial.textContent = item.material;
        if (detailColors) detailColors.textContent = item.colors.join(', ');
        if (detailSizes) detailSizes.textContent = item.sizes.join(', ');

        window.__selectedShopTshirtGarment = item;
    }

    document.addEventListener('click', event => {
        const trigger = event.target.closest('[data-inspect-garment]');
        if (!trigger) return;
        const garmentId = trigger.getAttribute('data-inspect-garment');
        selectGarmentById(garmentId);
    });

    document.addEventListener('DOMContentLoaded', () => {
        selectGarmentById('heavyweight-tee');
    });
})();
