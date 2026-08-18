document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#login-form");

    const email = document.querySelector("#email");
    const password = document.querySelector("#password");

    const remember = document.querySelector("#remember");

    const togglePassword = document.querySelector("#toggle-password");

    // ==========================================
    // MOSTRAR / ESCONDER SENHA
    // ==========================================

    togglePassword.addEventListener("click", () => {

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

            const response = await fetch(
                "http://localhost:3000/api/users/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.value.trim().toLowerCase(),
                        password: password.value
                    })
                }
            );

            const user = await response.json();

            if (!response.ok) {
                throw new Error(user.error);
            }

            // Salva a sessão do usuário
            localStorage.setItem(
                "alugase_user",
                JSON.stringify(user)
            );

            if (remember.checked) {
                localStorage.setItem("remember_email", user.email);
            } else {
                localStorage.removeItem("remember_email");
            }

            alert(`Bem-vindo, ${user.name}!`);

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
    // GOOGLE (EM DESENVOLVIMENTO)
    // ==========================================

    document
        .querySelector("#google-login")
        .addEventListener("click", () => {

            alert(
                "Login com Google será implementado em breve."
            );

        });

});