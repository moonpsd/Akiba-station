document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const indicatorsContainer = document.getElementById('indicators');
  const heroSlider = document.getElementById('heroSlider');

  let currentIndex = 0;
  const slideDuration = 6000; // Tempo em milissegundos (6 segundos)
  let slideInterval;

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
    slide.classList.toggle('active', idx === currentIndex);
  });

  indicators.forEach((ind, idx) => {
    const bar = ind.querySelector('.indicator-progress');

    // Remove a animação antes de definir o estado
    bar.style.transition = 'none';

    if (idx < currentIndex) {
      // Slides que já passaram
      bar.style.width = '100%';
      ind.classList.remove('active');

    } else if (idx === currentIndex) {
      // Slide atual
      bar.style.width = '0%';
      ind.classList.add('active');

      // Força o navegador a aplicar o 0% antes de começar
      void bar.offsetWidth;

      bar.style.transition = `width ${slideDuration}ms linear`;
      bar.style.width = '100%';

    } else {
      // Slides que ainda não chegaram
      bar.style.width = '0%';
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
  clearInterval(slideInterval);

  updateSlides();

  slideInterval = setInterval(() => {
    nextSlide();
  }, slideDuration);
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

// ======================================================
// CONFIGURAÇÕES
// ======================================================

const HERO_INTERVAL = 7000;


// ======================================================
// HERO SLIDER
// ======================================================

const slides = document.querySelectorAll(".slide");
const indicatorsContainer = document.getElementById("indicators");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let currentSlide = 0;
let heroTimer;


// ======================================================
// CRIAR INDICADORES DO HERO
// ======================================================

function createIndicators() {

    if (!indicatorsContainer) return;

    indicatorsContainer.innerHTML = "";

    slides.forEach((_, index) => {

        const indicator = document.createElement("button");

        indicator.classList.add("indicator");

        indicator.innerHTML = `
            <span class="indicator-progress"></span>
        `;

        indicator.addEventListener("click", () => {

            currentSlide = index;

            showSlide(currentSlide);

            resetHeroTimer();

        });

        indicatorsContainer.appendChild(indicator);

    });

}


// ======================================================
// MOSTRAR SLIDE
// ======================================================

function showSlide(index) {

    slides.forEach(slide => {
        slide.classList.remove("active");
    });


    const indicators =
        document.querySelectorAll(".indicator");


    indicators.forEach(indicator => {

        indicator.classList.remove("active");

        const progress =
            indicator.querySelector(".indicator-progress");


        if (progress) {

            progress.style.transition = "none";

            progress.style.width = "0%";

        }

    });


    if (!slides[index]) return;


    slides[index].classList.add("active");


    if (indicators[index]) {

        indicators[index].classList.add("active");


        const progress =
            indicators[index]
                .querySelector(".indicator-progress");


        if (progress) {

            void progress.offsetWidth;


            progress.style.transition =
                `width ${HERO_INTERVAL}ms linear`;


            progress.style.width = "100%";

        }

    }

}


// ======================================================
// PRÓXIMO SLIDE
// ======================================================

function nextHeroSlide() {

    currentSlide++;

    if (currentSlide >= slides.length) {

        currentSlide = 0;

    }

    showSlide(currentSlide);

}


// ======================================================
// SLIDE ANTERIOR
// ======================================================

function prevHeroSlide() {

    currentSlide--;

    if (currentSlide < 0) {

        currentSlide = slides.length - 1;

    }

    showSlide(currentSlide);

}


// ======================================================
// TIMER HERO
// ======================================================

function startHeroTimer() {

    clearInterval(heroTimer);


    heroTimer = setInterval(() => {

        nextHeroSlide();

    }, HERO_INTERVAL);

}


function resetHeroTimer() {

    startHeroTimer();

}


// ======================================================
// BOTÕES HERO
// ======================================================

nextBtn?.addEventListener("click", () => {

    nextHeroSlide();

    resetHeroTimer();

});


prevBtn?.addEventListener("click", () => {

    prevHeroSlide();

    resetHeroTimer();

});


// ======================================================
// INICIAR HERO
// ======================================================

if (slides.length > 0) {

    createIndicators();

    showSlide(currentSlide);

    startHeroTimer();

}



// ======================================================
// ======================================================
// ANIMES
// ======================================================
// ======================================================


// ======================================================
// EM ALTA
// ======================================================

const trendingAnimes = [

    {
        title: "MF Ghost",
        image: "./imgs/mf-ghost.jpg",
        info: "Dub | Leg"
    },

    {
        title: "Jujutsu Kaisen",
        image: "./imgs/jujutsu.jpg",
        info: "Dub | Leg"
    },

    {
        title: "Solo Leveling",
        image: "./imgs/solo-leveling.jpg",
        info: "Dub | Leg"
    },

    {
        title: "Kusuriya no Hitorigoto",
        image: "./imgs/kusuriya.jpg",
        info: "Leg"
    },

    {
        title: "Chainsaw Man",
        image: "./imgs/chainsaw.jpg",
        info: "Dub | Leg"
    },

    {
        title: "Attack on Titan",
        image: "./imgs/aot.jpg",
        info: "Dub | Leg"
    }

];


// ======================================================
// EM BREVE
// ======================================================

const comingAnimes = [

    {
        title: "Dandadan",
        image: "./imgs/dandadan.jpg",
        info: "Em breve"
    },

    {
        title: "Kaiju No. 8",
        image: "./imgs/kaiju.jpg",
        info: "Em breve"
    },

    {
        title: "Solo Leveling",
        image: "./imgs/solo-leveling.jpg",
        info: "Nova temporada"
    },

    {
        title: "Jujutsu Kaisen",
        image: "./imgs/jujutsu.jpg",
        info: "Nova temporada"
    },

    {
        title: "Chainsaw Man",
        image: "./imgs/chainsaw.jpg",
        info: "Em breve"
    },

    {
        title: "Attack on Titan",
        image: "./imgs/aot.jpg",
        info: "Em breve"
    }

];


// ======================================================
// DUBLAGENS
// ======================================================

const dubbedAnimes = [

    {
        title: "MF Ghost",
        image: "./imgs/mf-ghost.jpg",
        info: "Dub | Leg"
    },

    {
        title: "Jujutsu Kaisen",
        image: "./imgs/jujutsu.jpg",
        info: "Dub"
    },

    {
        title: "Solo Leveling",
        image: "./imgs/solo-leveling.jpg",
        info: "Dub"
    },

    {
        title: "Chainsaw Man",
        image: "./imgs/chainsaw.jpg",
        info: "Dub"
    },

    {
        title: "Attack on Titan",
        image: "./imgs/aot.jpg",
        info: "Dub"
    },

    {
        title: "Kusuriya no Hitorigoto",
        image: "./imgs/kusuriya.jpg",
        info: "Dub"
    },

    {
        title: "NegaPosi Angler",
        image: "./imgs/negaposi.jpg",
        info: "Dub"
    },

    {
        title: "Dandadan",
        image: "./imgs/dandadan.jpg",
        info: "Dub"
    }

];



// ======================================================
// CRIAR CARD DE ANIME
// ======================================================

function createAnimeCard(anime) {

    return `
        <article class="anime-card">

            <div class="anime-card-image">

                <img
                    src="${anime.image}"
                    alt="${anime.title}"
                    loading="lazy"
                >

            </div>

            <h3>${anime.title}</h3>

            <p>${anime.info}</p>

        </article>
    `;

}


// ======================================================
// RENDERIZAR CARDS
// ======================================================

function renderAnimeCards(list, elementId) {

    const container =
        document.getElementById(elementId);


    if (!container) return;


    container.innerHTML =
        list
            .map(createAnimeCard)
            .join("");

}


// ======================================================
// RENDERIZAÇÃO DOS CARDS
// ======================================================

renderAnimeCards(
    trendingAnimes,
    "trendingTrack"
);


renderAnimeCards(
    comingAnimes,
    "comingTrack"
);


renderAnimeCards(
    dubbedAnimes,
    "dubbedTrack"
);



// ======================================================
// ======================================================
// CARROSSÉIS
// ======================================================
// ======================================================

function getCardDistance(slider) {

    const card =
        slider.querySelector(".anime-card");


    if (!card) return 0;


    const sliderStyle =
        getComputedStyle(slider);


    const gap =
        parseFloat(sliderStyle.gap) || 0;


    return (
        card.getBoundingClientRect().width
        +
        gap
    );

}


// ======================================================
// PRÓXIMOS CARDS
// ======================================================

function nextCards(slider) {

    const distance =
        getCardDistance(slider);


    if (!distance) return;


    const maxScroll =
        slider.scrollWidth
        -
        slider.clientWidth;


    // Chegou no final?
    // Volta para o começo.

    if (
        slider.scrollLeft + distance
        >= maxScroll - 5
    ) {

        slider.scrollTo({

            left: 0,

            behavior: "smooth"

        });

        return;

    }


    slider.scrollBy({

        left: distance,

        behavior: "smooth"

    });

}


// ======================================================
// CARDS ANTERIORES
// ======================================================

function prevCards(slider) {

    const distance =
        getCardDistance(slider);


    if (!distance) return;


    // Está no começo?
    // Vai para o final.

    if (slider.scrollLeft <= 5) {

        const maxScroll =
            slider.scrollWidth
            -
            slider.clientWidth;


        slider.scrollTo({

            left: maxScroll,

            behavior: "smooth"

        });

        return;

    }


    slider.scrollBy({

        left: -distance,

        behavior: "smooth"

    });

}


// ======================================================
// BOTÕES DOS CARROSSÉIS
// ======================================================

document
    .querySelectorAll(".cards-arrow")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const sliderId =
                    button.dataset.slider;


                const slider =
                    document.getElementById(
                        sliderId
                    );


                if (!slider) return;


                if (
                    button.classList
                        .contains("cards-next")
                ) {

                    nextCards(slider);

                }

                else {

                    prevCards(slider);

                }

            }
        );

    });



