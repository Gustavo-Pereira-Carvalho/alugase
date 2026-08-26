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
    // RENTAL ID
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
                style: "currency",
                currency: "BRL"
            }
        );

    }


    // ==========================================
    // DATA
    // ==========================================

    function formatDate(date) {

        if (!date) {

            return "-";

        }


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

        if (loading) {

            loading.style.display =
                "none";

        }


        if (checkout) {

            checkout.style.display =
                "none";

        }


        if (errorState) {

            errorState.style.display =
                "block";

        }


        if (errorMessage) {

            errorMessage.textContent =
                message;

        }

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


            console.log(
                "📥 Checkout:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Erro ao carregar checkout."
                );

            }


            const rental =
                data.rental;


            const product =
                data.product;


            // ======================================
            // PRODUTO
            // ======================================

            if (productSummary) {

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
                            📍 ${escapeHtml(
                                product?.city ||
                                "Local não informado"
                            )}
                        </p>

                    </div>

                `;

            }


            // ======================================
            // VALORES
            // ======================================

            if (rentTotal) {

                rentTotal.textContent =
                    money(
                        rental.rentTotal
                    );

            }


            if (deliveryPrice) {

                deliveryPrice.textContent =
                    money(
                        rental.deliveryPrice
                    );

            }


            if (deposit) {

                deposit.textContent =
                    money(
                        rental.deposit
                    );

            }


            if (total) {

                total.textContent =
                    money(
                        rental.total
                    );

            }


            // ======================================
            // DATAS
            // ======================================

            if (startDate) {

                startDate.textContent =
                    formatDate(
                        rental.startDate
                    );

            }


            if (endDate) {

                endDate.textContent =
                    formatDate(
                        rental.endDate
                    );

            }


            if (days) {

                days.textContent =
                    `${rental.days} dia${
                        Number(rental.days) > 1
                            ? "s"
                            : ""
                    }`;

            }


            // ======================================
            // MOSTRAR CHECKOUT
            // ======================================

            if (loading) {

                loading.style.display =
                    "none";

            }


            if (checkout) {

                checkout.style.display =
                    "block";

            }


            // ======================================
            // PAYMENT BRICK
            // ======================================

            await renderBrick(
                data.publicKey,
                rental,
                data.renter
            );

        } catch (err) {

            console.error(
                "❌ ERRO AO CARREGAR CHECKOUT:",
                err
            );


            showError(
                err.message ||
                "Não foi possível carregar o pagamento."
            );

        }

    }


    // ==========================================
    // RENDERIZAR PAYMENT BRICK
    // ==========================================

    async function renderBrick(
        publicKey,
        rental,
        renter
    ) {

        if (!publicKey) {

            showError(
                "Chave pública do Mercado Pago não configurada."
            );

            return;

        }


        if (!window.MercadoPago) {

            showError(
                "Mercado Pago não foi carregado."
            );

            return;

        }


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
                        Math.round(
                            Number(
                                rental.total
                            ) * 100
                        ) / 100,

                    payer: {

                        email:
                            renter?.email ||
                            user?.email ||
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
                            "✅ Payment Brick carregado."
                        );

                    },


                    // ==================================
                    // SUBMIT
                    // ==================================

                    onSubmit: ({
                        formData
                    }) => {

                        return new Promise(
                            async (
                                resolve,
                                reject
                            ) => {

                                try {

                                    console.log(
                                        "======================================"
                                    );

                                    console.log(
                                        "💳 FORM DATA DO MERCADO PAGO"
                                    );

                                    console.log(
                                        formData
                                    );

                                    console.log(
                                        "======================================"
                                    );


                                    // ==================================
                                    // DADOS DO PAGADOR
                                    // ==================================

                                    const payerData =
                                        formData?.payer ||
                                        {};


                                    const payerEmail =
                                        payerData.email ||
                                        renter?.email ||
                                        user?.email ||
                                        "";


                                    // ==================================
                                    // IDENTIFICAÇÃO
                                    // ==================================

                                    let identification =
                                        null;


                                    if (
                                        payerData?.identification
                                    ) {

                                        identification = {

                                            type:
                                                payerData
                                                    .identification
                                                    .type,

                                            number:
                                                String(
                                                    payerData
                                                        .identification
                                                        .number ||
                                                    ""
                                                ).replace(
                                                    /\D/g,
                                                    ""
                                                )

                                        };

                                    }


                                    // ==================================
                                    // ISSUER
                                    // ==================================

                                    let issuerId =
                                        formData?.issuer_id;


                                    if (
                                        issuerId !==
                                            undefined &&
                                        issuerId !==
                                            null &&
                                        issuerId !==
                                            ""
                                    ) {

                                        issuerId =
                                            Number(
                                                issuerId
                                            );


                                        if (
                                            !Number.isInteger(
                                                issuerId
                                            ) ||
                                            issuerId <= 0
                                        ) {

                                            issuerId =
                                                null;

                                        }

                                    } else {

                                        issuerId =
                                            null;

                                    }


                                    // ==================================
                                    // PARCELAS
                                    // ==================================

                                    const installments =
                                        Number(
                                            formData?.installments
                                        ) > 0

                                            ? Number(
                                                formData.installments
                                            )

                                            : 1;


                                    // ==================================
                                    // PAYLOAD
                                    // ==================================

                                    const payload = {

                                        rentalId:
                                            rental.id ||
                                            rental._id ||
                                            rentalId,

                                        token:
                                            formData?.token,

                                        payment_method_id:
                                            formData?.payment_method_id,

                                        installments:
                                            installments,

                                        payer: {

                                            email:
                                                payerEmail

                                        }

                                    };


                                    // ==================================
                                    // IDENTIFICAÇÃO
                                    // ==================================

                                    if (
                                        identification &&
                                        identification.number
                                    ) {

                                        payload.payer.identification =
                                            identification;

                                    }


                                    // ==================================
                                    // ISSUER
                                    // ==================================

                                    if (
                                        issuerId
                                    ) {

                                        payload.issuer_id =
                                            issuerId;

                                    }


                                    console.log(
                                        "📤 ENVIANDO AO BACKEND:"
                                    );


                                    console.log({

                                        ...payload,

                                        token:
                                            payload.token
                                                ? "***"
                                                : null

                                    });


                                    // ==================================
                                    // VALIDAÇÕES
                                    // ==================================

                                    if (
                                        !payload.rentalId
                                    ) {

                                        throw new Error(
                                            "Aluguel não informado."
                                        );

                                    }


                                    if (
                                        !payload.token
                                    ) {

                                        throw new Error(
                                            "Token do cartão não foi gerado pelo Mercado Pago."
                                        );

                                    }


                                    if (
                                        !payload.payment_method_id
                                    ) {

                                        throw new Error(
                                            "Método de pagamento não informado."
                                        );

                                    }


                                    if (
                                        !payload.payer.email
                                    ) {

                                        throw new Error(
                                            "E-mail do pagador não informado."
                                        );

                                    }


                                    // ==================================
                                    // REQUEST
                                    // ==================================

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
                                                        payload
                                                    )

                                            }
                                        );


                                    // ==================================
                                    // RESPOSTA
                                    // ==================================

                                    let result;


                                    try {

                                        result =
                                            await response.json();

                                    } catch {

                                        result = {

                                            error:
                                                "O servidor retornou uma resposta inválida."

                                        };

                                    }


                                    console.log(
                                        "📥 Resposta do backend:",
                                        result
                                    );


                                    // ==================================
                                    // ERRO
                                    // ==================================

                                    if (
                                        !response.ok
                                    ) {

                                        const errorText =
                                            result.error ||
                                            result.message ||
                                            "Erro ao processar pagamento.";


                                        console.error(
                                            "❌ ERRO AO PROCESSAR PAGAMENTO:",
                                            errorText
                                        );


                                        // Mostra informações
                                        // adicionais do Mercado Pago
                                        if (
                                            result.code
                                        ) {

                                            console.error(
                                                "Código MP:",
                                                result.code
                                            );

                                        }


                                        if (
                                            result.cause
                                        ) {

                                            console.error(
                                                "Detalhes MP:",
                                                result.cause
                                            );

                                        }


                                        throw new Error(
                                            errorText
                                        );

                                    }


                                    // ==================================
                                    // PAGAMENTO
                                    // ==================================

                                    if (
                                        !result.payment
                                    ) {

                                        throw new Error(
                                            "O backend não retornou os dados do pagamento."
                                        );

                                    }


                                    const status =
                                        result
                                            .payment
                                            .status;


                                    console.log(
                                        "💳 STATUS:",
                                        status
                                    );


                                    // ==================================
                                    // APROVADO
                                    // ==================================

                                    if (
                                        status ===
                                        "approved"
                                    ) {

                                        showResult(

                                            "Pagamento confirmado!",

                                            "Seu aluguel foi pago com sucesso."

                                        );

                                    } else {

                                        // ==================================
                                        // PENDENTE / ANÁLISE
                                        // ==================================

                                        showResult(

                                            "Pagamento em análise",

                                            getMessage(
                                                status
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
                                        "Não foi possível processar o pagamento."
                                    );


                                    reject(err);

                                }

                            }
                        );

                    },


                    // ==================================
                    // ERRO DO BRICK
                    // ==================================

                    onError: (err) => {

                        console.error(
                            "❌ ERRO DO PAYMENT BRICK:",
                            err
                        );

                    }

                }

            }
        );

    }


    // ==========================================
    // MENSAGENS
    // ==========================================

    function getMessage(status) {

        switch (status) {

            case "pending":

                return (
                    "Pagamento pendente."
                );


            case "in_process":

                return (
                    "Pagamento em análise."
                );


            case "rejected":

                return (
                    "Pagamento recusado."
                );


            case "cancelled":

                return (
                    "Pagamento cancelado."
                );


            case "refunded":

                return (
                    "Pagamento estornado."
                );


            default:

                return (
                    `Pagamento processado com status: ${status || "desconhecido"}.`
                );

        }

    }


    // ==========================================
    // RESULTADO
    // ==========================================

    function showResult(
        title,
        message
    ) {

        if (paymentBrick) {

            paymentBrick.style.display =
                "none";

        }


        if (paymentResult) {

            paymentResult.style.display =
                "block";

        }


        const resultTitle =
            document.querySelector(
                "#result-title"
            );


        const resultMessage =
            document.querySelector(
                "#result-message"
            );


        if (resultTitle) {

            resultTitle.textContent =
                title;

        }


        if (resultMessage) {

            resultMessage.textContent =
                message;

        }

    }


    // ==========================================
    // INICIAR
    // ==========================================

    await loadCheckout();

});
