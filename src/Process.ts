import { Account, EventChain } from 'lto-api';
import { ScenarioLoader } from './ScenarioLoader';

export class Process {
  public schema = 'https://specs.livecontracts.io/v0.2.0/process/schema.json#';
  public id: string;
  public scenario: any;
  public actors = [];
  protected chain: EventChain;
  protected projection: any;
  protected eventAtProjection: string;
  protected creator: Account;
  protected started = false;

  constructor(chain: EventChain, ref: string = null) {
    this.chain = chain;
    this.id = chain.createProjectionId(ref);
  }

  public isStarted(set: boolean = null): boolean {
    if (set !== null) {
      this.started = set;
    }
    
    return this.started;
  }

  public setCreator(account: Account): void {
    if (this.creator && this.creator.getPublicSignKey() === account.getPublicSignKey()) {
      return;
    }

    if (this.creator !== null) {
      throw new Error("Process creator already set");
    }

    this.creator = account;
  }

  public getCreator(): Account {
    return this.creator || null;
  }

  public loadScenario(name: string, path: string): void {
    if (this.scenario) {
      throw new Error('Scenario is already set');
    }

    this.id  = this.chain.createProjectionId(`process:${name}`);
    this.scenario = ScenarioLoader.load(name, path);
    this.scenario.id = this.chain.createProjectionId(`scenario:${path}`);
  }

  public setActor(actorKey: string, identity: any): void {
    if (this.actors[actorKey]) {
      throw new Error(`Actor ${actorKey} already set`);
    }

    this.actors[actorKey] = {'identity': identity};
  }

  public hasActorWithSignKey(signkey: string): boolean {
    let key: string;
    this.actors.forEach((actor, index) => {
      if (actor.identity.signkey['default'] === signkey) {
        return true;
      }
    });

    return false;
  } 

  public createResponse(actionKey: string, key: string = null, data: object = {}): any {
    if (!key) {
      key = this.scenario.actions.actionKey.default_response || 'ok';
    }

    let response = {
      '$schema': 'https://specs.livecontracts.io/v0.2.0/response/schema.json#',
      'process': this.id,
      'action': {
        'key': actionKey
      },
      'key': key,
      'data': data
    };

    return response
  }

  public getProjection(): any {
    return (this.eventAtProjection === this.chain.getLatestHash()) ? this.projection : null;
  }

  public setProjection(projection: any): void {
    this.projection = projection;
    this.eventAtProjection = this.chain.getLatestHash();
  }

  public jsonSerialize(): any {
    return {
      '$schema': this.schema,
      'id': this.id,
      'scenario': this.scenario,
      'actors': this.actors
    }
  }
}
