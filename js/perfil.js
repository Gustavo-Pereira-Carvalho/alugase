// ==========================================
// ALUGASE — PERFIL (JWT)
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API =
        "https://alugase-api.onrender.com/api";

    const NOTIFICATIONS_API =
        "https://alugase-api.onrender.com/api/notifications";

    const token =
        localStorage.getItem("token");


    // ==========================================
    // VERIFICAR LOGIN
    // ==========================================

    if (!token) {

        location.href = "login.html";

        return;

    }


    let user;


    // ==========================================
    // BUSCAR USUÁRIO
    // ==========================================

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


        if (!response.ok)
            throw new Error();


        user =
            await response.json();


        localStorage.setItem(
            "alugase_user",
            JSON.stringify(user)
        );


    } catch {

        localStorage.clear();

        location.href =
            "login.html";

        return;

    }


    const userId =
        user._id || user.id;


    // ==========================================
    // ELEMENTOS
    // ==========================================

    const avatar =
        document.getElementById("avatar");

    const profileImageInput =
        document.getElementById(
            "profile-image-input"
        );

    const userName =
        document.getElementById(
            "user-name"
        );

    const userLocation =
        document.getElementById(
            "user-location"
        );

    const verifiedBadge =
        document.getElementById(
            "verified-badge"
        );

    const identityStatus =
        document.getElementById(
            "identity-status"
        );

    const cnhStatus =
        document.getElementById(
            "cnh-status"
        );

    const adsList =
        document.getElementById(
            "ads-list"
        );

    const rentalsList =
        document.getElementById(
            "rentals-list"
        );

    const notificationButton =
        document.getElementById(
            "notification-button"
        );

    const notificationBadge =
        document.getElementById(
            "notification-badge"
        );

    const cpf =
        document.getElementById(
            "cpf"
        );

    const rg =
        document.getElementById(
            "rg"
        );

    const cnh =
        document.getElementById(
            "cnh"
        );

    const cep =
        document.getElementById(
            "cep"
        );

    const number =
        document.getElementById(
            "number"
        );

    const street =
        document.getElementById(
            "street"
        );

    const district =
        document.getElementById(
            "district"
        );

    const city =
        document.getElementById(
            "city"
        );

    const state =
        document.getElementById(
            "state"
        );

    const cpfStatus =
        document.getElementById(
            "cpf-status"
        );


    // ==========================================
    // NOTIFICAÇÕES
    // ==========================================

    async function updateNotificationCount() {

        if (
            !notificationButton ||
            !notificationBadge ||
            !userId
        ) {

            return;

        }


        try {

            const response =
                await fetch(
                    `${NOTIFICATIONS_API}/user/${userId}/unread-count`
                );


            if (!response.ok) {

                throw new Error(
                    "Erro ao buscar contador de notificações."
                );

            }


            const data =
                await response.json();


            const count =
                Number(data.count) || 0;


            if (count > 0) {

                notificationBadge.textContent =
                    count > 99
                        ? "99+"
                        : count;

                notificationBadge.style.display =
                    "flex";

            } else {

                notificationBadge.textContent =
                    "0";

                notificationBadge.style.display =
                    "none";

            }


        } catch (error) {

            console.error(
                "ERRO AO ATUALIZAR NOTIFICAÇÕES:",
                error
            );

        }

    }


    // ==========================================
    // CLIQUE NAS NOTIFICAÇÕES
    // ==========================================

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "notificacoes.html";

            }
        );

    }


    // Buscar imediatamente
    await updateNotificationCount();


    // Atualizar a cada 5 segundos
    setInterval(
        updateNotificationCount,
        5000
    );


    // ==========================================
    // INICIAIS
    // ==========================================

    function initials(name) {

        if (!name)
            return "U";


        return name
            .trim()
            .split(/\s+/)
            .map(n => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

    }


    // ==========================================
    // AVATAR
    // ==========================================

    function renderAvatar() {

        if (!avatar)
            return;


        avatar.innerHTML = "";


        if (user.profileImage) {

            const img =
                document.createElement("img");


            img.src =
                user.profileImage;


            img.alt =
                user.name || "Usuário";


            avatar.appendChild(img);


        } else {

            avatar.textContent =
                initials(user.name);

        }

    }


    renderAvatar();


    // ==========================================
    // DADOS DO USUÁRIO
    // ==========================================

    if (userName) {

        userName.textContent =
            user.name || "Usuário";

    }


    const year =
        user.createdAt
            ? new Date(
                user.createdAt
            ).getFullYear()
            : 2026;


    if (userLocation) {

        userLocation.textContent =
            `${user.city || "Cidade não informada"} • Membro desde ${year}`;

    }


    if (user.identityVerified) {

        verifiedBadge.textContent =
            "✓ Verificado";

        verifiedBadge.className =
            "verified";


        identityStatus.textContent =
            "Verificado";

        identityStatus.className =
            "status available";

    }


    if (user.driverLicenseVerified) {

        cnhStatus.textContent =
            "CNH Verificada";

        cnhStatus.className =
            "status available";

    }


    // ==========================================
    // PREENCHER FORMULÁRIO
    // ==========================================

    if (cpf)
        cpf.value = user.cpf || "";


    if (rg)
        rg.value = user.rg || "";


    if (cnh)
        cnh.value = user.cnh || "";


    if (user.address) {

        if (cep)
            cep.value =
                user.address.cep || "";


        if (number)
            number.value =
                user.address.number || "";


        if (street)
            street.value =
                user.address.street || "";


        if (district)
            district.value =
                user.address.district || "";


        if (city)
            city.value =
                user.address.city || "";


        if (state)
            state.value =
                user.address.state || "";

    }


    // ==========================================
    // FOTO DE PERFIL
    // ==========================================

    if (profileImageInput) {

        profileImageInput.addEventListener(
            "change",
            async e => {

                const file =
                    e.target.files[0];


                if (!file)
                    return;


                const form =
                    new FormData();


                form.append(
                    "image",
                    file
                );


                try {

                    const response =
                        await fetch(
                            `${API}/users/profile-image/${userId}`,
                            {
                                method: "PUT",

                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                },

                                body: form
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok)
                        throw new Error(
                            data.error ||
                            "Erro ao atualizar foto."
                        );


                    user =
                        data;


                    localStorage.setItem(
                        "alugase_user",
                        JSON.stringify(user)
                    );


                    renderAvatar();


                    alert(
                        "Foto atualizada!"
                    );


                } catch (err) {

                    alert(
                        err.message
                    );

                }

            }
        );

    }


    // ==========================================
    // ABAS
    // ==========================================

    document
        .querySelectorAll(".tab")
        .forEach(tab => {

            tab.onclick = () => {

                document
                    .querySelectorAll(".tab")
                    .forEach(t =>
                        t.classList.remove(
                            "active"
                        )
                    );


                document
                    .querySelectorAll(".content")
                    .forEach(c =>
                        c.classList.remove(
                            "active"
                        )
                    );


                tab.classList.add(
                    "active"
                );


                const target =
                    document.getElementById(
                        tab.dataset.tab
                    );


                if (target) {

                    target.classList.add(
                        "active"
                    );

                }

            };

        });


    // ==========================================
    // ANÚNCIOS
    // ==========================================

    async function loadAds() {

        try {

            const response =
                await fetch(
                    `${API}/products/user/${userId}`
                );


            if (!response.ok)
                throw new Error();


            const products =
                await response.json();


            document.getElementById(
                "total-ads"
            ).textContent =
                products.length;


            adsList.innerHTML = "";


            if (!products.length) {

                document.getElementById(
                    "empty-ads"
                ).style.display =
                    "block";

                return;

            }


            document.getElementById(
                "empty-ads"
            ).style.display =
                "none";


            products.forEach(p => {

                adsList.innerHTML += `

                    <div class="item-card">

                        <div class="item-image">

                            ${
                                p.image
                                    ? `<img src="${p.image}" alt="">`
                                    : "📦"
                            }

                        </div>


                        <div class="item-info">

                            <h3>
                                ${p.title}
                            </h3>


                            <p>
                                R$ ${p.pricePerDay} / dia
                            </p>


                            <span
                                class="status ${
                                    p.status === "available"
                                        ? "available"
                                        : "rented"
                                }"
                            >

                                ${
                                    p.status === "available"
                                        ? "Disponível"
                                        : "Alugado"
                                }

                            </span>

                        </div>


                        <button
                            class="btn-secondary"
                            onclick="
                                location.href =
                                'editar-anuncio.html?id=${p._id}'
                            "
                        >
                            Editar
                        </button>

                    </div>

                `;

            });


        } catch (err) {

            console.log(
                "Erro ao carregar anúncios:",
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
                    `${API}/rentals/user/${userId}`
                );


            if (!response.ok)
                throw new Error();


            const rentals =
                await response.json();


            rentalsList.innerHTML = "";


            // ======================================
            // ALUGUÉIS FEITOS PELO USUÁRIO
            // ======================================

            const mine =
                rentals.filter(r =>
                    String(
                        r.renterId?._id ||
                        r.renterId
                    ) === String(userId)
                );


            document.getElementById(
                "total-rentals"
            ).textContent =
                mine.length;


            // ======================================
            // RENDA DO PROPRIETÁRIO
            // ======================================

            const income =
                rentals
                    .filter(r =>
                        String(
                            r.ownerId?._id ||
                            r.ownerId
                        ) === String(userId)
                        &&
                        r.status === "finished"
                    )
                    .reduce(
                        (acc, r) =>
                            acc +
                            Number(
                                r.total || 0
                            ),
                        0
                    );


            document.getElementById(
                "total-income"
            ).textContent =
                `R$ ${income
                    .toFixed(2)
                    .replace(".", ",")}`;


            // ======================================
            // RENDERIZAR ALUGUÉIS
            // ======================================

            if (!mine.length) {

                document.getElementById(
                    "empty-rentals"
                ).style.display =
                    "block";

                return;

            }


            document.getElementById(
                "empty-rentals"
            ).style.display =
                "none";


            mine.forEach(r => {

                rentalsList.innerHTML += `

                    <div class="item-card">

                        <div class="item-image">

                            ${
                                r.productId?.image
                                    ? `<img src="${r.productId.image}" alt="">`
                                    : "📦"
                            }

                        </div>


                        <div class="item-info">

                            <h3>
                                ${
                                    r.productId?.title ||
                                    "Produto"
                                }
                            </h3>


                            <p>

                                ${
                                    new Date(
                                        r.startDate
                                    ).toLocaleDateString(
                                        "pt-BR"
                                    )
                                }

                                até

                                ${
                                    new Date(
                                        r.endDate
                                    ).toLocaleDateString(
                                        "pt-BR"
                                    )
                                }

                            </p>


                            <span class="status progress">

                                ${r.status}

                            </span>

                        </div>


                        <strong>

                            R$
                            ${
                                Number(
                                    r.total || 0
                                )
                                .toFixed(2)
                                .replace(".", ",")
                            }

                        </strong>

                    </div>

                `;

            });


        } catch (err) {

            console.log(
                "Erro ao carregar aluguéis:",
                err
            );

        }

    }


    // ==========================================
    // CPF
    // ==========================================

    function validateCPF(cpfValue) {

        const value =
            cpfValue.replace(
                /\D/g,
                ""
            );


        if (value.length !== 11)
            return false;


        if (/^(\d)\1+$/.test(value))
            return false;


        let sum = 0;


        for (let i = 0; i < 9; i++) {

            sum +=
                Number(value[i]) *
                (10 - i);

        }


        let digit =
            (sum * 10) % 11;


        if (digit === 10)
            digit = 0;


        if (
            digit !==
            Number(value[9])
        ) {

            return false;

        }


        sum = 0;


        for (let i = 0; i < 10; i++) {

            sum +=
                Number(value[i]) *
                (11 - i);

        }


        digit =
            (sum * 10) % 11;


        if (digit === 10)
            digit = 0;


        return (
            digit ===
            Number(value[10])
        );

    }


    // ==========================================
    // MÁSCARA CPF
    // ==========================================

    if (cpf) {

        cpf.addEventListener(
            "input",
            () => {

                let value =
                    cpf.value
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            11
                        );


                value =
                    value.replace(
                        /^(\d{3})(\d)/,
                        "$1.$2"
                    );


                value =
                    value.replace(
                        /^(\d{3})\.(\d{3})(\d)/,
                        "$1.$2.$3"
                    );


                value =
                    value.replace(
                        /^(\d{3})\.(\d{3})\.(\d{3})(\d)/,
                        "$1.$2.$3-$4"
                    );


                cpf.value =
                    value;


                if (
                    value.length <
                    14
                ) {

                    cpfStatus.textContent =
                        "";

                    cpfStatus.className =
                        "";

                }

            }
        );


        cpf.addEventListener(
            "blur",
            () => {

                if (!cpf.value) {

                    cpfStatus.textContent =
                        "";

                    return;

                }


                if (
                    validateCPF(
                        cpf.value
                    )
                ) {

                    cpfStatus.textContent =
                        "✓ CPF válido";

                    cpfStatus.className =
                        "valid";

                } else {

                    cpfStatus.textContent =
                        "✕ CPF inválido";

                    cpfStatus.className =
                        "invalid";

                }

            }
        );

    }


 // ==========================================
