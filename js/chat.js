document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api/chats";

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    if (!user) {
        location.href = "login.html";
        return;
    }

    const chatId = new URLSearchParams(location.search).get("chat");

    const conversationList = document.querySelector("#conversation-list");
    const messages = document.querySelector("#messages");
    const input = document.querySelector("#message-input");

    let chats = [];
    let currentChat = null;

    // ==========================
    // CARREGAR CONVERSAS
    // ==========================

    async function loadChats() {

        const response = await fetch(
            `${API}/user/${user._id}`
        );

        chats = await response.json();

        if (!chats.length) {

            conversationList.innerHTML =
                "<p>Nenhuma conversa.</p>";

            return;

        }

        currentChat =
            chats.find(c => c._id === chatId) ||
            chats[0];

        renderSidebar();
        renderChat();

    }

    // ==========================
    // SIDEBAR
    // ==========================

    function renderSidebar() {

        conversationList.innerHTML = "";

        chats.forEach(chat => {

            const isOwner =
                String(chat.ownerId) === String(user._id);

            const otherName = isOwner
                ? chat.renterName
                : chat.ownerName;

            const last =
                chat.messages.at(-1)?.text ||
                "Nova conversa";

            const card = document.createElement("div");

            card.className =
                `conversation ${
                    currentChat._id === chat._id
                        ? "active"
                        : ""
                }`;

            card.innerHTML = `
                <div class="avatar">
                    ${otherName.charAt(0).toUpperCase()}
                </div>

                <div class="conv-info">
                    <h4>${otherName}</h4>
                    <p>${last}</p>
                </div>
            `;

            card.onclick = () => {

                currentChat = chat;

                renderSidebar();
                renderChat();

                history.replaceState(
                    {},
                    "",
                    `chat.html?chat=${chat._id}`
                );

            };

            conversationList.appendChild(card);

        });

    }

    // ==========================
    // CHAT
    // ==========================

    function renderChat() {

        const isOwner =
            String(currentChat.ownerId) === String(user._id);

        const otherName = isOwner
            ? currentChat.renterName
            : currentChat.ownerName;

        document.querySelector("#chat-name").textContent =
            otherName;

        document.querySelector("#chat-avatar").textContent =
            otherName.charAt(0).toUpperCase();

        document.querySelector("#chat-status").textContent =
            currentChat.status || "Ativo";

        document.querySelector("#reservation-product").textContent =
            currentChat.productTitle;

        document.querySelector("#view-product").href =
            `produto.html?id=${currentChat.productId}`;

        messages.innerHTML = "";

        currentChat.messages.forEach(msg => {

            const sent =
                String(msg.senderId) === String(user._id);

            const bubble = document.createElement("div");

            bubble.className =
                `message ${sent ? "sent" : "received"}`;

            bubble.innerHTML = `
                ${msg.text}

                <span class="time">
                    ${new Date(msg.createdAt)
                        .toLocaleTimeString(
                            "pt-BR",
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        )}
                </span>
            `;

            messages.appendChild(bubble);

        });

        messages.scrollTop =
            messages.scrollHeight;

    }

    // ==========================
    // ENVIAR
    // ==========================

async function sendMessage() {

    const text = input.value.trim();

    if (!text) return;

    const response = await fetch(
        `${API}/${currentChat._id}/messages`,
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                senderId: user._id,
                text

            })

        }
    );

    const data = await response.json();

    if (!response.ok) {

        alert(data.error || "Erro ao enviar mensagem.");
        return;

    }

    input.value = "";

    await loadChats();

}

    document.querySelector("#send-btn")
        .onclick = sendMessage;

    input.addEventListener("keydown", e => {

        if (e.key === "Enter") {

            e.preventDefault();

            sendMessage();

        }

    });

    await loadChats();

});