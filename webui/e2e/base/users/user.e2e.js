"use strict";
var helpers = require("../../common.js");
var UserTable = require("./UserTable.js");

describe("Should add an user", function () {
  const userTable = new UserTable();

  var testUser = {
    username: "protractor_test_user",
    userpasswd: "test123",
    firstname: "Herp",
    lastname: "Derp",
    email: "herp.derp@openattic.org"
  };
  var user = element(by.cssContainingText("tr", testUser.username));
  var correctInput = element(by.css(".tc_correctInput"));
  var logout = element(by.css(".tc_logout a"));
  var addBtn = element(by.css(".tc_addUser"));
  var noUniqueName = element(by.css(".tc_noUniqueName"));

  beforeAll(function () {
    helpers.login();
    helpers.setLocation("users");
    userTable.removeUserIfExists(testUser.username);
  });

  it("should warn that unsaved changes will be lost", function () {
    addBtn.click();
    element.all(by.css("input")).first().sendKeys("warn_me");
    helpers.setLocation("users", true);
  });

  it("should not warn that unsaved changes will be lost", function () {
    addBtn.click();
    helpers.setLocation("users", false);
  });

  it("should show the password in plain text", function () {
    addBtn.click();
    browser.sleep(400);
    var password = element(by.model("user.password"));
    expect(password.getAttribute("type")).toEqual("password");
    password.sendKeys(testUser.userpasswd);
    element(by.css(".tc_showPassword")).click();
    expect(password.getAttribute("type")).toEqual("text");
    helpers.leaveForm();
  });

  it("should copy the password to the clipboard", function () {
    addBtn.click();
    browser.sleep(400);
    var password = element(by.model("user.password"));
    expect(password.getAttribute("type")).toEqual("password");
    password.sendKeys(testUser.userpasswd);
    // Copy text to clipboard.
    element(by.css(".tc_copyPasswordToClipboard")).click();
    // Paste text into another field to compare the value.
    var firstName = element(by.model("user.first_name"));
    firstName.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "v"));
    expect(firstName.getAttribute("value")).toEqual(testUser.userpasswd);
    helpers.leaveForm();
  });

  it("should create an user", function () {
    addBtn.click();
    browser.sleep(400);
    element(by.model("user.username")).sendKeys(testUser.username);
    browser.sleep(400);
    element(by.model("user.password")).sendKeys(testUser.userpasswd);
    browser.sleep(400);
    element(by.model("user.confirmPassword")).sendKeys(testUser.userpasswd);
    browser.sleep(400);
    element(by.model("user.first_name")).sendKeys(testUser.firstname);
    browser.sleep(400);
    element(by.model("user.last_name")).sendKeys(testUser.lastname);
    browser.sleep(400);
    element(by.model("user.email")).sendKeys(testUser.email);
    browser.sleep(400);
    element(by.model("user.is_active")).click();
    browser.sleep(400);
    element(by.model("user.is_staff")).click();
    browser.sleep(400);
    element(by.css(".tc_submitButton")).click();
    browser.sleep(400);
  });

  it('should display the "protractor_test_user" in the users panel', function () {
    expect(user.isDisplayed()).toBe(true);
  });

  it("should verify that current name has no error message", function () {
    user.all(by.css("a")).click();
    expect(element(by.css(".tc_noUniqueName")).isDisplayed()).toBe(false);
  });

  it('should verify that if the "already in use" error message is still working', function () {
    element(by.model("user.username")).clear().sendKeys("openattic");
    expect(element(by.css(".tc_noUniqueName")).isDisplayed()).toBe(true);
    helpers.leaveForm(true);
  });

  //logout first
  it("should logout again", function () {
    logout.click();
    helpers.checkLocation("login");
  });

  //test login with new user data
  it("should login with the new created user", function () {
    helpers.login(testUser.username, testUser.userpasswd, false);
  });

  //try to click something and expect that with a successful login the user should be able to click around
  it("should be able to click something now", function () {
    element.all(by.css("ul .tc_menuitem > a")).get(3).click();
    helpers.checkLocation("ceph/pools");
    helpers.setLocation("users");
  });

  it("should display an error message if one tries to add an user with already taken username", function () {
    addBtn.click();
    browser.sleep(400);
    element(by.model("user.username")).sendKeys(testUser.username);
    expect(noUniqueName.isDisplayed()).toBe(true);
  });

  it("should check the user already taken error message", function () {
    expect(noUniqueName.getText()).toEqual("The chosen user name is already in use.");
  });

  it("should show the first and last name of the current user in the left panel", function () {
    expect(element(by.css(".tc_usernameinfo")).getText()).toEqual(testUser.firstname + " " + testUser.lastname);
  });

  it("should logout protractor_test_user", function () {
    logout.click().then(function () {
      helpers.checkForUnsavedChanges();
      helpers.checkLocation("login");
    });
  });

  it('should delete the "protractor_test_user"', function () {
    helpers.login("openattic", "openattic", false);
    helpers.setLocation("users");
    user.click();
    browser.sleep(400);
    element(by.css(".tc_menudropdown")).click();
    browser.sleep(400);
    element(by.css(".tc_deleteUser > a")).click();
    browser.sleep(400);
    element(by.id("bot2-Msg1")).click();
  });

  it('should not show the "protractor_test_user" anymore', function () {
    expect(user.isPresent()).toBe(false);
    //expect that we are still on the users panel
    helpers.checkLocation("users");
  });

  //to make sure that the user is deleted, try to login again
  it("should make sure that the user really does not exist anymore", function () {
    logout.click();
    helpers.checkLocation("login");
    helpers.login(testUser.username, testUser.userpasswd, false);
    expect(correctInput.isDisplayed()).toBe(true);
    expect(correctInput.getText()).toBe("The given credentials are not correct.");
  });

  afterAll(function () {
    console.log("users -> user.e2e.js");
  });
});