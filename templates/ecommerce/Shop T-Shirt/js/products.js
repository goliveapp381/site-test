.rack-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

.rack-pos-label {
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--accent);
}

.hanging-rack-stage {
    position: relative;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 24px 20px 28px;
    margin-bottom: 24px;
    overflow: hidden;
}

.rack-top-bar {
    height: 5px;
    border-radius: 999px;
    background: linear-gradient(90deg, #475569, #e2e8f0, #38bdf8, #475569);
    transform: rotate(-4deg);
    transform-origin: left center;
    margin-bottom: 22px;
}

/* سكة مائلة ومتراكبة: القطعة المختارة واضحة في الواجهة والباقي متراكب خلفها ويبان غير جزء منه */
.hanging-rack-track {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 0;
    overflow-x: auto;
    padding: 12px 16px 18px 8px;
    scrollbar-width: thin;
}

.hanger-item {
    position: relative;
    flex: 0 0 155px;
    margin-right: -68px;
    text-align: left;
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 10px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 5px;
    transform: translateY(var(--rack-drop, 0px)) rotate(-5deg);
    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease;
    opacity: 0.72;
}

.hanger-item:hover {
    opacity: 0.95;
    transform: translateY(calc(var(--rack-drop, 0px) - 6px)) rotate(-3deg);
    z-index: 20 !important;
}

.hanger-item.active-tee {
    opacity: 1;
    margin-right: -36px;
    transform: translateY(calc(var(--rack-drop, 0px) - 8px)) rotate(0deg) scale(1.04);
    border-color: var(--accent);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.55);
    z-index: 30 !important;
}

.hanger-hook {
    width: 14px;
    height: 14px;
    border: 2px solid #cbd5e1;
    border-bottom: none;
    border-radius: 999px 999px 0 0;
    margin: -16px auto 2px;
}

.hanger-index {
    font-size: 0.7rem;
    font-weight: 900;
    color: var(--accent);
}

.hanger-img-box {
    height: 125px;
    border-radius: 10px;
    overflow: hidden;
    background: #0e0e14;
}

.hanger-img-box img,
.spotlight-tee-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.spotlight-tee-img {
    max-height: 220px;
    border-radius: 16px;
    margin-bottom: 14px;
}

.hanger-title {
    font-size: 0.84rem;
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.hanger-meta,
.spotlight-tee-quality {
    font-size: 0.72rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.hanger-price {
    font-size: 0.88rem;
    font-weight: 900;
    color: #4ade80;
}

/* صندوق تفاصيل القطعة المختارة */
.tee-detail-panel {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 22px;
}

.tee-detail-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--border);
    padding-bottom: 14px;
    margin-bottom: 14px;
}

.tee-detail-index {
    font-size: 0.75rem;
    font-weight: 900;
    color: var(--accent);
}

.tee-detail-price {
    font-size: 1.5rem;
    font-weight: 900;
    color: #4ade80;
}

.tee-detail-desc {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 16px;
}

.tee-detail-specs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 18px;
}

.spec-box {
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 12px;
}

.spec-box span {
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
}

.spec-box strong {
    font-size: 0.9rem;
}

.tee-detail-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

/* شبكة باقي القمصان المفهرسة */
.product-controls,
.products-toolbar,
.products-grid {
    display: grid;
    gap: 16px;
}

.product-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
}

.filter-button,
.filter-reset,
.product-sort {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 8px 14px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
}

.filter-button.active {
    background: var(--accent);
    color: #061018;
    border-color: var(--accent);
}

.products-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.products-search {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1 1 280px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 10px 14px;
}

.products-search input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
}

.products-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.product-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 18px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    cursor: pointer;
}

.product-card.active-tee {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent);
}

.product-image-wrapper {
    position: relative;
    background: var(--bg-soft);
    height: 180px;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.product-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(11, 11, 15, 0.85);
    color: var(--accent);
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
}

.product-overlay {
    display: flex;
    gap: 8px;
    padding: 10px;
    background: var(--bg-soft);
}

.quick-view-button,
.add-cart-button {
    flex: 1;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg-card);
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
}

.add-cart-button {
    background: var(--accent);
    color: #061018;
    border-color: var(--accent);
}

.product-info {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.product-category {
    font-size: 0.76rem;
    color: var(--text-muted);
}

.product-name {
    font-size: 0.96rem;
    font-weight: 800;
}

.product-price {
    font-size: 1.04rem;
    font-weight: 900;
    color: #4ade80;
}

.products-empty {
    text-align: center;
    padding: 40px 20px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 18px;
    margin-top: 16px;
}
