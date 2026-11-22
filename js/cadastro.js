/* Akiba Station — lógica de cadastro e efeitos visuais locais. */

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
    var form = document.getElementById("formCadastro");

    var etapa1 = document.getElementById("etapa1");
    var etapa2 = document.getElementById("etapa2");
    var barra2 = document.getElementById("barra2");
    var textoEtapa = document.getElementById("textoEtapa");
    var mensagem1 = document.getElementById("mensagem1");
    var mensagem2 = document.getElementById("mensagem2");

    var nome = document.getElementById("nome");
    var usuario = document.getElementById("usuario");
    var nascimento = document.getElementById("nascimento");
    var email = document.getElementById("email");
    var senha = document.getElementById("senha");
    var confirmarSenha = document.getElementById("confirmarSenha");

    var btnContinuar = document.getElementById("btnContinuar");
    var btnVoltar = document.getElementById("btnVoltar");
    var btnCadastrar = document.getElementById("btnCadastrar");

    var etapaAtual = 1;

    // Impede datas futuras no campo de nascimento
    nascimento.max = new Date().toISOString().split("T")[0];

    // Botões Mostrar/Ocultar de cada campo de senha
    document.querySelectorAll(".btn_senha").forEach(function (botao) {
        botao.addEventListener("click", function () {
            alternarVisibilidadeSenha(botao.dataset.alvo, botao);
        });
    });

    // Remove o destaque de erro quando o usuário volta a digitar
    form.querySelectorAll("input").forEach(function (input) {
        input.addEventListener("input", function () {
            input.parentElement.classList.remove("invalido");
            mensagem1.textContent = "";
            mensagem2.textContent = "";
            mensagem2.classList.remove("sucesso");
        });
    });

    // Continuar: valida a etapa 1 e mostra a etapa 2
    btnContinuar.addEventListener("click", avancar);

    // Voltar: retorna para a etapa 1 (os dados digitados são mantidos)
    btnVoltar.addEventListener("click", function () {
        irParaEtapa(1);
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // o cadastro é salvo pelo JS (Usuarios.cadastrar)

        // Enter na etapa 1 avança em vez de cadastrar
        if (etapaAtual === 1) {
            avancar();
            return;
        }

        // Na etapa 2, valida tudo antes de salvar
        var erro = validarEtapa1() || validarEtapa2();

        if (erro) {
            // Se o erro for de um campo da etapa 1, volta para ela
            if (etapa1.contains(erro.campo)) {
                irParaEtapa(1);
                mostrarErro(erro, mensagem1);
            } else {
                mostrarErro(erro, mensagem2);
            }
            return;
        }

        btnCadastrar.disabled = true;
        var resultado = await Usuarios.cadastrar({
            nome: nome.value,
            usuario: usuario.value,
            nascimento: nascimento.value,
            email: email.value,
            senha: senha.value
        });
        btnCadastrar.disabled = false;

        if (!resultado.ok) {
            var campo = resultado.campo === "usuario" ? usuario : email;
            var erroSalvar = { campo: campo, texto: resultado.erro };

            if (etapa1.contains(campo)) {
                irParaEtapa(1);
                mostrarErro(erroSalvar, mensagem1);
            } else {
                mostrarErro(erroSalvar, mensagem2);
            }
            return;
        }

        mensagem2.classList.add("sucesso");
        mensagem2.textContent = "Cadastro realizado! Redirecionando para o login...";
        setTimeout(function () {
            window.location.href = "entrar.html";
        }, 1500);
    });

    function avancar() {
        var erro = validarEtapa1();

        if (erro) {
            mostrarErro(erro, mensagem1);
            return;
        }
        irParaEtapa(2);
    }

    function irParaEtapa(numero) {
        etapaAtual = numero;

        etapa1.classList.toggle("oculto", numero !== 1);
        etapa2.classList.toggle("oculto", numero !== 2);
        barra2.classList.toggle("ativa", numero === 2);

        textoEtapa.textContent = numero === 1
            ? "Etapa 1 de 2 · Sobre você"
            : "Etapa 2 de 2 · Dados de acesso";

        // Foco no primeiro campo da etapa exibida
        (numero === 1 ? nome : email).focus();
    }

    // Cada validação retorna o primeiro erro encontrado ou null
    function validarEtapa1() {
        if (nome.value.trim().length < 3) {
            return { campo: nome, texto: "Digite seu nome completo." };
        }

        if (!/^[A-Za-z0-9_.]{3,20}$/.test(usuario.value.trim())) {
            return {
                campo: usuario,
                texto: "Usuário: 3 a 20 caracteres (letras, números, _ ou .)."
            };
        }

        if (!nascimento.value) {
            return { campo: nascimento, texto: "Informe sua data de nascimento." };
        }

        var idade = calcularIdade(nascimento.value);
        if (idade < 0 || idade > 120) {
            return { campo: nascimento, texto: "Data de nascimento inválida." };
        }

        return null;
    }

    function validarEtapa2() {
        if (!email.checkValidity()) {
            return { campo: email, texto: "Digite um e-mail válido." };
        }

        if (senha.value.length < 8) {
            return { campo: senha, texto: "A senha deve ter pelo menos 8 caracteres." };
        }

        if (confirmarSenha.value !== senha.value) {
            return { campo: confirmarSenha, texto: "As senhas não coincidem." };
        }

        return null;
    }

    function mostrarErro(erro, areaMensagem) {
        areaMensagem.textContent = erro.texto;
        erro.campo.parentElement.classList.add("invalido");
        erro.campo.focus();
    }
});

// Calcula a idade a partir de uma data no formato AAAA-MM-DD
function calcularIdade(dataStr) {
    var hoje = new Date();
    var nasc = new Date(dataStr);
    var idade = hoje.getFullYear() - nasc.getFullYear();
    var m = hoje.getMonth() - nasc.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
        idade--;
    }
    return idade;
}

// Mostra/oculta a senha do campo indicado
function alternarVisibilidadeSenha(idCampo, botao) {
    var campo = document.getElementById(idCampo);

    if (campo.type === "password") {
        campo.type = "text";
        botao.textContent = "Ocultar";
    } else {
        campo.type = "password";
        botao.textContent = "Mostrar";
    }
}

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

