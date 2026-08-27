// ==========================================
// ALUGASE — PRODUTO
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    // ======================================
    // API
    // ======================================

    const API = "https://alugase-api.onrender.com/api";

    const PRODUCTS_API = `${API}/products`;
    const USERS_API = `${API}/users`;
    const RENTALS_API = `${API}/rentals`;


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
        document.querySelector(".product-category");

    const categoryLink =
        document.querySelector(".product-category-link");

    const breadcrumbTitle =
        document.querySelector("#breadcrumb-title");

    const title =
        document.querySelector("#product-title");

    const mainImage =
        document.querySelector("#main-image");

    const thumbnails =
        document.querySelector("#product-thumbnails");

    const locationText =
        document.querySelector("#product-location");

    const description =
        document.querySelector("#product-description");

    const productRating =
        document.querySelector("#product-rating");

    const productReviews =
        document.querySelector("#product-reviews");

    const price =
        document.querySelector(".pricing strong");


    // ======================================
    // ENTREGA
    // ======================================

    const deliveryLabel =
        document.querySelector("#delivery-label");

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
        document.querySelector("#owner-avatar");

    const ownerName =
        document.querySelector("#owner-name");

    const ownerVerification =
        document.querySelector(
            "#owner-verification"
        );

    const ownerRating =
        document.querySelector("#owner-rating");

    const ownerReviews =
        document.querySelector("#owner-reviews");


    // ======================================
    // CALENDÁRIO
    // ======================================

    const startDate =
        document.querySelector("#start-date");

    const endDate =
        document.querySelector("#end-date");

    const calendarDays =
        document.querySelector("#calendar-days");

    const calendarMonth =
        document.querySelector("#calendar-month");

    const calendarPrev =
        document.querySelector("#calendar-prev");

    const calendarNext =
        document.querySelector("#calendar-next");

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
        document.querySelector("#daily-total");

    const deliveryTotal =
        document.querySelector("#delivery-total");

    const depositTotal =
        document.querySelector("#deposit-total");

    const rentalTotal =
        document.querySelector("#rental-total");

    const rentalButton =
        document.querySelector("#rental-button");


    // ======================================
    // VARIÁVEIS
    // ======================================

    let product = null;

    let owner = null;

    let calendarDate =
        new Date();

    let selectingStart = true;

    let unavailableDates = [];


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
    // DATE → STRING
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

            d = new Date(
                `${date}T00:00:00`
            );

        } else {

            d = new Date(date);

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
                    `${PRODUCTS_API}/${encodeURIComponent(productId)}`
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
                    `${RENTALS_API}/product/${encodeURIComponent(productId)}/unavailable`
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
            current <= endDateObject
        ) {

            const currentString =
                dateToString(current);


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
                    ? product.ownerId?._id
                    : product.ownerId;


            if (!ownerId) {
                return;
            }


            const response =
                await fetch(
                    `${USERS_API}/${encodeURIComponent(ownerId)}`
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
        src,
        activeButton = null
    ) {

        if (
            !src ||
            !mainImage
        ) {

            return;
        }


        mainImage.innerHTML = "";


        const image =
            document.createElement("img");

        image.src = src;

        image.alt =
            product?.title ||
            "Produto";

        image.loading = "eager";

        image.onerror = () => {

            mainImage.innerHTML = "";

            const placeholder =
                document.createElement("div");

            placeholder.className =
                "image-placeholder";

            placeholder.textContent =
                "📦";

            mainImage.appendChild(
                placeholder
            );
        };


        mainImage.appendChild(image);


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


        thumbnails.innerHTML = "";


        const images =
            Array.isArray(product?.images)
                ? product.images.filter(
                    image =>
                        typeof image === "string" &&
                        image.trim() !== ""
                )
                : [];


        if (images.length > 0) {

            changeImage(
                images[0]
            );


            images.forEach(
                (image, index) => {

                    const button =
                        document.createElement(
                            "button"
                        );

                    button.type = "button";

                    button.className =
                        "thumbnail";

                    if (index === 0) {

                        button.classList.add(
                            "active"
                        );
                    }


                    const thumbnailImage =
                        document.createElement(
                            "img"
                        );

                    thumbnailImage.src =
                        image;

                    thumbnailImage.alt =
                        `Imagem ${index + 1}`;

                    thumbnailImage.loading =
                        "lazy";


                    button.appendChild(
                        thumbnailImage
                    );


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

            mainImage.innerHTML = "";

            const placeholder =
                document.createElement(
                    "div"
                );

            placeholder.className =
                "image-placeholder";

            placeholder.textContent =
                "📦";

            mainImage.appendChild(
                placeholder
            );


            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "thumbnail emoji active";

            button.textContent =
                "📦";

            button.disabled = true;


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

            ownerAvatar.textContent =
                "👤";

            ownerName.textContent =
                product?.ownerName ||
                "Usuário";

            ownerVerification.textContent =
                "Usuário";

            ownerVerification.className = "";

            ownerRating.textContent =
                product?.rating ||
                "5.0";

            ownerReviews.textContent =
                product?.reviews ||
                "0";

            return;
        }


        ownerName.textContent =
            owner.name ||
            product?.ownerName ||
            "Usuário";


        ownerAvatar.innerHTML = "";


        if (owner.profileImage) {

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                owner.profileImage;

            image.alt =
                owner.name ||
                "Proprietário";

            image.className =
                "owner-profile-image";

            image.onerror = () => {

                renderOwnerInitials();

            };


            ownerAvatar.appendChild(
                image
            );

        } else {

            renderOwnerInitials();

        }


        function renderOwnerInitials() {

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


            const span =
                document.createElement(
                    "span"
                );

            span.className =
                "owner-initials";

            span.textContent =
                initials || "U";


            ownerAvatar.innerHTML = "";

            ownerAvatar.appendChild(
                span
            );
        }


        if (owner.identityVerified) {

            ownerVerification.textContent =
                "✓ Identidade verificada";

            ownerVerification.className =
                "owner-verified";

        } else {

            ownerVerification.textContent =
                "Usuário";

            ownerVerification.className = "";

        }


        ownerRating.textContent =
            owner.rating ??
            product?.rating ??
            "5.0";


        ownerReviews.textContent =
            owner.reviews ??
            product?.reviews ??
            "0";
    }


    // ======================================
    // CALENDÁRIO
    // ======================================

    function renderCalendar() {

        if (!calendarDays) {
            return;
        }


        calendarDays.innerHTML = "";


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


        // ==================================
        // ESPAÇOS ANTES DO PRIMEIRO DIA
        // ==================================

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


        // ==================================
        // HOJE
        // ==================================

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


        // ==================================
        // DIAS
        // ==================================

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


            button.type = "button";

            button.className =
                "calendar-day";

            button.textContent =
                day;


            // ==================================
            // HOJE
            // ==================================

            if (
                dateString === todayString
            ) {

                button.classList.add(
                    "today"
                );
            }


            // ==================================
            // PASSADO
            // ==================================

            if (
                dateString < todayString
            ) {

                button.disabled = true;

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

                button.disabled = true;

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
            // EVENTO
            // ==================================

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


        updateCalendarNavigation();
    }


    // ======================================
    // NAVEGAÇÃO DO CALENDÁRIO
    // ======================================

    function updateCalendarNavigation() {

        if (!calendarPrev) {
            return;
        }


        const now =
            new Date();

        now.setDate(1);
        now.setHours(0, 0, 0, 0);


        const displayedMonth =
            new Date(
                calendarDate.getFullYear(),
                calendarDate.getMonth(),
                1
            );


        calendarPrev.disabled =
            displayedMonth <= now;

    }


    // ======================================
    // SELECIONAR DATA
    // ======================================

    function selectCalendarDate(
        dateString
    ) {

        // ==================================
        // DATA INDISPONÍVEL
        // ==================================

        if (
            isUnavailable(dateString)
        ) {

            alert(
                "Essa data já está alugada."
            );

            return;
        }


        // ==================================
        // NOVA RETIRADA
        // ==================================

        if (
            selectingStart ||
            !startDate.value ||
            endDate.value
        ) {

            startDate.value =
                dateString;

            endDate.value = "";

            selectingStart = false;


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


        // ==================================
        // DEVOLUÇÃO ANTERIOR
        // ==================================

        if (
            dateString <
            startDate.value
        ) {

            alert(
                "A devolução não pode ser anterior à retirada."
            );

            return;
        }


        // ==================================
        // MESMA DATA
        // ==================================

        if (
            dateString ===
            startDate.value
        ) {

            alert(
                "A devolução deve ser posterior à retirada."
            );

            return;
        }


        // ==================================
        // VERIFICAR PERÍODO
        // ==================================

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


        // ==================================
        // SELECIONAR DEVOLUÇÃO
        // ==================================

        endDate.value =
            dateString;


        selectedEndDisplay.textContent =
            formatDateBR(
                dateString
            );


        selectingStart = true;


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

        if (
            !start ||
            !end
        ) {

            return false;
        }


        const startObject =
            new Date(
                `${start}T00:00:00`
            );

        const endObject =
            new Date(
                `${end}T00:00:00`
            );


        if (
            Number.isNaN(
                startObject.getTime()
            ) ||
            Number.isNaN(
                endObject.getTime()
            )
        ) {

            return true;
        }


        const current =
            new Date(
                startObject
            );


        while (
            current <= endObject
        ) {

            const currentString =
                dateToString(current);


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


        /*
         * Mantém o comportamento atual:
         * retirada + devolução contam como
         * período de aluguel inclusivo.
         */

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


        // ==================================
        // COMPATIBILIDADE
        // ==================================

        if (
            !Number.isFinite(base)
        ) {

            base =
                Number(
                    product.deliveryPrice
                ) || 0;
        }


        if (
            !Number.isFinite(perKm)
        ) {

            perKm = 0;
        }


        if (
            !Number.isFinite(maxDistance)
        ) {

            maxDistance = 0;
        }


        return {
            enabled,
            base: Math.max(0, base),
            perKm: Math.max(0, perKm),
            maxDistance: Math.max(
                0,
                maxDistance
            )
        };
    }


    // ======================================
    // CALCULAR ENTREGA
    // ======================================

    function calculateDelivery() {

        const config =
            getDeliveryConfig();


        if (!config.enabled) {

            return {
                value: 0,
                valid: false,
                reason: "disabled"
            };
        }


        const rawDistance =
            deliveryDistance?.value?.trim();


        if (!rawDistance) {

            return {
                value: 0,
                valid: false,
                reason: "missing"
            };
        }


        const normalizedDistance =
            rawDistance.replace(
                ",",
                "."
            );


        const distance =
            Number(
                normalizedDistance
            );


        if (
            !Number.isFinite(distance) ||
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
    // ATUALIZAR ENTREGA
    // ======================================

    function updateDeliveryUI() {

        const config =
            getDeliveryConfig();


        // ==================================
        // SEM ENTREGA
        // ==================================

        if (!config.enabled) {

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


        // ==================================
        // COM ENTREGA
        // ==================================

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


        if (deliveryDistanceBox) {

            deliveryDistanceBox.style.display =
                deliverySelected
                    ? "block"
                    : "none";
        }


        if (!deliverySelected) {

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
            "invalid"
        ) {

            deliveryLabel.textContent =
                "Distância inválida";

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


        if (result.valid) {

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
            selectedDelivery?.value ===
            "delivery";


        let deliveryValue = 0;


        if (deliverySelected) {

            const result =
                calculateDelivery();


            if (result.valid) {

                deliveryValue =
                    result.value;
            }
        }


        const pricePerDay =
            Number(
                product.pricePerDay || 0
            );


        const daily =
            days *
            (
                Number.isFinite(
                    pricePerDay
                )
                    ? pricePerDay
                    : 0
            );


        const depositValue =
            Number(
                product.deposit || 0
            );


        const deposit =
            Number.isFinite(
                depositValue
            )
                ? depositValue
                : 0;


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

        if (!product) {
            return;
        }


        document.title =
            `${product.title || "Produto"} | ALUGASE`;


        // ==================================
        // CATEGORIA
        // ==================================

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


        // ==================================
        // BREADCRUMB
        // ==================================

        if (breadcrumbTitle) {

            breadcrumbTitle.textContent =
                product.title ||
                "Produto";
        }


        // ==================================
        // TÍTULO
        // ==================================

        if (title) {

            title.textContent =
                product.title ||
                "Produto";
        }


        // ==================================
        // GALERIA
        // ==================================

        renderGallery();


        // ==================================
        // LOCALIZAÇÃO
        // ==================================

        if (locationText) {

            const city =
                product.city ||
                product.location ||
                "Não informado";


            locationText.textContent =
                `📍 ${city}`;
        }


        // ==================================
        // DESCRIÇÃO
        // ==================================

        if (description) {

            description.textContent =
                product.description ||
                "Este produto não possui descrição.";
        }


        // ==================================
        // AVALIAÇÃO
        // ==================================

        if (productRating) {

            productRating.textContent =
                product.rating ??
                "5.0";
        }


        if (productReviews) {

            productReviews.textContent =
                product.reviews ??
                "0";
        }


        // ==================================
        // PREÇO
        // ==================================

        if (price) {

            price.textContent =
                `R$ ${formatMoney(
                    product.pricePerDay
                )}`;
        }


        // ==================================
        // ENTREGA
        // ==================================

        const config =
            getDeliveryConfig();


        if (!config.enabled) {

            if (deliveryRadio) {

                deliveryRadio.disabled =
                    true;
            }


            if (deliveryLabel) {

                deliveryLabel.textContent =
                    "Somente retirada";
            }

        } else {

            if (deliveryRadio) {

                deliveryRadio.disabled =
                    false;
            }


            if (deliveryDistanceInfo) {

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
        }


        // ==================================
        // CAUÇÃO
        // ==================================

        if (depositTotal) {

            depositTotal.textContent =
                `R$ ${formatMoney(
                    product.deposit
                )}`;
        }


        // ==================================
        // PROPRIETÁRIO
        // ==================================

        renderOwner();


        // ==================================
        // CALENDÁRIO
        // ==================================

        initializeCalendar();


        // ==================================
        // TOTAIS
        // ==================================

        updateTotals();
    }


    // ======================================
    // INICIALIZAR CALENDÁRIO
    // ======================================

    function initializeCalendar() {

        if (startDate) {
            startDate.value = "";
        }


        if (endDate) {
            endDate.value = "";
        }


        if (selectedStartDisplay) {

            selectedStartDisplay.textContent =
                "Selecione uma data";
        }


        if (selectedEndDisplay) {

            selectedEndDisplay.textContent =
                "Selecione a devolução";
        }


        selectingStart = true;


        calendarDate =
            new Date();


        calendarDate.setDate(1);


        renderCalendar();
    }


    // ======================================
    // MÊS ANTERIOR
    // ======================================

    if (calendarPrev) {

        calendarPrev.addEventListener(
            "click",
            () => {

                if (
                    calendarPrev.disabled
                ) {

                    return;
                }


                const previous =
                    new Date(
                        calendarDate
                    );


                previous.setMonth(
                    previous.getMonth() - 1
                );


                const currentMonth =
                    new Date();


                currentMonth.setDate(1);

                currentMonth.setHours(
                    0,
                    0,
                    0,
                    0
                );


                if (
                    previous <
                    currentMonth
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

                // ==================================
                // LOGIN
                // ==================================

                const currentToken =
                    localStorage.getItem(
                        "token"
                    );


                if (!currentToken) {

                    window.location.href =
                        "login.html";

                    return;
                }


                // ==================================
                // PRODUTO
                // ==================================

                if (!product?._id) {

                    alert(
                        "Não foi possível identificar o produto."
                    );

                    return;
                }


                // ==================================
                // DATAS
                // ==================================

                if (
                    !startDate.value ||
                    !endDate.value
                ) {

                    alert(
                        "Escolha a data de retirada e a data de devolução."
                    );

                    return;
                }


                // ==================================
                // ORDEM
                // ==================================

                if (
                    endDate.value <=
                    startDate.value
                ) {

                    alert(
                        "A data de devolução deve ser posterior à retirada."
                    );

                    return;
                }


                // ==================================
                // DISPONIBILIDADE
                // ==================================

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


                let deliveryValue = 0;


                if (delivery) {

                    const config =
                        getDeliveryConfig();


                    if (!config.enabled) {

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

                        deliveryDistance?.focus();

                        return;
                    }


                    if (
                        result.reason ===
                        "invalid"
                    ) {

                        alert(
                            "Informe uma distância válida."
                        );

                        deliveryDistance?.focus();

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

                        deliveryDistance?.focus();

                        return;
                    }


                    deliveryValue =
                        result.value;
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