// ======================================================
// ======================================================
// REVIEWS DOS USUÁRIOS
// ======================================================
// ======================================================

/*

Agora cada review possui:

user   = nome do usuário
avatar = foto do usuário
anime  = anime avaliado
rating = nota
text   = comentário

*/

const reviews = [

    {
        user: "Gabriel",
        avatar: "./imgs/users/user-1.jpg",

        anime: "Jujutsu Kaisen",

        rating: "4.8",

        text:
            "A animação das lutas é absurda. Gostei bastante da temporada e dos personagens."
    },


    {
        user: "Lucas",
        avatar: "./imgs/users/user-2.jpg",

        anime: "Solo Leveling",

        rating: "4.9",

        text:
            "Animação excelente e batalhas muito bem construídas. Uma das melhores adaptações recentes."
    },


    {
        user: "Mariana",
        avatar: "./imgs/users/user-3.jpg",

        anime: "MF Ghost",

        rating: "4.4",

        text:
            "Muito bom para quem gosta de automobilismo. As corridas ficaram muito legais."
    },


    {
        user: "Pedro",
        avatar: "./imgs/users/user-4.jpg",

        anime: "Chainsaw Man",

        rating: "4.6",

        text:
            "Visual incrível, personagens interessantes e uma direção completamente diferente."
    },


    {
        user: "Ana",
        avatar: "./imgs/users/user-5.jpg",

        anime: "Kusuriya no Hitorigoto",

        rating: "4.9",

        text:
            "Maomao é uma protagonista excelente. Os mistérios deixam cada episódio interessante."
    },


    {
        user: "Rafael",
        avatar: "./imgs/users/user-6.jpg",

        anime: "Attack on Titan",

        rating: "5.0",

        text:
            "Uma história marcante, complexa e cheia de momentos memoráveis."
    },


    {
        user: "Julia",
        avatar: "./imgs/users/user-7.jpg",

        anime: "Dandadan",

        rating: "4.7",

        text:
            "Muito divertido e completamente maluco. A animação ficou incrível."
    }

];



