// ==========================================
// ALUGASE — HOME
// API ONLINE
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API =
        "https://alugase-api.onrender.com/api/products";

    const NOTIFICATION_API =
        "https://alugase-api.onrender.com/api/notifications";


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


    // Navbar
    const loginButton =
        document.querySelector("#login-button");

    const announceButton =
        document.querySelector("#announce-button");

    const notificationButton =
        document.querySelector("#notification-button");

    const notificationBadge =
        document.querySelector("#notification-badge");


    // Menu mobile
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

        user =
            JSON.parse(
                localStorage.getItem("alugase_user")
            );

    } catch (error) {

        console.error(
            "Erro ao ler usuário:",
            error
        );

    }


    // ==========================================
    // MENU MOBILE
    // ==========================================

    function openMobileMenu() {

        if (!mobileMenu || !mobileMenuButton) {
            return;
        }

        mobileMenu.classList.add("active");

        mobileMenuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        mobileMenuButton.setAttribute(
            "aria-label",
            "Fechar menu"
        );

        mobileMenuButton.textContent = "✕";

    }


    function closeMobileMenu() {

        if (!mobileMenu || !mobileMenuButton) {
            return;
        }

        mobileMenu.classList.remove("active");

        mobileMenuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        mobileMenuButton.setAttribute(
            "aria-label",
            "Abrir menu"
        );

        mobileMenuButton.textContent = "☰";

    }


    function toggleMobileMenu() {

        if (!mobileMenu) {
            return;
        }

        if (mobileMenu.classList.contains("active")) {

            closeMobileMenu();

        } else {

            openMobileMenu();

        }

    }


    if (mobileMenuButton) {

        mobileMenuButton.addEventListener(
            "click",
            toggleMobileMenu
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

                    closeMobileMenu();

                }
            );

        });

    }


    // ==========================================
    // FECHAR MENU AO CLICAR FORA
    // ==========================================

    document.addEventListener(
        "click",
        event => {

            if (!mobileMenu || !mobileMenuButton) {
                return;
            }

            if (!mobileMenu.classList.contains("active")) {
                return;
            }

            const clickedInsideMenu =
                mobileMenu.contains(event.target);

            const clickedButton =
                mobileMenuButton.contains(event.target);

            if (
                !clickedInsideMenu &&
                !clickedButton
            ) {

                closeMobileMenu();

            }

        }
    );


    // ==========================================
    // LOGIN / PERFIL MOBILE
    // ==========================================

    if (user) {

        if (mobileLogin) {
            mobileLogin.style.display = "none";
        }

        if (mobileProfile) {
            mobileProfile.style.display = "flex";
        }

    } else {

        if (mobileLogin) {
            mobileLogin.style.display = "flex";
        }

        if (mobileProfile) {
            mobileProfile.style.display = "none";
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
                Number(product.pricePerDay || 0);


            card.innerHTML = `

                <div class="product-image">

                    ${
                        product.image
                            ? `
                                <img
                                    src="${product.image}"
                                    alt="${product.title || "Produto"}"
                                >
                              `
                            : "📦"
                    }

                </div>

                <div class="product-content">

                    <h3>
                        ${product.title || "Produto"}
                    </h3>

                    <p>
                        📍 ${product.city || "Localização não informada"}
                    </p>

                    <strong>
                        R$ ${price.toFixed(2).replace(".", ",")}/dia
                    </strong>

                </div>

            `;


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


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            goToExplore
        );

    }


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

                window.location.href =
                    user
                        ? "perfil.html"
                        : "login.html";

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


            if (count > 0) {

                notificationBadge.textContent =
                    count > 99
                        ? "99+"
                        : count;


                notificationBadge.style.display =
                    "flex";

            } else {

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
    // INICIAR
    // ==========================================

    await loadProducts();

    await loadNotificationCount();


    // Atualiza notificações a cada 5 segundos

    setInterval(
        loadNotificationCount,
        5000
    );

});