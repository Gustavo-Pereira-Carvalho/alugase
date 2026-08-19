document.addEventListener("DOMContentLoaded", async () => {

    // =========================================================
    // CONFIGURAÇÃO
    // =========================================================

    const API =
        "https://alugase-api.onrender.com/api/chats";

    const RENTALS_API =
        "https://alugase-api.onrender.com/api/rentals";

    const PRODUCTS_API =
        "https://alugase-api.onrender.com/api/products";


    // =========================================================
    // USUÁRIO
    // =========================================================

    const user =
        JSON.parse(
            localStorage.getItem("alugase_user")
        );


    if (!user || !user._id) {

        location.href = "login.html";

        return;

    }


    // =========================================================
    // PARÂMETROS
    // =========================================================

    const params =
        new URLSearchParams(
            window.location.search
        );


    const chatId =
        params.get("chat");


    // =========================================================
    // ELEMENTOS
    // =========================================================

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


    // =========================================================
    // COMPARAR IDS
    // =========================================================

    function sameId(a, b) {

        if (!a || !b) {
            return false;
        }

        return String(a) === String(b);

    }


    // =========================================================
    // PEGAR ID
    // =========================================================

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


    // =========================================================
    // DINHEIRO
    // =========================================================

    function formatMoney(value) {

        const number =
            Number(value || 0);


        return number.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    // =========================================================
    // DATA
    // =========================================================

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


    // =========================================================
    // STATUS DO ALUGUEL
    // =========================================================

    function rentalStatus(status) {

        const statuses = {

            pending: "Solicitado",

            approved: "Aprovado",

            rejected: "Recusado",

            active: "Em andamento",

            finished: "Finalizado",

            cancelled: "Cancelado"

        };


        return statuses[status] ||
            status ||
            "Solicitado";

    }


    // =========================================================
    // AVATAR
    // =========================================================

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


    // =========================================================
    // OUTRO USUÁRIO
    // =========================================================

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


    // =========================================================
    // CARREGAR PRODUTO
    // =========================================================

    async function loadProductForChat() {

        currentProduct = null;


        if (!currentChat) {
            return null;
        }


        const productId =
            getId(
                currentChat.productId
            );


        if (!productId) {

            console.warn(
                "Chat não possui productId."
            );

            return null;

        }


        try {

            console.log(
                "Buscando produto:",
                productId
            );


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


            currentProduct =
                product;


            return product;


        } catch (error) {

            console.error(
                "Erro ao carregar produto:",
                error
            );


            return null;

        }

    }


    // =========================================================
    // CARREGAR ALUGUEL
    // =========================================================

    async function loadRentalForChat() {

        currentRental = null;


        if (!currentChat) {
            return null;
        }


        // Se o backend já mandou o aluguel completo
        if (
            currentChat.rentalId &&
            typeof currentChat.rentalId === "object"
        ) {

            currentRental =
                currentChat.rentalId;


            return currentRental;

        }


        const rentalId =
            getId(
                currentChat.rentalId
            );


        if (!rentalId) {
            return null;
        }


        try {

            console.log(
                "Buscando aluguel:",
                rentalId
            );


            const response =
                await fetch(
                    `${RENTALS_API}/${rentalId}`
                );


            if (!response.ok) {

                throw new Error(
                    `Aluguel HTTP ${response.status}`
                );

            }


            const rental =
                await response.json();


            console.log(
                "Aluguel carregado:",
                rental
            );


            currentRental =
                rental;


            return rental;


        } catch (error) {

            console.error(
                "Erro ao carregar aluguel:",
                error
            );


            return null;

        }

    }


    // =========================================================
    // ATUALIZAR CARD DO PRODUTO
    // =========================================================

    function renderProductCard() {

        const product =
            currentProduct;


        // -----------------------------------------------------
        // Elementos do card
        // -----------------------------------------------------

        const productShort =
            document.querySelector(
                "#reservation-product-short"
            );


        const productElement =
            document.querySelector(
                "#reservation-product"
            );


        const productCategory =
            document.querySelector(
                "#reservation-category"
            );


        const productCity =
            document.querySelector(
                "#reservation-city"
            );


        const productPrice =
            document.querySelector(
                "#reservation-product-price"
            );


        const productDeposit =
            document.querySelector(
                "#reservation-product-deposit"
            );


        const productDelivery =
            document.querySelector(
                "#reservation-product-delivery"
            );


        const productImage =
            document.querySelector(
                "#reservation-product-image"
            );


        const productIcon =
            document.querySelector(
                "#reservation-product-icon"
            );


        // -----------------------------------------------------
        // Produto não encontrado
        // -----------------------------------------------------

        if (!product) {

            if (productShort) {

                productShort.textContent =
                    "Produto não encontrado";

            }


            if (productElement) {

                productElement.textContent =
                    "Produto não encontrado";

            }


            return;

        }


        // -----------------------------------------------------
        // NOME
        // -----------------------------------------------------

        const title =
            product.title ||
            product.name ||
            "Produto";


        if (productShort) {

            productShort.textContent =
                title;

        }


        if (productElement) {

            productElement.textContent =
                title;

        }


        // -----------------------------------------------------
        // CATEGORIA
        // -----------------------------------------------------

        if (productCategory) {

            productCategory.textContent =
                product.category ||
                "Categoria não informada";

        }


        // -----------------------------------------------------
        // CIDADE
        // -----------------------------------------------------

        if (productCity) {

            productCity.textContent =
                product.city ||
                "Cidade não informada";

        }


        // -----------------------------------------------------
        // PREÇO
        // -----------------------------------------------------

        if (productPrice) {

            productPrice.textContent =
                formatMoney(
                    product.pricePerDay
                );

        }


        // -----------------------------------------------------
        // CAUÇÃO
        // -----------------------------------------------------

        if (productDeposit) {

            productDeposit.textContent =
                formatMoney(
                    product.deposit
                );

        }


        // -----------------------------------------------------
        // ENTREGA
        // -----------------------------------------------------

        if (productDelivery) {

            if (product.delivery) {

                const deliveryPrice =
                    Number(
                        product.deliveryPrice || 0
                    );


                productDelivery.textContent =
                    deliveryPrice > 0
                        ? formatMoney(
                            deliveryPrice
                        )
                        : "Disponível";

            } else {

                productDelivery.textContent =
                    "Não disponível";

            }

        }


        // -----------------------------------------------------
        // IMAGEM
        // -----------------------------------------------------

        if (productImage) {

            let imageUrl = "";


            if (
                Array.isArray(
                    product.images
                ) &&
                product.images.length
            ) {

                imageUrl =
                    product.images[0];

            }


            if (
                !imageUrl &&
                product.image
            ) {

                imageUrl =
                    product.image;

            }


            if (imageUrl) {

                productImage.src =
                    imageUrl;

                productImage.style.display =
                    "block";

                productImage.onerror =
                    () => {

                        productImage.style.display =
                            "none";

                    };

            } else {

                productImage.style.display =
                    "none";

            }

        }


        // -----------------------------------------------------
        // ÍCONE
        // -----------------------------------------------------

        if (productIcon) {

            productIcon.textContent =
                product.icon ||
                "📦";

        }

    }


    // =========================================================
    // CARD DO ALUGUEL
    // =========================================================

    function renderRentalCard() {

        const rental =
            currentRental;


        if (!rental) {

            console.log(
                "Nenhum aluguel carregado."
            );

            return;

        }


        const product =
            currentProduct;


        // -----------------------------------------------------
        // ELEMENTOS
        // -----------------------------------------------------

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


        const productShort =
            document.querySelector(
                "#reservation-product-short"
            );


        const productElement =
            document.querySelector(
                "#reservation-product"
            );


        // -----------------------------------------------------
        // PRODUTO
        // -----------------------------------------------------

        const productTitle =
            product?.title ||
            product?.name ||
            rental.productTitle ||
            currentChat?.productTitle ||
            "Produto";


        if (productShort) {

            productShort.textContent =
                productTitle;

        }


        if (productElement) {

            productElement.textContent =
                productTitle;

        }


        // -----------------------------------------------------
        // STATUS
        // -----------------------------------------------------

        if (status) {

            status.textContent =
                rentalStatus(
                    rental.status
                );

        }


        // -----------------------------------------------------
        // PERÍODO
        // -----------------------------------------------------

        if (period) {

            const start =
                rental.startDate ||
                rental.start;


            const end =
                rental.endDate ||
                rental.end;


            period.textContent =
                `${formatDate(start)} até ${formatDate(end)}`;

        }


        // -----------------------------------------------------
        // TOTAL
        // -----------------------------------------------------

        if (total) {

            const totalValue =
                rental.total ??
                rental.totalPrice ??
                rental.price ??
                0;


            total.textContent =
                formatMoney(
                    totalValue
                );

        }


        // -----------------------------------------------------
        // DIAS
        // -----------------------------------------------------

        if (days) {

            let totalDays =
                Number(
                    rental.days || 0
                );


            // Se o backend não mandou days,
            // calculamos pelas datas.

            if (
                totalDays <= 0 &&
                rental.startDate &&
                rental.endDate
            ) {

                const start =
                    new Date(
                        rental.startDate
                    );


                const end =
                    new Date(
                        rental.endDate
                    );


                const difference =
                    Math.ceil(
                        (
                            end - start
                        ) /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        )
                    );


                totalDays =
                    Math.max(
                        1,
                        difference
                    );

            }


            days.textContent =
                `${totalDays} ${
                    totalDays === 1
                        ? "dia"
                        : "dias"
                }`;

        }


        // -----------------------------------------------------
        // ENTREGA
        // -----------------------------------------------------

        if (delivery) {

            const hasDelivery =
                rental.delivery ??
                product?.delivery ??
                false;


            if (hasDelivery) {

                const deliveryPrice =
                    Number(
                        rental.deliveryPrice ??
                        product?.deliveryPrice ??
                        0
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


        // -----------------------------------------------------
        // CAUÇÃO
        // -----------------------------------------------------

        if (deposit) {

            const depositValue =
                rental.deposit ??
                product?.deposit ??
                0;


            deposit.textContent =
                formatMoney(
                    depositValue
                );

        }

    }


    // =========================================================
    // CARREGAR TUDO DO CHAT
    // =========================================================

    async function loadChatData() {

        if (!currentChat) {
            return;
        }


        // Primeiro produto
        await loadProductForChat();


        // Depois aluguel
        await loadRentalForChat();


        // Renderiza
        renderProductCard();

        renderRentalCard();

    }


    // =========================================================
    // NOTIFICAÇÕES
    // =========================================================

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


    // =========================================================
    // ABRIR / FECHAR ALUGUEL
    // =========================================================

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


    // =========================================================
    // CARREGAR CHATS
    // =========================================================

    async function loadChats() {

        try {

            conversationList.innerHTML = `
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

                conversationList.innerHTML = `
                    <p style="
                        padding:20px;
                        color:#6b7280;
                    ">
                        Nenhuma conversa.
                    </p>
                `;


                messages.innerHTML = `
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

            // IMPORTANTE:
            // busca produto e aluguel
            await loadChatData();


        } catch (error) {

            console.error(
                "Erro ao carregar conversas:",
                error
            );


            conversationList.innerHTML = `
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
                        Não foi possível conectar ao servidor.
                    </p>

                </div>
            `;

        }

    }


    // =========================================================
    // SIDEBAR
    // =========================================================

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


            const avatar =
                createAvatar(
                    otherUser.name,
                    otherUser.profileImage
                );


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


    // =========================================================
    // RENDERIZAR CHAT
    // =========================================================

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


        // -----------------------------------------------------
        // NOME
        // -----------------------------------------------------

        if (chatName) {

            chatName.textContent =
                otherUser.name;

        }


        // -----------------------------------------------------
        // AVATAR
        // -----------------------------------------------------

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


                chatAvatar.appendChild(img);

            } else {

                chatAvatar.textContent =
                    otherUser.name
                        .charAt(0)
                        .toUpperCase();

            }

        }


        // -----------------------------------------------------
        // STATUS
        // -----------------------------------------------------

        if (chatStatus) {

            chatStatus.textContent =
                currentChat.status ||
                "Ativo";

        }


        // -----------------------------------------------------
        // BOTÃO VER PRODUTO
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // PRODUTO
        // -----------------------------------------------------

        const productShort =
            document.querySelector(
                "#reservation-product-short"
            );


        if (productShort) {

            productShort.textContent =
                "Carregando...";

        }


        const productElement =
            document.querySelector(
                "#reservation-product"
            );


        if (productElement) {

            productElement.textContent =
                "Carregando...";

        }


        // -----------------------------------------------------
        // MENSAGENS
        // -----------------------------------------------------

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

        } else {

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


                    bubble.appendChild(text);

                    bubble.appendChild(time);


                    messages.appendChild(
                        bubble
                    );

                }
            );


            messages.scrollTop =
                messages.scrollHeight;

        }

    }


    // =========================================================
    // ATUALIZAR CHAT
    // =========================================================

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


    // =========================================================
    // ENVIAR MENSAGEM
    // =========================================================

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


    // =========================================================
    // EVENTOS
    // =========================================================

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


    // =========================================================
    // INICIAR
    // =========================================================

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


    // =========================================================
    // POLLING
    // =========================================================

    setInterval(
        checkNewMessages,
        5000
    );


    setInterval(
        loadNotifications,
        10000
    );

});