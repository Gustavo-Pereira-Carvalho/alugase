document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api";

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    if (!user) {
        alert("Faça login para continuar.");
        location.href = "login.html";
        return;
    }

    const productId = new URLSearchParams(location.search).get("id");

    if (!productId) {
        location.href = "index.html";
        return;
    }

    const startDate = document.querySelector("#start-date");
    const endDate = document.querySelector("#end-date");

    const dailyPrice = document.querySelector("#daily-price");
    const daysEl = document.querySelector("#days");
    const rentTotal = document.querySelector("#rent-total");
    const deliveryTotal = document.querySelector("#delivery-total");
    const depositTotal = document.querySelector("#deposit-total");
    const grandTotal = document.querySelector("#grand-total");

    const notes = document.querySelector("#notes");

    let product;

    // ==========================================
    // CARREGAR PRODUTO
    // ==========================================

    async function loadProduct() {

        const response = await fetch(
            `${API}/products/${productId}`
        );

        product = await response.json();

        document.querySelector("#product-title").textContent = product.title;
        document.querySelector("#product-category").textContent = product.category;
        document.querySelector("#product-city").textContent = product.city;
        document.querySelector("#product-image").textContent = product.image;

        dailyPrice.textContent = `R$ ${product.pricePerDay}`;
        depositTotal.textContent = `R$ ${product.deposit}`;

        const today = new Date().toISOString().split("T")[0];

        startDate.min = today;
        endDate.min = today;

        startDate.value = today;
        endDate.value = today;

        calculate();

    }

    // ==========================================
    // CALCULAR
    // ==========================================

    function calculate() {

        const start = new Date(startDate.value);
        const end = new Date(endDate.value);

        let days = Math.ceil(
            (end - start) / 86400000
        ) + 1;

        if (days <= 0) days = 1;

        const useDelivery =
            document.querySelector(
                'input[name="delivery"]:checked'
            )?.value === "delivery";

        const delivery = useDelivery && product.delivery
            ? product.deliveryPrice
            : 0;

        const rent = days * product.pricePerDay;
        const total = rent + delivery + product.deposit;

        daysEl.textContent = days;
        rentTotal.textContent = `R$ ${rent}`;
        deliveryTotal.textContent = `R$ ${delivery}`;
        grandTotal.textContent = `R$ ${total}`;

        return {
            days,
            delivery,
            total
        };

    }

    startDate.onchange = () => {

        endDate.min = startDate.value;

        if (endDate.value < startDate.value) {
            endDate.value = startDate.value;
        }

        calculate();

    };

    endDate.onchange = calculate;

    document
        .querySelectorAll('input[name="delivery"]')
        .forEach(radio => {
            radio.onchange = calculate;
        });

    // ==========================================
    // CONFIRMAR RESERVA
    // ==========================================

    document
        .querySelector("#confirm-reservation")
        .onclick = async () => {

            const values = calculate();

            try {

                // 1. Criar aluguel
                const rentalResponse = await fetch(
                    `${API}/rentals`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            productId: product._id,

                            renterId: user._id,

                            startDate: startDate.value,
                            endDate: endDate.value,

                            days: values.days,

                            delivery: values.delivery > 0,
                            deliveryPrice: values.delivery,

                            total: values.total

                        })

                    }
                );

                if (!rentalResponse.ok) {

                    const err = await rentalResponse.json();
                    throw new Error(err.error);

                }

                const rental = await rentalResponse.json();

                // 2. Criar chat
                const chatResponse = await fetch(
                    `${API}/chats`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            rentalId: rental._id,

                            productId: product._id,

                            ownerId: product.ownerId,
                            renterId: user._id,

                            ownerName: product.ownerName,
                            renterName: user.name,

                            productTitle: product.title

                        })

                    }
                );

                const chat = await chatResponse.json();

                alert("Solicitação enviada com sucesso!");

                location.href =
                    `chat.html?chat=${chat._id}`;

            } catch (err) {

                alert(err.message);

            }

        };

    await loadProduct();

});