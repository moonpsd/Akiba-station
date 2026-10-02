document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const indicatorsContainer = document.getElementById("indicators");
  const heroSlider = document.getElementById("heroSlider");

  let currentIndex = 0;
  const slideDuration = 6000;
  let slideInterval;

  if (indicatorsContainer) {
    slides.forEach((_, index) => {
      const indicator = document.createElement("button");

      indicator.classList.add("indicator");
      indicator.setAttribute("aria-label", `Ir para slide ${index + 1}`);

      const progressBar = document.createElement("div");

      progressBar.classList.add("indicator-progress");

      indicator.appendChild(progressBar);

      indicator.addEventListener("click", () => {
        goToSlide(index);
        resetAutoPlay();
      });

      indicatorsContainer.appendChild(indicator);
    });
  }

  const indicators = document.querySelectorAll(".indicator");

  function updateSlides() {
    slides.forEach((slide, idx) => {
      slide.classList.toggle("active", idx === currentIndex);
    });

    indicators.forEach((indicator, idx) => {
      const bar = indicator.querySelector(".indicator-progress");

      if (!bar) return;

      bar.style.transition = "none";

      if (idx < currentIndex) {
        bar.style.width = "100%";
        indicator.classList.remove("active");
      } else if (idx === currentIndex) {
        bar.style.width = "0%";
        indicator.classList.add("active");

        void bar.offsetWidth;

        bar.style.transition = `width ${slideDuration}ms linear`;
        bar.style.width = "100%";
      } else {
        bar.style.width = "0%";
        indicator.classList.remove("active");
      }
    });
  }

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

  function startAutoPlay() {
    clearInterval(slideInterval);

    updateSlides();

    slideInterval = setInterval(() => {
      nextSlide();
    }, slideDuration);
  }

  function stopAutoPlay() {
    clearInterval(slideInterval);

    const activeBar = document.querySelector(
      ".indicator.active .indicator-progress"
    );

    if (activeBar) {
      const computedWidth = window.getComputedStyle(activeBar).width;

      activeBar.style.transition = "none";
      activeBar.style.width = computedWidth;
    }
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  nextBtn?.addEventListener("click", () => {
    nextSlide();
    resetAutoPlay();
  });

  prevBtn?.addEventListener("click", () => {
    prevSlide();
    resetAutoPlay();
  });

  heroSlider?.addEventListener("mouseenter", stopAutoPlay);
  heroSlider?.addEventListener("mouseleave", startAutoPlay);

  let touchStartX = 0;
  let touchEndX = 0;

  heroSlider?.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    {
      passive: true,
    }
  );

  heroSlider?.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;

      handleSwipe();
    },
    {
      passive: true,
    }
  );

  function handleSwipe() {
    const swipeThreshold = 50;

    if (touchStartX - touchEndX > swipeThreshold) {
      nextSlide();
      resetAutoPlay();
    } else if (touchEndX - touchStartX > swipeThreshold) {
      prevSlide();
      resetAutoPlay();
    }
  }

  if (slides.length > 0) {
    startAutoPlay();
  }
});


const trendingAnimes = [
  {
    title: "Black Cover",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx97940-fyh8o7gNbha0.png",
    info: "Dub | Leg",
  },

  {
    title: "Attack on Titan",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx110277-sKUNXAsWMNFw.jpg",
    info: "Dub | Leg",
  },

  {
    title: "Kusuriya no Hitorigoto",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176301-TIGmldLffQGX.jpg",
    info: "Dub | Leg",
  },

  {
    title: "Mushoku Tensei: Jobless Reincarnation",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx178789-hNXjKFzUq7mk.jpg",
    info: "Leg",
  },

  {
    title: "Re:Zero",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx189046-yaHWtS5FII46.jpg",
    info: "Dub | Leg",
  },

  {
    title: "The time I Got Reincarned as a Slime",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101280-tDxCVJm714nt.jpg",
    info: "Dub | Leg",
  },

  {
    title: "The Exiled Heavy Knight Knows How to Game th System",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx180136-gtMTCRlOD4OE.jpg",
    info: "Dub | Leg",
  },

  {
    title: "Boku no Hero",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx182896-mvxTVHGdDB4q.jpg",
    info: "Dub | Leg",
  },

  {
    title: "Jujutsu Kaisen",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg",
    info: "Dub | Leg",
  },

  {
    title: "Solo Leveling",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png",
    info: "Dub | Leg",
  },

  {
    title: "Clevatess",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx178869-qiEz0gQD8H5N.png",
    info: "Dub | Leg",
  },

  {
    title: "Dragon Ball Z",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx813-ZhnFNOeCU5dQ.png",
    info: "Dub | Leg",
  },
];


