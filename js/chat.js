document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api/chats";

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    if (!user) {
        location.href = "login.html";
        return;
    }

    const chatId = new URLSearchParams(location.search).get("chat");

    const messages = document.querySelector("#messages");
    const input = document.querySelector("#message-input");

    let chat;

    async function loadChat() {

        const response = await fetch(`${API}/${chatId}`);

        chat = await response.json();

        render();

    }

    function render() {

        document.querySelector("#chat-name").textContent =
            chat.ownerName;

        document.querySelector("#chat-avatar").textContent =
            chat.ownerName.charAt(0);

        document.querySelector("#chat-status").textContent =
            chat.status;

        document.querySelector("#reservation-product").textContent =
            chat.productTitle;

        messages.innerHTML = "";

        chat.messages.forEach(msg => {

            const bubble = document.createElement("div");

            bubble.className =
                `message ${
                    msg.sender === "user"
                    ? "sent"
                    : "received"
                }`;

            bubble.innerHTML = `
                ${msg.text}
                <span class="time">
                    ${new Date(msg.createdAt)
                        .toLocaleTimeString("pt-BR",{
                            hour:"2-digit",
                            minute:"2-digit"
                        })}
                </span>
            `;

            messages.appendChild(bubble);

        });

        messages.scrollTop = messages.scrollHeight;

    }

    async function sendMessage() {

        const text = input.value.trim();

        if (!text) return;

        await fetch(`${API}/${chatId}/messages`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                sender: "user",
                text

            })

        });

        input.value = "";

        await loadChat();

    }

    document.querySelector("#send-btn").onclick =
        sendMessage;

    input.addEventListener("keydown", e => {

        if (e.key === "Enter") {

            e.preventDefault();
            sendMessage();

        }

    });

    await loadChat();

});