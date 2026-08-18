// ==========================================
// ALUGASE — NAVBAR
// Navegação desktop + mobile
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // API
    // ==========================================

    const NOTIFICATION_API =
        "https://alugase-api.onrender.com/api/notifications";


    // ==========================================
    // ELEMENTOS — DESKTOP
    // ==========================================

    const loginButton =
        document.querySelector("#login-button");

    const announceButton =
        document.querySelector("#announce-button");

    const notificationButton =
        document.querySelector("#notification-button");

    const notificationBadge =
        document.querySelector("#notification-badge");


    // ==========================================
    // ELEMENTOS — MOBILE
    // ==========================================

    const mobileMenuButton =
        document.querySelector("#mobile-menu-button");

    const mobileMenu =
        document.querySelector("#mobile-menu");

    const mobileLogin =
        document.querySelector("#mobile-login");

    const mobileProfile =
        document.querySelector("#mobile-profile");


    // ==========================================
    // USUÁRIO
    // ==========================================

    let user = null;

    try {

        const savedUser =
            localStorage.getItem("alugase_user");

        if (savedUser) {

            user = JSON.parse(savedUser);

        }

    } catch (error) {

        console.error(
            "Erro ao ler usuário:",
            error
        );

        user = null;

    }


    // ==========================================
    // MENU MOBILE
    // ==========================================

    if (mobileMenuButton && mobileMenu) {

        mobileMenuButton.addEventListener(
            "click",
            () => {

                const aberto =
                    mobileMenu.classList.toggle("active");


                // Atualiza aria

                mobileMenuButton.setAttribute(
                    "aria-expanded",
                    aberto ? "true" : "false"
                );


                // Troca o ícone

                mobileMenuButton.textContent =
                    aberto ? "✕" : "☰";

            }
        );

    }


    // ==========================================
    // FECHAR MENU AO CLICAR EM LINK
    // ==========================================

    if (mobileMenu) {

        const mobileLinks =
            mobileMenu.querySelectorAll("a");


        mobileLinks.forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    closeMobileMenu();

                }
            );

        });

    }


    // ==========================================
    // FUNÇÃO FECHAR MENU
    // ==========================================

    function closeMobileMenu() {

        if (!mobileMenu) {
            return;
        }


        mobileMenu.classList.remove("active");


        if (mobileMenuButton) {

            mobileMenuButton.setAttribute(
                "aria-expanded",
                "false"
            );

            mobileMenuButton.textContent =
                "☰";

        }

    }


    // ==========================================
    // LOGIN / PERFIL DESKTOP
    // ==========================================

    if (loginButton) {

        loginButton.textContent =
            user
                ? "Meu Perfil"
                : "Entrar";


        loginButton.addEventListener(
            "click",
            () => {

                if (user) {

                    window.location.href =
                        "perfil.html";

                } else {

                    window.location.href =
                        "login.html";

                }

            }
        );

    }


    // ==========================================
    // ANUNCIAR DESKTOP
    // ==========================================

    if (announceButton) {

        announceButton.addEventListener(
            "click",
            () => {

                if (user) {

                    window.location.href =
                        "novo-anuncio.html";

                } else {

                    window.location.href =
                        "login.html";

                }

            }
        );

    }


    // ==========================================
    // LOGIN / PERFIL MOBILE
    // ==========================================

    if (user) {

        // Usuário logado

        if (mobileLogin) {

            mobileLogin.style.display =
                "none";

        }


        if (mobileProfile) {

            mobileProfile.style.display =
                "flex";

        }

    } else {

        // Usuário não logado

        if (mobileLogin) {

            mobileLogin.style.display =
                "flex";

        }


        if (mobileProfile) {

            mobileProfile.style.display =
                "none";

        }

    }


    // ==========================================
    // ANUNCIAR MOBILE
    // ==========================================

    const mobileAnnounce =
        document.querySelector(
            "#mobile-announce"
        );


    if (mobileAnnounce) {

        mobileAnnounce.addEventListener(
            "click",
            event => {

                event.preventDefault();


                if (user) {

                    window.location.href =
                        "novo-anuncio.html";

                } else {

                    window.location.href =
                        "login.html";

                }

            }
        );

    }


    // ==========================================
    // NOTIFICAÇÕES
    // ==========================================

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            () => {

                if (!user) {

                    window.location.href =
                        "login.html";

                    return;

                }


                window.location.href =
                    "notificacoes.html";

            }
        );

    }


    // ==========================================
    // NOTIFICAÇÕES MOBILE
    // ==========================================

    const mobileNotification =
        document.querySelector(
            "#mobile-notifications"
        );


    if (mobileNotification) {

        mobileNotification.addEventListener(
            "click",
            event => {

                event.preventDefault();


                if (!user) {

                    window.location.href =
                        "login.html";

                    return;

                }


                window.location.href =
                    "notificacoes.html";

            }
        );

    }


    // ==========================================
    // CONTADOR DE NOTIFICAÇÕES
    // ==========================================

    async function loadNotificationCount() {

        if (
            !user ||
            !notificationBadge ||
            !user._id
        ) {

            return;

        }


        try {

            const response =
                await fetch(
                    `${NOTIFICATION_API}/user/${user._id}/unread-count`
                );


            if (!response.ok) {

                return;

            }


            const data =
                await response.json();


            const count =
                Number(data.count || 0);


            if (count > 0) {

                notificationBadge.textContent =
                    count > 99
                        ? "99+"
                        : count;


                notificationBadge.style.display =
                    "flex";

            } else {

                notificationBadge.textContent =
                    "";

                notificationBadge.style.display =
                    "none";

            }

        } catch (error) {

            console.error(
                "Erro ao carregar notificações:",
                error
            );

        }

    }


    // ==========================================
    // INICIAR CONTADOR
    // ==========================================

    loadNotificationCount();


    // ==========================================
    // ATUALIZAR A CADA 5 SEGUNDOS
    // ==========================================

    setInterval(
        loadNotificationCount,
        5000
    );

});