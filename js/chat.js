document.addEventListener("DOMContentLoaded", async () => {

    // ==========================================
    // CONFIGURAÇÃO
    // ==========================================

    const API =
        "https://alugase-api.onrender.com/api/chats";

    const RENTALS_API =
        "https://alugase-api.onrender.com/api/rentals";

    const PRODUCTS_API =
        "https://alugase-api.onrender.com/api/products";


    // ==========================================
    // USUÁRIO
    // ==========================================

    const user =
        JSON.parse(
            localStorage.getItem("alugase_user")
        );


    if (!user || !user._id) {

        location.href = "login.html";

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

    let currentProduct = null;

    let currentRental = null;

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
    // PEGAR ID
    // ==========================================

    function getId(value) {

        if (!value) {
            return null;
        }

        if (typeof value === "object") {

            return value._id ||
                value.id ||
                null;

        }

        return value;

    }


    // ==========================================
    // DINHEIRO
    // ==========================================

    function formatMoney(value) {

        const number =
            Number(value);

        if (
            !Number.isFinite(number) ||
            number < 0
        ) {

            return "R$ 0,00";

        }

        return number.toLocaleString(
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
    // STATUS DO ALUGUEL
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
    // STATUS DO PRODUTO
    // ==========================================

    function productStatus(status) {

        if (status === "available") {
            return "Disponível";
        }

        if (status === "rented") {
            return "Indisponível";
        }

        return "Disponível";

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


            avatar.appendChild(img);


        } else {

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
            getId(owner);


        const renterId =
            getId(renter);


        const isOwner =
            sameId(
                ownerId,
                user._id
            );


        if (isOwner) {

            return {

                id: renterId,

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

            id: ownerId,

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
    // BUSCAR PRODUTO
    // ==========================================

    async function loadProduct(chat) {

        if (!chat) {
            return null;
        }


        const productId =
            getId(
                chat.productId
            );


        if (!productId) {

            console.warn(
                "Chat não possui productId."
            );

            return null;

        }


        try {

            const response =
                await fetch(
                    `${PRODUCTS_API}/${productId}`
                );


            if (!response.ok) {

                throw new Error(
                    `Produto HTTP ${response.status}`
                );

            }


            const product =
                await response.json();


            console.log(
                "Produto carregado:",
                product
            );


            return product;


        } catch (error) {

            console.error(
                "Erro ao carregar produto:",
                error
            );


            return null;

        }

    }


    // ==========================================
    // BUSCAR ALUGUEL
    // ==========================================

    async function loadRental(chat) {

        if (!chat) {
            return null;
        }


        const rentalId =
            getId(
                chat.rentalId
            );


        if (!rentalId) {

            console.log(
                "Chat não possui rentalId."
            );

            return null;

        }


        try {

            const response =
                await fetch(
                    `${RENTALS_API}/${rentalId}`
                );


            if (!response.ok) {

                throw new Error(
                    `Rental HTTP ${response.status}`
                );

            }


            const rental =
                await response.json();


            console.log(
                "Aluguel carregado:",
                rental
            );


            return rental;


        } catch (error) {

            console.error(
                "Erro ao carregar aluguel:",
                error
            );


            // Caso o backend já tenha enviado
            // o objeto inteiro dentro do chat

            if (
                typeof chat.rentalId === "object"
            ) {

                return chat.rentalId;

            }


            return null;

        }

    }


    // ==========================================
    // CARREGAR DADOS DO CHAT
    // ==========================================

    async function loadChatData() {

        if (!currentChat) {

            currentProduct = null;

            currentRental = null;

            return;

        }


        const [
            product,
            rental
        ] = await Promise.all([

            loadProduct(
                currentChat
            ),

            loadRental(
                currentChat
            )

        ]);


        currentProduct =
            product;


        currentRental =
            rental;


        renderRentalCard();

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
                            getId(
                                rental.ownerId
                            );


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
    // CARD DO PRODUTO + ALUGUEL
    // ==========================================

    function renderRentalCard() {

        // --------------------------------------
        // ELEMENTOS
        // --------------------------------------

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


        // --------------------------------------
        // DADOS DO PRODUTO
        // --------------------------------------

        if (currentProduct) {

            const productTitle =
                currentProduct.title ||
                "Produto";


            const productCategory =
                currentProduct.category ||
                "Categoria";


            const productCity =
                currentProduct.city ||
                "Cidade";


            const productPrice =
                Number(
                    currentProduct.pricePerDay || 0
                );


            const productDeposit =
                Number(
                    currentProduct.deposit || 0
                );


            const productDeliveryPrice =
                Number(
                    currentProduct.deliveryPrice || 0
                );


            const canDelivery =
                currentProduct.delivery === true;


            // ----------------------------------
            // TÍTULO PEQUENO
            // ----------------------------------

            if (productShort) {

                productShort.textContent =
                    productTitle;

            }


            // ----------------------------------
            // CARD PRINCIPAL
            // ----------------------------------

            if (product) {

                product.innerHTML = "";


                // ==============================
                // IMAGEM
                // ==============================

                const imageWrapper =
                    document.createElement("div");


                imageWrapper.className =
                    "reservation-product-image";


                const image =
                    document.createElement("img");


                const imageUrl =
                    currentProduct.images &&
                    currentProduct.images.length
                        ? currentProduct.images[0]
                        : null;


                if (imageUrl) {

                    image.src =
                        imageUrl;

                    image.alt =
                        productTitle;

                } else {

                    image.src =
                        "";

                    image.alt =
                        "";

                    image.style.display =
                        "none";

                    imageWrapper.textContent =
                        "📦";

                }


                image.loading =
                    "lazy";


                image.onerror =
                    () => {

                        image.style.display =
                            "none";

                        imageWrapper.textContent =
                            "📦";

                    };


                imageWrapper.appendChild(
                    image
                );


                // ==============================
                // CONTEÚDO
                // ==============================

                const content =
                    document.createElement("div");


                content.className =
                    "reservation-product-content";


                // título

                const title =
                    document.createElement("h3");


                title.textContent =
                    productTitle;


                // categoria

                const category =
                    document.createElement("span");


                category.className =
                    "reservation-category";


                category.textContent =
                    productCategory;


                // cidade

                const city =
                    document.createElement("p");


                city.className =
                    "reservation-city";


                city.textContent =
                    `📍 ${productCity}`;


                // preço

                const price =
                    document.createElement("strong");


                price.className =
                    "reservation-product-price";


                price.textContent =
                    `${formatMoney(
                        productPrice
                    )} / dia`;


                content.appendChild(
                    title
                );


                content.appendChild(
                    category
                );


                content.appendChild(
                    city
                );


                content.appendChild(
                    price
                );


                // ==============================
                // STATUS
                // ==============================

                const productStatusBadge =
                    document.createElement("span");


                productStatusBadge.className =
                    "reservation-product-status";


                productStatusBadge.textContent =
                    productStatus(
                        currentProduct.status
                    );


                product.appendChild(
                    imageWrapper
                );


                product.appendChild(
                    content
                );


                product.appendChild(
                    productStatusBadge
                );

            }


            // ----------------------------------
            // CAUÇÃO DO PRODUTO
            // ----------------------------------

            if (deposit) {

                deposit.textContent =
                    formatMoney(
                        productDeposit
                    );

            }


            // ----------------------------------
            // ENTREGA
            // ----------------------------------

            if (delivery) {

                if (canDelivery) {

                    delivery.textContent =
                        productDeliveryPrice > 0
                            ? formatMoney(
                                productDeliveryPrice
                            )
                            : "Disponível";

                } else {

                    delivery.textContent =
                        "Não disponível";

                }

            }

        } else {

            // ----------------------------------
            // PRODUTO NÃO ENCONTRADO
            // ----------------------------------

            if (productShort) {

                productShort.textContent =
                    "Produto";

            }


            if (product) {

                product.innerHTML =
                    `
                    <div class="reservation-product-loading">
                        Produto não encontrado.
                    </div>
                    `;

            }

        }


        // ======================================
        // DADOS DO ALUGUEL
        // ======================================

        if (currentRental) {

            // ----------------------------------
            // STATUS
            // ----------------------------------

            if (status) {

                status.textContent =
                    rentalStatus(
                        currentRental.status
                    );

            }


            // ----------------------------------
            // PERÍODO
            // ----------------------------------

            if (period) {

                const start =
                    formatDate(
                        currentRental.startDate
                    );


                const end =
                    formatDate(
                        currentRental.endDate
                    );


                if (
                    start !== "--" ||
                    end !== "--"
                ) {

                    period.textContent =
                        `${start} até ${end}`;

                } else {

                    period.textContent =
                        "--";

                }

            }


            // ----------------------------------
            // DIÁRIAS
            // ----------------------------------

            if (days) {

                const totalDays =
                    Number(
                        currentRental.days || 0
                    );


                if (totalDays > 0) {

                    days.textContent =
                        `${totalDays} ${
                            totalDays === 1
                                ? "dia"
                                : "dias"
                        }`;

                } else {

                    days.textContent =
                        "--";

                }

            }


            // ----------------------------------
            // TOTAL DO ALUGUEL
            // ----------------------------------

            if (total) {

                const rentalTotal =
                    Number(
                        currentRental.total || 0
                    );


                total.textContent =
                    formatMoney(
                        rentalTotal
                    );

            }

        } else {

            // ----------------------------------
            // SEM ALUGUEL
            // ----------------------------------

            if (status) {

                status.textContent =
                    "Sem solicitação";

            }


            if (period) {

                period.textContent =
                    "--";

            }


            if (days) {

                days.textContent =
                    "--";

            }


            if (total) {

                total.textContent =
                    "R$ 0,00";

            }

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

                currentProduct = null;

                currentRental = null;


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

            await loadChatData();

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
                document.createElement("div");


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


            const avatar =
                createAvatar(
                    otherUser.name,
                    otherUser.profileImage
                );


            const info =
                document.createElement("div");


            info.className =
                "conv-info";


            const name =
                document.createElement("h4");


            name.textContent =
                otherUser.name;


            const last =
                document.createElement("p");


            last.textContent =
                lastMessage ||
                "Nova conversa";


            info.appendChild(name);

            info.appendChild(last);


            card.appendChild(avatar);

            card.appendChild(info);


            card.addEventListener(
                "click",
                async () => {

                    currentChat =
                        chat;


                    currentProduct =
                        null;


                    currentRental =
                        null;


                    renderSidebar();

                    renderChat();


                    history.replaceState(
                        {},
                        "",
                        `chat.html?chat=${chat._id}`
                    );


                    await loadChatData();

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
        // FOTO
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
        // VER PRODUTO
        // ======================================

        if (viewProduct) {

            const productId =
                getId(
                    currentChat.productId
                );


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
        // CARD ALUGUEL
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
                document.createElement("div");


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
                    getId(
                        msg.senderId
                    );


                const sent =
                    sameId(
                        senderId,
                        user._id
                    );


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


                time.className =
                    "time";


                if (msg.createdAt) {

                    time.textContent =
                        new Date(
                            msg.createdAt
                        ).toLocaleTimeString(
                            "pt-BR",
                            {
                                hour: "2-digit",
                                minute: "2-digit"
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


            const productChanged =
                JSON.stringify(
                    currentChat.productId
                ) !==
                JSON.stringify(
                    updatedChat.productId
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
                productChanged ||
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


                await loadChatData();

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

                        method: "POST",

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


            await loadChatData();

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
        5000
    );


    setInterval(
        loadNotifications,
        10000
    );

});