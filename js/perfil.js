// ==========================================
// ALUGASE — PERFIL
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api";

    // ==========================
    // USUÁRIO
    // ==========================

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // ==========================
    // ELEMENTOS
    // ==========================

    const avatar = document.querySelector("#avatar");
    const miniAvatar = document.querySelector("#profile-mini");

    const userName = document.querySelector("#user-name");
    const userLocation = document.querySelector("#user-location");

    const verifiedBadge = document.querySelector("#verified-badge");
    const identityStatus = document.querySelector("#identity-status");
    const cnhStatus = document.querySelector("#cnh-status");

    const adsList = document.querySelector("#ads-list");
    const rentalsList = document.querySelector("#rentals-list");

    const notificationBadge =
        document.querySelector("#notification-badge");

    // ==========================
    // PERFIL
    // ==========================

    userName.textContent = user.name;

    const initials = user.name
        .split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    avatar.textContent = initials;

    if (miniAvatar) {
        miniAvatar.textContent = initials;
    }

    const year = new Date(user.createdAt).getFullYear();

    userLocation.textContent =
        `${user.city} • Membro desde ${year}`;

    if (user.identityVerified) {

        verifiedBadge.textContent = "✓ Verificado";
        verifiedBadge.className = "verified";

        identityStatus.textContent = "Verificado";
        identityStatus.className = "status available";

    } else {

        verifiedBadge.textContent = "Pendente";
        verifiedBadge.className = "pending";

        identityStatus.textContent = "Pendente";
        identityStatus.className = "status pending";

    }

    if (user.driverLicenseVerified) {

        cnhStatus.textContent = "CNH Verificada";
        cnhStatus.className = "status available";

    } else {

        cnhStatus.textContent = "Não enviada";
        cnhStatus.className = "status";

    }

    // ==========================
    // ABAS
    // ==========================

    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".content");

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
                .querySelector(`#${tab.dataset.tab}`)
                .classList.add("active");

        });

    });

    // ==========================
    // BOTÕES
    // ==========================

    document.querySelector("#logout").onclick = () => {

        localStorage.removeItem("alugase_user");

        window.location.href = "index.html";

    };

    document.querySelector("#new-ad").onclick = () => {

        window.location.href = "novo-anuncio.html";

    };

    document
        .querySelector("#empty-new-ad")
        ?.addEventListener("click", () => {

            window.location.href = "novo-anuncio.html";

        });

    // ==========================
    // ANÚNCIOS
    // ==========================

    async function loadAds() {

        try {

            const response = await fetch(
                `${API}/products/user/${user._id}`
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
                        ${product.image || "📦"}
                    </div>

                    <div class="item-info">

                        <h3>${product.title}</h3>

                        <p>R$ ${product.pricePerDay} / dia</p>

                        <span class="status ${product.status === "available"
                        ? "available"
                        : "rented"}">

                            ${product.status === "available"
                        ? "Disponível"
                        : "Alugado"}

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

            console.error(err);

        }

    }

    // ==========================
    // ALUGUÉIS
    // ==========================

    async function loadRentals() {

        try {

            const response = await fetch(
                `${API}/rentals/user/${user._id}`
            );

            const rentals = await response.json();

            rentalsList.innerHTML = "";

            document.querySelector("#total-rentals").textContent =
                rentals.filter(r =>
                    String(r.renterId) === user._id
                ).length;

            const income = rentals
                .filter(r =>
                    String(r.ownerId) === user._id &&
                    r.status === "finished"
                )
                .reduce((acc, r) => acc + r.total, 0);

            document.querySelector("#total-income").textContent =
                `R$ ${income}`;

            const pending = rentals.filter(r =>
                String(r.ownerId) === user._id &&
                r.status === "pending"
            ).length;

            if (notificationBadge && pending > 0) {

                notificationBadge.style.display = "flex";
                notificationBadge.textContent = pending;

            }

            if (rentals.length === 0) {

                document.querySelector("#empty-rentals").style.display = "block";
                return;

            }

            document.querySelector("#empty-rentals").style.display = "none";

            rentals.forEach(rental => {

                const product = rental.productId;

                rentalsList.innerHTML += `
                <div class="item-card">

                    <div class="item-image">
                        ${product?.image || "📦"}
                    </div>

                    <div class="item-info">

                        <h3>${product?.title || "Produto"}</h3>

                        <p>
                            ${new Date(rental.startDate).toLocaleDateString("pt-BR")}
                            até
                            ${new Date(rental.endDate).toLocaleDateString("pt-BR")}
                        </p>

                        <span class="status progress">
                            ${rental.status}
                        </span>

                    </div>

                    <strong>R$ ${rental.total}</strong>

                </div>
                `;

            });

        } catch (err) {

            console.error(err);

        }

    }

    // ==========================
    // CPF
    // ==========================

    const cpf = document.querySelector("#cpf");
    const cpfStatus = document.querySelector("#cpf-status");

    function validateCPF(number) {

        number = number.replace(/\D/g, "");

        if (number.length !== 11) return false;

        if (/^(\d)\1+$/.test(number)) return false;

        let sum = 0;

        for (let i = 0; i < 9; i++)
            sum += Number(number[i]) * (10 - i);

        let digit = (sum * 10) % 11;

        if (digit === 10) digit = 0;

        if (digit !== Number(number[9])) return false;

        sum = 0;

        for (let i = 0; i < 10; i++)
            sum += Number(number[i]) * (11 - i);

        digit = (sum * 10) % 11;

        if (digit === 10) digit = 0;

        return digit === Number(number[10]);

    }

    cpf?.addEventListener("input", () => {

        let value = cpf.value
            .replace(/\D/g, "")
            .slice(0, 11);

        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
        value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");

        cpf.value = value;

    });

    cpf?.addEventListener("blur", () => {

        if (validateCPF(cpf.value)) {

            cpfStatus.textContent = "CPF válido";
            cpfStatus.className = "valid";

        } else {

            cpfStatus.textContent = "CPF inválido";
            cpfStatus.className = "invalid";

        }

    });

    // ==========================
    // RG / CNH / CEP
    // ==========================

    const rg = document.querySelector("#rg");
    const cnh = document.querySelector("#cnh");
    const cep = document.querySelector("#cep");

    const number = document.querySelector("#number");
    const street = document.querySelector("#street");
    const district = document.querySelector("#district");
    const city = document.querySelector("#city");
    const state = document.querySelector("#state");

    rg?.addEventListener("input", () => {

        let value = rg.value
            .toUpperCase()
            .replace(/[^0-9X]/g, "");

        if (value.includes("X"))
            value = value.replace(/X/g, "") + "X";

        const hasX = value.endsWith("X");

        const digits = value.replace("X", "").slice(0, 8);

        let formatted = digits;

        if (digits.length > 2)
            formatted = formatted.replace(/(\d{2})(\d+)/, "$1.$2");

        if (digits.length > 5)
            formatted = formatted.replace(/(\d{2})\.(\d{3})(\d+)/, "$1.$2.$3");

        if (hasX)
            formatted += "-X";
        else if (digits.length === 8)
            formatted += "-";

        rg.value = formatted;

    });

    cnh?.addEventListener("input", () => {

        cnh.value = cnh.value
            .replace(/\D/g, "")
            .slice(0, 11);

    });

    cep?.addEventListener("input", () => {

        let value = cep.value
            .replace(/\D/g, "")
            .slice(0, 8);

        value = value.replace(/(\d{5})(\d)/, "$1-$2");

        cep.value = value;

    });

    cep?.addEventListener("blur", async () => {

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

    // ==========================
    // VERIFICAÇÃO
    // ==========================

    document
        .querySelector("#verify-account")
        ?.addEventListener("click", async () => {

            if (!validateCPF(cpf.value)) {

                alert("CPF inválido.");
                return;

            }

            const body = {

                cpf: cpf.value,
                rg: rg.value,
                cnh: cnh.value,

                cep: cep.value,
                number: number.value,

                street: street.value,
                district: district.value,
                city: city.value,
                state: state.value

            };

            try {

                const response = await fetch(
                    `${API}/users/verify/${user._id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(body)

                    }
                );

                const updated = await response.json();

                localStorage.setItem(
                    "alugase_user",
                    JSON.stringify(updated)
                );

                alert("Documentos enviados com sucesso!");

                location.reload();

            } catch {

                alert("Erro ao enviar documentos.");

            }

        });

    // ==========================
    // INICIAR
    // ==========================

    await loadAds();
    await loadRentals();

});
