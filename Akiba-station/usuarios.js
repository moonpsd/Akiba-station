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