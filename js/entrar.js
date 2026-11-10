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

    // Mostra a senha após pressionar Enter no e-mail
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

    // Limpa a mensagem ao digitar
    emailInput.addEventListener("input", function () { mostrarMensagem(""); });
    senhaInput.addEventListener("input", function () { mostrarMensagem(""); });

    // Login: confere e-mail e senha cadastrados
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

// Função para mostrar/ocultar senha ao clicar no botão
function alternarVisibilidadeSenha() {
    var senhaInput = document.getElementById("senha");
    var btnSenha = document.getElementById("btnSenha");

    if (senhaInput.type === "password") {
        senhaInput.type = "text";
        btnSenha.textContent = "Ocultar";
    } else {
        senhaInput.type = "password";
        btnSenha.textContent = "Mostrar";
    }
}