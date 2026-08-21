// ==========================================
// ALUGASE — CONFIRMAÇÃO DE RESERVA
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // ==========================================
        // API
        // ==========================================

        const API =
            "https://alugase-api.onrender.com/api";


        // ==========================================
        // USUÁRIO
        // ==========================================

        const user =
            JSON.parse(
                localStorage.getItem(
                    "alugase_user"
                )
            );


        if (!user) {

            alert(
                "Faça login para continuar."
            );

            location.href =
                "login.html";

            return;

        }


        // ==========================================
        // PARÂMETROS DA URL
        // ==========================================

        const params =
            new URLSearchParams(
                location.search
            );


        const productId =
            params.get("id");


        const selectedStart =
            params.get("start");


        const selectedEnd =
            params.get("end");


        const selectedDelivery =
            params.get("delivery") ||
            "pickup";


        if (!productId) {

            location.href =
                "index.html";

            return;

        }


        // ==========================================
        // ELEMENTOS
        // ==========================================

        const startDate =
            document.querySelector(
                "#start-date"
            );


        const endDate =
            document.querySelector(
                "#end-date"
            );


        const dailyPrice =
            document.querySelector(
                "#daily-price"
            );


        const daysEl =
            document.querySelector(
                "#days"
            );


        const rentTotal =
            document.querySelector(
                "#rent-total"
            );


        const deliveryTotal =
            document.querySelector(
                "#delivery-total"
            );


        const deliveryText =
            document.querySelector(
                "#delivery-text"
            );


        const depositTotal =
            document.querySelector(
                "#deposit-total"
            );


        const grandTotal =
            document.querySelector(
                "#grand-total"
            );


        const notes =
            document.querySelector(
                "#notes"
            );


        const confirmButton =
            document.querySelector(
                "#confirm-reservation"
            );


        // ==========================================
        // PRODUTO
        // ==========================================

        let product = null;


        // ==========================================
        // FORMATAR DINHEIRO
        // ==========================================

        function money(value) {

            return Number(
                value || 0
            ).toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

        }


        // ==========================================
        // CARREGAR PRODUTO
        // ==========================================

        async function loadProduct() {

            try {

                const response =
                    await fetch(
                        `${API}/products/${productId}`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Produto não encontrado."
                    );

                }


                product =
                    await response.json();


                // ======================================
                // PRODUTO
                // ======================================

                document.querySelector(
                    "#product-title"
                ).textContent =
                    product.title ||
                    "Produto";


                document.querySelector(
                    "#product-category"
                ).textContent =
                    product.category ||
                    "Produto";


                document.querySelector(
                    "#product-city"
                ).textContent =
                    `📍 ${
                        product.city ||
                        "Local não informado"
                    }`;


                // ======================================
                // IMAGEM
                // ======================================

                const productImage =
                    document.querySelector(
                        "#product-image"
                    );


                if (
                    Array.isArray(product.images) &&
                    product.images.length > 0
                ) {

                    productImage.innerHTML = `

                        <img
                            src="${product.images[0]}"
                            alt="${product.title || "Produto"}"
                        >

                    `;

                }

                else if (product.image) {

                    productImage.innerHTML = `

                        <img
                            src="${product.image}"
                            alt="${product.title || "Produto"}"
                        >

                    `;

                }

                else {

                    productImage.textContent =
                        "📦";

                }


                // ======================================
                // PREÇO
                // ======================================

                dailyPrice.textContent =
                    money(
                        product.pricePerDay
                    );


                depositTotal.textContent =
                    money(
                        product.deposit
                    );


                // ======================================
                // ENTREGA
                // ======================================

                if (
                    product.delivery
                ) {

                    deliveryText.textContent =
                        `+ ${money(
                            product.deliveryPrice
                        )}`;

                }

                else {

                    deliveryText.textContent =
                        "Indisponível";

                    const deliveryRadio =
                        document.querySelector(
                            'input[name="delivery"][value="delivery"]'
                        );


                    if (deliveryRadio) {

                        deliveryRadio.disabled =
                            true;

                    }

                }


                // ======================================
                // DATAS
                // ======================================

                const today =
                    new Date()
                        .toISOString()
                        .split("T")[0];


                startDate.min =
                    today;


                endDate.min =
                    selectedStart ||
                    today;


                // ======================================
                // RECUPERAR DATAS DO PRODUTO
                // ======================================

                if (
                    selectedStart
                ) {

                    startDate.value =
                        selectedStart;

                }

                else {

                    startDate.value =
                        today;

                }


                if (
                    selectedEnd &&
                    selectedEnd >= startDate.value
                ) {

                    endDate.value =
                        selectedEnd;

                }

                else {

                    endDate.value =
                        startDate.value;

                }


                // ======================================
                // RECUPERAR ENTREGA
                // ======================================

                const deliveryRadio =
                    document.querySelector(
                        `input[name="delivery"][value="${selectedDelivery}"]`
                    );


                if (
                    deliveryRadio &&
                    !deliveryRadio.disabled
                ) {

                    deliveryRadio.checked =
                        true;

                }

                else {

                    const pickupRadio =
                        document.querySelector(
                            'input[name="delivery"][value="pickup"]'
                        );


                    if (pickupRadio) {

                        pickupRadio.checked =
                            true;

                    }

                }


                // ======================================
                // CALCULAR
                // ======================================

                calculate();


            } catch (error) {

                console.error(
                    "Erro ao carregar produto:",
                    error
                );


                alert(
                    "Não foi possível carregar o produto."
                );


                location.href =
                    "explorar.html";

            }

        }


        // ==========================================
        // CALCULAR DIAS
        // ==========================================

        function calculateDays() {

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
                    (
                        end -
                        start
                    ) /
                    86400000
                );


            if (
                difference < 0
            ) {

                return 1;

            }


            return difference + 1;

        }


        // ==========================================
        // CALCULAR RESERVA
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
                calculateDays();


            const selected =
                document.querySelector(
                    'input[name="delivery"]:checked'
                );


            const useDelivery =
                selected?.value ===
                "delivery";


            const delivery =
                useDelivery &&
                product.delivery
                    ? Number(
                        product.deliveryPrice || 0
                    )
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
                days *
                pricePerDay;


            const total =
                rent +
                delivery +
                deposit;


            // ======================================
            // ATUALIZAR TELA
            // ======================================

            daysEl.textContent =
                days;


            rentTotal.textContent =
                money(
                    rent
                );


            deliveryTotal.textContent =
                money(
                    delivery
                );


            depositTotal.textContent =
                money(
                    deposit
                );


            grandTotal.textContent =
                money(
                    total
                );


            return {

                days,

                delivery,

                rent,

                deposit,

                total

            };

        }


        // ==========================================
        // ALTERAR DATA DE RETIRADA
        // ==========================================

        startDate.addEventListener(
            "change",
            () => {

                endDate.min =
                    startDate.value;


                if (
                    endDate.value <
                    startDate.value
                ) {

                    endDate.value =
                        startDate.value;

                }


                calculate();

            }
        );


        // ==========================================
        // ALTERAR DATA DE DEVOLUÇÃO
        // ==========================================

        endDate.addEventListener(
            "change",
            () => {

                if (
                    endDate.value <
                    startDate.value
                ) {

                    endDate.value =
                        startDate.value;

                }


                calculate();

            }
        );


        // ==========================================
        // ALTERAR ENTREGA
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

                // ==================================
                // EVITAR CLIQUE DUPLO
                // ==================================

                if (
                    confirmButton.disabled
                ) {

                    return;

                }


                // ==================================
                // VALIDAR DATAS
                // ==================================

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

                confirmButton.disabled =
                    true;


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

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        productId:
                                            product._id,

                                        renterId:
                                            user._id,

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
                                            notes?.value ||
                                            ""

                                    })

                            }
                        );


                    const rentalData =
                        await rentalResponse.json();


                    if (
                        !rentalResponse.ok
                    ) {

                        throw new Error(
                            rentalData.error ||
                            "Não foi possível criar a solicitação."
                        );

                    }


                    const rental =
                        rentalData;


                    console.log(
                        "✅ ALUGUEL CRIADO:",
                        rental
                    );


                    // ==================================
                    // 2. CRIAR CHAT
                    // ==================================

                    const chatResponse =
                        await fetch(
                            `${API}/chats`,
                            {

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        rentalId:
                                            rental._id,

                                        productId:
                                            product._id,

                                        ownerId:
                                            product.ownerId,

                                        renterId:
                                            user._id,

                                        productTitle:
                                            product.title

                                    })

                            }
                        );


                    const chatData =
                        await chatResponse.json();


                    if (
                        !chatResponse.ok
                    ) {

                        console.warn(
                            "Chat não foi criado:",
                            chatData
                        );

                    }


                    // ==================================
                    // SUCESSO
                    // ==================================

                    alert(
                        "Solicitação enviada com sucesso!"
                    );


                    // ==================================
                    // IR PARA CHAT
                    // ==================================

                    if (
                        chatData?._id
                    ) {

                        location.href =
                            `chat.html?chat=${chatData._id}`;

                    }

                    else {

                        location.href =
                            "perfil.html";

                    }


                } catch (error) {

                    console.error(
                        "ERRO AO CRIAR RESERVA:",
                        error
                    );


                    alert(
                        error.message ||
                        "Não foi possível enviar a solicitação."
                    );


                    // ==================================
                    // REATIVAR BOTÃO
                    // ==================================

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

    }
);
