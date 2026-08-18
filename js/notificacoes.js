// ==========================================
// ALUGASE — NOTIFICAÇÕES
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const API =
            "https://alugase-api.onrender.com/api/notifications";


        // ======================================
        // USUÁRIO
        // ======================================

        const user =
            JSON.parse(
                localStorage.getItem(
                    "alugase_user"
                )
            );


        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        const list =
            document.querySelector(
                "#notifications-list"
            );


        const empty =
            document.querySelector(
                "#empty-state"
            );


        const readAllButton =
            document.querySelector(
                "#read-all"
            );


        let notifications = [];


        // ======================================
        // FORMATAR TEMPO
        // ======================================

        function formatTime(date) {

            const now =
                new Date();


            const notificationDate =
                new Date(date);


            const diff =
                Math.floor(
                    (
                        now -
                        notificationDate
                    ) / 1000
                );


            if (diff < 60) {

                return "Agora";

            }


            const minutes =
                Math.floor(
                    diff / 60
                );


            if (minutes < 60) {

                return (
                    minutes === 1
                        ? "1 minuto atrás"
                        : `${minutes} minutos atrás`
                );

            }


            const hours =
                Math.floor(
                    minutes / 60
                );


            if (hours < 24) {

                return (
                    hours === 1
                        ? "1 hora atrás"
                        : `${hours} horas atrás`
                );

            }


            const days =
                Math.floor(
                    hours / 24
                );


            if (days < 7) {

                return (
                    days === 1
                        ? "Ontem"
                        : `${days} dias atrás`
                );

            }


            return notificationDate
                .toLocaleDateString(
                    "pt-BR"
                );

        }


        // ======================================
        // BUSCAR NOTIFICAÇÕES
        // ======================================

        async function loadNotifications() {

            try {

                const response =
                    await fetch(
                        `${API}/user/${user._id}`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Erro ao buscar notificações."
                    );

                }


                notifications =
                    await response.json();


                render();


            } catch (error) {

                console.error(
                    "ERRO NOTIFICAÇÕES:",
                    error
                );

            }

        }


        // ======================================
        // RENDERIZAR
        // ======================================

        function render() {

            list.innerHTML = "";


            if (
                !notifications.length
            ) {

                empty.style.display =
                    "block";

                return;

            }


            empty.style.display =
                "none";


            notifications.forEach(
                notification => {

                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        `notification-card ${
                            notification.read
                                ? ""
                                : "unread"
                        }`;


                    card.innerHTML = `

                        <div class="notification-icon">

                            ${
                                notification.icon ||
                                "🔔"
                            }

                        </div>


                        <div class="notification-content">

                            <h3>
                                ${notification.title}
                            </h3>


                            <p>
                                ${notification.message}
                            </p>


                            <span class="notification-time">

                                ${
                                    formatTime(
                                        notification.createdAt
                                    )
                                }

                            </span>

                        </div>

                    `;


                    card.addEventListener(
                        "click",
                        async () => {

                            // Marcar como lida
                            if (
                                !notification.read
                            ) {

                                await fetch(
                                    `${API}/${notification._id}/read`,
                                    {
                                        method:
                                            "PUT"
                                    }
                                );

                            }


                            // Abrir destino
                            if (
                                notification.link &&
                                notification.link !== "#"
                            ) {

                                window.location.href =
                                    notification.link;

                                return;

                            }


                            await loadNotifications();

                        }
                    );


                    list.appendChild(
                        card
                    );

                }
            );

        }


        // ======================================
        // MARCAR TODAS COMO LIDAS
        // ======================================

        readAllButton.addEventListener(
            "click",
            async () => {

                try {

                    await fetch(
                        `${API}/user/${user._id}/read-all`,
                        {
                            method:
                                "PUT"
                        }
                    );


                    await loadNotifications();


                } catch (error) {

                    console.error(
                        "ERRO AO MARCAR TODAS:",
                        error
                    );

                }

            }
        );


        // ======================================
        // ATUALIZAÇÃO AUTOMÁTICA
        // ======================================

        await loadNotifications();


        setInterval(
            loadNotifications,
            5000
        );

    }
);