const comingAnimes = [
  {
    title: "Firefly Wedding",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx205909-DM0fAzNQulod.jpg",
    info: "A estréia da série será no dia 9/10",
  },

  {
    title: "Hello, I am a Witch and my Crush Wants me to Make a Love Potion!",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b207191-MV0uJNxN7LNY.jpg",
    info: "A estréia da série será no dia 5/10",
  },

  {
    title: "Paw & Palaces",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx166443-0DPdxpZYHRWk.jpg",
    info: "A estréia da série será no dia 10/10",
  },

  {
    title:
      "Even Though I'm a Super Timid Noble Girl, I Accepted the Bet From My Cunning Fiancé",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx200455-P3XStRQMJ7Di.png",
    info: "A estréia da série será no dia 4/10",
  },

  {
    title: "Uncle's Obsession with Cute Things",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx202079-nwBpDUms0Bab.png",
    info: "A estréia da série será no dia 4/10",
  },

  {
    title: "A Tale of the Secret Saint",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx187402-ReKkLwFmMV3q.jpg",
    info: "A estréia da série será no dia 3/10",
  },

  {
    title:
      "Reborn as a Space Mercenary: I Woke Up Piloting the Strongest Starship!",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx186541-caYpLsLmbCh7.jpg",
    info: "A estréia da série será no dia 4/10",
  },

  {
    title: "The Laid-Off Cheat-Granting Mage Enjoys a Second Lease on Life",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b207329-6VPeZIDfF4Sr.png",
    info: "A estréia da série será no dia 6/10",
  },

  {
    title: "The Vermilion Mask",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx195571-fvj7u5GI7BRT.jpg",
    info: "A estréia da série será no dia 10/10",
  },

  {
    title: "Romelia War Chronicle",
    image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx180894-o3pz4DWFm3je.png",
    info: "A estréia da série será no dia 3/10",
  },
];


const inspiredAnime = [
  {
    title: "MF Ghost",
    image: "./imgs/mf-ghost.jpg",
    info: "Dub | Leg",
  },

  {
    title: "Jujutsu Kaisen",
    image: "./imgs/jujutsu.jpg",
    info: "Dub",
  },

  {
    title: "Solo Leveling",
    image: "./imgs/solo-leveling.jpg",
    info: "Dub",
  },

  {
    title: "Chainsaw Man",
    image: "./imgs/chainsaw.jpg",
    info: "Dub",
  },

  {
    title: "Attack on Titan",
    image: "./imgs/aot.jpg",
    info: "Dub",
  },

  {
    title: "Kusuriya no Hitorigoto",
    image: "./imgs/kusuriya.jpg",
    info: "Dub",
  },

  {
    title: "NegaPosi Angler",
    image: "./imgs/negaposi.jpg",
    info: "Dub",
  },

  {
    title: "Dandadan",
    image: "./imgs/dandadan.jpg",
    info: "Dub",
  },

  {
    title: "Kaiju No. 8",
    image: "./imgs/kaiju.jpg",
    info: "Dub",
  },

  {
    title: "Demon Slayer",
    image: "./imgs/demon-slayer.jpg",
    info: "Dub",
  },

  {
    title: "Blue Lock",
    image: "./imgs/blue-lock.jpg",
    info: "Dub",
  },

  {
    title: "Spy x Family",
    image: "./imgs/spy-family.jpg",
    info: "Dub",
  },
];


