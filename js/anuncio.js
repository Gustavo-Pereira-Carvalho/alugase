// ==========================================
// ALUGASE — NOVO ANÚNCIO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const API = "https://alugase-api.onrender.com/api/products";

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    if (!user) {
        alert("Faça login para anunciar.");
        location.href = "login.html";
        return;
    }

    const form = document.querySelector("#new-product-form");

    const title = document.querySelector("#title");
    const category = document.querySelector("#category");
    const icon = document.querySelector("#icon");
    const description = document.querySelector("#description");
    const city = document.querySelector("#city");

    const price = document.querySelector("#price");
    const deposit = document.querySelector("#deposit");

    const pickup = document.querySelector("#pickup");
    const delivery = document.querySelector("#delivery");
    const deliveryPrice = document.querySelector("#deliveryPrice");

    const images = document.querySelector("#images");
    const previewGrid = document.querySelector("#preview-grid");

    const vehicleSection = document.querySelector("#vehicle-section");

    const brand = document.querySelector("#brand");
    const model = document.querySelector("#model");
    const year = document.querySelector("#year");
    const color = document.querySelector("#color");
    const plate = document.querySelector("#plate");
    const renavam = document.querySelector("#renavam");
    const mileage = document.querySelector("#mileage");

    const crlv = document.querySelector("#crlv");

    const sumPrice = document.querySelector("#sum-price");
    const sumDeposit = document.querySelector("#sum-deposit");
    const sumDelivery = document.querySelector("#sum-delivery");

    // ==========================
    // Categoria
    // ==========================

    category.onchange = () => {

        vehicleSection.classList.toggle(
            "show",
            category.value === "Veículos"
        );

        if (category.value === "Veículos")
            icon.value = "🚗";

    };

    // ==========================
    // Resumo
    // ==========================

    function updateSummary() {

        sumPrice.textContent = `R$ ${price.value || 0}`;

        sumDeposit.textContent = `R$ ${deposit.value || 0}`;

        sumDelivery.textContent =
            delivery.checked
                ? `R$ ${deliveryPrice.value || 0}`
                : "Não disponível";

    }

    [price, deposit, deliveryPrice]
        .forEach(i => i.oninput = updateSummary);

    delivery.onchange = updateSummary;

    updateSummary();

    // ==========================
    // Preview
    // ==========================

    document.querySelector("#select-images")
        .onclick = () => images.click();

    document.querySelector("#upload-area")
        .onclick = () => images.click();

    images.onchange = () => {

        previewGrid.innerHTML = "";

        [...images.files].forEach(file => {

            const reader = new FileReader();

            reader.onload = e => {

                previewGrid.innerHTML += `
                    <div class="preview-item">
                        <img src="${e.target.result}">
                    </div>
                `;

            };

            reader.readAsDataURL(file);

        });

    };

    document.querySelector("#select-crlv")
        .onclick = () => crlv.click();

    document.querySelector("#crlv-name")
        .textContent = "Nenhum arquivo";

    crlv.onchange = () => {

        document.querySelector("#crlv-name")
            .textContent = crlv.files.length
                ? crlv.files[0].name
                : "Nenhum arquivo";

    };

    // ==========================
    // Publicar
    // ==========================

    form.onsubmit = async e => {

        e.preventDefault();

        const formData = new FormData();

        formData.append("ownerId", user._id);
        formData.append("ownerName", user.name);

        formData.append("title", title.value);
        formData.append("category", category.value);
        formData.append("description", description.value);
        formData.append("city", city.value);

        formData.append("pricePerDay", price.value);
        formData.append("deposit", deposit.value);

        formData.append("pickup", pickup.checked);
        formData.append("delivery", delivery.checked);

        formData.append(
            "deliveryPrice",
            delivery.checked
                ? deliveryPrice.value
                : 0
        );

        // imagens
        [...images.files].forEach(file => {

            formData.append("images", file);

        });

        // veículo
        if (category.value === "Veículos") {

            const vehicle = {

                brand: brand.value,
                model: model.value,
                year: Number(year.value),
                color: color.value,
                plate: plate.value,
                renavam: renavam.value,
                mileage: Number(mileage.value)

            };

            formData.append(
                "vehicle",
                JSON.stringify(vehicle)
            );

            if (crlv.files.length)
                formData.append("crlv", crlv.files[0]);

        }

        try {

            const response = await fetch(API, {

                method: "POST",
                body: formData

            });

            const data = await response.json();

            if (!response.ok)
                throw new Error(data.error);

            alert("Anúncio publicado!");

            location.href = "perfil.html";

        } catch (err) {

            alert(err.message);

        }

    };

});
