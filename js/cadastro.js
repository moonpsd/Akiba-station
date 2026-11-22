
/* AKIBA STATION — CADASTRO */

function calcularIdade(dataStr) {
    if (typeof dataStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
        return NaN;
    }

    const [ano, mes, dia] = dataStr.split("-").map(Number);
    const nascimento = new Date(ano, mes - 1, dia);

    if (
        nascimento.getFullYear() !== ano ||
        nascimento.getMonth() !== mes - 1 ||
        nascimento.getDate() !== dia
    ) {
        return NaN;
    }

    const hoje = new Date();
    let idade = hoje.getFullYear() - ano;

    if (
        hoje.getMonth() + 1 < mes ||
        (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)
    ) {
        idade--;
    }

    return idade;
}

/* GERENCIAMENTO DE USUÁRIOS */

var Usuarios = (() => {
    const CHAVE_USUARIOS = "heads_usuarios";
    const CHAVE_SESSAO = "heads_sessao";

    function ler() {
        try {
            return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
        } catch {
            return [];
        }
    }

    function gravar(lista) {
        localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(lista));
    }

    function normalizarEmail(email) {
        return String(email).trim().toLowerCase();
    }

    function novoId() {
        return Date.now().toString(36) +
            Math.random().toString(36).slice(2, 8);
    }

    function bytesParaHex(bytes) {
        return Array.from(bytes, b =>
            b.toString(16).padStart(2, "0")
        ).join("");
    }

    function hexParaBytes(hex) {
        const bytes = new Uint8Array(hex.length / 2);

        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
        }

        return bytes;
    }

    function gerarSalt() {
        return bytesParaHex(
            crypto.getRandomValues(new Uint8Array(16))
        );
    }

    async function derivarSenha(senha, saltHex) {
        const chave = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(senha),
            "PBKDF2",
            false,
            ["deriveBits"]
        );

        const bits = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: hexParaBytes(saltHex),
                iterations: 100000,
                hash: "SHA-256"
            },
            chave,
            256
        );

        return bytesParaHex(new Uint8Array(bits));
    }

    function criptografiaDisponivel() {
        return Boolean(window.crypto?.subtle);
    }

    const ERRO_CRIPTO =
        "Este navegador não suporta criptografia. Utilize HTTPS ou localhost.";

    function listar() {
        return ler().map(u => ({
            id: u.id,
            nome: u.nome,
            usuario: u.usuario || "",
            email: u.email,
            nascimento: u.nascimento || "",
            origem: u.origem,
            temSenha: Boolean(u.senhaHash),
            criadoEm: u.criadoEm
        }));
    }

    async function cadastrar(dados) {
        const idade = calcularIdade(dados.nascimento);

        if (!Number.isFinite(idade) || idade < 0 || idade > 120) {
            return {
                ok: false,
                campo: "nascimento",
                erro: "Data de nascimento inválida."
            };
        }

        if (idade < 12) {
            return {
                ok: false,
                campo: "nascimento",
                erro: "Você precisa ter pelo menos 12 anos para criar uma conta."
            };
        }

        if (!criptografiaDisponivel()) {
            return {
                ok: false,
                campo: "email",
                erro: ERRO_CRIPTO
            };
        }

        const lista = ler();
        const email = normalizarEmail(dados.email);
        const usuario = String(dados.usuario).trim();

        const usuarioEmUso = lista.some(u =>
            u.usuario?.toLowerCase() === usuario.toLowerCase()
        );

        if (usuarioEmUso) {
            return {
                ok: false,
                campo: "usuario",
                erro: "Este nome de usuário já está em uso."
            };
        }

        const existente = lista.find(u => u.email === email);

        if (existente?.senhaHash) {
            return {
                ok: false,
                campo: "email",
                erro: "Este e-mail já está cadastrado."
            };
        }

        const salt = gerarSalt();
        const senhaHash = await derivarSenha(dados.senha, salt);

        if (existente) {
            Object.assign(existente, {
                nome: String(dados.nome).trim(),
                usuario,
                nascimento: dados.nascimento,
                salt,
                senhaHash
            });
        } else {
            lista.push({
                id: novoId(),
                nome: String(dados.nome).trim(),
                usuario,
                email,
                nascimento: dados.nascimento,
                salt,
                senhaHash,
                origem: "cadastro",
                criadoEm: new Date().toISOString()
            });
        }

        gravar(lista);
        return { ok: true };
    }

    function adicionarPeloAdmin(dados) {
        const lista = ler();
        const email = normalizarEmail(dados.email);

        if (lista.some(u => u.email === email)) {
            return {
                ok: false,
                campo: "email",
                erro: "Este e-mail já está cadastrado."
            };
        }

        lista.push({
            id: novoId(),
            nome: String(dados.nome).trim(),
            email,
            origem: "admin",
            criadoEm: new Date().toISOString()
        });

        gravar(lista);
        return { ok: true };
    }

    function usuarioLogado() {
        try {
            return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
        } catch {
            return null;
        }
    }

    function sair() {
        localStorage.removeItem(CHAVE_SESSAO);
    }

    function remover(id) {
        gravar(ler().filter(u => u.id !== id));

        if (usuarioLogado()?.id === id) {
            sair();
        }
    }

    async function entrar(email, senha) {
        if (!criptografiaDisponivel()) {
            return { ok: false, erro: ERRO_CRIPTO };
        }

        const usuario = ler().find(
            u => u.email === normalizarEmail(email)
        );

        if (usuario && !usuario.senhaHash) {
            return {
                ok: false,
                erro: "Este e-mail ainda não tem senha. Conclua o cadastro."
            };
        }

        const hash = usuario
            ? await derivarSenha(senha, usuario.salt)
            : null;

        if (!usuario || hash !== usuario.senhaHash) {
            return {
                ok: false,
                erro: "E-mail ou senha incorretos."
            };
        }

        localStorage.setItem(CHAVE_SESSAO, JSON.stringify({
            id: usuario.id,
            nome: usuario.nome,
            usuario: usuario.usuario
        }));

        return { ok: true, nome: usuario.nome };
    }

    return {
        listar,
        cadastrar,
        adicionarPeloAdmin,
        remover,
        entrar,
        usuarioLogado,
        sair
    };
})();

