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

        const user =
            JSON.parse(
                localStorage.getItem(
                    "alugase_user"
                )
            );


        if (!user) {

            alert(
                "Faça login para continuar."
            );

            window.location.href =
                "login.html";

            return;

        }


        // ==========================================
        // PARÂMETROS
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

        let selectingStart = true;

        let unavailableDates = [];


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
        // INDISPONÍVEL
        // ==========================================

        function isUnavailable(
            dateString
        ) {

            return unavailableDates.includes(
                dateString
            );

        }


        // ==========================================
        // INTERVALO INDISPONÍVEL
        // ==========================================

        function rangeContainsUnavailable(
            start,
            end
        ) {

            if (!start || !end) {

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
        // CARREGAR DATAS ALUGADAS
        // ==========================================

        async function loadUnavailableDates() {

            try {

                const response =
                    await fetch(
                        `${API}/rentals/product/${productId}/unavailable-dates`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Não foi possível carregar as datas alugadas."
                    );

                }


                const data =
                    await response.json();


                unavailableDates =
                    Array.isArray(
                        data.unavailableDates
                    )
                        ? data.unavailableDates
                        : [];


                console.log(
                    "Datas indisponíveis:",
                    unavailableDates
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


                fillProduct();


                // IMPORTANTE:
                // primeiro buscamos os aluguéis
                // e só depois desenhamos o calendário.

                await loadUnavailableDates();


                initializeDates();


                calculate();


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

            if (
                productImage &&
                Array.isArray(
                    product.images
                ) &&
                product.images.length > 0
            ) {

                productImage.innerHTML = `

                    <img
                        src="${product.images[0]}"
                        alt="${product.title || "Produto"}"
                    >

                `;

            } else if (
                productImage &&
                product.image
            ) {

                productImage.innerHTML = `

                    <img
                        src="${product.image}"
                        alt="${product.title || "Produto"}"
                    >

                `;

            } else if (productImage) {

                productImage.textContent =
                    "📦";

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


            if (product.delivery) {

                if (deliveryText) {

                    deliveryText.textContent =
                        `+ R$ ${formatMoney(
                            product.deliveryPrice
                        )}`;

                }

            } else {

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
                    : start;


            // Se hoje estiver indisponível,
            // encontrar o próximo dia disponível.

            if (
                isUnavailable(start)
            ) {

                const nextAvailable =
                    findNextAvailableDate(
                        start
                    );


                if (nextAvailable) {

                    start =
                        nextAvailable;

                    end =
                        nextAvailable;

                }

            }


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

            } else if (deliveryPickup) {

                deliveryPickup.checked =
                    true;

            }


            // ======================================
            // DATAS
            // ======================================

            if (selectedStartDisplay) {

                selectedStartDisplay.textContent =
                    formatDateBR(
                        start
                    );

            }


            if (selectedEndDisplay) {

                selectedEndDisplay.textContent =
                    formatDateBR(
                        end
                    );

            }


            selectingStart =
                true;


            calendarDate =
                new Date(
                    `${start}T00:00:00`
                );


            renderCalendar();

        }


        // ==========================================
        // PRÓXIMA DATA DISPONÍVEL
        // ==========================================

        function findNextAvailableDate(
            initialDate
        ) {

            const date =
                new Date(
                    `${initialDate}T00:00:00`
                );


            for (
                let i = 0;
                i < 365;
                i++
            ) {

                const string =
                    dateToString(
                        date
                    );


                if (
                    !isUnavailable(
                        string
                    )
                ) {

                    return string;

                }


                date.setDate(
                    date.getDate() + 1
                );

            }


            return null;

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

                const isPast =
                    dateString <
                    today;


                if (isPast) {

                    button.disabled =
                        true;

                    button.classList.add(
                        "unavailable"
                    );

                }


                // ==================================
                // ALUGADO
                // ==================================

                const rented =
                    isUnavailable(
                        dateString
                    );


                if (rented) {

                    button.disabled =
                        true;

                    button.classList.add(
                        "unavailable",
                        "rented"
                    );

                    button.title =
                        "Este dia já está alugado.";

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

            // ======================================
            // NÃO PERMITIR DATA ALUGADA
            // ======================================

            if (
                isUnavailable(
                    dateString
                )
            ) {

                alert(
                    "Este dia já está alugado. Escolha outra data."
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
            // INTERVALO BLOQUEADO
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

                    const currentMonth =
                        new Date(
                            new Date().getFullYear(),
                            new Date().getMonth(),
                            1
                        );


                    const previousMonth =
                        new Date(
                            calendarDate.getFullYear(),
                            calendarDate.getMonth() - 1,
                            1
                        );


                    // Não voltar antes do mês atual.

                    if (
                        previousMonth <
                        currentMonth
                    ) {

                        return;

                    }


                    calendarDate =
                        previousMonth;


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


            const delivery =
                useDelivery &&
                product.delivery
                    ? Number(
                        product.deliveryPrice || 0
                    )
                    : 0;


            const deposit =
                Number(
                    product.deposit || 0
                );


            const rent =
                days *
                pricePerDay;


            const total =
                rent +
                delivery +
                deposit;


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


            return {

                days,
                rent,
                delivery,
                deposit,
                total

            };

        }


        // ==========================================
        // ENTREGA
        // ==========================================

        document
            .querySelectorAll(
                'input[name="delivery"]'
            )
            .forEach(
                radio => {

                    radio.addEventListener(
                        "change",
                        calculate
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


                    const values =
                        calculate();


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
                                            "application/json"

                                    },

                                    body:
                                        JSON.stringify({

                                            productId:
                                                product._id,

                                            renterId:
                                                user._id ||
                                                user.id,

                                            startDate:
                                                startDate.value,

                                            endDate:
                                                endDate.value,

                                            days:
                                                values.days,

                                            delivery:
                                                values.delivery > 0,

                                            deliveryPrice:
                                                values.delivery,

                                            total:
                                                values.total,

                                            notes:
                                                notes
                                                    ? notes.value.trim()
                                                    : ""

                                        })

                                }
                            );


                        const rentalData =
                            await rentalResponse.json();


                        if (!rentalResponse.ok) {

                            throw new Error(
                                rentalData.error ||
                                "Não foi possível criar a solicitação."
                            );

                        }


                        // ==================================
                        // IMPORTANTE
                        // ==================================
                        //
                        // A API retorna:
                        // { message, rental, notification }
                        //
                        // Portanto precisamos pegar
                        // rentalData.rental.
                        //

                        const rental =
                            rentalData.rental;


                        if (!rental) {

                            throw new Error(
                                "O aluguel foi criado, mas a resposta da API está inválida."
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


                        const chatResponse =
                            await fetch(
                                `${API}/chats`,
                                {

                                    method:
                                        "POST",

                                    headers: {

                                        "Content-Type":
                                            "application/json"

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
                                                user._id ||
                                                user.id,

                                            productTitle:
                                                product.title

                                        })

                                }
                            );


                        const chatData =
                            await chatResponse.json();


                        if (!chatResponse.ok) {

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

        }


        // ==========================================
        // INICIAR
        // ==========================================

        await loadProduct();

    }
);
