// ==========================================
// ALUGASE — PRODUTO
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    // ======================================
    // API
    // ======================================

    const API =
        "https://alugase-api.onrender.com/api";

    const PRODUCTS_API =
        `${API}/products`;

    const USERS_API =
        `${API}/users`;

    const RENTALS_API =
        `${API}/rentals`;


    // ======================================
    // CONFIGURAÇÃO DA ENTREGA
    // ======================================

    // Tarifa definida pelo ALUGASE.
    // NÃO vem do anúncio.
    // NÃO é informada pelo cliente.

    const DELIVERY_PRICE_PER_KM = 2;


    // ======================================
    // USUÁRIO
    // ======================================

    let user = null;

    try {

        user = JSON.parse(
            localStorage.getItem("alugase_user")
        );

    } catch {

        user = null;

    }

    const token =
        localStorage.getItem("token");

    let currentUser = user;


    // ======================================
    // PRODUTO
    // ======================================

    const productId =
        new URLSearchParams(
            window.location.search
        ).get("id");


    if (!productId) {

        window.location.href =
            "explorar.html";

        return;
    }


    // ======================================
    // ELEMENTOS
    // ======================================

    const categoryLabel =
        document.querySelector(
            ".product-category"
        );

    const categoryLink =
        document.querySelector(
            ".product-category-link"
        );

    const breadcrumbTitle =
        document.querySelector(
            "#breadcrumb-title"
        );

    const title =
        document.querySelector(
            "#product-title"
        );

    const mainImage =
        document.querySelector(
            "#main-image"
        );

    const thumbnails =
        document.querySelector(
            "#product-thumbnails"
        );

    const locationText =
        document.querySelector(
            "#product-location"
        );

    const description =
        document.querySelector(
            "#product-description"
        );

    const productRating =
        document.querySelector(
            "#product-rating"
        );

    const productReviews =
        document.querySelector(
            "#product-reviews"
        );

    const price =
        document.querySelector(
            ".pricing strong"
        );


    // ======================================
    // ENTREGA
    // ======================================

    const deliveryLabel =
        document.querySelector(
            "#delivery-label"
        );

    const deliveryInfo =
        document.querySelector(
            "#delivery-info"
        );

    const deliveryRadio =
        document.querySelector(
            'input[name="delivery"][value="delivery"]'
        );


    // ======================================
    // PROPRIETÁRIO
    // ======================================

    const ownerAvatar =
        document.querySelector(
            "#owner-avatar"
        );

    const ownerName =
        document.querySelector(
            "#owner-name"
        );

    const ownerVerification =
        document.querySelector(
            "#owner-verification"
        );

    const ownerRating =
        document.querySelector(
            "#owner-rating"
        );

    const ownerReviews =
        document.querySelector(
            "#owner-reviews"
        );


    // ======================================
    // CALENDÁRIO
    // ======================================

    const startDate =
        document.querySelector(
            "#start-date"
        );

    const endDate =
        document.querySelector(
            "#end-date"
        );

    const calendarDays =
        document.querySelector(
            "#calendar-days"
        );

    const calendarMonth =
        document.querySelector(
            "#calendar-month"
        );

    const calendarPrev =
        document.querySelector(
            "#calendar-prev"
        );

    const calendarNext =
        document.querySelector(
            "#calendar-next"
        );

    const selectedStartDisplay =
        document.querySelector(
            "#selected-start-display"
        );

    const selectedEndDisplay =
        document.querySelector(
            "#selected-end-display"
        );


    // ======================================
    // RESUMO
    // ======================================

    const dailyTotal =
        document.querySelector(
            "#daily-total"
        );

    const deliveryTotal =
        document.querySelector(
            "#delivery-total"
        );

    const depositTotal =
        document.querySelector(
            "#deposit-total"
        );

    const rentalTotal =
        document.querySelector(
            "#rental-total"
        );

    const rentalButton =
        document.querySelector(
            "#rental-button"
        );


    // ======================================
    // VARIÁVEIS
    // ======================================

    let product = null;

    let owner = null;

    let calendarDate =
        new Date();

    let selectingStart = true;

    let unavailableDates = [];


    let deliveryCalculation = {

        distance: 0,

        value: 0,

        valid: false,

        reason: "not-calculated"

    };


    // ======================================
    // DINHEIRO
    // ======================================

    function formatMoney(value) {

        const number =
            Number(value);

        return (
            Number.isFinite(number)
                ? number
                : 0
        ).toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
    }


    // ======================================
    // DATA BR
    // ======================================

    function formatDateBR(dateString) {

        if (!dateString) {

            return "Selecione uma data";
        }

        const parts =
            dateString.split("-");

        if (parts.length !== 3) {

            return "Data inválida";
        }

        const [
            year,
            month,
            day
        ] = parts;

        return `${day}/${month}/${year}`;
    }


    // ======================================
    // DATA → STRING
    // ======================================

    function dateToString(date) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    // ======================================
    // NORMALIZAR DATA
    // ======================================

    function normalizeDate(date) {

        if (!date) {

            return null;
        }

        let d;

        if (
            typeof date === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(date)
        ) {

            d =
                new Date(
                    `${date}T00:00:00`
                );

        } else {

            d =
                new Date(date);
        }

        if (
            Number.isNaN(
                d.getTime()
            )
        ) {

            return null;
        }

        d.setHours(
            0,
            0,
            0,
            0
        );

        return dateToString(d);
    }


    // ======================================
    // DATA INDISPONÍVEL
    // ======================================

    function isUnavailable(dateString) {

        return unavailableDates.includes(
            dateString
        );
    }


    // ======================================
    // CARREGAR PRODUTO
    // ======================================

    async function loadProduct() {

        try {

            const response =
                await fetch(
                    `${PRODUCTS_API}/${productId}`
                );

            if (!response.ok) {

                throw new Error(
                    "Produto não encontrado."
                );
            }

            product =
                await response.json();


            await Promise.all([

                loadOwner(),

                loadUnavailableDates(),

                loadCurrentUser()

            ]);


            fillScreen();

        } catch (error) {

            console.error(
                "Erro ao carregar produto:",
                error
            );

            alert(
                "Não foi possível carregar o produto."
            );

            window.location.href =
                "explorar.html";
        }
    }


    // ======================================
    // USUÁRIO LOGADO
    // ======================================

    async function loadCurrentUser() {

        if (!token) {

            return;
        }

        try {

            const response =
                await fetch(
                    `${USERS_API}/me`,
                    {
                        headers: {

                            Authorization:
                                `Bearer ${token}`

                        }
                    }
                );


            if (!response.ok) {

                return;
            }


            currentUser =
                await response.json();


            localStorage.setItem(
                "alugase_user",
                JSON.stringify(
                    currentUser
                )
            );

        } catch (error) {

            console.error(
                "Erro ao carregar usuário:",
                error
            );
        }
    }


    // ======================================
    // DATAS INDISPONÍVEIS
    // ======================================

    async function loadUnavailableDates() {

        try {

            const response =
                await fetch(
                    `${RENTALS_API}/product/${productId}/unavailable`
                );


            if (!response.ok) {

                throw new Error(
                    "Erro ao buscar datas."
                );
            }


            const data =
                await response.json();


            unavailableDates = [];


            if (
                Array.isArray(
                    data.rentals
                )
            ) {

                data.rentals.forEach(
                    rental => {

                        addUnavailableRange(
                            rental.startDate,
                            rental.endDate
                        );

                    }
                );
            }

        } catch (error) {

            console.error(
                "Erro ao carregar datas indisponíveis:",
                error
            );

            unavailableDates = [];
        }
    }


    // ======================================
    // ADICIONAR INTERVALO BLOQUEADO
    // ======================================

    function addUnavailableRange(
        start,
        end
    ) {

        const startString =
            normalizeDate(start);

        const endString =
            normalizeDate(end);


        if (
            !startString ||
            !endString
        ) {

            return;
        }


        const current =
            new Date(
                `${startString}T00:00:00`
            );

        const endDateObject =
            new Date(
                `${endString}T00:00:00`
            );


        while (
            current <=
            endDateObject
        ) {

            const currentString =
                dateToString(
                    current
                );


            if (
                !unavailableDates.includes(
                    currentString
                )
            ) {

                unavailableDates.push(
                    currentString
                );
            }


            current.setDate(
                current.getDate() + 1
            );
        }
    }


    // ======================================
    // CARREGAR PROPRIETÁRIO
    // ======================================

    async function loadOwner() {

        if (!product?.ownerId) {

            return;
        }


        try {

            const ownerId =
                typeof product.ownerId === "object"
                    ? product.ownerId._id
                    : product.ownerId;


            if (!ownerId) {

                return;
            }


            const response =
                await fetch(
                    `${USERS_API}/${ownerId}`
                );


            if (!response.ok) {

                return;
            }


            owner =
                await response.json();

        } catch (error) {

            console.error(
                "Erro ao carregar proprietário:",
                error
            );
        }
    }


    // ======================================
    // EXTRAIR COORDENADAS
    // ======================================

    function getLocationCoordinates(
        source
    ) {

        if (!source) {

            return null;
        }


        // { lat, lng }

        if (
            Number.isFinite(
                Number(source.lat)
            ) &&
            Number.isFinite(
                Number(source.lng)
            )
        ) {

            return {

                lat:
                    Number(source.lat),

                lng:
                    Number(source.lng)

            };
        }


        // { latitude, longitude }

        if (
            Number.isFinite(
                Number(source.latitude)
            ) &&
            Number.isFinite(
                Number(source.longitude)
            )
        ) {

            return {

                lat:
                    Number(source.latitude),

                lng:
                    Number(source.longitude)

            };
        }


        // GeoJSON

        if (
            Array.isArray(
                source.coordinates
            ) &&
            source.coordinates.length >= 2
        ) {

            const lng =
                Number(
                    source.coordinates[0]
                );

            const lat =
                Number(
                    source.coordinates[1]
                );


            if (
                Number.isFinite(lat) &&
                Number.isFinite(lng)
            ) {

                return {

                    lat,
                    lng

                };
            }
        }


        return null;
    }


    // ======================================
    // LOCALIZAÇÃO DO PROPRIETÁRIO
    // ======================================

    function getOwnerLocation() {

        const possibleLocations = [

            product?.ownerLocation,

            owner?.location,

            owner?.ownerLocation,

            owner?.address?.location

        ];


        for (
            const location
            of possibleLocations
        ) {

            const coordinates =
                getLocationCoordinates(
                    location
                );


            if (coordinates) {

                return coordinates;
            }
        }


        return null;
    }


    // ======================================
    // LOCALIZAÇÃO DO CLIENTE
    // ======================================

    function getRenterLocation() {

        const possibleLocations = [

            currentUser?.location,

            currentUser?.userLocation,

            currentUser?.address?.location,

            currentUser?.renterLocation

        ];


        for (
            const location
            of possibleLocations
        ) {

            const coordinates =
                getLocationCoordinates(
                    location
                );


            if (coordinates) {

                return coordinates;
            }
        }


        return null;
    }


    // ======================================
    // DISTÂNCIA — HAVERSINE
    // ======================================

    function calculateDistanceKm(
        pointA,
        pointB
    ) {

        if (
            !pointA ||
            !pointB
        ) {

            return null;
        }


        const earthRadiusKm =
            6371;


        const lat1 =
            pointA.lat *
            Math.PI /
            180;

        const lat2 =
            pointB.lat *
            Math.PI /
            180;


        const deltaLat =
            (
                pointB.lat -
                pointA.lat
            ) *
            Math.PI /
            180;


        const deltaLng =
            (
                pointB.lng -
                pointA.lng
            ) *
            Math.PI /
            180;


        const a =
            Math.sin(
                deltaLat / 2
            ) ** 2
            +
            Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(
                deltaLng / 2
            ) ** 2;


        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );


        return (
            earthRadiusKm *
            c
        );
    }


    // ======================================
    // CALCULAR ENTREGA AUTOMATICAMENTE
    // ======================================

    function calculateDelivery() {

        if (!product) {

            return {

                distance: 0,

                value: 0,

                valid: false,

                reason: "product"

            };
        }


        const deliveryEnabled =
            product.delivery === true ||
            product.delivery === "true";


        if (!deliveryEnabled) {

            return {

                distance: 0,

                value: 0,

                valid: false,

                reason: "disabled"

            };
        }


        const ownerLocation =
            getOwnerLocation();


        const renterLocation =
            getRenterLocation();


        if (!ownerLocation) {

            return {

                distance: 0,

                value: 0,

                valid: false,

                reason: "owner-location"

            };
        }


        if (!renterLocation) {

            return {

                distance: 0,

                value: 0,

                valid: false,

                reason: "renter-location"

            };
        }


        const distance =
            calculateDistanceKm(
                ownerLocation,
                renterLocation
            );


        if (
            !Number.isFinite(
                distance
            )
        ) {

            return {

                distance: 0,

                value: 0,

                valid: false,

                reason: "distance"

            };
        }


        const value =
            Math.round(
                (
                    distance *
                    DELIVERY_PRICE_PER_KM
                ) * 100
            ) / 100;


        return {

            distance,

            value,

            valid: true,

            reason: "ok"

        };
    }


    // ======================================
    // ATUALIZAR ENTREGA
    // ======================================

    function updateDeliveryUI() {

        const enabled =
            product?.delivery === true ||
            product?.delivery === "true";


        if (!enabled) {

            if (deliveryRadio) {

                deliveryRadio.disabled =
                    true;
            }


            if (deliveryLabel) {

                deliveryLabel.textContent =
                    "Somente retirada";
            }


            if (deliveryInfo) {

                deliveryInfo.textContent =
                    "Este produto está disponível somente para retirada.";
            }


            return;
        }


        if (deliveryRadio) {

            deliveryRadio.disabled =
                false;
        }


        const selected =
            document.querySelector(
                'input[name="delivery"]:checked'
            );


        const deliverySelected =
            selected?.value ===
            "delivery";


        if (!deliverySelected) {

            if (deliveryLabel) {

                deliveryLabel.textContent =
                    "Calcular";
            }


            if (deliveryInfo) {

                deliveryInfo.textContent =
                    "O valor será calculado automaticamente pela distância entre os endereços.";
            }


            return;
        }


        deliveryCalculation =
            calculateDelivery();


        if (
            deliveryCalculation.reason ===
            "owner-location"
        ) {

            deliveryLabel.textContent =
                "Indisponível";


            deliveryInfo.textContent =
                "Não foi possível localizar o endereço do proprietário.";

            return;
        }


        if (
            deliveryCalculation.reason ===
            "renter-location"
        ) {

            deliveryLabel.textContent =
                "Endereço necessário";


            deliveryInfo.textContent =
                "Cadastre seu endereço no perfil para calcular a entrega.";

            return;
        }


        if (
            deliveryCalculation.reason ===
            "distance"
        ) {

            deliveryLabel.textContent =
                "Erro no cálculo";


            deliveryInfo.textContent =
                "Não foi possível calcular a distância.";

            return;
        }


        if (
            deliveryCalculation.valid
        ) {

            deliveryLabel.textContent =
                `+ R$ ${formatMoney(
                    deliveryCalculation.value
                )}`;


            deliveryInfo.textContent =
                `Entrega calculada automaticamente: ${deliveryCalculation.distance.toFixed(1)} km.`;

            return;
        }


        deliveryLabel.textContent =
            "Calcular";
    }


    // ======================================
    // ATUALIZAR TOTAIS
    // ======================================

    function updateTotals() {

        if (!product) {

            return;
        }


        const days =
            getDays();


        const selectedDelivery =
            document.querySelector(
                'input[name="delivery"]:checked'
            );


        const deliverySelected =
            selectedDelivery?.value ===
            "delivery";


        let deliveryValue = 0;


        if (deliverySelected) {

            deliveryCalculation =
                calculateDelivery();


            if (
                deliveryCalculation.valid
            ) {

                deliveryValue =
                    deliveryCalculation.value;
            }
        }


        const daily =
            days *
            Number(
                product.pricePerDay || 0
            );


        const deposit =
            Number(
                product.deposit || 0
            );


        const total =
            daily +
            deliveryValue +
            deposit;


        if (dailyTotal) {

            dailyTotal.textContent =
                `R$ ${formatMoney(
                    daily
                )}`;
        }


        if (deliveryTotal) {

            deliveryTotal.textContent =
                `R$ ${formatMoney(
                    deliveryValue
                )}`;
        }


        if (depositTotal) {

            depositTotal.textContent =
                `R$ ${formatMoney(
                    deposit
                )}`;
        }


        if (rentalTotal) {

            rentalTotal.textContent =
                `R$ ${formatMoney(
                    total
                )}`;
        }


        updateDeliveryUI();
    }


    // ======================================
    // PREENCHER TELA
    // ======================================

    function fillScreen() {

        document.title =
            `${product.title || "Produto"} | ALUGASE`;


        if (categoryLabel) {

            categoryLabel.textContent =
                (
                    product.category ||
                    "Produto"
                ).toUpperCase();
        }


        if (categoryLink) {

            categoryLink.textContent =
                product.category ||
                "Categoria";


            categoryLink.href =
                `explorar.html?categoria=${encodeURIComponent(
                    product.category || ""
                )}`;
        }


        if (breadcrumbTitle) {

            breadcrumbTitle.textContent =
                product.title ||
                "Produto";
        }


        if (title) {

            title.textContent =
                product.title ||
                "Produto";
        }


        renderGallery();


        if (locationText) {

            locationText.textContent =
                `📍 ${
                    product.city ||
                    "Não informado"
                }`;
        }


        if (description) {

            description.textContent =
                product.description ||
                "Este produto não possui descrição.";
        }


        if (productRating) {

            productRating.textContent =
                product.rating ||
                "5.0";
        }


        if (productReviews) {

            productReviews.textContent =
                product.reviews ||
                "0";
        }


        if (price) {

            price.textContent =
                `R$ ${formatMoney(
                    product.pricePerDay
                )}`;
        }


        renderOwner();

        initializeCalendar();

        updateTotals();
    }


    // ======================================
    // GALERIA
    // ======================================

    function changeImage(
        src,
        activeButton = null
    ) {

        if (
            !src ||
            !mainImage
        ) {

            return;
        }


        mainImage.innerHTML = `
            <img
                src="${src}"
                alt="${product?.title || "Produto"}"
            >
        `;


        document
            .querySelectorAll(
                ".thumbnail"
            )
            .forEach(
                thumbnail => {

                    thumbnail.classList.remove(
                        "active"
                    );

                }
            );


        if (activeButton) {

            activeButton.classList.add(
                "active"
            );
        }
    }


    // ======================================
    // RENDERIZAR GALERIA
    // ======================================

    function renderGallery() {

        if (
            !mainImage ||
            !thumbnails
        ) {

            return;
        }


        thumbnails.innerHTML =
            "";


        const images =
            Array.isArray(
                product.images
            )
                ? product.images.filter(Boolean)
                : [];


        if (
            images.length > 0
        ) {

            mainImage.innerHTML = `
                <img
                    src="${images[0]}"
                    alt="${product.title || "Produto"}"
                >
            `;


            images.forEach(
                (
                    image,
                    index
                ) => {

                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        `thumbnail ${
                            index === 0
                                ? "active"
                                : ""
                        }`;


                    button.innerHTML = `
                        <img
                            src="${image}"
                            alt="Imagem ${index + 1}"
                            loading="lazy"
                        >
                    `;


                    button.addEventListener(
                        "click",
                        () => {

                            changeImage(
                                image,
                                button
                            );

                        }
                    );


                    thumbnails.appendChild(
                        button
                    );

                }
            );

        } else {

            mainImage.innerHTML = `
                <div class="emoji-image">
                    📦
                </div>
            `;


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "thumbnail emoji active";


            button.textContent =
                "📦";


            thumbnails.appendChild(
                button
            );
        }
    }


    // ======================================
    // PROPRIETÁRIO
    // ======================================

    function renderOwner() {

        if (!owner) {

            ownerAvatar.innerHTML =
                "👤";


            ownerName.textContent =
                product.ownerName ||
                "Usuário";


            ownerVerification.textContent =
                "Usuário";


            ownerRating.textContent =
                product.rating ||
                "5.0";


            ownerReviews.textContent =
                product.reviews ||
                "0";


            return;
        }


        ownerName.textContent =
            owner.name ||
            product.ownerName ||
            "Usuário";


        if (owner.profileImage) {

            ownerAvatar.innerHTML = `
                <img
                    src="${owner.profileImage}"
                    alt="${owner.name || "Proprietário"}"
                    class="owner-profile-image"
                >
            `;

        } else {

            const initials =
                (
                    owner.name ||
                    "U"
                )
                    .trim()
                    .split(/\s+/)
                    .map(
                        word =>
                            word.charAt(0)
                    )
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();


            ownerAvatar.innerHTML = `
                <span class="owner-initials">
                    ${initials || "U"}
                </span>
            `;
        }


        if (
            owner.identityVerified
        ) {

            ownerVerification.textContent =
                "✓ Identidade verificada";


            ownerVerification.className =
                "owner-verified";

        } else {

            ownerVerification.textContent =
                "Usuário";


            ownerVerification.className =
                "";
        }


        ownerRating.textContent =
            owner.rating ||
            product.rating ||
            "5.0";


        ownerReviews.textContent =
            owner.reviews ||
            product.reviews ||
            "0";
    }


    // ======================================
    // CALENDÁRIO
    // ======================================

    function renderCalendar() {

        if (!calendarDays) {

            return;
        }


        calendarDays.innerHTML =
            "";


        const year =
            calendarDate.getFullYear();

        const month =
            calendarDate.getMonth();


        const firstDay =
            new Date(
                year,
                month,
                1
            ).getDay();


        const daysInMonth =
            new Date(
                year,
                month + 1,
                0
            ).getDate();


        if (calendarMonth) {

            calendarMonth.textContent =
                calendarDate.toLocaleDateString(
                    "pt-BR",
                    {
                        month: "long",
                        year: "numeric"
                    }
                );
        }


        for (
            let i = 0;
            i < firstDay;
            i++
        ) {

            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "calendar-day empty";


            calendarDays.appendChild(
                empty
            );
        }


        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        const todayString =
            dateToString(today);


        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const date =
                new Date(
                    year,
                    month,
                    day
                );


            const dateString =
                dateToString(date);


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "calendar-day";


            button.textContent =
                day;


            if (
                dateString ===
                todayString
            ) {

                button.classList.add(
                    "today"
                );
            }


            if (
                dateString <
                todayString
            ) {

                button.disabled =
                    true;


                button.classList.add(
                    "unavailable"
                );
            }


            if (
                isUnavailable(
                    dateString
                )
            ) {

                button.disabled =
                    true;


                button.classList.add(
                    "unavailable"
                );
            }


            if (
                dateString ===
                startDate.value
            ) {

                button.classList.add(
                    "selected",
                    "range-start"
                );
            }


            if (
                dateString ===
                    endDate.value &&
                endDate.value !==
                    startDate.value
            ) {

                button.classList.add(
                    "selected",
                    "range-end"
                );
            }


            if (
                startDate.value &&
                endDate.value &&
                dateString >
                    startDate.value &&
                dateString <
                    endDate.value
            ) {

                button.classList.add(
                    "in-range"
                );
            }


            if (
                !button.disabled
            ) {

                button.addEventListener(
                    "click",
                    () => {

                        selectCalendarDate(
                            dateString
                        );

                    }
                );
            }


            calendarDays.appendChild(
                button
            );
        }
    }


    // ======================================
    // SELECIONAR DATA
    // ======================================

    function selectCalendarDate(
        dateString
    ) {

        if (
            selectingStart ||
            !startDate.value ||
            endDate.value
        ) {

            if (
                isUnavailable(
                    dateString
                )
            ) {

                alert(
                    "Essa data já está alugada."
                );

                return;
            }


            startDate.value =
                dateString;


            endDate.value =
                "";


            selectingStart =
                false;


            selectedStartDisplay.textContent =
                formatDateBR(
                    dateString
                );


            selectedEndDisplay.textContent =
                "Selecione a devolução";


            renderCalendar();

            updateTotals();

            return;
        }


        if (
            dateString <
            startDate.value
        ) {

            alert(
                "A devolução não pode ser anterior à retirada."
            );

            return;
        }


        if (
            rangeContainsUnavailable(
                startDate.value,
                dateString
            )
        ) {

            alert(
                "Esse período contém dias já alugados. Escolha outro período."
            );

            return;
        }


        endDate.value =
            dateString;


        selectedEndDisplay.textContent =
            formatDateBR(
                dateString
            );


        selectingStart =
            true;


        renderCalendar();

        updateTotals();
    }


    // ======================================
    // VERIFICAR INTERVALO
    // ======================================

    function rangeContainsUnavailable(
        start,
        end
    ) {

        const startObject =
            new Date(
                `${start}T00:00:00`
            );


        const endObject =
            new Date(
                `${end}T00:00:00`
            );


        const current =
            new Date(
                startObject
            );


        while (
            current <=
            endObject
        ) {

            const currentString =
                dateToString(
                    current
                );


            if (
                isUnavailable(
                    currentString
                )
            ) {

                return true;
            }


            current.setDate(
                current.getDate() + 1
            );
        }


        return false;
    }


    // ======================================
    // DIAS
    // ======================================

    function getDays() {

        if (
            !startDate.value ||
            !endDate.value
        ) {

            return 0;
        }


        const start =
            new Date(
                `${startDate.value}T00:00:00`
            );


        const end =
            new Date(
                `${endDate.value}T00:00:00`
            );


        const difference =
            Math.round(
                (
                    end - start
                ) / 86400000
            );


        return difference >= 0
            ? difference + 1
            : 0;
    }


    // ======================================
    // INICIALIZAR CALENDÁRIO
    // ======================================

    function initializeCalendar() {

        startDate.value =
            "";

        endDate.value =
            "";


        selectedStartDisplay.textContent =
            "Selecione uma data";


        selectedEndDisplay.textContent =
            "Selecione a devolução";


        selectingStart =
            true;


        calendarDate =
            new Date();


        calendarDate.setDate(
            1
        );


        renderCalendar();
    }


    // ======================================
    // MÊS ANTERIOR
    // ======================================

    if (calendarPrev) {

        calendarPrev.addEventListener(
            "click",
            () => {

                const currentMonth =
                    new Date();


                currentMonth.setDate(
                    1
                );


                const previous =
                    new Date(
                        calendarDate
                    );


                previous.setMonth(
                    previous.getMonth() - 1
                );


                const minimumMonth =
                    new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        1
                    );


                if (
                    previous <
                    minimumMonth
                ) {

                    return;
                }


                calendarDate =
                    previous;


                renderCalendar();

            }
        );
    }


    // ======================================
    // PRÓXIMO MÊS
    // ======================================

    if (calendarNext) {

        calendarNext.addEventListener(
            "click",
            () => {

                calendarDate.setMonth(
                    calendarDate.getMonth() + 1
                );


                renderCalendar();

            }
        );
    }


    // ======================================
    // ENTREGA
    // ======================================

    document
        .querySelectorAll(
            'input[name="delivery"]'
        )
        .forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    () => {

                        updateDeliveryUI();

                        updateTotals();

                    }
                );

            }
        );


    // ======================================
    // LOGIN
    // ======================================

    const loginButton =
        document.querySelector(
            "#login-button"
        );


    if (loginButton) {

        loginButton.addEventListener(
            "click",
            () => {

                const currentUser =
                    localStorage.getItem(
                        "alugase_user"
                    );


                const currentToken =
                    localStorage.getItem(
                        "token"
                    );


                if (
                    currentUser &&
                    currentToken
                ) {

                    window.location.href =
                        "perfil.html";

                } else {

                    window.location.href =
                        "login.html";
                }
            }
        );
    }


    // ======================================
    // ANUNCIAR
    // ======================================

    const announceButton =
        document.querySelector(
            "#announce-button"
        );


    if (announceButton) {

        announceButton.addEventListener(
            "click",
            () => {

                const currentToken =
                    localStorage.getItem(
                        "token"
                    );


                if (!currentToken) {

                    window.location.href =
                        "login.html";

                    return;
                }


                window.location.href =
                    "novo-anuncio.html";
            }
        );
    }


    // ======================================
    // SOLICITAR ALUGUEL
    // ======================================

    if (rentalButton) {

        rentalButton.addEventListener(
            "click",
            () => {

                // LOGIN

                const currentToken =
                    localStorage.getItem(
                        "token"
                    );


                if (!currentToken) {

                    window.location.href =
                        "login.html";

                    return;
                }


                // DATAS

                if (
                    !startDate.value ||
                    !endDate.value
                ) {

                    alert(
                        "Escolha a data de retirada e a data de devolução."
                    );

                    return;
                }


                // ORDEM

                if (
                    endDate.value <
                    startDate.value
                ) {

                    alert(
                        "A data de devolução não pode ser anterior à retirada."
                    );

                    return;
                }


                // DISPONIBILIDADE

                if (
                    rangeContainsUnavailable(
                        startDate.value,
                        endDate.value
                    )
                ) {

                    alert(
                        "O período escolhido possui dias indisponíveis."
                    );

                    return;
                }


                // ==================================
                // ENTREGA
                // ==================================

                const selectedDelivery =
                    document.querySelector(
                        'input[name="delivery"]:checked'
                    );


                const delivery =
                    selectedDelivery?.value ===
                    "delivery";


                if (delivery) {

                    const result =
                        calculateDelivery();


                    if (
                        result.reason ===
                        "disabled"
                    ) {

                        alert(
                            "Este produto não possui entrega disponível."
                        );

                        return;
                    }


                    if (
                        result.reason ===
                        "owner-location"
                    ) {

                        alert(
                            "Não foi possível localizar o endereço do proprietário para calcular a entrega."
                        );

                        return;
                    }


                    if (
                        result.reason ===
                        "renter-location"
                    ) {

                        alert(
                            "Cadastre seu endereço no perfil para utilizar a entrega."
                        );

                        return;
                    }


                    if (
                        !result.valid
                    ) {

                        alert(
                            "Não foi possível calcular o valor da entrega."
                        );

                        return;
                    }
                }


                // ==================================
                // PARÂMETROS
                // ==================================

                const params =
                    new URLSearchParams();


                params.set(
                    "id",
                    product._id
                );


                params.set(
                    "start",
                    startDate.value
                );


                params.set(
                    "end",
                    endDate.value
                );


                params.set(
                    "delivery",
                    delivery
                        ? "delivery"
                        : "pickup"
                );


                // IMPORTANTE:
                //
                // NÃO enviamos:
                //
                // deliveryDistance
                // deliveryPrice
                //
                // O backend calcula tudo novamente
                // usando as coordenadas reais.


                // ==================================
                // IR PARA RESERVA
                // ==================================

                window.location.href =
                    `reserva.html?${params.toString()}`;

            }
        );
    }


    // ======================================
    // INICIAR
    // ======================================

    await loadProduct();

});
