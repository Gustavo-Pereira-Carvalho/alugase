// ==========================================
// ALUGASE — PAINEL ADMIN
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api";

    // ==========================================
    // DADOS TEMPORÁRIOS
    // (Chat será substituído pelo backend)
    // ==========================================

    let users = 0;
    let ads = 0;

    let verifications = [
        {
            id: 1,
            name: "Mariana Oliveira",
            cpf: "123.456.789-00",
            status: "Pendente"
        },
        {
            id: 2,
            name: "Lucas Pereira",
            cpf: "987.654.321-00",
            status: "Pendente"
        }
    ];

    let disputes = [
        {
            id: 1,
            product: "Câmera Canon EOS",
            value: "R$ 300",
            reason: "Produto voltou com risco"
        },
        {
            id: 2,
            product: "Notebook Lenovo",
            value: "R$ 500",
            reason: "Atraso na devolução"
        }
    ];

    let chats = [
        {
            id: 1,
            user: "Gustavo Pereira",
            status: "Aberto",
            messages: [
                {
                    from: "user",
                    text: "Olá, meu produto voltou danificado."
                },
                {
                    from: "support",
                    text: "Pode enviar fotos do produto?"
                }
            ]
        }
    ];

    let currentChat = chats[0];

    // ==========================================
    // CARREGAR MÉTRICAS
    // ==========================================

    async function loadMetrics() {

        try {

            const products = await fetch(`${API}/products`)
                .then(r => r.json());

            ads = products.length;

            // Até criarmos a rota /users
            users = 152;

            document.querySelector("#users-count").textContent = users;
            document.querySelector("#ads-count").textContent = ads;
            document.querySelector("#tickets-count").textContent = chats.length;
            document.querySelector("#verify-count").textContent =
                verifications.length;

        } catch (error) {

            console.error(error);

        }

    }

    // ==========================================
    // ABAS
    // ==========================================

    document.querySelectorAll(".tab").forEach(tab => {

        tab.onclick = () => {

            document
                .querySelectorAll(".tab")
                .forEach(t => t.classList.remove("active"));

            document
                .querySelectorAll(".content")
                .forEach(c => c.classList.remove("active"));

            tab.classList.add("active");

            document
                .querySelector(`#${tab.dataset.tab}`)
                .classList.add("active");

        };

    });

    // ==========================================
    // CHAT
    // ==========================================

    const chatList = document.querySelector("#chat-list");
    const messages = document.querySelector("#messages");

    function renderChatList() {

        chatList.innerHTML = "";

        chats.forEach(chat => {

            const item = document.createElement("div");

            item.className =
                `chat-item ${currentChat.id === chat.id ? "active" : ""}`;

            item.innerHTML = `
                <h4>${chat.user}</h4>
                <p>${chat.messages.at(-1).text}</p>
            `;

            item.onclick = () => {

                currentChat = chat;

                renderChatList();
                renderMessages();

            };

            chatList.appendChild(item);

        });

    }

    function renderMessages() {

        document.querySelector("#chat-user").textContent =
            currentChat.user;

        document.querySelector("#chat-status").textContent =
            currentChat.status;

        messages.innerHTML = "";

        currentChat.messages.forEach(msg => {

            const div = document.createElement("div");

            div.className =
                `message ${msg.from === "user" ? "user" : "support"}`;

            div.textContent = msg.text;

            messages.appendChild(div);

        });

        messages.scrollTop = messages.scrollHeight;

    }

    document.querySelector("#send-message").onclick = () => {

        const input = document.querySelector("#message-input");

        if (!input.value.trim()) return;

        currentChat.messages.push({

            from: "support",
            text: input.value

        });

        input.value = "";

        renderMessages();
        renderChatList();

    };

    // ==========================================
    // VERIFICAÇÕES
    // ==========================================

    function renderVerify() {

        const list = document.querySelector("#verify-list");

        list.innerHTML = "";

        verifications.forEach(person => {

            const card = document.createElement("div");

            card.className = "item-card";

            card.innerHTML = `
                <div>
                    <h3>${person.name}</h3>
                    <p>${person.cpf}</p>
                    <span class="status pending">${person.status}</span>
                </div>

                <button class="btn-primary approve">
                    Aprovar
                </button>
            `;

            card.querySelector(".approve").onclick = () => {

                person.status = "Aprovado";

                renderVerify();

            };

            list.appendChild(card);

        });

    }

    // ==========================================
    // DISPUTAS
    // ==========================================

    function renderDisputes() {

        const list = document.querySelector("#dispute-list");

        list.innerHTML = "";

        disputes.forEach(item => {

            const card = document.createElement("div");

            card.className = "item-card";

            card.innerHTML = `
                <div>
                    <h3>${item.product}</h3>
                    <p>${item.reason}</p>
                    <strong>Caução: ${item.value}</strong>
                </div>

                <button class="btn-primary close">
                    Encerrar
                </button>
            `;

            card.querySelector(".close").onclick = () => {

                disputes = disputes.filter(
                    d => d.id !== item.id
                );

                renderDisputes();

            };

            list.appendChild(card);

        });

    }

    // ==========================================
    // DASHBOARD
    // ==========================================

    document.querySelector("#activity-list").innerHTML = `
        <p>🟢 Nova solicitação de verificação recebida.</p>
        <p>💬 Atendimento aberto por um usuário.</p>
        <p>📦 Novo anúncio publicado.</p>
        <p>⭐ Reserva concluída com sucesso.</p>
    `;

    // ==========================================
    // LOGOUT
    // ==========================================

    document.querySelector("#logout").onclick = () => {

        window.location.href = "index.html";

    };

    // ==========================================
    // INICIAR
    // ==========================================

    await loadMetrics();

    renderChatList();
    renderMessages();
    renderVerify();
    renderDisputes();

});