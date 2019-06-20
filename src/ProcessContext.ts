import { Account, Event } from 'lto-api';
import { strict as request } from 'request';
import { strict as assert } from 'assert';
import { Process } from './Process';
import { EventChainContext } from './EventChainContext';

export class ProcessContext {
  protected chainContext: EventChainContext;
  protected basePath: string;
  protected processes: Process[];

  constructor(chainContext: EventChainContext) {
    this.chainContext = chainContext;
  }

  /* Figure out how to do this in Nodejs */
  public determineBasePath(scope: any) {
    
  }

  public getProcess(ref: string): Process {
    if (!this.processes[ref]) {
      let chain = this.chainContext.getChain();
      this.processes[ref] = new Process(chain, ref);
    }

    return this.processes[ref];
  }

  public getProjection(process: Process, account: Account = null): any {
    let projection = process.getProjection();
    account = account ? account : this.chainContext.getCreator();
    if (!projection) {
      let headers = {
        'Accept': 'application/json;view=complete'
      }
      let data = {
        'account': account
      }

      request({headers: headers, uri: `processes/${process.id}`, body: data}, (error, resp, body) => {
        if (error) {
          throw new Error('Failed to get projection of process');
        }

        process.setProjection(projection);
      });
    }

    return projection;
  }

  protected addProcessToChain(process: Process): void {
    let account = process.getCreator() ? process.getCreator() : this.chainContext.getCreator();

    let chain = this.chainContext.getChain();
    let event = new Event(process);
    event.addTo(chain).signWith(account);

    process.isStarted(true);
  }

  public createProcessUsingScenario(accountRef: string, processRef: string, scenarioRef: string): void {
    let account = this.chainContext.getAccount(accountRef);
    let process = this.getProcess(processRef);

    process.setCreator(account);
    process.loadScenario(scenarioRef, this.basePath);

    let scenarioEvent = new Event(process.scenario);
    let chain = this.chainContext.getChain();
    scenarioEvent.addTo(chain).signWith(account);
  }

  public defineActor(accountRef: string, actor: string, processRef: string): void {
    let account = this.chainContext.getAccount(accountRef);
    let identity = this.chainContext.createIdentity(account);

    this.getProcess(processRef).setActor(actor, identity);
  }

  public startProcessAction(processRef: string): void {
    let process = this.getProcess(processRef);

    assert(process.isStarted, `Process ${processRef} is already started`);

    this.addProcessToChain(process);

    this.chainContext.submit();
  }

  public runAction(accountRef: string, actionKey: string, processRef: string, responseKey: string = null): void {
    this.runActionWithData(accountRef, actionKey, processRef, responseKey);
  }

  public runActionWithData(accountRef: string, actionKey: string, processRef: string, responseKey: string = null): void {
    let account = this.chainContext.getAccount(accountRef);
    let process = this.getProcess(processRef);

    assert(!process.hasActorWithSignKey(account.getPublicSignKey()),
          `${accountRef} is not an actor in the ${processRef} process`);

    if (process.isStarted()) {
      this.addProcessToChain(process);
    }

    // find way to parse markdown and table data
    let data = {};
    let response = process.createResponse(actionKey, responseKey, data);

    let event = new Event(response);
    let chain = this.chainContext.getChain();
    event.addTo(chain).signWith(account);

    this.chainContext.submit(account);
  }

  public checkActor(processRef: string, actorKey: string): void {
    let process = this.getProcess(processRef);
    let projection = this.getProjection(process);
    
    assert(projection['actors'].hasOwnProperty(actorKey), "Actor not found");
  }

  public checkAsset(processRef: string, assetKey: string): void {
    let process = this.getProcess(processRef);
    let projection = this.getProjection(process);
    
    assert(projection['assets'].hasOwnProperty(assetKey), "Asset not found");
  }
  
  public hasInHistory(processRef: string, title: string): void {
    let process = this.getProcess(processRef);
    let projection = this.getProjection(process);
    let found = false;
    
    for (let prev of projection['previous']) {
      if (prev['title'] === 'title') {
        found = true;
      }
    }

    assert(found, "Step not found in history");
  }

  public checkState(processRef: string, state: string): void {
    let process = this.getProcess(processRef);
    let projection = this.getProjection(process);

    assert(projection.hasOwnProperty('current'), "No current step found");
    assert(projection['current']['key'] === state, "Current state does not match de state requested");
  }

  public checkCompleted(processRef: string): void {
    this.checkState(processRef, ':success');
  }

  public checkCancelled(processRef: string): void {
    this.checkState(processRef, ':cancelled');
  }

  public checkFailed(processRef: string): void {
    this.checkState(processRef, ':failed');
  }
}
