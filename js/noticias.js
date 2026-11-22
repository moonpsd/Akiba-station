/* Akiba Station — lógica de noticias e efeitos visuais locais. */
(() => {
    "use strict";

    const configurarMenu = () => {
        const botao = document.querySelector(".botao-menu");
        const menu = document.getElementById("menu-principal");
        if (!botao || !menu) return;

        const telaCompacta = window.matchMedia("(max-width: 899px)");
        const definirAberto = (aberto) => {
            menu.hidden = telaCompacta.matches && !aberto;
            botao.setAttribute("aria-expanded", String(aberto));
        };
        const atualizarLayout = () => {
            const focoNoMenu = menu.contains(document.activeElement);
            botao.hidden = !telaCompacta.matches;
            definirAberto(false);
            if (telaCompacta.matches && focoNoMenu) botao.focus();
            if (!telaCompacta.matches && document.activeElement === botao) {
                menu.querySelector("a")?.focus();
            }
        };
        botao.addEventListener("click", () => {
            definirAberto(botao.getAttribute("aria-expanded") !== "true");
        });
        menu.addEventListener("click", (event) => {
            if (telaCompacta.matches && event.target.closest("a")) {
                definirAberto(false);
                botao.focus();
            }
        });
        document.addEventListener("keydown", (event) => {
            if (
                event.key === "Escape" &&
                telaCompacta.matches &&
                !menu.hidden &&
                !document.querySelector("dialog[open]")
            ) {
                definirAberto(false);
                botao.focus();
            }
        });
        telaCompacta.addEventListener("change", atualizarLayout);
        atualizarLayout();
    };

    const configurarModal = () => {
        const modal = document.getElementById("meuModal");
        const titulo = document.getElementById("modal-tit");
        const categoria = document.getElementById("modal-cat");
        const imagem = document.getElementById("modal-img");
        const texto = document.getElementById("modal-texto");
        const meta = document.getElementById("modal-meta");
        const botaoFechar = modal?.querySelector(".botao-fechar");
        if (
            !modal ||
            typeof modal.showModal !== "function" ||
            !titulo ||
            !categoria ||
            !imagem ||
            !texto ||
            !meta ||
            !botaoFechar
        ) {
            console.warn(
                "Leitura de notícias indisponível: verifique a estrutura do dialog e o suporte do navegador.",
            );
            return;
        }

        let acionador = null;
        let posicaoRolagem = 0;
        const fechar = () => {
            if (modal.open) modal.close();
        };
        const abrir = (link) => {
            const noticia = link.closest("[data-noticia]");
            const tituloNoticia = noticia?.querySelector("h3");
            const categoriaNoticia = noticia?.querySelector(".categoria");
            const imagemNoticia = noticia?.querySelector("img");
            if (
                !noticia ||
                !tituloNoticia ||
                !categoriaNoticia ||
                !imagemNoticia ||
                !noticia.dataset.texto
            ) {
                console.warn("Não foi possível abrir a notícia: conteúdo incompleto.", noticia?.id);
                return;
            }
            if (modal.open) return;
            titulo.textContent = tituloNoticia.textContent.trim().replace(/\s+/g, " ");
            categoria.textContent = categoriaNoticia.textContent;
            texto.textContent = noticia.dataset.texto;
            imagem.src =
                noticia.dataset.imagemModal || imagemNoticia.currentSrc || imagemNoticia.src;
            imagem.alt = imagemNoticia.alt;
            imagem.width = Number(imagemNoticia.getAttribute("width")) || 1280;
            imagem.height = Number(imagemNoticia.getAttribute("height")) || 720;
            const metadados = noticia.querySelector(".meta-dados");
            meta.textContent = metadados
                ? [...metadados.children].map((item) => item.textContent.trim()).join(" · ")
                : "";
            meta.hidden = !metadados;
            acionador = link;
            posicaoRolagem = window.scrollY;
            document.body.classList.add("modal-aberto");
            modal.showModal();
            modal.scrollTop = 0;
            botaoFechar.focus({ preventScroll: true });
        };
        document.addEventListener("click", (event) => {
            const link = event.target.closest("[data-abrir-noticia]");
            if (
                !link ||
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            )
                return;
            event.preventDefault();
            abrir(link);
        });
        botaoFechar.addEventListener("click", fechar);
        modal.addEventListener("cancel", (event) => {
            event.preventDefault();
            fechar();
        });

        // O backdrop pertence ao dialog; a caixa interna nunca deve fechá-lo.
        let iniciouNoFundo = false;
        const foraDaCaixa = (event) => {
            const caixa = modal.getBoundingClientRect();
            return (
                event.target === modal &&
                (event.clientX < caixa.left ||
                    event.clientX > caixa.right ||
                    event.clientY < caixa.top ||
                    event.clientY > caixa.bottom)
            );
        };
        modal.addEventListener("pointerdown", (event) => {
            iniciouNoFundo = foraDaCaixa(event);
        });
        modal.addEventListener("click", (event) => {
            if (iniciouNoFundo && foraDaCaixa(event)) fechar();
            iniciouNoFundo = false;
        });
        modal.addEventListener("close", () => {
            document.body.classList.remove("modal-aberto");
            window.scrollTo({ top: posicaoRolagem, behavior: "instant" });
            if (acionador?.isConnected) acionador.focus({ preventScroll: true });
            acionador = null;
        });

        // Complementa a contenção nativa para Tab e Shift+Tab.
        modal.addEventListener("keydown", (event) => {
            if (event.key !== "Tab") return;
            const controles = [
                ...modal.querySelectorAll(
                    'button, a[href], input, select, textarea, [tabindex="0"]',
                ),
            ].filter((elemento) => !elemento.disabled && elemento.getClientRects().length);
            const primeiro = controles[0];
            const ultimo = controles.at(-1);
            if (!primeiro) {
                event.preventDefault();
                titulo.focus();
            } else if (
                event.shiftKey &&
                (document.activeElement === primeiro || document.activeElement === titulo)
            ) {
                event.preventDefault();
                ultimo.focus();
            } else if (!event.shiftKey && document.activeElement === ultimo) {
                event.preventDefault();
                primeiro.focus();
            }
        });
    };

    const configurarCarregamento = () => {
        const grade = document.getElementById("grade-noticias");
        const botao = document.getElementById("btn-carregar");
        const status = document.getElementById("status-noticias");
        if (!grade || !botao || !status) return;
        const extras = [...grade.querySelectorAll(".noticia-extra")];
        extras.forEach((noticia) => {
            noticia.hidden = true;
        });
        botao.hidden = extras.length === 0;
        const atualizarStatus = () => {
            const noticias = [...grade.querySelectorAll(".card-noticia")];
            const visiveis = noticias.filter((noticia) => !noticia.hidden).length;
            status.textContent = `${visiveis} de ${noticias.length} notícias`;
        };
        atualizarStatus();
        botao.addEventListener("click", () => {
            const escondidas = extras.filter((noticia) => noticia.hidden);
            if (escondidas.length === 0) {
                botao.hidden = true;
                return;
            }
            escondidas.forEach((noticia) => {
                noticia.hidden = false;
                noticia.classList.add("noticia-revelada");
                noticia.addEventListener(
                    "animationend",
                    () => {
                        noticia.classList.remove("noticia-revelada");
                    },
                    { once: true },
                );
            });
            atualizarStatus();
            botao.hidden = !extras.some((noticia) => noticia.hidden);
            escondidas[0].querySelector("[data-abrir-noticia]")?.focus({ preventScroll: true });
        });
    };

    configurarMenu();
    configurarModal();
    configurarCarregamento();
})();


