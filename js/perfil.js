document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api";

    // ==========================================
    // USUÁRIO
    // ==========================================

    let user = JSON.parse(
        localStorage.getItem("alugase_user")
    );

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    // ==========================================
    // ELEMENTOS
    // ==========================================

    const avatar = document.querySelector("#avatar");
    const avatarImage = document.querySelector("#avatar-image");
    const avatarInitials = document.querySelector("#avatar-initials");

    const avatarEdit = document.querySelector("#avatar-edit");
    const profileImageInput = document.querySelector("#profile-image-input");

    const userName = document.querySelector("#user-name");
    const userLocation = document.querySelector("#user-location");

    const verifiedBadge = document.querySelector("#verified-badge");
    const identityStatus = document.querySelector("#identity-status");
    const cnhStatus = document.querySelector("#cnh-status");

    const adsList = document.querySelector("#ads-list");
    const rentalsList = document.querySelector("#rentals-list");

    const notificationBadge = document.querySelector("#notification-badge");


    // ==========================================
    // FOTO DE PERFIL
    // ==========================================

    function getInitials(name) {

        if (!name) {
            return "U";
        }

        return name
            .trim()
            .split(/\s+/)
            .map(n => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

    }


    function renderAvatar() {

        const initials = getInitials(user.name);

        avatarInitials.textContent = initials;

        if (user.profileImage) {

            avatarImage.src = user.profileImage;

            avatarImage.style.display = "block";

            avatarInitials.style.display = "none";

        } else {

            avatarImage.removeAttribute("src");

            avatarImage.style.display = "none";

            avatarInitials.style.display = "block";

        }

    }


    renderAvatar();


    // ==========================================
    // SELECIONAR FOTO
    // ==========================================

    avatarEdit?.addEventListener("click", () => {

        profileImageInput?.click();

    });


    avatar?.addEventListener("click", () => {

        profileImageInput?.click();

    });


    // ==========================================
    // COMPRIMIR IMAGEM
    // ==========================================

    function compressImage(file) {

        return new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.onload = event => {

                const image = new Image();

                image.onload = () => {

                    const MAX_SIZE = 800;

                    let width = image.width;
                    let height = image.height;


                    if (width > height) {

                        if (width > MAX_SIZE) {

                            height =
                                height * (MAX_SIZE / width);

                            width = MAX_SIZE;

                        }

                    } else {

                        if (height > MAX_SIZE) {

                            width =
                                width * (MAX_SIZE / height);

                            height = MAX_SIZE;

                        }

                    }


                    const canvas =
                        document.createElement("canvas");

                    canvas.width = Math.round(width);
                    canvas.height = Math.round(height);


                    const context =
                        canvas.getContext("2d");

                    context.drawImage(
                        image,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );


                    const compressed =
                        canvas.toDataURL(
                            "image/jpeg",
                            0.82
                        );

                    resolve(compressed);

                };


                image.onerror = () => {

                    reject(
                        new Error("Não foi possível carregar a imagem.")
                    );

                };


                image.src = event.target.result;

            };


            reader.onerror = () => {

                reject(
                    new Error("Erro ao ler a imagem.")
                );

            };


            reader.readAsDataURL(file);

        });

    }


    // ==========================================
    // UPLOAD DA FOTO
    // ==========================================

    profileImageInput?.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files?.[0];

            if (!file) {
                return;
            }


            // ======================================
            // VALIDAR TIPO
            // ======================================

            if (!file.type.startsWith("image/")) {

                alert(
                    "Selecione uma imagem válida."
                );

                profileImageInput.value = "";

                return;

            }


            // ======================================
            // TAMANHO ORIGINAL
            // ======================================

            if (file.size > 10 * 1024 * 1024) {

                alert(
                    "A imagem original deve ter no máximo 10 MB."
                );

                profileImageInput.value = "";

                return;

            }


            try {

                avatarEdit.disabled = true;

                avatarEdit.textContent = "⏳";


                // ==================================
                // COMPRIMIR
                // ==================================

                const compressed =
                    await compressImage(file);


                // ==================================
                // PREVIEW IMEDIATO
                // ==================================

                avatarImage.src = compressed;

                avatarImage.style.display = "block";

                avatarInitials.style.display = "none";


                // ==================================
                // ENVIAR PARA API
                // ==================================

                const response =
                    await fetch(
                        `${API}/users/profile-image/${user._id}`,
                        {

                            method: "PUT",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                profileImage: compressed
                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Não foi possível atualizar a foto."
                    );

                }


                // ==================================
                // ATUALIZAR USUÁRIO
                // ==================================

                user = data;


                localStorage.setItem(
                    "alugase_user",
                    JSON.stringify(user)
                );


                renderAvatar();


            } catch (error) {

                console.error(
                    "Erro ao atualizar foto:",
                    error
                );

                alert(
                    error.message ||
                    "Erro ao atualizar foto."
                );

                renderAvatar();

            } finally {

                avatarEdit.disabled = false;

                avatarEdit.textContent = "📷";

                profileImageInput.value = "";

            }

        }
    );


    // ==========================================
    // PERFIL
    // ==========================================

    userName.textContent = user.name;


    const year = user.createdAt
        ? new Date(user.createdAt).getFullYear()
        : new Date().getFullYear();


    userLocation.textContent =
        `${user.city} • Membro desde ${year}`;


    // ==========================================
    // VERIFICAÇÃO
    // ==========================================

    if (user.identityVerified) {

        verifiedBadge.textContent =
            "✓ Verificado";

        verifiedBadge.className =
            "verified";


        identityStatus.textContent =
            "Verificado";

        identityStatus.className =
            "status available";

    } else {

        verifiedBadge.textContent =
            "Pendente";

        verifiedBadge.className =
            "pending";


        identityStatus.textContent =
            "Pendente";

        identityStatus.className =
            "status pending";

    }


    if (user.driverLicenseVerified) {

        cnhStatus.textContent =
            "CNH Verificada";

        cnhStatus.className =
            "status available";

    } else {

        cnhStatus.textContent =
            "Não enviada";

        cnhStatus.className =
            "status";

    }


    // ==========================================
    // ABAS
    // ==========================================

    const tabs =
        document.querySelectorAll(".tab");

    const contents =
        document.querySelectorAll(".content");


    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            tabs.forEach(t =>
                t.classList.remove("active")
            );

            contents.forEach(c =>
                c.classList.remove("active")
            );


            tab.classList.add("active");


            document
                .querySelector(
                    `#${tab.dataset.tab}`
                )
                .classList.add("active");

        });

    });


    // ==========================================
    // BOTÕES
    // ==========================================

    document.querySelector("#new-ad").onclick = () => {

        window.location.href =
            "novo-anuncio.html";

    };


    document
        .querySelector("#empty-new-ad")
        ?.addEventListener("click", () => {

            window.location.href =
                "novo-anuncio.html";

        });


    // ==========================================
    // ANÚNCIOS
    // ==========================================

    async function loadAds() {

        try {

            const response =
                await fetch(
                    `${API}/products/user/${user._id}`
                );


            if (!response.ok) {

                throw new Error(
                    "Erro ao carregar anúncios."
                );

            }


            const products =
                await response.json();


            adsList.innerHTML = "";


            document.querySelector(
                "#total-ads"
            ).textContent =
                products.length;


            if (products.length === 0) {

                document.querySelector(
                    "#empty-ads"
                ).style.display =
                    "block";

                return;

            }


            document.querySelector(
                "#empty-ads"
            ).style.display =
                "none";


            products.forEach(product => {

                adsList.innerHTML += `

                    <div class="item-card">

                        <div class="item-image">

                            ${product.image || "📦"}

                        </div>


                        <div class="item-info">

                            <h3>
                                ${product.title}
                            </h3>


                            <p>
                                R$ ${product.pricePerDay} / dia
                            </p>


                            <span
                                class="status ${
                                    product.status === "available"
                                        ? "available"
                                        : "rented"
                                }"
                            >

                                ${
                                    product.status === "available"
                                        ? "Disponível"
                                        : "Alugado"
                                }

                            </span>

                        </div>


                        <button
                            class="btn-secondary edit-ad"
                            data-id="${product._id}"
                        >
                            Editar
                        </button>

                    </div>

                `;

            });


            document
                .querySelectorAll(".edit-ad")
                .forEach(button => {

                    button.onclick = () => {

                        window.location.href =
                            `editar-anuncio.html?id=${button.dataset.id}`;

                    };

                });


        } catch (err) {

            console.error(
                "Erro anúncios:",
                err
            );

        }

    }


    // ==========================================
    // ALUGUÉIS
    // ==========================================

    async function loadRentals() {

        try {

            const response =
                await fetch(
                    `${API}/rentals/user/${user._id}`
                );


            if (!response.ok) {

                throw new Error(
                    "Erro ao carregar aluguéis."
                );

            }


            const rentals =
                await response.json();


            rentalsList.innerHTML = "";


            const myRentals =
                rentals.filter(r =>
                    String(
                        r.renterId?._id ||
                        r.renterId
                    ) === String(user._id)
                );


            document.querySelector(
                "#total-rentals"
            ).textContent =
                myRentals.length;


            const income =
                rentals
                    .filter(r =>
                        String(
                            r.ownerId?._id ||
                            r.ownerId
                        ) === String(user._id) &&
                        r.status === "finished"
                    )
                    .reduce(
                        (acc, r) =>
                            acc + Number(r.total || 0),
                        0
                    );


            document.querySelector(
                "#total-income"
            ).textContent =
                `R$ ${income.toFixed(2)}`;


            const pending =
                rentals.filter(r =>
                    String(
                        r.ownerId?._id ||
                        r.ownerId
                    ) === String(user._id) &&
                    r.status === "pending"
                ).length;


            if (notificationBadge) {

                if (pending > 0) {

                    notificationBadge.style.display =
                        "flex";

                    notificationBadge.textContent =
                        pending;

                } else {

                    notificationBadge.style.display =
                        "none";

                }

            }


            if (myRentals.length === 0) {

                document.querySelector(
                    "#empty-rentals"
                ).style.display =
                    "block";

                return;

            }


            document.querySelector(
                "#empty-rentals"
            ).style.display =
                "none";


            myRentals.forEach(rental => {

                const product =
                    rental.productId || {};


                rentalsList.innerHTML += `

                    <div class="item-card">

                        <div class="item-image">

                            ${product.image || "📦"}

                        </div>


                        <div class="item-info">

                            <h3>
                                ${product.title || "Produto"}
                            </h3>


                            <p>

                                ${
                                    new Date(
                                        rental.startDate
                                    ).toLocaleDateString(
                                        "pt-BR"
                                    )
                                }

                                até

                                ${
                                    new Date(
                                        rental.endDate
                                    ).toLocaleDateString(
                                        "pt-BR"
                                    )
                                }

                            </p>


                            <span
                                class="status progress"
                            >
                                ${rental.status}
                            </span>

                        </div>


                        <strong>
                            R$ ${Number(
                                rental.total || 0
                            ).toFixed(2)}
                        </strong>

                    </div>

                `;

            });


        } catch (err) {

            console.error(
                "Erro aluguéis:",
                err
            );

        }

    }


    // ==========================================
    // CPF
    // ==========================================

    const cpf =
        document.querySelector("#cpf");

    const cpfStatus =
        document.querySelector("#cpf-status");


    function validateCPF(number) {

        number =
            number.replace(/\D/g, "");


        if (number.length !== 11)
            return false;


        if (/^(\d)\1+$/.test(number))
            return false;


        let sum = 0;


        for (let i = 0; i < 9; i++) {

            sum +=
                Number(number[i]) *
                (10 - i);

        }


        let digit =
            (sum * 10) % 11;


        if (digit === 10)
            digit = 0;


        if (digit !== Number(number[9]))
            return false;


        sum = 0;


        for (let i = 0; i < 10; i++) {

            sum +=
                Number(number[i]) *
                (11 - i);

        }


        digit =
            (sum * 10) % 11;


        if (digit === 10)
            digit = 0;


        return digit ===
            Number(number[10]);

    }


    cpf?.addEventListener(
        "input",
        () => {

            let value =
                cpf.value
                    .replace(/\D/g, "")
                    .slice(0, 11);


            value =
                value.replace(
                    /(\d{3})(\d)/,
                    "$1.$2"
                );


            value =
                value.replace(
                    /(\d{3})\.(\d{3})(\d)/,
                    "$1.$2.$3"
                );


            value =
                value.replace(
                    /(\d{3})\.(\d{3})\.(\d{3})(\d)/,
                    "$1.$2.$3-$4"
                );


            cpf.value = value;

        }
    );


    cpf?.addEventListener(
        "blur",
        () => {

            if (validateCPF(cpf.value)) {

                cpfStatus.textContent =
                    "CPF válido";

                cpfStatus.className =
                    "valid";

            } else {

                cpfStatus.textContent =
                    "CPF inválido";

                cpfStatus.className =
                    "invalid";

            }

        }
    );


    // ==========================================
    // CEP
    // ==========================================

    const rg =
        document.querySelector("#rg");

    const cnh =
        document.querySelector("#cnh");

    const cep =
        document.querySelector("#cep");


    const number =
        document.querySelector("#number");

    const street =
        document.querySelector("#street");

    const district =
        document.querySelector("#district");

    const city =
        document.querySelector("#city");

    const state =
        document.querySelector("#state");


    cep?.addEventListener(
        "blur",
        async () => {

            const value =
                cep.value.replace(/\D/g, "");


            if (value.length !== 8)
                return;


            try {

                const response =
                    await fetch(
                        `https://viacep.com.br/ws/${value}/json/`
                    );


                const data =
                    await response.json();


                if (data.erro) {

                    alert(
                        "CEP não encontrado."
                    );

                    return;

                }


                street.value =
                    data.logradouro || "";

                district.value =
                    data.bairro || "";

                city.value =
                    data.localidade || "";

                state.value =
                    data.uf || "";


            } catch (error) {

                console.error(
                    "Erro CEP:",
                    error
                );

            }

        }
    );


    // ==========================================
    // VERIFICAÇÃO
    // ==========================================

    document
        .querySelector("#verify-account")
        ?.addEventListener(
            "click",
            async () => {

                if (!validateCPF(cpf.value)) {

                    alert(
                        "CPF inválido."
                    );

                    return;

                }


                try {

                    const response =
                        await fetch(
                            `${API}/users/verify/${user._id}`,
                            {

                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    cpf:
                                        cpf.value,

                                    rg:
                                        rg.value,

                                    cnh:
                                        cnh.value,

                                    cep:
                                        cep.value,

                                    number:
                                        number.value,

                                    street:
                                        street.value,

                                    district:
                                        district.value,

                                    city:
                                        city.value,

                                    state:
                                        state.value

                                })

                            }
                        );


                    const updated =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            updated.error ||
                            "Erro ao enviar documentos."
                        );

                    }


                    user = updated;


                    localStorage.setItem(
                        "alugase_user",
                        JSON.stringify(user)
                    );


                    alert(
                        "Documentos enviados com sucesso!"
                    );


                    location.reload();


                } catch (error) {

                    console.error(
                        "Erro verificação:",
                        error
                    );

                    alert(
                        error.message ||
                        "Erro ao enviar documentos."
                    );

                }

            }
        );


    // ==========================================
    // INICIAR
    // ==========================================

    await loadAds();

    await loadRentals();

});
