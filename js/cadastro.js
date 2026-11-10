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
        });
    });

    // Continuar: valida a etapa 1 e mostra a etapa 2
    btnContinuar.addEventListener("click", avancar);

    // Voltar: retorna para a etapa 1 (os dados digitados são mantidos)
    btnVoltar.addEventListener("click", function () {
        irParaEtapa(1);
    });

    form.addEventListener("submit", function (event) {
        // Enter na etapa 1 avança em vez de enviar o formulário
        if (etapaAtual === 1) {
            event.preventDefault();
            avancar();
            return;
        }

        // Na etapa 2, valida tudo antes de enviar
        var erro = validarEtapa1() || validarEtapa2();

        if (erro) {
            event.preventDefault();

            // Se o erro for de um campo da etapa 1, volta para ela
            if (etapa1.contains(erro.campo)) {
                irParaEtapa(1);
                mostrarErro(erro, mensagem1);
            } else {
                mostrarErro(erro, mensagem2);
            }
        }
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