/* FORMULÁRIO DE CADASTRO */

document.addEventListener("DOMContentLoaded", () => {
    const $ = id => document.getElementById(id);

    const form = $("formCadastro");
    if (!form) return;

    const etapa1 = $("etapa1");
    const etapa2 = $("etapa2");
    const barra2 = $("barra2");
    const textoEtapa = $("textoEtapa");
    const mensagem1 = $("mensagem1");
    const mensagem2 = $("mensagem2");

    const nome = $("nome");
    const usuario = $("usuario");
    const nascimento = $("nascimento");
    const email = $("email");
    const senha = $("senha");
    const confirmarSenha = $("confirmarSenha");

    const btnContinuar = $("btnContinuar");
    const btnVoltar = $("btnVoltar");
    const btnCadastrar = $("btnCadastrar");

    let etapaAtual = 1;

    // Impede a seleção de datas futuras.
    const hoje = new Date();

    nascimento.max = [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, "0"),
        String(hoje.getDate()).padStart(2, "0")
    ].join("-");

    // Mostrar/ocultar senha.
    document.querySelectorAll(".btn_senha").forEach(botao => {
        botao.addEventListener("click", () => {
            const campo = $(botao.dataset.alvo);
            if (!campo) return;

            const mostrar = campo.type === "password";

            campo.type = mostrar ? "text" : "password";
            botao.textContent = mostrar ? "Ocultar" : "Mostrar";
            botao.setAttribute("aria-pressed", String(mostrar));
        });
    });

    // Limpa os erros ao digitar.
    form.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", () => {
            input.parentElement.classList.remove("invalido");
            mensagem1.textContent = "";
            mensagem2.textContent = "";
            mensagem2.classList.remove("sucesso");
        });
    });

    function mostrarErro(erro, mensagem) {
        mensagem.textContent = erro.texto;
        erro.campo.parentElement.classList.add("invalido");
        erro.campo.focus();
    }

    function validarEtapa1() {
        if (nome.value.trim().length < 3) {
            return {
                campo: nome,
                texto: "Digite seu nome completo."
            };
        }

        if (!/^[A-Za-z0-9_.]{3,20}$/.test(usuario.value.trim())) {
            return {
                campo: usuario,
                texto: "Usuário: 3 a 20 caracteres (letras, números, _ ou .)."
            };
        }

        if (!nascimento.value) {
            return {
                campo: nascimento,
                texto: "Informe sua data de nascimento."
            };
        }

        const idade = calcularIdade(nascimento.value);

        if (!Number.isFinite(idade) || idade < 0 || idade > 120) {
            return {
                campo: nascimento,
                texto: "Data de nascimento inválida."
            };
        }

        if (idade < 12) {
            return {
                campo: nascimento,
                texto: "Você precisa ter pelo menos 12 anos para criar uma conta."
            };
        }

        return null;
    }

    function validarEtapa2() {
        if (!email.checkValidity()) {
            return {
                campo: email,
                texto: "Digite um e-mail válido."
            };
        }

        if (senha.value.length < 8) {
            return {
                campo: senha,
                texto: "A senha deve ter pelo menos 8 caracteres."
            };
        }

        if (confirmarSenha.value !== senha.value) {
            return {
                campo: confirmarSenha,
                texto: "As senhas não coincidem."
            };
        }

        return null;
    }

    function irParaEtapa(numero) {
        etapaAtual = numero;

        etapa1.classList.toggle("oculto", numero !== 1);
        etapa2.classList.toggle("oculto", numero !== 2);
        barra2.classList.toggle("ativa", numero === 2);

        textoEtapa.textContent = numero === 1
            ? "Etapa 1 de 2 · Sobre você"
            : "Etapa 2 de 2 · Dados de acesso";

        (numero === 1 ? nome : email).focus();
    }

    function avancar() {
        const erro = validarEtapa1();

        if (erro) {
            mostrarErro(erro, mensagem1);
            return;
        }

        irParaEtapa(2);
    }

    btnContinuar.addEventListener("click", avancar);

    btnVoltar.addEventListener("click", () => {
        irParaEtapa(1);
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (etapaAtual === 1) {
            avancar();
            return;
        }

        const erro = validarEtapa1() || validarEtapa2();

        if (erro) {
            const primeiraEtapa = etapa1.contains(erro.campo);

            if (primeiraEtapa) {
                irParaEtapa(1);
            }

            mostrarErro(
                erro,
                primeiraEtapa ? mensagem1 : mensagem2
            );

            return;
        }

        btnCadastrar.disabled = true;

        let resultado;

        try {
            resultado = await Usuarios.cadastrar({
                nome: nome.value,
                usuario: usuario.value,
                nascimento: nascimento.value,
                email: email.value,
                senha: senha.value
            });
        } catch (erro) {
            console.error("Erro no cadastro:", erro);

            resultado = {
                ok: false,
                campo: "email",
                erro: "Não foi possível concluir o cadastro."
            };
        } finally {
            btnCadastrar.disabled = false;
        }

        if (!resultado.ok) {
            const campos = {
                nome,
                usuario,
                nascimento,
                email,
                senha
            };

            const campo = campos[resultado.campo] || email;
            const primeiraEtapa = etapa1.contains(campo);

            if (primeiraEtapa) {
                irParaEtapa(1);
            }

            mostrarErro(
                { campo, texto: resultado.erro },
                primeiraEtapa ? mensagem1 : mensagem2
            );

            return;
        }

        mensagem2.classList.add("sucesso");
        mensagem2.textContent =
            "Cadastro realizado! Redirecionando para o login...";

        setTimeout(() => {
            window.location.href = "entrar.html";
        }, 1500);
    });
});

