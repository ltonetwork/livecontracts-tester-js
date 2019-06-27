const { assert } = require('assert');
const { Before, After, Given, When, Then } = require('cucumber');
const { EventChainContext } = require('../../src/EventChainContext');
const { ProcessContext } = require('../../src/ProcessContext');

/*
 * EventChain Context
 */
Before(function() {
  this.ecc = new EventChainContext();
  this.pc = new ProcessContext(this.ecc);
});

Given('a chain is created by {string}', function(accountRef: string) {
  this.ecc.chainIsCreatedBy(accountRef);
});

Given('{string} signs with {string}', function(accountRef: string, key: string) {
  this.ecc.createAccountWithSignKey(accountRef, key);
});

Then('{string} is present', function(accountRef: string) {
  this.ecc.accountIsPresent(accountRef);
});

Then('{string} is present with:', function(accountRef: string) {
  this.ecc.accountIsPresent(accountRef);
});

/*
 * Process Context
 */
Given('{string} creates the {string} process using the {string} scenario', function(accountRef: string, processRef: string, scenarioRef: string) {
  this.pc.createProcessUsingScenario(accountRef, processRef, scenarioRef);
});

Given('{string} is the {string} actor of the {string} process', function(accountRef: string, actor: string, processRef: string) {
  this.pc.defineActor(accountRef, actor, processRef);
});

When('the {string} process is started', function(processRef: string) {
  this.pc.startProcessAction(processRef);
});

When('{string} runs the {string} action of the {string} process', function(accountRef: string, actionKey: string, processRef: string) {
  this.pc.runAction(accountRef, actionKey, processRef);
});

When('{string} runs the {string} action of the {string} process giving a(n) {string} response', function(accountRef: string, actionKey: string, processRef: string, responseKey: string) {
  this.pc.runActionWithData(accountRef, actionKey, processRef, responseKey);
});

When('{string} runs the {string} action of the {string} process with:', function(accountRef: string, actionKey: string, processRef: string) {
  this.pc.runAction(accountRef, actionKey, processRef);
});

When('{string} runs the {string} action of the {string} process giving a(n) {string} response with:', function(accountRef: string, actionKey: string, processRef: string, responseKey: string) {
  this.pc.runActionWithData(accountRef, actionKey, processRef, responseKey);
});


Then('the {string} actor in the {string} process has:', function(actorKey: string, processRef: string) {
  this.pc.checkActor(processRef, actorKey);
});

Then('the {string} process has asset {string}', function(processRef: string, assetKey: string) {
  this.pc.checkAsset(processRef, assetKey);
});

Then('the {string} process has asset {string} with:', function(processRef: string, assetKey: string) {
  this.pc.checkAsset(processRef, assetKey);
});

Then('{string} is in the history of the {string} process', function(title: string, processRef: string) {
  this.pc.hasInHistory(processRef, title);
});

Then('the {string} process is in the {string} state', function(processRef: string, state: string) {
  this.pc.checkState(processRef, state);
});

Then('the {string} process is completed', function(processRef: string) {
  this.pc.checkCompleted(processRef);
});

Then('the {string} process is cancelled', function(processRef: string) {
  this.pc.checkCancelled(processRef);
});

Then('the {string} process has failed', function(processRef: string) {
  this.pc.checkFailed(processRef);
});



