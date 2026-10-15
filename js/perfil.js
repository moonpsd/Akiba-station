
const API = "https://graphql.anilist.co";
const USER = "moonpsd";

const fallback = "https://placehold.co/300x450/23252b/ffffff?text=Anime";

const activities = [
  ["completed", "Chihayafuru", "2 weeks ago"],
  ["watched", "Futsutsuka na Akujo de wa Gozaimasu ga: Suuguu Chouso Torikae Den", "4 weeks ago", 10],
  ["planning", "Tsuritama", "1 month ago"],
  ["planning", "NHK ni Youkoso!", "1 month ago"],
  ["watched", "NegaPosi Angler", "1 month ago", 5],
  ["completed", "Tonikaku Kawaii", "1 month ago"],
  ["completed", "Tokidoki Bosotto Rossiya-go de Dereru Tonari no Alya-san Season 2", "1 month ago"],
  ["completed", "Seihantai na Kimi to Boku", "1 month ago"],
  ["completed", "Kono Subarashii Sekai ni Shukufuku wo!", "1 month ago"],
  ["completed", "Shinigami Bocchan to Kuro Maid", "1 month ago"],
  ["completed", "Shinigami Bocchan to Kuro Maid 2nd Season", "1 month ago"],
  ["completed", "Shinigami Bocchan to Kuro Maid 3rd Season", "1 month ago"],
  ["completed", "Tomo-chan wa Onnanoko!", "1 month ago"],
  ["completed", "Kaguya-sama wa Kokurasetai: Tensaitachi no Renai Zunousen", "1 month ago"],
  ["watched", "mono", "1 month ago", 4],
  ["completed", "Houkago Teibou Nisshi", "1 month ago"],
  ["watched", "Houkago Teibou Nisshi", "1 month ago", 8],
  ["completed", "Heroine? Seijo? Iie, All Works Maid desu (Ko)!", "1 month ago"],
  ["completed", "Hyouken no Majutsushi ga Sekai wo Suberu", "2 months ago"],
  ["watched", "Bakemonogatari", "2 months ago", 4],
  ["completed", "Saint Seiya: THE LOST CANVAS - Meiou Shinwa", "2 months ago"],
  ["completed", "Dr. STONE", "2 months ago"],
  ["completed", "Kusuriya no Hitorigoto", "2 months ago"],
  ["completed", "Bibliomania", "2 months ago"],
  ["completed", "Dragon Ball Z", "2 months ago"]
];

let animeList = [];
let mangaList = [];
let favoriteAnime = [];
let favoriteCharacters = [];
let visibleCount = 12;
let activityFilter = "all";

const $ = (selector) => document.querySelector(selector);

