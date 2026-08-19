// ==========================================
// ALUGASE — PRODUTO
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api/products";

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    const productId =
        new URLSearchParams(location.search).get("id");

    if (!productId) {
        location.href = "index.html";
        return;
    }

    const categoryLabel =
        document.querySelector(".product-category");

    const categoryLink =
        document.querySelector(".product-category-link");

    const breadcrumb =
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

    const deposit =
        document.querySelector("#deposit-total");

    const owner =
        document.querySelector("#owner-name");

    const start =
        document.querySelector("#start-date");

    const end =
        document.querySelector("#end-date");

    const daily =
        document.querySelector("#daily-total");

    const delivery =
        document.querySelector("#delivery-total");

    const total =
        document.querySelector("#rental-total");

    const button =
        document.querySelector("#rental-button");

    let product;

    // =======================================
    // CARREGAR
    // =======================================

    const response = await fetch(`${API}/${productId}`);

    product = await response.json();

    render();

    // =======================================

    function render() {

        document.title = `${product.title} | ALUGASE`;

        categoryLabel.textContent =
            product.category.toUpperCase();

        categoryLink.textContent =
            product.category;

        breadcrumb.textContent =
            product.title;

        title.textContent =
            product.title;

        locationText.textContent =
            `📍 ${product.city}`;

        description.textContent =
            product.description;

        price.textContent =
            `R$ ${product.pricePerDay}`;

        deposit.textContent =
            `R$ ${product.deposit}`;

        deliveryLabel.textContent =
            product.delivery
                ? `+ R$ ${product.deliveryPrice}`
                : "Somente retirada";

        owner.textContent =
            product.ownerName || "Usuário";

        renderGallery();

        const today =
            new Date().toISOString().split("T")[0];

        start.min = today;
        end.min = today;

        start.value = today;
        end.value = today;

        calculate();

    }

    // =======================================
    // GALERIA
    // =======================================

    function renderGallery() {

        thumbnails.innerHTML = "";

        if (!product.images || product.images.length === 0) {

            mainImage.innerHTML =
                `<div class="emoji-image">📦</div>`;

            return;

        }

        changeImage(product.images[0]);

        product.images.forEach((url, index) => {

            const thumb =
                document.createElement("button");

            thumb.className =
                `thumbnail ${index === 0 ? "active" : ""}`;

            thumb.innerHTML =
                `<img src="${url}" alt="">`;

            thumb.onclick = () => {

                document
                    .querySelectorAll(".thumbnail")
                    .forEach(t =>
                        t.classList.remove("active")
                    );

                thumb.classList.add("active");

                changeImage(url);

            };

            thumbnails.appendChild(thumb);

        });

    }

    function changeImage(url) {

        mainImage.innerHTML = `
            <img src="${url}" alt="${product.title}">
        `;

    }

    // =======================================
    // CÁLCULO
    // =======================================

    function daysBetween() {

        const a = new Date(start.value);
        const b = new Date(end.value);

        const d =
            Math.ceil((b - a) / 86400000) + 1;

        return d > 0 ? d : 1;

    }

    function calculate() {

        const days = daysBetween();

        const deliverySelected =
            document.querySelector(
                'input[name="delivery"]:checked'
            ).value === "delivery";

        const deliveryValue =
            deliverySelected && product.delivery
                ? product.deliveryPrice
                : 0;

        const rent =
            days * product.pricePerDay;

        daily.textContent =
            `R$ ${rent}`;

        delivery.textContent =
            `R$ ${deliveryValue}`;

        total.textContent =
            `R$ ${rent + deliveryValue + product.deposit}`;

    }

    start.onchange = () => {

        end.min = start.value;

        if (end.value < start.value)
            end.value = start.value;

        calculate();

    };

    end.onchange = calculate;

    document
        .querySelectorAll('input[name="delivery"]')
        .forEach(r => r.onchange = calculate);

    // =======================================
    // RESERVAR
    // =======================================

    button.onclick = () => {

        if (!user) {
            location.href = "login.html";
            return;
        }

        location.href =
            `reserva.html?id=${product._id}`;

    };

});
