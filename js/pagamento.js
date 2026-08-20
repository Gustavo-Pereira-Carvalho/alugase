// ==========================================
// ALUGASE — PAGAMENTO
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API =
        "https://alugase-api.onrender.com/api";


    // ==========================================
    // USUÁRIO
    // ==========================================

    const user =
        JSON.parse(
            localStorage.getItem("alugase_user")
        );


    if (!user) {

        window.location.href =
            "login.html";

        return;

    }


    // ==========================================
    // ID DO ALUGUEL
    // ==========================================

    const params =
        new URLSearchParams(
            window.location.search
        );


    const rentalId =
        params.get("id");


    if (!rentalId) {

        showError(
            "O ID do aluguel não foi informado."
        );

        return;

    }


    // ==========================================
    // ELEMENTOS
    // ==========================================

    const loading =
        document.querySelector("#loading");

    const errorState =
        document.querySelector("#error-state");

    const errorText =
        document.querySelector("#error-text");

    const content =
        document.querySelector("#payment-content");

    const payButton =
        document.querySelector("#pay-button");

    const paymentAction =
        document.querySelector("#payment-action");

    const paidState =
        document.querySelector("#paid-state");


    // ==========================================
    // FORMATAR DINHEIRO
    // ==========================================

    function money(value) {

        return Number(value || 0)
            .toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

    }


    // ==========================================
    // FORMATAR DATA
    // ==========================================

    function formatDate(date) {

        return new Date(date)
            .toLocaleDateString(
                "pt-BR",
                {
                    timeZone: "UTC"
                }
            );

    }


    // ==========================================
    // MOSTRAR ERRO
    // ==========================================

    function showError(message) {

        loading.style.display =
            "none";

        content.style.display =
            "none";

        errorState.style.display =
            "block";

        errorText.textContent =
            message;

    }


    // ==========================================
    // CARREGAR ALUGUEL
    // ==========================================

    async function loadRental() {

        try {

            const response =
                await fetch(
                    `${API}/rentals/${rentalId}`
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Não foi possível carregar o aluguel."
                );

            }


            // ======================================
            // SEGURANÇA
            // ======================================

            if (
                String(data.renterId?._id) !==
                String(user._id)
            ) {

                throw new Error(
                    "Você não possui acesso a este pagamento."
                );

            }


            renderRental(data);


        } catch (error) {

            console.error(
                "ERRO AO CARREGAR PAGAMENTO:",
                error
            );


            showError(
                error.message
            );

        }

    }


    // ==========================================
    // RENDERIZAR ALUGUEL
    // ==========================================

    function renderRental(rental) {

        loading.style.display =
            "none";


        content.style.display =
            "block";


        const product =
            rental.productId || {};


        // ======================================
        // PRODUTO
        // ======================================

        const productTitle =
            document.querySelector(
                "#product-title"
            );


        const productCity =
            document.querySelector(
                "#product-city"
            );


        const ownerName =
            document.querySelector(
                "#owner-name"
            );


        const productImage =
            document.querySelector(
                "#product-image"
            );


        productTitle.textContent =
            product.title ||
            "Produto";


        productCity.textContent =
            `📍 ${product.city || "Localização não informada"}`;


        ownerName.textContent =
            `Proprietário: ${
                rental.ownerId?.name ||
                "Não informado"
            }`;


        // ======================================
        // IMAGEM
        // ======================================

        if (product.image) {

            productImage.innerHTML = `

                <img
                    src="${product.image}"
                    alt="${escapeHTML(
                        product.title || "Produto"
                    )}"
                >

            `;

        } else {

            productImage.textContent =
                "📦";

        }


        // ======================================
        // DATAS
        // ======================================

        document.querySelector(
            "#start-date"
        ).textContent =
            formatDate(
                rental.startDate
            );


        document.querySelector(
            "#end-date"
        ).textContent =
            formatDate(
                rental.endDate
            );


        document.querySelector(
            "#days"
        ).textContent =
            `${rental.days} ${
                rental.days === 1
                    ? "dia"
                    : "dias"
            }`;


        // ======================================
        // VALORES
        // ======================================

        document.querySelector(
            "#rent-total"
        ).textContent =
            money(
                rental.rentTotal
            );


        document.querySelector(
            "#delivery-price"
        ).textContent =
            money(
                rental.deliveryPrice
            );


        document.querySelector(
            "#deposit"
        ).textContent =
            money(
                rental.deposit
            );


        document.querySelector(
            "#total"
        ).textContent =
            money(
                rental.total
            );


        // ======================================
        // STATUS
        // ======================================

        updatePaymentStatus(
            rental
        );

    }


    // ==========================================
    // STATUS DO PAGAMENTO
    // ==========================================

    function updatePaymentStatus(rental) {

        const statusIcon =
            document.querySelector(
                "#status-icon"
            );

        const statusTitle =
            document.querySelector(
                "#status-title"
            );

        const statusMessage =
            document.querySelector(
                "#status-message"
            );


        // ======================================
        // JÁ PAGO
        // ======================================

        if (
            rental.status === "paid" ||
            rental.paymentStatus === "approved"
        ) {

            statusIcon.textContent =
                "✅";

            statusTitle.textContent =
                "Pagamento confirmado";

            statusMessage.textContent =
                "Este aluguel já foi pago e está confirmado.";


            paymentAction.style.display =
                "none";


            paidState.style.display =
                "block";


            return;

        }


        // ======================================
        // CANCELADO
        // ======================================

        if (
            rental.status === "cancelled" ||
            rental.status === "rejected"
        ) {

            statusIcon.textContent =
                "❌";

            statusTitle.textContent =
                "Aluguel indisponível";

            statusMessage.textContent =
                "Este aluguel não pode mais ser pago.";


            paymentAction.style.display =
                "none";


            return;

        }


        // ======================================
        // PENDENTE
        // ======================================

        if (
            rental.status === "pending"
        ) {

            statusIcon.textContent =
                "⏳";

            statusTitle.textContent =
                "Aguardando aprovação";

            statusMessage.textContent =
                "O proprietário ainda precisa aprovar esta solicitação.";


            paymentAction.style.display =
                "none";


            return;

        }


        // ======================================
        // APROVADO
        // ======================================

        if (
            rental.status === "approved"
        ) {

            statusIcon.textContent =
                "💳";

            statusTitle.textContent =
                "Pagamento necessário";

            statusMessage.textContent =
                "O proprietário aprovou sua solicitação. Realize o pagamento para confirmar o aluguel.";


            paymentAction.style.display =
                "block";


            return;

        }


        // ======================================
        // AGUARDANDO PAGAMENTO
        // ======================================

        if (
            rental.status ===
            "awaiting_payment"
        ) {

            statusIcon.textContent =
                "💳";

            statusTitle.textContent =
                "Pagamento necessário";

            statusMessage.textContent =
                "Realize o pagamento para confirmar o aluguel.";


            paymentAction.style.display =
                "block";


            return;

        }


        // ======================================
        // OUTROS STATUS
        // ======================================

        paymentAction.style.display =
            "none";

    }


    // ==========================================
    // PAGAR
    // ==========================================

    payButton.addEventListener(
        "click",
        async () => {

            try {

                payButton.disabled =
                    true;


                payButton.innerHTML =
                    "Processando pagamento...";


                /*
                 * IMPORTANTE:
                 *
                 * Aqui estamos usando o fluxo
                 * atual de desenvolvimento.
                 *
                 * O backend altera:
                 *
                 * approved
                 * ↓
                 * awaiting_payment
                 * ↓
                 * paid
                 *
                 * Quando o Mercado Pago for
                 * integrado, este botão deverá
                 * criar o pagamento real.
                 */


                // ==================================
                // PRIMEIRO:
                // APPROVED → AWAITING_PAYMENT
                // ==================================

                const rentalResponse =
                    await fetch(
                        `${API}/rentals/${rentalId}/status`,
                        {

                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    status:
                                        "awaiting_payment"

                                })

                        }
                    );


                const rentalData =
                    await rentalResponse.json();


                if (
                    !rentalResponse.ok &&
                    rentalData.error !==
                    "O aluguel já possui este status."
                ) {

                    throw new Error(
                        rentalData.error ||
                        "Não foi possível iniciar o pagamento."
                    );

                }


                // ==================================
                // SEGUNDO:
                // AWAITING_PAYMENT → PAID
                // ==================================

                const paymentResponse =
                    await fetch(
                        `${API}/rentals/${rentalId}/status`,
                        {

                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    status:
                                        "paid"

                                })

                        }
                    );


                const paymentData =
                    await paymentResponse.json();


                if (!paymentResponse.ok) {

                    throw new Error(
                        paymentData.error ||
                        "Não foi possível confirmar o pagamento."
                    );

                }


                // ==================================
                // SUCESSO
                // ==================================

                statusSuccess();


            } catch (error) {

                console.error(
                    "ERRO AO PAGAR:",
                    error
                );


                alert(
                    error.message ||
                    "Erro ao processar pagamento."
                );


                payButton.disabled =
                    false;


                payButton.innerHTML =
                    `
                        <span>💳</span>
                        Pagar aluguel
                    `;

            }

        }
    );


    // ==========================================
    // PAGAMENTO CONFIRMADO
    // ==========================================

    function statusSuccess() {

        paymentAction.style.display =
            "none";


        paidState.style.display =
            "block";


        const statusIcon =
            document.querySelector(
                "#status-icon"
            );


        const statusTitle =
            document.querySelector(
                "#status-title"
            );


        const statusMessage =
            document.querySelector(
                "#status-message"
            );


        statusIcon.textContent =
            "✅";


        statusTitle.textContent =
            "Pagamento confirmado";


        statusMessage.textContent =
            "Seu aluguel foi confirmado com sucesso.";

    }


    // ==========================================
    // ESCAPAR HTML
    // ==========================================

    function escapeHTML(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    // ==========================================
    // INICIAR
    // ==========================================

    await loadRental();

});