function safe(text) {
  return String(text ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getUsuarioLogado() {
  try {
    return JSON.parse(
      sessionStorage.getItem("usuarioLogado") || "null"
    );
  } catch {
    return null;
  }
}

let usuarioLogado = getUsuarioLogado();

function avatarPadrao(nome) {
  return "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(nome || "Usuário") +
    "&background=ff00aa&color=fff&size=256";
}

function atualizarCabecalho() {
  const nome = usuarioLogado?.nome || "Visitante";

  const nomeElemento = $(".banner-content h1");
  const avatarElemento = $("#avatar");

  if (nomeElemento) {
    nomeElemento.textContent = nome;
  }

  if (avatarElemento) {
    avatarElemento.src =
      usuarioLogado?.avatar || avatarPadrao(nome);

    avatarElemento.onerror = function() {
      this.onerror = null;
      this.src = avatarPadrao(nome);
    };

    avatarElemento.title = "Clique para alterar sua foto";
  }

  const descricao = $(".banner-content span");

  if (descricao) {
    descricao.textContent =
      usuarioLogado?.bio || "Bem-vindo ao meu perfil!";
  }

  if (usuarioLogado?.banner) {
    $("#banner").style.backgroundImage =
      `url("${usuarioLogado.banner}")`;
  }
}

function salvarUsuarioAtualizado() {
  if (!usuarioLogado) return;

  sessionStorage.setItem(
    "usuarioLogado",
    JSON.stringify(usuarioLogado)
  );

  const usuarios = JSON.parse(
    localStorage.getItem("usuarios") || "[]"
  );

  const index = usuarios.findIndex((usuario) =>
    usuario.id === usuarioLogado.id ||
    usuario.email === usuarioLogado.email
  );

  if (index !== -1) {
    usuarios[index] = {
      ...usuarios[index],
      avatar: usuarioLogado.avatar,
      banner: usuarioLogado.banner,
      bio: usuarioLogado.bio
    };

    localStorage.setItem(
      "usuarios",
      JSON.stringify(usuarios)
    );
  }
}

function configurarAvatar() {
  const avatar = $("#avatar");

  if (!avatar || !usuarioLogado) return;

  const input = document.createElement("input");

  input.type = "file";
  input.accept = "image/png,image/jpeg,image/webp";
  input.style.display = "none";

  document.body.appendChild(input);

  avatar.style.cursor = "pointer";

  avatar.addEventListener("click", () => {
    input.click();
  });

  input.addEventListener("change", (event) => {
    const arquivo = event.target.files[0];

    if (!arquivo) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(arquivo.type)) {
      alert("Selecione uma imagem PNG, JPG ou WEBP.");
      return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2 MB.");
      return;
    }

    const leitor = new FileReader();

    leitor.onload = function() {
      usuarioLogado.avatar = leitor.result;

      try {
        salvarUsuarioAtualizado();
        atualizarCabecalho();
      } catch (erro) {
        alert("Não foi possível salvar a imagem. Tente uma foto menor.");
        console.error(erro);
      }
    };

    leitor.readAsDataURL(arquivo);
    input.value = "";
  });
}

function createImage(url, title) {
  return `
    <img
      src="${safe(url || fallback)}"
      alt="${safe(title)}"
      loading="lazy"
      onerror="this.onerror=null;this.src='${fallback}'"
    >
  `;
}

function createPoster(item) {
  return `
    <a class="poster-card"
       href="${safe(item.url || '#')}"
       target="_blank"
       rel="noopener noreferrer"
       title="${safe(item.title)}">
      ${createImage(item.image, item.title)}
    </a>
  `;
}

function createFullCard(item) {
  return `
    <a class="full-card"
       href="${safe(item.url || '#')}"
       target="_blank"
       rel="noopener noreferrer">
      ${createImage(item.image, item.title)}
      <h3>${safe(item.title)}</h3>
      <p>${safe(item.subtitle || "")}</p>
    </a>
  `;
}

function renderGrid(selector, data, limit = null, poster = false) {
  const elemento = $(selector);

  if (!elemento) return;

  const items = limit ? data.slice(0, limit) : data;

  elemento.innerHTML = items.length
    ? items.map(poster ? createPoster : createFullCard).join("")
    : "<p>Nenhum item disponível.</p>";
}

function activityText(item) {
  const [type, title, time, episode] = item;

  if (type === "completed") {
    return `Concluiu <strong>${safe(title)}</strong>`;
  }

  if (type === "planning") {
    return `Planeja assistir <strong>${safe(title)}</strong>`;
  }

  return `Assistiu ao episódio ${episode} de <strong>${safe(title)}</strong>`;
}

function findAnime(title) {
  const normalize = (text) => text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return animeList.find((anime) =>
    normalize(anime.title) === normalize(title)
  );
}

function renderActivities() {
  const elemento = $("#activityList");

  if (!elemento) return;

  const filtered = activities.filter((item) =>
    activityFilter === "all" || item[0] === activityFilter
  );

  const displayed = filtered.slice(0, visibleCount);

  elemento.innerHTML = displayed.map((item) => {
    const anime = findAnime(item[1]);

    return `
      <div class="activity-card">
        ${createImage(anime?.image, item[1])}

        <div class="activity-content">
          <p>${activityText(item)}</p>

          <div class="activity-bottom">
            <span>${safe(item[2])}</span>
            <span>
              <i data-lucide="heart"></i>
              <i data-lucide="message-circle"></i>
            </span>
          </div>
        </div>
      </div>
    `;
  }).join("");

  const botao = $("#loadMore");

  if (botao) {
    botao.style.display =
      visibleCount >= filtered.length ? "none" : "block";
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

function renderHistory() {
  const grid = $("#historyGrid");

  if (!grid) return;

  grid.innerHTML = "";

  for (let i = 0; i < 182; i++) {
    const cell = document.createElement("div");

    const level = Math.random() > .75
      ? Math.floor(Math.random() * 4) + 1
      : 0;

    cell.className = `history-cell level-${level}`;
    cell.title = "Visualização ilustrativa";

    grid.appendChild(cell);
  }
}

function renderEverything() {
  renderGrid(
    "#animePreview",
    favoriteAnime.length ? favoriteAnime : animeList,
    8,
    true
  );

  renderGrid("#mangaPreview", mangaList, 8, true);
  renderGrid("#characterPreview", favoriteCharacters, 16, true);

  renderGrid("#animeList", animeList);
  renderGrid("#mangaList", mangaList);
  renderGrid("#favoriteAnime", favoriteAnime);
  renderGrid("#favoriteCharacters", favoriteCharacters);

  renderActivities();
}

document.querySelectorAll(".nav-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".nav-tab").forEach((item) => {
      item.classList.remove("active");
    });

    document.querySelectorAll(".tab-page").forEach((page) => {
      page.classList.remove("active");
    });

    tab.classList.add("active");

    const pagina = document.getElementById(tab.dataset.tab);

    if (pagina) {
      pagina.classList.add("active");
    }
  });
});

