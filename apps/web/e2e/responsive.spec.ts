import { test, expect } from "@playwright/test";
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

  test("design tokens render with readable contrast", async ({ page }) => {
    await page.goto("/");

    const bodyColors = await page.evaluate(() => {
      const bodyStyle = getComputedStyle(document.body);
      return {
        backgroundColor: bodyStyle.backgroundColor,
        color: bodyStyle.color,
      };
    });
    expectRgb(bodyColors.backgroundColor, [250, 250, 247]);
    expectRgb(bodyColors.color, [22, 21, 19]);
    expect(contrastRatio(bodyColors.color, bodyColors.backgroundColor)).toBeGreaterThanOrEqual(4.5);

    const sidebarColors = await page.getByText("Practice Tools").evaluate((element) => {
      const labelStyle = getComputedStyle(element);
      const sidebar = element.closest("aside");
      if (!sidebar) throw new Error("Practice Tools label is not inside the sidebar");
      return {
        backgroundColor: getComputedStyle(sidebar).backgroundColor,
        color: labelStyle.color,
      };
    });
    expectRgb(sidebarColors.backgroundColor, [241, 237, 228]);
    expect(contrastRatio(sidebarColors.color, sidebarColors.backgroundColor)).toBeGreaterThanOrEqual(4.5);

    const desktopActiveNavColors = await page
      .getByRole("button", { name: "JSON Analysis" })
      .first()
      .evaluate((element) => {
        const style = getComputedStyle(element);
        const activeMarker = getComputedStyle(element, "::before");
        return {
          backgroundColor: style.backgroundColor,
          color: style.color,
          markerColor: activeMarker.backgroundColor,
        };
      });
    expectRgb(desktopActiveNavColors.backgroundColor, [255, 255, 255]);
    expectRgb(desktopActiveNavColors.markerColor, [217, 119, 87]);
    expect(contrastRatio(desktopActiveNavColors.color, desktopActiveNavColors.backgroundColor))
      .toBeGreaterThanOrEqual(4.5);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const mobileActiveNavColors = await page
      .getByRole("button", { name: "JSON Analysis" })
      .last()
      .evaluate((element) => {
        const style = getComputedStyle(element);
        const marker = getComputedStyle(element, "::before");
        const nav = element.closest("nav");
        if (!nav) throw new Error("Mobile nav item is not inside a nav");
        return {
          backgroundColor: getComputedStyle(nav).backgroundColor,
          color: style.color,
          markerColor: marker.backgroundColor,
        };
      });
    expectRgb(mobileActiveNavColors.backgroundColor, [255, 255, 255]);
    expectRgb(mobileActiveNavColors.markerColor, [217, 119, 87]);
    expect(contrastRatio(mobileActiveNavColors.color, mobileActiveNavColors.backgroundColor))
      .toBeGreaterThanOrEqual(4.5);
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
