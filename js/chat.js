document.addEventListener("DOMContentLoaded", async () => {

    // ==========================================
    // CONFIGURAÇÃO
    // ==========================================

    const API =
        "https://alugase-api.onrender.com/api/chats";

    const RENTALS_API =
        "https://alugase-api.onrender.com/api/rentals";


    // ==========================================
    // USUÁRIO
    // ==========================================

    const user =
        JSON.parse(
            localStorage.getItem("alugase_user")
        );


    if (!user || !user._id) {

        location.href =
            "login.html";

        return;

    }


    // ==========================================
    // ELEMENTOS
    // ==========================================

    const chatId =
        new URLSearchParams(
            location.search
        ).get("chat");


    const conversationList =
        document.querySelector(
            "#conversation-list"
        );


    const messages =
        document.querySelector(
            "#messages"
        );


    const input =
        document.querySelector(
            "#message-input"
        );


    const sendButton =
        document.querySelector(
            "#send-btn"
        );


    const toggleReservation =
        document.querySelector(
            "#toggle-reservation"
        );


    const reservationDetails =
        document.querySelector(
            "#reservation-details"
        );


    const reservationArrow =
        document.querySelector(
            "#reservation-arrow"
        );


    const badge =
        document.querySelector(
            "#notification-badge"
        );


    let chats = [];

    let currentChat = null;

    let sendingMessage = false;


    // ==========================================
    // COMPARAR IDS
    // ==========================================

    function sameId(a, b) {

        if (!a || !b) {
            return false;
        }

        return String(a) === String(b);

    }


    // ==========================================
    // DINHEIRO
    // ==========================================

    function formatMoney(value) {

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
    // DATA
    // ==========================================

    function formatDate(value) {

        if (!value) {
            return "--";
        }


        const date =
            new Date(value);


        if (isNaN(date.getTime())) {
            return "--";
        }


        return date.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }


    // ==========================================
    // STATUS
    // ==========================================

    function rentalStatus(status) {

        const statuses = {

            pending: "Solicitado",

            approved: "Aprovado",

            rejected: "Recusado",

            active: "Em andamento",

            finished: "Finalizado"

        };


        return statuses[status] ||
            status ||
            "Solicitado";

    }


    // ==========================================
    // CRIAR AVATAR
    // ==========================================

    function createAvatar(
        name,
        profileImage,
        className = "avatar"
    ) {

        const avatar =
            document.createElement("div");


        avatar.className =
            className;


        // ======================================
        // FOTO
        // ======================================

        if (
            profileImage &&
            typeof profileImage === "string" &&
            profileImage.trim() !== ""
        ) {

            const img =
                document.createElement("img");


            img.src =
                profileImage;


            img.alt =
                `Foto de ${name || "usuário"}`;


            img.className =
                "avatar-image";


            img.loading =
                "lazy";


            img.onerror =
                () => {

                    img.remove();

                    avatar.textContent =
                        (name || "?")
                            .charAt(0)
                            .toUpperCase();

                };


            avatar.appendChild(
                img
            );


        } else {

            // ==================================
            // INICIAL
            // ==================================

            avatar.textContent =
                (name || "?")
                    .charAt(0)
                    .toUpperCase();

        }


        return avatar;

    }


    // ==========================================
    // PEGAR OUTRO USUÁRIO
    // ==========================================

    function getOtherUser(chat) {

        const owner =
            chat.ownerId;


        const renter =
            chat.renterId;


        const ownerId =
            owner?._id ||
            owner;


        const renterId =
            renter?._id ||
            renter;


        const isOwner =
            sameId(
                ownerId,
                user._id
            );


        if (isOwner) {

            return {

                id:
                    renterId,

                name:
                    renter?.name ||
                    chat.renterName ||
                    "Usuário",

                profileImage:
                    renter?.profileImage ||
                    ""

            };

        }


        return {

            id:
                ownerId,

            name:
                owner?.name ||
                chat.ownerName ||
                "Usuário",

            profileImage:
                owner?.profileImage ||
                ""

        };

    }


    // ==========================================
    // NOTIFICAÇÕES
    // ==========================================

    async function loadNotifications() {

        if (!badge) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${RENTALS_API}/user/${user._id}`
                );


            if (!response.ok) {
                return;
            }


            const rentals =
                await response.json();


            if (!Array.isArray(rentals)) {
                return;
            }


            const pending =
                rentals.filter(
                    rental => {

                        const ownerId =
                            rental.ownerId?._id ||
                            rental.ownerId;


                        return (
                            sameId(
                                ownerId,
                                user._id
                            ) &&
                            rental.status === "pending"
                        );

                    }
                ).length;


            if (pending > 0) {

                badge.style.display =
                    "flex";

                badge.textContent =
                    pending;

            } else {

                badge.style.display =
                    "none";

            }


        } catch (error) {

            console.log(
                "Notificações indisponíveis.",
                error
            );

        }

    }


    // ==========================================
    // ABRIR / FECHAR ALUGUEL
    // ==========================================

    if (
        toggleReservation &&
        reservationDetails
    ) {

        toggleReservation.addEventListener(
            "click",
            () => {

                const opened =
                    reservationDetails.classList.toggle(
                        "open"
                    );


                toggleReservation.classList.toggle(
                    "open",
                    opened
                );


                if (reservationArrow) {

                    reservationArrow.textContent =
                        opened
                            ? "▲"
                            : "▼";

                }

            }
        );

    }


    // ==========================================
    // CARD DO ALUGUEL
    // ==========================================

    function renderRentalCard() {

        if (!currentChat) {
            return;
        }


        const rental =
            currentChat.rentalId;


        if (!rental) {
            return;
        }


        const productTitle =
            currentChat.productTitle ||
            "Produto";


        const productShort =
            document.querySelector(
                "#reservation-product-short"
            );


        const product =
            document.querySelector(
                "#reservation-product"
            );


        const status =
            document.querySelector(
                "#reservation-status"
            );


        const period =
            document.querySelector(
                "#reservation-period"
            );


        const total =
            document.querySelector(
                "#reservation-total"
            );


        const days =
            document.querySelector(
                "#reservation-days"
            );


        const delivery =
            document.querySelector(
                "#reservation-delivery"
            );


        const deposit =
            document.querySelector(
                "#reservation-deposit"
            );


        if (productShort) {

            productShort.textContent =
                productTitle;

        }


        if (product) {

            product.textContent =
                productTitle;

        }


        if (status) {

            status.textContent =
                rentalStatus(
                    rental.status
                );

        }


        if (period) {

            period.textContent =
                `${formatDate(
                    rental.startDate
                )} até ${formatDate(
                    rental.endDate
                )}`;

        }


        if (total) {

            total.textContent =
                formatMoney(
                    rental.total
                );

        }


        if (days) {

            const totalDays =
                Number(
                    rental.days || 0
                );


            days.textContent =
                `${totalDays} ${
                    totalDays === 1
                        ? "dia"
                        : "dias"
                }`;

        }


        if (delivery) {

            if (rental.delivery) {

                const deliveryPrice =
                    Number(
                        rental.deliveryPrice || 0
                    );


                delivery.textContent =
                    deliveryPrice > 0
                        ? `Entrega (${formatMoney(
                            deliveryPrice
                        )})`
                        : "Entrega";

            } else {

                delivery.textContent =
                    "Retirada";

            }

        }


        if (deposit) {

            deposit.textContent =
                formatMoney(
                    rental.deposit
                );

        }

    }


    // ==========================================
    // CARREGAR CHATS
    // ==========================================

    async function loadChats() {

        try {

            conversationList.innerHTML =
                `
                <p style="
                    padding:20px;
                    color:#6b7280;
                ">
                    Carregando conversas...
                </p>
                `;


            const response =
                await fetch(
                    `${API}/user/${user._id}`
                );


            if (!response.ok) {

                throw new Error(
                    `Erro HTTP ${response.status}`
                );

            }


            const data =
                await response.json();


            console.log(
                "Chats recebidos:",
                data
            );


            chats =
                Array.isArray(data)
                    ? data
                    : [];


            if (!chats.length) {

                currentChat = null;


                conversationList.innerHTML =
                    `
                    <p style="
                        padding:20px;
                        color:#6b7280;
                    ">
                        Nenhuma conversa.
                    </p>
                    `;


                messages.innerHTML =
                    `
                    <div style="
                        text-align:center;
                        padding:40px 20px;
                        color:#6b7280;
                    ">
                        Nenhuma conversa encontrada.
                    </div>
                    `;


                return;

            }


            currentChat =
                chats.find(
                    chat =>
                        sameId(
                            chat._id,
                            chatId
                        )
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
                `
                <div style="padding:20px;">

                    <p style="
                        color:#ef4444;
                        font-weight:600;
                    ">
                        Erro ao carregar conversas.
                    </p>

                    <p style="
                        color:#6b7280;
                        font-size:14px;
                    ">
                        Não foi possível conectar
                        ao servidor.
                    </p>

                </div>
                `;

        }

    }


    // ==========================================
    // SIDEBAR
    // ==========================================

    function renderSidebar() {

        conversationList.innerHTML = "";


        chats.forEach(chat => {

            const otherUser =
                getOtherUser(chat);


            const lastMessage =
                chat.messages &&
                chat.messages.length
                    ? chat.messages[
                        chat.messages.length - 1
                    ].text
                    : "Nova conversa";


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                `conversation ${
                    currentChat &&
                    sameId(
                        currentChat._id,
                        chat._id
                    )
                        ? "active"
                        : ""
                }`;


            // ==================================
            // AVATAR COM FOTO
            // ==================================

            const avatar =
                createAvatar(
                    otherUser.name,
                    otherUser.profileImage
                );


            // ==================================
            // INFORMAÇÕES
            // ==================================

            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "conv-info";


            const name =
                document.createElement(
                    "h4"
                );


            name.textContent =
                otherUser.name;


            const last =
                document.createElement(
                    "p"
                );


            last.textContent =
                lastMessage ||
                "Nova conversa";


            info.appendChild(
                name
            );

            info.appendChild(
                last
            );


            card.appendChild(
                avatar
            );

            card.appendChild(
                info
            );


            // ==================================
            // ABRIR CHAT
            // ==================================

            card.addEventListener(
                "click",
                () => {

                    currentChat =
                        chat;


                    renderSidebar();

                    renderChat();


                    history.replaceState(
                        {},
                        "",
                        `chat.html?chat=${chat._id}`
                    );

                }
            );


            conversationList.appendChild(
                card
            );

        });

    }


    // ==========================================
    // RENDERIZAR CHAT
    // ==========================================

    function renderChat() {

        if (!currentChat) {
            return;
        }


        const otherUser =
            getOtherUser(
                currentChat
            );


        const chatName =
            document.querySelector(
                "#chat-name"
            );


        const chatAvatar =
            document.querySelector(
                "#chat-avatar"
            );


        const chatStatus =
            document.querySelector(
                "#chat-status"
            );


        const viewProduct =
            document.querySelector(
                "#view-product"
            );


        // ======================================
        // NOME
        // ======================================

        if (chatName) {

            chatName.textContent =
                otherUser.name;

        }


        // ======================================
        // FOTO DO CHAT
        // ======================================

        if (chatAvatar) {

            chatAvatar.innerHTML = "";


            if (
                otherUser.profileImage &&
                otherUser.profileImage.trim() !== ""
            ) {

                const img =
                    document.createElement(
                        "img"
                    );


                img.src =
                    otherUser.profileImage;


                img.alt =
                    `Foto de ${otherUser.name}`;


                img.className =
                    "avatar-image";


                img.onerror =
                    () => {

                        img.remove();

                        chatAvatar.textContent =
                            otherUser.name
                                .charAt(0)
                                .toUpperCase();

                    };


                chatAvatar.appendChild(
                    img
                );


            } else {

                chatAvatar.textContent =
                    otherUser.name
                        .charAt(0)
                        .toUpperCase();

            }

        }


        // ======================================
        // STATUS
        // ======================================

        if (chatStatus) {

            chatStatus.textContent =
                currentChat.status ||
                "Ativo";

        }


        // ======================================
        // PRODUTO
        // ======================================

        if (viewProduct) {

            const productId =
                currentChat.productId?._id ||
                currentChat.productId;


            if (productId) {

                viewProduct.href =
                    `produto.html?id=${productId}`;

                viewProduct.style.display =
                    "";

            } else {

                viewProduct.style.display =
                    "none";

            }

        }


        // ======================================
        // ALUGUEL
        // ======================================

        renderRentalCard();


        // ======================================
        // MENSAGENS
        // ======================================

        messages.innerHTML = "";


        if (
            !currentChat.messages ||
            !currentChat.messages.length
        ) {

            const empty =
                document.createElement(
                    "div"
                );


            empty.style.textAlign =
                "center";


            empty.style.color =
                "#6b7280";


            empty.style.padding =
                "30px";


            empty.textContent =
                "Nenhuma mensagem ainda.";


            messages.appendChild(
                empty
            );


            return;

        }


        currentChat.messages.forEach(
            msg => {

                const senderId =
                    msg.senderId?._id ||
                    msg.senderId;


                const sent =
                    sameId(
                        senderId,
                        user._id
                    );


                const bubble =
                    document.createElement(
                        "div"
                    );


                bubble.className =
                    `message ${
                        sent
                            ? "sent"
                            : "received"
                    }`;


                const text =
                    document.createElement(
                        "div"
                    );


                text.textContent =
                    msg.text || "";


                const time =
                    document.createElement(
                        "span"
                    );


                time.className =
                    "time";


                if (msg.createdAt) {

                    time.textContent =
                        new Date(
                            msg.createdAt
                        ).toLocaleTimeString(
                            "pt-BR",
                            {
                                hour:
                                    "2-digit",

                                minute:
                                    "2-digit"
                            }
                        );

                }


                bubble.appendChild(
                    text
                );

                bubble.appendChild(
                    time
                );


                messages.appendChild(
                    bubble
                );

            }
        );


        messages.scrollTop =
            messages.scrollHeight;

    }


    // ==========================================
    // ATUALIZAR CHAT
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


            const changed =
                newMessages.length !==
                oldMessages.length;


            const rentalChanged =
                JSON.stringify(
                    currentChat.rentalId
                ) !==
                JSON.stringify(
                    updatedChat.rentalId
                );


            const profileChanged =
                JSON.stringify(
                    currentChat.ownerId?.profileImage
                ) !==
                JSON.stringify(
                    updatedChat.ownerId?.profileImage
                ) ||
                JSON.stringify(
                    currentChat.renterId?.profileImage
                ) !==
                JSON.stringify(
                    updatedChat.renterId?.profileImage
                );


            if (
                changed ||
                rentalChanged ||
                profileChanged
            ) {

                currentChat =
                    updatedChat;


                const index =
                    chats.findIndex(
                        chat =>
                            sameId(
                                chat._id,
                                updatedChat._id
                            )
                    );


                if (index !== -1) {

                    chats[index] =
                        updatedChat;

                }


                renderChat();

                renderSidebar();

            }

        } catch (error) {

            console.error(
                "Erro no polling:",
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


        sendingMessage =
            true;


        sendButton.disabled =
            true;


        sendButton.textContent =
            "Enviando...";


        try {

            const response =
                await fetch(
                    `${API}/${currentChat._id}/messages`,
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

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


            currentChat =
                data;


            input.value =
                "";


            const index =
                chats.findIndex(
                    chat =>
                        sameId(
                            chat._id,
                            currentChat._id
                        )
                );


            if (index !== -1) {

                chats[index] =
                    currentChat;

            }


            renderChat();

            renderSidebar();


        } catch (error) {

            console.error(
                "Erro ao enviar:",
                error
            );


            alert(
                "Não foi possível enviar a mensagem."
            );

        } finally {

            sendingMessage =
                false;


            sendButton.disabled =
                false;


            sendButton.textContent =
                "Enviar";

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


    if (input) {

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

    }


    // ==========================================
    // INICIAR
    // ==========================================

    console.log(
        "ALUGASE Chat iniciado."
    );


    console.log(
        "Usuário:",
        user._id
    );


    console.log(
        "Chat:",
        chatId
    );


    await loadChats();

    await loadNotifications();


    // ==========================================
    // ATUALIZAÇÃO AUTOMÁTICA
    // ==========================================

    setInterval(
        checkNewMessages,
        2000
    );


    setInterval(
        loadNotifications,
        10000
    );

});