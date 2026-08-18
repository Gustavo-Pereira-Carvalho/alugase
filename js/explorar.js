// ==========================================
// ALUGASE — EXPLORAR
// ==========================================

const products = [
    {
        id: 1,
        title: "Câmera Canon EOS",
        category: "Eletrônicos",
        city: "São Paulo",
        price: 80,
        image: "📷",
        verified: true,
        delivery: true,
        deposit: 300,
        rating: 4.9
    },
    {
        id: 2,
        title: "Furadeira Bosch",
        category: "Ferramentas",
        city: "Guarulhos",
        price: 35,
        image: "🔧",
        verified: true,
        delivery: false,
        deposit: 120,
        rating: 4.8
    },
    {
        id: 3,
        title: "Toyota Corolla",
        category: "Veículos",
        city: "São Paulo",
        price: 180,
        image: "🚗",
        verified: true,
        delivery: true,
        deposit: 1000,
        rating: 5.0
    },
    {
        id: 4,
        title: "Caixa JBL PartyBox",
        category: "Eventos",
        city: "Osasco",
        price: 45,
        image: "🔊",
        verified: false,
        delivery: true,
        deposit: 200,
        rating: 4.6
    },
    {
        id: 5,
        title: "Notebook Lenovo",
        category: "Eletrônicos",
        city: "São Paulo",
        price: 70,
        image: "💻",
        verified: true,
        delivery: false,
        deposit: 350,
        rating: 4.9
    }
];

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
// PARÂMETROS DA URL
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
// RENDERIZAR
// ==========================================

function render(list) {

    grid.innerHTML = "";

    count.textContent =
        `${list.length} anúncios encontrados`;

    if (list.length === 0) {

        grid.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum anúncio encontrado</h3>
                <p>Tente alterar os filtros da pesquisa.</p>
            </div>
        `;

        return;

    }

    list.forEach(product => {

        const isFavorite =
            favorites.includes(product.id);

        const card = document.createElement("article");

        card.className = "product-card";

        card.innerHTML = `
            <div class="product-image">

                <button class="favorite-btn ${isFavorite ? "active" : ""}">
                    ${isFavorite ? "❤" : "♡"}
                </button>

                <span>${product.image}</span>

            </div>

            <div class="product-content">

                <div class="card-top">

                    <span class="category-tag">
                        ${product.category}
                    </span>

                    ${product.verified
                        ? `<span class="verified">✓ Verificado</span>`
                        : ""
                    }

                </div>

                <h3>${product.title}</h3>

                <div class="location">
                    📍 ${product.city}
                </div>

                <div class="card-info">

                    <span>⭐ ${product.rating}</span>

                    <span>
                        ${product.delivery
                            ? "🚚 Entrega"
                            : "📍 Retirada"
                        }
                    </span>

                </div>

                <div class="price-row">

                    <div>

                        <div class="price">
                            R$ ${product.price}
                        </div>

                        <small>/dia</small>

                    </div>

                    <small>
                        Caução R$ ${product.deposit}
                    </small>

                </div>

            </div>
        `;

        // Favoritar

        const favButton =
            card.querySelector(".favorite-btn");

        favButton.addEventListener("click", e => {

            e.stopPropagation();

            if (isFavorite) {

                favorites = favorites.filter(
                    id => id !== product.id
                );

            } else {

                favorites.push(product.id);

            }

            saveFavorites();

            applyFilters();

        });

        // Abrir produto

        card.addEventListener("click", () => {

            alert(
                `Abrirá o produto: ${product.title}`
            );

        });

        grid.appendChild(card);

    });

}

// ==========================================
// FILTROS
// ==========================================

function applyFilters() {

    let list = [...products];

    // Busca

    list = list.filter(product =>

        product.title
            .toLowerCase()
            .includes(search.value.toLowerCase())

    );

    // Categoria

    if (category.value) {

        list = list.filter(product =>
            product.category === category.value
        );

    }

    // Cidade

    if (city.value) {

        list = list.filter(product =>

            product.city
                .toLowerCase()
                .includes(city.value.toLowerCase())

        );

    }

    // Preço

    list = list.filter(product =>
        product.price <= Number(maxPrice.value)
    );

    // Verificados

    if (verifiedOnly.checked) {

        list = list.filter(product =>
            product.verified
        );

    }

    // Entrega

    if (deliveryOnly.checked) {

        list = list.filter(product =>
            product.delivery
        );

    }

    // Ordenação

    switch (sort.value) {

        case "low":
            list.sort((a, b) => a.price - b.price);
            break;

        case "high":
            list.sort((a, b) => b.price - a.price);
            break;

        default:
            list.sort((a, b) => b.id - a.id);

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
// LOGIN / PERFIL
// ==========================================

const user = JSON.parse(
    localStorage.getItem("alugase_user")
);

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
// INICIAR
// ==========================================

applyFilters();