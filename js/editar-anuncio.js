// ==========================================
// ALUGASE — EDITAR ANÚNCIO
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    // ==========================================
    // CONFIGURAÇÃO
    // ==========================================

    const API =
        "https://alugase-api.onrender.com/api/products";


    // ==========================================
    // USUÁRIO
    // ==========================================

    let user = null;

    try {

        user = JSON.parse(
            localStorage.getItem("alugase_user")
        );

    } catch (error) {

        console.error(
            "Erro ao carregar usuário:",
            error
        );

    }


    if (!user || !user._id) {

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
            "Anúncio não encontrado."
        );

        window.location.href =
            "perfil.html";

        return;

    }


    // ==========================================
    // ELEMENTOS
    // ==========================================

    const form =
        document.querySelector("#edit-form");

    const title =
        document.querySelector("#title");

    const category =
        document.querySelector("#category");

    const icon =
        document.querySelector("#icon");

    const description =
        document.querySelector("#description");

    const city =
        document.querySelector("#city");

    const price =
        document.querySelector("#price");

    const deposit =
        document.querySelector("#deposit");

    const deliveryPrice =
        document.querySelector("#deliveryPrice");

    const active =
        document.querySelector("#active");

    const deleteButton =
        document.querySelector("#delete-btn");

    const sumPrice =
        document.querySelector("#sum-price");

    const sumDeposit =
        document.querySelector("#sum-deposit");

    const sumStatus =
        document.querySelector("#sum-status");

    const currentImages =
        document.querySelector("#current-images");


    // ==========================================
    // VERIFICAR FORMULÁRIO
    // ==========================================

    if (!form) {

        console.error(
            "Formulário #edit-form não encontrado."
        );

        return;

    }


    // ==========================================
    // PRODUTO
    // ==========================================

    let product = null;


    // ==========================================
    // FORMATAR DINHEIRO
    // ==========================================

    function money(value) {

        return Number(value || 0).toLocaleString(
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
                money(price.value);

        }


        if (sumDeposit) {

            sumDeposit.textContent =
                money(deposit.value);

        }


        if (sumStatus) {

            sumStatus.textContent =
                active.checked
                    ? "Disponível"
                    : "Pausado";

        }

    }


    // ==========================================
    // MOSTRAR IMAGENS
    // ==========================================

    function renderCurrentImages() {

        if (!currentImages) {
            return;
        }


        currentImages.innerHTML = "";


        const images =
            Array.isArray(product?.images)
                ? product.images
                : [];


        if (!images.length) {

            currentImages.innerHTML = `

                <div class="no-images">

                    <span>
                        📷
                    </span>

                    <p>
                        Este anúncio não possui imagens.
                    </p>

                </div>

            `;

            return;

        }


        images.forEach(
            (image, index) => {

                const wrapper =
                    document.createElement("div");


                wrapper.className =
                    "current-image";


                const img =
                    document.createElement("img");


                img.src =
                    image;


                img.alt =
                    `${product.title || "Produto"} - imagem ${index + 1}`;


                img.loading =
                    "lazy";


                img.onerror =
                    () => {

                        wrapper.innerHTML = `

                            <div class="image-error">
                                Imagem indisponível
                            </div>

                        `;

                    };


                wrapper.appendChild(
                    img
                );


                currentImages.appendChild(
                    wrapper
                );

            }
        );

    }


    // ==========================================
    // CARREGAR PRODUTO
    // ==========================================

    async function loadProduct() {

        try {

            console.log(
                "Buscando produto:",
                productId
            );


            const response =
                await fetch(
                    `${API}/${productId}`
                );


            const data =
                await response.json();


            console.log(
                "Produto recebido:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Produto não encontrado."
                );

            }


            product =
                data;


            // ==================================
            // VERIFICAR DONO
            // ==================================

            const ownerId =
                product.ownerId?._id ||
                product.ownerId;


            if (
                ownerId &&
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


            // ==================================
            // NOME
            // ==================================

            title.value =
                product.title || "";


            // ==================================
            // CATEGORIA
            // ==================================

            category.value =
                product.category || "";


            // ==================================
            // ÍCONE
            // ==================================

            const productIcon =
                product.icon || "📦";


            const iconExists =
                [...icon.options].some(
                    option =>
                        option.value ===
                        productIcon
                );


            if (iconExists) {

                icon.value =
                    productIcon;

            } else {

                icon.value =
                    "📦";

            }


            // ==================================
            // DESCRIÇÃO
            // ==================================

            description.value =
                product.description || "";


            // ==================================
            // CIDADE
            // ==================================

            city.value =
                product.city || "";


            // ==================================
            // PREÇOS
            // ==================================

            price.value =
                product.pricePerDay ?? 0;


            deposit.value =
                product.deposit ?? 0;


            deliveryPrice.value =
                product.deliveryPrice ?? 0;


            // ==================================
            // STATUS
            // ==================================

            active.checked =
                product.status === "available";


            // ==================================
            // IMAGENS
            // ==================================

            renderCurrentImages();


            // ==================================
            // RESUMO
            // ==================================

            updateSummary();


        } catch (error) {

            console.error(
                "Erro ao carregar produto:",
                error
            );


            alert(
                error.message ||
                "Não foi possível carregar o anúncio."
            );


            window.location.href =
                "perfil.html";

        }

    }


    // ==========================================
    // EVENTOS DO RESUMO
    // ==========================================

    price?.addEventListener(
        "input",
        updateSummary
    );


    deposit?.addEventListener(
        "input",
        updateSummary
    );


    deliveryPrice?.addEventListener(
        "input",
        updateSummary
    );


    active?.addEventListener(
        "change",
        updateSummary
    );


    // ==========================================
    // SALVAR ALTERAÇÕES
    // ==========================================

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            // ==================================
            // VALIDAÇÕES
            // ==================================

            if (!title.value.trim()) {

                alert(
                    "Informe o nome do produto."
                );

                title.focus();

                return;

            }


            if (!category.value.trim()) {

                alert(
                    "Selecione uma categoria."
                );

                category.focus();

                return;

            }


            if (!description.value.trim()) {

                alert(
                    "Informe uma descrição."
                );

                description.focus();

                return;

            }


            if (!city.value.trim()) {

                alert(
                    "Informe a cidade."
                );

                city.focus();

                return;

            }


            const priceValue =
                Number(price.value);


            const depositValue =
                Number(
                    deposit.value || 0
                );


            const deliveryValue =
                Number(
                    deliveryPrice.value || 0
                );


            if (
                !Number.isFinite(priceValue) ||
                priceValue <= 0
            ) {

                alert(
                    "Informe um preço por dia válido."
                );

                price.focus();

                return;

            }


            if (
                !Number.isFinite(depositValue) ||
                depositValue < 0
            ) {

                alert(
                    "Informe uma caução válida."
                );

                deposit.focus();

                return;

            }


            if (
                !Number.isFinite(deliveryValue) ||
                deliveryValue < 0
            ) {

                alert(
                    "Informe uma taxa de entrega válida."
                );

                deliveryPrice.focus();

                return;

            }


            // ==================================
            // BOTÃO
            // ==================================

            const saveButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            if (saveButton) {

                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "Salvando...";

            }


            try {

                // ==================================
                // MONTAR DADOS
                // ==================================

                const updatedProduct = {

                    title:
                        title.value.trim(),

                    category:
                        category.value.trim(),

                    icon:
                        icon.value,

                    description:
                        description.value.trim(),

                    city:
                        city.value.trim(),

                    pricePerDay:
                        priceValue,

                    deposit:
                        depositValue,

                    deliveryPrice:
                        deliveryValue,

                    status:
                        active.checked
                            ? "available"
                            : "paused",

                    /*
                     * IMPORTANTE:
                     *
                     * O backend utiliza "images".
                     *
                     * Mantemos as imagens existentes
                     * porque esta página ainda não
                     * substitui os arquivos.
                     */

                    images:
                        Array.isArray(product.images)
                            ? product.images
                            : []

                };


                console.log(
                    "Enviando atualização:",
                    updatedProduct
                );


                // ==================================
                // PUT
                // ==================================

                const response =
                    await fetch(
                        `${API}/${productId}`,
                        {

                            method:
                                "PUT",

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


                console.log(
                    "Resposta do servidor:",
                    data
                );


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Erro ao atualizar anúncio."
                    );

                }


                // ==================================
                // ATUALIZAR LOCALSTORAGE
                // ==================================

                product =
                    data;


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

                if (saveButton) {

                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        "Salvar alterações";

                }

            }

        }
    );


    // ==========================================
    // EXCLUIR ANÚNCIO
    // ==========================================

    deleteButton?.addEventListener(
        "click",
        async () => {

            const confirmed =
                confirm(
                    "Deseja realmente excluir este anúncio?\n\nEssa ação não poderá ser desfeita."
                );


            if (!confirmed) {
                return;
            }


            deleteButton.disabled =
                true;


            deleteButton.textContent =
                "Excluindo...";


            try {

                // ==================================
                // DELETE
                // ==================================

                const response =
                    await fetch(
                        `${API}/${productId}`,
                        {

                            method:
                                "DELETE"

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


                // ==================================
                // SUCESSO
                // ==================================

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


                deleteButton.disabled =
                    false;


                deleteButton.textContent =
                    "Excluir anúncio";

            }

        }
    );


    // ==========================================
    // INICIAR
    // ==========================================

    await loadProduct();

});