const dubbedAnimes = [
  {
    title: "MF Ghost",
    image: "./imgs/mf-ghost.jpg",
    info: "Dub | Leg",
  },

  {
    title: "Jujutsu Kaisen",
    image: "./imgs/jujutsu.jpg",
    info: "Dub",
  },

  {
    title: "Solo Leveling",
    image: "./imgs/solo-leveling.jpg",
    info: "Dub",
  },

  {
    title: "Chainsaw Man",
    image: "./imgs/chainsaw.jpg",
    info: "Dub",
  },

  {
    title: "Attack on Titan",
    image: "./imgs/aot.jpg",
    info: "Dub",
  },

  {
    title: "Kusuriya no Hitorigoto",
    image: "./imgs/kusuriya.jpg",
    info: "Dub",
  },

  {
    title: "NegaPosi Angler",
    image: "./imgs/negaposi.jpg",
    info: "Dub",
  },

  {
    title: "Dandadan",
    image: "./imgs/dandadan.jpg",
    info: "Dub",
  },

  {
    title: "Kaiju No. 8",
    image: "./imgs/kaiju.jpg",
    info: "Dub",
  },

  {
    title: "Demon Slayer",
    image: "./imgs/demon-slayer.jpg",
    info: "Dub",
  },

  {
    title: "Blue Lock",
    image: "./imgs/blue-lock.jpg",
    info: "Dub",
  },

  {
    title: "Spy x Family",
    image: "./imgs/spy-family.jpg",
    info: "Dub",
  },
];


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


function renderAnimeCards(list, elementId) {
  const container = document.getElementById(elementId);

  if (!container) return;

  container.innerHTML = list.map(createAnimeCard).join("");
}


renderAnimeCards(trendingAnimes, "trendingTrack");
renderAnimeCards(comingAnimes, "comingTrack");
renderAnimeCards(inspiredAnime, "inspiTrack");
renderAnimeCards(dubbedAnimes, "dubbedTrack");


function getCardDistance(slider) {
  const card = slider.querySelector(".anime-card");

  if (!card) return 0;

  const sliderStyle = getComputedStyle(slider);

  const gap = parseFloat(sliderStyle.gap) || 0;

  return card.getBoundingClientRect().width + gap;
}


function setupInfiniteSlider(slider) {
  const originalCards = [...slider.children];

  if (originalCards.length === 0) return;

  slider.dataset.originalCount = originalCards.length;

  originalCards.forEach((card) => {
    const clone = card.cloneNode(true);

    clone.setAttribute("aria-hidden", "true");

    slider.appendChild(clone);
  });
}


function nextCards(slider) {
  const distance = getCardDistance(slider);

  if (!distance) return;

  const originalCount = Number(slider.dataset.originalCount);

  const originalWidth = distance * originalCount;

  if (slider.scrollLeft >= originalWidth - 5) {
    slider.scrollTo({
      left: slider.scrollLeft - originalWidth,
      behavior: "instant",
    });
  }

  requestAnimationFrame(() => {
    slider.scrollBy({
      left: distance,
      behavior: "smooth",
    });
  });
}


function prevCards(slider) {
  const distance = getCardDistance(slider);

  if (!distance) return;

  const originalCount = Number(slider.dataset.originalCount);

  const originalWidth = distance * originalCount;

  if (slider.scrollLeft <= 5) {
    slider.scrollTo({
      left: originalWidth,
      behavior: "instant",
    });
  }

  requestAnimationFrame(() => {
    slider.scrollBy({
      left: -distance,
      behavior: "smooth",
    });
  });
}


function normalizeSliderPosition(slider) {
  const distance = getCardDistance(slider);

  if (!distance) return;

  const originalCount = Number(slider.dataset.originalCount);

  if (!originalCount) return;

  const originalWidth = distance * originalCount;

  if (slider.scrollLeft >= originalWidth) {
    slider.scrollLeft -= originalWidth;
  }
}


const animeSliders = document.querySelectorAll(".cards-track");


animeSliders.forEach((slider) => {
  setupInfiniteSlider(slider);

  let scrollTimer;

  slider.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);

    scrollTimer = setTimeout(() => {
      normalizeSliderPosition(slider);
    }, 150);
  });
});


document.querySelectorAll(".cards-arrow").forEach((button) => {
  button.addEventListener("click", () => {
    const sliderId = button.dataset.slider;

    const slider = document.getElementById(sliderId);

    if (!slider) return;

    if (button.classList.contains("cards-next")) {
      nextCards(slider);
    } else {
      prevCards(slider);
    }
  });
});


