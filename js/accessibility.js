(() => {
  "use strict";

  const storageKey = "akiba.accessibility";
  const fontSizes = [80, 90, 100, 110, 120, 130, 140, 150, 175, 200];
  const themes = ["dark", "light", "contrast"];
  const defaults = { font: 100, spacing: false, theme: "dark" };
  const root = document.documentElement;

  function preferencesFrom(value) {
    const saved = JSON.parse(value) || {};

    return {
      font: fontSizes.includes(saved.font) ? saved.font : defaults.font,
      spacing: saved.spacing === true,
      theme: themes.includes(saved.theme) ? saved.theme : defaults.theme,
    };
  }

  let preferences = { ...defaults };

  try {
    preferences = preferencesFrom(localStorage.getItem(storageKey));
  } catch {
  }

  function applyPreferences() {
    const scale = preferences.font / 100;

    root.style.fontSize = scale === 1 ? "" : `${preferences.font}%`;
    root.style.setProperty("--access-font-scale", scale === 1 ? "" : scale);
    root.toggleAttribute("data-access-font", scale !== 1);
    root.toggleAttribute("data-access-spacing", preferences.spacing);
    root.toggleAttribute("data-access-reflow", preferences.font > 100 || preferences.spacing);

    if (preferences.theme === "dark") {
      root.removeAttribute("data-access-theme");
    } else {
      root.dataset.accessTheme = preferences.theme;
    }
  }

  applyPreferences();

  function createPanel(launcher) {
    const markup = `
      <dialog id="access-panel" aria-labelledby="access-title">
        <h2 id="access-title">Acessibilidade</h2>

        <fieldset>
          <legend>Tamanho da fonte</legend>
          <div class="access-font-controls">
            <button type="button" id="access-font-down" aria-label="Diminuir fonte" autofocus>A−</button>
            <output id="access-font-value" aria-label="Tamanho atual da fonte">100%</output>
            <button type="button" id="access-font-up" aria-label="Aumentar fonte">A+</button>
          </div>
        </fieldset>

        <label class="access-choice">
          <input type="checkbox" id="access-spacing">
          Aumentar espaçamento do texto
        </label>

        <fieldset>
          <legend>Tema</legend>
          <label class="access-choice">
            <input type="radio" name="access-theme" value="dark" checked>
            Escuro
          </label>
          <label class="access-choice">
            <input type="radio" name="access-theme" value="light">
            Claro
          </label>
          <label class="access-choice">
            <input type="radio" name="access-theme" value="contrast">
            Alto contraste
          </label>
        </fieldset>

        <div class="access-actions">
          <button type="button" id="access-reset">Restaurar padrão</button>
          <button type="button" id="access-close">Fechar</button>
        </div>
      </dialog>
    `;

    document.body.insertAdjacentHTML("beforeend", markup);

    const panel = document.querySelector("#access-panel");
    launcher.setAttribute("aria-controls", panel.id);
    const closeButton = panel.querySelector("#access-close");
    const fontDown = panel.querySelector("#access-font-down");
    const fontUp = panel.querySelector("#access-font-up");
    const fontValue = panel.querySelector("#access-font-value");
    const spacing = panel.querySelector("#access-spacing");
    const themeOptions = panel.querySelectorAll('[name="access-theme"]');

    function syncControls() {
      const fontIndex = fontSizes.indexOf(preferences.font);

      fontDown.setAttribute("aria-disabled", fontIndex === 0);
      fontUp.setAttribute("aria-disabled", fontIndex === fontSizes.length - 1);
      fontValue.value = `${preferences.font}%`;
      spacing.checked = preferences.spacing;
      themeOptions.forEach((option) => {
        option.checked = option.value === preferences.theme;
      });
    }

    function updatePreferences(changes) {
      preferences = { ...preferences, ...changes };
      applyPreferences();
      syncControls();

      try {
        localStorage.setItem(storageKey, JSON.stringify(preferences));
      } catch {
      }
    }

    function changeFont(step) {
      const next = fontSizes[fontSizes.indexOf(preferences.font) + step];

      if (next !== undefined) {
        updatePreferences({ font: next });
      }
    }

    closeButton.addEventListener("click", () => panel.close());
    panel.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") {
        return;
      }

      if (event.shiftKey && event.target === fontDown) {
        event.preventDefault();
        closeButton.focus();
      } else if (!event.shiftKey && event.target === closeButton) {
        event.preventDefault();
        fontDown.focus();
      }
    });
    panel.addEventListener("close", () => launcher.focus({ preventScroll: true }));

    fontDown.addEventListener("click", () => changeFont(-1));
    fontUp.addEventListener("click", () => changeFont(1));
    spacing.addEventListener("change", () => updatePreferences({ spacing: spacing.checked }));
    themeOptions.forEach((option) => {
      option.addEventListener("change", () => updatePreferences({ theme: option.value }));
    });
    panel.querySelector("#access-reset").addEventListener("click", () => updatePreferences(defaults));

    window.addEventListener("storage", (event) => {
      if (event.storageArea === localStorage && (event.key === storageKey || event.key === null)) {
        try {
          preferences = preferencesFrom(event.newValue);
          applyPreferences();
          syncControls();
        } catch {
        }
      }
    });

    syncControls();
    return panel;
  }

  let panel;

  document.addEventListener("click", (event) => {
    const launcher = event.target.closest?.(".access-launcher");

    if (launcher) {
      panel ??= createPanel(launcher);
      if (!panel.open) {
        panel.showModal();
      }
    }
  });
})();
