var Usuarios = (function () {
    var CHAVE_USUARIOS = "heads_usuarios";
    var CHAVE_SESSAO = "heads_sessao";

    function ler() {
        try {
            return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
        } catch (e) {
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
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function bytesParaHex(bytes) {
        return Array.from(bytes, function (b) {
            return b.toString(16).padStart(2, "0");
        }).join("");
    }

    function hexParaBytes(hex) {
        var bytes = new Uint8Array(hex.length / 2);
        for (var i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return bytes;
    }

    function gerarSalt() {
        return bytesParaHex(crypto.getRandomValues(new Uint8Array(16)));
    }

    async function derivarSenha(senha, saltHex) {
        var chave = await crypto.subtle.importKey(
            "raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveBits"]
        );
        var bits = await crypto.subtle.deriveBits(
            { name: "PBKDF2", salt: hexParaBytes(saltHex), iterations: 100000, hash: "SHA-256" },
            chave, 256
        );
        return bytesParaHex(new Uint8Array(bits));
    }

    function criptografiaDisponivel() {
        return !!(window.crypto && window.crypto.subtle);
    }

    var ERRO_CRIPTO = "Este navegador/endereço não suporta criptografia. Abra o site por https ou localhost.";

    function listar() {
        return ler().map(function (u) {
            return {
                id: u.id,
                nome: u.nome,
                usuario: u.usuario || "",
                email: u.email,
                nascimento: u.nascimento || "",
                origem: u.origem,
                temSenha: !!u.senhaHash,
                criadoEm: u.criadoEm
            };
        });
    }

  
    async function cadastrar(dados) {
        if (!criptografiaDisponivel()) {
            return { ok: false, campo: "email", erro: ERRO_CRIPTO };
        }

        var lista = ler();
        var email = normalizarEmail(dados.email);
        var usuario = String(dados.usuario).trim();

        var usuarioEmUso = lista.some(function (u) {
            return u.usuario && u.usuario.toLowerCase() === usuario.toLowerCase();
        });
        if (usuarioEmUso) {
            return { ok: false, campo: "usuario", erro: "Este nome de usuário já está em uso." };
        }

        var existente = lista.find(function (u) { return u.email === email; });
        if (existente && existente.senhaHash) {
            return { ok: false, campo: "email", erro: "Este e-mail já está cadastrado." };
        }

        var salt = gerarSalt();
        var senhaHash = await derivarSenha(dados.senha, salt);

        if (existente) {
            // E-mail pré-cadastrado pelo admin: completa o perfil existente
            existente.nome = String(dados.nome).trim();
            existente.usuario = usuario;
            existente.nascimento = dados.nascimento;
            existente.salt = salt;
            existente.senhaHash = senhaHash;
        } else {
            lista.push({
                id: novoId(),
                nome: String(dados.nome).trim(),
                usuario: usuario,
                email: email,
                nascimento: dados.nascimento,
                salt: salt,
                senhaHash: senhaHash,
                origem: "cadastro",
                criadoEm: new Date().toISOString()
            });
        }

        gravar(lista);
        return { ok: true };
    }

    function adicionarPeloAdmin(dados) {
        var lista = ler();
        var email = normalizarEmail(dados.email);

        if (lista.some(function (u) { return u.email === email; })) {
            return { ok: false, campo: "email", erro: "Este e-mail já está cadastrado." };
        }

        lista.push({
            id: novoId(),
            nome: String(dados.nome).trim(),
            email: email,
            origem: "admin",
            criadoEm: new Date().toISOString()
        });

        gravar(lista);
        return { ok: true };
    }

    function remover(id) {
        var lista = ler().filter(function (u) { return u.id !== id; });
        gravar(lista);

        var sessao = usuarioLogado();
        if (sessao && sessao.id === id) {
            sair();
        }
    }

    async function entrar(email, senha) {
        if (!criptografiaDisponivel()) {
            return { ok: false, erro: ERRO_CRIPTO };
        }

        var usuario = ler().find(function (u) { return u.email === normalizarEmail(email); });

        if (usuario && !usuario.senhaHash) {
            return { ok: false, erro: "Este e-mail ainda não tem senha. Conclua o cadastro na página Cadastro." };
        }

        var hash = usuario ? await derivarSenha(senha, usuario.salt) : null;

        if (!usuario || hash !== usuario.senhaHash) {
            return { ok: false, erro: "E-mail ou senha incorretos." };
        }

        localStorage.setItem(CHAVE_SESSAO, JSON.stringify({
            id: usuario.id,
            nome: usuario.nome,
            usuario: usuario.usuario
        }));
        return { ok: true, nome: usuario.nome };
    }

    function usuarioLogado() {
        try {
            return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
        } catch (e) {
            return null;
        }
    }

    function sair() {
        localStorage.removeItem(CHAVE_SESSAO);
    }

    return {
        listar: listar,
        cadastrar: cadastrar,
        adicionarPeloAdmin: adicionarPeloAdmin,
        remover: remover,
        entrar: entrar,
        usuarioLogado: usuarioLogado,
        sair: sair
    };
})();

if (typeof module !== "undefined") { module.exports = Usuarios; }

document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("formEntrar");
    var emailInput = document.getElementById("email");
    var containerSenha = document.getElementById("container-senha");
    var senhaInput = document.getElementById("senha");
    var btnEntrar = document.getElementById("btnEntrar");
    var mensagem = document.getElementById("mensagem");

    mensagem.style.textAlign = "center";
    mensagem.style.minHeight = "20px";
    mensagem.style.fontSize = "0.9rem";

    function mostrarMensagem(texto, sucesso) {
        mensagem.textContent = texto;
        mensagem.style.color = sucesso ? "#4ade80" : "#ff5c5c";
    }

    emailInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();

            if (emailInput.value.trim() !== "") {
                containerSenha.classList.remove("oculto");
                btnEntrar.classList.remove("oculto");

                senhaInput.disabled = false;
                senhaInput.focus();
            }
        }
    });

    emailInput.addEventListener("input", function () { mostrarMensagem(""); });
    senhaInput.addEventListener("input", function () { mostrarMensagem(""); });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (senhaInput.disabled || senhaInput.value === "") {
            return;
        }

        btnEntrar.disabled = true;
        var resultado = await Usuarios.entrar(emailInput.value, senhaInput.value);
        btnEntrar.disabled = false;

        if (!resultado.ok) {
            mostrarMensagem(resultado.erro, false);
            senhaInput.focus();
            return;
        }

        mostrarMensagem("Bem-vindo(a), " + resultado.nome + "!", true);
        setTimeout(function () {
            window.location.href = "index.html";
        }, 800);
    });
});

