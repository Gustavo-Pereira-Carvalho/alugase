// ==========================================
// ALUGASE — CADASTRO (API ONLINE)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const API = "https://alugase-api.onrender.com/api/users";

    const form = document.querySelector("#register-form");

    const name = document.querySelector("#name");
    const email = document.querySelector("#email");
    const phone = document.querySelector("#phone");
    const city = document.querySelector("#city");

    const password = document.querySelector("#password");
    const confirmPassword = document.querySelector("#confirmPassword");

    const terms = document.querySelector("#terms");

    const togglePassword = document.querySelector("#toggle-password");
    const toggleConfirm = document.querySelector("#toggle-confirm");

    // ==========================================
    // MOSTRAR / ESCONDER SENHA
    // ==========================================

    function toggleVisibility(input) {

        input.type =
            input.type === "password"
                ? "text"
                : "password";

    }

    togglePassword?.addEventListener("click", () => {
        toggleVisibility(password);
    });

    toggleConfirm?.addEventListener("click", () => {
        toggleVisibility(confirmPassword);
    });

    // ==========================================
    // MÁSCARA TELEFONE
    // ==========================================

    phone.addEventListener("input", () => {

        let value = phone.value.replace(/\D/g, "").slice(0, 11);

        if (value.length > 10) {

            value = value.replace(
                /(\d{2})(\d{5})(\d+)/,
                "($1) $2-$3"
            );

        } else {

            value = value.replace(
                /(\d{2})(\d{4})(\d+)/,
                "($1) $2-$3"
            );

        }

        phone.value = value;

    });

    // ==========================================
    // CADASTRO
    // ==========================================

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        if (name.value.trim().length < 3) {

            alert("Digite seu nome completo.");
            return;

        }

        if (password.value.length < 8) {

            alert("A senha deve possuir pelo menos 8 caracteres.");
            return;

        }

        if (password.value !== confirmPassword.value) {

            alert("As senhas não coincidem.");
            return;

        }

        if (!terms.checked) {

            alert("Aceite os Termos de Uso.");
            return;

        }

        const newUser = {

            name: name.value.trim(),
            email: email.value.trim().toLowerCase(),
            phone: phone.value.trim(),
            city: city.value.trim(),
            password: password.value

        };

        try {

            const response = await fetch(API, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(newUser)

            });

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error || "Erro ao criar conta."
                );

            }

            alert("Conta criada com sucesso!");

            window.location.href = "login.html";

        } catch (error) {

            alert(error.message);

        }

    });

});