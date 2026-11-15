import { BasePage } from "./BasePage.mjs";

export class SignUpPage extends BasePage {
  async signUp({ name, email, password }) {
    await this.open("/signup");
    await this.type("#name", name);
    await this.type("#email", email);
    await this.type("#password", password);
    await this.click("#signup-submit");
  }

  fieldError(field) {
    return this.waitFor(`#${field}-error`).then((e) => e.getText());
  }
}
