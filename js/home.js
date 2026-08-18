
document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.querySelector("#search-input");
    const searchButton = document.querySelector("#search-button");

    const loginButton = document.querySelector(".btn-secondary");
    const announceButtons = document.querySelectorAll(".btn-primary");
    const categoryCards = document.querySelectorAll(".category-card");

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    // ==========================
    // BUSCA -> EXPLORAR
    // ==========================

    function goToExplore() {

        const term = searchInput.value.trim();

        if (term) {

            window.location.href =
                `explorar.html?q=${encodeURIComponent(term)}`;

        } else {

            window.location.href = "explorar.html";

        }

    }

    searchButton?.addEventListener("click", goToExplore);

    searchInput?.addEventListener("keydown", e => {

        if (e.key === "Enter") {

            e.preventDefault();
            goToExplore();

        }

    });

    // ==========================
    // CATEGORIAS
    // ==========================

    categoryCards.forEach(card => {

        card.addEventListener("click", () => {

            const category = card.dataset.category;

            window.location.href =
                `explorar.html?category=${encodeURIComponent(category)}`;

        });

    });

    // ==========================
    // LOGIN
    // ==========================

    if (loginButton) {

        if (user) {

            loginButton.textContent = "Meu Perfil";

            loginButton.onclick = () => {

                window.location.href = "perfil.html";

            };

        } else {

            loginButton.onclick = () => {

                window.location.href = "login.html";

            };

        }

    }

    // ==========================
    // ANUNCIAR
    // ==========================

    announceButtons.forEach(button => {

        if (button.textContent.includes("Anunciar")) {

            button.onclick = () => {

                if (user) {

                    window.location.href = "novo-anuncio.html";

                } else {

                    window.location.href = "login.html";

                }

            };

        }

    });

});