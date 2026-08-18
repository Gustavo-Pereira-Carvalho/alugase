// ==========================================
// ALUGASE — HOME
// API ONLINE
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api/products";

    const searchInput = document.querySelector("#search-input");
    const searchButton = document.querySelector("#search-button");

    const loginButton = document.querySelector(".btn-secondary");
    const announceButtons = document.querySelectorAll(".btn-primary");
    const categoryCards = document.querySelectorAll(".category-card");

    const productsGrid = document.querySelector("#products-grid");

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    // ==========================================
    // CARREGAR PRODUTOS
    // ==========================================

    async function loadProducts() {

        if (!productsGrid) return;

        productsGrid.innerHTML = `
            <p class="empty-message">Carregando anúncios...</p>
        `;

        try {

            const response = await fetch(API);
            const products = await response.json();

            renderProducts(products);

        } catch (error) {

            console.error(error);

            productsGrid.innerHTML = `
                <p class="empty-message">
                    Não foi possível carregar os anúncios.
                </p>
            `;

        }

    }

    // ==========================================
    // RENDERIZAR PRODUTOS
    // ==========================================

    function renderProducts(products) {

        productsGrid.innerHTML = "";

        if (products.length === 0) {

            productsGrid.innerHTML = `
                <p class="empty-message">
                    Nenhum anúncio disponível.
                </p>
            `;

            return;

        }

        products.forEach(product => {

            const card = document.createElement("article");

            card.className = "product-card";

            card.innerHTML = `
                <div class="product-image">
                    ${product.image || "📦"}
                </div>

                <div class="product-content">
                    <h3>${product.title}</h3>

                    <p>📍 ${product.city}</p>

                    <strong>
                        R$ ${product.pricePerDay}/dia
                    </strong>
                </div>
            `;

            card.onclick = () => {

                window.location.href =
                    `produto.html?id=${product._id}`;

            };

            productsGrid.appendChild(card);

        });

    }

    // ==========================================
    // BUSCA → EXPLORAR
    // ==========================================

    function goToExplore() {

        const term = searchInput.value.trim();

        if (term) {

            window.location.href =
                `explorar.html?q=${encodeURIComponent(term)}`;

        } else {

            window.location.href = "explorar.html";

        }

    }

    searchButton?.addEventListener("click", goToExplore);

    searchInput?.addEventListener("keydown", e => {

        if (e.key === "Enter") {

            e.preventDefault();
            goToExplore();

        }

    });

    // ==========================================
    // CATEGORIAS
    // ==========================================

    categoryCards.forEach(card => {

        card.addEventListener("click", () => {

            const category = card.dataset.category;

            window.location.href =
                `explorar.html?category=${encodeURIComponent(category)}`;

        });

    });

    // ==========================================
    // LOGIN / PERFIL
    // ==========================================

    if (loginButton) {

        if (user) {

            loginButton.textContent = "Meu Perfil";

            loginButton.onclick = () => {

                window.location.href = "perfil.html";

            };

        } else {

            loginButton.onclick = () => {

                window.location.href = "login.html";

            };

        }

    }

    // ==========================================
    // ANUNCIAR
    // ==========================================

    announceButtons.forEach(button => {

        if (button.textContent.includes("Anunciar")) {

            button.onclick = () => {

                if (user) {

                    window.location.href = "novo-anuncio.html";

                } else {

                    window.location.href = "login.html";

                }

            };

        }

    });

    // ==========================================
    // INICIAR
    // ==========================================

    await loadProducts();

});