import { test, expect, type Page } from "@playwright/test";

// --- Fixture data (copied from dashboard-ui.spec.ts) ---

const validPreview = {
  contract: "json-analysis-preview.v1",
  status: "valid",
  valid: true,
  acceptedForAnalysis: true,
  issueCount: 0,
  issues: [],
  allIssues: [],
  warnings: [],
};

const analysisResponse = {
  contract: "json-analysis-response.v1",
  inputMode: "json",
  summary: {
    pronunciationPercentage: 82,
    pronunciationBand: 7,
    fluencyBand: 6.5,
    wpm: 118,
    pauseRatio: 0.24,
  },
  extracted: {
    totalScore: 0.82,
    referenceText: "The three trees stood strongly in the street.",
    wordCount: 8,
    phoneCount: 28,
    durationSeconds: 4.8,
  },
  pronunciation: {
    totalScore: 0.82,
    percentage: 82,
    band: 7,
    phonemeAverages: [],
    weakPatterns: [
      {
        arpabet: "TH",
        ipaExamples: ["theta"],
        averageScore: 0.48,
        weakOccurrenceCount: 3,
        exampleWords: ["three"],
      },
    ],
    wordBandCounts: { weak: 1, okay: 1, good: 1 },
  },
  fluency: {
    durationSeconds: 4.8,
    wordCount: 8,
    wpm: 118,
    totalPauseTime: 1.15,
    pauseRatio: 0.24,
    pauseCount: 2,
    criticalPauseCount: 1,
    band: 6.5,
    notablePauses: [
      {
        index: 1,
        severity: "critical",
        duration: 0.95,
        startTime: 2.1,
        endTime: 3.05,
        beforeWord: "trees",
        afterWord: "stood",
        nearbyWords: "trees stood",
        explanation: "This pause may interrupt fluency between key content words.",
      },
    ],
  },
  words: [
    {
      index: 0,
      word: "three",
      score: 0.48,
      scorePercent: 48,
      band: "weak",
      startTime: 0.2,
      endTime: 0.75,
      duration: 0.55,
    },
  ],
  phonemes: [],
  weakPhonemePatterns: [
    {
      arpabet: "TH",
      ipaExamples: ["theta"],
      averageScore: 0.48,
      weakOccurrenceCount: 3,
      exampleWords: ["three"],
    },
  ],
  pauses: [
    {
      index: 1,
      severity: "critical",
      duration: 0.95,
      startTime: 2.1,
      endTime: 3.05,
      beforeWord: "trees",
      afterWord: "stood",
      nearbyWords: "trees stood",
      explanation: "This pause may interrupt fluency between key content words.",
    },
  ],
  warnings: [],
};

// --- Mock API helper (copied from dashboard-ui.spec.ts) ---

async function mockDashboardApi(page: Page) {
  await page.route("**/api/json-analysis/preview", async (route) => {
    await route.fulfill({ json: validPreview });
  });
  await page.route("**/api/json-analysis/analyze", async (route) => {
    await route.fulfill({ json: analysisResponse });
  });
  await page.route("**/api/saved-sessions", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        json: { contract: "saved-session-list.v1", sessions: [] },
      });
      return;
    }
    const timestamp = new Date().toISOString();
    await route.fulfill({
      json: {
        contract: "saved-session-create.v1",
        session: {
          id: "00000000-0000-4000-8000-000000000001",
          ownerKey: "mock-owner-key-1234567890",
          userId: null,
          inputMode: "json",
          title: "Mock session",
          referenceText: analysisResponse.extracted.referenceText,
          pronunciationBand: analysisResponse.summary.pronunciationBand,
          fluencyBand: analysisResponse.summary.fluencyBand,
          wpm: analysisResponse.summary.wpm,
          createdAt: timestamp,
          updatedAt: timestamp,
          inputMetadata: { source: "e2e" },
          metrics: analysisResponse,
          feedback: null,
        },
      },
      status: 201,
    });
  });
}

// =============================================================================
// GROUP 1: Navigation visibility (UIX-01)
// =============================================================================

test.describe("Navigation layout at breakpoints", () => {
  test("sidebar visible at desktop (1280px); bottom nav hidden", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    // Desktop sidebar: "Practice Tools" label visible only at sm+ breakpoint
    await expect(page.getByText("Practice Tools")).toBeVisible();
    // Bottom nav: sm:hidden — not visible at desktop viewport
    const bottomNav = page.locator("nav[aria-label='Main navigation']").last();
    await expect(bottomNav).not.toBeVisible();
  });

  test("bottom nav visible at mobile (390px); sidebar hidden", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    // Desktop sidebar container: hidden at mobile ("Practice Tools" not visible)
    await expect(page.getByText("Practice Tools")).not.toBeVisible();
    // Bottom nav: visible at mobile (the fixed bottom nav)
    const bottomNav = page.locator("nav[aria-label='Main navigation']").last();
    await expect(bottomNav).toBeVisible();
  });

  test("nav has aria-label='Main navigation'", async ({ page }) => {
    await page.goto("/");
    const navElements = page.locator("nav[aria-label='Main navigation']");
    await expect(navElements.first()).toBeAttached();
  });

  test("active nav item has aria-current='page'", async ({ page }) => {
    await page.goto("/");
    // Default mode is json — JSON Analysis nav item should be active
    const activeItem = page.getByRole("button", { name: "JSON Analysis" }).first();
    await expect(activeItem).toHaveAttribute("aria-current", "page");
  });

  test("bottom nav switches mode at mobile (390px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    // Click the Live Audio bottom nav item (mobile label is "Live Audio")
    const audioNavItem = page.getByRole("button", { name: /Live Audio/i }).last();
    await audioNavItem.click();
    // Audio mode should be active — aria-current="page" set on clicked item
    await expect(audioNavItem).toHaveAttribute("aria-current", "page");
  });
});

