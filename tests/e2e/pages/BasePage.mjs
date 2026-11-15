import { By, until } from "selenium-webdriver";
import { BASE_URL } from "../config.mjs";

export class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async open(path) {
    await this.driver.get(`${BASE_URL}${path}`);
  }

  async waitFor(css, timeout = 10_000) {
    return this.driver.wait(until.elementLocated(By.css(css)), timeout);
  }

  async waitForText(css, text, timeout = 10_000) {
    const element = await this.waitFor(css, timeout);
    await this.driver.wait(until.elementTextContains(element, text), timeout);
    return element.getText();
  }

  async type(css, value) {
    const element = await this.waitFor(css);
    await element.clear();
    await element.sendKeys(value);
  }

  async click(css) {
    await (await this.waitFor(css)).click();
  }

  async waitForPath(path, timeout = 10_000) {
    await this.driver.wait(async () => new URL(await this.driver.getCurrentUrl()).pathname === path, timeout);
  }

  currentUser() {
    return this.waitFor("#current-user").then((e) => e.getText());
  }
}
