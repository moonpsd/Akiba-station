# CONTEXTO DO PROJETO — Akiba Station

> **Escopo desta documentação.** Reconstrução do funcionamento a partir do diretório da versão **Akiba-Station-Projeto-Corrigido**, correspondente ao pacote mais recente **Akiba-Station-Regras-Projeto-Sem-README.zip** disponível nesta conversa. Análise estática de arquivos; nenhum código do projeto foi alterado. O presente documento é independente do `README.md` e não substitui testes de execução.
>
> **Legenda de evidência:** **[Código]** comportamento constatado em marcação, estilos ou funções; **[Interpretação]** explicação do efeito dessas implementações; **[Não confirmado]** aspecto que depende de execução, servidor ou fonte externa.

## 1. Inventário real dos arquivos

Foram encontrados **105 arquivos**: **6 HTML**, **6 CSS**, **6 JavaScript**, **46 WebP**, **28 PNG**, **11 JPG**, **1 SVG** e **1 ICO**. Não há arquivo de configuração de framework, `package.json` ou código de servidor dentro deste diretório analisado.

```text
Akiba-Station-Projeto-Corrigido/
├── assets/
│   └── images/
│       └── optimized/
│           ├── acao-480.webp
│           ├── acao-735.webp
│           ├── berserk-1000.webp
│           ├── berserk-480.webp
│           ├── bleach-480.webp
│           ├── bleach-720.webp
│           ├── blue-box-480.webp
│           ├── blue-box-590.webp
│           ├── daima-360.webp
│           ├── daima-787.webp
│           ├── dandadan-428.webp
│           ├── dandadan-736.webp
│           ├── destaque-1280.webp
│           ├── destaque-768.webp
│           ├── fujimoto-447.webp
│           ├── gannibal-453.webp
│           ├── gannibal-544.webp
│           ├── genshin-480.webp
│           ├── genshin-707.webp
│           ├── haikyu-1000.webp
│           ├── haikyu-480.webp
│           ├── historie-225.webp
│           ├── iberanime-480.webp
│           ├── iberanime-701.webp
│           ├── isekai-480.webp
│           ├── isekai-736.webp
│           ├── jujutsu-453.webp
│           ├── jujutsu-736.webp
│           ├── kagurabachi-381.webp
│           ├── naruto-anime-456.webp
│           ├── naruto-anime-516.webp
│           ├── naruto-cinema-457.webp
│           ├── naruto-cinema-541.webp
│           ├── one-piece-1000.webp
│           ├── one-piece-480.webp
│           ├── oshi-no-ko-1000.webp
│           ├── oshi-no-ko-480.webp
│           ├── pochita-480.webp
│           ├── pochita-860.webp
│           ├── rezero-410.webp
│           ├── sakamoto-413.webp
│           ├── sao-418.webp
│           ├── solo-leveling-327.webp
│           ├── summer-wars-427.webp
│           ├── summer-wars-736.webp
│           └── vagabond-391.webp
├── css/
│   ├── adm.css
│   ├── cadastro.css
│   ├── entrar.css
│   ├── noticias.css
│   ├── perfil.css
│   └── style.css
├── icons/
│   ├── curriculum-vitae-svgrepo-com.svg
│   └── he.ico
├── img-noticias/
│   ├── aonohako.png
│   ├── berserk.jpg
│   ├── blade.png
│   ├── bleach.png
│   ├── daima.jpg
│   ├── dandandan.jpg
│   ├── fight.jpg
│   ├── fujimoto.png
│   ├── ganibal.png
│   ├── genshin.png
│   ├── haikyu.png
│   ├── Historie manga Eumenes.jpg
│   ├── iberanime.png
│   ├── Isekai anime characters crossover.jpg
│   ├── jujutsu.jpg
│   ├── megane.jpg
│   ├── naruto20.png
│   ├── narutolive.png
│   ├── onepiece.png
│   ├── oshinoko.png
│   ├── pochita croc.png
│   ├── rezero.png
│   ├── sakamoto.png
│   ├── sao.png
│   ├── sololeving.png
│   ├── Summer Wars.jpg
│   ├── vagabound.png
│   └── yodorokiii.png
├── imgs/
│   ├── Avatar-Reviews/
│   │   ├── av-1.jpg
│   │   ├── av-2.jpg
│   │   ├── av-3.png
│   │   ├── av-4.png
│   │   ├── av-5.png
│   │   ├── av-6.png
│   │   └── av-7.png
│   ├── akiba-logo-rosa.png
│   ├── heads.png
│   ├── Profile-Pic.png
│   └── user.png
├── js/
│   ├── adm.js
│   ├── cadastro.js
│   ├── entrar.js
│   ├── noticias.js
│   ├── perfil.js
│   └── script.js
├── admin.html
├── cadastro.html
├── entrar.html
├── index.html
├── noticias.html
└── profile.html
```

