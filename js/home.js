// ==========================================
// ALUGASE — HOME
// Produtos, busca e categorias
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    // ==========================================
    // API
    // ==========================================

    const API =
        "https://alugase-api.onrender.com/api/products";


    // ==========================================
    // ELEMENTOS
    // ==========================================

    const searchInput =
        document.querySelector("#search-input");

    const searchButton =
        document.querySelector("#search-button");

    const productsGrid =
        document.querySelector("#products-grid");

    const categoryCards =
        document.querySelectorAll(".category-card");


    // ==========================================
    // CARREGAR PRODUTOS
    // ==========================================

    async function loadProducts() {

        if (!productsGrid) {

            return;

        }


        productsGrid.innerHTML = `

            <p class="empty-message">
                Carregando anúncios...
            </p>

        `;


        try {

            const response =
                await fetch(API);


            if (!response.ok) {

                throw new Error(
                    "Erro ao carregar produtos."
                );

            }


            const products =
                await response.json();


            renderProducts(products);

        } catch (error) {

            console.error(
                "ERRO AO CARREGAR PRODUTOS:",
                error
            );


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

        if (!productsGrid) {

            return;

        }


        productsGrid.innerHTML = "";


        // Nenhum produto

        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {

            productsGrid.innerHTML = `

                <p class="empty-message">
                    Nenhum anúncio disponível.
                </p>

            `;

            return;

        }


        // Criar cards

        products.forEach(product => {

            const card =
                document.createElement("article");


            card.className =
                "product-card";


            // ==========================================
            // PREÇO
            // ==========================================

            const price =
                Number(
                    product.pricePerDay || 0
                );


            // ==========================================
            // IMAGEM
            // ==========================================

            let imageHTML =
                "📦";


            if (product.image) {

                imageHTML = `

                    <img
                        src="${product.image}"
                        alt="${product.title || "Produto"}"
                        loading="lazy"
                    >

                `;

            }


            // ==========================================
            // HTML DO CARD
            // ==========================================

            card.innerHTML = `

                <div class="product-image">

                    ${imageHTML}

                </div>


                <div class="product-content">

                    <h3>
                        ${product.title || "Produto"}
                    </h3>


                    <p>
                        📍
                        ${product.city || "Localização não informada"}
                    </p>


                    <strong>
                        R$
                        ${price
                            .toFixed(2)
                            .replace(".", ",")
                        }
                        /dia
                    </strong>

                </div>

            `;


            // ==========================================
            // ABRIR PRODUTO
            // ==========================================

            card.addEventListener(
                "click",
                () => {

                    if (!product._id) {

                        return;

                    }


                    window.location.href =
                        `produto.html?id=${product._id}`;

                }
            );


            productsGrid.appendChild(card);

        });

    }


    // ==========================================
    // BUSCA
    // ==========================================

    function goToExplore() {

        const term =
            searchInput?.value.trim() || "";


        if (term) {

            window.location.href =
                `explorar.html?q=${encodeURIComponent(term)}`;

        } else {

            window.location.href =
                "explorar.html";

        }

    }


    // ==========================================
    // BOTÃO BUSCAR
    // ==========================================

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            goToExplore
        );

    }


    // ==========================================
    // ENTER NA BUSCA
    // ==========================================

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    goToExplore();

                }

            }
        );

    }


    // ==========================================
    // CATEGORIAS
    // ==========================================

    categoryCards.forEach(card => {


        // Clique

        card.addEventListener(
            "click",
            () => {

                const category =
                    card.dataset.category;


                if (!category) {

                    return;

                }


                window.location.href =
                    `explorar.html?category=${encodeURIComponent(category)}`;

            }
        );


        // Teclado

        card.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    card.click();

                }

            }
        );

    });


    // ==========================================
    // INICIAR
    // ==========================================

    await loadProducts();

});