const reviews = [
  {
    user: "Gabriel Nakamura",
    avatar: "./imgs/Avatar-Reviews/av-1.jpg",
    anime: "Sangatsu no Raion",
    rating: "5.0",
    text:
      "Um retrato realista da vida. Todos os aspectos bons e ruins são explorados de forma minuciosa, com direção e produção excepcionais.",
  },

  {
    user: "User 00",
    avatar: "./imgs/Avatar-Reviews/av-2.jpg",
    anime: "Houkago Teibou Nisshi",
    rating: "4.5",
    text:
      "Uma série relaxante sobre a alegria de descobrir uma nova paixão que, infelizmente, passou despercebida devido à sua premissa.",
  },

  {
    user: "Matsumura",
    avatar: "./imgs/Avatar-Reviews/av-3.png",
    anime: "Kusuriya no Hitorigoto",
    rating: "5.0",
    text:
      "Hilária, cativante e envolvente — Maomao faz de tudo.",
  },

  {
    user: "PVMNS",
    avatar: "./imgs/Avatar-Reviews/av-4.png",
    anime: "The Exiled Heavy Knight Knows How to Game the System",
    rating: "4.7",
    text:
      "Anime divertido, com boas lutas e um protagonista carismático. A evolução é bem interessante!",
  },

  {
    user: "User 00",
    avatar: "./imgs/users/user-5.jpg",
    anime: "Kusuriya no Hitorigoto",
    rating: "4.9",
    text:
      "Maomao é uma protagonista excelente. Os mistérios deixam cada episódio interessante.",
  },

  {
    user: "User 00",
    avatar: "./imgs/users/user-6.jpg",
    anime: "Attack on Titan",
    rating: "5.0",
    text:
      "Uma história marcante, complexa e cheia de momentos memoráveis.",
  },

  {
    user: "User 00",
    avatar: "./imgs/users/user-7.jpg",
    anime: "Dandadan",
    rating: "4.7",
    text:
      "Muito divertido e completamente maluco. A animação ficou incrível.",
  },
];


function createReview(review) {
  return `
    <article class="review-card">

      <img
        class="review-avatar"
        src="${review.avatar}"
        alt="Avatar de ${review.user}"
        loading="lazy"
      >

      <div class="review-content">

        <div class="review-header">

          <span class="review-user">
            ${review.user}
          </span>

          <span class="review-rating">
            ★ ${review.rating}
          </span>

        </div>

        <h3 class="review-anime">
          ${review.anime}
        </h3>

        <p class="review-text">
          ${review.text}
        </p>

      </div>

    </article>
  `;
}


function createReviewsGroup(className, hidden = false) {
  const group = document.createElement("div");

  group.className = `reviews-group ${className}`;

  if (hidden) {
    group.setAttribute("aria-hidden", "true");
  }

  group.innerHTML = reviews.map(createReview).join("");

  return group;
}


function renderReviews() {
  const track = document.getElementById("reviewsTrack");

  if (!track) return;

  track.innerHTML = "";

  const originalGroup = createReviewsGroup(
    "reviews-group-original"
  );

  const clonedGroup = createReviewsGroup(
    "reviews-group-clone",
    true
  );

  track.appendChild(originalGroup);
  track.appendChild(clonedGroup);
}


let reviewsPaused = false;


const reviewsPanel = document.querySelector(".reviews-panel");


reviewsPanel?.addEventListener("mouseenter", () => {
  reviewsPaused = true;
});


reviewsPanel?.addEventListener("mouseleave", () => {
  reviewsPaused = false;
});


function startReviewsAnimation() {
  const track = document.getElementById("reviewsTrack");

  const originalGroup = track?.querySelector(
    ".reviews-group-original"
  );

  if (!track || !originalGroup) {
    return;
  }

  let position = 0;
  let lastTime = performance.now();

  const pixelsPerSecond = 18;

  function animate(currentTime) {
    const deltaTime = Math.min(
      currentTime - lastTime,
      50
    );

    lastTime = currentTime;

    if (!reviewsPaused) {
      position +=
        pixelsPerSecond *
        (deltaTime / 1000);

      const loopHeight =
        originalGroup.offsetHeight;

      if (
        loopHeight > 0 &&
        position >= loopHeight
      ) {
        position -= loopHeight;
      }

      track.style.transform =
        `translate3d(0, -${position}px, 0)`;
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}


renderReviews();


window.addEventListener("load", () => {
  startReviewsAnimation();
});


if (typeof lucide !== "undefined") {
  lucide.createIcons();
}