/* CABEÇALHO E ANIMAÇÕES */

(() => {
    const init = () => {
        if (document.querySelector(".retro-masthead")) return;

        const navigation = document.querySelector(
            "nav.navbar, header.cabecalho"
        );

        if (!navigation) return;

        const status = document.createElement("div");
        status.className = "retro-status";
        status.innerHTML = `
            <span>
                <span class="status-led" aria-hidden="true"></span>
                <strong>AKIBA NETWORK</strong>
                // conectado ao universo otaku
            </span>
            <span>EST. 2004 &nbsp; ◆ &nbsp; PORTAL V.2.0</span>
        `;

        const masthead = document.createElement("div");
        masthead.className = "retro-masthead";
        masthead.innerHTML = `
            <a class="retro-brand" href="index.html"
               aria-label="Akiba Station — Página inicial">
                <img class="retro-main-logo"
                     src="imgs/akiba-logo-rosa.png"
                     alt="Akiba Station">
            </a>
        `;

        navigation.before(status, masthead);

        const ticker = document.createElement("div");
        ticker.className = "retro-ticker";
        ticker.innerHTML = `
            <span class="retro-ticker-label">◆ AKIBA UPDATE</span>
            <span class="retro-ticker-copy">
                BEM-VINDO À <b>AKIBA STATION</b>
                &nbsp; // &nbsp;
                ANIMES • LANÇAMENTOS • NOTÍCIAS • COMUNIDADE
                &nbsp; // &nbsp;
                SUA PRÓXIMA AVENTURA COMEÇA AQUI
            </span>
        `;

        navigation.after(ticker);

        const sections = document.querySelectorAll(
            ".anime-section, .reviews-panel, " +
            ".noticias-recentes, .noticia-destaque, main form"
        );

        const reduzirMovimento = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if ("IntersectionObserver" in window && !reduzirMovimento) {
            const observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("retro-visible");
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.06,
                    rootMargin: "0px 0px 70px 0px"
                }
            );

            sections.forEach(elemento => {
                elemento.classList.add("retro-reveal");
                observer.observe(elemento);
            });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, {
            once: true
        });
    } else {
        init();
    }
})();
