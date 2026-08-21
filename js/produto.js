// ==========================================
// ALUGASE — PRODUTO
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    // ==========================================
    // API
    // ==========================================

    const API = "https://alugase-api.onrender.com/api";

    const PRODUCTS_API = `${API}/products`;
    const USERS_API = `${API}/users`;


    // ==========================================
    // USUÁRIO LOGADO
    // ==========================================

    const user =
        JSON.parse(
            localStorage.getItem("alugase_user")
        );


    // ==========================================
    // ID DO PRODUTO
    // ==========================================

    const productId =
        new URLSearchParams(
            window.location.search
        ).get("id");


    if (!productId) {

        window.location.href = "index.html";

        return;

    }


    // ==========================================
    // ELEMENTOS
    // ==========================================

    const categoryLabel =
        document.querySelector(
            ".product-category"
        );

    const categoryLink =
        document.querySelector(
            ".product-category-link"
        );

    const breadcrumbTitle =
        document.querySelector(
            "#breadcrumb-title"
        );


    const title =
        document.querySelector(
            "#product-title"
        );


    const mainImage =
        document.querySelector(
            "#main-image"
        );


    const thumbnails =
        document.querySelector(
            "#product-thumbnails"
        );


    const locationText =
        document.querySelector(
            "#product-location"
        );


    const description =
        document.querySelector(
            "#product-description"
        );


    const productRating =
        document.querySelector(
            "#product-rating"
        );


    const productReviews =
        document.querySelector(
            "#product-reviews"
        );


    const price =
        document.querySelector(
            ".pricing strong"
        );


    const deliveryLabel =
        document.querySelector(
            "#delivery-label"
        );


    const depositTotal =
        document.querySelector(
            "#deposit-total"
        );


    // ==========================================
    // PROPRIETÁRIO
    // ==========================================

    const ownerAvatar =
        document.querySelector(
            "#owner-avatar"
        );


    const ownerName =
        document.querySelector(
            "#owner-name"
        );


    const ownerVerification =
        document.querySelector(
            "#owner-verification"
        );


    const ownerRating =
        document.querySelector(
            "#owner-rating"
        );


    const ownerReviews =
        document.querySelector(
            "#owner-reviews"
        );


    // ==========================================
    // DATAS
    // ==========================================

    const startDate =
        document.querySelector(
            "#start-date"
        );


    const endDate =
        document.querySelector(
            "#end-date"
        );


    // ==========================================
    // RESUMO
    // ==========================================

    const dailyTotal =
        document.querySelector(
            "#daily-total"
        );


    const deliveryTotal =
        document.querySelector(
            "#delivery-total"
        );


    const rentalTotal =
        document.querySelector(
            "#rental-total"
        );


    const rentalButton =
        document.querySelector(
            "#rental-button"
        );


    // ==========================================
    // VARIÁVEIS
    // ==========================================

    let product = null;
    let owner = null;


    // ==========================================
    // FORMATAR DINHEIRO
    // ==========================================

    function formatMoney(value) {

        return Number(value || 0)
            .toLocaleString(
                "pt-BR",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

    }


    // ==========================================
    // CARREGAR PRODUTO
    // ==========================================

    async function loadProduct() {

        try {

            const response =
                await fetch(
                    `${PRODUCTS_API}/${productId}`
                );


            if (!response.ok) {

                throw new Error(
                    "Produto não encontrado."
                );

            }


            product =
                await response.json();


            await loadOwner();


            fillScreen();


        } catch (error) {

            console.error(
                "Erro ao carregar produto:",
                error
            );


            alert(
                "Não foi possível carregar o produto."
            );


            window.location.href =
                "explorar.html";

        }

    }


    // ==========================================
    // CARREGAR PROPRIETÁRIO
    // ==========================================

    async function loadOwner() {

        if (!product.ownerId) {

            return;

        }


        try {

            const ownerId =
                typeof product.ownerId === "object"
                    ? product.ownerId._id
                    : product.ownerId;


            if (!ownerId) {

                return;

            }


            const response =
                await fetch(
                    `${USERS_API}/${ownerId}`
                );


            if (!response.ok) {

                console.warn(
                    "Não foi possível carregar proprietário."
                );

                return;

            }


            owner =
                await response.json();


        } catch (error) {

            console.error(
                "Erro ao carregar proprietário:",
                error
            );

        }

    }


    // ==========================================
    // GALERIA
    // ==========================================

    function changeImage(src) {

        if (!src) {

            return;

        }


        mainImage.innerHTML = `

            <img
                src="${src}"
                alt="${product.title || "Produto"}"
                loading="lazy"
            >

        `;


        document
            .querySelectorAll(".thumbnail")
            .forEach(
                thumbnail =>
                    thumbnail.classList.remove(
                        "active"
                    )
            );

    }


    // ==========================================
    // RENDERIZAR GALERIA
    // ==========================================

    function renderGallery() {

        thumbnails.innerHTML = "";


        if (
            Array.isArray(product.images) &&
            product.images.length > 0
        ) {

            changeImage(
                product.images[0]
            );


            product.images.forEach(
                (image, index) => {

                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type = "button";


                    button.className =
                        `thumbnail ${
                            index === 0
                                ? "active"
                                : ""
                        }`;


                    button.innerHTML = `

                        <img
                            src="${image}"
                            alt="Imagem ${index + 1}"
                            loading="lazy"
                        >

                    `;


                    button.addEventListener(
                        "click",
                        () => {

                            changeImage(image);


                            document
                                .querySelectorAll(
                                    ".thumbnail"
                                )
                                .forEach(
                                    item =>
                                        item.classList
                                            .remove(
                                                "active"
                                            )
                                );


                            button.classList.add(
                                "active"
                            );

                        }
                    );


                    thumbnails.appendChild(
                        button
                    );

                }
            );


        } else {

            mainImage.innerHTML = `

                <div class="emoji-image">
                    📦
                </div>

            `;


            const button =
                document.createElement(
                    "button"
                );


            button.type = "button";

            button.className =
                "thumbnail emoji active";


            button.textContent =
                "📦";


            thumbnails.appendChild(
                button
            );

        }

    }


    // ==========================================
    // FOTO DO PROPRIETÁRIO
    // ==========================================

    function renderOwner() {

        // --------------------------------------
        // SEM PROPRIETÁRIO
        // --------------------------------------

        if (!owner) {

            ownerAvatar.innerHTML =
                "👤";


            ownerName.textContent =
                product.ownerName ||
                "Usuário";


            ownerVerification.textContent =
                "Usuário";


            ownerRating.textContent =
                product.rating || "5.0";


            ownerReviews.textContent =
                product.reviews || "0";


            return;

        }


        // --------------------------------------
        // NOME
        // --------------------------------------

        ownerName.textContent =
            owner.name ||
            product.ownerName ||
            "Usuário";


        // --------------------------------------
        // FOTO
        // --------------------------------------

        if (owner.profileImage) {

            ownerAvatar.innerHTML = `

                <img
                    src="${owner.profileImage}"
                    alt="${owner.name || "Proprietário"}"
                    class="owner-profile-image"
                >

            `;

        } else {

            // ----------------------------------
            // INICIAIS
            // ----------------------------------

            const initials =
                (owner.name || "U")
                    .split(" ")
                    .map(
                        word =>
                            word.charAt(0)
                    )
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();


            ownerAvatar.innerHTML = `
                <span class="owner-initials">
                    ${initials}
                </span>
            `;

        }


        // --------------------------------------
        // VERIFICAÇÃO
        // --------------------------------------

        if (owner.identityVerified) {

            ownerVerification.textContent =
                "✓ Identidade verificada";

            ownerVerification.className =
                "owner-verified";

        } else {

            ownerVerification.textContent =
                "Usuário";

            ownerVerification.className = "";

        }


        // --------------------------------------
        // AVALIAÇÃO
        // --------------------------------------

        ownerRating.textContent =
            owner.rating ||
            product.rating ||
            "5.0";


        ownerReviews.textContent =
            owner.reviews ||
            product.reviews ||
            "0";

    }


    // ==========================================
    // PREENCHER TELA
    // ==========================================

    function fillScreen() {

        document.title =
            `${product.title} | ALUGASE`;


        // --------------------------------------
        // CATEGORIA
        // --------------------------------------

        categoryLabel.textContent =
            (
                product.category ||
                "Produto"
            ).toUpperCase();


        categoryLink.textContent =
            product.category ||
            "Categoria";


        categoryLink.href =
            `explorar.html?categoria=${encodeURIComponent(
                product.category || ""
            )}`;


        // --------------------------------------
        // TÍTULO
        // --------------------------------------

        breadcrumbTitle.textContent =
            product.title;


        title.textContent =
            product.title;


        // --------------------------------------
        // GALERIA
        // --------------------------------------

        renderGallery();


        // --------------------------------------
        // LOCALIZAÇÃO
        // --------------------------------------

        locationText.textContent =
            `📍 ${product.city || "Não informado"}`;


        // --------------------------------------
        // DESCRIÇÃO
        // --------------------------------------

        description.textContent =
            product.description ||
            "Este produto não possui descrição.";


        // --------------------------------------
        // AVALIAÇÃO
        // --------------------------------------

        productRating.textContent =
            product.rating || "5.0";


        productReviews.textContent =
            product.reviews || "0";


        // --------------------------------------
        // PREÇO
        // --------------------------------------

        price.textContent =
            `R$ ${formatMoney(
                product.pricePerDay
            )}`;


        // --------------------------------------
        // ENTREGA
        // --------------------------------------

        if (product.delivery) {

            deliveryLabel.textContent =
                `+ R$ ${formatMoney(
                    product.deliveryPrice
                )}`;

        } else {

            deliveryLabel.textContent =
                "Somente retirada";

        }


        // --------------------------------------
        // CAUÇÃO
        // --------------------------------------

        depositTotal.textContent =
            `R$ ${formatMoney(
                product.deposit
            )}`;


        // --------------------------------------
        // PROPRIETÁRIO
        // --------------------------------------

        renderOwner();


        // --------------------------------------
        // DATAS
        // --------------------------------------

        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        startDate.min =
            today;

        endDate.min =
            today;


        startDate.value =
            today;

        endDate.value =
            today;


        updateTotals();

    }


    // ==========================================
    // CALCULAR DIÁRIAS
    // ==========================================

    function getDays() {

        if (
            !startDate.value ||
            !endDate.value
        ) {

            return 1;

        }


        const start =
            new Date(
                `${startDate.value}T00:00:00`
            );


        const end =
            new Date(
                `${endDate.value}T00:00:00`
            );


        const difference =
            Math.ceil(
                (
                    end - start
                ) /
                86400000
            );


        return difference >= 0
            ? difference + 1
            : 1;

    }


    // ==========================================
    // ATUALIZAR TOTAIS
    // ==========================================

    function updateTotals() {

        if (!product) {

            return;

        }


        const days =
            getDays();


        const selectedDelivery =
            document.querySelector(
                'input[name="delivery"]:checked'
            );


        const deliverySelected =
            selectedDelivery &&
            selectedDelivery.value ===
                "delivery";


        const deliveryValue =
            deliverySelected &&
            product.delivery
                ? Number(
                    product.deliveryPrice || 0
                )
                : 0;


        const daily =
            days *
            Number(
                product.pricePerDay || 0
            );


        const deposit =
            Number(
                product.deposit || 0
            );


        const total =
            daily +
            deliveryValue +
            deposit;


        dailyTotal.textContent =
            `R$ ${formatMoney(daily)}`;


        deliveryTotal.textContent =
            `R$ ${formatMoney(
                deliveryValue
            )}`;


        depositTotal.textContent =
            `R$ ${formatMoney(
                deposit
            )}`;


        rentalTotal.textContent =
            `R$ ${formatMoney(total)}`;

    }


    // ==========================================
    // DATAS
    // ==========================================

    startDate.addEventListener(
        "change",
        () => {

            endDate.min =
                startDate.value;


            if (
                endDate.value <
                startDate.value
            ) {

                endDate.value =
                    startDate.value;

            }


            updateTotals();

        }
    );


    endDate.addEventListener(
        "change",
        updateTotals
    );


    // ==========================================
    // ENTREGA
    // ==========================================

    document
        .querySelectorAll(
            'input[name="delivery"]'
        )
        .forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    updateTotals
                );

            }
        );


    // ==========================================
    // LOGIN
    // ==========================================

    const loginButton =
        document.querySelector(
            "#login-button"
        );


    if (loginButton) {

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
    // ANUNCIAR
    // ==========================================

    const announceButton =
        document.querySelector(
            "#announce-button"
        );


    if (announceButton) {

        announceButton.addEventListener(
            "click",
            () => {

                if (!user) {

                    window.location.href =
                        "login.html";

                    return;

                }


                window.location.href =
                    "novo-anuncio.html";

            }
        );

    }


   // ==========================================
// SOLICITAR ALUGUEL
// ==========================================

rentalButton.addEventListener(
    "click",
    () => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        if (
            !startDate.value ||
            !endDate.value
        ) {

            alert(
                "Escolha o período do aluguel."
            );

            return;

        }


        if (
            endDate.value <
            startDate.value
        ) {

            alert(
                "A data de devolução não pode ser anterior à retirada."
            );

            return;

        }


        // ======================================
        // ENTREGA SELECIONADA
        // ======================================

        const selectedDelivery =
            document.querySelector(
                'input[name="delivery"]:checked'
            );


        const delivery =
            selectedDelivery?.value ===
            "delivery";


        // ======================================
        // IR PARA CONFIRMAÇÃO
        // ======================================

        const params =
            new URLSearchParams({

                id:
                    product._id,

                start:
                    startDate.value,

                end:
                    endDate.value,

                delivery:
                    delivery
                        ? "delivery"
                        : "pickup"

            });


        window.location.href =
            `reserva.html?${params.toString()}`;

    }
);

    // ==========================================
    // INICIAR
    // ==========================================

    await loadProduct();

});
