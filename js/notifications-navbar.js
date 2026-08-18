// ==========================================
// ALUGASE — NOTIFICAÇÕES DO NAVBAR
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const API =
        "https://alugase-api.onrender.com/api/notifications";


    // ==========================================
    // ELEMENTOS
    // ==========================================

    const notificationButton =
        document.querySelector("#notification-button");

    const notificationBadge =
        document.querySelector("#notification-badge");


    // Se a página não possui o botão,
    // não faz nada.
    if (!notificationButton) {
        return;
    }


    // ==========================================
    // USUÁRIO
    // ==========================================

    const user =
        JSON.parse(
            localStorage.getItem("alugase_user")
        );


    // ==========================================
    // USUÁRIO NÃO LOGADO
    // ==========================================

    if (!user || !user._id) {

        notificationButton.style.display =
            "none";

        return;

    }


    // ==========================================
    // BUSCAR CONTADOR
    // ==========================================

    async function updateNotificationCount() {

        try {

            const response =
                await fetch(
                    `${API}/user/${user._id}/unread-count`
                );


            if (!response.ok) {

                throw new Error(
                    "Erro ao buscar notificações."
                );

            }


            const data =
                await response.json();


            const count =
                Number(data.count) || 0;


            // ======================================
            // MOSTRAR / ESCONDER BADGE
            // ======================================

            if (count > 0) {

                notificationBadge.textContent =
                    count > 99
                        ? "99+"
                        : count;

                notificationBadge.style.display =
                    "flex";

            } else {

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
    // CLIQUE
    // ==========================================

    notificationButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "notificacoes.html";

        }
    );


    // ==========================================
    // PRIMEIRA BUSCA
    // ==========================================

    updateNotificationCount();


    // ==========================================
    // ATUALIZAR A CADA 5 SEGUNDOS
    // ==========================================

    setInterval(
        updateNotificationCount,
        5000
    );

});