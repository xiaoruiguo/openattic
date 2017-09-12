'use strict';

var helpers = require('../../common.js');
var rbdCommons = require('./cephRbdCommon.js');
var CephRBDStripingPreview = require('./CephRBDStripingPreview.js');

describe('should test the ceph rbd creation form', function(){
  var rbdProperties = new rbdCommons();
  const fe = rbdProperties.formElements;
  var stripingPreview = new CephRBDStripingPreview();

  var objSizeInput = [
    {input: '0', output: '4.00 KiB'},
    {input: '5', output: '4.00 KiB'},
    {input: '6',  output: '8.00 KiB'},
    {input: '11', output: '8.00 KiB'},
    {input: '12', output: '16.00 KiB'},
    {input: '22', output: '16.00 KiB'},
    {input: '23', output: '32.00 KiB'},
    {input: '45', output: '32.00 KiB'},
    {input: '46', output: '64.00 KiB'},
    {input: '90', output: '64.00 KiB'},
    {input: '91',  output: '128.00 KiB'},
    {input: '181', output: '128.00 KiB'},
    {input: '182', output: '256.00 KiB'},
    {input: '362', output: '256.00 KiB'},
    {input: '363', output: '512.00 KiB'},
    {input: '724', output: '512.00 KiB'},
    {input: '725',  output: '1.00 MiB'},
    {input: '1448', output: '1.00 MiB'},
    {input: '1449', output: '2.00 MiB'},
    {input: '2896', output: '2.00 MiB'},
    {input: '2897', output: '4.00 MiB'},
    {input: '5792', output: '4.00 MiB'},
    {input: '5793',  output: '8.00 MiB'},
    {input: '11585', output: '8.00 MiB'},
    {input: '11586', output: '16.00 MiB'},
    {input: '23170', output: '16.00 MiB'},
    {input: '23171',  output: '32.00 MiB'},
    {input: '666666', output: '32.00 MiB'},
    {input: '1 gb',  output: '32.00 MiB'},
    {input: '0.017 gb',  output: '16.00 MiB'},
    {input: '0.017 mb',  output: '16.00 KiB'},
    {input: '0.5 mb',  output: '512.00 KiB'},
    {input: '0.000007 gb',  output: '8.00 KiB'}
  ];

  var sizeInput = [
    {input: '1', output: '1.00 MiB'},
    {input: '512', output: '512.00 MiB'},
    {input: '1024', output: '1.00 GiB'},
    {input: '2048', output: '2.00 GiB'},
    {input: '4096', output: '4.00 GiB'},
    {input: '8192', output: '8.00 GiB'},
    {input: '16384', output: '16.00 GiB'},
    {input: '32768', output: '32.00 GiB'},
    {input: '65536', output: '64.00 GiB'},
    {input: '131072', output: '128.00 GiB'},
    {input: '262144', output: '256.00 GiB'},
    {input: '524288', output: '512.00 GiB'},
    {input: '1048576', output: '1.00 TiB'},
    {input: '2097152', output: '2.00 TiB'},
    {input: '4194304', output: '4.00 TiB'},
    {input: '8388608', output: '8.00 TiB'},
    {input: '16777216', output: '16.00 TiB'},
    {input: '33554432', output: '32.00 TiB'},
    {input: '67108864', output: '64.00 TiB'},
    {input: '134217728', output: '128.00 TiB'},
    {input: '268435456', output: '256.00 TiB'},
    {input: '536870912', output: '512.00 TiB'},
    {input: '1073741824', output: '1.00 PiB'}
  ];

  var isItemPresent = function(name, item, className){
    it('should hold the item "' + item + '" in "' + name + '"', function(){
      expect(element(by.className(className)).isPresent()).toBe(true);
    });
  };

  var isFormElementAvailable = function(e){
    if(e.testClass){
      it('should display the form element "' + e.name + '"', function(){
        expect(element(by.className(e.testClass)).isDisplayed()).toBe(true);
      });
    }
    for(var item in e.items){
      var itemClasse = typeof e.items[item] == 'string' ?
        e.items[item] : e.items[item].class;
      isItemPresent(e.name, item, itemClasse);
    }
  };

  var changeSizeTest = function(inputField, io, fieldName){
    it('should change the input ' + io.input + ' to ' + io.output + ' in "' + fieldName + '"', function(){
      //rbd should be preselected
      rbdProperties.checkCheckboxToBe(rbdProperties.defaultFeatures, false);
      helpers.changeInput(inputField, io.input);
      expect(inputField.getAttribute('value')).toEqual(io.output);
    });
  };

  beforeAll(function(){
    helpers.login();
    rbdProperties.cephRBDs.click();
    rbdProperties.addButton.click();
    rbdProperties.firstPool.click();
    rbdProperties.selectFeatures([1, 1, 1, 1, 1, 1, 1]); // Selects all features
  });

  it('should show a warning on object size if stripe unit is increased', () => {
    const unit = rbdProperties.stripingUnit;
    const objSize = rbdProperties.objSize;
    helpers.changeInput(objSize, '4 M');
    helpers.changeInput(unit, '4 M');
    helpers.changeInput(unit, '8 M');
    expect(element(by.className(fe.objectSize.items.changed)).isDisplayed()).toBe(true);
    helpers.changeInput(objSize, '8 M');
    expect(element(by.className(fe.objectSize.items.changed)).isDisplayed()).toBe(false);
  });

  it('should show a warning on stripe unit if object size is decreased', () => {
    const unit = rbdProperties.stripingUnit;
    const objSize = rbdProperties.objSize;
    helpers.changeInput(unit, '4 M');
    helpers.changeInput(objSize, '4 M');
    helpers.changeInput(objSize, '2 M');
    expect(element(by.className(fe.stripingUnit.items.changed)).isDisplayed()).toBe(true);
    helpers.changeInput(unit, '2 M');
    expect(element(by.className(fe.stripingUnit.items.changed)).isDisplayed()).toBe(false);
  });

  it('should show a warning if stripe count is set to 2', () => {
    const count = rbdProperties.stripingCount;
    helpers.changeInput(count, '1');
    expect(element(by.className(fe.stripingCount.items.min)).isDisplayed()).toBe(true);
    helpers.changeInput(count, '5');
    expect(element(by.className(fe.stripingCount.items.min)).isDisplayed()).toBe(false);
  });

  it('should show an error on size if object set size increase the setted size', () => {
    const size = rbdProperties.size;
    helpers.changeInput(rbdProperties.stripingUnit, '4 M');
    helpers.changeInput(rbdProperties.stripingCount, '5');
    helpers.changeInput(size, '10 M');
    expect(element(by.className(fe.size.items.helpSizeStripe)).isDisplayed()).toBe(true);
    helpers.changeInput(size, '100 M');
    expect(element(by.className(fe.size.items.helpSizeStripe)).isDisplayed()).toBe(false);
  });

  for(let e in fe){
    isFormElementAvailable(fe[e]);
  }

  it('should offer a list of pools', function(){
    expect(rbdProperties.poolEntries.count()).toBeGreaterThan(1);
  });

  objSizeInput.forEach(function(io){
    changeSizeTest(rbdProperties.objSize, io, 'Object size');
  });

  sizeInput.forEach(function(io){
    changeSizeTest(rbdProperties.size, io, 'Size');
  });

  rbdProperties.expandedFeatureCases.forEach(function(testCase){
    var keys = Object.keys(fe.features.items);
    var values = fe.features.items;
    it('should test the following case: [' + testCase + ']',function(){
      rbdProperties.selectFeatures(testCase);
    });
  });

  /**
   * For this tests at least 2 pool are needed!
   * One replicated pool and another replicated pool or erasure coded pool with ec_overwrites enabled.
   */
  it('should change the lable of pool to meta-pool if a data pool can be selected', function(){
    rbdProperties.useDataPool.click();
    expect(element(by.css('label[for=pool]')).getText()).toBe('Meta-Pool *');
    rbdProperties.useDataPool.click();
    expect(element(by.css('label[for=pool]')).getText()).toBe('Pool *');
  });

  it('should not be able to select the same pool as data pool', function(){
    rbdProperties.useDataPool.click();
    expect(element(by.css('label[for=dataPool]')).getText()).toBe('Data-Pool *');
    expect(rbdProperties.dataPoolSelect.element(by.cssContainingText('option', rbdProperties.firstPool.getText()))
      .isPresent()).toBe(false);
    rbdProperties.useDataPool.click();
  });

  it('should shows tooltips for pool selections', function(){
    expect(element(by.css('label[for=pool] > span[uib-tooltip]')).getAttribute('uib-tooltip'))
      .toBe('Main pool where the RBD is located and all data is stored');
    rbdProperties.useDataPool.click();
    expect(element(by.css('label[for=pool] > span[uib-tooltip]')).getAttribute('uib-tooltip'))
      .toBe('Main pool where the RBD is located and the meta-data is stored');
    expect(element(by.css('label[for=dataPool] > span[uib-tooltip]')).getAttribute('uib-tooltip'))
      .toBe('Dedicated pool that stores the object-data of the RBD');
    rbdProperties.useDataPool.click();
  });

  it('should display the RBD striping preview with partial stripe unit', function(){
    const size = rbdProperties.size;
    const objSize = rbdProperties.objSize;
    const unit = rbdProperties.stripingUnit;
    const count = rbdProperties.stripingCount;
    helpers.changeInput(size, '33 M');
    helpers.changeInput(objSize, '4 M');
    helpers.changeInput(unit, '2 M');
    helpers.changeInput(count, '3');

    stripingPreview.stripingPreviewLink.click();

    expect(stripingPreview.stripes.get(0).getText()).toBe('Stripe 0');
    expect(stripingPreview.stripes.get(1).getText()).toBe('Stripe 1');
    expect(stripingPreview.stripes.get(2).getText()).toBe('Stripe 2');
    expect(stripingPreview.stripes.get(3).getText()).toBe('Stripe 3');
    expect(stripingPreview.stripes.get(4).getText()).toBe('Stripe 4');
    expect(stripingPreview.stripes.get(5).getText()).toBe('Stripe 5');

    expect(stripingPreview.objectSets.get(0).getText()).toBe('Object\nset\n0');
    expect(stripingPreview.objectSets.get(1).getText()).toBe('Object\nset\n1');
    expect(stripingPreview.objectSets.get(2).getText()).toBe('Object\nset\n2');

    expect(stripingPreview.objects.get(0).getText()).toBe('Object\n0');
    expect(stripingPreview.objects.get(1).getText()).toBe('Object\n1');
    expect(stripingPreview.objects.get(2).getText()).toBe('Object\n2');
    expect(stripingPreview.objects.get(3).getText()).toBe('Object\n3');
    expect(stripingPreview.objects.get(4).getText()).toBe('Object\n4');
    expect(stripingPreview.objects.get(5).getText()).toBe('Object\n5');
    expect(stripingPreview.objects.get(6).getText()).toBe('Object\n6');
    expect(stripingPreview.objects.get(7).getText()).toBe('Object\n7');
    expect(stripingPreview.objects.get(8).getText()).toBe('Object\n8');

    expect(stripingPreview.stripUnits.get(0).getText()).toBe('Stripe unit\n0');
    expect(stripingPreview.stripUnits.get(1).getText()).toBe('Stripe unit\n1');
    expect(stripingPreview.stripUnits.get(2).getText()).toBe('Stripe unit\n2');
    expect(stripingPreview.stripUnits.get(3).getText()).toBe('Stripe unit\n3');
    expect(stripingPreview.stripUnits.get(4).getText()).toBe('Stripe unit\n4');
    expect(stripingPreview.stripUnits.get(5).getText()).toBe('Stripe unit\n5');
    expect(stripingPreview.stripUnits.get(6).getText()).toBe('Stripe unit\n6');
    expect(stripingPreview.stripUnits.get(7).getText()).toBe('Stripe unit\n7');
    expect(stripingPreview.stripUnits.get(8).getText()).toBe('Stripe unit\n8');
    expect(stripingPreview.stripUnits.get(9).getText()).toBe('Stripe unit\n9');
    expect(stripingPreview.stripUnits.get(10).getText()).toBe('Stripe unit\n10');
    expect(stripingPreview.stripUnits.get(11).getText()).toBe('Stripe unit\n11');
    expect(stripingPreview.stripUnits.get(12).getText()).toBe('Stripe unit\n12');
    expect(stripingPreview.stripUnits.get(13).getText()).toBe('Stripe unit\n13');
    expect(stripingPreview.stripUnits.get(14).getText()).toBe('Stripe unit\n14');
    expect(stripingPreview.stripUnits.get(15).getText()).toBe('Stripe unit\n15');
    expect(stripingPreview.stripUnits.get(16).getText()).toBe('Stripe unit\n(partial)\n16');
    expect(stripingPreview.stripUnits.get(17).getText()).toBe('');

    stripingPreview.close.click();
  });

  it('should display the RBD striping preview with ellipsis', function(){
    const size = rbdProperties.size;
    const objSize = rbdProperties.objSize;
    const unit = rbdProperties.stripingUnit;
    const count = rbdProperties.stripingCount;
    helpers.changeInput(size, '256 M');
    helpers.changeInput(objSize, '8 M');
    helpers.changeInput(unit, '2 M');
    helpers.changeInput(count, '6');

    stripingPreview.stripingPreviewLink.click();

    expect(stripingPreview.stripes.get(0).getText()).toBe('Stripe 0');
    expect(stripingPreview.stripes.get(1).getText()).toBe('Stripe 1');
    expect(stripingPreview.stripes.get(2).getText()).toBe('Stripe 3');
    expect(stripingPreview.stripes.get(3).getText()).toBe('Stripe 4');
    expect(stripingPreview.stripes.get(4).getText()).toBe('Stripe 5');
    expect(stripingPreview.stripes.get(5).getText()).toBe('Stripe 7');
    expect(stripingPreview.stripes.get(6).getText()).toBe('Stripe 20');
    expect(stripingPreview.stripes.get(7).getText()).toBe('Stripe 21');

    expect(stripingPreview.objectSets.get(0).getText()).toBe('Object\nset\n0');
    expect(stripingPreview.objectSets.get(1).getText()).toBe('Object\nset\n1');
    expect(stripingPreview.objectSets.get(2).getText()).toBe('Object\nset\n5');

    expect(stripingPreview.objects.get(0).getText()).toBe('Object\n0');
    expect(stripingPreview.objects.get(1).getText()).toBe('Object\n1');
    expect(stripingPreview.objects.get(2).getText()).toBe('Object\n2');
    expect(stripingPreview.objects.get(3).getText()).toBe('Object\n3');
    expect(stripingPreview.objects.get(4).getText()).toBe('Object\n5');
    expect(stripingPreview.objects.get(5).getText()).toBe('Object\n6');
    expect(stripingPreview.objects.get(6).getText()).toBe('Object\n7');
    expect(stripingPreview.objects.get(7).getText()).toBe('Object\n8');
    expect(stripingPreview.objects.get(8).getText()).toBe('Object\n9');
    expect(stripingPreview.objects.get(9).getText()).toBe('Object\n11');
    expect(stripingPreview.objects.get(10).getText()).toBe('Object\n30');
    expect(stripingPreview.objects.get(11).getText()).toBe('Object\n31');
    expect(stripingPreview.objects.get(12).getText()).toBe('Object\n32');
    expect(stripingPreview.objects.get(13).getText()).toBe('Object\n33');
    expect(stripingPreview.objects.get(14).getText()).toBe('Object\n35');

    expect(stripingPreview.stripUnits.get(0).getText()).toBe('Stripe unit\n0');
    expect(stripingPreview.stripUnits.get(1).getText()).toBe('Stripe unit\n1');
    expect(stripingPreview.stripUnits.get(2).getText()).toBe('Stripe unit\n2');
    expect(stripingPreview.stripUnits.get(3).getText()).toBe('Stripe unit\n3');
    expect(stripingPreview.stripUnits.get(4).getText()).toBe('Stripe unit\n5');
    expect(stripingPreview.stripUnits.get(5).getText()).toBe('Stripe unit\n6');
    expect(stripingPreview.stripUnits.get(6).getText()).toBe('Stripe unit\n7');
    expect(stripingPreview.stripUnits.get(7).getText()).toBe('Stripe unit\n8');
    expect(stripingPreview.stripUnits.get(8).getText()).toBe('Stripe unit\n9');
    expect(stripingPreview.stripUnits.get(9).getText()).toBe('Stripe unit\n11');
    expect(stripingPreview.stripUnits.get(10).getText()).toBe('Stripe unit\n18');
    expect(stripingPreview.stripUnits.get(11).getText()).toBe('Stripe unit\n19');
    expect(stripingPreview.stripUnits.get(12).getText()).toBe('Stripe unit\n20');
    expect(stripingPreview.stripUnits.get(13).getText()).toBe('Stripe unit\n21');
    expect(stripingPreview.stripUnits.get(14).getText()).toBe('Stripe unit\n23');
    expect(stripingPreview.stripUnits.get(15).getText()).toBe('Stripe unit\n24');
    expect(stripingPreview.stripUnits.get(16).getText()).toBe('Stripe unit\n25');
    expect(stripingPreview.stripUnits.get(17).getText()).toBe('Stripe unit\n26');
    expect(stripingPreview.stripUnits.get(18).getText()).toBe('Stripe unit\n27');
    expect(stripingPreview.stripUnits.get(19).getText()).toBe('Stripe unit\n29');
    expect(stripingPreview.stripUnits.get(20).getText()).toBe('Stripe unit\n30');
    expect(stripingPreview.stripUnits.get(21).getText()).toBe('Stripe unit\n31');
    expect(stripingPreview.stripUnits.get(22).getText()).toBe('Stripe unit\n32');
    expect(stripingPreview.stripUnits.get(23).getText()).toBe('Stripe unit\n33');
    expect(stripingPreview.stripUnits.get(24).getText()).toBe('Stripe unit\n35');
    expect(stripingPreview.stripUnits.get(25).getText()).toBe('Stripe unit\n42');
    expect(stripingPreview.stripUnits.get(26).getText()).toBe('Stripe unit\n43');
    expect(stripingPreview.stripUnits.get(27).getText()).toBe('Stripe unit\n44');
    expect(stripingPreview.stripUnits.get(28).getText()).toBe('Stripe unit\n45');
    expect(stripingPreview.stripUnits.get(29).getText()).toBe('Stripe unit\n47');
    expect(stripingPreview.stripUnits.get(30).getText()).toBe('Stripe unit\n120');
    expect(stripingPreview.stripUnits.get(31).getText()).toBe('Stripe unit\n121');
    expect(stripingPreview.stripUnits.get(32).getText()).toBe('Stripe unit\n122');
    expect(stripingPreview.stripUnits.get(33).getText()).toBe('Stripe unit\n123');
    expect(stripingPreview.stripUnits.get(34).getText()).toBe('Stripe unit\n125');
    expect(stripingPreview.stripUnits.get(35).getText()).toBe('Stripe unit\n126');
    expect(stripingPreview.stripUnits.get(36).getText()).toBe('Stripe unit\n127');
    expect(stripingPreview.stripUnits.get(37).getText()).toBe('');
    expect(stripingPreview.stripUnits.get(38).getText()).toBe('');
    expect(stripingPreview.stripUnits.get(39).getText()).toBe('');

    stripingPreview.close.click();
  });

  afterAll(function(){
    console.log('ceph_rbd_form -> ceph_rbd_form.e2e.js');
  });
});