// ======================================================
// CRIAR REVIEW
// ======================================================

function createReview(review) {

    return `
        <article class="review-card">

            <!-- FOTO DO USUÁRIO -->

            <img
                class="review-avatar"
                src="${review.avatar}"
                alt="${review.user}"
                loading="lazy"
            >


            <div class="review-info">

                <!-- NOME DO ANIME -->

                <h3>
                    ${review.anime}
                </h3>


                <!-- NOTA -->

                <div class="review-rating">

                    ★ ${review.rating}

                </div>


                <!-- COMENTÁRIO -->

                <p>
                    ${review.text}
                </p>

            </div>

        </article>
    `;

}



// ======================================================
// RENDERIZAR REVIEWS
// ======================================================

function renderReviews() {

    const track =
        document.getElementById(
            "reviewsTrack"
        );


    if (!track) return;


    /*
        DUPLICAMOS AS REVIEWS

        Isso permite criar:

        1
        2
        3
        4
        5

        1
        2
        3
        4
        5

        Ao chegar na segunda sequência,
        voltamos para a primeira.

        Visualmente fica infinito.
    */

    const duplicatedReviews = [

        ...reviews,

        ...reviews

    ];


    track.innerHTML =

        duplicatedReviews

            .map(createReview)

            .join("");

}



// ======================================================
// PAUSAR REVIEW NO HOVER
// ======================================================

let reviewsPaused = false;


const reviewsPanel =
    document.querySelector(
        ".reviews-panel"
    );


reviewsPanel?.addEventListener(
    "mouseenter",
    () => {

        reviewsPaused = true;

    }
);


reviewsPanel?.addEventListener(
    "mouseleave",
    () => {

        reviewsPaused = false;

    }
);



// ======================================================
// ANIMAÇÃO INFINITA DAS REVIEWS
// ======================================================

function startReviewsAnimation() {

    const track =
        document.getElementById(
            "reviewsTrack"
        );


    if (!track) return;


    let position = 0;


    // ================================
    // VELOCIDADE
    // ================================
    //
    // 0.15 = lento
    // 0.30 = normal
    // 0.50 = rápido
    // 1.00 = muito rápido

    const speed = 0.30;


    function animate() {


        if (!reviewsPaused) {


            position += speed;


            const halfHeight =
                track.scrollHeight / 2;


            // ==========================
            // RESET INVISÍVEL
            // ==========================

            if (
                position >= halfHeight
            ) {

                position = 0;

            }


            track.style.transform =
                `translate3d(
                    0,
                    -${position}px,
                    0
                )`;

        }


        requestAnimationFrame(
            animate
        );

    }


    animate();

}



// ======================================================
// INICIALIZAR REVIEWS
// ======================================================

renderReviews();


window.addEventListener(
    "load",
    () => {

        startReviewsAnimation();

    }
);



// ======================================================
// LUCIDE
// ======================================================

if (
    typeof lucide !== "undefined"
) {

    lucide.createIcons();

}
