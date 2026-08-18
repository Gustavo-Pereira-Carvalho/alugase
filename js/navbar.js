document.addEventListener("DOMContentLoaded", () => {

    const container = document.getElementById("navbar-container");

    if (!container) return;

    container.innerHTML = `

        <header class="site-header">

            <nav class="navbar">

                <!-- LOGO -->

                <div class="logo">

                    <a href="index.html">

                        <img
                            src="assets/logo.png"
                            alt="Logo Alugase"
                        >

                        <h2>ALUGASE</h2>

                    </a>

                </div>


                <!-- MENU -->

                <ul class="nav-links">

                    <li>
                        <a href="index.html">
                            Início
                        </a>
                    </li>

                    <li>
                        <a href="explorar.html">
                            Explorar
                        </a>
                    </li>

                    <li>
                        <a href="index.html#categorias">
                            Categorias
                        </a>
                    </li>

                    <li>
                        <a href="index.html#como-funciona">
                            Como funciona
                        </a>
                    </li>

                </ul>


                <!-- AÇÕES -->

                <div class="nav-buttons">

                    <button
                        class="chat-nav"
                        id="chat-button"
                        type="button"
                        aria-label="Chat"
                        title="Chat"
                    >

                        <span class="chat-icon">
                            💬
                        </span>

                        <span
                            class="chat-badge"
                            id="chat-badge"
                        ></span>

                    </button>


                    <button
                        class="notification-nav"
                        id="notification-button"
                        type="button"
                        aria-label="Notificações"
                        title="Notificações"
                    >

                        <span class="notification-bell">
                            🔔
                        </span>

                        <span
                            class="notification-badge"
                            id="notification-badge"
                        ></span>

                    </button>


                    <button
                        class="btn-secondary"
                        id="login-button"
                        type="button"
                    >
                        Entrar
                    </button>


                    <button
                        class="btn-primary"
                        id="announce-button"
                        type="button"
                    >
                        Anunciar
                    </button>

                </div>

            </nav>

        </header>

    `;

});