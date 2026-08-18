// ==========================================
// ALUGASE — SOLICITAÇÕES (BACKEND)
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api";

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const list = document.querySelector("#requests-list");
    const empty = document.querySelector("#empty-state");
    const filters = document.querySelectorAll(".filter-btn");

    let requests = [];
    let currentFilter = "all";

    // ==========================================
    // CARREGAR SOLICITAÇÕES
    // ==========================================

    async function loadRequests() {

        try {

            const response = await fetch(
                `${API}/rentals/owner/${user._id}`
            );

            requests = await response.json();

            render();

        } catch (err) {

            console.error(err);
            alert("Erro ao carregar solicitações.");

        }

    }

    // ==========================================
    // FORMATAR DATA
    // ==========================================

    function formatDate(date) {

        return new Date(date)
            .toLocaleDateString("pt-BR");

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

            case "rejected":
                return "Recusada";

            case "finished":
                return "Finalizada";

            default:
                return status;

        }

    }

    // ==========================================
    // RENDER
    // ==========================================

    function render() {

        list.innerHTML = "";

        const filtered =
            currentFilter === "all"

                ? requests

                : requests.filter(r =>
                    r.status === currentFilter
                );

        if (!filtered.length) {

            empty.style.display = "block";
            return;

        }

        empty.style.display = "none";

        filtered.forEach(rental => {

            const renter = rental.renterId;
            const product = rental.productId;

            const initials = renter.name
                .split(" ")
                .map(n => n[0])
                .slice(0,2)
                .join("")
                .toUpperCase();

            const card = document.createElement("article");

            card.className = "request-card";

            card.innerHTML = `

                <div class="request-top">

                    <div class="request-user">

                        <div class="user-avatar">
                            ${initials}
                        </div>

                        <div class="user-info">

                            <h3>${renter.name}</h3>

                            <p>Solicitou um aluguel</p>

                        </div>

                    </div>

                    <span class="status ${rental.status}">
                        ${statusLabel(rental.status)}
                    </span>

                </div>

                <div class="product-box">

                    <div class="product-image">
                        ${product.image}
                    </div>

                    <div class="product-details">

                        <h4>${product.title}</h4>

                        <p>📍 ${product.city}</p>

                        <div class="price">
                            R$ ${rental.total}
                        </div>

                    </div>

                </div>

                <div class="request-info">

                    <div class="info-item">
                        <span>Retirada</span>
                        <strong>${formatDate(rental.startDate)}</strong>
                    </div>

                    <div class="info-item">
                        <span>Devolução</span>
                        <strong>${formatDate(rental.endDate)}</strong>
                    </div>

                    <div class="info-item">
                        <span>Dias</span>
                        <strong>${rental.days} dias</strong>
                    </div>

                    <div class="info-item">
                        <span>Total</span>
                        <strong>R$ ${rental.total}</strong>
                    </div>

                </div>

                <div class="request-actions">

                    ${
                        rental.status === "pending"

                        ? `

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

                        `

                        : ""

                    }

                    <button
                        class="btn-chat"
                        data-chat="${rental.chatId}">
                        Chat
                    </button>

                </div>

            `;

            list.appendChild(card);

        });

        addEvents();

    }

    // ==========================================
    // ACEITAR / RECUSAR
    // ==========================================

    function addEvents() {

        document.querySelectorAll(".btn-accept")
        .forEach(button => {

            button.onclick = async () => {

                await fetch(
                    `${API}/rentals/${button.dataset.id}/status`,
                    {

                        method:"PUT",

                        headers:{
                            "Content-Type":"application/json"
                        },

                        body:JSON.stringify({
                            status:"approved"
                        })

                    }
                );

                loadRequests();

            };

        });

        document.querySelectorAll(".btn-reject")
        .forEach(button => {

            button.onclick = async () => {

                await fetch(
                    `${API}/rentals/${button.dataset.id}/status`,
                    {

                        method:"PUT",

                        headers:{
                            "Content-Type":"application/json"
                        },

                        body:JSON.stringify({
                            status:"rejected"
                        })

                    }
                );

                loadRequests();

            };

        });

        document.querySelectorAll(".btn-chat")
        .forEach(button => {

            button.onclick = () => {

                window.location.href =
                    `chat.html?chat=${button.dataset.chat}`;

            };

        });

    }

    // ==========================================
    // FILTROS
    // ==========================================

    filters.forEach(button => {

        button.onclick = () => {

            filters.forEach(b =>
                b.classList.remove("active")
            );

            button.classList.add("active");

            currentFilter =
                button.dataset.status;

            render();

        };

    });

    await loadRequests();

});