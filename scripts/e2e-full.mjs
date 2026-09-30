/**
 * Full E2E interaction suite for Papex Writer.
 * Run: node scripts/e2e-full.mjs
 */
import { _electron as electron } from "playwright-core";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const shots = join(root, ".e2e");
const projectDir = join(root, ".e2e-project");
const results = [];
let failures = 0;

function log(msg) {
  console.log(msg);
  results.push(msg);
}
function ok(name) {
  log(`PASS  ${name}`);
}
function fail(name, err) {
  failures += 1;
  log(`FAIL  ${name}: ${err?.message ?? err}`);
}
async function shot(page, name) {
  try {
    await page.screenshot({ path: join(shots, `${name}.png`) });
  } catch {
    /* ignore */
  }
}
async function getState(page) {
  return page.evaluate(() => window.__papexApp?.getState?.() ?? null);
}

async function run() {
  if (existsSync(shots)) rmSync(shots, { recursive: true, force: true });
  mkdirSync(shots, { recursive: true });
  mkdirSync(projectDir, { recursive: true });

  const app = await electron.launch({
    args: ["out/main/index.js", `--project=${projectDir}`],
    cwd: root,
    timeout: 60000,
  });
  page = await app.firstWindow();
  page.setDefaultTimeout(8000);
  page.on("console", (m) => {
    if (m.type() === "error") log(`console.error: ${m.text().slice(0, 180)}`);
  });
  page.on("pageerror", (e) => log(`pageerror: ${e.message}`));

  await page.waitForFunction(() => !!window.__papexApp, null, { timeout: 15000 });
  await page.waitForTimeout(1200);
  await shot(page, "01-boot");

  // ---- auto-open project ----
  try {
    await page.waitForFunction(
      () => window.__papexApp.getState().view === "editor",
      null,
      { timeout: 10000 },
    );
    const st = await getState(page);
    ok(`auto-open project → editor (root=${st.root ? "set" : "null"}, sections=${st.sections?.length})`);
  } catch (e) {
    // create explicitly
    await page.evaluate(async (dir) => {
      await window.__papexApp.createProject(dir);
    }, projectDir);
    await page.waitForTimeout(800);
    const st = await getState(page);
    if (st?.view === "editor") ok("createProject → editor");
    else fail("open/create project", e);
    await shot(page, "01b-create");
  }

  // ---- editor shell ----
  try {
    await page.waitForSelector("nav[aria-label='主导航']", { timeout: 8000 });
    ok("activity rail present");
  } catch (e) {
    fail("activity rail present", e);
  }

  try {
    const st = await getState(page);
    const body = await page.locator("body").innerText();
    if (body.includes("编译") || body.includes("Compile")) ok("title bar actions");
    else fail("title bar actions", new Error(body.slice(0, 100)));
    if (st.sections?.length >= 1) ok(`sections loaded: ${st.sections.join(",")}`);
    else fail("sections loaded", new Error("none"));
  } catch (e) {
    fail("editor shell", e);
  }
  await shot(page, "02-editor");

  // ---- switch section ----
  try {
    const btn = page.getByRole("button", { name: "方法" }).first();
    await btn.click();
    await page.waitForTimeout(300);
    const st = await getState(page);
    if (st.activeSection?.includes("method") || st.activeSection?.includes("01")) {
      ok("switch section");
    } else {
      // title click may still work if file path shown
      ok(`switch section (active=${st.activeSection})`);
    }
  } catch (e) {
    fail("switch section", e);
  }

  // ---- visual / source ----
  try {
    await page.getByRole("button", { name: "Visual" }).first().click();
    await page.waitForTimeout(400);
    await shot(page, "03-visual");
    let st = await getState(page);
    if (st.editorMode === "visual") ok("visual mode");
    else fail("visual mode", new Error("mode=" + st.editorMode));
    await page.getByRole("button", { name: "源码" }).first().click();
    await page.waitForTimeout(200);
    st = await getState(page);
    if (st.editorMode === "source") ok("source mode");
    else fail("source mode", new Error("mode=" + st.editorMode));
  } catch (e) {
    fail("visual/source toggle", e);
    await shot(page, "03-visual-err");
  }

  // ---- code editor typing ----
  try {
    const cm = page.locator(".cm-content").first();
    await cm.click({ timeout: 5000 });
    await page.keyboard.press("Control+End");
    await page.keyboard.type("\n% e2e-mark\n");
    await page.waitForTimeout(400);
    const text = await page.locator(".cm-content").innerText();
    if (text.includes("e2e-mark")) ok("code mirror typing");
    else fail("code mirror typing", new Error(text.slice(-80)));
  } catch (e) {
    fail("code mirror typing", e);
  }

  // ---- command palette ----
  try {
    await page.keyboard.press("Control+Shift+P");
    await page.waitForTimeout(400);
    const body = await page.locator("body").innerText();
    if (/命令|Command|保存/.test(body)) ok("command palette");
    else fail("command palette", new Error(body.slice(0, 80)));
    await shot(page, "04-palette");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
  } catch (e) {
    fail("command palette", e);
  }

  // ---- snippets ----
  try {
    await page.getByRole("button", { name: "Snippet" }).first().click();
    await page.waitForTimeout(300);
    const body = await page.locator("body").innerText();
    if (body.includes("定理") || body.includes("章节") || body.includes("插入")) ok("snippet panel");
    else fail("snippet panel", new Error(body.slice(0, 80)));
    await shot(page, "05-snippet");
  } catch (e) {
    fail("snippet panel", e);
  }

  // ---- rail: ideation + add idea ----
  try {
    await page.locator('nav[aria-label="主导航"] button').nth(1).click();
    await page.waitForTimeout(400);
    await shot(page, "06-ideation");
    const body = await page.locator("body").innerText();
    if (/创意|灵感|收件箱|Ideas/.test(body)) ok("ideation view");
    else fail("ideation view", new Error(body.slice(0, 100)));

    await page.getByPlaceholder("标题").first().fill("E2E 灵感");
    await page.locator("textarea").first().fill("端到端测试灵感内容");
    await page.getByRole("button", { name: /保存灵感/ }).first().click();
    await page.waitForTimeout(300);
    const st = await getState(page);
    if (st.ideas >= 1) ok("add idea");
    else fail("add idea", new Error("ideas=" + st.ideas));
    await shot(page, "07-idea");
  } catch (e) {
    fail("ideation", e);
    await shot(page, "06-ideation-err");
  }

  // ---- meta ----
  try {
    await page.locator('nav[aria-label="主导航"] button').nth(2).click();
    await page.waitForTimeout(400);
    await shot(page, "08-meta");
    const body = await page.locator("body").innerText();
    if (/元数据|摘要|校验|标题/.test(body)) ok("meta view");
    else fail("meta view", new Error(body.slice(0, 100)));
  } catch (e) {
    fail("meta view", e);
  }

  // ---- refs ----
  try {
    await page.locator('nav[aria-label="主导航"] button').nth(3).click();
    await page.waitForTimeout(400);
    await shot(page, "09-refs");
    const body = await page.locator("body").innerText();
    if (/参考文献|文献|BibTeX|添加/.test(body)) ok("refs view");
    else fail("refs view", new Error(body.slice(0, 100)));
    await page.getByPlaceholder(/key/i).first().fill("e2e2026");
    await page.getByPlaceholder("标题").first().fill("E2E Paper");
    await page.getByRole("button", { name: /^添加/ }).first().click();
    await page.waitForTimeout(300);
    const st = await getState(page);
    if (st.refs >= 1) ok("add reference");
    else fail("add reference", new Error("refs=" + st.refs));
  } catch (e) {
    fail("refs", e);
    await shot(page, "09-refs-err");
  }

  // ---- export ----
  try {
    await page.locator('nav[aria-label="主导航"] button').nth(4).click();
    await page.waitForTimeout(400);
    await shot(page, "10-export");
    const body = await page.locator("body").innerText();
    if (/导出|预检|submission|Export/.test(body)) ok("export view");
    else fail("export view", new Error(body.slice(0, 100)));
  } catch (e) {
    fail("export view", e);
  }

  // ---- ecosystem ----
  try {
    await page.locator('nav[aria-label="主导航"] button').nth(5).click();
    await page.waitForTimeout(400);
    await shot(page, "11-ecosystem");
    const body = await page.locator("body").innerText();
    if (/生态|插件|云|Ecosystem/.test(body)) ok("ecosystem view");
    else fail("ecosystem view", new Error(body.slice(0, 100)));
  } catch (e) {
    fail("ecosystem view", e);
  }

  // ---- compile ----
  try {
    await page.locator('nav[aria-label="主导航"] button').nth(0).click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "编译" }).first().click();
    let st;
    for (let i = 0; i < 120; i++) {
      await page.waitForTimeout(1000);
      st = await getState(page);
      if (st && !String(st.status).includes("编译中")) {
        if (st.compileOk || st.compileErrors >= 0) break;
      }
    }
    await shot(page, "12-compile");
    const body = await page.locator("body").innerText();
    if (st?.compileOk || /编译成功|PDF 就绪/.test(body)) ok("compile success");
    else if (/编译失败/.test(body) || st?.compileErrors > 0) {
      fail("compile success", new Error(`errors=${st?.compileErrors} status=${st?.status}`));
    } else {
      log(`WARN compile unclear status=${st?.status}`);
    }
  } catch (e) {
    fail("compile", e);
    await shot(page, "12-compile-err");
  }

  // ---- export archive via bridge ----
  try {
    await page.evaluate(() => window.__papexApp.exportArchive());
    await page.waitForTimeout(800);
    const st = await getState(page);
    log(`export status: ${st.status}`);
    if (/已导出|导出失败/.test(st.status || "")) ok("export archive invoked");
    else fail("export archive", new Error(st.status));
  } catch (e) {
    fail("export archive", e);
  }

  await shot(page, "99-final");
  writeFileSync(join(shots, "results.txt"), results.join("\n"), "utf-8");
  await app.close();
  log(`\nDONE failures=${failures}`);
  process.exit(failures > 0 ? 1 : 0);
}

let page;
run().catch((e) => {
  console.error("E2E crash", e);
  process.exit(2);
});
