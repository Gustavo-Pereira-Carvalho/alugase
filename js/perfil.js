// ==========================================
// ALUGASE - PERFIL JWT
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api";
    const token = localStorage.getItem("token");

    if (!token) {
        location.href = "login.html";
        return;
    }

    let user;

    // ---------------- BUSCAR USUÁRIO ----------------

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

    // ---------------- ELEMENTOS ----------------

    const avatar = document.getElementById("avatar");
    const name = document.getElementById("user-name");
    const locationText = document.getElementById("user-location");

    const adsList = document.getElementById("ads-list");
    const rentalsList = document.getElementById("rentals-list");

    const badge = document.getElementById("notification-badge");

    // ---------------- PERFIL ----------------

    function initials(text) {

        return text
            .split(" ")
            .map(i => i[0])
            .slice(0,2)
            .join("")
            .toUpperCase();

    }

    function renderAvatar(){

        avatar.innerHTML = "";

        if(user.profileImage){

            avatar.innerHTML =
            `<img src="${user.profileImage}" alt="">`;

        }else{

            avatar.textContent = initials(user.name);

        }

    }

    renderAvatar();

    name.textContent = user.name;

    locationText.textContent =
    `${user.city} • Membro desde ${
        new Date(user.createdAt).getFullYear()
    }`;

    // ---------------- FOTO ----------------

    document
    .getElementById("profile-image-input")
    .addEventListener("change", async e=>{

        const file = e.target.files[0];

        if(!file) return;

        const form = new FormData();
        form.append("image", file);

        const response = await fetch(
            `${API}/users/profile-image/${userId}`,
            {
                method:"PUT",
                headers:{
                    Authorization:`Bearer ${token}`
                },
                body:form
            }
        );

        const data = await response.json();

        if(!response.ok){
            alert(data.error);
            return;
        }

        user = data;
        renderAvatar();

    });

    // ---------------- ABAS ----------------

    document.querySelectorAll(".tab").forEach(tab=>{

        tab.onclick=()=>{

            document
            .querySelectorAll(".tab")
            .forEach(t=>t.classList.remove("active"));

            document
            .querySelectorAll(".content")
            .forEach(c=>c.classList.remove("active"));

            tab.classList.add("active");

            document
            .getElementById(tab.dataset.tab)
            .classList.add("active");

        };

    });

    // ---------------- ANÚNCIOS ----------------

    async function loadAds(){

        const response = await fetch(
            `${API}/products/user/${userId}`
        );

        const products = await response.json();

        document.getElementById("total-ads").textContent =
        products.length;

        if(products.length===0){
            document.getElementById("empty-ads").style.display="block";
            return;
        }

        adsList.innerHTML="";

        products.forEach(p=>{

            adsList.innerHTML += `
            <div class="item-card">

                <div class="item-image">
                    ${
                        p.image
                        ? `<img src="${p.image}">`
                        : "📦"
                    }
                </div>

                <div class="item-info">
                    <h3>${p.title}</h3>
                    <p>R$ ${p.pricePerDay}/dia</p>
                </div>

                <button
                    class="btn-secondary"
                    onclick="location.href='editar-anuncio.html?id=${p._id}'">
                    Editar
                </button>

            </div>
            `;

        });

    }

    // ---------------- ALUGUÉIS ----------------

    async function loadRentals(){

        const response = await fetch(
            `${API}/rentals/user/${userId}`
        );

        const rentals = await response.json();

        const mine = rentals.filter(r=>
            String(r.renterId?._id || r.renterId)===String(userId)
        );

        document.getElementById("total-rentals").textContent =
        mine.length;

        rentalsList.innerHTML="";

        if(mine.length===0){
            document.getElementById("empty-rentals").style.display="block";
            return;
        }

        mine.forEach(r=>{

            rentalsList.innerHTML += `
            <div class="item-card">

                <div class="item-image">
                    ${
                        r.productId?.image
                        ? `<img src="${r.productId.image}">`
                        : "📦"
                    }
                </div>

                <div class="item-info">
                    <h3>${r.productId?.title}</h3>
                    <p>${new Date(r.startDate).toLocaleDateString("pt-BR")}</p>
                </div>

                <strong>
                    R$ ${Number(r.total).toFixed(2)}
                </strong>

            </div>
            `;

        });

    }

    // ---------------- CEP ----------------

    cep.addEventListener("blur", async ()=>{

        const value = cep.value.replace(/\D/g,"");

        if(value.length!==8) return;

        const response = await fetch(
            `https://viacep.com.br/ws/${value}/json/`
        );

        const data = await response.json();

        street.value = data.logradouro || "";
        district.value = data.bairro || "";
        city.value = data.localidade || "";
        state.value = data.uf || "";

    });

    // ---------------- VERIFICAR ----------------

    document
    .getElementById("verify-account")
    .onclick = async ()=>{

        const response = await fetch(
            `${API}/users/verify/${userId}`,
            {
                method:"PUT",
                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${token}`
                },
                body:JSON.stringify({
                    cpf:cpf.value,
                    rg:rg.value,
                    cnh:cnh.value,
                    cep:cep.value,
                    number:number.value,
                    street:street.value,
                    district:district.value,
                    city:city.value,
                    state:state.value
                })
            }
        );

        const data = await response.json();

        if(!response.ok){
            alert(data.error);
            return;
        }

        alert("Conta verificada!");
        location.reload();

    };

    // ---------------- BOTÕES ----------------

    document.getElementById("new-ad").onclick = ()=>{
        location.href="novo-anuncio.html";
    };

    document.getElementById("empty-new-ad").onclick = ()=>{
        location.href="novo-anuncio.html";
    };

    document.getElementById("logout").onclick = ()=>{

        localStorage.removeItem("token");
        localStorage.removeItem("alugase_user");

        location.href="login.html";

    };

    // ---------------- INICIAR ----------------

    await loadAds();
    await loadRentals();

});
