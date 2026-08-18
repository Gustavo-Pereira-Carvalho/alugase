// ==========================================
// ALUGASE — NOVO ANÚNCIO (API ONLINE)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const API = "https://alugase-api.onrender.com/api/products";

    // ==========================================
    // USUÁRIO
    // ==========================================

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    if (!user) {
        alert("Faça login para anunciar.");
        window.location.href = "login.html";
        return;
    }

    // ==========================================
    // FORMULÁRIO
    // ==========================================

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

    // ==========================================
    // VEÍCULOS
    // ==========================================

    const vehicleSection = document.querySelector("#vehicle-section");

    const brand = document.querySelector("#brand");
    const model = document.querySelector("#model");
    const year = document.querySelector("#year");
    const color = document.querySelector("#color");
    const plate = document.querySelector("#plate");
    const renavam = document.querySelector("#renavam");
    const mileage = document.querySelector("#mileage");

    const crlv = document.querySelector("#crlv");
    const selectCRLV = document.querySelector("#select-crlv");
    const crlvName = document.querySelector("#crlv-name");

    // ==========================================
    // IMAGENS
    // ==========================================

    const images = document.querySelector("#images");
    const uploadArea = document.querySelector("#upload-area");
    const previewGrid = document.querySelector("#preview-grid");
    const selectImages = document.querySelector("#select-images");

    // ==========================================
    // RESUMO
    // ==========================================

    const sumPrice = document.querySelector("#sum-price");
    const sumDeposit = document.querySelector("#sum-deposit");
    const sumDelivery = document.querySelector("#sum-delivery");

    let selectedIcon = "📦";

    // ==========================================
    // CATEGORIA
    // ==========================================

    category.addEventListener("change", () => {

        if (category.value === "Veículos") {

            vehicleSection.classList.add("show");
            icon.value = "🚗";

        } else {

            vehicleSection.classList.remove("show");

        }

        selectedIcon = icon.value || "📦";

    });

    icon.addEventListener("change", () => {

        selectedIcon = icon.value;

    });

    // ==========================================
    // RESUMO
    // ==========================================

    function updateSummary() {

        sumPrice.textContent = `R$ ${price.value || 0}`;
        sumDeposit.textContent = `R$ ${deposit.value || 0}`;

        sumDelivery.textContent = delivery.checked
            ? `R$ ${deliveryPrice.value || 0}`
            : "Não disponível";

    }

    [price, deposit, deliveryPrice].forEach(input =>
        input.addEventListener("input", updateSummary)
    );

    pickup.addEventListener("change", updateSummary);
    delivery.addEventListener("change", updateSummary);

    updateSummary();

    // ==========================================
    // PREVIEW IMAGENS
    // ==========================================

    selectImages.onclick = () => images.click();
    uploadArea.onclick = () => images.click();

    images.addEventListener("change", () => {

        previewGrid.innerHTML = "";

        const files = [...images.files];

        if (!files.length) return;

        files.forEach(file => {

            const reader = new FileReader();

            reader.onload = e => {

                const div = document.createElement("div");

                div.className = "preview-item";

                div.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                `;

                previewGrid.appendChild(div);

            };

            reader.readAsDataURL(file);

        });

    });

    // ==========================================
    // CRLV
    // ==========================================

    selectCRLV.onclick = () => crlv.click();

    crlv.onchange = () => {

        crlvName.textContent = crlv.files.length
            ? crlv.files[0].name
            : "Nenhum arquivo selecionado";

    };

    // ==========================================
    // MÁSCARAS
    // ==========================================

    plate.addEventListener("input", () => {

        plate.value = plate.value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 7);

    });

    renavam.addEventListener("input", () => {

        renavam.value = renavam.value
            .replace(/\D/g, "")
            .slice(0, 11);

    });

    // ==========================================
    // PUBLICAR
    // ==========================================

    form.addEventListener("submit", async e => {

        e.preventDefault();

        if (!user.identityVerified) {

            alert("Verifique sua identidade antes de anunciar.");

            window.location.href = "perfil.html";

            return;

        }

        if (category.value === "Veículos") {

            if (!user.driverLicenseVerified) {

                alert("É necessário possuir uma CNH verificada.");

                return;

            }

            if (
                !brand.value ||
                !model.value ||
                !year.value ||
                !color.value ||
                !plate.value ||
                renavam.value.length !== 11 ||
                !mileage.value ||
                !crlv.files.length
            ) {

                alert("Preencha toda a documentação do veículo.");

                return;

            }

        }

        const product = {

            ownerId: user._id,
            ownerName: user.name,

            title: title.value.trim(),
            category: category.value,
            description: description.value.trim(),
            city: city.value.trim(),

            pricePerDay: Number(price.value),
            deposit: Number(deposit.value),

            pickup: pickup.checked,
            delivery: delivery.checked,

            deliveryPrice: delivery.checked
                ? Number(deliveryPrice.value)
                : 0,

            image: selectedIcon,

            verified: true,
            status: "available",
            rating: 5.0,

            vehicle: category.value === "Veículos"
                ? {
                    brand: brand.value,
                    model: model.value,
                    year: Number(year.value),
                    color: color.value,
                    plate: plate.value,
                    renavam: renavam.value,
                    mileage: Number(mileage.value),
                    crlv: crlv.files[0].name
                }
                : null

        };

        try {

            const response = await fetch(API, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(product)

            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao publicar anúncio.");
            }

            alert("Anúncio publicado com sucesso!");

            window.location.href = "perfil.html";

        } catch (error) {

            alert(error.message);

        }

    });

});