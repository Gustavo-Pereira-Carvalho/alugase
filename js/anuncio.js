// ==========================================
// ALUGASE — NOVO ANÚNCIO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const API =
            "https://alugase-api.onrender.com/api";

        const PRODUCTS_API =
            `${API}/products`;

        const USERS_API =
            `${API}/users`;


        // ======================================
        // USUÁRIO
        // ======================================

        const token =
            localStorage.getItem("token");

        let user =
            JSON.parse(
                localStorage.getItem(
                    "alugase_user"
                )
            );


        if (!token || !user) {

            alert(
                "Faça login para anunciar."
            );

            location.href =
                "login.html";

            return;

        }


        // ======================================
        // ELEMENTOS
        // ======================================

        const form =
            document.querySelector(
                "#new-product-form"
            );


        const title =
            document.querySelector(
                "#title"
            );

        const category =
            document.querySelector(
                "#category"
            );

        const icon =
            document.querySelector(
                "#icon"
            );

        const description =
            document.querySelector(
                "#description"
            );

        const city =
            document.querySelector(
                "#city"
            );


        const price =
            document.querySelector(
                "#price"
            );

        const deposit =
            document.querySelector(
                "#deposit"
            );


        const pickup =
            document.querySelector(
                "#pickup"
            );

        const delivery =
            document.querySelector(
                "#delivery"
            );


        const deliveryBasePrice =
            document.querySelector(
                "#deliveryBasePrice"
            );

        const deliveryPricePerKm =
            document.querySelector(
                "#deliveryPricePerKm"
            );

        const deliveryMaxDistance =
            document.querySelector(
                "#deliveryMaxDistance"
            );


        const deliverySettings =
            document.querySelector(
                "#delivery-settings"
            );


        const deliveryExample =
            document.querySelector(
                "#delivery-example"
            );


        const images =
            document.querySelector(
                "#images"
            );

        const previewGrid =
            document.querySelector(
                "#preview-grid"
            );


        const vehicleSection =
            document.querySelector(
                "#vehicle-section"
            );


        const brand =
            document.querySelector(
                "#brand"
            );

        const model =
            document.querySelector(
                "#model"
            );

        const year =
            document.querySelector(
                "#year"
            );

        const color =
            document.querySelector(
                "#color"
            );

        const plate =
            document.querySelector(
                "#plate"
            );

        const renavam =
            document.querySelector(
                "#renavam"
            );

        const mileage =
            document.querySelector(
                "#mileage"
            );

        const crlv =
            document.querySelector(
                "#crlv"
            );


        const sumPrice =
            document.querySelector(
                "#sum-price"
            );

        const sumDeposit =
            document.querySelector(
                "#sum-deposit"
            );

        const sumDelivery =
            document.querySelector(
                "#sum-delivery"
            );


        // ======================================
        // BUSCAR USUÁRIO ATUALIZADO
        // ======================================

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


            if (
                response.ok
            ) {

                user =
                    await response.json();


                localStorage.setItem(
                    "alugase_user",
                    JSON.stringify(user)
                );

            }

        } catch (error) {

            console.warn(
                "Não foi possível atualizar os dados do usuário:",
                error
            );

        }


        // ======================================
        // ENDEREÇO
        // ======================================

        const address =
            user.address || {};


        const accountCity =
            address.city ||
            user.city ||
            "";


        if (accountCity) {

            city.value =
                accountCity;

            city.readOnly =
                true;

        } else {

            city.readOnly =
                false;

        }


        // ======================================
        // CIDADE SEMPRE DO ENDEREÇO DA CONTA
        // ======================================

        city.addEventListener(
            "input",
            () => {

                if (
                    accountCity
                ) {

                    city.value =
                        accountCity;

                }

            }
        );


        // ======================================
        // CATEGORIA
        // ======================================

        category.onchange =
            () => {

                const isVehicle =
                    category.value ===
                    "Veículos";


                vehicleSection.classList.toggle(
                    "show",
                    isVehicle
                );


                if (isVehicle) {

                    icon.value =
                        "🚗";

                }

            };


        // ======================================
        // ENTREGA VISUAL
        // ======================================

        function updateDeliveryVisibility() {

            if (
                delivery.checked
            ) {

                deliverySettings.style.display =
                    "block";

            } else {

                deliverySettings.style.display =
                    "none";

            }

        }


        // ======================================
        // EXEMPLO DO FRETE
        // ======================================

        function updateDeliveryExample() {

            const base =
                Number(
                    deliveryBasePrice.value
                ) || 0;


            const perKm =
                Number(
                    deliveryPricePerKm.value
                ) || 0;


            const maxDistance =
                Number(
                    deliveryMaxDistance.value
                ) || 0;


            const exampleDistance =
                maxDistance > 0 &&
                maxDistance < 10
                    ? maxDistance
                    : 10;


            const total =
                base +
                (
                    exampleDistance *
                    perKm
                );


            deliveryExample.textContent =
                `Exemplo: R$ ${base.toFixed(2)} + (${exampleDistance} km × R$ ${perKm.toFixed(2)}) = R$ ${total.toFixed(2)}`;

        }


        // ======================================
        // RESUMO
        // ======================================

        function updateSummary() {

            const priceValue =
                Number(
                    price.value
                ) || 0;


            const depositValue =
                Number(
                    deposit.value
                ) || 0;


            sumPrice.textContent =
                `R$ ${priceValue.toFixed(2)}`;


            sumDeposit.textContent =
                `R$ ${depositValue.toFixed(2)}`;


            if (
                delivery.checked
            ) {

                const base =
                    Number(
                        deliveryBasePrice.value
                    ) || 0;


                const perKm =
                    Number(
                        deliveryPricePerKm.value
                    ) || 0;


                sumDelivery.textContent =
                    `A partir de R$ ${base.toFixed(2)} + km`;

            } else {

                sumDelivery.textContent =
                    "Não disponível";

            }


            updateDeliveryExample();

        }


        [
            price,
            deposit,
            deliveryBasePrice,
            deliveryPricePerKm,
            deliveryMaxDistance
        ].forEach(
            input => {

                input.addEventListener(
                    "input",
                    updateSummary
                );

            }
        );


        delivery.addEventListener(
            "change",
            () => {

                updateDeliveryVisibility();

                updateSummary();

            }
        );


        updateDeliveryVisibility();

        updateSummary();


        // ======================================
        // PREVIEW DAS IMAGENS
        // ======================================

        document
            .querySelector(
                "#select-images"
            )
            .onclick =
                event => {

                    event.stopPropagation();

                    images.click();

                };


        document
            .querySelector(
                "#upload-area"
            )
            .onclick =
                () => {

                    images.click();

                };


        images.onchange =
            () => {

                previewGrid.innerHTML =
                    "";


                [
                    ...images.files
                ].forEach(
                    file => {

                        const reader =
                            new FileReader();


                        reader.onload =
                            e => {

                                previewGrid.innerHTML += `

                                    <div class="preview-item">

                                        <img
                                            src="${e.target.result}"
                                        >

                                    </div>

                                `;

                            };


                        reader.readAsDataURL(
                            file
                        );

                    }
                );

            };


        // ======================================
        // CRLV
        // ======================================

        document
            .querySelector(
                "#select-crlv"
            )
            .onclick =
                () => {

                    crlv.click();

                };


        const crlvName =
            document.querySelector(
                "#crlv-name"
            );


        crlvName.textContent =
            "Nenhum arquivo";


        crlv.onchange =
            () => {

                crlvName.textContent =
                    crlv.files.length
                        ? crlv.files[0].name
                        : "Nenhum arquivo";

            };


        // ======================================
        // PUBLICAR
        // ======================================

        form.onsubmit =
            async e => {

                e.preventDefault();


                // ==================================
                // VALIDAÇÃO DO ENDEREÇO
                // ==================================

                if (
                    !address.cep ||
                    !address.street ||
                    !address.number ||
                    !address.city ||
                    !address.state
                ) {

                    alert(
                        "Seu endereço está incompleto. Atualize seus dados no perfil antes de criar um anúncio."
                    );

                    location.href =
                        "perfil.html";

                    return;

                }


                // ==================================
                // VALIDAÇÃO DA ENTREGA
                // ==================================

                const deliveryEnabled =
                    delivery.checked;


                const base =
                    Number(
                        deliveryBasePrice.value
                    ) || 0;


                const perKm =
                    Number(
                        deliveryPricePerKm.value
                    ) || 0;


                const maxDistance =
                    Number(
                        deliveryMaxDistance.value
                    ) || 0;


                if (
                    deliveryEnabled
                ) {

                    if (
                        base < 0 ||
                        perKm < 0 ||
                        maxDistance < 0
                    ) {

                        alert(
                            "Os valores da entrega são inválidos."
                        );

                        return;

                    }

                }


                // ==================================
                // FORM DATA
                // ==================================

                const formData =
                    new FormData();


                formData.append(
                    "ownerId",
                    user._id ||
                    user.id
                );


                formData.append(
                    "ownerName",
                    user.name
                );


                formData.append(
                    "title",
                    title.value.trim()
                );


                formData.append(
                    "category",
                    category.value
                );


                formData.append(
                    "description",
                    description.value.trim()
                );


                formData.append(
                    "city",
                    accountCity
                );


                formData.append(
                    "pricePerDay",
                    price.value
                );


                formData.append(
                    "deposit",
                    deposit.value
                );


                formData.append(
                    "pickup",
                    pickup.checked
                );


                formData.append(
                    "delivery",
                    deliveryEnabled
                );


                formData.append(
                    "deliveryBasePrice",
                    deliveryEnabled
                        ? base
                        : 0
                );


                formData.append(
                    "deliveryPricePerKm",
                    deliveryEnabled
                        ? perKm
                        : 0
                );


                formData.append(
                    "deliveryMaxDistance",
                    deliveryEnabled
                        ? maxDistance
                        : 0
                );


                // Compatibilidade
                formData.append(
                    "deliveryPrice",
                    deliveryEnabled
                        ? base
                        : 0
                );


                // ==================================
                // IMAGENS
                // ==================================

                [
                    ...images.files
                ].forEach(
                    file => {

                        formData.append(
                            "images",
                            file
                        );

                    }
                );


                // ==================================
                // VEÍCULO
                // ==================================

                if (
                    category.value ===
                    "Veículos"
                ) {

                    const vehicle = {

                        brand:
                            brand.value.trim(),

                        model:
                            model.value.trim(),

                        year:
                            Number(
                                year.value
                            ),

                        color:
                            color.value.trim(),

                        plate:
                            plate.value.trim()
                                .toUpperCase(),

                        renavam:
                            renavam.value.trim(),

                        mileage:
                            Number(
                                mileage.value
                            )

                    };


                    formData.append(
                        "vehicle",
                        JSON.stringify(
                            vehicle
                        )
                    );


                    if (
                        crlv.files.length
                    ) {

                        formData.append(
                            "crlv",
                            crlv.files[0]
                        );

                    }

                }


                // ==================================
                // ENVIAR
                // ==================================

                try {

                    const response =
                        await fetch(
                            PRODUCTS_API,
                            {

                                method:
                                    "POST",

                                headers: {

                                    Authorization:
                                        `Bearer ${token}`

                                },

                                body:
                                    formData

                            }
                        );


                    const text =
                        await response.text();


                    let data = {};


                    try {

                        data =
                            JSON.parse(
                                text
                            );

                    } catch {

                        data = {
                            error:
                                text ||
                                "Erro desconhecido."
                        };

                    }


                    if (
                        !response.ok
                    ) {

                        throw new Error(
                            data.error ||
                            "Erro ao publicar anúncio."
                        );

                    }


                    alert(
                        "Anúncio publicado com sucesso!"
                    );


                    location.href =
                        "perfil.html";


                } catch (err) {

                    console.error(
                        "Erro ao publicar anúncio:",
                        err
                    );


                    alert(
                        err.message ||
                        "Erro ao publicar anúncio."
                    );

                }

            };

    }
);
