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

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const form = $("formAdmin");
  if (!form) return;

  const nome = $("nome");
  const email = $("email");
  const mensagem = $("mensagem");
  const lista = $("listaUsuarios");
  const pesquisa = $("pesquisaUsuarios");
  const contador = $("contador");
  const vazio = $("vazio");
  const excluirTodos = $("excluirTodos");

  const avisar = (texto, sucesso = false) => {
    mensagem.textContent = texto;
    mensagem.classList.toggle("sucesso", sucesso);
  };

  function renderizar() {
    const usuarios = Usuarios.listar().slice().reverse();
    const termo = pesquisa.value.trim().toLocaleLowerCase("pt-BR");
    const encontrados = usuarios.filter((u) =>
      [u.nome, u.email].some((valor) =>
        String(valor || "").toLocaleLowerCase("pt-BR").includes(termo)
      )
    );

    contador.textContent = `${encontrados.length} de ${usuarios.length} usuário(s)`;
    excluirTodos.disabled = usuarios.length === 0;
    lista.replaceChildren();
    vazio.hidden = encontrados.length > 0;
    vazio.textContent = usuarios.length === 0
      ? "Nenhum usuário cadastrado ainda."
      : "Nenhum usuário encontrado para esta pesquisa.";

    encontrados.forEach((u) => {
      const item = document.createElement("li");
      item.className = "admin-user-item";

      const dados = document.createElement("div");
      dados.className = "admin-user-data";
      const titulo = document.createElement("strong");
      titulo.textContent = u.nome || u.usuario || "Sem nome";
      const detalhe = document.createElement("span");
      detalhe.textContent = `E-mail: ${u.email || "—"}`;
      const data = document.createElement("time");
      const dataValida = u.criadoEm && !Number.isNaN(new Date(u.criadoEm).getTime());
      if (dataValida) data.dateTime = new Date(u.criadoEm).toISOString();
      data.textContent = `Cadastro: ${dataValida ? new Date(u.criadoEm).toLocaleString("pt-BR") : "Não informada"}`;
      dados.append(titulo, detalhe, data);

      const remover = document.createElement("button");
      remover.type = "button";
      remover.className = "btn_remover";
      remover.textContent = "Excluir";
      remover.setAttribute("aria-label", `Excluir ${u.nome || u.email}`);
      remover.addEventListener("click", () => {
        if (!confirm(`Excluir o usuário ${u.nome || u.email}?`)) return;
        Usuarios.remover(u.id);
        renderizar();
        avisar("Usuário excluído.", true);
      });
      item.append(dados, remover);
      lista.appendChild(item);
    });
  }

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const valorNome = nome.value.trim();
    const valorEmail = email.value.trim();

    if (valorNome.length < 3) {
      avisar("Digite um nome de usuário com pelo menos 3 caracteres.");
      nome.focus();
      return;
    }
    if (!email.checkValidity() || !valorEmail) {
      avisar("Digite um e-mail válido.");
      email.focus();
      return;
    }

    const resultado = Usuarios.adicionarPeloAdmin({ nome: valorNome, email: valorEmail });
    if (!resultado.ok) {
      avisar(resultado.erro);
      email.focus();
      return;
    }
    form.reset();
    avisar("Usuário cadastrado com sucesso!", true);
    renderizar();
    nome.focus();
  });

  $("limparCampos").addEventListener("click", () => {
    form.reset();
    avisar("");
    form.querySelectorAll(".invalido").forEach((el) => el.classList.remove("invalido"));
    nome.focus();
  });

  excluirTodos.addEventListener("click", () => {
    const usuarios = Usuarios.listar();
    if (!usuarios.length || !confirm(`Excluir os ${usuarios.length} usuários cadastrados? Esta ação não pode ser desfeita.`)) return;
    localStorage.setItem("heads_usuarios", JSON.stringify([]));
    localStorage.removeItem("heads_sessao");
    sessionStorage.removeItem("usuarioLogado");
    renderizar();
    avisar("Todos os usuários foram excluídos.", true);
  });

  pesquisa.addEventListener("input", renderizar);
  [nome, email].forEach((campo) => campo.addEventListener("input", () => avisar("")));
  renderizar();
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

