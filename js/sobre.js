// ==========================================
// ALUGASE — SOBRE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // Atualiza automaticamente o botão da navbar

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    const profileButton = document.querySelector(".nav-buttons a");

    if (user && profileButton) {

        profileButton.textContent = "Meu Perfil";
        profileButton.href = "perfil.html";

    } else if (profileButton) {

        profileButton.textContent = "Entrar";
        profileButton.href = "login.html";

    }

});