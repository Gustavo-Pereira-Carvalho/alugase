// ==========================================
// ALUGASE — PRODUTO
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api/products";

    const user = JSON.parse(
        localStorage.getItem("alugase_user")
    );

    const productId =
        new URLSearchParams(location.search).get("id");

    if (!productId) {
        location.href = "index.html";
        return;
    }

    // ==========================================
    // ELEMENTOS
    // ==========================================

    const categoryLabel =
        document.querySelector(".product-category");

    const categoryLink =
        document.querySelector(".product-category-link");

    const breadcrumbTitle =
        document.querySelector("#breadcrumb-title");

    const title =
        document.querySelector("#product-title");

    const mainImage =
        document.querySelector("#main-image");

    const thumbnails =
        document.querySelector("#product-thumbnails");

    const locationText =
        document.querySelector(".product-location");

    const description =
        document.querySelector(".product-description p");

    const price =
        document.querySelector(".pricing strong");

    const deliveryLabel =
        document.querySelector("#delivery-label");

    const depositTotal =
        document.querySelector("#deposit-total");

    // ==========================================
    // PROPRIETÁRIO
    // ==========================================

    const ownerAvatar =
        document.querySelector("#owner-avatar");

    const ownerPhoto =
        document.querySelector("#owner-photo");

    const ownerInitials =
        document.querySelector("#owner-initials");

    const ownerName =
        document.querySelector("#owner-name");

    const ownerVerification =
        document.querySelector("#owner-verification");

    const ownerRating =
        document.querySelector("#owner-rating");

    const ownerReviews =
        document.querySelector("#owner-reviews");

    // ==========================================
    // ALUGUEL
    // ==========================================

    const startDate =
        document.querySelector("#start-date");

    const endDate =
        document.querySelector("#end-date");

    const dailyTotal =
        document.querySelector("#daily-total");

    const deliveryTotal =
        document.querySelector("#delivery-total");

    const rentalTotal =
        document.querySelector("#rental-total");

    const rentalButton =
        document.querySelector("#rental-button");

    let product;

    // ==========================================
    // CARREGAR PRODUTO
    // ==========================================

    async function loadProduct() {

        try {

            const res =
                await fetch(`${API}/${productId}`);

            if (!res.ok) {

                alert("Produto não encontrado.");

                location.href = "explorar.html";

                return;
            }

            product = await res.json();

            console.log("Produto carregado:", product);

            fillScreen();

        } catch (error) {

            console.error(
                "Erro ao carregar produto:",
                error
            );

            alert(
                "Não foi possível carregar o produto."
            );

        }

    }

    // ==========================================
    // GALERIA
    // ==========================================

    function changeImage(src) {

        mainImage.innerHTML = `
            <img
                src="${src}"
                alt="${product.title}"
            >
        `;

        document
            .querySelectorAll(".thumbnail")
            .forEach(t =>
                t.classList.remove("active")
            );

    }

    function renderGallery() {

        thumbnails.innerHTML = "";

        if (
            product.images &&
            Array.isArray(product.images) &&
            product.images.length
        ) {

            changeImage(product.images[0]);

            product.images.forEach((img, index) => {

                const btn =
                    document.createElement("button");

                btn.className =
                    `thumbnail ${
                        index === 0
                            ? "active"
                            : ""
                    }`;

                btn.type = "button";

                btn.innerHTML = `
                    <img
                        src="${img}"
                        alt="Imagem ${index + 1}"
                    >
                `;

                btn.onclick = () => {

                    changeImage(img);

                    document
                        .querySelectorAll(".thumbnail")
                        .forEach(t =>
                            t.classList.remove("active")
                        );

                    btn.classList.add("active");

                };

                thumbnails.appendChild(btn);

            });

        } else {

            const emoji =
                product.image || "📦";

            mainImage.innerHTML = `
                <div class="emoji-image">
                    ${emoji}
                </div>
            `;

            thumbnails.innerHTML = `
                <button
                    class="thumbnail emoji active"
                    type="button"
                >
                    ${emoji}
                </button>
            `;

        }

    }

    // ==========================================
    // PROPRIETÁRIO
    // ==========================================

    function renderOwner() {

        /*
         * Dependendo de como o backend enviar,
         * podemos encontrar o usuário em:
         *
         * product.owner
         * product.ownerId
         */

        const owner =
            product.owner ||
            (
                product.ownerId &&
                typeof product.ownerId === "object"
                    ? product.ownerId
                    : null
            ) ||
            {};

        // ======================================
        // NOME
        // ======================================

        const name =
            owner.name ||
            product.ownerName ||
            "Usuário";

        ownerName.textContent = name;

        // ======================================
        // INICIAIS
        // ======================================

        const initials =
            name
                .split(" ")
                .filter(Boolean)
                .map(word => word[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

        ownerInitials.textContent =
            initials || "👤";

        // ======================================
        // FOTO
        // ======================================

        const photo =
            owner.profileImage ||
            owner.profilePhoto ||
            owner.photo ||
            product.ownerImage ||
            product.ownerPhoto ||
            "";

        if (photo) {

            ownerPhoto.src = photo;

            ownerPhoto.style.display =
                "block";

            ownerInitials.style.display =
                "none";

            ownerPhoto.onerror = () => {

                ownerPhoto.style.display =
                    "none";

                ownerInitials.style.display =
                    "flex";

            };

        } else {

            ownerPhoto.style.display =
                "none";

            ownerInitials.style.display =
                "flex";

        }

        // ======================================
        // VERIFICAÇÃO
        // ======================================

        if (owner.identityVerified) {

            ownerVerification.innerHTML =
                "✓ Usuário verificado";

            ownerVerification.className =
                "owner-verified";

        } else {

            ownerVerification.textContent =
                "Usuário";

            ownerVerification.className =
                "";

        }

        // ======================================
        // AVALIAÇÕES
        // ======================================

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

        categoryLabel.textContent =
            (
                product.category ||
                "Categoria"
            ).toUpperCase();

        categoryLink.textContent =
            product.category ||
            "Categoria";

        breadcrumbTitle.textContent =
            product.title;

        title.textContent =
            product.title;

        renderGallery();

        // ======================================
        // INFORMAÇÕES
        // ======================================

        locationText.textContent =
            `📍 ${product.city || "Localização não informada"}`;

        description.textContent =
            product.description ||
            "Descrição não informada.";

        price.textContent =
            `R$ ${Number(
                product.pricePerDay || 0
            ).toFixed(2).replace(".", ",")}`;

        // ======================================
        // ENTREGA
        // ======================================

        deliveryLabel.textContent =
            product.delivery
                ? `+ R$ ${Number(
                    product.deliveryPrice || 0
                ).toFixed(2).replace(".", ",")}`
                : "Somente retirada";

        // ======================================
        // CAUÇÃO
        // ======================================

        depositTotal.textContent =
            `R$ ${Number(
                product.deposit || 0
            ).toFixed(2).replace(".", ",")}`;

        // ======================================
        // PROPRIETÁRIO
        // ======================================

        renderOwner();

        // ======================================
        // DATAS
        // ======================================

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        startDate.min = today;
        endDate.min = today;

        startDate.value = today;
        endDate.value = today;

        updateTotals();

    }

    // ==========================================
    // CALCULAR DIÁRIAS
    // ==========================================

    function getDays() {

        const start =
            new Date(startDate.value);

        const end =
            new Date(endDate.value);

        const diff =
            Math.ceil(
                (end - start) / 86400000
            ) + 1;

        return diff > 0
            ? diff
            : 1;

    }

    // ==========================================
    // ATUALIZAR TOTAL
    // ==========================================

    function updateTotals() {

        if (!product) return;

        const days =
            getDays();

        const selectedDelivery =
            document.querySelector(
                'input[name="delivery"]:checked'
            );

        const deliverySelected =
            selectedDelivery &&
            selectedDelivery.value === "delivery";

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
            `R$ ${daily.toFixed(2).replace(".", ",")}`;

        deliveryTotal.textContent =
            `R$ ${deliveryValue.toFixed(2).replace(".", ",")}`;

        rentalTotal.textContent =
            `R$ ${total.toFixed(2).replace(".", ",")}`;

    }

    // ==========================================
    // DATAS
    // ==========================================

    startDate.onchange = () => {

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

    };

    endDate.onchange =
        updateTotals;

    document
        .querySelectorAll(
            'input[name="delivery"]'
        )
        .forEach(radio => {

            radio.onchange =
                updateTotals;

        });

    // ==========================================
    // SOLICITAR ALUGUEL
    // ==========================================

    rentalButton.onclick = () => {

        if (!user) {

            location.href =
                "login.html";

            return;
        }

        location.href =
            `reserva.html?id=${product._id}`;

    };

    // ==========================================
    // INICIAR
    // ==========================================

    await loadProduct();

});
