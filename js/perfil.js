// ==========================================
// ALUGASE — PERFIL (JWT)
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api";
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    let user;

    // ==========================================
    // BUSCAR USUÁRIO LOGADO
    // ==========================================

    try {

        const response = await fetch(`${API}/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error();

        user = await response.json();

        localStorage.setItem(
            "alugase_user",
            JSON.stringify(user)
        );

    } catch {

        localStorage.removeItem("token");
        localStorage.removeItem("alugase_user");

        window.location.href = "login.html";
        return;

    }

    const userId = user._id || user.id;

    // ==========================================
    // ELEMENTOS
    // ==========================================

    const avatar = document.querySelector("#avatar");
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
    // INICIAIS
    // ==========================================

    const initials = (name) => {
        if (!name) return "U";

        return name
            .trim()
            .split(" ")
            .map(n => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    // ==========================================
    // AVATAR
    // ==========================================

    function renderAvatar() {

        avatar.innerHTML = "";

        if (user.profileImage) {

            const img = document.createElement("img");

            img.src = user.profileImage;
            img.alt = user.name;

            img.onerror = () => {
                avatar.textContent = initials(user.name);
            };

            avatar.appendChild(img);

        } else {

            avatar.textContent = initials(user.name);

        }

    }

    renderAvatar();

    // ==========================================
    // DADOS
    // ==========================================

    userName.textContent = user.name;

    const year = user.createdAt
        ? new Date(user.createdAt).getFullYear()
        : 2026;

    userLocation.textContent =
        `${user.city} • Membro desde ${year}`;

    if (user.identityVerified) {

        verifiedBadge.textContent = "✓ Verificado";
        verifiedBadge.className = "verified";

        identityStatus.textContent = "Verificado";
        identityStatus.className = "status available";

    }

    if (user.driverLicenseVerified) {

        cnhStatus.textContent = "CNH Verificada";
        cnhStatus.className = "status available";

    }

    // ==========================================
    // FOTO
    // ==========================================

    profileImageInput.addEventListener("change", async () => {

        const file = profileImageInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {

            const response = await fetch(
                `${API}/users/profile-image/${userId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) throw new Error(data.error);

            user = data;

            localStorage.setItem(
                "alugase_user",
                JSON.stringify(user)
            );

            renderAvatar();

            alert("Foto atualizada!");

        } catch (err) {

            alert(err.message);

        }

    });

    // ==========================================
    // ABAS
    // ==========================================

    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".content");

    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            tab.classList.add("active");

            document
                .querySelector(`#${tab.dataset.tab}`)
                .classList.add("active");

        });

    });

    // ==========================================
    // BOTÕES
    // ==========================================

    document.querySelector("#new-ad").onclick = () => {
        window.location.href = "novo-anuncio.html";
    };

    document.querySelector("#empty-new-ad").onclick = () => {
        window.location.href = "novo-anuncio.html";
    };

    // ==========================================
    // ANÚNCIOS
    // ==========================================

    async function loadAds() {

        try {

            const response = await fetch(
                `${API}/products/user/${userId}`
            );

            const products = await response.json();

            adsList.innerHTML = "";

            document.querySelector("#total-ads").textContent =
                products.length;

            if (products.length === 0) {

                document.querySelector("#empty-ads").style.display = "block";
                return;

            }

            document.querySelector("#empty-ads").style.display = "none";

            products.forEach(product => {

                adsList.innerHTML += `
                <div class="item-card">

                    <div class="item-image">
                        ${product.image
                            ? `<img src="${product.image}">`
                            : "📦"}
                    </div>

                    <div class="item-info">
                        <h3>${product.title}</h3>
                        <p>R$ ${product.pricePerDay}/dia</p>
                    </div>

                    <button
                        class="btn-secondary edit-ad"
                        data-id="${product._id}">
                        Editar
                    </button>

                </div>
                `;

            });

            document.querySelectorAll(".edit-ad")
                .forEach(btn => {

                    btn.onclick = () => {
                        window.location.href =
                            `editar-anuncio.html?id=${btn.dataset.id}`;
                    };

                });

        } catch (err) {

            console.log(err);

        }

    }

    // ==========================================
    // ALUGUÉIS
    // ==========================================

    async function loadRentals() {

        try {

            const response = await fetch(
                `${API}/rentals/user/${userId}`
            );

            const rentals = await response.json();

            rentalsList.innerHTML = "";

            const mine = rentals.filter(r =>
                String(r.renterId?._id || r.renterId) === String(userId)
            );

            document.querySelector("#total-rentals").textContent =
                mine.length;

            const income = rentals
                .filter(r =>
                    String(r.ownerId?._id || r.ownerId) === String(userId)
                    && r.status === "finished"
                )
                .reduce((acc, r) => acc + Number(r.total || 0), 0);

            document.querySelector("#total-income").textContent =
                `R$ ${income.toFixed(2).replace(".", ",")}`;

            const pending = rentals.filter(r =>
                String(r.ownerId?._id || r.ownerId) === String(userId)
                && r.status === "pending"
            ).length;

            if (pending > 0) {
                notificationBadge.style.display = "flex";
                notificationBadge.textContent = pending;
            } else {
                notificationBadge.style.display = "none";
            }

            if (mine.length === 0) {
                document.querySelector("#empty-rentals").style.display = "block";
                return;
            }

            document.querySelector("#empty-rentals").style.display = "none";

            mine.forEach(r => {

                rentalsList.innerHTML += `
                <div class="item-card">

                    <div class="item-image">
                        ${r.productId?.image
                            ? `<img src="${r.productId.image}">`
                            : "📦"}
                    </div>

                    <div class="item-info">
                        <h3>${r.productId?.title || "Produto"}</h3>
                        <p>${new Date(r.startDate).toLocaleDateString("pt-BR")} até ${new Date(r.endDate).toLocaleDateString("pt-BR")}</p>
                    </div>

                    <strong>
                        R$ ${Number(r.total).toFixed(2).replace(".", ",")}
                    </strong>

                </div>
                `;

            });

        } catch (err) {

            console.log(err);

        }

    }

    // ==========================================
    // CEP
    // ==========================================

    const cep = document.querySelector("#cep");

    cep.addEventListener("blur", async () => {

        const value = cep.value.replace(/\D/g, "");

        if (value.length !== 8) return;

        const response = await fetch(
            `https://viacep.com.br/ws/${value}/json/`
        );

        const data = await response.json();

        if (data.erro) return;

        street.value = data.logradouro;
        district.value = data.bairro;
        city.value = data.localidade;
        state.value = data.uf;

    });

    // ==========================================
    // VERIFICAÇÃO
    // ==========================================

    document.querySelector("#verify-account")
        .addEventListener("click", async () => {

            try {

                const response = await fetch(
                    `${API}/users/verify/${userId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            cpf: cpf.value,
                            rg: rg.value,
                            cnh: cnh.value,
                            cep: cep.value,
                            number: number.value,
                            street: street.value,
                            district: district.value,
                            city: city.value,
                            state: state.value
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) throw new Error(data.error);

                user = data;

                localStorage.setItem(
                    "alugase_user",
                    JSON.stringify(user)
                );

                alert("Documentos enviados!");
                location.reload();

            } catch (err) {

                alert(err.message);

            }

        });

    // ==========================================
    // INICIAR
    // ==========================================

    await loadAds();
    await loadRentals();

});
