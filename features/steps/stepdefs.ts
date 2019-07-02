const { assert } = require('assert');
const { Before, After, Given, When, Then } = require('cucumber');
const { EventChainContext } = require('../../src/EventChainContext');
const { ProcessContext } = require('../../src/ProcessContext');
const { HTTPContext } = require('../../src/HTTPContext');
const { DBContext } = require('../../src/DBContext');

/*
 * Setup
 */

Before(function() {
  this.httpContext = new HTTPContext();
  this.eventChainContext = new EventChainContext(this);
  this.processContext = new ProcessContext(this);
  this.dbContext = new DBContext(this);
});

Before(function() {
  return this.dbContext.connect();
});

Before(function() {
  //return this.dbContext.backupDatabase(this);
});


/*
 * EventChain Context
 */

Given('a chain is created by {string}', function(accountRef: string) {
  this.eventChainContext.chainIsCreatedBy(accountRef);
});

Given('{string} signs with {string}', function(accountRef: string, key: string) {
  this.eventChainContext.createAccountWithSignKey(accountRef, key);
});

Then('{string} is present', function(accountRef: string) {
  this.eventChainContext.accountIsPresent(accountRef);
});

Then('{string} is present with:', function(accountRef: string) {
  this.eventChainContext.accountIsPresent(accountRef);
});

/*
 * Process Context
 */
Given('{string} creates the {string} process using the {string} scenario', function(accountRef: string, processRef: string, scenarioRef: string) {
  this.processContext.createProcessUsingScenario(accountRef, processRef, scenarioRef);
});

Given('{string} is the {string} actor of the {string} process', function(accountRef: string, actor: string, processRef: string) {
  this.processContext.defineActor(accountRef, actor, processRef);
});

When('the {string} process is started', function(processRef: string) {
  this.processContext.startProcessAction(processRef);
});

When('{string} runs the {string} action of the {string} process', function(accountRef: string, actionKey: string, processRef: string) {
  this.processContext.runAction(accountRef, actionKey, processRef);
});

When('{string} runs the {string} action of the {string} process giving a(n) {string} response', function(accountRef: string, actionKey: string, processRef: string, responseKey: string) {
  this.processContext.runActionWithData(accountRef, actionKey, processRef, responseKey);
});

When('{string} runs the {string} action of the {string} process with:', function(accountRef: string, actionKey: string, processRef: string) {
  this.processContext.runAction(accountRef, actionKey, processRef);
});

When('{string} runs the {string} action of the {string} process giving a(n) {string} response with:', function(accountRef: string, actionKey: string, processRef: string, responseKey: string) {
  this.processContext.runActionWithData(accountRef, actionKey, processRef, responseKey);
});


Then('the {string} actor in the {string} process has:', function(actorKey: string, processRef: string) {
  this.processContext.checkActor(processRef, actorKey);
});

Then('the {string} process has asset {string}', function(processRef: string, assetKey: string) {
  this.processContext.checkAsset(processRef, assetKey);
});

Then('the {string} process has asset {string} with:', function(processRef: string, assetKey: string) {
  this.processContext.checkAsset(processRef, assetKey);
});

Then('{string} is in the history of the {string} process', function(title: string, processRef: string) {
  this.processContext.hasInHistory(processRef, title);
});

Then('the {string} process is in the {string} state', function(processRef: string, state: string) {
  this.processContext.checkState(processRef, state);
});

Then('the {string} process is completed', function(processRef: string) {
  this.processContext.checkCompleted(processRef);
});

Then('the {string} process is cancelled', function(processRef: string) {
  this.processContext.checkCancelled(processRef);
});

Then('the {string} process has failed', function(processRef: string, callback) {
  try {
    this.processContext.checkFailed(processRef);
  } catch(e) {
    callback(e);
  }
  callback(null);
});

After(function() {
  this.dbContext.close();
});
