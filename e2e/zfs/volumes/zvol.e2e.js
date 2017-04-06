var helpers = require('../../common.js');

describe('Zvol tests', function(){

  var volumePoolSelect = element(by.model('pool'));
  var addBtn = element(by.css('.tc_add_btn'));
  var volumename = 'protractor_test_zvol';
  var volume = element(by.cssContainingText('tr', volumename));

  beforeAll(function(){
    helpers.login();
  });

  beforeEach(function(){
    element(by.css('ul .tc_menuitem_volumes > a')).click();
  });

  it('should have a zpool', function(){
    element(by.css('oadatatable .tc_add_btn')).click();
    for(var key in helpers.configs.pools){
      volumePoolSelect.click();
      var zpool = element.all(by.cssContainingText('option', 'zpool')).get(0);
      expect(zpool.isDisplayed()).toBe(true);

      break;
    }
  });

  //TODO replace with helper function
  it('should create a zvol', function(){
    element(by.css('oadatatable .tc_add_btn')).click();
    for(var key in helpers.configs.pools){
      element(by.model('result.name')).sendKeys(volumename);
      volumePoolSelect.click();
      element.all(by.cssContainingText('option', 'zpool')).get(0).click();
      element(by.id('zfs')).click();
      element(by.model('data.megs')).sendKeys('100MB');
      element(by.css('.tc_submitButton')).click();
      browser.sleep(helpers.configs.sleep);

      break;
    }
  });

  it('should display the zvol in volumeslist', function(){
    expect(volume.isDisplayed()).toBe(true);
  });

  //TODO replace with helper function
  it('should delete the zvol', function(){
    volume.click();
    browser.sleep(400);
    element(by.css('.tc_menudropdown')).click();
    browser.sleep(400);
    element(by.css('.tc_deleteItem')).click();
    browser.sleep(400);
    element(by.model('$ctrl.input.enteredName')).sendKeys('yes');
    element(by.id('bot2-Msg1')).click();

    expect(volume.isPresent()).toBe(false);
  });

  afterAll(function(){
    console.log('zvol_add -> zvol.e2e.js');
  });
});