Os diretórios `imgs/`, `img-noticias/`, `assets/images/optimized/` e `icons/` guardam os recursos de imagem. Há também imagens carregadas de URLs remotas nos HTML e JS. **A árvore acima lista os nomes realmente presentes**, não uma estrutura sugerida.

## 2. Finalidade identificada

**[Código]** O título `Akiba Station`, o conteúdo de `index.html`, as áreas de notícias e os dados de animes indicam um portal de entretenimento/anime com navegação entre catálogo ilustrativo, notícias, cadastro, login, administração de usuários e perfil. O perfil inclui consulta ao AniList e listas de animes e mangás.

**[Interpretação]** A experiência combina apresentação editorial de animes com recursos acadêmicos de formulários e persistência local; não foi identificado um backend próprio para cadastro e autenticação.

## 3. Visão geral e páginas

| Página | Papel e elementos comprovados | Arquivos próprios |
|---|---|---|
| `index.html` | Página principal: menu, slider de destaque (`#heroSlider`, `#slidesContainer`, `#prevBtn`, `#nextBtn`, `#indicators`), cards de animes, avaliações e links externos. | `css/style.css`, `js/script.js`; Lucide via CDN |
| `noticias.html` | Manchete, grade de notícias, notícias detalhadas em `<dialog id="meuModal">`, botão de carregar mais e menu responsivo. | `css/noticias.css`, `js/noticias.js` |
| `cadastro.html` | Formulário em duas etapas (`#etapa1`, `#etapa2`) com nome completo, nome de usuário, data de nascimento, e-mail, senha e confirmação. | `css/cadastro.css`, `js/cadastro.js` |
| `entrar.html` | Login por e-mail e senha, botão de mostrar/ocultar senha e área de mensagens. | `css/entrar.css`, `js/entrar.js` |
| `admin.html` | Cadastro simples de nome e e-mail (`#formAdmin`), lista `<ul id="listaUsuarios">`, busca, contador, limpar formulário, excluir um e excluir todos. | `css/adm.css`, `js/adm.js` |
| `profile.html` | Banner e avatar, nome do usuário, abas de visão geral/anime/mangá/favoritos/estatísticas, atividades e dados vindos do AniList. | `css/perfil.css`, `js/perfil.js`; Lucide e Google Fonts via CDN |

**Navegação:** os menus dos HTMLs apontam para `index.html`, `noticias.html`, `cadastro.html`, `entrar.html`, `admin.html` e `profile.html`. O redirecionamento após cadastro aponta para `entrar.html`.

## 4. Organização e responsabilidade dos arquivos

### HTML e associações

Cada página importa um CSS e um JS próprios. `index.html` e `profile.html` também importam Lucide para ícones; `profile.html` declara uma folha de estilos do Google Fonts para Poppins. O conteúdo de notícias está predominantemente descrito na marcação HTML, com atributos `data-*` utilizados pelo JS para preencher o modal. A página inicial fornece os três slides principais no HTML; seções de cartões são montadas em JavaScript.

**IDs e seletores de integração mais importantes:**

