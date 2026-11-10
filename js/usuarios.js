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