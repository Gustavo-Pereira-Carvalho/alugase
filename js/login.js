// ==========================================
// ALUGASE — LOGIN (API ONLINE)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const API = "https://alugase-api.onrender.com/api/users/login";

    const form = document.querySelector("#login-form");

    const email = document.querySelector("#email");
    const password = document.querySelector("#password");

    const remember = document.querySelector("#remember");
    const togglePassword = document.querySelector("#toggle-password");

    // ==========================================
    // MOSTRAR / ESCONDER SENHA
    // ==========================================

    togglePassword?.addEventListener("click", () => {

        password.type =
            password.type === "password"
                ? "text"
                : "password";

    });

    // ==========================================
    // LOGIN
    // ==========================================

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        try {

            const response = await fetch(API, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    email: email.value.trim().toLowerCase(),
                    password: password.value

                })

            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao realizar login.");
            }

            // Salva sessão
            localStorage.setItem(
                "alugase_user",
                JSON.stringify(data)
            );

            // Lembrar e-mail
            if (remember.checked) {

                localStorage.setItem(
                    "remember_email",
                    data.email
                );

            } else {

                localStorage.removeItem("remember_email");

            }

            alert(`Bem-vindo, ${data.name}!`);

            window.location.href = "perfil.html";

        } catch (error) {

            alert(error.message);

        }

    });

    // ==========================================
    // LEMBRAR E-MAIL
    // ==========================================

    const savedEmail = localStorage.getItem("remember_email");

    if (savedEmail) {

        email.value = savedEmail;
        remember.checked = true;

    }

    // ==========================================
    // GOOGLE
    // ==========================================

    document
        .querySelector("#google-login")
        ?.addEventListener("click", () => {

            alert(
                "Login com Google será implementado em breve."
            );

        });

});