- `index.html`: `heroSlider`, `slidesContainer`, `prevBtn`, `nextBtn`, `indicators`, `trendingTrack`, `comingTrack`, `reviewsTrack`, `inspiTrack`, `dubbedTrack`.
- `noticias.html`: `meuModal`, `modal-tit`, `modal-cat`, `modal-img`, `modal-texto`, `modal-meta`, `grade-noticias`, `btn-carregar` e atributos `data-abrir-noticia` / `data-noticia`.
- `cadastro.html`: `formCadastro`, `etapa1`, `etapa2`, `nome`, `usuario`, `nascimento`, `email`, `senha`, `confirmarSenha`, `mensagem1`, `mensagem2`, `btnContinuar`, `btnVoltar`, `btnCadastrar`.
- `entrar.html`: `formEntrar`, `email`, `senha`, `btnSenha`, `mensagem`, `btnEntrar`.
- `admin.html`: `formAdmin`, `listaUsuarios`, `pesquisaUsuarios`, `limparCampos`, `excluirTodos`, `mensagem`, `contador`, `vazio`.
- `profile.html`: `banner`, `avatar`, `activityList`, `activityFilter`, `loadMore`, `animeSearch`, `animeList`, `mangaList`, `favoriteAnime`, `favoriteCharacters`, `historyGrid` e botões `.nav-tab[data-tab]`.

### CSS

| Arquivo | Componentes e responsabilidade |
|---|---|
| `style.css` | Estilo da página principal: menu, banners, overlays, cards, carrosséis e estados de navegação. |
| `noticias.css` | Grade e cartões de notícias, destaques, leitura em modal, responsividade e menu móvel. |
| `cadastro.css` | Formulário em etapas, labels/inputs, mensagens, botões e apresentação da página de cadastro. |
| `entrar.css` | Campos e feedback de login, incluindo apresentação do botão de visualização de senha. |
| `adm.css` | Formulário administrativo, listagem, busca, botões de exclusão e mensagens. |
| `perfil.css` | Banner, avatar, abas, colunas, atividade, previews, grids, estatísticas e adaptação mobile. |

**[Código]** As folhas utilizam propriedades customizadas CSS com a paleta predominante `--primary-pink: #ff00aa`, `--hover-pink: #ff7ed4`, `--dark-bg: #141519`, `--card-bg: #23252b`, `--text-muted: #a0a0a0` e `--slider-height: 80vh`. Variáveis legadas como `--pink` fazem referência às novas. Os estilos empregam Flexbox, CSS Grid, gradientes, bordas, efeitos `hover`/`focus`, animações e regras `@media`. A identidade tem menus e painéis evocando portais da web antigos.

**Ponto de atenção para manutenção:** existem regras sobrepostas e definições repetidas de `:root` em algumas folhas. Isso é evidência de camadas acumuladas de estilo, não uma proposta de refatoração neste documento. Verificar a cascata antes de alterar cores ou layout. A nomenclatura `retro-*` ainda aparece nos seletores de efeito visual, embora não haja um `retro-2000.css` separado.

### JavaScript

| Arquivo | Responsabilidade e funções/rotinas identificadas |
|---|---|
| `script.js` | `updateSlides`, `goToSlide`, `nextSlide`, `prevSlide`, `startAutoPlay`, `stopAutoPlay`, indicadores, swipe, `createAnimeCard`, `renderAnimeCards`, `setupInfiniteSlider`, `renderReviews` e animação com `requestAnimationFrame`. |
| `noticias.js` | `configurarMenu`, `configurarModal`, `configurarCarregamento` e tratamento de cliques, Escape, mudanças de largura e abertura/fechamento do `<dialog>`. |
| `cadastro.js` | `calcularIdade`, objeto `Usuarios`, validações por etapa, controle de formulário, alternância de visibilidade de senha, gravação de usuário, mensagens e redirecionamento. |
| `entrar.js` | Cópia local do objeto `Usuarios`, verificação de credenciais com Web Crypto, `#formEntrar`, feedback e botão mostrar/ocultar senha. |
| `adm.js` | Cópia local de `Usuarios`, `renderizar`, cadastro administrativo, busca, exclusão individual/total, limpar campos e atualizar a lista. |
| `perfil.js` | Usuário local mais recente, `atualizarCabecalho`, upload/salvamento de avatar, `renderActivities`, `loadActivityCovers`, `renderHistory`, `loadProfile`, `loadManga`, `requestAniList` e renderização de grades/abas. |

