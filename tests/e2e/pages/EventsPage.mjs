import { By } from "selenium-webdriver";
import { BasePage } from "./BasePage.mjs";

export class EventsPage extends BasePage {
  async openList() {
    await this.open("/events");
    await this.waitFor("#event-list");
  }

  async titles() {
    const cards = await this.driver.findElements(By.css(".event-title"));
    return Promise.all(cards.map((c) => c.getText()));
  }

  async openEvent(eventId) {
    await this.click(`a[data-event-id="${eventId}"]`);
    await this.waitFor("#registration-status");
  }

  async seatsLeft() {
    const text = await (await this.waitFor("#seats-left")).getText(); // "37 of 40"
    return Number(text.split(" ")[0]);
  }

  async register() {
    await this.click("#register-button");
  }

  status() {
    return this.waitFor("#registration-status").then((e) => e.getText());
  }
}
