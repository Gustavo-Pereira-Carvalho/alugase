document.addEventListener("DOMContentLoaded", () => {

    const API = "https://alugase-api.onrender.com/api/users/login";

    const form = document.querySelector("#login-form");
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");
    const remember = document.querySelector("#remember");

    document
        .querySelector("#toggle-password")
        ?.addEventListener("click", () => {

            password.type =
                password.type === "password"
                    ? "text"
                    : "password";

        });

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
                throw new Error(data.error);
            }

            localStorage.setItem("token", data.token);

            localStorage.setItem(
                "alugase_user",
                JSON.stringify(data.user)
            );

            if (remember.checked) {

                localStorage.setItem(
                    "remember_email",
                    email.value
                );

            } else {

                localStorage.removeItem("remember_email");

            }

            alert(`Bem-vindo, ${data.user.name}!`);

            window.location.href = "perfil.html";

        } catch (err) {

            alert(err.message);

        }

    });

    const saved = localStorage.getItem("remember_email");

    if (saved) {

        email.value = saved;
        remember.checked = true;

    }

});
