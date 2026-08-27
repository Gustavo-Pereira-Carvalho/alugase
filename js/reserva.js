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


        // ==========================================
        // USUÁRIO
        // ==========================================

        let currentUser =
            JSON.parse(
                localStorage.getItem("alugase_user")
            );


        if (!currentUser) {

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
                "index.html";

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


        const deliveryText =
            document.querySelector(
                "#delivery-text"
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
        // VARIÁVEIS
        // ==========================================

        let product = null;

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

            reason: null

        };


        // ==========================================
        // DINHEIRO
        // ==========================================

        function formatMoney(value) {

            return Number(value || 0)
                .toLocaleString(
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

        function formatDateBR(
            dateString
        ) {

            if (!dateString) {

                return "Selecione uma data";

            }


            const [
                year,
                month,
                day
            ] =
                dateString.split("-");


            return `${day}/${month}/${year}`;

        }


        // ==========================================
        // ADICIONAR PERÍODO À LISTA
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
        // VERIFICAR INDISPONÍVEL
        // ==========================================

        function isUnavailable(
            dateString
        ) {

            return unavailableDates.includes(
                dateString
            );

        }


        // ==========================================
        // BUSCAR DATAS ALUGADAS
        // ==========================================

        async function loadUnavailableDates() {

            try {

                const response =
                    await fetch(
                        `${API}/rentals/product/${productId}/unavailable`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Não foi possível carregar as datas ocupadas."
                    );

                }


                const data =
                    await response.json();


                unavailableDates =
                    [];


                const rentals =
                    Array.isArray(
                        data.rentals
                    )
                        ? data.rentals
                        : [];


                rentals.forEach(
                    rental => {

                        if (
                            !rental.startDate ||
                            !rental.endDate
                        ) {

                            return;

                        }


                        const start =
                            new Date(
                                rental.startDate
                            );


                        const end =
                            new Date(
                                rental.endDate
                            );


                        if (
                            Number.isNaN(
                                start.getTime()
                            ) ||
                            Number.isNaN(
                                end.getTime()
                            )
                        ) {

                            return;

                        }


                        const startString =
                            dateToString(
                                start
                            );


                        const endString =
                            dateToString(
                                end
                            );


                        addDateRange(
                            startString,
                            endString
                        );

                    }
                );


                console.log(
                    "Datas indisponíveis:",
                    unavailableDates
                );


            } catch (error) {

                console.error(
                    "Erro ao carregar datas indisponíveis:",
                    error
                );

                unavailableDates =
                    [];

            }

        }


        // ==========================================
        // INTERVALO CONTÉM INDISPONÍVEL
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


        // ==========================================
        // CARREGAR USUÁRIO ATUALIZADO
        // ==========================================

        async function loadCurrentUser() {

            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API}/users/me`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                if (!response.ok) {

                    console.warn(
                        "Não foi possível atualizar os dados do usuário."
                    );

                    return;

                }


                const data =
                    await response.json();


                /*
                 * Algumas APIs retornam diretamente
                 * o usuário e outras retornam:
                 *
                 * { user: {...} }
                 *
                 * Aceitamos os dois formatos.
                 */

                currentUser =
                    data.user ||
                    data;


                if (
                    currentUser
                ) {

                    localStorage.setItem(
                        "alugase_user",
                        JSON.stringify(
                            currentUser
                        )
                    );

                }

            } catch (error) {

                console.error(
                    "Erro ao carregar usuário:",
                    error
                );

            }

        }


        // ==========================================
        // EXTRAIR COORDENADAS
        // ==========================================

        function getLocationCoordinates(
            source
        ) {

            if (!source) {

                return null;

            }


            // ------------------------------
            // lat / lng
            // ------------------------------

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


            // ------------------------------
            // latitude / longitude
            // ------------------------------

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


            // ------------------------------
            // GeoJSON
            // [longitude, latitude]
            // ------------------------------

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


        // ==========================================
        // LOCALIZAÇÃO DO PROPRIETÁRIO
        // ==========================================

        function getOwnerLocation() {

            const possibleLocations = [

                product?.ownerLocation,

                product?.ownerId?.location,

                product?.ownerId?.ownerLocation,

                product?.ownerId?.address?.location,

                product?.owner?.location,

                product?.owner?.address?.location

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


        // ==========================================
        // LOCALIZAÇÃO DO CLIENTE
        // ==========================================

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


        // ==========================================
        // DISTÂNCIA — HAVERSINE
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
                ) *
                Math.sin(
                    deltaLat / 2
                ) +

                Math.cos(lat1) *
                Math.cos(lat2) *

                Math.sin(
                    deltaLng / 2
                ) *
                Math.sin(
                    deltaLng / 2
                );


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


            // ==================================
            // REGRA ATUAL
            // R$ 2,00 POR KM
            // ==================================

            const value =
                Math.round(
                    distance *
                    2 *
                    100
                ) / 100;


            return {

                distance,

                value,

                valid: true,

                reason: "ok"

            };

        }


        // ==========================================
        // ATUALIZAR TEXTO DA ENTREGA
        // ==========================================

        function updateDeliveryUI() {

            const deliveryRadio =
                document.querySelector(
                    'input[name="delivery"][value="delivery"]'
                );


            if (!deliveryRadio) {

                return;

            }


            const enabled =
                product?.delivery === true ||
                product?.delivery === "true";


            if (!enabled) {

                deliveryRadio.disabled =
                    true;


                if (deliveryText) {

                    deliveryText.textContent =
                        "Somente retirada";

                }


                return;

            }


            deliveryRadio.disabled =
                false;


            const selected =
                document.querySelector(
                    'input[name="delivery"]:checked'
                );


            const isDelivery =
                selected?.value ===
                "delivery";


            if (!isDelivery) {

                if (deliveryText) {

                    deliveryText.textContent =
                        "Valor calculado automaticamente";

                }

                return;

            }


            deliveryCalculation =
                calculateDelivery();


            if (
                deliveryCalculation.reason ===
                "owner-location"
            ) {

                if (deliveryText) {

                    deliveryText.textContent =
                        "Localização do proprietário indisponível";

                }

                return;

            }


            if (
                deliveryCalculation.reason ===
                "renter-location"
            ) {

                if (deliveryText) {

                    deliveryText.textContent =
                        "Cadastre seu endereço para calcular";

                }

                return;

            }


            if (
                !deliveryCalculation.valid
            ) {

                if (deliveryText) {

                    deliveryText.textContent =
                        "Não foi possível calcular";

                }

                return;

            }


            if (deliveryText) {

                deliveryText.textContent =
                    `+ R$ ${formatMoney(
                        deliveryCalculation.value
                    )}`;

            }

        }


        // ==========================================
        // CARREGAR PRODUTO
        // ==========================================

        async function loadProduct() {

            try {

                const response =
                    await fetch(
                        `${API}/products/${productId}`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Produto não encontrado."
                    );

                }


                product =
                    await response.json();


                // ==================================
                // CARREGAR USUÁRIO ATUALIZADO
                // ==================================

                await loadCurrentUser();


                // ==================================
                // PREENCHER PRODUTO
                // ==================================

                fillProduct();


                // ==================================
                // CARREGAR DATAS OCUPADAS
                // ==================================

                await loadUnavailableDates();


                // ==================================
                // INICIALIZAR DATAS
                // ==================================

                initializeDates();


                // ==================================
                // CALCULAR
                // ==================================

                calculate();


                updateDeliveryUI();


            } catch (error) {

                console.error(
                    "Erro ao carregar produto:",
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
                        "Não informado"
                    }`;

            }


            document.title =
                `${product.title || "Reserva"} | Alugase`;


            // ======================================
            // IMAGEM
            // ======================================

            if (productImage) {

                if (
                    Array.isArray(
                        product.images
                    ) &&
                    product.images.length > 0
                ) {

                    productImage.innerHTML = "";

                    const image =
                        document.createElement(
                            "img"
                        );


                    image.src =
                        product.images[0];


                    image.alt =
                        product.title ||
                        "Produto";


                    productImage.appendChild(
                        image
                    );

                }

                else if (
                    product.image
                ) {

                    productImage.innerHTML = "";

                    const image =
                        document.createElement(
                            "img"
                        );


                    image.src =
                        product.image;


                    image.alt =
                        product.title ||
                        "Produto";


                    productImage.appendChild(
                        image
                    );

                }

                else {

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
            // ENTREGA
            // ======================================

            const deliveryOption =
                document.querySelector(
                    'input[name="delivery"][value="delivery"]'
                );


            const deliveryEnabled =
                product.delivery === true ||
                product.delivery === "true";


            if (deliveryEnabled) {

                if (deliveryOption) {

                    deliveryOption.disabled =
                        false;

                }


                if (deliveryText) {

                    deliveryText.textContent =
                        "Valor calculado automaticamente";

                }

            }

            else {

                if (deliveryText) {

                    deliveryText.textContent =
                        "Somente retirada";

                }


                if (deliveryOption) {

                    deliveryOption.disabled =
                        true;

                }


                const pickup =
                    document.querySelector(
                        'input[name="delivery"][value="pickup"]'
                    );


                if (pickup) {

                    pickup.checked =
                        true;

                }

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

        }


        // ==========================================
        // INICIALIZAR DATAS
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


            // ======================================
            // ENTREGA
            // ======================================

            const deliveryPickup =
                document.querySelector(
                    'input[name="delivery"][value="pickup"]'
                );


            const deliveryDelivery =
                document.querySelector(
                    'input[name="delivery"][value="delivery"]'
                );


            if (
                selectedDelivery ===
                "delivery" &&
                product.delivery &&
                deliveryDelivery
            ) {

                deliveryDelivery.checked =
                    true;

            }

            else if (
                deliveryPickup
            ) {

                deliveryPickup.checked =
                    true;

            }


            // ======================================
            // EXIBIÇÃO
            // ======================================

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


            // ======================================
            // ESPAÇOS
            // ======================================

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


            // ======================================
            // DIAS
            // ======================================

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


                // ==================================
                // HOJE
                // ==================================

                if (
                    dateString ===
                    today
                ) {

                    button.classList.add(
                        "today"
                    );

                }


                // ==================================
                // PASSADO
                // ==================================

                if (
                    dateString <
                    today
                ) {

                    button.disabled =
                        true;


                    button.classList.add(
                        "unavailable"
                    );

                }


                // ==================================
                // ALUGADO
                // ==================================

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


                // ==================================
                // RETIRADA
                // ==================================

                if (
                    dateString ===
                    startDate.value
                ) {

                    button.classList.add(
                        "selected",
                        "range-start"
                    );

                }


                // ==================================
                // DEVOLUÇÃO
                // ==================================

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


                // ==================================
                // INTERVALO
                // ==================================

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


                // ==================================
                // CLIQUE
                // ==================================

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


            // ======================================
            // NOVA RETIRADA
            // ======================================

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


                if (selectedStartDisplay) {

                    selectedStartDisplay.textContent =
                        formatDateBR(
                            dateString
                        );

                }


                if (selectedEndDisplay) {

                    selectedEndDisplay.textContent =
                        "Selecione a devolução";

                }


                selectingStart =
                    false;


                renderCalendar();


                calculate();


                return;

            }


            // ======================================
            // DEVOLUÇÃO ANTES
            // ======================================

            if (
                dateString <
                startDate.value
            ) {

                alert(
                    "A devolução não pode ser anterior à retirada."
                );

                return;

            }


            // ======================================
            // PERÍODO INDISPONÍVEL
            // ======================================

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


            // ======================================
            // DEFINIR DEVOLUÇÃO
            // ======================================

            endDate.value =
                dateString;


            if (selectedEndDisplay) {

                selectedEndDisplay.textContent =
                    formatDateBR(
                        dateString
                    );

            }


            selectingStart =
                true;


            renderCalendar();


            calculate();

        }


        // ==========================================
        // MÊS ANTERIOR
        // ==========================================

        if (calendarPrev) {

            calendarPrev.addEventListener(
                "click",
                () => {

                    calendarDate.setMonth(
                        calendarDate.getMonth() - 1
                    );


                    renderCalendar();

                }
            );

        }


        // ==========================================
        // PRÓXIMO MÊS
        // ==========================================

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


        // ==========================================
        // CALCULAR DIAS
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
                Math.ceil(
                    (
                        end - start
                    ) / 86400000
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


            const deliverySelected =
                document.querySelector(
                    'input[name="delivery"]:checked'
                );


            const useDelivery =
                deliverySelected &&
                deliverySelected.value ===
                "delivery";


            const pricePerDay =
                Number(
                    product.pricePerDay || 0
                );


            // ======================================
            // ENTREGA AUTOMÁTICA
            // ======================================

            let delivery =
                0;


            if (useDelivery) {

                deliveryCalculation =
                    calculateDelivery();


                if (
                    deliveryCalculation.valid
                ) {

                    delivery =
                        deliveryCalculation.value;

                }

            }


            // ======================================
            // CAUÇÃO
            // ======================================

            const deposit =
                Number(
                    product.deposit || 0
                );


            // ======================================
            // DIÁRIAS
            // ======================================

            const rent =
                days *
                pricePerDay;


            // ======================================
            // TOTAL
            // ======================================

            const total =
                rent +
                delivery +
                deposit;


            // ======================================
            // UI
            // ======================================

            if (daysElement) {

                daysElement.textContent =
                    days || 0;

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
                        delivery
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

                delivery,

                deposit,

                total

            };

        }


        // ==========================================
        // ENTREGA — ALTERAÇÃO
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

        if (confirmButton) {

            confirmButton.addEventListener(
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
                            "Escolha a retirada e a devolução."
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


                    const selectedDeliveryRadio =
                        document.querySelector(
                            'input[name="delivery"]:checked'
                        );


                    const wantsDelivery =
                        selectedDeliveryRadio?.value ===
                        "delivery";


                    // ==================================
                    // CALCULAR NOVAMENTE
                    // ==================================

                    const values =
                        calculate();


                    // ==================================
                    // VALIDAR ENTREGA
                    // ==================================

                    if (
                        wantsDelivery &&
                        !deliveryCalculation.valid
                    ) {

                        if (
                            deliveryCalculation.reason ===
                            "renter-location"
                        ) {

                            alert(
                                "Não foi possível calcular a entrega porque o seu endereço/localização não está cadastrado."
                            );

                        }

                        else if (
                            deliveryCalculation.reason ===
                            "owner-location"
                        ) {

                            alert(
                                "Não foi possível calcular a entrega porque a localização do proprietário não está disponível."
                            );

                        }

                        else {

                            alert(
                                "Não foi possível calcular o valor da entrega."
                            );

                        }

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
                                `${API}/rentals`,
                                {

                                    method:
                                        "POST",

                                    headers: {

                                        "Content-Type":
                                            "application/json",

                                        Authorization:
                                            `Bearer ${
                                                localStorage.getItem(
                                                    "token"
                                                ) || ""
                                            }`

                                    },

                                    body:
                                        JSON.stringify({

                                            productId:
                                                product._id,

                                            renterId:
                                                currentUser._id ||
                                                currentUser.id,

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
                                rentalData.message ||
                                "Não foi possível criar a solicitação."
                            );

                        }


                        // ==================================
                        // API RETORNA rental
                        // ==================================

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
                        // CRIAR CHAT
                        // ==================================

                        const ownerId =
                            typeof product.ownerId ===
                            "object"

                                ? product.ownerId._id

                                : product.ownerId;


                        if (!ownerId) {

                            console.warn(
                                "Produto não possui ownerId. Chat não será criado."
                            );


                            alert(
                                "Solicitação enviada com sucesso!"
                            );


                            window.location.href =
                                "solicitacoes.html";


                            return;

                        }


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
                                            `Bearer ${
                                                localStorage.getItem(
                                                    "token"
                                                ) || ""
                                            }`

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
                                                currentUser._id ||
                                                currentUser.id,

                                            productTitle:
                                                product.title

                                        })

                                }
                            );


                        const chatData =
                            await chatResponse.json();


                        if (
                            !chatResponse.ok
                        ) {

                            console.warn(
                                "Aluguel criado, mas o chat não foi criado.",
                                chatData
                            );


                            alert(
                                "Solicitação enviada com sucesso!"
                            );


                            window.location.href =
                                "solicitacoes.html";


                            return;

                        }


                        alert(
                            "Solicitação enviada com sucesso!"
                        );


                        window.location.href =
                            `chat.html?chat=${chatData._id}`;

                    }


                    catch (error) {

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

        }


        // ==========================================
        // INICIAR
        // ==========================================

        await loadProduct();

    }
);
