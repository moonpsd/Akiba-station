function alternarVisibilidadeSenha() {
                var senhaInput = document.getElementById("senha");
                if (senhaInput.type === "password") {
                    senhaInput.type = "text";
                } else {
                    senhaInput.type = "password";
                }
            }

const senha = document.getElementById('senha');
    const confirmarSenha = document.getElementById('confirmarSenha');
    const mensagem = document.getElementById('mensagem');
    const form = document.getElementById('formCadastro');

    function validarSenhas() {
      // Se o campo de confirmação estiver vazio, limpa a mensagem
      if (confirmarSenha.value === '') {
        mensagem.textContent = '';
        mensagem.className = 'mensagem';
        return false;
      }

      // Verifica se as senhas são iguais
      if (senha.value === confirmarSenha.value) {
        mensagem.textContent = 'As senhas coincidem!';
        mensagem.className = 'mensagem valido';
        return true;
      } else {
        mensagem.textContent = 'As senhas não coincidem!';
        mensagem.className = 'mensagem invalido';
        return false;
      }
    }

    // Valida enquanto o usuário digita no campo de confirmação
    confirmarSenha.addEventListener('input', validarSenhas);
    
    // Atualiza a validação caso ele mude a primeira senha depois de digitar a segunda
    senha.addEventListener('input', () => {
      if (confirmarSenha.value !== '') {
        validarSenhas();
      }
    });

    // Impede o envio do formulário se as senhas forem diferentes
    form.addEventListener('submit', (event) => {
      if (!validarSenhas()) {
        event.preventDefault(); // Cancela o envio
        alert('Por favor, corrija a senha antes de enviar.');
      }
    });