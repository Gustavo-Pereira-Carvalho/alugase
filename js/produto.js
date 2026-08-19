// ==========================================
// ALUGASE — PRODUTO
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api/products";

    const user = JSON.parse(localStorage.getItem("alugase_user"));
    const productId = new URLSearchParams(location.search).get("id");

    if (!productId) {
        location.href = "index.html";
        return;
    }

    const categoryLabel = document.querySelector(".product-category");
    const categoryLink = document.querySelector(".product-category-link");
    const breadcrumbTitle = document.querySelector("#breadcrumb-title");

    const title = document.querySelector("#product-title");
    const mainImage = document.querySelector("#main-image");
    const thumbnails = document.querySelector(".product-thumbnails");

    const locationText = document.querySelector(".product-location");
    const description = document.querySelector(".product-description p");

    const price = document.querySelector(".pricing strong");
    const deliveryLabel = document.querySelector("#delivery-label");
    const depositTotal = document.querySelector("#deposit-total");

    const ownerName = document.querySelector("#owner-name");
    const ownerRating = document.querySelector("#owner-rating");
    const ownerReviews = document.querySelector("#owner-reviews");
    const ownerRentals = document.querySelector("#owner-rentals");
    const ownerYears = document.querySelector("#owner-years");

    const startDate = document.querySelector("#start-date");
    const endDate = document.querySelector("#end-date");

    const dailyTotal = document.querySelector("#daily-total");
    const deliveryTotal = document.querySelector("#delivery-total");
    const rentalTotal = document.querySelector("#rental-total");

    const rentalButton = document.querySelector("#rental-button");

    let product;

    // ==========================
    // CARREGAR
    // ==========================

    async function loadProduct(){

        const res = await fetch(`${API}/${productId}`);

        if(!res.ok){
            alert("Produto não encontrado.");
            location.href = "explorar.html";
            return;
        }

        product = await res.json();

        fillScreen();
    }

    // ==========================
    // GALERIA
    // ==========================

    function changeImage(src){

        mainImage.innerHTML = `<img src="${src}" alt="${product.title}">`;

        document.querySelectorAll(".thumbnail")
            .forEach(t=>t.classList.remove("active"));

    }

    function renderGallery(){

        thumbnails.innerHTML="";

        if(product.images && product.images.length){

            changeImage(product.images[0]);

            product.images.forEach((img,index)=>{

                const btn=document.createElement("button");

                btn.className=`thumbnail ${index===0?"active":""}`;

                btn.innerHTML=`<img src="${img}" alt="">`;

                btn.onclick=()=>{

                    changeImage(img);

                    document.querySelectorAll(".thumbnail")
                        .forEach(t=>t.classList.remove("active"));

                    btn.classList.add("active");
                };

                thumbnails.appendChild(btn);

            });

        }else{

            mainImage.innerHTML=`<div class="emoji-image">${product.image || "📦"}</div>`;

            thumbnails.innerHTML=`
                <button class="thumbnail emoji active">
                    ${product.image || "📦"}
                </button>
            `;
        }
    }

    // ==========================
    // PREENCHER
    // ==========================

    function fillScreen(){

        document.title=`${product.title} | ALUGASE`;

        categoryLabel.textContent=product.category.toUpperCase();
        categoryLink.textContent=product.category;
        breadcrumbTitle.textContent=product.title;

        title.textContent=product.title;

        renderGallery();

        locationText.textContent=`📍 ${product.city}`;
        description.textContent=product.description;

        price.textContent=`R$ ${product.pricePerDay}`;

        deliveryLabel.textContent=
            product.delivery
                ? `+ R$ ${product.deliveryPrice}`
                : "Somente retirada";

        depositTotal.textContent=`R$ ${product.deposit}`;

        ownerName.textContent=product.ownerName || "Usuário";

        ownerRating.textContent=product.rating || "5.0";
        ownerReviews.textContent=product.reviews || "0";
        ownerRentals.textContent="1";

        ownerYears.textContent=new Date(product.createdAt)
            .getFullYear();

        const today=new Date().toISOString().split("T")[0];

        startDate.min=today;
        endDate.min=today;

        startDate.value=today;
        endDate.value=today;

        updateTotals();
    }

    // ==========================
    // CÁLCULOS
    // ==========================

    function getDays(){

        const start=new Date(startDate.value);
        const end=new Date(endDate.value);

        const diff=Math.ceil((end-start)/86400000)+1;

        return diff>0?diff:1;
    }

    function updateTotals(){

        const days=getDays();

        const deliverySelected=
            document.querySelector(
                'input[name="delivery"]:checked'
            ).value==="delivery";

        const deliveryValue=
            deliverySelected && product.delivery
                ? product.deliveryPrice
                : 0;

        const daily=days*product.pricePerDay;

        dailyTotal.textContent=`R$ ${daily}`;
        deliveryTotal.textContent=`R$ ${deliveryValue}`;

        rentalTotal.textContent=
            `R$ ${daily+deliveryValue+product.deposit}`;
    }

    startDate.onchange=()=>{

        endDate.min=startDate.value;

        if(endDate.value<startDate.value)
            endDate.value=startDate.value;

        updateTotals();
    };

    endDate.onchange=updateTotals;

    document.querySelectorAll('input[name="delivery"]')
        .forEach(r=>r.onchange=updateTotals);

    // ==========================
    // ALUGAR
    // ==========================

    rentalButton.onclick=()=>{

        if(!user){
            location.href="login.html";
            return;
        }

        location.href=`reserva.html?id=${product._id}`;
    };

    await loadProduct();

});
