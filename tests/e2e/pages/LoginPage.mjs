import { BasePage } from "./BasePage.mjs";

export class LoginPage extends BasePage {
  async logIn(email, password) {
    await this.open("/login");
    await this.type("#email", email);
    await this.type("#password", password);
    await this.click("#login-submit");
  }

  error() {
    return this.waitFor("#login-error").then((e) => e.getText());
  }
}