Os scripts administrativos, de cadastro e de login incluem **implementações repetidas do gerenciador `Usuarios`** dentro dos seus próprios arquivos. A lógica lê e escreve a mesma chave de armazenamento, mas não é um módulo importado à parte; por isso as implementações devem ser comparadas sempre que alguma regra mudar.

## 5. Fluxos de dados efetivamente identificados

### 5.1 Cadastro próprio

```text
cadastro.html → campos (nome, usuario, nascimento, email, senha)
  → cadastro.js: validarEtapa1 / validarEtapa2
  → Usuarios.cadastrar(dados)
  → hash PBKDF2 + salt via Web Crypto
  → localStorage['heads_usuarios'] (JSON)
  → mensagem de sucesso → entrar.html
```

**[Código]** A primeira etapa verifica tamanho do nome, formato do nome de usuário e data de nascimento; a segunda verifica e-mail, tamanho e confirmação de senha. O registro pode completar um pré-cadastro administrativo que tenha o mesmo e-mail.

### 5.2 Entrada

```text
entrar.html → email e senha → entrar.js / Usuarios.entrar
  → consulta heads_usuarios → derivação do hash com salt armazenado
  → comparação → heads_sessao no localStorage
  → mensagem e navegação definidas pelo script
```

**[Código]** O sistema persiste informação básica de sessão no navegador. Isso **não equivale** a controle seguro de sessão no servidor. A exigência de um contexto seguro (HTTPS ou localhost) para `crypto.subtle` é reconhecida nos scripts.

### 5.3 Administração

```text
admin.html → nome + email → adm.js → Usuarios.adicionarPeloAdmin
  → localStorage['heads_usuarios']
  → Usuarios.listar → filtro de texto → <ul id="listaUsuarios">
  → ações excluir / excluir todos → mesma chave JSON → nova renderização
```

**[Código]** A lista mostra nome, e-mail e horário de cadastro quando o dado existe. A pesquisa filtra nome/e-mail em memória; excluir um usuário usa `Usuarios.remover(id)`; excluir todos sobrescreve a chave de usuários com `[]` e limpa as chaves de sessão indicadas no JS. `form.reset()` limpa os campos. A tela administrativa não demonstra verificação de autorização baseada em perfil de administrador.

### 5.4 Perfil e AniList

```text
profile.html → perfil.js → heads_usuarios (seleção do cadastro mais recente)
                         → nome de usuário, avatar, bio e banner no DOM
                         → fetch POST https://graphql.anilist.co
                         → listas e favoritos → cards no DOM
                         → buscas adicionais de capas das atividades
```

**[Código]** A variável `USER` está definida como `moonpsd` no script do perfil. Portanto, os **dados de animes/mangás e favoritos buscados do AniList são da conta fixa configurada no código**, não necessariamente da pessoa recém-cadastrada. O título/identificação local do perfil é calculado separadamente. O histórico de atividade inclui um conjunto de entradas fixas no JavaScript, e o calendário de atividade é gerado com `Math.random()`, rotulado como ilustração. Não interpretar esses valores como um histórico de visualização autenticado.

O script tenta consultar capas faltantes por título usando GraphQL `Media(search: ..., type: ANIME)`; há uma URL de imagem reserva (`placehold.co`) quando uma capa não está disponível. O banner visual padrão é definido em CSS, sendo substituído por `--profile-banner-image` quando há um banner personalizado salvo.

### 5.5 Notícias e vitrine

**[Código]** Os cartões e a matéria das notícias são descritos no HTML; `noticias.js` usa os atributos desses elementos para popular e abrir o modal. O botão de carregar mais revela itens ocultos. A homepage usa arrays locais de animes e imagens vinculadas por URL para montar cards e avaliações; `setInterval` controla a rotação do banner e `requestAnimationFrame` movimenta parte dos carrosséis. Não foi encontrada uma API de pesquisa de anime em tempo real na homepage.

## 6. Tecnologias, integrações e dependências

