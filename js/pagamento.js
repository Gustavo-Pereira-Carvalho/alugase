// ==========================================
// ALUGASE — PAGAMENTO
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "https://alugase-api.onrender.com/api";

    const loading = document.querySelector("#loading");
    const checkout = document.querySelector("#checkout");
    const errorState = document.querySelector("#error-state");
    const errorMessage = document.querySelector("#error-message");

    const productSummary = document.querySelector("#product-summary");
    const rentTotal = document.querySelector("#rent-total");
    const deliveryPrice = document.querySelector("#delivery-price");
    const deposit = document.querySelector("#deposit");
    const total = document.querySelector("#total");
    const startDate = document.querySelector("#start-date");
    const endDate = document.querySelector("#end-date");
    const days = document.querySelector("#days");

    const paymentBrick = document.querySelector("#paymentBrick_container");
    const paymentResult = document.querySelector("#payment-result");

    const user = JSON.parse(localStorage.getItem("alugase_user"));

    if (!user) {
        location.href = "login.html";
        return;
    }

    const rentalId = new URLSearchParams(location.search).get("id");

    if (!rentalId) {
        showError("Aluguel não informado.");
        return;
    }

    function money(value) {
        return Number(value || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function formatDate(date) {
        return new Date(date).toLocaleDateString("pt-BR");
    }

    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text || "";
        return div.innerHTML;
    }

    function showError(message) {
        loading.style.display = "none";
        checkout.style.display = "none";
        errorState.style.display = "block";
        errorMessage.textContent = message;
    }

    async function loadCheckout() {

        try {

            const response = await fetch(`${API}/payments/checkout/${rentalId}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error);

            const rental = data.rental;
            const product = data.product;

            productSummary.innerHTML = `
                ${
                    product?.image
                        ? `<img src="${product.image}" alt="${escapeHtml(product.title)}">`
                        : `<div class="product-placeholder">📦</div>`
                }

                <div class="product-summary-info">
                    <h3>${escapeHtml(product.title)}</h3>
                    <p>📍 ${escapeHtml(product.city)}</p>
                </div>
            `;

            rentTotal.textContent = money(rental.rentTotal);
            deliveryPrice.textContent = money(rental.deliveryPrice);
            deposit.textContent = money(rental.deposit);
            total.textContent = money(rental.total);

            startDate.textContent = formatDate(rental.startDate);
            endDate.textContent = formatDate(rental.endDate);
            days.textContent = `${rental.days} dia${rental.days > 1 ? "s" : ""}`;

            loading.style.display = "none";
            checkout.style.display = "block";

            await renderBrick(data.publicKey, rental, data.renter);

        } catch (err) {

            console.error(err);
            showError(err.message);

        }

    }

    async function renderBrick(publicKey, rental, renter) {

        const mp = new MercadoPago(publicKey);
        const bricks = mp.bricks();

        await bricks.create("payment", "paymentBrick_container", {

            initialization: {

                amount: Number(rental.total),

                payer: {
                    email: renter?.email || ""
                }

            },

            customization: {

                visual: {
                    hideFormTitle: false
                },

                paymentMethods: {

                    maxInstallments: 1,

                    creditCard: "all",
                    debitCard: "all",
                    prepaidCard: "all",
                    bankTransfer: "all",
                    mercadoPago: "all",
                    ticket: "all"

                }

            },

            callbacks: {

                onReady: () => {
                    console.log("✅ Brick carregado");
                },

                onSubmit: ({ formData }) => {

                    return new Promise(async (resolve, reject) => {

                        try {

                            const response = await fetch(`${API}/payments/process`, {

                                method: "POST",

                                headers: {
                                    "Content-Type": "application/json"
                                },

                                body: JSON.stringify({

                                    rentalId: rental.id,

                                    ...formData,

                                    installments: 1

                                })

                            });

                            const result = await response.json();

                            if (!response.ok) {
                                throw new Error(result.error);
                            }

                            if (result.payment.status === "approved") {

                                showResult(
                                    "Pagamento confirmado!",
                                    "Seu aluguel foi pago com sucesso."
                                );

                            } else {

                                showResult(
                                    "Pagamento em análise",
                                    getMessage(result.payment.status)
                                );

                            }

                            resolve();

                        } catch (err) {

                            alert(err.message);
                            reject();

                        }

                    });

                },

                onError: (err) => {
                    console.error(err);
                }

            }

        });

    }

    function getMessage(status) {

        switch (status) {

            case "pending":
                return "Pagamento pendente.";

            case "in_process":
                return "Pagamento em análise.";

            case "rejected":
                return "Pagamento recusado.";

            default:
                return "Pagamento processado.";

        }

    }

    function showResult(title, message) {

        paymentBrick.style.display = "none";
        paymentResult.style.display = "block";

        document.querySelector("#result-title").textContent = title;
        document.querySelector("#result-message").textContent = message;

    }

    await loadCheckout();

});
