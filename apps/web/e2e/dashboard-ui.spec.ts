import { expect, test, type Page } from "@playwright/test";
import { mockDashboardApi } from "./fixtures/analysis";

async function completeJsonAnalysis(page: Page) {
  await page
    .getByLabel("Speech assessment JSON input")
    .fill(JSON.stringify({ result: [] }));
  await expect(page.getByRole("button", { name: "Analyze Pronunciation" })).toBeEnabled();
  await page.getByRole("button", { name: "Analyze Pronunciation" }).click();
  await expect(page.getByRole("heading", { name: "What should I practice next?" })).toBeVisible();
}

test("polished dashboard leads with results and keeps secondary controls quiet", async ({
  page,
}) => {
  await mockDashboardApi(page);

  await page.goto("/");
  await expect(page.getByRole("button", { name: "JSON Analysis" }).first()).toHaveAttribute(
    "aria-current",
    "page",
  );

  await completeJsonAnalysis(page);
  await expect(page.getByText("Start with the TH / theta sound pattern.")).toBeVisible();
  await expect(page.getByTestId("summary-metric-label")).toHaveText([
    "Pronunciation",
    "Pronunciation Band",
    "Fluency Band",
    "WPM",
  ]);
  await expect(page.getByText("Pause ratio", { exact: true })).toBeVisible();
  await expect(page.getByText("Try saying \"trees stood\" as one short phrase")).toBeVisible();
  await expect(page.getByText("Change JSON input")).toBeVisible();
  await expect(page.getByLabel("Speech assessment JSON input")).toBeHidden();

  await page.getByRole("tab", { name: "IELTS Analysis" }).click();
  await expect(page.getByRole("button", { name: "Get AI Feedback" })).toBeVisible();

  await page.getByRole("button", { name: /Live Audio/i }).last().click();
  await expect(page.getByLabel("Reference sentence")).toBeVisible();
});

test("mobile JSON layout stays within the same phone shell as live audio", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockDashboardApi(page);

  await page.goto("/");
  await completeJsonAnalysis(page);
  await expect(page.getByTestId("summary-metric-label")).toHaveCount(4);

  const jsonWidth = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(jsonWidth.scrollWidth).toBeLessThanOrEqual(jsonWidth.clientWidth);

  await page.getByRole("button", { name: /Live Audio/i }).last().click();
  await expect(page.getByLabel("Reference sentence")).toBeVisible();
  const audioWidth = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(audioWidth.scrollWidth).toBeLessThanOrEqual(audioWidth.clientWidth);
});
