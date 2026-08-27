// ==========================================
// ALUGASE — RESERVA
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // ==========================================
        // API
        // ==========================================

        const API =
            "https://alugase-api.onrender.com/api";

        const PRODUCTS_API =
            `${API}/products`;

        const USERS_API =
            `${API}/users`;

        const RENTALS_API =
            `${API}/rentals`;


        // ==========================================
        // CONFIGURAÇÃO DA ENTREGA
        // ==========================================

        // O valor NÃO vem do anúncio.
        // O sistema cobra R$ 2,00 por km.

        const DELIVERY_PRICE_PER_KM =
            2.00;


        // ==========================================
        // TOKEN
        // ==========================================

        const token =
            localStorage.getItem("token");


        // ==========================================
        // USUÁRIO LOCAL
        // ==========================================

        let storedUser = null;

        try {

            storedUser =
                JSON.parse(
                    localStorage.getItem(
                        "alugase_user"
                    )
                );

        } catch {

            storedUser = null;

        }


        if (!token || !storedUser) {

            alert(
                "Faça login para continuar."
            );

            window.location.href =
                "login.html";

            return;

        }


        // ==========================================
        // URL
        // ==========================================

        const params =
            new URLSearchParams(
                window.location.search
            );


        const productId =
            params.get("id");


        const selectedStart =
            params.get("start");


        const selectedEnd =
            params.get("end");


        const selectedDelivery =
            params.get("delivery");


        if (!productId) {

            window.location.href =
                "explorar.html";

            return;

        }


        // ==========================================
        // ELEMENTOS
        // ==========================================

        const productImage =
            document.querySelector(
                "#product-image"
            );


        const productCategory =
            document.querySelector(
                "#product-category"
            );


        const productTitle =
            document.querySelector(
                "#product-title"
            );


        const productCity =
            document.querySelector(
                "#product-city"
            );


        const productDescription =
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


        const startDate =
            document.querySelector(
                "#start-date"
            );


        const endDate =
            document.querySelector(
                "#end-date"
            );


        const selectedStartDisplay =
            document.querySelector(
                "#selected-start-display"
            );


        const selectedEndDisplay =
            document.querySelector(
                "#selected-end-display"
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


        const deliveryOption =
            document.querySelector(
                'input[name="delivery"][value="delivery"]'
            );


        const pickupOption =
            document.querySelector(
                'input[name="delivery"][value="pickup"]'
            );


        const deliveryText =
            document.querySelector(
                "#delivery-text"
            );


        const deliveryInfo =
            document.querySelector(
                "#delivery-info"
            );


        const deliveryDistanceSummary =
            document.querySelector(
                "#delivery-distance-summary"
            );


        const deliveryDistanceElement =
            document.querySelector(
                "#delivery-distance"
            );


        const dailyPrice =
            document.querySelector(
                "#daily-price"
            );


        const daysElement =
            document.querySelector(
                "#days"
            );


        const rentTotal =
            document.querySelector(
                "#rent-total"
            );


        const deliveryTotal =
            document.querySelector(
                "#delivery-total"
            );


        const depositTotal =
            document.querySelector(
                "#deposit-total"
            );


        const grandTotal =
            document.querySelector(
                "#grand-total"
            );


        const notes =
            document.querySelector(
                "#notes"
            );


        const confirmButton =
            document.querySelector(
                "#confirm-reservation"
            );


        const backProduct =
            document.querySelector(
                "#back-product"
            );


        // ==========================================
        // PROPRIETÁRIO
        // ==========================================

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


        // ==========================================
        // VARIÁVEIS
        // ==========================================

        let product = null;

        let owner = null;

        let currentUser =
            storedUser;

        let calendarDate =
            new Date();

        let selectingStart =
            true;

        let unavailableDates =
            [];

        let deliveryCalculation = {

            distance: 0,

            value: 0,

            valid: false,

            reason:
                "not-calculated"

        };


        // ==========================================
        // DINHEIRO
        // ==========================================

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


        // ==========================================
        // DATA → STRING
        // ==========================================

        function dateToString(date) {

            const year =
                date.getFullYear();


            const month =
                String(
                    date.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );


            const day =
                String(
                    date.getDate()
                ).padStart(
                    2,
                    "0"
                );


            return `${year}-${month}-${day}`;

        }


        // ==========================================
        // DATA → BR
        // ==========================================

        function formatDateBR(dateString) {

            if (!dateString) {

                return "Selecione uma data";

            }


            const parts =
                dateString.split("-");


            if (
                parts.length !== 3
            ) {

                return "Data inválida";

            }


            const [
                year,
                month,
                day
            ] = parts;


            return `${day}/${month}/${year}`;

        }


        // ==========================================
        // NORMALIZAR DATA
        // ==========================================

        function normalizeDate(date) {

            if (!date) {

                return null;

            }


            let value;


            if (
                typeof date === "string" &&
                /^\d{4}-\d{2}-\d{2}$/.test(
                    date
                )
            ) {

                value =
                    new Date(
                        `${date}T00:00:00`
                    );

            } else {

                value =
                    new Date(date);

            }


            if (
                Number.isNaN(
                    value.getTime()
                )
            ) {

                return null;

            }


            value.setHours(
                0,
                0,
                0,
                0
            );


            return dateToString(
                value
            );

        }


        // ==========================================
        // DATA INDISPONÍVEL
        // ==========================================

        function isUnavailable(
            dateString
        ) {

            return unavailableDates.includes(
                dateString
            );

        }


        // ==========================================
        // ADICIONAR PERÍODO
        // ==========================================

        function addDateRange(
            startString,
            endString
        ) {

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


            const finish =
                new Date(
                    `${endString}T00:00:00`
                );


            while (
                current <= finish
            ) {

                const dateString =
                    dateToString(
                        current
                    );


                if (
                    !unavailableDates.includes(
                        dateString
                    )
                ) {

                    unavailableDates.push(
                        dateString
                    );

                }


                current.setDate(
                    current.getDate() + 1
                );

            }

        }


        // ==========================================
        // BUSCAR DATAS OCUPADAS
        // ==========================================

        async function loadUnavailableDates() {

            try {

                const response =
                    await fetch(
                        `${RENTALS_API}/product/${productId}/unavailable`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Não foi possível carregar as datas ocupadas."
                    );

                }


                const data =
                    await response.json();


                unavailableDates = [];


                const rentals =
                    Array.isArray(
                        data.rentals
                    )
                        ? data.rentals
                        : [];


                rentals.forEach(
                    rental => {

                        const start =
                            normalizeDate(
                                rental.startDate
                            );


                        const end =
                            normalizeDate(
                                rental.endDate
                            );


                        if (
                            start &&
                            end
                        ) {

                            addDateRange(
                                start,
                                end
                            );

                        }

                    }
                );


            } catch (error) {

                console.error(
                    "Erro ao carregar datas indisponíveis:",
                    error
                );

                unavailableDates = [];

            }

        }


        // ==========================================
        // INTERVALO INDISPONÍVEL
        // ==========================================

        function rangeContainsUnavailable(
            start,
            end
        ) {

            if (
                !start ||
                !end
            ) {

                return false;

            }


            const current =
                new Date(
                    `${start}T00:00:00`
                );


            const finish =
                new Date(
                    `${end}T00:00:00`
                );


            while (
                current <= finish
            ) {

                if (
                    isUnavailable(
                        dateToString(
                            current
                        )
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


        // ==========================================
        // BUSCAR USUÁRIO ATUALIZADO
        // ==========================================

        async function loadCurrentUser() {

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

                    console.warn(
                        "Não foi possível atualizar o usuário."
                    );

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


        // ==========================================
        // BUSCAR PROPRIETÁRIO
        // ==========================================

        async function loadOwner() {

            if (
                !product?.ownerId
            ) {

                return;

            }


            try {

                const ownerId =
                    typeof product.ownerId ===
                    "object"

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


        // ==========================================
        // EXTRAIR COORDENADAS
        // ==========================================

        function getCoordinates(
            source
        ) {

            if (!source) {

                return null;

            }


            const lat =
                Number(
                    source.lat ??
                    source.latitude
                );


            const lng =
                Number(
                    source.lng ??
                    source.longitude
                );


            if (
                Number.isFinite(lat) &&
                Number.isFinite(lng) &&
                lat >= -90 &&
                lat <= 90 &&
                lng >= -180 &&
                lng <= 180
            ) {

                return {

                    lat,

                    lng

                };

            }


            // GeoJSON

            if (
                Array.isArray(
                    source.coordinates
                ) &&
                source.coordinates.length >= 2
            ) {

                const geoLng =
                    Number(
                        source.coordinates[0]
                    );


                const geoLat =
                    Number(
                        source.coordinates[1]
                    );


                if (
                    Number.isFinite(
                        geoLat
                    ) &&
                    Number.isFinite(
                        geoLng
                    )
                ) {

                    return {

                        lat: geoLat,

                        lng: geoLng

                    };

                }

            }


            return null;

        }


        // ==========================================
        // LOCALIZAÇÃO DO PROPRIETÁRIO
        // ==========================================

        function getOwnerLocation() {

            const locations = [

                product?.ownerLocation,

                owner?.location,

                owner?.ownerLocation,

                owner?.address?.location

            ];


            for (
                const location
                of locations
            ) {

                const coordinates =
                    getCoordinates(
                        location
                    );


                if (coordinates) {

                    return coordinates;

                }

            }


            return null;

        }


        // ==========================================
        // LOCALIZAÇÃO DO CLIENTE
        // ==========================================

        function getRenterLocation() {

            const locations = [

                currentUser?.location,

                currentUser?.userLocation,

                currentUser?.address?.location,

                currentUser?.renterLocation

            ];


            for (
                const location
                of locations
            ) {

                const coordinates =
                    getCoordinates(
                        location
                    );


                if (coordinates) {

                    return coordinates;

                }

            }


            return null;

        }


        // ==========================================
        // HAVERSINE
        // ==========================================

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


            const toRadians =
                degrees =>
                    degrees *
                    Math.PI /
                    180;


            const lat1 =
                toRadians(
                    pointA.lat
                );


            const lat2 =
                toRadians(
                    pointB.lat
                );


            const deltaLat =
                toRadians(
                    pointB.lat -
                    pointA.lat
                );


            const deltaLng =
                toRadians(
                    pointB.lng -
                    pointA.lng
                );


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


        // ==========================================
        // CALCULAR ENTREGA
        // ==========================================

        function calculateDelivery() {

            if (!product) {

                return {

                    distance: 0,

                    value: 0,

                    valid: false,

                    reason:
                        "product"

                };

            }


            const enabled =
                product.delivery === true ||
                product.delivery === "true";


            if (!enabled) {

                return {

                    distance: 0,

                    value: 0,

                    valid: false,

                    reason:
                        "disabled"

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

                    reason:
                        "owner-location"

                };

            }


            if (!renterLocation) {

                return {

                    distance: 0,

                    value: 0,

                    valid: false,

                    reason:
                        "renter-location"

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

                    reason:
                        "distance"

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

                reason:
                    "ok"

            };

        }


        // ==========================================
        // ATUALIZAR UI DA ENTREGA
        // ==========================================

        function updateDeliveryUI() {

            if (!product) {

                return;

            }


            const enabled =
                product.delivery === true ||
                product.delivery === "true";


            if (!enabled) {

                if (deliveryOption) {

                    deliveryOption.disabled =
                        true;

                }


                if (deliveryText) {

                    deliveryText.textContent =
                        "Somente retirada";

                }


                if (deliveryInfo) {

                    deliveryInfo.textContent =
                        "Este produto não possui opção de entrega.";

                }


                if (
                    deliveryDistanceSummary
                ) {

                    deliveryDistanceSummary.style.display =
                        "none";

                }


                if (pickupOption) {

                    pickupOption.checked =
                        true;

                }


                return;

            }


            if (deliveryOption) {

                deliveryOption.disabled =
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

                if (deliveryText) {

                    deliveryText.textContent =
                        "Calcular automaticamente";

                }


                if (deliveryInfo) {

                    deliveryInfo.textContent =
                        "O valor será calculado automaticamente pela distância entre os endereços.";

                }


                if (
                    deliveryDistanceSummary
                ) {

                    deliveryDistanceSummary.style.display =
                        "none";

                }


                return;

            }


            deliveryCalculation =
                calculateDelivery();


            if (
                deliveryCalculation.reason ===
                "owner-location"
            ) {

                deliveryText.textContent =
                    "Indisponível";


                deliveryInfo.textContent =
                    "Não foi possível localizar o endereço do proprietário.";


                return;

            }


            if (
                deliveryCalculation.reason ===
                "renter-location"
            ) {

                deliveryText.textContent =
                    "Endereço necessário";


                deliveryInfo.textContent =
                    "Cadastre seu endereço no perfil para calcular a entrega.";


                return;

            }


            if (
                deliveryCalculation.reason ===
                "distance"
            ) {

                deliveryText.textContent =
                    "Erro no cálculo";


                deliveryInfo.textContent =
                    "Não foi possível calcular a distância.";


                return;

            }


            if (
                deliveryCalculation.valid
            ) {

                const distance =
                    deliveryCalculation.distance;


                const value =
                    deliveryCalculation.value;


                deliveryText.textContent =
                    `+ R$ ${formatMoney(value)}`;


                deliveryInfo.textContent =
                    `Entrega calculada automaticamente: ${distance.toFixed(1)} km × R$ 2,00/km.`;


                if (
                    deliveryDistanceSummary
                ) {

                    deliveryDistanceSummary.style.display =
                        "flex";

                }


                if (
                    deliveryDistanceElement
                ) {

                    deliveryDistanceElement.textContent =
                        `${distance.toFixed(1)} km`;

                }


                return;

            }

        }


        // ==========================================
        // CARREGAR PRODUTO
        // ==========================================

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


                fillProduct();

                initializeDates();

                updateDeliveryUI();

                calculate();


            } catch (error) {

                console.error(
                    "Erro ao carregar reserva:",
                    error
                );


                alert(
                    error.message ||
                    "Não foi possível carregar o produto."
                );


                window.location.href =
                    "explorar.html";

            }

        }


        // ==========================================
        // PREENCHER PRODUTO
        // ==========================================

        function fillProduct() {

            if (productTitle) {

                productTitle.textContent =
                    product.title ||
                    "Produto";

            }


            if (productCategory) {

                productCategory.textContent =
                    (
                        product.category ||
                        "Produto"
                    ).toUpperCase();

            }


            if (productCity) {

                productCity.textContent =
                    `📍 ${
                        product.city ||
                        "Localização não informada"
                    }`;

            }


            if (productDescription) {

                productDescription.textContent =
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


            document.title =
                `${product.title || "Reserva"} | Alugase`;


            // ======================================
            // IMAGEM
            // ======================================

            if (productImage) {

                let image = null;


                if (
                    Array.isArray(
                        product.images
                    ) &&
                    product.images.length > 0
                ) {

                    image =
                        product.images[0];

                } else if (
                    product.image
                ) {

                    image =
                        product.image;

                }


                if (image) {

                    productImage.innerHTML = `

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(
                                product.title ||
                                "Produto"
                            )}"
                        >

                    `;

                } else {

                    productImage.textContent =
                        "📦";

                }

            }


            // ======================================
            // PREÇO
            // ======================================

            if (dailyPrice) {

                dailyPrice.textContent =
                    `R$ ${formatMoney(
                        product.pricePerDay
                    )}`;

            }


            // ======================================
            // VOLTAR
            // ======================================

            if (backProduct) {

                backProduct.href =
                    `produto.html?id=${encodeURIComponent(
                        product._id
                    )}`;

            }


            renderOwner();

        }


        // ==========================================
        // PROPRIETÁRIO
        // ==========================================

        function renderOwner() {

            if (!owner) {

                if (ownerName) {

                    ownerName.textContent =
                        "Proprietário";

                }

                return;

            }


            const name =
                owner.name ||
                owner.fullName ||
                "Proprietário";


            if (ownerName) {

                ownerName.textContent =
                    name;

            }


            if (ownerRating) {

                ownerRating.textContent =
                    owner.rating ||
                    "5.0";

            }


            if (ownerReviews) {

                ownerReviews.textContent =
                    owner.reviews ||
                    owner.reviewCount ||
                    "0";

            }


            if (ownerVerification) {

                const verified =
                    owner.identityVerified ===
                    true;


                ownerVerification.textContent =
                    verified
                        ? "✓ Usuário verificado"
                        : "Usuário";

                ownerVerification.className =
                    verified
                        ? "owner-verified"
                        : "";

            }


            if (ownerAvatar) {

                const image =
                    owner.profileImage ||
                    owner.profileImageUrl ||
                    owner.avatar;


                if (image) {

                    ownerAvatar.innerHTML = `

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}"
                            class="owner-profile-image"
                        >

                    `;

                } else {

                    const initials =
                        getInitials(
                            name
                        );


                    ownerAvatar.innerHTML = `

                        <span class="owner-initials">
                            ${escapeHTML(initials)}
                        </span>

                    `;

                }

            }

        }


        // ==========================================
        // INICIA DATAS
        // ==========================================

        function initializeDates() {

            const today =
                new Date();


            const todayString =
                dateToString(
                    today
                );


            let start =
                selectedStart &&
                selectedStart >= todayString &&
                !isUnavailable(
                    selectedStart
                )
                    ? selectedStart
                    : todayString;


            let end =
                selectedEnd &&
                selectedEnd >= start &&
                !rangeContainsUnavailable(
                    start,
                    selectedEnd
                )
                    ? selectedEnd
                    : "";


            startDate.value =
                start;


            endDate.value =
                end;


            if (
                selectedDelivery ===
                "delivery" &&
                product.delivery === true &&
                deliveryOption
            ) {

                deliveryOption.checked =
                    true;

            } else if (
                pickupOption
            ) {

                pickupOption.checked =
                    true;

            }


            if (selectedStartDisplay) {

                selectedStartDisplay.textContent =
                    formatDateBR(
                        start
                    );

            }


            if (selectedEndDisplay) {

                selectedEndDisplay.textContent =
                    end
                        ? formatDateBR(end)
                        : "Selecione a devolução";

            }


            selectingStart =
                !end;


            calendarDate =
                new Date(
                    `${start}T00:00:00`
                );


            renderCalendar();

        }


        // ==========================================
        // CALENDÁRIO
        // ==========================================

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
                dateToString(
                    new Date()
                );


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
                    dateToString(
                        date
                    );


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
                    today
                ) {

                    button.classList.add(
                        "today"
                    );

                }


                if (
                    dateString < today
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


                if (!button.disabled) {

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


        // ==========================================
        // SELECIONAR DATA
        // ==========================================

        function selectCalendarDate(
            dateString
        ) {

            if (
                isUnavailable(
                    dateString
                )
            ) {

                alert(
                    "Esta data já está alugada."
                );

                return;

            }


            if (
                selectingStart ||
                !startDate.value ||
                (
                    startDate.value &&
                    endDate.value
                )
            ) {

                startDate.value =
                    dateString;


                endDate.value =
                    "";


                selectedStartDisplay.textContent =
                    formatDateBR(
                        dateString
                    );


                selectedEndDisplay.textContent =
                    "Selecione a devolução";


                selectingStart =
                    false;


                renderCalendar();

                calculate();

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

            calculate();

        }


        // ==========================================
        // MÊS ANTERIOR
        // ==========================================

        calendarPrev?.addEventListener(
            "click",
            () => {

                const current =
                    new Date();

                current.setDate(1);


                const previous =
                    new Date(
                        calendarDate
                    );


                previous.setMonth(
                    previous.getMonth() - 1
                );


                if (
                    previous <
                    new Date(
                        current.getFullYear(),
                        current.getMonth(),
                        1
                    )
                ) {

                    return;

                }


                calendarDate =
                    previous;


                renderCalendar();

            }
        );


        // ==========================================
        // PRÓXIMO MÊS
        // ==========================================

        calendarNext?.addEventListener(
            "click",
            () => {

                calendarDate.setMonth(
                    calendarDate.getMonth() + 1
                );


                renderCalendar();

            }
        );


        // ==========================================
        // DIAS
        // ==========================================

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
                        end -
                        start
                    ) /
                    86400000
                );


            return difference >= 0
                ? difference + 1
                : 0;

        }


        // ==========================================
        // CALCULAR
        // ==========================================

        function calculate() {

            if (!product) {

                return {

                    days: 0,

                    rent: 0,

                    delivery: 0,

                    deposit: 0,

                    total: 0

                };

            }


            const days =
                getDays();


            const selected =
                document.querySelector(
                    'input[name="delivery"]:checked'
                );


            const wantsDelivery =
                selected?.value ===
                "delivery";


            let deliveryValue =
                0;


            if (wantsDelivery) {

                deliveryCalculation =
                    calculateDelivery();


                if (
                    deliveryCalculation.valid
                ) {

                    deliveryValue =
                        deliveryCalculation.value;

                }

            } else {

                deliveryCalculation = {

                    distance: 0,

                    value: 0,

                    valid: false,

                    reason:
                        "pickup"

                };

            }


            const pricePerDay =
                Number(
                    product.pricePerDay
                ) || 0;


            const deposit =
                Number(
                    product.deposit
                ) || 0;


            const rent =
                days *
                pricePerDay;


            const total =
                rent +
                deliveryValue +
                deposit;


            if (daysElement) {

                daysElement.textContent =
                    days;

            }


            if (rentTotal) {

                rentTotal.textContent =
                    `R$ ${formatMoney(
                        rent
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


            if (grandTotal) {

                grandTotal.textContent =
                    `R$ ${formatMoney(
                        total
                    )}`;

            }


            updateDeliveryUI();


            return {

                days,

                rent,

                delivery:
                    deliveryValue,

                deposit,

                total

            };

        }


        // ==========================================
        // ENTREGA CHANGE
        // ==========================================

        document
            .querySelectorAll(
                'input[name="delivery"]'
            )
            .forEach(
                radio => {

                    radio.addEventListener(
                        "change",
                        () => {

                            calculate();

                        }
                    );

                }
            );


        // ==========================================
        // CONFIRMAR RESERVA
        // ==========================================

        confirmButton?.addEventListener(
            "click",
            async () => {

                if (!product) {

                    alert(
                        "Produto ainda não carregado."
                    );

                    return;

                }


                if (
                    !startDate.value ||
                    !endDate.value
                ) {

                    alert(
                        "Escolha a data de retirada e a data de devolução."
                    );

                    return;

                }


                if (
                    endDate.value <
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
                        endDate.value
                    )
                ) {

                    alert(
                        "O período escolhido possui dias indisponíveis."
                    );

                    return;

                }


                const selected =
                    document.querySelector(
                        'input[name="delivery"]:checked'
                    );


                const wantsDelivery =
                    selected?.value ===
                    "delivery";


                // ==================================
                // VALIDAR ENTREGA
                // ==================================

                if (wantsDelivery) {

                    const result =
                        calculateDelivery();


                    if (
                        result.reason ===
                        "disabled"
                    ) {

                        alert(
                            "Este produto não possui opção de entrega."
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


                const values =
                    calculate();


                const renterId =
                    currentUser?._id ||
                    currentUser?.id ||
                    storedUser?._id ||
                    storedUser?.id;


                if (!renterId) {

                    alert(
                        "Não foi possível identificar o usuário."
                    );

                    return;

                }


                confirmButton.disabled =
                    true;


                confirmButton.textContent =
                    "Enviando...";


                try {

                    // ==================================
                    // CRIAR ALUGUEL
                    // ==================================

                    const rentalResponse =
                        await fetch(
                            `${RENTALS_API}`,
                            {

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json",

                                    Authorization:
                                        `Bearer ${token}`

                                },

                                body:
                                    JSON.stringify({

                                        productId:
                                            product._id,

                                        renterId:
                                            renterId,

                                        startDate:
                                            startDate.value,

                                        endDate:
                                            endDate.value,

                                        delivery:
                                            wantsDelivery,

                                        notes:
                                            notes
                                                ? notes.value.trim()
                                                : ""

                                    })

                            }
                        );


                    const rentalData =
                        await rentalResponse.json();


                    if (
                        !rentalResponse.ok
                    ) {

                        throw new Error(
                            rentalData.error ||
                            "Não foi possível criar a solicitação."
                        );

                    }


                    const rental =
                        rentalData.rental;


                    if (
                        !rental ||
                        !rental._id
                    ) {

                        throw new Error(
                            "O aluguel foi criado, mas a API não retornou o ID."
                        );

                    }


                    // ==================================
                    // PROPRIETÁRIO
                    // ==================================

                    const ownerId =
                        typeof product.ownerId ===
                        "object"

                            ? product.ownerId._id

                            : product.ownerId;


                    // ==================================
                    // CRIAR CHAT
                    // ==================================

                    if (ownerId) {

                        try {

                            const chatResponse =
                                await fetch(
                                    `${API}/chats`,
                                    {

                                        method:
                                            "POST",

                                        headers: {

                                            "Content-Type":
                                                "application/json",

                                            Authorization:
                                                `Bearer ${token}`

                                        },

                                        body:
                                            JSON.stringify({

                                                rentalId:
                                                    rental._id,

                                                productId:
                                                    product._id,

                                                ownerId:
                                                    ownerId,

                                                renterId:
                                                    renterId,

                                                productTitle:
                                                    product.title

                                            })

                                    }
                                );


                            const chatData =
                                await chatResponse.json();


                            if (
                                chatResponse.ok &&
                                chatData._id
                            ) {

                                alert(
                                    "Solicitação enviada com sucesso!"
                                );


                                window.location.href =
                                    `chat.html?chat=${chatData._id}`;


                                return;

                            }


                            console.warn(
                                "Aluguel criado, mas o chat não foi criado.",
                                chatData
                            );


                        } catch (chatError) {

                            console.warn(
                                "Erro ao criar chat:",
                                chatError
                            );

                        }

                    }


                    alert(
                        "Solicitação enviada com sucesso!"
                    );


                    window.location.href =
                        "solicitacoes.html";


                } catch (error) {

                    console.error(
                        "Erro ao confirmar reserva:",
                        error
                    );


                    alert(
                        error.message ||
                        "Ocorreu um erro ao enviar a solicitação."
                    );


                    confirmButton.disabled =
                        false;


                    confirmButton.textContent =
                        "Confirmar solicitação";

                }

            }
        );


        // ==========================================
        // ESCAPAR HTML
        // ==========================================

        function escapeHTML(value) {

            return String(
                value ?? ""
            )
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        }


        // ==========================================
        // INICIAIS
        // ==========================================

        function getInitials(name) {

            const parts =
                String(name || "")
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean);


            if (!parts.length) {

                return "U";

            }


            if (parts.length === 1) {

                return parts[0]
                    .substring(0, 2)
                    .toUpperCase();

            }


            return (
                parts[0][0] +
                parts[
                    parts.length - 1
                ][0]
            ).toUpperCase();

        }


        // ==========================================
        // INICIAR
        // ==========================================

        await loadProduct();

    }
);
