// ==========================================
// ALUGASE — RESERVA
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api";

    // ==========================================
    // USUÁRIO
    // ==========================================

    const user = JSON.parse(
        localStorage.getItem("alugase_user")
    );

    if (!user) {

        alert("Faça login para continuar.");

        location.href = "login.html";

        return;

    }


    // ==========================================
    // PARÂMETROS DA URL
    // ==========================================

    const params = new URLSearchParams(
        location.search
    );

    const productId = params.get("id");

    const selectedStart = params.get("start");

    const selectedEnd = params.get("end");


    if (!productId) {

        location.href = "index.html";

        return;

    }


    // ==========================================
    // ELEMENTOS
    // ==========================================

    const startDate =
        document.querySelector("#start-date");

    const endDate =
        document.querySelector("#end-date");

    const dailyPrice =
        document.querySelector("#daily-price");

    const daysEl =
        document.querySelector("#days");

    const rentTotal =
        document.querySelector("#rent-total");

    const deliveryTotal =
        document.querySelector("#delivery-total");

    const depositTotal =
        document.querySelector("#deposit-total");

    const grandTotal =
        document.querySelector("#grand-total");

    const notes =
        document.querySelector("#notes");

    const deliveryText =
        document.querySelector("#delivery-text");

    const confirmButton =
        document.querySelector("#confirm-reservation");


    // ==========================================
    // PRODUTO
    // ==========================================

    let product = null;


    // ==========================================
    // FORMATAR DINHEIRO
    // ==========================================

    function formatMoney(value) {

        return Number(value || 0).toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    }


    // ==========================================
    // CARREGAR PRODUTO
    // ==========================================

    async function loadProduct() {

        try {

            const response = await fetch(
                `${API}/products/${productId}`
            );


            if (!response.ok) {

                throw new Error(
                    "Produto não encontrado."
                );

            }


            product = await response.json();


            // ==================================
            // INFORMAÇÕES DO PRODUTO
            // ==================================

            document.querySelector(
                "#product-title"
            ).textContent =
                product.title || "Produto";


            document.querySelector(
                "#product-category"
            ).textContent =
                product.category || "Produto";


            document.querySelector(
                "#product-city"
            ).textContent =
                `📍 ${product.city || "Não informado"}`;


            // ==================================
            // IMAGEM
            // ==================================

            const imageElement =
                document.querySelector(
                    "#product-image"
                );


            if (
                Array.isArray(product.images) &&
                product.images.length > 0
            ) {

                imageElement.innerHTML = `
                    <img
                        src="${product.images[0]}"
                        alt="${product.title || "Produto"}"
                    >
                `;

            } else if (product.image) {

                imageElement.innerHTML = `
                    <img
                        src="${product.image}"
                        alt="${product.title || "Produto"}"
                    >
                `;

            } else {

                imageElement.textContent = "📦";

            }


            // ==================================
            // PREÇO
            // ==================================

            dailyPrice.textContent =
                `R$ ${formatMoney(product.pricePerDay)}`;


            depositTotal.textContent =
                `R$ ${formatMoney(product.deposit)}`;


            // ==================================
            // ENTREGA
            // ==================================

            if (product.delivery) {

                deliveryText.textContent =
                    `+ R$ ${formatMoney(
                        product.deliveryPrice
                    )}`;

            } else {

                deliveryText.textContent =
                    "Somente retirada";

                const deliveryOption =
                    document.querySelector(
                        'input[name="delivery"][value="delivery"]'
                    );

                if (deliveryOption) {

                    deliveryOption.disabled = true;

                }

            }


            // ==================================
            // DATAS
            // ==================================

            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            startDate.min = today;
            endDate.min = today;


            // IMPORTANTE:
            // Se vieram datas da página produto,
            // usamos elas.

            if (
                selectedStart &&
                selectedStart >= today
            ) {

                startDate.value =
                    selectedStart;

            } else {

                startDate.value =
                    today;

            }


            if (
                selectedEnd &&
                selectedEnd >= startDate.value
            ) {

                endDate.value =
                    selectedEnd;

            } else {

                endDate.value =
                    startDate.value;

            }


            endDate.min =
                startDate.value;


            calculate();


        } catch (error) {

            console.error(
                "Erro ao carregar produto:",
                error
            );


            alert(
                error.message ||
                "Não foi possível carregar o produto."
            );


            location.href =
                "explorar.html";

        }

    }


    // ==========================================
    // CALCULAR DIAS
    // ==========================================

    function getDays() {

        if (
            !startDate.value ||
            !endDate.value
        ) {

            return 1;

        }


        const start =
            new Date(
                `${startDate.value}T00:00:00`
            );


        const end =
            new Date(
                `${endDate.value}T00:00:00`
            );


        const difference =
            Math.ceil(
                (end - start) /
                86400000
            );


        return difference >= 0
            ? difference + 1
            : 1;

    }


    // ==========================================
    // CALCULAR
    // ==========================================

    function calculate() {

        if (!product) {

            return {
                days: 1,
                delivery: 0,
                total: 0
            };

        }


        const days =
            getDays();


        const selectedDelivery =
            document.querySelector(
                'input[name="delivery"]:checked'
            );


        const useDelivery =
            selectedDelivery &&
            selectedDelivery.value === "delivery";


        const delivery =
            useDelivery && product.delivery
                ? Number(product.deliveryPrice || 0)
                : 0;


        const pricePerDay =
            Number(
                product.pricePerDay || 0
            );


        const deposit =
            Number(
                product.deposit || 0
            );


        const rent =
            days * pricePerDay;


        const total =
            rent +
            delivery +
            deposit;


        // ==================================
        // ATUALIZAR TELA
        // ==================================

        daysEl.textContent =
            days;


        rentTotal.textContent =
            `R$ ${formatMoney(rent)}`;


        deliveryTotal.textContent =
            `R$ ${formatMoney(delivery)}`;


        depositTotal.textContent =
            `R$ ${formatMoney(deposit)}`;


        grandTotal.textContent =
            `R$ ${formatMoney(total)}`;


        return {
            days,
            delivery,
            rent,
            deposit,
            total
        };

    }


    // ==========================================
    // DATAS
    // ==========================================

    startDate.addEventListener(
        "change",
        () => {

            endDate.min =
                startDate.value;


            if (
                !endDate.value ||
                endDate.value <
                startDate.value
            ) {

                endDate.value =
                    startDate.value;

            }


            calculate();

        }
    );


    endDate.addEventListener(
        "change",
        () => {

            if (
                endDate.value <
                startDate.value
            ) {

                alert(
                    "A data de devolução não pode ser anterior à retirada."
                );


                endDate.value =
                    startDate.value;

            }


            calculate();

        }
    );


    // ==========================================
    // ENTREGA
    // ==========================================

    document
        .querySelectorAll(
            'input[name="delivery"]'
        )
        .forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    calculate
                );

            }
        );


    // ==========================================
    // CONFIRMAR RESERVA
    // ==========================================

    confirmButton.addEventListener(
        "click",
        async () => {

            if (!product) {

                alert(
                    "Produto ainda não carregado."
                );

                return;

            }


            if (
                !startDate.value ||
                !endDate.value
            ) {

                alert(
                    "Escolha o período do aluguel."
                );

                return;

            }


            if (
                endDate.value <
                startDate.value
            ) {

                alert(
                    "A data de devolução não pode ser anterior à retirada."
                );

                return;

            }


            const values =
                calculate();


            // ==================================
            // DESABILITAR BOTÃO
            // ==================================

            confirmButton.disabled = true;

            confirmButton.textContent =
                "Enviando...";


            try {

                // ==================================
                // 1. CRIAR ALUGUEL
                // ==================================

                const rentalResponse =
                    await fetch(
                        `${API}/rentals`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                productId:
                                    product._id,

                                renterId:
                                    user._id ||
                                    user.id,

                                startDate:
                                    startDate.value,

                                endDate:
                                    endDate.value,

                                days:
                                    values.days,

                                delivery:
                                    values.delivery > 0,

                                deliveryPrice:
                                    values.delivery,

                                total:
                                    values.total,

                                notes:
                                    notes
                                        ? notes.value.trim()
                                        : ""

                            })

                        }
                    );


                const rentalData =
                    await rentalResponse.json();


                if (!rentalResponse.ok) {

                    throw new Error(
                        rentalData.error ||
                        "Não foi possível criar a solicitação."
                    );

                }


                const rental =
                    rentalData;


                // ==================================
                // 2. CRIAR CHAT
                // ==================================

                const chatResponse =
                    await fetch(
                        `${API}/chats`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                rentalId:
                                    rental._id,

                                productId:
                                    product._id,

                                ownerId:
                                    typeof product.ownerId === "object"
                                        ? product.ownerId._id
                                        : product.ownerId,

                                renterId:
                                    user._id ||
                                    user.id,

                                productTitle:
                                    product.title

                            })

                        }
                    );


                const chatData =
                    await chatResponse.json();


                // ==================================
                // CHAT NÃO É OBRIGATÓRIO
                // ==================================

                if (
                    !chatResponse.ok
                ) {

                    console.warn(
                        "Aluguel criado, mas não foi possível criar o chat.",
                        chatData
                    );


                    alert(
                        "Solicitação enviada com sucesso!"
                    );


                    location.href =
                        "solicitacoes.html";

                    return;

                }


                // ==================================
                // FINAL
                // ==================================

                alert(
                    "Solicitação enviada com sucesso!"
                );


                location.href =
                    `chat.html?chat=${chatData._id}`;


            } catch (error) {

                console.error(
                    "Erro ao confirmar reserva:",
                    error
                );


                alert(
                    error.message ||
                    "Ocorreu um erro ao enviar a solicitação."
                );


                confirmButton.disabled =
                    false;


                confirmButton.textContent =
                    "Confirmar solicitação";

            }

        }
    );


    // ==========================================
    // INICIAR
    // ==========================================

    await loadProduct();

});
