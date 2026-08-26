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
            localStorage.getItem(
                "token"
            );


        let user =
            JSON.parse(
                localStorage.getItem(
                    "alugase_user"
                )
            );


        if (
            !token ||
            !user
        ) {

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
                    JSON.stringify(
                        user
                    )
                );

            } else if (
                response.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "alugase_user"
                );

                alert(
                    "Sua sessão expirou. Faça login novamente."
                );

                location.href =
                    "login.html";

                return;
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


        if (
            accountCity
        ) {

            city.value =
                accountCity;

            city.readOnly =
                true;

        } else {

            city.readOnly =
                false;
        }


        // ======================================
        // CIDADE SEMPRE DO ENDEREÇO
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


                if (
                    isVehicle
                ) {

                    icon.value =
                        "🚗";
                }

            };


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

                sumDelivery.textContent =
                    "Calculada automaticamente";

            } else {

                sumDelivery.textContent =
                    "Não disponível";
            }
        }


        price.addEventListener(
            "input",
            updateSummary
        );


        deposit.addEventListener(
            "input",
            updateSummary
        );


        delivery.addEventListener(
            "change",
            updateSummary
        );


        updateSummary();


        // ======================================
        // PREVIEW DAS IMAGENS
        // ======================================

        const selectImages =
            document.querySelector(
                "#select-images"
            );


        if (
            selectImages
        ) {

            selectImages.onclick =
                event => {

                    event.stopPropagation();

                    images.click();

                };
        }


        const uploadArea =
            document.querySelector(
                "#upload-area"
            );


        if (
            uploadArea
        ) {

            uploadArea.onclick =
                event => {

                    if (
                        event.target.closest(
                            "#select-images"
                        )
                    ) {

                        return;
                    }

                    images.click();

                };
        }


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

                                const item =
                                    document.createElement(
                                        "div"
                                    );


                                item.className =
                                    "preview-item";


                                const image =
                                    document.createElement(
                                        "img"
                                    );


                                image.src =
                                    e.target.result;


                                image.alt =
                                    "Prévia do produto";


                                item.appendChild(
                                    image
                                );


                                previewGrid.appendChild(
                                    item
                                );

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

        const selectCrlv =
            document.querySelector(
                "#select-crlv"
            );


        const crlvName =
            document.querySelector(
                "#crlv-name"
            );


        if (
            crlvName
        ) {

            crlvName.textContent =
                "Nenhum arquivo";
        }


        if (
            selectCrlv
        ) {

            selectCrlv.onclick =
                () => {

                    crlv.click();

                };
        }


        crlv.onchange =
            () => {

                if (
                    crlvName
                ) {

                    crlvName.textContent =
                        crlv.files.length
                            ? crlv.files[0].name
                            : "Nenhum arquivo";
                }

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
                // VALIDAÇÃO DO PREÇO
                // ==================================

                const priceValue =
                    Number(
                        price.value
                    );


                const depositValue =
                    Number(
                        deposit.value
                    );


                if (
                    !Number.isFinite(
                        priceValue
                    ) ||
                    priceValue <= 0
                ) {

                    alert(
                        "Informe um preço por dia válido."
                    );

                    return;
                }


                if (
                    !Number.isFinite(
                        depositValue
                    ) ||
                    depositValue < 0
                ) {

                    alert(
                        "Informe uma caução válida."
                    );

                    return;
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
                    user.name || ""
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


                // A cidade vem da conta
                formData.append(
                    "city",
                    accountCity
                );


                formData.append(
                    "pricePerDay",
                    priceValue
                );


                formData.append(
                    "deposit",
                    depositValue
                );


                // ==================================
                // RETIRADA
                // ==================================

                formData.append(
                    "pickup",
                    pickup.checked
                );


                // ==================================
                // ENTREGA
                // ==================================
                //
                // Apenas informa se o proprietário
                // oferece entrega.
                //
                // O preço é calculado pelo backend.
                //
                // ==================================

                formData.append(
                    "delivery",
                    delivery.checked
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
                            plate.value
                                .trim()
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
                // DESABILITAR BOTÃO
                // ==================================

                const submitButton =
                    form.querySelector(
                        'button[type="submit"]'
                    );


                if (
                    submitButton
                ) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "Publicando...";
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


                    if (
                        submitButton
                    ) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "Publicar anúncio";
                    }
                }

            };

    }
);
