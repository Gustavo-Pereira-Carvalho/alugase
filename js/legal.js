// ==========================================
// ALUGASE — PÁGINAS LEGAIS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    const button = document.querySelector("#profile-btn");

    if (!button) return;

    if (user) {

        button.textContent = "Meu Perfil";
        button.href = "perfil.html";

    } else {

        button.textContent = "Entrar";
        button.href = "login.html";

    }

});