$("#activityFilter")?.addEventListener("change", (event) => {
  activityFilter = event.target.value;
  visibleCount = 12;
  renderActivities();
});

$("#loadMore")?.addEventListener("click", () => {
  visibleCount += 10;
  renderActivities();
});

$("#animeSearch")?.addEventListener("input", (event) => {
  const search = event.target.value.toLowerCase();

  const filtered = animeList.filter((anime) =>
    anime.title.toLowerCase().includes(search)
  );

  renderGrid("#animeList", filtered);
});

const query = `
query ($name: String) {
  User(name: $name) {
    name
    avatar {
      large
    }
    bannerImage
    favourites {
      anime {
        nodes {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          siteUrl
        }
      }
      manga {
        nodes {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          siteUrl
        }
      }
      characters {
        nodes {
          id
          name {
            full
          }
          image {
            large
          }
          siteUrl
        }
      }
    }
  }

  MediaListCollection(userName: $name, type: ANIME) {
    lists {
      entries {
        status
        score
        media {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          siteUrl
        }
      }
    }
  }
}
`;

const mangaQuery = `
query ($name: String) {
  MediaListCollection(userName: $name, type: MANGA) {
    lists {
      entries {
        status
        score
        media {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          siteUrl
        }
      }
    }
  }
}
`;

async function requestAniList(query) {
  const response = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      query,
      variables: { name: USER }
    })
  });

  if (!response.ok) {
    throw new Error(`Erro ${response.status}`);
  }

  const result = await response.json();

  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

function formatMedia(media) {
  return {
    title: media.title?.english || media.title?.romaji || "Sem título",
    image: media.coverImage?.large || fallback,
    url: media.siteUrl,
    subtitle: ""
  };
}

function formatCharacter(character) {
  return {
    title: character.name?.full || "Personagem",
    image: character.image?.large || fallback,
    url: character.siteUrl
  };
}

async function loadProfile() {
  try {
    const data = await requestAniList(query);
    const user = data.User;

    if (!user) return;

    animeList = (data.MediaListCollection?.lists || [])
      .flatMap((list) => list.entries || [])
      .map((entry) => ({
        ...formatMedia(entry.media),
        subtitle: entry.status || ""
      }));

    favoriteAnime = (user.favourites?.anime?.nodes || [])
      .map(formatMedia);

    favoriteCharacters = (user.favourites?.characters?.nodes || [])
      .map(formatCharacter);

    renderEverything();

  } catch (error) {
    console.warn("Erro ao carregar AniList:", error.message);
  }
}

async function loadManga() {
  try {
    const data = await requestAniList(mangaQuery);

    mangaList = (data.MediaListCollection?.lists || [])
      .flatMap((list) => list.entries || [])
      .map((entry) => ({
        ...formatMedia(entry.media),
        subtitle: entry.status || ""
      }));

    renderGrid("#mangaPreview", mangaList, 8, true);
    renderGrid("#mangaList", mangaList);

  } catch (error) {
    console.warn("Erro ao carregar mangás:", error.message);
  }
}

atualizarCabecalho();
configurarAvatar();
renderHistory();
renderActivities();

Promise.allSettled([
  loadProfile(),
  loadManga()
]).then(() => {
  if (window.lucide) {
    lucide.createIcons();
  }
});
