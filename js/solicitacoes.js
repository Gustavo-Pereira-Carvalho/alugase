// ==========================================
// ALUGASE — SOLICITAÇÕES
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api";

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
    // ELEMENTOS
    // ==========================================

    const list =
        document.querySelector(
            "#requests-list"
        );

    const empty =
        document.querySelector(
            "#empty-state"
        );

    const filters =
        document.querySelectorAll(
            ".filter-btn"
        );


    let requests = [];

    let currentFilter = "all";


    // ==========================================
    // CARREGAR SOLICITAÇÕES
    // ==========================================

    async function loadRequests() {

        try {

            const response =
                await fetch(
                    `${API}/rentals/owner/${user._id}`
                );


            if (!response.ok) {

                throw new Error(
                    "Erro ao buscar solicitações."
                );

            }


            requests =
                await response.json();


            render();


        } catch (error) {

            console.error(
                "ERRO:",
                error
            );

            list.innerHTML = "";

            empty.style.display =
                "block";

            empty.querySelector("h2").textContent =
                "Erro ao carregar solicitações";

            empty.querySelector("p").textContent =
                "Não foi possível carregar suas solicitações.";


        }

    }


    // ==========================================
    // FORMATAR DATA
    // ==========================================

    function formatDate(date) {

        if (!date) {
            return "-";
        }

        return new Date(date)
            .toLocaleDateString(
                "pt-BR"
            );

    }


    // ==========================================
    // FORMATAR DINHEIRO
    // ==========================================

    function formatMoney(value) {

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
    // STATUS
    // ==========================================

    function statusLabel(status) {

        switch (status) {

            case "pending":
                return "Pendente";

            case "approved":
                return "Aprovada";

            case "awaiting_payment":
                return "Aguardando pagamento";

            case "paid":
                return "Pagamento confirmado";

            case "active":
                return "Aluguel ativo";

            case "finished":
                return "Finalizada";

            case "rejected":
                return "Recusada";

            case "cancelled":
                return "Cancelada";

            default:
                return status || "Desconhecido";

        }

    }


    // ==========================================
    // TEXTO DO STATUS
    // ==========================================

    function statusDescription(status) {

        switch (status) {

            case "pending":
                return "Aguardando sua aprovação.";

            case "approved":
                return "Solicitação aprovada.";

            case "awaiting_payment":
                return "Aguardando pagamento do cliente.";

            case "paid":
                return "Pagamento confirmado.";

            case "active":
                return "O aluguel está em andamento.";

            case "finished":
                return "Aluguel finalizado.";

            case "rejected":
                return "Você recusou esta solicitação.";

            case "cancelled":
                return "Esta solicitação foi cancelada.";

            default:
                return "";

        }

    }


    // ==========================================
    // RENDER
    // ==========================================

    function render() {

        list.innerHTML = "";


        // ======================================
        // FILTRAR
        // ======================================

        const filtered =
            currentFilter === "all"

                ? requests

                : requests.filter(
                    rental =>
                        rental.status ===
                        currentFilter
                );


        // ======================================
        // VAZIO
        // ======================================

        if (!filtered.length) {

            empty.style.display =
                "block";

            return;

        }


        empty.style.display =
            "none";


        // ======================================
        // CARDS
        // ======================================

        filtered.forEach(
            rental => {

                const renter =
                    rental.renterId || {};

                const product =
                    rental.productId || {};


                // ==================================
                // NOME
                // ==================================

                const renterName =
                    renter.name ||
                    "Usuário";


                // ==================================
                // INICIAIS
                // ==================================

                const initials =
                    renterName
                        .split(" ")
                        .filter(Boolean)
                        .map(
                            name =>
                                name[0]
                        )
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();


                // ==================================
                // CARD
                // ==================================

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "request-card";


                // ==================================
                // BOTÕES
                // ==================================

                let actions = "";


                // ----------------------------------
                // PENDENTE
                // ----------------------------------

                if (
                    rental.status ===
                    "pending"
                ) {

                    actions = `

                        <button
                            class="btn-accept"
                            data-id="${rental._id}">
                            Aceitar
                        </button>

                        <button
                            class="btn-reject"
                            data-id="${rental._id}">
                            Recusar
                        </button>

                    `;

                }


                // ----------------------------------
                // AGUARDANDO PAGAMENTO
                // ----------------------------------

                else if (
                    rental.status ===
                    "awaiting_payment"
                ) {

                    actions = `

                        <span class="action-info">
                            💳 Aguardando pagamento do cliente
                        </span>

                    `;

                }


                // ----------------------------------
                // PAGO
                // ----------------------------------

                else if (
                    rental.status ===
                    "paid"
                ) {

                    actions = `

                        <span class="action-info">
                            ✅ Pagamento confirmado
                        </span>

                    `;

                }


                // ----------------------------------
                // ATIVO
                // ----------------------------------

                else if (
                    rental.status ===
                    "active"
                ) {

                    actions = `

                        <span class="action-info">
                            📦 Aluguel em andamento
                        </span>

                    `;

                }


                // ----------------------------------
                // FINALIZADO
                // ----------------------------------

                else if (
                    rental.status ===
                    "finished"
                ) {

                    actions = `

                        <span class="action-info">
                            🏁 Aluguel finalizado
                        </span>

                    `;

                }


                // ==================================
                // CHAT
                // ==================================
                //
                // Como Rental não possui chatId,
                // não vamos mandar:
                //
                // chat.html?chat=undefined
                //
                // O chat poderá ser ligado ao rental
                // posteriormente.
                //
                // ==================================


                card.innerHTML = `

                    <div class="request-top">

                        <div class="request-user">

                            <div class="user-avatar">
                                ${initials}
                            </div>

                            <div class="user-info">

                                <h3>
                                    ${renterName}
                                </h3>

                                <p>
                                    Solicitou um aluguel
                                </p>

                            </div>

                        </div>


                        <span class="status ${rental.status}">
                            ${statusLabel(
                                rental.status
                            )}
                        </span>

                    </div>


                    <div class="product-box">

                        <div class="product-image">

                            ${
                                product.image ||
                                "📦"
                            }

                        </div>


                        <div class="product-details">

                            <h4>
                                ${
                                    product.title ||
                                    "Produto"
                                }
                            </h4>

                            <p>
                                📍 ${
                                    product.city ||
                                    "Local não informado"
                                }
                            </p>

                            <div class="price">

                                ${formatMoney(
                                    rental.total
                                )}

                            </div>

                        </div>

                    </div>


                    <div class="request-info">


                        <div class="info-item">

                            <span>
                                Retirada
                            </span>

                            <strong>
                                ${formatDate(
                                    rental.startDate
                                )}
                            </strong>

                        </div>


                        <div class="info-item">

                            <span>
                                Devolução
                            </span>

                            <strong>
                                ${formatDate(
                                    rental.endDate
                                )}
                            </strong>

                        </div>


                        <div class="info-item">

                            <span>
                                Dias
                            </span>

                            <strong>
                                ${rental.days} ${
                                    rental.days === 1
                                        ? "dia"
                                        : "dias"
                                }
                            </strong>

                        </div>


                        <div class="info-item">

                            <span>
                                Total
                            </span>

                            <strong>
                                ${formatMoney(
                                    rental.total
                                )}
                            </strong>

                        </div>


                    </div>


                    ${
                        rental.status !== "pending"
                            ? `
                                <div class="status-description">
                                    ${statusDescription(
                                        rental.status
                                    )}
                                </div>
                            `
                            : ""
                    }


                    <div class="request-actions">

                        ${actions}

                    </div>

                `;


                list.appendChild(
                    card
                );

            }
        );


        addEvents();

    }


    // ==========================================
    // ALTERAR STATUS
    // ==========================================

    async function updateStatus(
        rentalId,
        status
    ) {

        try {

            const response =
                await fetch(
                    `${API}/rentals/${rentalId}/status`,
                    {

                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({
                                status
                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Não foi possível atualizar o aluguel."
                );

            }


            await loadRequests();


        } catch (error) {

            console.error(
                error
            );

            alert(
                error.message
            );

        }

    }


    // ==========================================
    // EVENTOS
    // ==========================================

    function addEvents() {


        // ======================================
        // ACEITAR
        // ======================================

        document
            .querySelectorAll(
                ".btn-accept"
            )
            .forEach(
                button => {

                    button.onclick =
                        async () => {

                            const confirmed =
                                confirm(
                                    "Deseja aceitar esta solicitação?"
                                );


                            if (!confirmed) {
                                return;
                            }


                            button.disabled =
                                true;

                            button.textContent =
                                "Aceitando...";


                            await updateStatus(
                                button.dataset.id,
                                "approved"
                            );

                        };

                }
            );


        // ======================================
        // RECUSAR
        // ======================================

        document
            .querySelectorAll(
                ".btn-reject"
            )
            .forEach(
                button => {

                    button.onclick =
                        async () => {

                            const confirmed =
                                confirm(
                                    "Deseja recusar esta solicitação?"
                                );


                            if (!confirmed) {
                                return;
                            }


                            button.disabled =
                                true;

                            button.textContent =
                                "Recusando...";


                            await updateStatus(
                                button.dataset.id,
                                "rejected"
                            );

                        };

                }
            );

    }


    // ==========================================
    // FILTROS
    // ==========================================

    filters.forEach(
        button => {

            button.onclick =
                () => {

                    filters.forEach(
                        btn =>
                            btn.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    currentFilter =
                        button.dataset.status;


                    render();

                };

        }
    );


    // ==========================================
    // INICIAR
    // ==========================================

    await loadRequests();

});
