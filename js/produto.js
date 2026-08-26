// ==========================================
// ALUGASE — PRODUTO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

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
        // USUÁRIO
        // ======================================

        const user =
            JSON.parse(
                localStorage.getItem(
                    "alugase_user"
                )
            );


        const token =
            localStorage.getItem(
                "token"
            );


        // ======================================
        // ID DO PRODUTO
        // ======================================

        const productId =
            new URLSearchParams(
                window.location.search
            ).get("id");


        if (!productId) {

            window.location.href =
                "index.html";

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

        const deliveryDistanceBox =
            document.querySelector(
                "#delivery-distance-box"
            );

        const deliveryDistance =
            document.querySelector(
                "#delivery-distance"
            );

        const deliveryDistanceInfo =
            document.querySelector(
                "#delivery-distance-info"
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

        let selectingStart =
            true;

        let unavailableDates =
            [];


        // ======================================
        // DINHEIRO
        // ======================================

        function formatMoney(value) {

            return Number(
                value || 0
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

        function formatDateBR(
            dateString
        ) {

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


        // ======================================
        // DATE → STRING
        // ======================================

        function dateToString(
            date
        ) {

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


        // ======================================
        // NORMALIZAR DATA
        // ======================================

        function normalizeDate(
            date
        ) {

            if (!date) {
                return null;
            }


            const d =
                new Date(date);


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

        function isUnavailable(
            dateString
        ) {

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
                    loadUnavailableDates()
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


                unavailableDates =
                    [];


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


                unavailableDates =
                    [];

            }

        }


        // ======================================
        // ADICIONAR INTERVALO
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

            if (
                !product.ownerId
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


        // ======================================
        // GALERIA
        // ======================================

        function changeImage(
            src
        ) {

            if (!src) {
                return;
            }


            mainImage.innerHTML = `
                <img
                    src="${src}"
                    alt="${product.title || "Produto"}"
                    loading="lazy"
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

        }


        // ======================================
        // RENDERIZAR GALERIA
        // ======================================

        function renderGallery() {

            thumbnails.innerHTML =
                "";


            if (
                Array.isArray(
                    product.images
                ) &&
                product.images.length
            ) {

                changeImage(
                    product.images[0]
                );


                product.images.forEach(
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
                                    image
                                );


                                document
                                    .querySelectorAll(
                                        ".thumbnail"
                                    )
                                    .forEach(
                                        item => {

                                            item.classList.remove(
                                                "active"
                                            );

                                        }
                                    );


                                button.classList.add(
                                    "active"
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


            if (
                owner.profileImage
            ) {

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
                        .split(" ")
                        .map(
                            word =>
                                word.charAt(0)
                        )
                        .slice(
                            0,
                            2
                        )
                        .join("")
                        .toUpperCase();


                ownerAvatar.innerHTML = `
                    <span class="owner-initials">
                        ${initials}
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


            // ESPAÇOS

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


            // HOJE

            const today =
                new Date();


            today.setHours(
                0,
                0,
                0,
                0
            );


            const todayString =
                dateToString(
                    today
                );


            // DIAS

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


                // HOJE

                if (
                    dateString ===
                    todayString
                ) {

                    button.classList.add(
                        "today"
                    );

                }


                // PASSADO

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


                // ALUGADO

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


                // RETIRADA

                if (
                    dateString ===
                    startDate.value
                ) {

                    button.classList.add(
                        "selected",
                        "range-start"
                    );

                }


                // DEVOLUÇÃO

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


                // INTERVALO

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
                (
                    startDate.value &&
                    endDate.value
                )
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
                Math.ceil(
                    (
                        end - start
                    ) / 86400000
                );


            return difference >= 0
                ? difference + 1
                : 0;

        }


        // ======================================
        // CONFIGURAÇÃO DA ENTREGA
        // ======================================

        function getDeliveryConfig() {

            if (!product) {

                return {
                    enabled: false,
                    base: 0,
                    perKm: 0,
                    maxDistance: 0
                };

            }


            const enabled =
                product.delivery === true ||
                product.delivery === "true";


            let base =
                Number(
                    product.deliveryBasePrice
                );


            let perKm =
                Number(
                    product.deliveryPricePerKm
                );


            let maxDistance =
                Number(
                    product.deliveryMaxDistance
                );


            // Compatibilidade com anúncios antigos

            if (
                Number.isNaN(base)
            ) {

                base =
                    Number(
                        product.deliveryPrice
                    ) || 0;

            }


            if (
                Number.isNaN(perKm)
            ) {

                perKm =
                    0;

            }


            if (
                Number.isNaN(maxDistance)
            ) {

                maxDistance =
                    0;

            }


            return {
                enabled,
                base,
                perKm,
                maxDistance
            };

        }


        // ======================================
        // CALCULAR ENTREGA
        // ======================================

        function calculateDelivery() {

            const config =
                getDeliveryConfig();


            if (
                !config.enabled
            ) {

                return {
                    value: 0,
                    valid: false,
                    reason: "disabled"
                };

            }


            const distance =
                Number(
                    deliveryDistance?.value
                );


            if (
                !deliveryDistance ||
                !deliveryDistance.value
            ) {

                return {
                    value: 0,
                    valid: false,
                    reason: "missing"
                };

            }


            if (
                Number.isNaN(distance) ||
                distance < 0
            ) {

                return {
                    value: 0,
                    valid: false,
                    reason: "invalid"
                };

            }


            if (
                config.maxDistance > 0 &&
                distance >
                    config.maxDistance
            ) {

                return {
                    value: 0,
                    valid: false,
                    reason: "distance"
                };

            }


            const value =
                config.base +
                (
                    distance *
                    config.perKm
                );


            return {
                value,
                valid: true,
                reason: "ok"
            };

        }


        // ======================================
        // ATUALIZAR ENTREGA VISUAL
        // ======================================

        function updateDeliveryUI() {

            const config =
                getDeliveryConfig();


            if (
                !config.enabled
            ) {

                if (deliveryRadio) {

                    deliveryRadio.disabled =
                        true;

                }


                if (deliveryDistanceBox) {

                    deliveryDistanceBox.style.display =
                        "none";

                }


                if (deliveryLabel) {

                    deliveryLabel.textContent =
                        "Somente retirada";

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
                selected &&
                selected.value ===
                    "delivery";


            if (
                deliveryDistanceBox
            ) {

                deliveryDistanceBox.style.display =
                    deliverySelected
                        ? "block"
                        : "none";

            }


            if (
                !deliverySelected
            ) {

                deliveryLabel.textContent =
                    "Calcular";

                return;

            }


            const result =
                calculateDelivery();


            if (
                result.reason ===
                "missing"
            ) {

                deliveryLabel.textContent =
                    "Informe a distância";

                return;

            }


            if (
                result.reason ===
                "distance"
            ) {

                deliveryLabel.textContent =
                    "Fora da área";

                return;

            }


            if (
                result.valid
            ) {

                deliveryLabel.textContent =
                    `+ R$ ${formatMoney(
                        result.value
                    )}`;

            } else {

                deliveryLabel.textContent =
                    "Valor inválido";

            }

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
                selectedDelivery &&
                selectedDelivery.value ===
                    "delivery";


            let deliveryValue =
                0;


            if (
                deliverySelected
            ) {

                const result =
                    calculateDelivery();


                if (
                    result.valid
                ) {

                    deliveryValue =
                        result.value;

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


            dailyTotal.textContent =
                `R$ ${formatMoney(
                    daily
                )}`;


            deliveryTotal.textContent =
                `R$ ${formatMoney(
                    deliveryValue
                )}`;


            depositTotal.textContent =
                `R$ ${formatMoney(
                    deposit
                )}`;


            rentalTotal.textContent =
                `R$ ${formatMoney(
                    total
                )}`;


            updateDeliveryUI();

        }


        // ======================================
        // PREENCHER TELA
        // ======================================

        function fillScreen() {

            document.title =
                `${product.title} | ALUGASE`;


            categoryLabel.textContent =
                (
                    product.category ||
                    "Produto"
                ).toUpperCase();


            categoryLink.textContent =
                product.category ||
                "Categoria";


            categoryLink.href =
                `explorar.html?categoria=${encodeURIComponent(
                    product.category || ""
                )}`;


            breadcrumbTitle.textContent =
                product.title;


            title.textContent =
                product.title;


            renderGallery();


            locationText.textContent =
                `📍 ${
                    product.city ||
                    "Não informado"
                }`;


            description.textContent =
                product.description ||
                "Este produto não possui descrição.";


            productRating.textContent =
                product.rating ||
                "5.0";


            productReviews.textContent =
                product.reviews ||
                "0";


            price.textContent =
                `R$ ${formatMoney(
                    product.pricePerDay
                )}`;


            // ==================================
            // ENTREGA
            // ==================================

            const config =
                getDeliveryConfig();


            if (
                !config.enabled
            ) {

                if (deliveryRadio) {

                    deliveryRadio.disabled =
                        true;

                }


                deliveryLabel.textContent =
                    "Somente retirada";

            } else {

                if (deliveryRadio) {

                    deliveryRadio.disabled =
                        false;

                }


                if (
                    config.maxDistance > 0
                ) {

                    deliveryDistanceInfo.textContent =
                        `Distância máxima: ${formatMoney(
                            config.maxDistance
                        )} km.`;

                } else {

                    deliveryDistanceInfo.textContent =
                        "Sem limite de distância definido.";

                }

            }


            depositTotal.textContent =
                `R$ ${formatMoney(
                    product.deposit
                )}`;


            renderOwner();


            initializeCalendar();


            updateTotals();

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

                    calendarDate.setMonth(
                        calendarDate.getMonth() - 1
                    );


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
        // ENTREGA — RADIO
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
        // DISTÂNCIA
        // ======================================

        if (deliveryDistance) {

            deliveryDistance.addEventListener(
                "input",
                () => {

                    updateDeliveryUI();

                    updateTotals();

                }
            );

        }


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

                    if (user) {

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

                    if (!user) {

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

                    if (!user) {

                        window.location.href =
                            "login.html";

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
                            "A data de devolução não pode ser anterior à retirada."
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


                    // ==============================
                    // ENTREGA
                    // ==============================

                    const selectedDelivery =
                        document.querySelector(
                            'input[name="delivery"]:checked'
                        );


                    const delivery =
                        selectedDelivery?.value ===
                        "delivery";


                    let deliveryValue =
                        0;


                    if (delivery) {

                        const config =
                            getDeliveryConfig();


                        if (
                            !config.enabled
                        ) {

                            alert(
                                "Este produto não possui entrega disponível."
                            );

                            return;

                        }


                        const result =
                            calculateDelivery();


                        if (
                            result.reason ===
                            "missing"
                        ) {

                            alert(
                                "Informe a distância da entrega."
                            );

                            if (
                                deliveryDistance
                            ) {

                                deliveryDistance.focus();

                            }

                            return;

                        }


                        if (
                            result.reason ===
                            "invalid"
                        ) {

                            alert(
                                "Informe uma distância válida."
                            );

                            return;

                        }


                        if (
                            result.reason ===
                            "distance"
                        ) {

                            alert(
                                `A distância máxima para entrega é ${formatMoney(
                                    config.maxDistance
                                )} km.`
                            );

                            return;

                        }


                        deliveryValue =
                            result.value;

                    }


                    // ==================================
                    // PARÂMETROS DA RESERVA
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


                    if (delivery) {

                        params.set(
                            "deliveryDistance",
                            deliveryDistance.value
                        );


                        params.set(
                            "deliveryPrice",
                            String(
                                deliveryValue
                            )
                        );

                    }


                    window.location.href =
                        `reserva.html?${params.toString()}`;

                }
            );

        }


        // ======================================
        // INICIAR
        // ======================================

        await loadProduct();

    }
);