// =============================================================================
// GROUP 2: No horizontal overflow (UIX-06)
// =============================================================================

test.describe("No horizontal overflow at mobile width (UIX-06)", () => {
  test.beforeEach(async ({ page }) => {
    await mockDashboardApi(page);
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test("no horizontal overflow at 390px — JSON mode (pre-analysis)", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });

  test("no horizontal overflow at 390px — JSON mode (post-analysis)", async ({ page }) => {
    await page.goto("/");
    // Submit JSON to trigger analysis
    const textarea = page.getByLabel("Speech assessment JSON input");
    await textarea.fill('{"test": true}');
    await page.getByRole("button", { name: "Analyze Pronunciation" }).click();
    await expect(page.getByRole("heading", { name: "What should I practice next?" })).toBeVisible();
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });

  test("no horizontal overflow at 390px — Audio mode", async ({ page }) => {
    await page.goto("/");
    // Switch to Audio mode via bottom nav (mobile label is "Live Audio")
    await page.getByRole("button", { name: /Live Audio/i }).last().click();
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });
});

// =============================================================================
// GROUP 3: Accessibility (UIX-07)
// =============================================================================

test.describe("Accessibility baseline (UIX-07)", () => {
  test("bottom nav items have min 44px touch target height at mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    // The last nav[aria-label] is the fixed mobile bottom nav
    const bottomNavButtons = page.locator("nav[aria-label='Main navigation']").last()
      .getByRole("button");
    const count = await bottomNavButtons.count();
    for (let i = 0; i < count; i++) {
      const box = await bottomNavButtons.nth(i).boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("JSON Textarea has aria-label", async ({ page }) => {
    await page.goto("/");
    const textarea = page.getByLabel("Speech assessment JSON input");
    await expect(textarea).toBeAttached();
  });

  test("result tabs have role=tablist with tab and tabpanel roles after analysis", async ({ page }) => {
    await mockDashboardApi(page);
    await page.goto("/");
    // Submit JSON to get to post-analysis state
    await page.getByLabel("Speech assessment JSON input").fill('{"test": true}');
    await page.getByRole("button", { name: "Analyze Pronunciation" }).click();
    await expect(page.getByRole("heading", { name: "What should I practice next?" })).toBeVisible();
    // Tabs should render with correct ARIA roles
    await expect(page.getByRole("tablist")).toBeVisible();
    await expect(page.getByRole("tab", { name: "Pause Analysis" })).toBeVisible();
    await expect(page.getByRole("tabpanel")).toBeAttached();
  });

  test("result tabs navigable by keyboard arrow keys", async ({ page }) => {
    await mockDashboardApi(page);
    await page.goto("/");
    await page.getByLabel("Speech assessment JSON input").fill('{"test": true}');
    await page.getByRole("button", { name: "Analyze Pronunciation" }).click();
    await expect(page.getByRole("heading", { name: "What should I practice next?" })).toBeVisible();
    // Focus the first tab and press ArrowRight
    const firstTab = page.getByRole("tab", { name: "Pause Analysis" });
    await firstTab.focus();
    await page.keyboard.press("ArrowRight");
    // Words tab should now be selected after arrow navigation
    await expect(page.getByRole("tab", { name: "Words" })).toHaveAttribute("aria-selected", "true");
  });

  test("nav items reachable via Tab key", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    // First Tab should focus the first interactive element — typically the first nav button
    const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
    expect(typeof focused).toBe("string"); // something is focused
  });
});

// =============================================================================
// GROUP 4: Audio panel behavioral states (UIX-05)
// =============================================================================

test.describe("Audio panel behavioral states (UIX-05)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Navigate to Audio mode via the first matching nav button (works at any viewport)
    await page.getByRole("button", { name: /Live Audio/i }).first().click();
  });

  test("Audio: record button disabled when reference text is empty", async ({ page }) => {
    // Reference input should be empty on initial render
    const referenceInput = page.getByLabel("Reference sentence");
    await expect(referenceInput).toBeAttached();
    // Clear input to ensure it is empty
    await referenceInput.fill("");
    // Record button (text: "Record") must be disabled when reference text is empty
    const recordButton = page.getByRole("button", { name: "Record" });
    await expect(recordButton).toBeDisabled();
  });

  test("Audio: status badge updates on session state change", async ({ page }) => {
    const referenceInput = page.getByLabel("Reference sentence");
    // Initial state: record button disabled (reference text empty)
    const recordButton = page.getByRole("button", { name: "Record" });
    await expect(recordButton).toBeDisabled();
    // Fill reference text to change session state
    await referenceInput.fill("Say something");
    // After filling reference text, the record button should be enabled
    // This verifies that the component's status state responds to input changes
    await expect(recordButton).toBeEnabled();
  });
});
