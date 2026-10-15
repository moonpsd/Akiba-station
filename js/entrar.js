document.addEventListener("DOMContentLoaded", function () {
    var emailInput = document.getElementById("email");
    var containerSenha = document.getElementById("container-senha");
    var senhaInput = document.getElementById("senha");
    var btnEntrar = document.getElementById("btnEntrar");

    // Evento para mostrar a senha após pressionar Enter no e-mail
    emailInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Evita a submissão imediata do formulário

            if (emailInput.value.trim() !== "") {
                // Exibe o campo de senha e o botão de entrar
                containerSenha.classList.remove("oculto");
                btnEntrar.classList.remove("oculto");

                // Habilita e coloca o foco direto no campo de senha
                senhaInput.disabled = false;
                senhaInput.focus();
            }
        }
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