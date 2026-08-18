document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api/chats";

    const user = JSON.parse(
        localStorage.getItem("alugase_user")
    );

    if (!user) {
        location.href = "login.html";
        return;
    }

    const chatId =
        new URLSearchParams(location.search).get("chat");

    const conversationList =
        document.querySelector("#conversation-list");

    const messages =
        document.querySelector("#messages");

    const input =
        document.querySelector("#message-input");

    const sendButton =
        document.querySelector("#send-btn");

    const toggleReservation =
        document.querySelector("#toggle-reservation");

    const reservationDetails =
        document.querySelector("#reservation-details");

    const reservationArrow =
        document.querySelector("#reservation-arrow");


    let chats = [];
    let currentChat = null;

    let sendingMessage = false;


    // ==========================================
    // RESERVA / CARD DO ALUGUEL
    // ==========================================

    if (
        toggleReservation &&
        reservationDetails
    ) {

        toggleReservation.addEventListener(
            "click",
            () => {

                const isOpen =
                    reservationDetails.classList.toggle("open");

                toggleReservation.classList.toggle(
                    "open",
                    isOpen
                );

                if (reservationArrow) {

                    reservationArrow.textContent =
                        isOpen ? "▲" : "▼";

                }

            }
        );

    }


    // ==========================================
    // CARREGAR CONVERSAS
    // ==========================================

    async function loadChats() {

        try {

            const response = await fetch(
                `${API}/user/${user._id}`
            );

            if (!response.ok) {

                throw new Error(
                    "Erro ao carregar conversas."
                );

            }

            const data = await response.json();

            chats = Array.isArray(data)
                ? data
                : [];


            if (!chats.length) {

                currentChat = null;

                conversationList.innerHTML =
                    "<p style='padding:20px;color:#6b7280;'>Nenhuma conversa.</p>";

                messages.innerHTML = "";

                return;

            }


            /*
             * Se já existe um chat selecionado,
             * tenta manter o mesmo.
             */

            currentChat =
                chats.find(
                    chat =>
                        String(chat._id) === String(chatId)
                ) ||
                chats[0];


            renderSidebar();
            renderChat();


        } catch (error) {

            console.error(
                "Erro ao carregar chats:",
                error
            );

            conversationList.innerHTML =
                "<p style='padding:20px;color:#ef4444;'>Erro ao carregar conversas.</p>";

        }

    }


    // ==========================================
    // SIDEBAR
    // ==========================================

    function renderSidebar() {

        conversationList.innerHTML = "";


        chats.forEach(chat => {

            const isOwner =
                String(chat.ownerId) ===
                String(user._id);


            const otherName = isOwner
                ? chat.renterName
                : chat.ownerName;


            const lastMessage =
                chat.messages &&
                chat.messages.length
                    ? chat.messages[
                        chat.messages.length - 1
                    ].text
                    : "Nova conversa";


            const card =
                document.createElement("div");


            card.className =
                `conversation ${
                    currentChat &&
                    String(currentChat._id) ===
                    String(chat._id)
                        ? "active"
                        : ""
                }`;


            const avatar =
                document.createElement("div");

            avatar.className = "avatar";

            avatar.textContent =
                (otherName || "?")
                    .charAt(0)
                    .toUpperCase();


            const info =
                document.createElement("div");

            info.className = "conv-info";


            const name =
                document.createElement("h4");

            name.textContent =
                otherName || "Usuário";


            const last =
                document.createElement("p");

            last.textContent =
                lastMessage;


            info.appendChild(name);
            info.appendChild(last);

            card.appendChild(avatar);
            card.appendChild(info);


            card.addEventListener(
                "click",
                () => {

                    currentChat = chat;

                    renderSidebar();
                    renderChat();


                    history.replaceState(
                        {},
                        "",
                        `chat.html?chat=${chat._id}`
                    );

                }
            );


            conversationList.appendChild(card);

        });

    }


    // ==========================================
    // RENDERIZAR CHAT
    // ==========================================

    function renderChat() {

        if (!currentChat) {
            return;
        }


        const isOwner =
            String(currentChat.ownerId) ===
            String(user._id);


        const otherName = isOwner
            ? currentChat.renterName
            : currentChat.ownerName;


        const chatName =
            document.querySelector("#chat-name");

        const chatAvatar =
            document.querySelector("#chat-avatar");

        const chatStatus =
            document.querySelector("#chat-status");

        const reservationProduct =
            document.querySelector(
                "#reservation-product"
            );

        const reservationProductShort =
            document.querySelector(
                "#reservation-product-short"
            );

        const viewProduct =
            document.querySelector("#view-product");


        if (chatName) {

            chatName.textContent =
                otherName || "Usuário";

        }


        if (chatAvatar) {

            chatAvatar.textContent =
                (otherName || "?")
                    .charAt(0)
                    .toUpperCase();

        }


        if (chatStatus) {

            chatStatus.textContent =
                currentChat.status || "Ativo";

        }


        if (reservationProduct) {

            reservationProduct.textContent =
                currentChat.productTitle ||
                "Produto";

        }


        if (reservationProductShort) {

            reservationProductShort.textContent =
                currentChat.productTitle ||
                "Produto";

        }


        if (viewProduct) {

            if (currentChat.productId) {

                viewProduct.href =
                    `produto.html?id=${currentChat.productId}`;

                viewProduct.style.display =
                    "";

            } else {

                viewProduct.style.display =
                    "none";

            }

        }


        // ==========================================
        // MENSAGENS
        // ==========================================

        messages.innerHTML = "";


        if (
            !currentChat.messages ||
            !currentChat.messages.length
        ) {

            const empty =
                document.createElement("div");

            empty.style.textAlign = "center";
            empty.style.color = "#6b7280";
            empty.style.padding = "30px";

            empty.textContent =
                "Nenhuma mensagem ainda.";

            messages.appendChild(empty);

            return;

        }


        currentChat.messages.forEach(msg => {

            const sent =
                String(msg.senderId) ===
                String(user._id);


            const bubble =
                document.createElement("div");


            bubble.className =
                `message ${
                    sent
                        ? "sent"
                        : "received"
                }`;


            const text =
                document.createElement("div");

            text.textContent =
                msg.text || "";


            const time =
                document.createElement("span");

            time.className = "time";


            const date =
                new Date(msg.createdAt);


            time.textContent =
                date.toLocaleTimeString(
                    "pt-BR",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            bubble.appendChild(text);
            bubble.appendChild(time);


            messages.appendChild(bubble);

        });


        messages.scrollTop =
            messages.scrollHeight;

    }


    // ==========================================
    // VERIFICAR NOVAS MENSAGENS
    // ==========================================

    async function checkNewMessages() {

        if (!currentChat) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API}/${currentChat._id}`
                );


            if (!response.ok) {
                return;
            }


            const updatedChat =
                await response.json();


            if (!updatedChat) {
                return;
            }


            const oldMessages =
                currentChat.messages || [];


            const newMessages =
                updatedChat.messages || [];


            /*
             * Verifica quantidade.
             *
             * Também verifica o ID da última
             * mensagem para evitar renderizações
             * desnecessárias.
             */

            const oldLast =
                oldMessages.length
                    ? oldMessages[
                        oldMessages.length - 1
                    ]
                    : null;


            const newLast =
                newMessages.length
                    ? newMessages[
                        newMessages.length - 1
                    ]
                    : null;


            const hasNewMessage =
                newMessages.length !==
                oldMessages.length;


            const lastMessageChanged =
                newLast &&
                oldLast &&
                String(newLast._id) !==
                String(oldLast._id);


            if (
                hasNewMessage ||
                lastMessageChanged
            ) {

                currentChat =
                    updatedChat;


                /*
                 * Atualiza o chat aberto.
                 */

                renderChat();


                /*
                 * Atualiza a última mensagem
                 * da sidebar.
                 */

                const index =
                    chats.findIndex(
                        chat =>
                            String(chat._id) ===
                            String(updatedChat._id)
                    );


                if (index !== -1) {

                    chats[index] =
                        updatedChat;

                    renderSidebar();

                }

            }

        } catch (error) {

            /*
             * Não mostramos alerta para o usuário,
             * porque uma falha momentânea no polling
             * não deve atrapalhar o chat.
             */

            console.error(
                "Erro ao verificar mensagens:",
                error
            );

        }

    }


    // ==========================================
    // ENVIAR MENSAGEM
    // ==========================================

    async function sendMessage() {

        if (sendingMessage) {
            return;
        }


        if (!currentChat) {

            alert(
                "Selecione uma conversa."
            );

            return;

        }


        const text =
            input.value.trim();


        if (!text) {
            return;
        }


        sendingMessage = true;


        if (sendButton) {

            sendButton.disabled = true;
            sendButton.textContent = "Enviando...";

        }


        try {

            const response =
                await fetch(
                    `${API}/${currentChat._id}/messages`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            senderId:
                                user._id,

                            text:
                                text

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.error ||
                    "Erro ao enviar mensagem."
                );

                return;

            }


            /*
             * O backend devolve o chat atualizado.
             * Então podemos atualizar imediatamente,
             * sem esperar os 2 segundos do polling.
             */

            currentChat = data;


            input.value = "";


            renderChat();
            renderSidebar();


        } catch (error) {

            console.error(
                "Erro ao enviar mensagem:",
                error
            );


            alert(
                "Não foi possível enviar a mensagem."
            );


        } finally {

            sendingMessage = false;


            if (sendButton) {

                sendButton.disabled = false;
                sendButton.textContent = "Enviar";

            }

        }

    }


    // ==========================================
    // EVENTOS
    // ==========================================

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendMessage
        );

    }


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    // ==========================================
    // INICIAR
    // ==========================================

    await loadChats();


    /*
     * Verifica novas mensagens a cada 2 segundos.
     */

    setInterval(
        checkNewMessages,
        2000
    );

});