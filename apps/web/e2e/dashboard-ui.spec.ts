import { expect, test, type Locator, type Page } from "@playwright/test";
import { mockDashboardApi } from "./fixtures/analysis";

async function completeJsonAnalysis(page: Page) {
  await page
    .getByLabel("Speech assessment JSON input")
    .fill(JSON.stringify({ result: [] }));
  await expect(page.getByRole("button", { name: "Analyze Pronunciation" })).toBeEnabled();
  await page.getByRole("button", { name: "Analyze Pronunciation" }).click();
  await expect(page.getByText("What should I practice next?")).toBeVisible();
}

async function topOf(locator: Locator) {
  const box = await locator.first().boundingBox();
  if (!box) {
    throw new Error("Expected locator to have a visible bounding box");
  }
  return box.y;
}

test("shadcn app shell exposes enabled practice surfaces and disabled future surfaces", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByText("LocalSpeak", { exact: true })).toBeVisible();
  await expect(page.getByText("IELTS speaking practice", { exact: true })).toBeVisible();
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

  await page.getByRole("button", { name: /IELTS Practice/i }).click({ force: true });
  await expect(page.getByRole("button", { name: "JSON Analysis" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await expect(page.getByText("Premium coach", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Premium pronunciation coach")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Live Audio", exact: true })).toHaveCount(0);
});

test("JSON Analysis preserves input validation and outcome-first result order", async ({
  page,
}) => {
  await mockDashboardApi(page);
  await page.goto("/");

  await completeJsonAnalysis(page);

  const priority = page.getByText("What should I practice next?");
  const reviewLink = page.getByRole("link", { name: "Review the evidence" });
  const metrics = page.getByTestId("summary-metric-label").first();
  const savedSessions = page.getByText("Saved sessions");
  const changeInput = page.getByRole("button", { name: "Change JSON input" });

  await expect(reviewLink).toBeVisible();
  await expect(page.getByTestId("summary-metric-label")).toHaveText([
    "Pronunciation",
    "Pronunciation Band",
    "Fluency Band",
    "WPM",
    "Pause Ratio",
  ]);
  await expect(savedSessions).toBeVisible();
  await expect(changeInput).toBeVisible();

  expect(await topOf(priority)).toBeLessThanOrEqual(await topOf(reviewLink));
  expect(await topOf(reviewLink)).toBeLessThanOrEqual(await topOf(metrics));
  expect(await topOf(metrics)).toBeLessThanOrEqual(await topOf(savedSessions));
  expect(await topOf(savedSessions)).toBeLessThanOrEqual(await topOf(changeInput));

  await changeInput.click();
  await page
    .getByLabel("Speech assessment JSON input")
    .fill(JSON.stringify({ result: [], changed: true }));
  await expect(
    page.getByText("Input changed. Analyze again to update these results."),
  ).toBeVisible();

  await expect(page.getByRole("tab", { name: "IELTS Analysis" })).toBeVisible();
  await page.getByRole("tab", { name: "IELTS Analysis" }).click();
  await expect(page.getByRole("button", { name: "Get AI Feedback" })).toBeVisible();
});

test("Live Audio Practice preserves no-reference and ready states", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Live Audio Practice" }).click();
  await expect(page.getByLabel("Reference sentence")).toBeVisible();
  await expect(
    page.getByText(
      "Enter one sentence first. Recording stays disabled until LocalSpeak knows what you want to practice.",
    ).first(),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Recording" })).toBeDisabled();
  await expect(page.getByText("Your live transcript will appear here.").first()).toBeVisible();

  await page.getByLabel("Reference sentence").fill("The trees stood near the street.");
  await expect(page.getByRole("button", { name: "Start Recording" })).toBeEnabled();
});
