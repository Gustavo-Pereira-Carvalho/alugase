document.addEventListener("DOMContentLoaded", async () => {

    const API_PRODUCTS = "https://alugase-api.onrender.com/api/products";
    const API_RENTALS = "https://alugase-api.onrender.com/api/rentals";
    const API_CHATS = "https://alugase-api.onrender.com/api/chats";

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    if (!user) {
        alert("Faça login para continuar.");
        window.location.href = "login.html";
        return;
    }

    const productId = new URLSearchParams(location.search).get("id");

    if (!productId) {
        window.location.href = "index.html";
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

    async function loadProduct() {

        const response = await fetch(`${API_PRODUCTS}/${productId}`);

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

    function calculate() {

        const start = new Date(startDate.value);
        const end = new Date(endDate.value);

        let days = Math.ceil(
            (end - start) / 86400000
        ) + 1;

        if (days <= 0) days = 1;

        const rent = days * product.pricePerDay;

        daysEl.textContent = days;
        rentTotal.textContent = `R$ ${rent}`;
        deliveryTotal.textContent = "R$ 0";
        grandTotal.textContent = `R$ ${rent + product.deposit}`;

        return rent + product.deposit;

    }

    startDate.onchange = calculate;
    endDate.onchange = calculate;

    document.querySelector("#confirm-reservation").onclick = async () => {

        const total = calculate();

        await fetch(API_RENTALS, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                productId: product._id,
                ownerId: product.ownerId,
                renterId: user._id,

                startDate: startDate.value,
                endDate: endDate.value,

                total,
                notes: notes.value

            })

        });

        const chatResponse = await fetch(API_CHATS, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                productId: product._id,

                ownerId: product.ownerId,
                renterId: user._id,

                ownerName: product.ownerName,
                renterName: user.name,
                productTitle: product.title

            })

        });

        const chat = await chatResponse.json();

        alert("Reserva criada com sucesso!");

        window.location.href = `chat.html?chat=${chat._id}`;

    };

    await loadProduct();

});