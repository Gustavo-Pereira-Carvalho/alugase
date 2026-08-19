// ==========================================
// ALUGASE — PRODUTO (API ONLINE)
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api/products";

    const user = JSON.parse(localStorage.getItem("alugase_user"));
    const productId = new URLSearchParams(location.search).get("id");

    if (!productId) {
        location.href = "index.html";
        return;
    }

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

    async function loadProduct() {

        const response = await fetch(`${API}/${productId}`);

        if (!response.ok) {
            alert("Produto não encontrado.");
            location.href = "explorar.html";
            return;
        }

        product = await response.json();

        fillScreen();

    }

    function fillScreen() {

        document.title = `${product.title} | ALUGASE`;

        categoryLabel.textContent = product.category.toUpperCase();
        categoryLink.textContent = product.category;
        breadcrumbTitle.textContent = product.title;

        title.textContent = product.title;

        // IMAGEM PRINCIPAL
        if (product.images && product.images.length > 0) {

            image.innerHTML = `
                <img src="${product.images[0]}" alt="${product.title}">
            `;

        } else {

            image.innerHTML = `<div class="emoji-image">📦</div>`;

        }

        locationText.textContent = `📍 ${product.city}`;
        description.textContent = product.description;

        price.textContent = `R$ ${product.pricePerDay}`;

        deliveryLabel.textContent = product.delivery
            ? `+ R$ ${product.deliveryPrice}`
            : "Somente retirada";

        depositTotal.textContent = `R$ ${product.deposit}`;

        ownerName.textContent = product.ownerName || "Usuário";

        const today = new Date().toISOString().split("T")[0];

        startDate.min = today;
        endDate.min = today;

        startDate.value = today;
        endDate.value = today;

        updateTotals();

    }

    function getDays() {

        const start = new Date(startDate.value);
        const end = new Date(endDate.value);

        const diff =
            Math.ceil((end - start) / 86400000) + 1;

        return diff > 0 ? diff : 1;

    }

    function updateTotals() {

        const days = getDays();

        const deliverySelected =
            document.querySelector('input[name="delivery"]:checked')?.value === "delivery";

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

    startDate.onchange = () => {

        endDate.min = startDate.value;

        if (endDate.value < startDate.value)
            endDate.value = startDate.value;

        updateTotals();

    };

    endDate.onchange = updateTotals;

    document.querySelectorAll('input[name="delivery"]')
        .forEach(r => r.onchange = updateTotals);

    rentalButton.onclick = () => {

        if (!user) {
            location.href = "login.html";
            return;
        }

        location.href = `reserva.html?id=${product._id}`;

    };

    await loadProduct();

});
