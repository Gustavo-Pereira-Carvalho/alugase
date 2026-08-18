// ==========================================
// ALUGASE — CENTRAL DE AJUDA
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const faqs = [

        // ALUGUÉIS

        {
            category: "rent",
            question: "Como faço para alugar um produto?",
            answer: "Escolha o produto, selecione as datas desejadas e envie uma solicitação ao proprietário. Após a aprovação, vocês poderão conversar pelo chat."
        },

        {
            category: "rent",
            question: "Posso cancelar uma solicitação?",
            answer: "Sim. Enquanto ela ainda estiver pendente, você poderá cancelá-la sem custo."
        },

        {
            category: "rent",
            question: "Quando o aluguel começa?",
            answer: "O período começa na data de retirada definida durante a reserva."
        },

        {
            category: "rent",
            question: "Como funciona a devolução?",
            answer: "A devolução deve ocorrer na data combinada entre locador e locatário, seguindo as condições do anúncio."
        },

        // PROPRIETÁRIO

        {
            category: "owner",
            question: "Como anuncio um produto?",
            answer: "Acesse Meu Perfil → Novo anúncio, preencha as informações, preço, caução e publique."
        },

        {
            category: "owner",
            question: "Posso pausar meu anúncio?",
            answer: "Sim. Na tela Editar anúncio você poderá alterar o status para indisponível."
        },

        {
            category: "owner",
            question: "Quem define o valor da caução?",
            answer: "O próprio proprietário escolhe o valor da caução durante a criação do anúncio."
        },

        {
            category: "owner",
            question: "Recebo notificações de novas solicitações?",
            answer: "Sim. Todas as solicitações aparecerão na página Solicitações e também poderão gerar notificações futuramente."
        },

        // VEÍCULOS

        {
            category: "vehicle",
            question: "Preciso de CNH para anunciar um veículo?",
            answer: "Sim. A CNH verificada é obrigatória para anúncios de automóveis e motocicletas."
        },

        {
            category: "vehicle",
            question: "É necessário enviar o CRLV?",
            answer: "Sim. Durante a publicação de veículos serão solicitados os documentos do veículo para validação."
        },

        {
            category: "vehicle",
            question: "Posso anunciar uma bicicleta sem CNH?",
            answer: "Sim. Bicicletas não exigem CNH nem documentação veicular."
        },

        // SEGURANÇA

        {
            category: "security",
            question: "Por que preciso verificar minha identidade?",
            answer: "A verificação reduz fraudes e aumenta a segurança entre locadores e locatários."
        },

        {
            category: "security",
            question: "Meus documentos ficam públicos?",
            answer: "Não. CPF, RG, CNH e endereço são utilizados apenas para validação da conta."
        },

        {
            category: "security",
            question: "O que acontece se o produto voltar danificado?",
            answer: "O caso poderá ser analisado pela equipe de suporte utilizando as evidências do aluguel e a caução poderá ser utilizada conforme os termos."
        },

        {
            category: "security",
            question: "Como entro em contato com o suporte?",
            answer: "Pela página Conversas você poderá abrir um atendimento com a equipe do Alugase."
        },

        // PAGAMENTOS

        {
            category: "payment",
            question: "Quando receberei meu dinheiro?",
            answer: "Após a conclusão do aluguel e confirmação da devolução. A integração com pagamentos será adicionada na próxima versão."
        },

        {
            category: "payment",
            question: "A caução é um pagamento definitivo?",
            answer: "Não. Ela funciona como garantia e poderá ser devolvida integralmente quando o produto retornar nas condições acordadas."
        },

        {
            category: "payment",
            question: "O Alugase cobra comissão?",
            answer: "Sim. Futuramente será aplicada uma pequena taxa de intermediação sobre aluguéis concluídos."
        },

        {
            category: "payment",
            question: "Quais formas de pagamento serão aceitas?",
            answer: "PIX, cartão de crédito e boleto através da integração com o Mercado Pago."
        }

    ];

    const list = document.querySelector("#faq-list");
    const search = document.querySelector("#faq-search");
    const categories = document.querySelectorAll(".category");

    let currentCategory = "all";

    // ==========================================
    // RENDER
    // ==========================================

    function render() {

        const term = search.value.toLowerCase().trim();

        list.innerHTML = "";

        const filtered = faqs.filter(item => {

            const categoryOk =
                currentCategory === "all" ||
                item.category === currentCategory;

            const searchOk =
                item.question.toLowerCase().includes(term) ||
                item.answer.toLowerCase().includes(term);

            return categoryOk && searchOk;

        });

        if (filtered.length === 0) {

            list.innerHTML = `
                <div class="faq-item">
                    <div class="faq-question">
                        <h3>Nenhum resultado encontrado</h3>
                    </div>
                </div>
            `;

            return;

        }

        filtered.forEach(item => {

            const faq = document.createElement("div");

            faq.className = "faq-item";

            faq.innerHTML = `
                <button class="faq-question">

                    <h3>${item.question}</h3>

                    <span class="faq-icon">+</span>

                </button>

                <div class="faq-answer">
                    <p>${item.answer}</p>
                </div>
            `;

            list.appendChild(faq);

        });

        addEvents();

    }

    // ==========================================
    // ABRIR / FECHAR
    // ==========================================

    function addEvents() {

        document
            .querySelectorAll(".faq-question")
            .forEach(button => {

                button.onclick = () => {

                    const item = button.parentElement;

                    const answer =
                        item.querySelector(".faq-answer");

                    const opened =
                        item.classList.contains("open");

                    document
                        .querySelectorAll(".faq-item")
                        .forEach(i => {

                            i.classList.remove("open");

                            i.querySelector(".faq-answer")
                                .style.maxHeight = null;

                        });

                    if (!opened) {

                        item.classList.add("open");

                        answer.style.maxHeight =
                            answer.scrollHeight + "px";

                    }

                };

            });

    }

    // ==========================================
    // BUSCA
    // ==========================================

    search.addEventListener("input", render);

    document
        .querySelector("#search-btn")
        .onclick = render;

    // ==========================================
    // CATEGORIAS
    // ==========================================

    categories.forEach(button => {

        button.onclick = () => {

            categories.forEach(b =>
                b.classList.remove("active")
            );

            button.classList.add("active");

            currentCategory =
                button.dataset.category;

            render();

        };

    });

    render();

});