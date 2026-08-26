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

        }

        if (!user) {

            location.href =
                "login.html";

            return;

        }

        // ======================================
        // RENTAL ID
        // ======================================

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

                const renter =
                    data.renter;

                if (!rental) {

                    throw new Error(
                        "Dados do aluguel não encontrados."
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
                                📍
                                ${escapeHtml(
                                    product?.city ||
                                    "Não informado"
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
                            rentalDays > 1
                                ? "s"
                                : ""
                        }`;

                }

                // ==================================
                // EXIBIR CHECKOUT
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
                    renter
                );

            } catch (error) {

                console.error(
                    "❌ ERRO AO CARREGAR CHECKOUT:",
                    error
                );

                showError(
                    error.message ||
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

            try {

                console.log(
                    "💳 Inicializando Mercado Pago Brick..."
                );

                if (!publicKey) {

                    throw new Error(
                        "Chave pública do Mercado Pago não recebida."
                    );

                }

                if (
                    typeof MercadoPago ===
                    "undefined"
                ) {

                    throw new Error(
                        "SDK do Mercado Pago não foi carregado."
                    );

                }

                // ==================================
                // VALOR CORRIGIDO
                // ==================================

                /*
                 * IMPORTANTE:
                 *
                 * Evita valores como:
                 *
                 * 299.96000000000004
                 *
                 * O Mercado Pago recebe:
                 *
                 * 299.96
                 */

                const amount =
                    Number(
                        Number(
                            rental.total || 0
                        ).toFixed(2)
                    );

                console.log(
                    "💰 Valor do aluguel:",
                    rental.total
                );

                console.log(
                    "💰 Valor enviado ao Brick:",
                    amount
                );

                if (
                    !Number.isFinite(amount) ||
                    amount <= 0
                ) {

                    throw new Error(
                        "Valor do aluguel inválido."
                    );

                }

                // ==================================
                // MERCADO PAGO
                // ==================================

                const mp =
                    new MercadoPago(
                        publicKey
                    );

                const bricks =
                    mp.bricks();

                // ==================================
                // CRIAR BRICK
                // ==================================

                await bricks.create(
                    "payment",
                    "paymentBrick_container",
                    {

                        initialization: {

                            amount:
                                amount,

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

                                ticket:
                                    "all"

                                /*
                                 * NÃO usar:
                                 *
                                 * mercadoPago: "all"
                                 *
                                 * pois esse método exige
                                 * preferenceId.
                                 */

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

                            onSubmit:
                                ({ formData }) => {

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
                                                    formData.payment_method_id
                                                );

                                                console.log(
                                                    "Token:",
                                                    formData.token
                                                        ? "RECEBIDO"
                                                        : "NÃO RECEBIDO"
                                                );

                                                console.log(
                                                    "Issuer recebido pelo Brick:",
                                                    formData.issuer_id
                                                );

                                                console.log(
                                                    "======================================"
                                                );

                                                // ==============================
                                                // VALIDAR TOKEN
                                                // ==============================

                                                if (
                                                    !formData.token
                                                ) {

                                                    throw new Error(
                                                        "Token do cartão não recebido."
                                                    );

                                                }

                                                // ==============================
                                                // VALOR
                                                // ==============================

                                                const transactionAmount =
                                                    Number(
                                                        Number(
                                                            rental.total || 0
                                                        ).toFixed(2)
                                                    );

                                                if (
                                                    !Number.isFinite(
                                                        transactionAmount
                                                    ) ||
                                                    transactionAmount <=
                                                        0
                                                ) {

                                                    throw new Error(
                                                        "Valor da transação inválido."
                                                    );

                                                }

                                                // ==============================
                                                // PAYER
                                                // ==============================

                                                const payerEmail =
                                                    formData?.payer?.email ||
                                                    renter?.email ||
                                                    user?.email ||
                                                    "";

                                                const payerIdentification =
                                                    formData?.payer?.identification ||
                                                    null;

                                                // ==============================
                                                // PAYLOAD
                                                // ==============================

                                                const payload = {

                                                    rentalId:
                                                        String(
                                                            rental.id
                                                        ),

                                                    token:
                                                        formData.token,

                                                    payment_method_id:
                                                        formData.payment_method_id,

                                                    installments:
                                                        1,

                                                    transaction_amount:
                                                        transactionAmount,

                                                    payer: {

                                                        email:
                                                            payerEmail

                                                    }

                                                };

                                                // ==============================
                                                // IDENTIFICAÇÃO
                                                // ==============================

                                                if (
                                                    payerIdentification
                                                ) {

                                                    payload.payer.identification =
                                                        payerIdentification;

                                                }

                                                // ==============================
                                                // ISSUER
                                                // ==============================

                                                /*
                                                 * Só envia issuer_id quando
                                                 * o Brick realmente fornecer.
                                                 */

                                                if (
                                                    formData.issuer_id !==
                                                        undefined &&
                                                    formData.issuer_id !==
                                                        null &&
                                                    formData.issuer_id !==
                                                        ""
                                                ) {

                                                    payload.issuer_id =
                                                        formData.issuer_id;

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
                                                                    payload
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

                                                // ==============================
                                                // ERRO
                                                // ==============================

                                                if (
                                                    !response.ok
                                                ) {

                                                    let message =
                                                        result.error ||
                                                        "Erro ao processar pagamento.";

                                                    // ==========================
                                                    // ERROS CONHECIDOS MP
                                                    // ==========================

                                                    if (
                                                        result.code ===
                                                        4037
                                                    ) {

                                                        message =
                                                            "O Mercado Pago recusou o valor da transação. O valor precisa estar em formato monetário válido.";

                                                    }

                                                    if (
                                                        message ===
                                                        "forced_issuer"
                                                    ) {

                                                        message =
                                                            "O Mercado Pago identificou um emissor inválido para este cartão. Tente outro cartão de teste compatível com o método selecionado.";

                                                    }

                                                    if (
                                                        result.code ===
                                                        10111
                                                    ) {

                                                        message =
                                                            "O cartão informado não corresponde ao emissor selecionado. Tente outro cartão de teste ou deixe o Mercado Pago identificar o emissor automaticamente.";

                                                    }

                                                    throw new Error(
                                                        message
                                                    );

                                                }

                                                // ==============================
                                                // PAGAMENTO
                                                // ==============================

                                                if (
                                                    !result.payment
                                                ) {

                                                    throw new Error(
                                                        "O backend não retornou os dados do pagamento."
                                                    );

                                                }

                                                const paymentStatus =
                                                    result.payment.status;

                                                console.log(
                                                    "💳 Status:",
                                                    paymentStatus
                                                );

                                                // ==============================
                                                // APROVADO
                                                // ==============================

                                                if (
                                                    paymentStatus ===
                                                    "approved"
                                                ) {

                                                    showResult(

                                                        "Pagamento confirmado!",

                                                        "Seu aluguel foi pago com sucesso."

                                                    );

                                                }

                                                // ==============================
                                                // EM ANÁLISE
                                                // ==============================

                                                else {

                                                    showResult(

                                                        "Pagamento em análise",

                                                        getMessage(
                                                            paymentStatus
                                                        )

                                                    );

                                                }

                                                resolve();

                                            } catch (
                                                error
                                            ) {

                                                console.error(
                                                    "❌ ERRO AO PROCESSAR PAGAMENTO:",
                                                    error
                                                );

                                                alert(
                                                    error.message ||
                                                    "Erro ao processar pagamento."
                                                );

                                                reject(
                                                    error
                                                );

                                            }

                                        }
                                    );

                                },

                            // ==============================
                            // ERRO BRICK
                            // ==============================

                            onError:
                                (error) => {

                                    console.error(
                                        "❌ ERRO DO PAYMENT BRICK:",
                                        error
                                    );

                                }

                        }

                    }
                );

            } catch (error) {

                console.error(
                    "❌ ERRO AO INICIALIZAR MERCADO PAGO:",
                    error
                );

                showError(
                    error.message ||
                    "Não foi possível carregar o pagamento."
                );

            }

        }

        // ======================================
        // MENSAGENS DE STATUS
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

                case "charged_back":

                    return (
                        "Pagamento contestado."
                    );

                default:

                    return (
                        "Pagamento processado."
                    );

            }

        }

        // ======================================
        // RESULTADO
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
