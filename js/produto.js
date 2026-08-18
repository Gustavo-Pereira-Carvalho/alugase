// ==========================================
// ALUGASE — PRODUTO (API ONLINE)
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api/products";

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    const productId = new URLSearchParams(window.location.search).get("id");

    if (!productId) {
        window.location.href = "index.html";
        return;
    }

    // ==========================================
    // ELEMENTOS
    // ==========================================

    const categoryLabel = document.querySelector(".product-category");
    const categoryLink = document.querySelector(".product-category-link");
    const breadcrumbTitle = document.querySelector("#breadcrumb-title");

    const title = document.querySelector("#product-title");
    const image = document.querySelector("#main-image");

    const locationText = document.querySelector(".product-location");
    const description = document.querySelector(".product-description p");

    const price = document.querySelector(".pricing strong");
    const deliveryLabel = document.querySelector("#delivery-label");
    const depositTotal = document.querySelector("#deposit-total");
    const ownerName = document.querySelector("#owner-name");

    const startDate = document.querySelector("#start-date");
    const endDate = document.querySelector("#end-date");

    const dailyTotal = document.querySelector("#daily-total");
    const deliveryTotal = document.querySelector("#delivery-total");
    const rentalTotal = document.querySelector("#rental-total");

    const rentalButton = document.querySelector("#rental-button");

    let product;

    // ==========================================
    // CARREGAR PRODUTO
    // ==========================================

    async function loadProduct() {

        try {

            const response = await fetch(`${API}/${productId}`);

            if (!response.ok) throw new Error();

            product = await response.json();

            fillScreen();

        } catch (error) {

            console.error(error);

            alert("Produto não encontrado.");

            window.location.href = "explorar.html";

        }

    }

    // ==========================================
    // PREENCHER TELA
    // ==========================================

    function fillScreen() {

        document.title = `${product.title} | ALUGASE`;

        categoryLabel.textContent = product.category.toUpperCase();
        categoryLink.textContent = product.category;
        breadcrumbTitle.textContent = product.title;

        title.textContent = product.title;
        image.textContent = product.image || "📦";

        locationText.textContent = `📍 ${product.city}`;
        description.textContent = product.description;

        price.textContent = `R$ ${product.pricePerDay}`;

        deliveryLabel.textContent = product.delivery
            ? `+ R$ ${product.deliveryPrice}`
            : "Somente retirada";

        depositTotal.textContent = `R$ ${product.deposit}`;

        ownerName.textContent =
            product.ownerName || "Usuário Verificado";

        const today = new Date().toISOString().split("T")[0];

        startDate.min = today;
        endDate.min = today;

        startDate.value = today;
        endDate.value = today;

        updateTotals();

    }

    // ==========================================
    // DIÁRIAS
    // ==========================================

    function getDays() {

        const start = new Date(startDate.value);
        const end = new Date(endDate.value);

        const diff = Math.ceil(
            (end - start) / (1000 * 60 * 60 * 24)
        ) + 1;

        return diff > 0 ? diff : 1;

    }

    function updateTotals() {

        if (!product) return;

        const days = getDays();

        const deliverySelected =
            document.querySelector(
                'input[name="delivery"]:checked'
            )?.value === "delivery";

        const deliveryValue =
            deliverySelected && product.delivery
                ? product.deliveryPrice
                : 0;

        const daily = days * product.pricePerDay;

        dailyTotal.textContent = `R$ ${daily}`;
        deliveryTotal.textContent = `R$ ${deliveryValue}`;
        rentalTotal.textContent =
            `R$ ${daily + deliveryValue + product.deposit}`;

    }

    startDate.addEventListener("change", () => {

        endDate.min = startDate.value;

        if (endDate.value < startDate.value) {
            endDate.value = startDate.value;
        }

        updateTotals();

    });

    endDate.addEventListener("change", updateTotals);

    document
        .querySelectorAll('input[name="delivery"]')
        .forEach(radio =>
            radio.addEventListener("change", updateTotals)
        );

    // ==========================================
    // CONTINUAR PARA RESERVA
    // ==========================================

    rentalButton.addEventListener("click", () => {

        if (!user) {

            alert("Faça login para continuar.");

            window.location.href = "login.html";

            return;

        }

        if (!user.identityVerified) {

            alert("Verifique sua identidade antes de alugar.");

            window.location.href = "perfil.html";

            return;

        }

        if (
            product.category === "Veículos" &&
            !user.driverLicenseVerified
        ) {

            alert("É necessário possuir uma CNH verificada.");

            window.location.href = "perfil.html";

            return;

        }

        window.location.href = `reserva.html?id=${product._id}`;

    });

    // ==========================================

    await loadProduct();

});