const botaoMostrarSenha = document.getElementById("btnSenha");
const campoSenha = document.getElementById("senha");

botaoMostrarSenha?.addEventListener("click", () => {
    if (!campoSenha) return;
    const visivel = campoSenha.type === "password";
    campoSenha.type = visivel ? "text" : "password";
    botaoMostrarSenha.textContent = visivel ? "Ocultar" : "Mostrar";
    botaoMostrarSenha.setAttribute("aria-pressed", String(visivel));
    botaoMostrarSenha.setAttribute("aria-label", visivel ? "Ocultar senha" : "Mostrar senha");
});

(() => {
  const init = () => {
    if (document.querySelector('.retro-masthead')) return;
    const navigation = document.querySelector('nav.navbar,header.cabecalho');
    if (!navigation) return;
    const status = document.createElement('div');
    status.className = 'retro-status';
    status.innerHTML = '<span><span class="status-led" aria-hidden="true"></span><strong>AKIBA NETWORK</strong> // conectado ao universo otaku</span><span>EST. 2004 &nbsp; ◆ &nbsp; PORTAL V.2.0</span>';
    const masthead = document.createElement('div');
    masthead.className = 'retro-masthead';
    masthead.innerHTML = '<a class="retro-brand" href="index.html" aria-label="Akiba Station — Página inicial"><img class="retro-main-logo" src="imgs/akiba-logo-rosa.png" alt="Akiba Station"></a>';
    navigation.before(status, masthead);
    const ticker = document.createElement('div');
    ticker.className = 'retro-ticker';
    ticker.innerHTML = '<span class="retro-ticker-label">◆ AKIBA UPDATE</span><span class="retro-ticker-copy">BEM-VINDO À <b>AKIBA STATION</b> &nbsp; // &nbsp; ANIMES • LANÇAMENTOS • NOTÍCIAS • COMUNIDADE &nbsp; // &nbsp; SUA PRÓXIMA AVENTURA COMEÇA AQUI</span>';
    navigation.after(ticker);
    const sections = document.querySelectorAll('.anime-section,.reviews-panel,.noticias-recentes,.noticia-destaque,main form');
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('retro-visible');observer.unobserve(entry.target);} });
      }, {threshold:0.06,rootMargin:'0px 0px 70px 0px'});
      sections.forEach(el => {el.classList.add('retro-reveal');observer.observe(el);});
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

