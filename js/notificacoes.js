// ==========================================
// ALUGASE — NOTIFICAÇÕES
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // ==========================================
    // NOTIFICAÇÕES (temporário)
    // Em casa virá do MongoDB
    // ==========================================

    let notifications = JSON.parse(
        localStorage.getItem("alugase_notifications")
    ) || [

        {
            id: "n001",
            type: "request",
            title: "Nova solicitação recebida",
            message: "Mariana quer alugar sua Câmera Canon EOS.",
            icon: "📦",
            read: false,
            time: "Agora",
            link: "solicitacoes.html"
        },

        {
            id: "n002",
            type: "chat",
            title: "Nova mensagem",
            message: "Lucas enviou uma mensagem no chat.",
            icon: "💬",
            read: false,
            time: "12 min",
            link: "chat.html?id=chat002"
        },

        {
            id: "n003",
            type: "approved",
            title: "Aluguel aprovado",
            message: "Seu pedido do Notebook Lenovo foi aprovado.",
            icon: "✅",
            read: true,
            time: "1 hora",
            link: "chat.html?id=chat003"
        }

    ];

    const list = document.querySelector("#notifications-list");
    const empty = document.querySelector("#empty-state");

    // ==========================================
    // SALVAR
    // ==========================================

    function save() {

        localStorage.setItem(
            "alugase_notifications",
            JSON.stringify(notifications)
        );

    }

    // ==========================================
    // RENDER
    // ==========================================

    function render() {

        list.innerHTML = "";

        if (notifications.length === 0) {

            empty.style.display = "block";
            return;

        }

        empty.style.display = "none";

        notifications.forEach(notification => {

            const card = document.createElement("article");

            card.className =
                `notification-card ${
                    notification.read ? "" : "unread"
                }`;

            card.innerHTML = `

                <div class="notification-icon">
                    ${notification.icon}
                </div>

                <div class="notification-content">

                    <h3>${notification.title}</h3>

                    <p>${notification.message}</p>

                    <span class="notification-time">
                        ${notification.time}
                    </span>

                </div>

            `;

            card.onclick = () => {

                notification.read = true;

                save();

                render();

                window.location.href = notification.link;

            };

            list.appendChild(card);

        });

    }

    // ==========================================
    // MARCAR TODAS
    // ==========================================

    document
        .querySelector("#read-all")
        .addEventListener("click", () => {

            notifications.forEach(n => {

                n.read = true;

            });

            save();

            render();

        });

    render();

})