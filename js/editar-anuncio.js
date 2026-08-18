document.addEventListener("DOMContentLoaded", async () => {

    const API = "http://localhost:3000/api/products";

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) {
        window.location.href = "perfil.html";
        return;
    }

    // ==========================
    // ELEMENTOS
    // ==========================

    const title = document.querySelector("#title");
    const category = document.querySelector("#category");
    const icon = document.querySelector("#icon");
    const description = document.querySelector("#description");
    const city = document.querySelector("#city");

    const price = document.querySelector("#price");
    const deposit = document.querySelector("#deposit");
    const deliveryPrice = document.querySelector("#deliveryPrice");

    const active = document.querySelector("#active");

    const sumPrice = document.querySelector("#sum-price");
    const sumDeposit = document.querySelector("#sum-deposit");
    const sumStatus = document.querySelector("#sum-status");

    // ==========================
    // CARREGAR PRODUTO
    // ==========================

    let product;

    try {

        const response = await fetch(`${API}/${productId}`);

        product = await response.json();

        title.value = product.title;
        category.value = product.category;
        icon.value = product.image;

        description.value = product.description;
        city.value = product.city;

        price.value = product.pricePerDay;
        deposit.value = product.deposit;
        deliveryPrice.value = product.deliveryPrice;

        active.checked = product.status === "available";

        updateSummary();

    } catch {

        alert("Produto não encontrado.");

        window.location.href = "perfil.html";

        return;

    }

    // ==========================
    // RESUMO
    // ==========================

    function money(value) {

        return Number(value).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }

    function updateSummary() {

        sumPrice.textContent = money(price.value);

        sumDeposit.textContent = money(deposit.value);

        sumStatus.textContent =
            active.checked
                ? "Disponível"
                : "Pausado";

    }

    [
        price,
        deposit
    ].forEach(input => {

        input.addEventListener("input", updateSummary);

    });

    active.addEventListener("change", updateSummary);

    // ==========================
    // SALVAR
    // ==========================

    document
        .querySelector("#edit-form")
        .addEventListener("submit", async e => {

            e.preventDefault();

            const updatedProduct = {

                title: title.value,

                category: category.value,

                image: icon.value,

                description: description.value,

                city: city.value,

                pricePerDay: Number(price.value),

                deposit: Number(deposit.value),

                deliveryPrice: Number(deliveryPrice.value),

                status: active.checked
                    ? "available"
                    : "rented"

            };

            try {

                const response = await fetch(
                    `${API}/${productId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(updatedProduct)
                    }
                );

                if (!response.ok)
                    throw new Error();

                alert("Alterações salvas!");

                window.location.href = "perfil.html";

            } catch {

                alert("Erro ao salvar.");

            }

        });

    // ==========================
    // EXCLUIR
    // ==========================

    document
        .querySelector("#delete-btn")
        .addEventListener("click", async () => {

            const confirmar = confirm(
                "Deseja realmente excluir este anúncio?"
            );

            if (!confirmar) return;

            try {

                const response = await fetch(
                    `${API}/${productId}`,
                    {
                        method: "DELETE"
                    }
                );

                if (!response.ok)
                    throw new Error();

                alert("Anúncio excluído!");

                window.location.href = "perfil.html";

            } catch {

                alert("Erro ao excluir.");

            }

        });

});