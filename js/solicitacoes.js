// ==========================================
// ALUGASE — SOLICITAÇÕES
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // ==========================================
    // DADOS (temporário)
    // Em casa virá do MongoDB
    // ==========================================

    let requests = JSON.parse(
        localStorage.getItem("alugase_requests")
    ) || [

        {
            id: "req001",
            ownerId: user._id,

            renterId: "user002",
            renterName: "Mariana Costa",

            productId: "prod001",
            productTitle: "Câmera Canon EOS",
            productImage: "📷",

            city: "São Paulo",

            startDate: "2026-08-18",
            endDate: "2026-08-20",

            days: 3,
            total: 240,

            status: "pending",

            chatId: "chat001"
        },

        {
            id: "req002",
            ownerId: user._id,

            renterId: "user003",
            renterName: "Lucas Almeida",

            productId: "prod002",
            productTitle: "Notebook Lenovo",
            productImage: "💻",

            city: "Guarulhos",

            startDate: "2026-08-25",
            endDate: "2026-08-27",

            days: 3,
            total: 210,

            status: "approved",

            chatId: "chat002"
        }

    ];

    const list = document.querySelector("#requests-list");
    const empty = document.querySelector("#empty-state");

    const filters = document.querySelectorAll(".filter-btn");

    let currentFilter = "all";

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
    // RENDERIZAR
    // ==========================================

    function render() {

        list.innerHTML = "";

        const filtered =
            currentFilter === "all"

                ? requests

                : requests.filter(r =>
                    r.status === currentFilter
                );

        if (filtered.length === 0) {

            empty.style.display = "block";
            return;

        }

        empty.style.display = "none";

        filtered.forEach(request => {

            const initials = request.renterName
                .split(" ")
                .map(n => n[0])
                .slice(0, 2)
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

                            <h3>${request.renterName}</h3>

                            <p>Solicitou um aluguel</p>

                        </div>

                    </div>

                    <span class="status ${request.status}">
                        ${statusLabel(request.status)}
                    </span>

                </div>


                <div class="product-box">

                    <div class="product-image">
                        ${request.productImage}
                    </div>

                    <div class="product-details">

                        <h4>${request.productTitle}</h4>

                        <p>📍 ${request.city}</p>

                        <div class="price">
                            R$ ${request.total}
                        </div>

                    </div>

                </div>


                <div class="request-info">

                    <div class="info-item">

                        <span>Retirada</span>

                        <strong>
                            ${formatDate(request.startDate)}
                        </strong>

                    </div>

                    <div class="info-item">

                        <span>Devolução</span>

                        <strong>
                            ${formatDate(request.endDate)}
                        </strong>

                    </div>

                    <div class="info-item">

                        <span>Duração</span>

                        <strong>
                            ${request.days} dias
                        </strong>

                    </div>

                    <div class="info-item">

                        <span>Total</span>

                        <strong>
                            R$ ${request.total}
                        </strong>

                    </div>

                </div>


                <div class="request-actions">

                    ${
                        request.status === "pending"

                        ? `

                        <button
                            class="btn-accept"
                            data-id="${request.id}"
                        >
                            Aceitar
                        </button>

                        <button
                            class="btn-reject"
                            data-id="${request.id}"
                        >
                            Recusar
                        </button>

                        `

                        : ""

                    }

                    <button
                        class="btn-chat"
                        data-chat="${request.chatId}"
                    >
                        Chat
                    </button>

                </div>

            `;

            list.appendChild(card);

        });

        addEvents();

    }

    // ==========================================
    // EVENTOS DOS BOTÕES
    // ==========================================

    function addEvents() {

        document
            .querySelectorAll(".btn-accept")
            .forEach(button => {

                button.onclick = () => {

                    const id = button.dataset.id;

                    const request = requests.find(
                        r => r.id === id
                    );

                    request.status = "approved";

                    save();

                    alert(
                        "Solicitação aprovada!"
                    );

                    render();

                };

            });

        document
            .querySelectorAll(".btn-reject")
            .forEach(button => {

                button.onclick = () => {

                    const id = button.dataset.id;

                    const request = requests.find(
                        r => r.id === id
                    );

                    request.status = "rejected";

                    save();

                    alert(
                        "Solicitação recusada."
                    );

                    render();

                };

            });

        document
            .querySelectorAll(".btn-chat")
            .forEach(button => {

                button.onclick = () => {

                    window.location.href =
                        `chat.html?id=${button.dataset.chat}`;

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

    // ==========================================
    // SALVAR
    // ==========================================

    function save() {

        localStorage.setItem(
            "alugase_requests",
            JSON.stringify(requests)
        );

    }

    render();

});