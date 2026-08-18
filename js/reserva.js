// ==========================================
// ALUGASE — RESERVA (API ONLINE)
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API_PRODUCTS = "https://alugase-api.onrender.com/api/products";
    const API_RENTALS = "https://alugase-api.onrender.com/api/rentals";

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    if (!user) {
        alert("Faça login para continuar.");
        window.location.href = "login.html";
        return;
    }

    const productId = new URLSearchParams(window.location.search).get("id");

    if (!productId) {
        window.location.href = "index.html";
        return;
    }

    // ==========================
    // ELEMENTOS
    // ==========================

    const startDate = document.querySelector("#start-date");
    const endDate = document.querySelector("#end-date");

    const deliveryOptions = document.querySelectorAll(
        'input[name="delivery"]'
    );

    const dailyPrice = document.querySelector("#daily-price");
    const daysEl = document.querySelector("#days");
    const rentTotal = document.querySelector("#rent-total");
    const deliveryTotal = document.querySelector("#delivery-total");
    const depositTotal = document.querySelector("#deposit-total");
    const grandTotal = document.querySelector("#grand-total");

    const notes = document.querySelector("#notes");

    let product;

    // ==========================
    // CARREGAR PRODUTO
    // ==========================

    async function loadProduct() {

        try {

            const response = await fetch(`${API_PRODUCTS}/${productId}`);

            if (!response.ok)
                throw new Error();

            product = await response.json();

            fillScreen();

        } catch {

            alert("Produto não encontrado.");
            window.location.href = "index.html";

        }

    }

    // ==========================
    // PREENCHER TELA
    // ==========================

    function fillScreen() {

        document.querySelector("#product-title").textContent =
            product.title;

        document.querySelector("#product-category").textContent =
            product.category.toUpperCase();

        document.querySelector("#product-city").textContent =
            `📍 ${product.city}`;

        document.querySelector("#product-image").textContent =
            product.image || "📦";

        dailyPrice.textContent =
            `R$ ${product.pricePerDay}`;

        depositTotal.textContent =
            `R$ ${product.deposit}`;

        document.querySelector("#delivery-text").textContent =
            product.delivery
                ? `+ R$ ${product.deliveryPrice}`
                : "Entrega indisponível";

        const today = new Date().toISOString().split("T")[0];

        startDate.min = today;
        endDate.min = today;

        startDate.value = today;
        endDate.value = today;

        calculate();

    }

    // ==========================
    // CALCULAR
    // ==========================

    function calculate() {

        const start = new Date(startDate.value);
        const end = new Date(endDate.value);

        let days = Math.ceil(
            (end - start) / (1000 * 60 * 60 * 24)
        ) + 1;

        if (days <= 0 || isNaN(days))
            days = 1;

        const useDelivery =
            document.querySelector(
                'input[name="delivery"]:checked'
            ).value === "delivery";

        const delivery =
            useDelivery && product.delivery
                ? product.deliveryPrice
                : 0;

        const rent = days * product.pricePerDay;

        const total =
            rent + delivery + product.deposit;

        daysEl.textContent = days;
        rentTotal.textContent = `R$ ${rent}`;
        deliveryTotal.textContent = `R$ ${delivery}`;
        grandTotal.textContent = `R$ ${total}`;

        return { days, rent, delivery, total };

    }

    startDate.addEventListener("change", () => {

        endDate.min = startDate.value;

        if (endDate.value < startDate.value)
            endDate.value = startDate.value;

        calculate();

    });

    endDate.addEventListener("change", calculate);

    deliveryOptions.forEach(option =>
        option.addEventListener("change", calculate)
    );

    // ==========================
    // CONFIRMAR RESERVA
    // ==========================

    document
        .querySelector("#confirm-reservation")
        .addEventListener("click", async () => {

            const values = calculate();

            const reservation = {

                productId: product._id,

                ownerId: product.ownerId,

                renterId: user._id,

                startDate: startDate.value,

                endDate: endDate.value,

                delivery:
                    document.querySelector(
                        'input[name="delivery"]:checked'
                    ).value === "delivery",

                notes: notes.value,

                total: values.total

            };

            try {

                const response = await fetch(API_RENTALS, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(reservation)

                });

                const data = await response.json();

                if (!response.ok)
                    throw new Error(data.error);

                alert("Reserva criada com sucesso!");

                // Depois criaremos o chat real
                window.location.href = "perfil.html";

            } catch (error) {

                alert(error.message);

            }

        });

    await loadProduct();

});