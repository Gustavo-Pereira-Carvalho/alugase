// ==========================================
// ALUGASE — HOME
// API ONLINE
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    // ==========================================
    // APIs
    // ==========================================

    const API =
        "https://alugase-api.onrender.com/api/products";

    const NOTIFICATION_API =
        "https://alugase-api.onrender.com/api/notifications";


    // ==========================================
    // ELEMENTOS DA PÁGINA
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
    // NAVBAR DESKTOP
    // ==========================================

    const loginButton =
        document.querySelector("#login-button");

    const announceButton =
        document.querySelector("#announce-button");

    const notificationButton =
        document.querySelector("#notification-button");

    const notificationBadge =
        document.querySelector("#notification-badge");


    // ==========================================
    // NAVBAR MOBILE
    // ==========================================

    const mobileMenuButton =
        document.querySelector("#mobile-menu-button");

    const mobileMenu =
        document.querySelector("#mobile-menu");

    const mobileLogin =
        document.querySelector("#mobile-login");

    const mobileProfile =
        document.querySelector("#mobile-profile");


    // ==========================================
    // USUÁRIO
    // ==========================================

    let user = null;

    try {

        const savedUser =
            localStorage.getItem("alugase_user");

        if (savedUser) {

            user = JSON.parse(savedUser);

        }

    } catch (error) {

        console.error(
            "Erro ao ler usuário:",
            error
        );

        user = null;

    }


    // ==========================================
    // MENU MOBILE
    // ==========================================

    if (mobileMenuButton && mobileMenu) {

        mobileMenuButton.addEventListener(
            "click",
            () => {

                mobileMenu.classList.toggle("active");

                const aberto =
                    mobileMenu.classList.contains("active");


                // Atualiza acessibilidade

                mobileMenuButton.setAttribute(
                    "aria-expanded",
                    aberto ? "true" : "false"
                );


                // Troca o ícone

                mobileMenuButton.textContent =
                    aberto ? "✕" : "☰";

            }
        );

    }


    // ==========================================
    // FECHAR MENU AO CLICAR EM UM LINK
    // ==========================================

    if (mobileMenu) {

        const mobileLinks =
            mobileMenu.querySelectorAll("a");

        mobileLinks.forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    mobileMenu.classList.remove("active");

                    if (mobileMenuButton) {

                        mobileMenuButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                        mobileMenuButton.textContent =
                            "☰";

                    }

                }
            );

        });

    }


    // ==========================================
    // LOGIN / PERFIL MOBILE
    // ==========================================

    if (user) {

        // Usuário logado

        if (mobileLogin) {

            mobileLogin.style.display =
                "none";

        }


        if (mobileProfile) {

            mobileProfile.style.display =
                "flex";

        }

    } else {

        // Usuário não logado

        if (mobileLogin) {

            mobileLogin.style.display =
                "flex";

        }


        if (mobileProfile) {

            mobileProfile.style.display =
                "none";

        }

    }


    // ==========================================
    // PRODUTOS
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


        products.forEach(product => {

            const card =
                document.createElement("article");


            card.className =
                "product-card";


            const price =
                Number(
                    product.pricePerDay || 0
                );


            // ==========================================
            // IMAGEM
            // ==========================================

            let imageHTML = "📦";


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
            // CARD
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
                        📍 ${product.city || "Localização não informada"}
                    </p>


                    <strong>
                        R$ ${price
                            .toFixed(2)
                            .replace(".", ",")
                        }/dia
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
    // BUSCA → EXPLORAR
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
    // LOGIN DESKTOP
    // ==========================================

    if (loginButton) {

        loginButton.textContent =
            user
                ? "Meu Perfil"
                : "Entrar";


        loginButton.addEventListener(
            "click",
            () => {

                if (user) {

                    window.location.href =
                        "perfil.html";

                } else {

                    window.location.href =
                        "login.html";

                }

            }
        );

    }


    // ==========================================
    // ANUNCIAR DESKTOP
    // ==========================================

    if (announceButton) {

        announceButton.addEventListener(
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
    // NOTIFICAÇÕES
    // ==========================================

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            () => {

                if (!user) {

                    window.location.href =
                        "login.html";

                    return;

                }


                window.location.href =
                    "notificacoes.html";

            }
        );

    }


    // ==========================================
    // CONTADOR DE NOTIFICAÇÕES
    // ==========================================

    async function loadNotificationCount() {

        if (
            !user ||
            !notificationBadge
        ) {

            return;

        }


        // Verifica se existe ID

        if (!user._id) {

            return;

        }


        try {

            const response =
                await fetch(
                    `${NOTIFICATION_API}/user/${user._id}/unread-count`
                );


            if (!response.ok) {

                return;

            }


            const data =
                await response.json();


            const count =
                Number(data.count || 0);


            // Existem notificações

            if (count > 0) {

                notificationBadge.textContent =
                    count > 99
                        ? "99+"
                        : count;


                notificationBadge.style.display =
                    "flex";

            }

            // Nenhuma notificação

            else {

                notificationBadge.textContent =
                    "";

                notificationBadge.style.display =
                    "none";

            }


        } catch (error) {

            console.error(
                "ERRO AO CARREGAR NOTIFICAÇÕES:",
                error
            );

        }

    }


    // ==========================================
    // INICIAR PRODUTOS
    // ==========================================

    await loadProducts();


    // ==========================================
    // INICIAR NOTIFICAÇÕES
    // ==========================================

    await loadNotificationCount();


    // ==========================================
    // ATUALIZAR NOTIFICAÇÕES
    // ==========================================

    setInterval(
        loadNotificationCount,
        5000
    );

});