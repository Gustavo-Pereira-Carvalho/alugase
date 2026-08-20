document.addEventListener("DOMContentLoaded", () => {

    const API = "https://alugase-api.onrender.com/api/users";

    const form = document.querySelector("#register-form");

    const name = document.querySelector("#name");
    const email = document.querySelector("#email");
    const phone = document.querySelector("#phone");
    const city = document.querySelector("#city");
    const password = document.querySelector("#password");
    const confirm = document.querySelector("#confirmPassword");
    const terms = document.querySelector("#terms");

    const toggle = (input) => {
        input.type =
            input.type === "password"
                ? "text"
                : "password";
    };

    document
        .querySelector("#toggle-password")
        ?.addEventListener("click", () => toggle(password));

    document
        .querySelector("#toggle-confirm")
        ?.addEventListener("click", () => toggle(confirm));

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

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        if (password.value !== confirm.value)
            return alert("As senhas não coincidem.");

        if (password.value.length < 8)
            return alert("A senha precisa ter 8 caracteres.");

        if (!terms.checked)
            return alert("Aceite os Termos de Uso.");

        try {

            const response = await fetch(API, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name: name.value.trim(),
                    email: email.value.trim().toLowerCase(),
                    phone: phone.value.trim(),
                    city: city.value.trim(),
                    password: password.value

                })

            });

            const data = await response.json();

            if (!response.ok)
                throw new Error(data.error);

            localStorage.setItem("token", data.token);

            localStorage.setItem(
                "alugase_user",
                JSON.stringify(data.user)
            );

            alert("Conta criada com sucesso!");

            window.location.href = "perfil.html";

        } catch (err) {

            alert(err.message);

        }

    });

});