| Item | Evidência e uso |
|---|---|
| HTML5 | Estrutura das seis páginas; formulários, links, listas, seções e `<dialog>` de notícias. |
| CSS3 | Seis arquivos de estilos; variáveis, gradientes, Flexbox, Grid, media queries, animações e estados de interação. |
| JavaScript no navegador | Manipulação do DOM, eventos, validações, renderização e requisições `fetch`. |
| Web Storage | `localStorage` para usuários e sessão, `sessionStorage` para dados transitórios do perfil em parte do código. |
| Web Crypto API | `crypto.getRandomValues`, `crypto.subtle.importKey`, `crypto.subtle.deriveBits` com PBKDF2/SHA-256. |
| AniList GraphQL | `https://graphql.anilist.co` no `perfil.js`; leitura de listas, favoritos e pesquisa de capas. |
| Lucide Icons | `https://unpkg.com/lucide@latest` em `index.html` e `profile.html`. |
| Google Fonts | Poppins referenciado externamente em `profile.html`; fontes de sistema como Tahoma/Verdana/Arial também aparecem nos CSS. |
| Imagens remotas | Hosts de imagens de animes e serviços de placeholder/avatar aparecem em HTML e JS; requerem acesso de rede. |

**[Não confirmado]** Não foram identificados diretórios de backend, configuração de servidor ou banco de dados no pacote analisado. A ausência desses arquivos neste pacote não comprova a inexistência de infraestrutura fora dele.

## 7. Persistência: chaves e campos

| Chave / fonte | Conteúdo visto no código | Escrita / leitura |
|---|---|---|
| `localStorage['heads_usuarios']` | Array JSON de objetos: `id`, `nome`, `email`, possivelmente `usuario`, `nascimento`, `origem`, `criadoEm`, `salt`, `senhaHash`, `avatar`, `banner`, `bio`. | Cadastro, administração, login (leitura) e perfil (leitura/atualização). |
| `localStorage['heads_sessao']` | JSON básico com `id`, `nome`, `usuario` após login. | Login / administração / logout. |
| `sessionStorage['usuarioLogado']` | Cópia do objeto associado ao perfil ao salvar avatar e outros atributos. | Perfil; também removida na exclusão geral. |
| AniList GraphQL | Dados externos consultados em tempo de execução. | Solicitações `fetch` do perfil; não foi identificada persistência desses resultados em banco próprio. |

O formato é um **array JSON em uma chave de `localStorage`**, não um banco relacional. Senhas do cadastro são transformadas em hash e salt no navegador; segurança de autenticação e autorização no servidor **não está demonstrada**. Dados persistidos permanecem associados à origem e ao navegador.

## 8. Regras de negócio comprovadas

- **Idade de cadastro:** `cadastro.js` calcula anos completos considerando mês e dia; bloqueia idades abaixo de 12 e datas inválidas ou futuras (a verificação de faixa também rejeita mais de 120 anos no formulário).
- **Nome de usuário:** o formulário exige de 3 a 20 caracteres entre letras ASCII, dígitos, `_` e `.`; a função de cadastro verifica repetição do nome de usuário sem diferenciar maiúsculas/minúsculas.
- **Nome completo:** campo do cadastro precisa de pelo menos três caracteres; na página Admin o nome informado precisa de pelo menos três caracteres.
- **Senha:** pelo menos oito caracteres e confirmação igual; alternância de visualização altera o tipo do input (`password`/`text`).
- **E-mail:** os formulários usam validação do tipo `email`; comparações usam e-mail normalizado para minúsculas e sem espaços nas extremidades.
- **Duplicidade:** um e-mail já cadastrado com senha não pode gerar outro registro; pré-cadastro de administrador com e-mail igual pode ser completado por cadastro próprio.
- **Admin:** a busca abrange nome ou e-mail, é insensível a caixa, e as exclusões pedem confirmação antes de apagar.
- **Atividades do perfil:** filtro por tipo (todos, concluídos, assistidos, planejados), limite inicial de itens e botão para carregar mais.
- **Apresentação da homepage:** slider muda automaticamente, pode ser acionado por setas/indicadores e responde a gestos horizontais em dispositivos com toque.

**Limite importante:** a regra etária está implementada no fluxo de cadastro do navegador, não foi comprovada validação por servidor. A função `Usuarios.cadastrar` não é idêntica nos três arquivos que a contêm; não presuma que todas aplicam a mesma regra.

## 9. Arquitetura realmente identificada

