// ==========================================
// ALUGASE — PERFIL (JWT)
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api";
    const token = localStorage.getItem("token");

    if (!token) {
        location.href = "login.html";
        return;
    }

    let user;

    // ==========================================
    // BUSCAR USUÁRIO
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

        localStorage.clear();
        location.href = "login.html";
        return;

    }

    const userId = user._id || user.id;

    // ==========================================
    // ELEMENTOS
    // ==========================================

    const avatar = document.getElementById("avatar");
    const profileImageInput = document.getElementById("profile-image-input");

    const userName = document.getElementById("user-name");
    const userLocation = document.getElementById("user-location");

    const verifiedBadge = document.getElementById("verified-badge");
    const identityStatus = document.getElementById("identity-status");
    const cnhStatus = document.getElementById("cnh-status");

    const adsList = document.getElementById("ads-list");
    const rentalsList = document.getElementById("rentals-list");
    const notificationBadge = document.getElementById("notification-badge");

    const cpf = document.getElementById("cpf");
    const rg = document.getElementById("rg");
    const cnh = document.getElementById("cnh");

    const cep = document.getElementById("cep");
    const number = document.getElementById("number");
    const street = document.getElementById("street");
    const district = document.getElementById("district");
    const city = document.getElementById("city");
    const state = document.getElementById("state");

    const cpfStatus = document.getElementById("cpf-status");

    // ==========================================
    // INICIAIS
    // ==========================================

    function initials(name) {

        if (!name) return "U";

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

        avatar.innerHTML = "";

        if (user.profileImage) {

            const img = document.createElement("img");

            img.src = user.profileImage;
            img.alt = user.name;

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

    // Preencher formulário

    cpf.value = user.cpf || "";
    rg.value = user.rg || "";
    cnh.value = user.cnh || "";

    if (user.address) {

        cep.value = user.address.cep || "";
        number.value = user.address.number || "";
        street.value = user.address.street || "";
        district.value = user.address.district || "";
        city.value = user.address.city || "";
        state.value = user.address.state || "";

    }

    // ==========================================
    // FOTO
    // ==========================================

    profileImageInput.addEventListener("change", async e => {

        const file = e.target.files[0];
        if (!file) return;

        const form = new FormData();
        form.append("image", file);

        try {

            const response = await fetch(
                `${API}/users/profile-image/${userId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: form
                }
            );

            const data = await response.json();

            if (!response.ok)
                throw new Error(data.error);

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

    document.querySelectorAll(".tab").forEach(tab => {

        tab.onclick = () => {

            document.querySelectorAll(".tab")
                .forEach(t => t.classList.remove("active"));

            document.querySelectorAll(".content")
                .forEach(c => c.classList.remove("active"));

            tab.classList.add("active");

            document
                .getElementById(tab.dataset.tab)
                .classList.add("active");

        };

    });

    // ==========================================
    // ANÚNCIOS
    // ==========================================

    async function loadAds() {

        try {

            const response = await fetch(
                `${API}/products/user/${userId}`
            );

            const products = await response.json();

            document.getElementById("total-ads").textContent =
                products.length;

            adsList.innerHTML = "";

            if (products.length === 0) {

                document.getElementById("empty-ads").style.display = "block";
                return;

            }

            document.getElementById("empty-ads").style.display = "none";

            products.forEach(p => {

                adsList.innerHTML += `
                <div class="item-card">

                    <div class="item-image">
                        ${p.image
                            ? `<img src="${p.image}" alt="">`
                            : "📦"}
                    </div>

                    <div class="item-info">
                        <h3>${p.title}</h3>
                        <p>R$ ${p.pricePerDay} / dia</p>

                        <span class="status ${
                            p.status === "available"
                                ? "available"
                                : "rented"
                        }">
                            ${
                                p.status === "available"
                                    ? "Disponível"
                                    : "Alugado"
                            }
                        </span>

                    </div>

                    <button
                        class="btn-secondary"
                        onclick="location.href='editar-anuncio.html?id=${p._id}'">

                        Editar

                    </button>

                </div>
                `;

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

            document.getElementById("total-rentals").textContent =
                mine.length;

            const income = rentals
                .filter(r =>
                    String(r.ownerId?._id || r.ownerId) === String(userId)
                    && r.status === "finished"
                )
                .reduce((acc, r) => acc + Number(r.total || 0), 0);

            document.getElementById("total-income").textContent =
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

                document.getElementById("empty-rentals").style.display = "block";
                return;

            }

            document.getElementById("empty-rentals").style.display = "none";

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

                        <h3>${r.productId?.title || "Produto"}</h3>

                        <p>
                            ${new Date(r.startDate).toLocaleDateString("pt-BR")}
                            até
                            ${new Date(r.endDate).toLocaleDateString("pt-BR")}
                        </p>

                        <span class="status progress">
                            ${r.status}
                        </span>

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
    // CPF
    // ==========================================

    function validateCPF(number) {

        number = number.replace(/\D/g, "");

        if (number.length !== 11) return false;
        if (/^(\d)\1+$/.test(number)) return false;

        let sum = 0;

        for (let i = 0; i < 9; i++) {
            sum += Number(number[i]) * (10 - i);
        }

        let digit = (sum * 10) % 11;
        if (digit === 10) digit = 0;

        if (digit !== Number(number[9])) return false;

        sum = 0;

        for (let i = 0; i < 10; i++) {
            sum += Number(number[i]) * (11 - i);
        }

        digit = (sum * 10) % 11;
        if (digit === 10) digit = 0;

        return digit === Number(number[10]);

    }

    cpf.addEventListener("input", () => {

        let value = cpf.value
            .replace(/\D/g, "")
            .slice(0, 11);

        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
        value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");

        cpf.value = value;

    });

    cpf.addEventListener("blur", () => {

        if (validateCPF(cpf.value)) {

            cpfStatus.textContent = "CPF válido";
            cpfStatus.className = "valid";

        } else {

            cpfStatus.textContent = "CPF inválido";
            cpfStatus.className = "invalid";

        }

    });

    // ==========================================
    // CEP
    // ==========================================

    cep.addEventListener("blur", async () => {

        const value = cep.value.replace(/\D/g, "");

        if (value.length !== 8) return;

        const response = await fetch(
            `https://viacep.com.br/ws/${value}/json/`
        );

        const data = await response.json();

        if (data.erro) return;

        street.value = data.logradouro || "";
        district.value = data.bairro || "";
        city.value = data.localidade || "";
        state.value = data.uf || "";

    });

    // ==========================================
    // VERIFICAR CONTA
    // ==========================================

    document.getElementById("verify-account").onclick = async () => {

        if (!validateCPF(cpf.value)) {
            alert("CPF inválido.");
            return;
        }

        if (!rg.value.trim()) {
            alert("Informe o RG.");
            return;
        }

        if (!cep.value.trim()) {
            alert("Informe o CEP.");
            return;
        }

        if (!number.value.trim()) {
            alert("Informe o número.");
            return;
        }

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

            if (!response.ok)
                throw new Error(data.error);

            alert("Conta verificada!");

            location.reload();

        } catch (err) {

            alert(err.message);

        }

    };

    // ==========================================
    // BOTÕES
    // ==========================================

    document.getElementById("new-ad").onclick = () => {
        location.href = "novo-anuncio.html";
    };

    document.getElementById("empty-new-ad").onclick = () => {
        location.href = "novo-anuncio.html";
    };

    document.getElementById("logout").onclick = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("alugase_user");

        location.href = "login.html";

    };

    // ==========================================
    // INICIAR
    // ==========================================

    await loadAds();
    await loadRentals();

});
