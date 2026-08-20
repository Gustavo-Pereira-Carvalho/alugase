// ==========================================
// ALUGASE — PAGAMENTO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const API =
            "https://alugase-api.onrender.com/api";


        // ======================================
        // ELEMENTOS
        // ======================================

        const loading =
            document.querySelector(
                "#loading"
            );

        const checkout =
            document.querySelector(
                "#checkout"
            );

        const errorState =
            document.querySelector(
                "#error-state"
            );

        const errorMessage =
            document.querySelector(
                "#error-message"
            );

        const productSummary =
            document.querySelector(
                "#product-summary"
            );

        const rentTotal =
            document.querySelector(
                "#rent-total"
            );

        const deliveryPrice =
            document.querySelector(
                "#delivery-price"
            );

        const deposit =
            document.querySelector(
                "#deposit"
            );

        const total =
            document.querySelector(
                "#total"
            );

        const startDate =
            document.querySelector(
                "#start-date"
            );

        const endDate =
            document.querySelector(
                "#end-date"
            );

        const days =
            document.querySelector(
                "#days"
            );

        const paymentBrick =
            document.querySelector(
                "#paymentBrick_container"
            );

        const paymentResult =
            document.querySelector(
                "#payment-result"
            );


        // ======================================
        // USUÁRIO
        // ======================================

        const user =
            JSON.parse(
                localStorage.getItem(
                    "alugase_user"
                )
            );


        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        // ======================================
        // ID DO ALUGUEL
        // ======================================

        const params =
            new URLSearchParams(
                window.location.search
            );


        const rentalId =
            params.get("id");


        if (!rentalId) {

            showError(
                "Aluguel não informado."
            );

            return;

        }


        // ======================================
        // FORMATAR DINHEIRO
        // ======================================

        function money(value) {

            return Number(
                value || 0
            ).toLocaleString(
                "pt-BR",
                {
                    style:
                        "currency",

                    currency:
                        "BRL"
                }
            );

        }


        // ======================================
        // FORMATAR DATA
        // ======================================

        function formatDate(date) {

            return new Date(
                date
            ).toLocaleDateString(
                "pt-BR"
            );

        }


        // ======================================
        // MOSTRAR ERRO
        // ======================================

        function showError(message) {

            loading.style.display =
                "none";

            checkout.style.display =
                "none";

            errorState.style.display =
                "block";

            errorMessage.textContent =
                message;

        }


        // ======================================
        // CARREGAR CHECKOUT
        // ======================================

        async function loadCheckout() {

            try {

                const response =
                    await fetch(
                        `${API}/payments/checkout/${rentalId}`
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Não foi possível carregar o pagamento."
                    );

                }


                // ==================================
                // RESUMO
                // ==================================

                const rental =
                    data.rental;


                const product =
                    data.product;


                productSummary.innerHTML = `

                    ${
                        product?.image

                        ? `
                            <img
                                src="${product.image}"
                                alt="${escapeHtml(
                                    product.title
                                )}"
                            >
                        `

                        : `
                            <div class="product-placeholder">
                                📦
                            </div>
                        `
                    }

                    <div class="product-summary-info">

                        <h3>
                            ${escapeHtml(
                                product?.title ||
                                "Produto"
                            )}
                        </h3>

                        <p>
                            📍 ${
                                escapeHtml(
                                    product?.city ||
                                    "Local não informado"
                                )
                            }
                        </p>

                    </div>

                `;


                rentTotal.textContent =
                    money(
                        rental.rentTotal
                    );


                deliveryPrice.textContent =
                    money(
                        rental.deliveryPrice
                    );


                deposit.textContent =
                    money(
                        rental.deposit
                    );


                total.textContent =
                    money(
                        rental.total
                    );


                startDate.textContent =
                    formatDate(
                        rental.startDate
                    );


                endDate.textContent =
                    formatDate(
                        rental.endDate
                    );


                days.textContent =
                    `${rental.days} dia${
                        rental.days === 1
                            ? ""
                            : "s"
                    }`;


                // ==================================
                // MOSTRAR CHECKOUT
                // ==================================

                loading.style.display =
                    "none";

                checkout.style.display =
                    "block";


                // ==================================
                // MERCADO PAGO
                // ==================================

                await renderPaymentBrick(
                    data.publicKey,
                    rental,
                    data.renter
                );


            } catch (error) {

                console.error(
                    "ERRO:",
                    error
                );

                showError(
                    error.message ||
                    "Erro ao carregar pagamento."
                );

            }

        }


        // ======================================
        // ESCAPAR HTML
        // ======================================

        function escapeHtml(value) {

            const div =
                document.createElement(
                    "div"
                );

            div.textContent =
                value || "";

            return div.innerHTML;

        }


        // ======================================
        // RENDERIZAR BRICK
        // ======================================

        async function renderPaymentBrick(
            publicKey,
            rental,
            renter
        ) {

            if (
                !publicKey
            ) {

                throw new Error(
                    "Public Key do Mercado Pago não configurada."
                );

            }


            if (
                typeof MercadoPago ===
                "undefined"
            ) {

                throw new Error(
                    "Mercado Pago não foi carregado."
                );

            }


            const mp =
                new MercadoPago(
                    publicKey
                );


            const bricksBuilder =
                mp.bricks();


            const settings = {

                initialization: {

                    amount:
                        Number(
                            rental.total
                        ),

                    payer: {

                        email:
                            renter?.email ||
                            ""

                    }

                },


                customization: {

                    paymentMethods: {

                        creditCard:
                            "all",

                        debitCard:
                            "all",

                        prepaidCard:
                            "all",

                        ticket:
                            "all",

                        bankTransfer:
                            "all",

                        mercadoPago:
                            "all"

                    }

                },


                callbacks: {

                    onReady: () => {

                        console.log(
                            "✅ Mercado Pago Brick pronto."
                        );

                    },


                    onSubmit: async ({
                        selectedPaymentMethod,
                        formData
                    }) => {

                        return new Promise(
                            async (
                                resolve,
                                reject
                            ) => {

                                try {

                                    console.log(
                                        "Método:",
                                        selectedPaymentMethod
                                    );


                                    const response =
                                        await fetch(
                                            `${API}/payments/process`,
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
                                                            rental.id,

                                                        ...formData

                                                    })

                                            }
                                        );


                                    const result =
                                        await response.json();


                                    if (
                                        !response.ok
                                    ) {

                                        throw new Error(
                                            result.error ||
                                            "Pagamento recusado."
                                        );

                                    }


                                    console.log(
                                        "Pagamento:",
                                        result
                                    );


                                    // ==========================
                                    // APROVADO
                                    // ==========================

                                    if (
                                        result.payment?.status ===
                                        "approved"
                                    ) {

                                        showPaymentResult({

                                            title:
                                                "Pagamento confirmado!",

                                            message:
                                                "Seu pagamento foi aprovado. O aluguel foi confirmado."

                                        });

                                    }


                                    // ==========================
                                    // PENDENTE
                                    // ==========================

                                    else {

                                        showPaymentResult({

                                            title:
                                                "Pagamento em análise",

                                            message:
                                                getPaymentMessage(
                                                    result.payment?.status
                                                )

                                        });

                                    }


                                    resolve();

                                } catch (error) {

                                    console.error(
                                        "ERRO NO PAGAMENTO:",
                                        error
                                    );


                                    alert(
                                        error.message ||
                                        "Não foi possível processar o pagamento."
                                    );


                                    reject();

                                }

                            }
                        );

                    },


                    onError: (error) => {

                        console.error(
                            "ERRO MERCADO PAGO:",
                            error
                        );

                    }

                }

            };


            window.paymentBrickController =
                await bricksBuilder.create(

                    "payment",

                    "paymentBrick_container",

                    settings

                );

        }


        // ======================================
        // MENSAGEM DO PAGAMENTO
        // ======================================

        function getPaymentMessage(status) {

            switch (status) {

                case "pending":
                    return "Seu pagamento está pendente. Aguarde a confirmação.";

                case "in_process":
                    return "Seu pagamento está sendo analisado pelo Mercado Pago.";

                case "rejected":
                    return "O pagamento foi recusado. Você pode tentar novamente.";

                default:
                    return "O pagamento foi recebido e está sendo processado.";

            }

        }


        // ======================================
        // RESULTADO
        // ======================================

        function showPaymentResult({

            title,
            message

        }) {

            paymentBrick.style.display =
                "none";

            paymentResult.style.display =
                "block";


            document.querySelector(
                "#result-title"
            ).textContent =
                title;


            document.querySelector(
                "#result-message"
            ).textContent =
                message;

        }


        // ======================================
        // INICIAR
        // ======================================

        await loadCheckout();

    }
);
