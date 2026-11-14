const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("playwright");

const base = process.env.NEWS_URL || "http://127.0.0.1:8765/noticias.html";
const evidence = process.env.NEWS_EVIDENCE || require("node:path").join(__dirname, "evidencias");
fs.mkdirSync(evidence, { recursive: true });
const results = { browser: "Chromium", viewports: [], checks: [], errors: [], requestsFailed: [] };
const record = (message) => {
    results.checks.push(message);
    console.log(`OK ${message}`);
};

(async () => {
    const browser = await chromium.launch({
        headless: true,
        executablePath:
            process.env.CHROMIUM_PATH ||
            (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
        args: ["--no-sandbox"],
    });
    results.browserVersion = browser.version();
    try {
        for (const width of [1920, 1366, 1024, 768, 430, 390, 360]) {
            const page = await browser.newPage({
                viewport: { width, height: width < 600 ? 844 : 1080 },
            });
            page.on("pageerror", (error) => results.errors.push(error.message));
            page.on("requestfailed", (request) => results.requestsFailed.push(request.url()));
            page.on("response", (response) => {
                if (response.status() >= 400)
                    results.errors.push(`HTTP ${response.status()} ${response.url()}`);
            });
            await page.goto(base);
            await page.locator("#status-noticias").filter({ hasText: "14 de 26" }).waitFor();
            assert.equal(await page.locator(".card-noticia:visible").count(), 14);
            assert.equal(await page.locator(".noticia-extra:not([hidden])").count(), 0);
            assert.equal(await page.locator("h1").count(), 1);
            assert.equal(await page.locator('a[aria-current="page"]').count(), 1);

            const geometry = await page.evaluate(() => {
                const cards = [...document.querySelectorAll(".card-noticia:not([hidden])")];
                return {
                    overflow:
                        document.documentElement.scrollWidth > document.documentElement.clientWidth,
                    cards: cards.map((card) => {
                        const rect = card.getBoundingClientRect();
                        const media = card.querySelector("figure").getBoundingClientRect();
                        return {
                            width: rect.width,
                            height: rect.height,
                            top: rect.top,
                            mediaHeight: media.height,
                        };
                    }),
                    sources: [...document.querySelectorAll("main img")].map(
                        (img) => img.currentSrc,
                    ),
                };
            });
            assert.equal(geometry.overflow, false, `${width}: rolagem horizontal`);
            assert(
                Math.max(...geometry.cards.map((x) => x.width)) -
                    Math.min(...geometry.cards.map((x) => x.width)) <
                    1,
            );
            assert(
                Math.max(...geometry.cards.map((x) => x.mediaHeight)) -
                    Math.min(...geometry.cards.map((x) => x.mediaHeight)) <
                    1,
            );
            const rows = Map.groupBy(geometry.cards, (card) => card.top);
            for (const row of rows.values()) {
                assert(
                    Math.max(...row.map((x) => x.height)) - Math.min(...row.map((x) => x.height)) <
                        1,
                );
            }

            if (width < 900) {
                const button = page.locator(".botao-menu");
                assert.equal(await page.locator("#menu-principal").isVisible(), false);
                await button.click();
                assert.equal(await button.getAttribute("aria-expanded"), "true");
                assert.equal(await page.locator(".menus a").count(), 4);
                assert.equal(await page.locator(".area-usuario").isVisible(), true);
                assert.equal(
                    await page.evaluate(
                        () =>
                            document.documentElement.scrollWidth >
                            document.documentElement.clientWidth,
                    ),
                    false,
                );
                await page.keyboard.press("Escape");
                assert.equal(await page.locator("#menu-principal").isVisible(), false);
                assert.equal(await button.evaluate((el) => el === document.activeElement), true);
            } else {
                assert.equal(await page.locator(".botao-menu").isVisible(), false);
                assert.equal(await page.locator("#menu-principal").isVisible(), true);
            }

            const heroLink = page.locator("#noticia-destaque [data-abrir-noticia]");
            await heroLink.focus();
            await page.keyboard.press("Enter");
            await page.locator("#meuModal[open]").waitFor();
            await page.waitForFunction(
                () =>
                    document.getElementById("modal-img").complete &&
                    document.getElementById("modal-img").naturalWidth > 0,
            );
            assert.equal(await page.locator("#modal-tit").innerText(), await heroLink.innerText());
            assert.equal(await page.locator("#modal-cat").textContent(), "Trailer");
            assert.equal(
                await page.locator("#modal-img").getAttribute("alt"),
                await page.locator("#noticia-destaque img").getAttribute("alt"),
            );
            assert.match(await page.locator("#modal-img").getAttribute("src"), /destaque/);
            assert.equal(
                await page.locator("body").evaluate((el) => getComputedStyle(el).overflow),
                "hidden",
            );
            assert.equal(
                await page.locator(".botao-fechar").evaluate((el) => el === document.activeElement),
                true,
            );
            for (const key of ["Tab", "Shift+Tab", "Tab"]) {
                await page.keyboard.press(key);
                assert.equal(
                    await page
                        .locator("#meuModal")
                        .evaluate((el) => el.contains(document.activeElement)),
                    true,
                );
            }
            const scrollBeforeWheel = await page.evaluate(() => scrollY);
            await page.mouse.move(2, 2);
            await page.mouse.wheel(0, 700);
            await page.waitForTimeout(100);
            assert.equal(await page.evaluate(() => scrollY), scrollBeforeWheel);
            await page.locator("#modal-tit").click();
            assert.equal(await page.locator("#meuModal").evaluate((el) => el.open), true);
            const modalGeometry = await page.locator("#meuModal").evaluate((el) => ({
                rect: el.getBoundingClientRect().toJSON(),
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth,
            }));
            assert(modalGeometry.rect.x >= 0 && modalGeometry.rect.right <= width);
            assert(modalGeometry.scrollWidth <= modalGeometry.clientWidth);
            if ([1366, 360].includes(width))
                await page.screenshot({ path: `${evidence}/modal-${width}.png` });
            await page.keyboard.press("Escape");
            await page.locator("#meuModal[open]").waitFor({ state: "hidden" });
            await page.waitForFunction(() => !document.body.classList.contains("modal-aberto"));
            assert.equal(await heroLink.evaluate((el) => el === document.activeElement), true);

            const firstLink = page.locator(".card-noticia [data-abrir-noticia]").first();
            const firstFigure = page.locator(".card-noticia figure").first();
            await firstFigure.scrollIntoViewIfNeeded();
            const firstFigureBox = await firstFigure.boundingBox();
            await page.mouse.click(
                firstFigureBox.x + firstFigureBox.width / 2,
                firstFigureBox.y + firstFigureBox.height / 2,
            );
            await page.locator("#meuModal[open]").waitFor();
            await page.waitForTimeout(200);
            await page.mouse.click(2, 2);
            await page.waitForFunction(() => !document.getElementById("meuModal").open);
            await page.waitForFunction(() => !document.body.classList.contains("modal-aberto"));
            assert.equal(await firstLink.evaluate((el) => el === document.activeElement), true);

            const load = page.locator("#btn-carregar");
            await load.click();
            assert.equal(await page.locator(".card-noticia:visible").count(), 26);
            assert.equal(await load.isVisible(), false);
            assert.equal(await page.locator("#status-noticias").innerText(), "26 de 26 notícias");
            assert.equal(
                await page
                    .locator(".noticia-extra [data-abrir-noticia]")
                    .first()
                    .evaluate((el) => el === document.activeElement),
                true,
            );
            await load.evaluate((el) => {
                el.click();
                el.click();
            });
            assert.equal(await page.locator(".card-noticia").count(), 26);

            // Toda notícia, inclusive as extras, precisa abrir seus próprios dados.
            const links =
                width === 1366
                    ? await page.locator("[data-abrir-noticia]").all()
                    : [page.locator(".noticia-extra [data-abrir-noticia]").last()];
            for (const link of links) {
                const expected = await link.evaluate((el) => {
                    const article = el.closest("[data-noticia]");
                    return {
                        title: article.querySelector("h3").textContent.trim().replace(/\s+/g, " "),
                        category: article.querySelector(".categoria").textContent,
                        text: article.dataset.texto,
                        image: article.dataset.imagemModal,
                    };
                });
                await link.click();
                await page.locator("#meuModal[open]").waitFor();
                assert.equal(
                    (await page.locator("#modal-tit").innerText()).trim().replace(/\s+/g, " "),
                    expected.title,
                );
                assert.equal(await page.locator("#modal-cat").textContent(), expected.category);
                assert.equal(await page.locator("#modal-texto").innerText(), expected.text);
                assert.equal(await page.locator("#modal-img").getAttribute("src"), expected.image);
                await page.waitForFunction(
                    () =>
                        document.getElementById("modal-img").complete &&
                        document.getElementById("modal-img").naturalWidth > 0,
                );
                await page.locator(".botao-fechar").click();
                await page.waitForFunction(() => !document.body.classList.contains("modal-aberto"));
                assert.equal(await link.evaluate((el) => el === document.activeElement), true);
            }

            // Força o carregamento de todas as imagens lazy para detectar recursos inválidos.
            await page.evaluate(() =>
                document.querySelectorAll("img").forEach((el) => (el.loading = "eager")),
            );
            await page.waitForFunction(() =>
                [...document.querySelectorAll("img[src]")].every(
                    (img) => img.complete && img.naturalWidth > 0,
                ),
            );
            assert.equal(
                await page.evaluate(
                    () =>
                        document.documentElement.scrollWidth > document.documentElement.clientWidth,
                ),
                false,
            );
            results.viewports.push({
                width,
                overflow: false,
                initialCards: 14,
                totalCards: 26,
                modal: "OK",
                menu: "OK",
                images: "OK",
            });

            // Capturas da composição inicial, após a bateria funcional.
            await page.reload();
            await page.evaluate(() =>
                document.querySelectorAll("img").forEach((el) => (el.loading = "eager")),
            );
            await page.waitForFunction(() =>
                [...document.querySelectorAll("main img")].every(
                    (img) => img.complete && img.naturalWidth > 0,
                ),
            );
            await page.evaluate(async () => {
                window.scrollTo(0, 0);
                await Promise.all(
                    [...document.querySelectorAll("main img")].map((img) => img.decode()),
                );
                await new Promise((resolve) =>
                    requestAnimationFrame(() => requestAnimationFrame(resolve)),
                );
            });
            await page.screenshot({ path: `${evidence}/pagina-${width}.png`, fullPage: true });
            if (width === 1366) {
                await page.addScriptTag({
                    path: process.env.AXE_SCRIPT || require.resolve("axe-core/axe.min.js"),
                });
                const audit = await page.evaluate(async () =>
                    axe.run(document, {
                        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
                    }),
                );
                fs.writeFileSync(`${evidence}/acessibilidade.json`, JSON.stringify(audit, null, 2));
                assert.equal(
                    audit.violations.length,
                    0,
                    JSON.stringify(
                        audit.violations.map((v) => ({
                            id: v.id,
                            nodes: v.nodes.map((n) => n.target),
                        })),
                    ),
                );
                await heroLink.click();
                const modalAudit = await page.evaluate(async () =>
                    axe.run(document, {
                        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
                    }),
                );
                fs.writeFileSync(
                    `${evidence}/acessibilidade-modal.json`,
                    JSON.stringify(modalAudit, null, 2),
                );
                assert.equal(
                    modalAudit.violations.length,
                    0,
                    JSON.stringify(modalAudit.violations.map((v) => v.id)),
                );
                await page.keyboard.press("Escape");
                record("axe-core: página e dialog sem violações automáticas WCAG A/AA detectadas");
            }
            record(
                `${width}px: grade, imagens, navegação, teclado, três formas de fechar modal, foco e carregamento`,
            );
            await page.close();
        }

        // Mudanças de breakpoint não podem esconder o menu de desktop.
        const resize = await browser.newPage({ viewport: { width: 390, height: 844 } });
        await resize.goto(base);
        await resize.locator(".botao-menu").click();
        await resize.setViewportSize({ width: 1024, height: 900 });
        assert.equal(await resize.locator("#menu-principal").isVisible(), true);
        await resize.locator(".menus a").first().focus();
        await resize.setViewportSize({ width: 390, height: 844 });
        await resize.waitForFunction(() =>
            document.activeElement?.classList.contains("botao-menu"),
        );
        assert.equal(await resize.locator("#menu-principal").isVisible(), false);
        await resize.close();
        record("Redimensionamento desktop/celular com foco seguro");

        // A preferência por menos movimento deve suprimir animações.
        const reduced = await browser.newPage({
            viewport: { width: 390, height: 844 },
            reducedMotion: "reduce",
        });
        await reduced.goto(base);
        await reduced.locator("#btn-carregar").click();
        assert.equal(
            await reduced
                .locator(".noticia-extra")
                .first()
                .evaluate((el) => getComputedStyle(el).animationName),
            "none",
        );
        await reduced.locator(".noticia-extra [data-abrir-noticia]").first().click();
        assert.equal(
            await reduced.locator("#meuModal").evaluate((el) => getComputedStyle(el).animationName),
            "none",
        );
        await reduced.close();
        record("prefers-reduced-motion respeitado");

        const nojsContext = await browser.newContext({
            javaScriptEnabled: false,
            viewport: { width: 390, height: 844 },
        });
        const nojs = await nojsContext.newPage();
        await nojs.goto(base);
        assert.equal(await nojs.locator(".card-noticia:visible").count(), 26);
        assert.equal(await nojs.locator("#btn-carregar").isVisible(), false);
        assert.equal(await nojs.locator("#menu-principal").isVisible(), true);
        await nojsContext.close();
        record("Sem JavaScript: notícias e navegação permanecem visíveis");

        const originalHtml = await (await fetch(base)).text();
        for (const mode of ["sem-extras", "sem-modal", "grade-vazia"]) {
            const page = await browser.newPage();
            const errors = [];
            page.on("pageerror", (error) => errors.push(error.message));
            let modified = originalHtml;
            if (mode === "sem-extras") modified = modified.replace(/\bnoticia-extra\b/g, "");
            if (mode === "sem-modal")
                modified = modified.replace(/<dialog\b[\s\S]*?<\/dialog>/, "");
            if (mode === "grade-vazia")
                modified = modified.replace(
                    /<article\b[^>]*class="card-noticia[\s\S]*?<\/article>/g,
                    "",
                );
            await page.route(base, (route) =>
                route.fulfill({ status: 200, contentType: "text/html", body: modified }),
            );
            await page.goto(base);
            if (mode !== "sem-modal")
                assert.equal(await page.locator("#btn-carregar").isVisible(), false);
            if (mode === "sem-modal") await page.locator("[data-abrir-noticia]").first().click();
            assert.deepEqual(errors, []);
            await page.close();
            record(`Defensividade: ${mode}, sem erros JavaScript`);
        }
        assert.deepEqual(results.errors, []);
        assert.deepEqual(results.requestsFailed, []);
        results.status = "APROVADO";
    } finally {
        fs.writeFileSync(`${evidence}/testes.json`, JSON.stringify(results, null, 2));
        await browser.close();
    }
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
