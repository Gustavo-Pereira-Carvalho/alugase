// ==========================================
// ALUGASE — PAGAMENTO
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API =
        "https://alugase-api.onrender.com/api";


    // ==========================================
    // ELEMENTOS
    // ==========================================

    const loading =
        document.querySelector("#loading");

    const checkout =
        document.querySelector("#checkout");

    const errorState =
        document.querySelector("#error-state");

    const errorMessage =
        document.querySelector("#error-message");

    const productSummary =
        document.querySelector("#product-summary");

    const rentTotal =
        document.querySelector("#rent-total");

    const deliveryPrice =
        document.querySelector("#delivery-price");

    const deposit =
        document.querySelector("#deposit");

    const total =
        document.querySelector("#total");

    const startDate =
        document.querySelector("#start-date");

    const endDate =
        document.querySelector("#end-date");

    const days =
        document.querySelector("#days");

    const paymentBrick =
        document.querySelector(
            "#paymentBrick_container"
        );

    const paymentResult =
        document.querySelector(
            "#payment-result"
        );


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

        location.href =
            "login.html";

        return;

    }


    // ==========================================
    // ID DO ALUGUEL
    // ==========================================

    const rentalId =
        new URLSearchParams(
            location.search
        ).get("id");


    if (!rentalId) {

        showError(
            "Aluguel não informado."
        );

        return;

    }


    // ==========================================
    // DINHEIRO
    // ==========================================

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


    // ==========================================
    // DATA
    // ==========================================

    function formatDate(date) {

        return new Date(
            date
        ).toLocaleDateString(
            "pt-BR"
        );

    }


    // ==========================================
    // ESCAPAR HTML
    // ==========================================

    function escapeHtml(text) {

        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            text || "";

        return div.innerHTML;

    }


    // ==========================================
    // ERRO
    // ==========================================

    function showError(message) {

        if (loading)
            loading.style.display =
                "none";

        if (checkout)
            checkout.style.display =
                "none";

        if (errorState)
            errorState.style.display =
                "block";

        if (errorMessage)
            errorMessage.textContent =
                message;

    }


    // ==========================================
    // CARREGAR CHECKOUT
    // ==========================================

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
                    "Não foi possível carregar o checkout."
                );

            }


            const rental =
                data.rental;

            const product =
                data.product;


            // ======================================
            // PRODUTO
            // ======================================

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

                            <div
                                class="product-placeholder"
                            >
                                📦
                            </div>

                        `
                }

                <div
                    class="product-summary-info"
                >

                    <h3>
                        ${escapeHtml(
                            product?.title ||
                            "Produto"
                        )}
                    </h3>

                    <p>
                        📍
                        ${escapeHtml(
                            product?.city ||
                            "Cidade não informada"
                        )}
                    </p>

                </div>

            `;


            // ======================================
            // VALORES
            // ======================================

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


            // ======================================
            // DATAS
            // ======================================

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
                    rental.days > 1
                        ? "s"
                        : ""
                }`;


            // ======================================
            // EXIBIR CHECKOUT
            // ======================================

            loading.style.display =
                "none";

            checkout.style.display =
                "block";


            // ======================================
            // MERCADO PAGO
            // ======================================

            await renderBrick(
                data.publicKey,
                rental,
                data.renter
            );


        } catch (err) {

            console.error(
                "❌ ERRO CHECKOUT:",
                err
            );

            showError(
                err.message ||
                "Erro ao carregar checkout."
            );

        }

    }


    // ==========================================
    // MERCADO PAGO BRICK
    // ==========================================

    async function renderBrick(
        publicKey,
        rental,
        renter
    ) {

        try {

            const mp =
                new MercadoPago(
                    publicKey
                );


            const bricks =
                mp.bricks();


            await bricks.create(
                "payment",
                "paymentBrick_container",
                {

                    // ==================================
                    // INICIALIZAÇÃO
                    // ==================================

                    initialization: {

                        amount:
                            Number(
                                Number(
                                    rental.total ||
                                    0
                                ).toFixed(2)
                            ),

                        payer: {

                            email:
                                renter?.email ||
                                user.email ||
                                ""

                        }

                    },


                    // ==================================
                    // CUSTOMIZAÇÃO
                    // ==================================

                    customization: {

                        visual: {

                            hideFormTitle:
                                false

                        },

                        paymentMethods: {

                            maxInstallments:
                                1,

                            creditCard:
                                "all",

                            debitCard:
                                "all",

                            prepaidCard:
                                "all",

                            bankTransfer:
                                "all",

                            mercadoPago:
                                "all",

                            ticket:
                                "all"

                        }

                    },


                    // ==================================
                    // CALLBACKS
                    // ==================================

                    callbacks: {

                        onReady: () => {

                            console.log(
                                "✅ Mercado Pago Brick carregado."
                            );

                        },


                        onSubmit:
                            ({ formData }) => {

                                return new Promise(
                                    async (
                                        resolve,
                                        reject
                                    ) => {

                                        try {

                                            // ==============================
                                            // VALOR COM 2 CASAS
                                            // ==============================

                                            const amount =
                                                Number(
                                                    Number(
                                                        rental.total ||
                                                        0
                                                    ).toFixed(2)
                                                );


                                            // ==============================
                                            // DADOS DO PAGAMENTO
                                            // ==============================

                                            const paymentData = {

                                                rentalId:
                                                    rental.id,

                                                ...formData,

                                                transaction_amount:
                                                    amount,

                                                installments:
                                                    1

                                            };


                                            console.log(
                                                "📤 Enviando pagamento:",
                                                {
                                                    rentalId:
                                                        paymentData.rentalId,

                                                    amount:
                                                        paymentData.transaction_amount,

                                                    payment_method_id:
                                                        paymentData.payment_method_id,

                                                    issuer_id:
                                                        paymentData.issuer_id,

                                                    hasToken:
                                                        Boolean(
                                                            paymentData.token
                                                        ),

                                                    payer:
                                                        paymentData.payer
                                                }
                                            );


                                            // ==============================
                                            // REQUEST
                                            // ==============================

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
                                                            JSON.stringify(
                                                                paymentData
                                                            )

                                                    }
                                                );


                                            // ==============================
                                            // RESPOSTA
                                            // ==============================

                                            let result;

                                            try {

                                                result =
                                                    await response.json();

                                            } catch {

                                                throw new Error(
                                                    `Servidor respondeu com HTTP ${response.status}.`
                                                );

                                            }


                                            console.log(
                                                "📥 Resposta do backend:",
                                                result
                                            );


                                            if (
                                                !response.ok
                                            ) {

                                                throw new Error(
                                                    result.error ||
                                                    result.message ||
                                                    `Erro HTTP ${response.status}.`
                                                );

                                            }


                                            // ==============================
                                            // PAGAMENTO
                                            // ==============================

                                            if (
                                                result.payment &&
                                                result.payment.status ===
                                                    "approved"
                                            ) {

                                                showResult(

                                                    "Pagamento confirmado!",

                                                    "Seu aluguel foi pago com sucesso."

                                                );

                                            } else {

                                                showResult(

                                                    "Pagamento em análise",

                                                    getMessage(
                                                        result.payment?.status
                                                    )

                                                );

                                            }


                                            resolve();


                                        } catch (err) {

                                            console.error(
                                                "❌ ERRO AO PROCESSAR PAGAMENTO:",
                                                err
                                            );


                                            alert(
                                                err.message ||
                                                "Erro ao processar pagamento."
                                            );


                                            reject(err);

                                        }

                                    }
                                );

                            },


                        onError:
                            (err) => {

                                console.error(
                                    "❌ ERRO DO PAYMENT BRICK:",
                                    err
                                );

                            }

                    }

                }
            );


        } catch (error) {

            console.error(
                "❌ ERRO AO CRIAR PAYMENT BRICK:",
                error
            );

            showError(
                error.message ||
                "Não foi possível carregar o pagamento."
            );

        }

    }


    // ==========================================
    // MENSAGEM DE STATUS
    // ==========================================

    function getMessage(status) {

        switch (status) {

            case "pending":

                return "Pagamento pendente.";

            case "in_process":

                return "Pagamento em análise.";

            case "rejected":

                return "Pagamento recusado.";

            case "approved":

                return "Pagamento aprovado.";

            default:

                return "Pagamento processado.";

        }

    }


    // ==========================================
    // RESULTADO
    // ==========================================

    function showResult(
        title,
        message
    ) {

        if (paymentBrick)
            paymentBrick.style.display =
                "none";


        if (paymentResult)
            paymentResult.style.display =
                "block";


        const resultTitle =
            document.querySelector(
                "#result-title"
            );

        const resultMessage =
            document.querySelector(
                "#result-message"
            );


        if (resultTitle)
            resultTitle.textContent =
                title;


        if (resultMessage)
            resultMessage.textContent =
                message;

    }


    // ==========================================
    // INICIAR
    // ==========================================

    await loadCheckout();

});