// RG
// ==========================================

if (rg) {

    rg.addEventListener(
        "input",
        () => {

            let value =
                rg.value
                    .toUpperCase()
                    .replace(/[^0-9X]/g, "")
                    .slice(0, 9);


            // Impede X no meio do RG
            // O X só pode ser o último caractere
            const xIndex =
                value.indexOf("X");

            if (xIndex !== -1) {

                value =
                    value.slice(0, xIndex)
                    + "X";

            }


            // ======================================
            // MÁSCARA
            // 00.000.000-X
            // ======================================

            if (
                value.length > 2
            ) {

                value =
                    value.replace(
                        /^(\d{2})(\d)/,
                        "$1.$2"
                    );

            }


            if (
                value.length > 6
            ) {

                value =
                    value.replace(
                        /^(\d{2})\.(\d{3})(\d)/,
                        "$1.$2.$3"
                    );

            }


            if (
                value.length > 10
            ) {

                value =
                    value.replace(
                        /^(\d{2})\.(\d{3})\.(\d{3})([0-9X])/,
                        "$1.$2.$3-$4"
                    );

            }


            rg.value =
                value;

        }
    );

}
    // ==========================================
    // CEP
    // ==========================================

    if (cep) {

        cep.addEventListener(
            "input",
            () => {

                let value =
                    cep.value
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            8
                        );


                value =
                    value.replace(
                        /^(\d{5})(\d)/,
                        "$1-$2"
                    );


                cep.value =
                    value;

            }
        );


        cep.addEventListener(
            "blur",
            async () => {

                const value =
                    cep.value.replace(
                        /\D/g,
                        ""
                    );


                if (
                    value.length !==
                    8
                ) {

                    return;

                }


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
                        "Erro ao buscar CEP:",
                        error
                    );

                }

            }
        );

    }


    // ==========================================
    // VERIFICAR CONTA
    // ==========================================

    const verifyButton =
        document.getElementById(
            "verify-account"
        );


    if (verifyButton) {

        verifyButton.onclick =
            async () => {


                if (
                    !validateCPF(
                        cpf.value
                    )
                ) {

                    alert(
                        "CPF inválido."
                    );

                    return;

                }


                if (
                    !rg.value.trim()
                ) {

                    alert(
                        "Informe o RG."
                    );

                    return;

                }


                if (
                    !cep.value.trim()
                ) {

                    alert(
                        "Informe o CEP."
                    );

                    return;

                }


                if (
                    !number.value.trim()
                ) {

                    alert(
                        "Informe o número."
                    );

                    return;

                }


                try {

                    const response =
                        await fetch(
                            `${API}/users/verify/${userId}`,
                            {
                                method:
                                    "PUT",

                                headers: {

                                    "Content-Type":
                                        "application/json",

                                    Authorization:
                                        `Bearer ${token}`

                                },

                                body:
                                    JSON.stringify({

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


                    const data =
                        await response.json();


                    if (!response.ok)
                        throw new Error(
                            data.error ||
                            "Erro ao verificar conta."
                        );


                    alert(
                        "Conta verificada!"
                    );


                    location.reload();


                } catch (err) {

                    alert(
                        err.message
                    );

                }

            };

    }


    // ==========================================
    // NOVO ANÚNCIO
    // ==========================================

    const newAd =
        document.getElementById(
            "new-ad"
        );


    if (newAd) {

        newAd.onclick =
            () => {

                location.href =
                    "novo-anuncio.html";

            };

    }


    const emptyNewAd =
        document.getElementById(
            "empty-new-ad"
        );


    if (emptyNewAd) {

        emptyNewAd.onclick =
            () => {

                location.href =
                    "novo-anuncio.html";

            };

    }


    // ==========================================
    // LOGOUT
    // ==========================================

    const logout =
        document.getElementById(
            "logout"
        );


    if (logout) {

        logout.onclick =
            () => {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "alugase_user"
                );


                window.location.replace(
                    "login.html"
                );

            };

    }


    // ==========================================
    // INICIAR
    // ==========================================

    await loadAds();

    await loadRentals();

});
