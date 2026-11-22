/* Akiba Station — lógica de adm e efeitos visuais locais. */

/* Gerenciamento de usuários incorporado nesta página. */
/*
  usuarios.js - "banco de dados" do site, sem servidor.
  Os dados ficam no localStorage do navegador (chave "heads_usuarios").
  As senhas NUNCA são guardadas em texto puro: só um hash (PBKDF2) + salt.
  Carregue este arquivo ANTES dos outros scripts da página.
*/
var Usuarios = (function () {
    var CHAVE_USUARIOS = "heads_usuarios";
    var CHAVE_SESSAO = "heads_sessao";

    // ---------- armazenamento ----------
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

    // ---------- senha (hash + salt) ----------
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

    // ---------- operações ----------
    // Lista para exibição: nunca inclui hash nem salt
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

    // Cadastro feito pelo próprio usuário (página cadastro.html)
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

    // Cadastro feito pelo admin (só nome + e-mail, sem senha)
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

    // Login
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

    // Quem está logado neste navegador (ou null)
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
    var form = document.getElementById("formAdmin");
    var nome = document.getElementById("nome");
    var email = document.getElementById("email");
    var mensagem = document.getElementById("mensagem");

    var corpoTabela = document.getElementById("corpoTabela");
    var tabelaScroll = document.getElementById("tabelaScroll");
    var vazio = document.getElementById("vazio");
    var contador = document.getElementById("contador");

    renderizar();

    // Remove o destaque de erro quando o usuário volta a digitar
    form.querySelectorAll("input").forEach(function (input) {
        input.addEventListener("input", function () {
            input.parentElement.classList.remove("invalido");
            mensagem.textContent = "";
            mensagem.classList.remove("sucesso");
        });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        var erro = validar();
        if (!erro) {
            var resultado = Usuarios.adicionarPeloAdmin({ nome: nome.value, email: email.value });
            if (!resultado.ok) {
                erro = { campo: email, texto: resultado.erro };
            }
        }

        if (erro) {
            mensagem.classList.remove("sucesso");
            mensagem.textContent = erro.texto;
            erro.campo.parentElement.classList.add("invalido");
            erro.campo.focus();
            return;
        }

        form.reset();
        mensagem.textContent = "Usuário cadastrado com sucesso!";
        mensagem.classList.add("sucesso");
        renderizar();
    });

    // Retorna o primeiro erro encontrado ou null
    function validar() {
        if (nome.value.trim().length < 3) {
            return { campo: nome, texto: "Digite o nome do usuário (mínimo 3 caracteres)." };
        }

        if (!email.checkValidity()) {
            return { campo: email, texto: "Digite um e-mail válido." };
        }

        return null;
    }

    // Desenha a tabela com os usuários salvos
    function renderizar() {
        var lista = Usuarios.listar().reverse(); // mais recentes primeiro

        contador.textContent = lista.length + (lista.length === 1 ? " usuário" : " usuários");
        tabelaScroll.hidden = lista.length === 0;
        vazio.hidden = lista.length > 0;
        corpoTabela.textContent = "";

        lista.forEach(function (u) {
            var linha = document.createElement("tr");

            linha.appendChild(celula(u.nome));
            linha.appendChild(celula(u.usuario || "—"));
            linha.appendChild(celula(u.email));
            linha.appendChild(celula(u.nascimento ? formatarNascimento(u.nascimento) : "—"));

            var status = document.createElement("span");
            status.className = "status " + (u.temSenha ? "completo" : "pendente");
            status.textContent = u.temSenha ? "Completo" : "Aguardando senha";
            var tdStatus = document.createElement("td");
            tdStatus.appendChild(status);
            linha.appendChild(tdStatus);

            linha.appendChild(celula(new Date(u.criadoEm).toLocaleDateString("pt-BR")));

            var botao = document.createElement("button");
            botao.type = "button";
            botao.className = "btn_remover";
            botao.textContent = "Remover";
            botao.addEventListener("click", function () {
                if (confirm("Remover o usuário " + u.nome + "?")) {
                    Usuarios.remover(u.id);
                    renderizar();
                }
            });
            var tdAcao = document.createElement("td");
            tdAcao.appendChild(botao);
            linha.appendChild(tdAcao);

            corpoTabela.appendChild(linha);
        });
    }

    // textContent evita que nomes digitados virem HTML (XSS)
    function celula(texto) {
        var td = document.createElement("td");
        td.textContent = texto;
        return td;
    }

    // AAAA-MM-DD -> DD/MM/AAAA
    function formatarNascimento(data) {
        var p = data.split("-");
        return p[2] + "/" + p[1] + "/" + p[0];
    }
});

/* Cabeçalho e animações exclusivos desta página. */
/* Progressive visual enhancements. Does not override project business logic. */
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

