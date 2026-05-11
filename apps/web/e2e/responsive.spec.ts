import { expect, test, type Page } from "@playwright/test";
import { mockDashboardApi } from "./fixtures/analysis";

type Rgb = [number, number, number];

function parseRgb(color: string): Rgb {
  const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) {
    throw new Error(`Expected rgb/rgba color, received: ${color}`);
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function relativeLuminance([red, green, blue]: Rgb) {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string) {
  const fg = relativeLuminance(parseRgb(foreground));
  const bg = relativeLuminance(parseRgb(background));
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);

  return (lighter + 0.05) / (darker + 0.05);
}

function expectRgb(color: string, expected: Rgb) {
  expect(parseRgb(color)).toEqual(expected);
}

async function expectNoHorizontalOverflow(page: Page) {
  const width = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(width.scrollWidth).toBeLessThanOrEqual(width.clientWidth);
}

async function completeJsonAnalysis(page: Page) {
  await page
    .getByLabel("Speech assessment JSON input")
    .fill(JSON.stringify({ result: [] }));
  await expect(page.getByRole("button", { name: "Analyze Pronunciation" })).toBeEnabled();
  await page.getByRole("button", { name: "Analyze Pronunciation" }).click();
  await expect(page.getByText("What should I practice next?")).toBeVisible();
}

async function openMobileSidebar(page: Page) {
  const sidebarTrigger = page.locator('[data-sidebar="trigger"]');
  await expect(sidebarTrigger).toBeVisible();
  await sidebarTrigger.focus();
  await expect(sidebarTrigger).toBeFocused();
  await sidebarTrigger.click();
}

test("desktop Sidebar shell exposes shadcn navigation without the old bottom nav", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  await expect(page.getByRole("button", { name: "JSON Analysis" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Live Audio Practice" })).toBeVisible();
  await expect(page.getByRole("button", { name: /IELTS Practice/i })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(page.getByRole("button", { name: /TOEIC Practice/i })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(page.getByRole("button", { name: "Live Audio", exact: true })).toHaveCount(0);
  await expect(page.locator("nav.fixed, nav[class*='bottom-0'], nav[class*='fixed']")).toHaveCount(0);

  await page.locator('[data-sidebar="trigger"]').click();
  await page.getByRole("button", { name: /IELTS Practice/i }).hover();
  await expect(
    page.locator('[data-slot="tooltip-content"]').filter({ hasText: "IELTS Practice" }),
  ).toBeVisible();
});

test("mobile sidebar trigger opens future-aware navigation at 390px without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expectNoHorizontalOverflow(page);
  await openMobileSidebar(page);

  await expect(page.getByRole("button", { name: "JSON Analysis" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Live Audio Practice" })).toBeVisible();
  await expect(page.getByRole("button", { name: /IELTS Practice/i })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(page.getByRole("button", { name: /TOEIC Practice/i })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(page.getByText("Coming soon").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Live Audio", exact: true })).toHaveCount(0);
  await expect(page.locator("nav.fixed, nav[class*='bottom-0'], nav[class*='fixed']")).toHaveCount(0);
});

test("JSON analysis stays within 390px and keeps role-based tabs keyboardable", async ({
  page,
}) => {
  await mockDashboardApi(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expectNoHorizontalOverflow(page);
  await completeJsonAnalysis(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.getByRole("tablist")).toBeVisible();
  const pauseTab = page.getByRole("tab", { name: "Pause Analysis" });
  await expect(pauseTab).toBeVisible();
  await expect(page.getByRole("tab", { name: "Words" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Phonemes" })).toBeVisible();

  await pauseTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Words" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("Live Audio Practice stays within 390px and keeps the primary recording action usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await openMobileSidebar(page);
  await page.getByRole("button", { name: "Live Audio Practice" }).click();

  await expect(page.locator('[data-sidebar="sidebar"][data-mobile="true"]')).toBeHidden();
  await expect(page.getByLabel("Reference sentence")).toBeVisible();
  await expect(
    page.getByText(
      "Enter one sentence first. Recording stays disabled until LocalSpeak knows what you want to practice.",
    ).first(),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Recording" })).toBeDisabled();
  await expectNoHorizontalOverflow(page);

  await page.getByLabel("Reference sentence").fill("The trees stood near the street.");
  const startButton = page.getByRole("button", { name: "Start Recording" });
  await expect(startButton).toBeEnabled();
  const box = await startButton.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
});

test("labels, focus, contrast, and anti-reuse guards match the shadcn rebuild", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByLabel("Speech assessment JSON input")).toBeVisible();
  await expect(page.getByLabel("Upload .json file")).toBeAttached();
  await expect(page.getByRole("button", { name: "Analyze Pronunciation" })).toBeVisible();
  await page.getByRole("button", { name: "Live Audio Practice" }).focus();
  await expect(page.getByRole("button", { name: "Live Audio Practice" })).toBeFocused();
  await page.getByRole("button", { name: "JSON Analysis" }).focus();
  await expect(page.getByRole("button", { name: "JSON Analysis" })).toBeFocused();
  const sidebarTrigger = page.locator('[data-sidebar="trigger"]');
  await sidebarTrigger.focus();
  await expect(sidebarTrigger).toBeFocused();

  const bodyColors = await page.evaluate(() => {
    const bodyStyle = getComputedStyle(document.body);
    return {
      backgroundColor: bodyStyle.backgroundColor,
      color: bodyStyle.color,
    };
  });
  expectRgb(bodyColors.backgroundColor, [250, 250, 250]);
  expectRgb(bodyColors.color, [23, 23, 23]);
  expect(contrastRatio(bodyColors.color, bodyColors.backgroundColor)).toBeGreaterThanOrEqual(4.5);

  const primaryButtonColor = await page
    .getByRole("button", { name: "Analyze Pronunciation" })
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  expectRgb(primaryButtonColor, [37, 99, 235]);

  await page.getByRole("button", { name: "Live Audio Practice" }).click();
  await expect(page.getByLabel("Reference sentence")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Recording" })).toBeVisible();

  await expect(page.getByText("Premium coach", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Premium pronunciation coach")).toHaveCount(0);
  await expect(page.getByText("Know exactly what to practice next.")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Live Audio", exact: true })).toHaveCount(0);
});