/* Cabeçalho e animações exclusivos desta página. */
/* Progressive visual enhancements. Does not override project business logic. */
(() => {
  const init = () => {
    if (document.querySelector('.retro-masthead')) return;
    const navigation = document.querySelector('nav.navbar,header.cabecalho');
    if (!navigation) return;
    const status = document.createElement('div');
    status.className = 'retro-status';
    status.innerHTML = '<span><span class="status-led" aria-hidden="true"></span><strong>AKIBA NETWORK</strong> // conectado ao universo otaku</span><span>EST. 2004 &nbsp; ◆ &nbsp; PORTAL V.2.0</span>';
    const masthead = document.createElement('div');
    masthead.className = 'retro-masthead';
    masthead.innerHTML = '<a class="retro-brand" href="index.html" aria-label="Akiba Station — Página inicial"><img class="retro-main-logo" src="imgs/akiba-logo-rosa.png" alt="Akiba Station"></a>';
    navigation.before(status, masthead);
    const ticker = document.createElement('div');
    ticker.className = 'retro-ticker';
    ticker.innerHTML = '<span class="retro-ticker-label">◆ AKIBA UPDATE</span><span class="retro-ticker-copy">BEM-VINDO À <b>AKIBA STATION</b> &nbsp; // &nbsp; ANIMES • LANÇAMENTOS • NOTÍCIAS • COMUNIDADE &nbsp; // &nbsp; SUA PRÓXIMA AVENTURA COMEÇA AQUI</span>';
    navigation.after(ticker);
    const sections = document.querySelectorAll('.anime-section,.reviews-panel,.noticias-recentes,.noticia-destaque,main form');
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('retro-visible');observer.unobserve(entry.target);} });
      }, {threshold:0.06,rootMargin:'0px 0px 70px 0px'});
      sections.forEach(el => {el.classList.add('retro-reveal');observer.observe(el);});
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

