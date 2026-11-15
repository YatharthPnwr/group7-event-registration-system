import fs from "node:fs";
import path from "node:path";
import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

export const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
export const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://localhost:8025";
export const SCREENSHOT_DIR = path.resolve("reports/e2e/screenshots");

/** Headless Chrome. Selenium Manager downloads a matching chromedriver automatically. */
export async function startBrowser() {
  const options = new chrome.Options().addArguments(
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--window-size=1280,900",
  );
  const driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000 });
  return driver;
}

/** Saves a screenshot named after the failing test, for the CI artifact. */
export async function screenshotOnFailure(driver, test) {
  if (!driver || test?.state !== "failed") return;
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const name = test.fullTitle().replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 100);
  fs.writeFileSync(path.join(SCREENSHOT_DIR, `${name}.png`), await driver.takeScreenshot(), "base64");
}

export function uniqueEmail(label) {
  return `e2e-${label}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@example.com`;
}

/** Latest email Mailpit received for an address, or null. */
export async function latestEmailTo(address) {
  const res = await fetch(`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:${address}`)}`);
  if (!res.ok) return null;
  const { messages } = await res.json();
  if (!messages?.length) return null;
  return fetch(`${MAILPIT_URL}/api/v1/message/${messages[0].ID}`).then((r) => r.json());
}
