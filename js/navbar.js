/* ==========================================
   ALUGASE — NAVBAR JS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================
       ELEMENTOS
    ========================================== */

    const chatButton = document.getElementById("chat-button");
    const notificationButton = document.getElementById("notification-button");

    const loginButton = document.getElementById("login-button");
    const announceButton = document.getElementById("announce-button");

    const chatBadge = document.getElementById("chat-badge");
    const notificationBadge = document.getElementById("notification-badge");


    /* ==========================================
       CHAT
    ========================================== */

    if (chatButton) {

        chatButton.addEventListener("click", () => {

            window.location.href = "chat.html";

        });

    }


    /* ==========================================
       NOTIFICAÇÕES
    ========================================== */

    if (notificationButton) {

        notificationButton.addEventListener("click", () => {

            window.location.href = "notificacoes.html";

        });

    }


    /* ==========================================
       LOGIN
    ========================================== */

    if (loginButton) {

        loginButton.addEventListener("click", () => {

            window.location.href = "login.html";

        });

    }


    /* ==========================================
       ANUNCIAR
    ========================================== */

    if (announceButton) {

        announceButton.addEventListener("click", () => {

            window.location.href = "anunciar.html";

        });

    }


    /* ==========================================
       BADGE DO CHAT
    ========================================== */

    function atualizarChatBadge(quantidade) {

        if (!chatBadge) return;


        if (quantidade > 0) {

            chatBadge.textContent =
                quantidade > 99
                    ? "99+"
                    : quantidade;

            chatBadge.style.display = "flex";

        } else {

            chatBadge.textContent = "";

            chatBadge.style.display = "none";

        }

    }


    /* ==========================================
       BADGE DAS NOTIFICAÇÕES
    ========================================== */

    function atualizarNotificationBadge(quantidade) {

        if (!notificationBadge) return;


        if (quantidade > 0) {

            notificationBadge.textContent =
                quantidade > 99
                    ? "99+"
                    : quantidade;

            notificationBadge.style.display = "flex";

        } else {

            notificationBadge.textContent = "";

            notificationBadge.style.display = "none";

        }

    }


    /* ==========================================
       ESTADO INICIAL
    ========================================== */

    atualizarChatBadge(0);

    atualizarNotificationBadge(0);


    /* ==========================================
       FUNÇÕES GLOBAIS
       
       Podemos chamar essas funções futuramente
       quando o backend estiver conectado.
    ========================================== */

    window.AlugaseNavbar = {

        atualizarChatBadge,
        atualizarNotificationBadge

    };

});