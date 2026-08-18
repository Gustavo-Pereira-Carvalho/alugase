// ==========================================
// ALUGASE — CHAT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const chatId = new URLSearchParams(location.search).get("chat");

    const reservations =
        JSON.parse(localStorage.getItem("alugase_reservations")) || [];

    const chats =
        JSON.parse(localStorage.getItem("alugase_chats")) || [];

    let reservation =
        reservations.find(r => r.id === chatId) || reservations[0];

    let currentChat =
        chats.find(c => c.id === chatId) || chats[0];

    if (!reservation || !currentChat) {
        alert("Conversa não encontrada.");
        location.href = "perfil.html";
        return;
    }

    const list = document.querySelector("#conversation-list");
    const messages = document.querySelector("#messages");
    const input = document.querySelector("#message-input");

    function saveChats() {

        localStorage.setItem(
            "alugase_chats",
            JSON.stringify(chats)
        );

    }

    function renderSidebar() {

        list.innerHTML = "";

        chats.forEach(chat => {

            const last =
                chat.messages[chat.messages.length - 1];

            const card = document.createElement("div");

            card.className =
                "conversation" +
                (chat.id === currentChat.id ? " active" : "");

            card.innerHTML = `
                <div class="avatar">${chat.ownerAvatar}</div>

                <div class="conv-info">
                    <h4>${chat.owner}</h4>
                    <p>${last?.text || "Sem mensagens"}</p>
                </div>
            `;

            card.onclick = () => {

                currentChat = chat;

                reservation =
                    reservations.find(r => r.id === chat.id);

                renderSidebar();
                renderChat();

            };

            list.appendChild(card);

        });

    }

    function renderReservation() {

        document.querySelector("#chat-avatar").textContent =
            currentChat.ownerAvatar;

        document.querySelector("#chat-name").textContent =
            currentChat.owner;

        document.querySelector("#chat-status").textContent =
            currentChat.online ? "Online" : "Offline";

        document.querySelector("#reservation-status").textContent =
            "Solicitado";

        document.querySelector("#reservation-product").textContent =
            reservation.productTitle;

        document.querySelector("#reservation-period").textContent =
            `${reservation.startDate} até ${reservation.endDate}`;

        document.querySelector("#reservation-total").textContent =
            reservation.total;

        document.querySelector("#reservation-delivery").textContent =
            reservation.delivery === "delivery"
                ? "Entrega"
                : "Retirada";

        document.querySelector("#reservation-deposit").textContent =
            "Conforme anúncio";

        document.querySelector("#reservation-days").textContent =
            "Reserva em andamento";

        document.querySelector("#view-product").href =
            `produto.html?id=${reservation.productId}`;

    }

    function renderMessages() {

        messages.innerHTML = "";

        currentChat.messages.forEach(msg => {

            const bubble = document.createElement("div");

            bubble.className =
                `message ${msg.sender === "user" ? "sent" : "received"}`;

            bubble.innerHTML = `
                ${msg.text}
                <span class="time">${msg.time}</span>
            `;

            messages.appendChild(bubble);

        });

        messages.scrollTop = messages.scrollHeight;

    }

    function renderChat() {

        renderReservation();
        renderMessages();

    }

    function sendMessage() {

        const text = input.value.trim();

        if (!text) return;

        const time = new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });

        currentChat.messages.push({
            sender: "user",
            text,
            time
        });

        saveChats();

        renderSidebar();
        renderMessages();

        input.value = "";

        // Simulação temporária do proprietário
        setTimeout(() => {

            currentChat.messages.push({
                sender: "owner",
                text: "Mensagem recebida! Em breve confirmarei sua reserva.",
                time: new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                })
            });

            saveChats();

            renderSidebar();
            renderMessages();

        }, 1200);

    }

    document.querySelector("#send-btn").onclick = sendMessage;

    input.addEventListener("keydown", e => {

        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }

    });

    renderSidebar();
    renderChat();

});