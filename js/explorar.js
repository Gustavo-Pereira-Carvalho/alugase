// ==========================================
// ALUGASE — EXPLORAR
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API =
        "https://alugase-api.onrender.com/api/products";

    let products = [];



    // ==========================================
    // ELEMENTOS
    // ==========================================

    const grid =
        document.querySelector("#products-grid");

    const count =
        document.querySelector("#results-count");

    const search =
        document.querySelector("#search");

    const category =
        document.querySelector("#filter-category");

    const city =
        document.querySelector("#filter-city");

    const maxPrice =
        document.querySelector("#max-price");

    const priceValue =
        document.querySelector("#price-value");

    const sort =
        document.querySelector("#sort");

    const verifiedOnly =
        document.querySelector("#verified-only");

    const deliveryOnly =
        document.querySelector("#delivery-only");

    const applyFiltersButton =
        document.querySelector("#apply-filters");

    const searchButton =
        document.querySelector("#search-button");

    const loginBtn =
        document.querySelector("#login-btn");

    const announceBtn =
        document.querySelector("#announce-btn");

    const logoutBtn =
        document.querySelector("#logout");

    const notificationBadge =
        document.querySelector("#notification-badge");



    // ==========================================
    // USUÁRIO
    // ==========================================

    let user = null;

    try {

        const storedUser =
            localStorage.getItem("alugase_user");

        if (storedUser) {

            user =
                JSON.parse(storedUser);

        }

    } catch (error) {

        console.error(
            "Erro ao ler usuário:",
            error
        );

        user = null;

    }



    // ==========================================
    // ELEMENTOS SOMENTE PARA LOGADOS
    // ==========================================

    const loggedOnly =
        document.querySelectorAll(".logged-only");


    if (user) {

        // ======================================
        // USUÁRIO LOGADO
        // ======================================

        loggedOnly.forEach(element => {

            element.style.display = "";

        });


        if (loginBtn) {

            loginBtn.textContent =
                "Perfil";

            loginBtn.onclick = () => {

                window.location.href =
                    "perfil.html";

            };

        }

    } else {

        // ======================================
        // USUÁRIO NÃO LOGADO
        // ======================================

        loggedOnly.forEach(element => {

            element.style.display =
                "none";

        });


        if (loginBtn) {

            loginBtn.textContent =
                "Entrar";

            loginBtn.onclick = () => {

                window.location.href =
                    "login.html";

            };

        }

    }



    // ==========================================
    // ANUNCIAR
    // ==========================================

    if (announceBtn) {

        announceBtn.addEventListener(
            "click",
            () => {

                if (user) {

                    window.location.href =
                        "novo-anuncio.html";

                } else {

                    window.location.href =
                        "login.html";

                }

            }
        );

    }



    // ==========================================
    // LOGOUT
    // ==========================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "alugase_user"
                );

                localStorage.removeItem(
                    "alugase_token"
                );

                window.location.href =
                    "index.html";

            }
        );

    }



    // ==========================================
    // NOTIFICAÇÕES
    // ==========================================

    if (notificationBadge) {

        notificationBadge.style.display =
            "none";

    }



    // ==========================================
    // FAVORITOS
    // ==========================================

    let favorites = [];

    try {

        favorites =
            JSON.parse(
                localStorage.getItem(
                    "alugase_favorites"
                )
            ) || [];

    } catch (error) {

        favorites = [];

    }



    function saveFavorites() {

        localStorage.setItem(
            "alugase_favorites",
            JSON.stringify(favorites)
        );

    }



    // ==========================================
    // URL
    // ==========================================

    const params =
        new URLSearchParams(
            window.location.search
        );


    if (search) {

        search.value =
            params.get("q") || "";

    }


    if (category) {

        category.value =
            params.get("category") || "";

    }



    // ==========================================
    // SLIDER DE PREÇO
    // ==========================================

    if (maxPrice && priceValue) {

        priceValue.textContent =
            `Até R$ ${Number(
                maxPrice.value
            ).toLocaleString("pt-BR")}`;


        maxPrice.addEventListener(
            "input",
            () => {

                priceValue.textContent =
                    `Até R$ ${Number(
                        maxPrice.value
                    ).toLocaleString("pt-BR")}`;

            }
        );

    }



    // ==========================================
    // BUSCAR PRODUTOS
    // ==========================================

    async function loadProducts() {

        try {

            grid.innerHTML = `
                <div class="empty-state">
                    <h3>
                        Carregando anúncios...
                    </h3>
                </div>
            `;


            const response =
                await fetch(API);


            if (!response.ok) {

                throw new Error(
                    `Erro HTTP ${response.status}`
                );

            }


            const data =
                await response.json();


            if (!Array.isArray(data)) {

                throw new Error(
                    "A API não retornou uma lista de produtos."
                );

            }


            products = data;


            updatePriceRange();

            applyFilters();

        } catch (error) {

            console.error(
                "Erro ao carregar anúncios:",
                error
            );


            grid.innerHTML = `
                <div class="empty-state">

                    <h3>
                        Erro ao carregar anúncios
                    </h3>

                    <p>
                        Não foi possível carregar os anúncios.
                        Tente novamente.
                    </p>

                </div>
            `;


            count.textContent =
                "0 anúncios";

        }

    }



    // ==========================================
    // AJUSTAR PREÇO
    // ==========================================

    function updatePriceRange() {

        if (!maxPrice || !priceValue) {
            return;
        }


        const prices =
            products
                .map(product =>
                    Number(
                        product.pricePerDay
                    )
                )
                .filter(price =>
                    Number.isFinite(price) &&
                    price >= 0
                );


        if (!prices.length) {

            maxPrice.max =
                500;

            maxPrice.value =
                500;

            priceValue.textContent =
                "Até R$ 500";

            return;

        }


        const highestPrice =
            Math.ceil(
                Math.max(...prices) / 50
            ) * 50;


        const maximum =
            Math.max(
                highestPrice,
                500
            );


        maxPrice.max =
            maximum;


        if (!params.get("maxPrice")) {

            maxPrice.value =
                maximum;

        }


        priceValue.textContent =
            `Até R$ ${Number(
                maxPrice.value
            ).toLocaleString("pt-BR")}`;

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

                    <h3>
                        Nenhum anúncio encontrado
                    </h3>

                    <p>
                        Tente alterar os filtros ou
                        pesquisar outro produto.
                    </p>

                </div>
            `;

            return;

        }



        list.forEach(product => {

            const isFavorite =
                favorites.includes(
                    product._id
                );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "product-card";



            // ==================================
            // IMAGEM
            // ==================================

            let imageHTML = `
                <div class="emoji-image">
                    📦
                </div>
            `;


            if (
                Array.isArray(product.images) &&
                product.images.length > 0
            ) {

                imageHTML = `
                    <img
                        src="${escapeHTML(
                            product.images[0]
                        )}"
                        alt="${escapeHTML(
                            product.title ||
                            "Produto"
                        )}"
                        loading="lazy"
                    >
                `;

            }



            // ==================================
            // VERIFICAÇÃO
            // ==================================

            const verifiedHTML =
                product.verified === true
                    ? `
                        <span class="verified">
                            ✓ Verificado
                        </span>
                    `
                    : "";



            // ==================================
            // ENTREGA
            // ==================================

            const deliveryText =
                product.delivery === true
                    ? "🚚 Entrega"
                    : "📍 Retirada";



            // ==================================
            // PREÇO
            // ==================================

            const price =
                Number(
                    product.pricePerDay
                ) || 0;


            const deposit =
                Number(
                    product.deposit
                ) || 0;


            const formattedPrice =
                price.toLocaleString(
                    "pt-BR",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );


            const formattedDeposit =
                deposit.toLocaleString(
                    "pt-BR",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );



            // ==================================
            // CARD
            // ==================================

            card.innerHTML = `

                <div class="product-image">

                    <button
                        type="button"
                        class="favorite-btn ${
                            isFavorite
                                ? "active"
                                : ""
                        }"
                        aria-label="${
                            isFavorite
                                ? "Remover dos favoritos"
                                : "Adicionar aos favoritos"
                        }"
                    >
                        ${
                            isFavorite
                                ? "❤"
                                : "♡"
                        }
                    </button>


                    ${imageHTML}

                </div>


                <div class="product-content">

                    <div class="card-top">

                        <span class="category-tag">
                            ${escapeHTML(
                                product.category ||
                                "Outros"
                            )}
                        </span>

                        ${verifiedHTML}

                    </div>


                    <h3>
                        ${escapeHTML(
                            product.title ||
                            "Produto sem título"
                        )}
                    </h3>


                    <div class="location">

                        📍

                        ${escapeHTML(
                            product.city ||
                            "Localização não informada"
                        )}

                    </div>


                    <div class="card-info">

                        <span>
                            ⭐ ${
                                product.rating ||
                                "5.0"
                            }
                        </span>


                        <span>
                            ${deliveryText}
                        </span>

                    </div>


                    <div class="price-row">

                        <div>

                            <div class="price">
                                R$ ${formattedPrice}
                            </div>

                            <small>
                                /dia
                            </small>

                        </div>


                        <small>
                            Caução
                            R$ ${formattedDeposit}
                        </small>

                    </div>

                </div>

            `;



            // ==================================
            // FAVORITO
            // ==================================

            const favoriteButton =
                card.querySelector(
                    ".favorite-btn"
                );


            if (favoriteButton) {

                favoriteButton.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();


                        const index =
                            favorites.indexOf(
                                product._id
                            );


                        if (index !== -1) {

                            favorites.splice(
                                index,
                                1
                            );

                        } else {

                            favorites.push(
                                product._id
                            );

                        }


                        saveFavorites();

                        applyFilters();

                    }
                );

            }



            // ==================================
            // ABRIR PRODUTO
            // ==================================

            card.addEventListener(
                "click",
                () => {

                    if (!product._id) {
                        return;
                    }


                    window.location.href =
                        `produto.html?id=${encodeURIComponent(
                            product._id
                        )}`;

                }
            );


            grid.appendChild(card);

        });

    }



    // ==========================================
    // FILTROS
    // ==========================================

    function applyFilters() {

        let list =
            [...products];



        // ======================================
        // PESQUISA
        // ======================================

        const searchTerm =
            search
                ? search.value
                    .trim()
                    .toLowerCase()
                : "";


        if (searchTerm) {

            list =
                list.filter(product => {

                    const title =
                        String(
                            product.title || ""
                        ).toLowerCase();


                    const description =
                        String(
                            product.description || ""
                        ).toLowerCase();


                    const categoryText =
                        String(
                            product.category || ""
                        ).toLowerCase();


                    return (
                        title.includes(searchTerm) ||
                        description.includes(searchTerm) ||
                        categoryText.includes(searchTerm)
                    );

                });

        }



        // ======================================
        // CATEGORIA
        // ======================================

        if (
            category &&
            category.value
        ) {

            list =
                list.filter(product =>
                    String(
                        product.category || ""
                    ) === category.value
                );

        }



        // ======================================
        // CIDADE
        // ======================================

        const cityTerm =
            city
                ? city.value
                    .trim()
                    .toLowerCase()
                : "";


        if (cityTerm) {

            list =
                list.filter(product => {

                    const productCity =
                        String(
                            product.city || ""
                        ).toLowerCase();


                    return productCity.includes(
                        cityTerm
                    );

                });

        }



        // ======================================
        // PREÇO
        // ======================================

        if (maxPrice) {

            const maximumPrice =
                Number(
                    maxPrice.value
                );


            if (
                Number.isFinite(
                    maximumPrice
                )
            ) {

                list =
                    list.filter(product =>
                        Number(
                            product.pricePerDay
                        ) <= maximumPrice
                    );

            }

        }



        // ======================================
        // VERIFICADOS
        // ======================================

        if (
            verifiedOnly &&
            verifiedOnly.checked
        ) {

            list =
                list.filter(product =>
                    product.verified === true
                );

        }



        // ======================================
        // ENTREGA
        // ======================================

        if (
            deliveryOnly &&
            deliveryOnly.checked
        ) {

            list =
                list.filter(product =>
                    product.delivery === true
                );

        }



        // ======================================
        // ORDENAÇÃO
        // ======================================

        if (sort) {

            switch (sort.value) {

                case "low":

                    list.sort(
                        (a, b) =>
                            Number(
                                a.pricePerDay
                            ) -
                            Number(
                                b.pricePerDay
                            )
                    );

                    break;


                case "high":

                    list.sort(
                        (a, b) =>
                            Number(
                                b.pricePerDay
                            ) -
                            Number(
                                a.pricePerDay
                            )
                    );

                    break;


                case "recent":

                default:

                    list.sort(
                        (a, b) => {

                            const dateA =
                                new Date(
                                    a.createdAt || 0
                                ).getTime();


                            const dateB =
                                new Date(
                                    b.createdAt || 0
                                ).getTime();


                            return dateB - dateA;

                        }
                    );

                    break;

            }

        }



        render(list);

    }



    // ==========================================
    // BOTÃO APLICAR FILTROS
    // ==========================================

    if (applyFiltersButton) {

        applyFiltersButton.addEventListener(
            "click",
            applyFilters
        );

    }



    // ==========================================
    // BOTÃO BUSCAR
    // ==========================================

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            applyFilters
        );

    }



    // ==========================================
    // ENTER NA BUSCA
    // ==========================================

    if (search) {

        search.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    applyFilters();

                }

            }
        );

    }



    // ==========================================
    // FILTROS EM TEMPO REAL
    // ==========================================

    if (category) {

        category.addEventListener(
            "change",
            applyFilters
        );

    }


    if (sort) {

        sort.addEventListener(
            "change",
            applyFilters
        );

    }


    if (verifiedOnly) {

        verifiedOnly.addEventListener(
            "change",
            applyFilters
        );

    }


    if (deliveryOnly) {

        deliveryOnly.addEventListener(
            "change",
            applyFilters
        );

    }



    // ==========================================
    // CIDADE
    // ==========================================

    if (city) {

        city.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    applyFilters();

                }

            }
        );

    }



    // ==========================================
    // ESCAPAR HTML
    // ==========================================

    function escapeHTML(value) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            String(
                value ?? ""
            );


        return div.innerHTML;

    }



    // ==========================================
    // INICIAR
    // ==========================================

    await loadProducts();

});
