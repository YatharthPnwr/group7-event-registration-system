import assert from "node:assert/strict";
import { EventsPage } from "./pages/EventsPage.mjs";
import { LoginPage } from "./pages/LoginPage.mjs";
import { SignUpPage } from "./pages/SignUpPage.mjs";
import { latestEmailTo, screenshotOnFailure, startBrowser, uniqueEmail } from "./config.mjs";

// US-16 smoke test: the main student path, run in headless Chrome against the real app.
describe("Smoke: student signs up, browses and registers", function () {
  this.timeout(60_000);
  let driver;

  beforeEach(async () => {
    driver = await startBrowser();
  });

  afterEach(async function () {
    await screenshotOnFailure(driver, this.currentTest);
    await driver?.quit();
  });

  it("signs up, registers for an event and gets a confirmation email", async () => {
    const email = uniqueEmail("smoke");
    const signUp = new SignUpPage(driver);
    await signUp.signUp({ name: "Smoke Student", email, password: "password123" });
    await signUp.waitForPath("/");
    assert.match(await signUp.currentUser(), /Smoke Student \(Student\)/);

    const events = new EventsPage(driver);
    await events.openList();
    assert.ok((await events.titles()).includes("Intro to Docker Workshop"));

    await events.openEvent("seed-docker-workshop");
    const before = await events.seatsLeft();
    await events.register();
    await events.waitForText("#registration-status", "You're registered");
    assert.equal(await events.seatsLeft(), before - 1);

    const message = await latestEmailTo(email);
    assert.ok(message, "a confirmation email should reach Mailpit");
    assert.match(message.Subject, /Intro to Docker Workshop/);
    assert.match(message.Text, /Registration ID: \w+/);
  });

  it("shows an error next to each invalid sign-up field", async () => {
    const signUp = new SignUpPage(driver);
    await signUp.signUp({ name: "", email: "not-an-email", password: "short" });
    assert.equal(await signUp.fieldError("name"), "Name is required");
    assert.equal(await signUp.fieldError("email"), "Enter a valid email address");
    assert.equal(await signUp.fieldError("password"), "Password must be at least 8 characters");
  });

  it("rejects a wrong password without saying which field was wrong", async () => {
    const login = new LoginPage(driver);
    await login.logIn("admin@events.local", "definitely-wrong");
    assert.equal(await login.error(), "Invalid email or password");
  });

  it("keeps students out of the admin area", async () => {
    const signUp = new SignUpPage(driver);
    await signUp.signUp({ name: "Curious Student", email: uniqueEmail("guard"), password: "password123" });
    await signUp.waitForPath("/");
    await signUp.open("/admin");
    await signUp.waitForPath("/events");
  });
});