```text
Navegador
├── HTML (6 páginas estáticas)
│   ├── CSS específico por página
│   └── JS específico por página
│       ├── manipulação DOM e eventos
│       ├── Web Storage (dados locais de usuários e sessão)
│       ├── Web Crypto (derivação de senha)
│       └── AniList GraphQL via fetch (perfil)
├── Imagens locais e externas
└── CDNs externos: Lucide / Google Fonts
```

**[Código]** É uma aplicação essencialmente **front-end multi-página**, sem compilação/build step exigido pelos arquivos identificados. A navegação principal usa links entre arquivos HTML, não roteamento de SPA. A divisão de CSS/JS é por página, porém a lógica `Usuarios` está duplicada em scripts diferentes.

## 10. Relações entre componentes para manutenção

1. **Cadastro ↔ Login ↔ Administração:** compartilham o contrato de dados `heads_usuarios`. Alterações em nomes de campos, regras de hash e estrutura de registro precisam preservar compatibilidade entre `cadastro.js`, `entrar.js` e `adm.js`.
2. **Login ↔ Perfil:** o login escreve `heads_sessao`; porém o perfil escolhe o cadastro mais recente em `heads_usuarios`, e não demonstra usar essa sessão como fonte principal de identidade. Não presumir que exibe sempre a pessoa autenticada.
3. **Perfil ↔ AniList:** listas e favoritos dependem de `USER = "moonpsd"`, do endpoint GraphQL e da rede. Erros de consulta são capturados e registrados; a renderização pode ficar parcial.
4. **JS ↔ HTML:** handlers usam IDs e classes específicos. Renomear `#formAdmin`, `#btnSenha`, `#activityList`, `#meuModal` etc. sem alterar os JS pode quebrar ações.
5. **CSS ↔ HTML/JS:** as classes `.retro-status`, `.retro-masthead` e `.retro-ticker` são criadas por scripts das páginas, não necessariamente aparecem no HTML estático. Os CSS contêm estilos para esses elementos injetados.
6. **Imagens:** trocar/renomear arquivos em `imgs/`, `img-noticias/` ou `assets/images/optimized/` exige atualizar as referências da marcação e dos scripts. URLs remotas podem falhar por indisponibilidade externa.

## 11. Limitações da análise

- Esta análise foi feita por **leitura estática dos arquivos**, sem ensaiar todos os fluxos em navegador real; não garante ausência de bugs de execução ou compatibilidade com todos os navegadores.
- Não foi verificada a publicação ou configuração de GitHub Pages, nem feita validação online de HTML/CSS no W3C.
- A resposta da API AniList e a existência/atualidade de todas as capas e listas externas não foram verificadas em rede.
- Não foram fornecidos arquivos de backend, banco de dados externo ou infraestrutura de autenticação; não se deve atribuir tais componentes ao projeto.
- Algumas estatísticas, atividades e gêneros do perfil são valores fixos/ilustrativos no HTML/JS; não podem ser descritos como métricas reais do usuário local.
- `admin.html` disponibiliza operações administrativas sem uma checagem de papéis/autorização comprovável no código da página; a proteção de rotas não pôde ser confirmada.
- A data/hora dos registros advém de `new Date().toISOString()` do cliente; sua precisão/autoridade depende do relógio do ambiente.
- A documentação não avalia a licença de uso das imagens ou a segurança da hospedagem.

## 12. Conclusão

**[Código]** O Akiba Station é um portal web multipágina de animes, construído com HTML, CSS e JavaScript. Oferece vitrine com sliders e cards, notícias com leitura em modal, formulários de cadastro/login, operações de cadastro e administração em `localStorage` e uma interface de perfil que combina dados locais com consultas AniList. A estilização segue uma paleta predominantemente rosa/escura e é definida em CSS separado por página.

**[Interpretação]** Para continuidade do desenvolvimento, os pontos centrais são o contrato JSON em `heads_usuarios`, os seletores usados pelos scripts, a duplicação da lógica de usuários e as dependências externas do perfil. **Não se deve assumir** backend ou autenticação segura apenas pela existência de telas de login e administração.

---

*Documento criado exclusivamente a partir dos arquivos verificados; código-fonte e recursos originais não foram modificados.*
