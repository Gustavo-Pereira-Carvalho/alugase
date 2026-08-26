// ==========================================
// ALUGASE — PAGAMENTO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // ======================================
        // API
        // ======================================

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

        let user = null;


        try {

            user =
                JSON.parse(
                    localStorage.getItem(
                        "alugase_user"
                    )
                );

        } catch (error) {

            console.error(
                "Erro ao ler usuário:",
                error
            );

            user = null;

        }


        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        // ======================================
        // RENTAL ID
        // ======================================

        const rentalId =
            new URLSearchParams(
                window.location.search
            ).get("id");


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

            if (!date) {

                return "-";

            }


            const parsed =
                new Date(date);


            if (
                Number.isNaN(
                    parsed.getTime()
                )
            ) {

                return "-";

            }


            return parsed.toLocaleDateString(
                "pt-BR"
            );

        }


        // ======================================
        // ESCAPAR HTML
        // ======================================

        function escapeHtml(text) {

            const div =
                document.createElement(
                    "div"
                );


            div.textContent =
                text || "";


            return div.innerHTML;

        }


        // ======================================
        // MOSTRAR ERRO
        // ======================================

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
                    message ||
                    "Ocorreu um erro.";

            }

        }


        // ======================================
        // CARREGAR CHECKOUT
        // ======================================

        async function loadCheckout() {

            try {

                console.log(
                    "🔄 Carregando checkout..."
                );


                const response =
                    await fetch(
                        `${API}/payments/checkout/${rentalId}`
                    );


                let data;


                try {

                    data =
                        await response.json();

                } catch (jsonError) {

                    throw new Error(
                        "O servidor retornou uma resposta inválida."
                    );

                }


                console.log(
                    "📥 Checkout:",
                    data
                );


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


                if (!rental) {

                    throw new Error(
                        "Dados do aluguel não encontrados."
                    );

                }


                if (!product) {

                    throw new Error(
                        "Dados do produto não encontrados."
                    );

                }


                // ==================================
                // PRODUTO
                // ==================================

                if (productSummary) {

                    productSummary.innerHTML = `

                        ${
                            product?.image

                                ? `

                                    <img
                                        src="${escapeHtml(
                                            product.image
                                        )}"
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
                                    product.title
                                )}
                            </h3>

                            <p>
                                📍 ${escapeHtml(
                                    product.city
                                )}
                            </p>

                        </div>

                    `;

                }


                // ==================================
                // VALORES
                // ==================================

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


                // ==================================
                // DATAS
                // ==================================

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

                    const rentalDays =
                        Number(
                            rental.days || 0
                        );


                    days.textContent =
                        `${rentalDays} dia${
                            rentalDays !== 1
                                ? "s"
                                : ""
                        }`;

                }


                // ==================================
                // MOSTRAR CHECKOUT
                // ==================================

                if (loading) {

                    loading.style.display =
                        "none";

                }


                if (checkout) {

                    checkout.style.display =
                        "block";

                }


                // ==================================
                // RENDERIZAR MERCADO PAGO
                // ==================================

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


        // ======================================
        // RENDERIZAR PAYMENT BRICK
        // ======================================

        async function renderBrick(
            publicKey,
            rental,
            renter
        ) {

            if (!publicKey) {

                throw new Error(
                    "Chave pública do Mercado Pago não configurada."
                );

            }


            if (!rental?.id) {

                throw new Error(
                    "ID do aluguel não encontrado."
                );

            }


            if (
                typeof MercadoPago !==
                "function"
            ) {

                throw new Error(
                    "Biblioteca do Mercado Pago não carregada."
                );

            }


            console.log(
                "💳 Inicializando Mercado Pago Brick..."
            );


            const mp =
                new MercadoPago(
                    publicKey
                );


            const bricks =
                mp.bricks();


            // ==================================
            // CONFIGURAÇÃO
            // ==================================

            const settings = {

                initialization: {

                    amount:
                        Number(
                            rental.total
                        ),

                    payer: {

                        email:
                            renter?.email ||
                            user?.email ||
                            ""

                    }

                },


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


                callbacks: {

                    // ==============================
                    // READY
                    // ==============================

                    onReady: () => {

                        console.log(
                            "✅ Mercado Pago Brick carregado."
                        );

                    },


                    // ==============================
                    // SUBMIT
                    // ==============================

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
                                        "💳 ENVIANDO PAGAMENTO"
                                    );

                                    console.log(
                                        "Rental:",
                                        rental.id
                                    );

                                    console.log(
                                        "Método:",
                                        formData?.payment_method_id
                                    );

                                    console.log(
                                        "Token:",
                                        formData?.token
                                            ? "RECEBIDO"
                                            : "NÃO RECEBIDO"
                                    );

                                    console.log(
                                        "Issuer recebido pelo Brick:",
                                        formData?.issuer_id || "NÃO INFORMADO"
                                    );

                                    console.log(
                                        "======================================"
                                    );


                                    // ==================================
                                    // VALIDAR DADOS DO BRICK
                                    // ==================================

                                    if (
                                        !formData?.token
                                    ) {

                                        throw new Error(
                                            "Token do cartão não recebido."
                                        );

                                    }


                                    if (
                                        !formData?.payment_method_id
                                    ) {

                                        throw new Error(
                                            "Método de pagamento não recebido."
                                        );

                                    }


                                    // ==================================
                                    // IDENTIFICAÇÃO
                                    // ==================================

                                    const payer =
                                        formData.payer || {};


                                    // ==================================
                                    // PAYLOAD
                                    // ==================================
                                    //
                                    // NÃO ALTERAMOS O TOKEN.
                                    //
                                    // NÃO FORÇAMOS issuer_id.
                                    //
                                    // O BACKEND calcula o valor real
                                    // usando rental.total.
                                    //
                                    // ==================================

                                    const payload = {

                                        rentalId:
                                            String(
                                                rental.id
                                            ),

                                        token:
                                            formData.token,

                                        payment_method_id:
                                            formData.payment_method_id,

                                        payer: {

                                            email:
                                                payer.email ||
                                                renter?.email ||
                                                user?.email ||
                                                ""

                                        }

                                    };


                                    // ==================================
                                    // IDENTIFICAÇÃO DO PAGADOR
                                    // ==================================

                                    if (
                                        payer.identification &&
                                        payer.identification.type &&
                                        payer.identification.number
                                    ) {

                                        payload.payer.identification = {

                                            type:
                                                payer.identification.type,

                                            number:
                                                String(
                                                    payer.identification.number
                                                )

                                        };

                                    }


                                    console.log(
                                        "📤 Payload enviado ao backend:",
                                        {
                                            ...payload,
                                            token:
                                                payload.token
                                                    ? "RECEBIDO"
                                                    : "NÃO RECEBIDO"
                                        }
                                    );


                                    // ==================================
                                    // FETCH
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

                                    } catch (
                                        jsonError
                                    ) {

                                        throw new Error(
                                            "O servidor retornou uma resposta inválida."
                                        );

                                    }


                                    console.log(
                                        "📥 Resposta do backend:",
                                        result
                                    );


                                    if (!response.ok) {

                                        let message =
                                            result.error ||
                                            "Erro ao processar pagamento.";


                                        // ==============================
                                        // ERRO 10111
                                        // ==============================

                                        if (
                                            result.code ===
                                            10111 ||
                                            (
                                                typeof message ===
                                                "string" &&
                                                message.includes(
                                                    "invalid issuer"
                                                )
                                            )
                                        ) {

                                            message =
                                                "O Mercado Pago recusou o emissor deste cartão. Tente novamente.";

                                        }


                                        // ==============================
                                        // FORCED ISSUER
                                        // ==============================

                                        if (
                                            typeof message ===
                                            "string" &&
                                            message.includes(
                                                "forced_issuer"
                                            )
                                        ) {

                                            message =
                                                "O Mercado Pago identificou um emissor de cartão inválido. Tente novamente.";

                                        }


                                        throw new Error(
                                            message
                                        );

                                    }


                                    // ==================================
                                    // PAGAMENTO
                                    // ==================================

                                    const payment =
                                        result.payment;


                                    if (!payment) {

                                        throw new Error(
                                            "O servidor não retornou os dados do pagamento."
                                        );

                                    }


                                    console.log(
                                        "💳 Pagamento:",
                                        payment
                                    );


                                    // ==================================
                                    // APROVADO
                                    // ==================================

                                    if (
                                        payment.status ===
                                        "approved"
                                    ) {

                                        showResult(

                                            "Pagamento confirmado!",

                                            "Seu aluguel foi pago com sucesso."

                                        );

                                    }


                                    // ==================================
                                    // EM ANÁLISE
                                    // ==================================

                                    else {

                                        showResult(

                                            "Pagamento em análise",

                                            getMessage(
                                                payment.status
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


                    // ==============================
                    // ERRO DO BRICK
                    // ==============================

                    onError: (
                        err
                    ) => {

                        console.error(
                            "❌ ERRO DO MERCADO PAGO BRICK:",
                            err
                        );

                    }

                }

            };


            await bricks.create(
                "payment",
                "paymentBrick_container",
                settings
            );

        }


        // ======================================
        // MENSAGEM DE STATUS
        // ======================================

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
                        "Pagamento processado."
                    );

            }

        }


        // ======================================
        // MOSTRAR RESULTADO
        // ======================================

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


        // ======================================
        // INICIAR
        // ======================================

        await loadCheckout();

    }
);
