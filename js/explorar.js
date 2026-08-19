// ==========================================
// ALUGASE — EXPLORAR (API ONLINE)
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api/products";

    let products = [];

    // ==========================================
    // ELEMENTOS
    // ==========================================

    const grid = document.querySelector("#products-grid");
    const count = document.querySelector("#results-count");

    const search = document.querySelector("#search");
    const category = document.querySelector("#filter-category");
    const city = document.querySelector("#filter-city");

    const maxPrice = document.querySelector("#max-price");
    const priceValue = document.querySelector("#price-value");

    const sort = document.querySelector("#sort");

    const verifiedOnly = document.querySelector("#verified-only");
    const deliveryOnly = document.querySelector("#delivery-only");

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    // ==========================================
    // FAVORITOS
    // ==========================================

    let favorites = JSON.parse(
        localStorage.getItem("alugase_favorites")
    ) || [];

    function saveFavorites() {

        localStorage.setItem(
            "alugase_favorites",
            JSON.stringify(favorites)
        );

    }

    // ==========================================
    // URL
    // ==========================================

    const params = new URLSearchParams(window.location.search);

    search.value = params.get("q") || "";
    category.value = params.get("category") || "";

    // ==========================================
    // SLIDER
    // ==========================================

    priceValue.textContent = `Até R$ ${maxPrice.value}`;

    maxPrice.addEventListener("input", () => {

        priceValue.textContent =
            `Até R$ ${maxPrice.value}`;

    });

    // ==========================================
    // BUSCAR API
    // ==========================================

    async function loadProducts() {

        try {

            const response = await fetch(API);

            products = await response.json();

            applyFilters();

        } catch (error) {

            console.error(error);

            grid.innerHTML = `
                <div class="empty-state">
                    <h3>Erro ao carregar anúncios</h3>
                </div>
            `;

        }

    }

    // ==========================================
    // RENDER
    // ==========================================

    function render(list) {

        grid.innerHTML = "";

        count.textContent =
            `${list.length} anúncios encontrados`;

        if (list.length === 0) {

            grid.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhum anúncio encontrado</h3>
                </div>
            `;

            return;

        }

        list.forEach(product => {

            const isFavorite =
                favorites.includes(product._id);

            const card = document.createElement("article");

            card.className = "product-card";

card.innerHTML = `
<div class="product-image">

    <button class="favorite-btn ${isFavorite ? "active" : ""}">
        ${isFavorite ? "❤" : "♡"}
    </button>

    ${
        product.images?.length
        ? `<img src="${product.images[0]}" alt="${product.title}">`
        : `<span>📦</span>`
    }

</div>

<div class="product-content">

    <div class="card-top">

        <span class="category-tag">
            ${product.category}
        </span>

        ${
            product.verified
            ? `<span class="verified">✓ Verificado</span>`
            : ""
        }

    </div>

    <h3>${product.title}</h3>

    <div class="location">
        📍 ${product.city}
    </div>

    <div class="card-info">

        <span>⭐ ${product.rating || "5.0"}</span>

        <span>
            ${product.delivery ? "🚚 Entrega" : "📍 Retirada"}
        </span>

    </div>

    <div class="price-row">

        <div>

            <div class="price">
                R$ ${product.pricePerDay}
            </div>

            <small>/dia</small>

        </div>

        <small>Caução R$ ${product.deposit}</small>

    </div>

</div>
`;

            // FAVORITOS

            card.querySelector(".favorite-btn")
                .addEventListener("click", e => {

                    e.stopPropagation();

                    if (isFavorite) {

                        favorites = favorites.filter(
                            id => id !== product._id
                        );

                    } else {

                        favorites.push(product._id);

                    }

                    saveFavorites();

                    applyFilters();

                });

            // ABRIR PRODUTO

            card.addEventListener("click", () => {

                window.location.href =
                    `produto.html?id=${product._id}`;

            });

            grid.appendChild(card);

        });

    }

    // ==========================================
    // FILTROS
    // ==========================================

    function applyFilters() {

        let list = [...products];

        list = list.filter(product =>

            product.title
                .toLowerCase()
                .includes(search.value.toLowerCase())

        );

        if (category.value) {

            list = list.filter(product =>
                product.category === category.value
            );

        }

        if (city.value) {

            list = list.filter(product =>

                product.city
                    .toLowerCase()
                    .includes(city.value.toLowerCase())

            );

        }

        list = list.filter(product =>
            product.pricePerDay <= Number(maxPrice.value)
        );

        if (verifiedOnly?.checked) {

            list = list.filter(product =>
                product.verified
            );

        }

        if (deliveryOnly?.checked) {

            list = list.filter(product =>
                product.delivery
            );

        }

        switch (sort.value) {

            case "low":
                list.sort((a, b) =>
                    a.pricePerDay - b.pricePerDay
                );
                break;

            case "high":
                list.sort((a, b) =>
                    b.pricePerDay - a.pricePerDay
                );
                break;

            default:
                list.reverse();

        }

        render(list);

    }

    // ==========================================
    // EVENTOS
    // ==========================================

    document
        .querySelector("#apply-filters")
        .addEventListener("click", applyFilters);

    document
        .querySelector("#search-button")
        .addEventListener("click", applyFilters);

    search.addEventListener("keydown", e => {

        if (e.key === "Enter") {

            applyFilters();

        }

    });

    // ==========================================
    // LOGIN
    // ==========================================

    document
        .querySelector("#login-btn")
        .addEventListener("click", () => {

            window.location.href =
                user
                    ? "perfil.html"
                    : "login.html";

        });

    document
        .querySelector("#announce-btn")
        .addEventListener("click", () => {

            window.location.href =
                user
                    ? "novo-anuncio.html"
                    : "login.html";

        });

    // ==========================================

    await loadProducts();

});
