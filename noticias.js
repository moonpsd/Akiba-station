
console.log("script.js carregado com sucesso!");

// ==========================================
// 1. FUNÇÃO PARA ABRIR O MODAL
// ==========================================

window.abrirModal = function(event, titulo, categoria, imagem, texto) {

    event.preventDefault();

    console.log("Abrindo notícia:", titulo);

    // Pega os elementos do modal
    let modal = document.getElementById('meuModal');
    let modalConteudo = document.querySelector('.modal-conteudo');

    // Preenche as informações da notícia
    document.getElementById('modal-tit').innerText = titulo;
    document.getElementById('modal-cat').innerText = categoria;
    document.getElementById('modal-img').src = imagem;
    document.getElementById('modal-texto').innerText = texto;

    // Reinicia a animação do modal
    modalConteudo.style.animation = 'none';

    void modalConteudo.offsetWidth;

    modalConteudo.style.animation = 'modalFadeIn 0.4s ease-out forwards';

    // Mostra o modal
    modal.style.display = 'flex';

};


// ==========================================
// 2. FUNÇÃO PARA FECHAR O MODAL
// ==========================================

window.fecharModal = function() {

    let modal = document.getElementById('meuModal');

    modal.style.display = 'none';

};


// ==========================================
// 3. FUNÇÃO CARREGAR MAIS NOTÍCIAS
// ==========================================

window.mostrarMaisNoticias = function() {

    let noticiasEscondidas = document.querySelectorAll('.noticia-extra');

    noticiasEscondidas.forEach(function(noticia, index) {

        setTimeout(function() {

            noticia.style.display = 'block';

            noticia.style.animation = 'fadeUp 0.6s ease-out forwards';

        }, index * 100);

    });

    // Esconde o botão depois de carregar as notícias
    document.getElementById('btn-carregar').style.display = 'none';

};


// ==========================================
// 4. FECHAR MODAL CLICANDO NO FUNDO
// ==========================================

window.addEventListener('click', function(event) {

    let modal = document.getElementById('meuModal');

    if (event.target === modal) {

        window.fecharModal();

    }

});


// ==========================================
// 5. FECHAR MODAL APERTANDO ESC
// ==========================================

document.addEventListener('keydown', function(event) {

    if (event.key === 'Escape') {

        window.fecharModal();

    }

});
