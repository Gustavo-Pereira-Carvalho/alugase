// ==========================================
// ALUGASE — EDITAR ANÚNCIO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // ==========================================
        // API
        // ==========================================

        const API =
            "https://alugase-api.onrender.com/api/products";


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

            window.location.href =
                "login.html";

            return;

        }


        // ==========================================
        // ID DO PRODUTO
        // ==========================================

        const params =
            new URLSearchParams(
                window.location.search
            );


        const productId =
            params.get("id");


        if (!productId) {

            alert(
                "Anúncio não informado."
            );

            window.location.href =
                "perfil.html";

            return;

        }


        // ==========================================
        // ELEMENTOS
        // ==========================================

        const form =
            document.querySelector(
                "#edit-form"
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


        const deliveryPrice =
            document.querySelector(
                "#deliveryPrice"
            );


        const active =
            document.querySelector(
                "#active"
            );


        const saveButton =
            document.querySelector(
                "#save-btn"
            );


        const deleteButton =
            document.querySelector(
                "#delete-btn"
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


        const sumStatus =
            document.querySelector(
                "#sum-status"
            );


        // ==========================================
        // PRODUTO ATUAL
        // ==========================================

        let product = null;


        // ==========================================
        // DINHEIRO
        // ==========================================

        function money(value) {

            return Number(
                value || 0
            ).toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

        }


        // ==========================================
        // ATUALIZAR RESUMO
        // ==========================================

        function updateSummary() {

            if (sumPrice) {

                sumPrice.textContent =
                    money(
                        price.value
                    );

            }


            if (sumDeposit) {

                sumDeposit.textContent =
                    money(
                        deposit.value
                    );

            }


            if (sumDelivery) {

                sumDelivery.textContent =
                    money(
                        deliveryPrice.value
                    );

            }


            if (sumStatus) {

                sumStatus.textContent =
                    active.checked
                        ? "Disponível"
                        : "Pausado";

            }

        }


        // ==========================================
        // CARREGAR PRODUTO
        // ==========================================

        try {

            const response =
                await fetch(
                    `${API}/${productId}`
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Produto não encontrado."
                );

            }


            product =
                data;


            // ======================================
            // SEGURANÇA
            // ======================================

            const ownerId =
                product.ownerId?._id ||
                product.ownerId;


            if (
                String(ownerId) !==
                String(user._id)
            ) {

                alert(
                    "Você não pode editar este anúncio."
                );

                window.location.href =
                    "perfil.html";

                return;

            }


            // ======================================
            // PREENCHER FORMULÁRIO
            // ======================================

            title.value =
                product.title || "";


            category.value =
                product.category || "";


            /*
             * O campo icon é apenas visual.
             * O banco atual utiliza "images".
             *
             * Não sobrescrevemos as imagens
             * existentes durante a edição.
             */


            description.value =
                product.description || "";


            city.value =
                product.city || "";


            price.value =
                Number(
                    product.pricePerDay || 0
                );


            deposit.value =
                Number(
                    product.deposit || 0
                );


            deliveryPrice.value =
                Number(
                    product.deliveryPrice || 0
                );


            active.checked =
                product.status ===
                "available";


            updateSummary();


        } catch (error) {

            console.error(
                "Erro ao carregar produto:",
                error
            );


            alert(
                error.message ||
                "Produto não encontrado."
            );


            window.location.href =
                "perfil.html";


            return;

        }


        // ==========================================
        // EVENTOS DO RESUMO
        // ==========================================

        [
            price,
            deposit,
            deliveryPrice
        ].forEach(
            input => {

                input.addEventListener(
                    "input",
                    updateSummary
                );

            }
        );


        active.addEventListener(
            "change",
            updateSummary
        );


        // ==========================================
        // SALVAR
        // ==========================================

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                if (!product) {
                    return;
                }


                // ==================================
                // VALIDAR
                // ==================================

                if (
                    !title.value.trim() ||
                    !category.value.trim() ||
                    !description.value.trim() ||
                    !city.value.trim()
                ) {

                    alert(
                        "Preencha todos os campos obrigatórios."
                    );

                    return;

                }


                if (
                    Number(price.value) <= 0
                ) {

                    alert(
                        "O preço por dia deve ser maior que zero."
                    );

                    return;

                }


                if (
                    Number(deposit.value) < 0
                ) {

                    alert(
                        "A caução não pode ser negativa."
                    );

                    return;

                }


                // ==================================
                // LOADING
                // ==================================

                saveButton.disabled =
                    true;


                saveButton.textContent =
                    "Salvando...";


                try {

                    /*
                     * Mantemos as imagens atuais.
                     * Isso é importante porque o cadastro
                     * atual utiliza o campo "images".
                     */

                    const updatedProduct = {

                        ownerId:
                            product.ownerId,

                        ownerName:
                            product.ownerName,

                        title:
                            title.value.trim(),

                        category:
                            category.value,

                        description:
                            description.value.trim(),

                        city:
                            city.value.trim(),

                        pricePerDay:
                            Number(
                                price.value
                            ),

                        deposit:
                            Number(
                                deposit.value
                            ),

                        pickup:
                            Boolean(
                                product.pickup
                            ),

                        delivery:
                            Boolean(
                                product.delivery
                            ),

                        deliveryPrice:
                            Number(
                                deliveryPrice.value || 0
                            ),

                        images:
                            Array.isArray(
                                product.images
                            )
                                ? product.images
                                : [],

                        vehicle:
                            product.vehicle || null,

                        verified:
                            product.verified !== false,

                        status:
                            active.checked
                                ? "available"
                                : "paused"

                    };


                    // ==================================
                    // REQUEST
                    // ==================================

                    const response =
                        await fetch(
                            `${API}/${productId}`,
                            {

                                method: "PUT",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify(
                                        updatedProduct
                                    )

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.error ||
                            "Erro ao salvar alterações."
                        );

                    }


                    // ==================================
                    // SUCESSO
                    // ==================================

                    alert(
                        "Alterações salvas com sucesso!"
                    );


                    window.location.href =
                        "perfil.html";


                } catch (error) {

                    console.error(
                        "Erro ao salvar:",
                        error
                    );


                    alert(
                        error.message ||
                        "Não foi possível salvar as alterações."
                    );


                } finally {

                    saveButton.disabled =
                        false;


                    saveButton.textContent =
                        "Salvar alterações";

                }

            }
        );


        // ==========================================
        // EXCLUIR
        // ==========================================

        deleteButton.addEventListener(
            "click",
            async () => {

                if (!product) {
                    return;
                }


                const confirmed =
                    confirm(
                        `Deseja realmente excluir o anúncio "${product.title}"?`
                    );


                if (!confirmed) {
                    return;
                }


                deleteButton.disabled =
                    true;


                deleteButton.textContent =
                    "Excluindo...";


                try {

                    const response =
                        await fetch(
                            `${API}/${productId}`,
                            {
                                method: "DELETE",
                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },
                                body:
                                    JSON.stringify({
                                        ownerId:
                                            user._id
                                    })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.error ||
                            "Erro ao excluir anúncio."
                        );

                    }


                    alert(
                        "Anúncio excluído com sucesso!"
                    );


                    window.location.href =
                        "perfil.html";


                } catch (error) {

                    console.error(
                        "Erro ao excluir:",
                        error
                    );


                    alert(
                        error.message ||
                        "Não foi possível excluir o anúncio."
                    );


                } finally {

                    deleteButton.disabled =
                        false;


                    deleteButton.textContent =
                        "Excluir anúncio";

                }

            }
        );

    }
);
