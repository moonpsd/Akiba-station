document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const indicatorsContainer = document.getElementById('indicators');
  const heroSlider = document.getElementById('heroSlider');

  let currentIndex = 0;
  const slideDuration = 6000; // Tempo em milissegundos (6 segundos)
  let slideInterval;
  let progressTimeout;

  // 1. Criar barras indicadoras de acordo com o número de slides
  slides.forEach((_, index) => {
    const indicator = document.createElement('button');
    indicator.classList.add('indicator');
    indicator.setAttribute('aria-label', `Ir para slide ${index + 1}`);

    const progressBar = document.createElement('div');
    progressBar.classList.add('indicator-progress');
    indicator.appendChild(progressBar);

    indicator.addEventListener('click', () => {
      goToSlide(index);
      resetAutoPlay();
    });

    indicatorsContainer.appendChild(indicator);
  });

  const indicators = document.querySelectorAll('.indicator');

  // 2. Atualizar Exibição do Slide Ativo
  function updateSlides() {
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Atualizar barras de progresso
    indicators.forEach((ind, idx) => {
      const bar = ind.querySelector('.indicator-progress');
      bar.style.transition = 'none';
      bar.style.width = '0%';

      if (idx === currentIndex) {
        ind.classList.add('active');
        // Pequeno atraso para acionar a transição CSS suavemente
        setTimeout(() => {
          bar.style.transition = `width ${slideDuration}ms linear`;
          bar.style.width = '100%';
        }, 50);
      } else {
        ind.classList.remove('active');
      }
    });
  }

  // 3. Mudar para Slide Específico
  function goToSlide(index) {
    if (index < 0) {
      currentIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    updateSlides();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // 4. Temporizador de Troca Automática
  function startAutoPlay() {
    updateSlides();
    slideInterval = setInterval(nextSlide, slideDuration);
  }

  function stopAutoPlay() {
    clearInterval(slideInterval);
    // Congelar visualmente a barra de progresso no momento do pause
    const activeBar = document.querySelector('.indicator.active .indicator-progress');
    if (activeBar) {
      const computedWidth = window.getComputedStyle(activeBar).width;
      activeBar.style.transition = 'none';
      activeBar.style.width = computedWidth;
    }
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Eventos de Clique nos Botões
  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoPlay();
  });

  prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoPlay();
  });

  // Pausar rotação ao passar o mouse sobre o banner
  heroSlider.addEventListener('mouseenter', stopAutoPlay);
  heroSlider.addEventListener('mouseleave', startAutoPlay);

  // Suporte a gestos de Deslize (Touch / Swipe no Mobile)
  let touchStartX = 0;
  let touchEndX = 0;

  heroSlider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  heroSlider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50; // distância mínima de deslize
    if (touchStartX - touchEndX > swipeThreshold) {
      nextSlide(); // Deslizou para esquerda
      resetAutoPlay();
    } else if (touchEndX - touchStartX > swipeThreshold) {
      prevSlide(); // Deslizou para direita
      resetAutoPlay();
    }
  }

  // Inicializar Slider
  startAutoPlay();
});