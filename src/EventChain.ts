import { LTO, Event, Account } from 'lto-api';
import { EventChain as base } from 'lto-api';

/*
 * Event chain with projection
 */
export class EventChain extends base {
  public identities = [];
  public resources: string[];
  protected lastSendEvent: string;

  /*
   * Update the event chain
   */
  public update(projection: any): void {
    this.events.forEach((event, index) => {
      let hash = projection.events[index].hash;
      if (hash != event.hash) {
        throw new Error(`Chain mismatch on event ${index}: ${hash} is not ${event.hash}`);
      }
    });

    projection.events.slice(this.events.length).forEach((data, index) => {
      this.events.push(this.castEvent(data));
    });

    this.lastSendEvent = this.getLatestHash();
    this.identities = projection.identities;
    this.resources = projection.resources;
  }

  /*
   * Set identity ids for each account
   */
  public linkIdentities(accounts: Account[]): void {
    let index = {};
    for (let identity in this.identities) {
      for (let key of identity['signkeys']) {
        index[key] = identity['id'];
      }
    }
  
    let key: string;
    for (let i=0; i < accounts.length; i++) {
      key = accounts[i].getPublicSignKey();
      accounts[i]['id'] = index[key] ? index[key] : null;
    }
  }

  /*
   * Check if there are no unsend events
   */
  public isSynced(): boolean {
    return this.getLatestHash() === this.lastSendEvent;
  }

  /*
   * Cast data to an Event
   */
  protected castEvent(data): Event {
    let event = new Event();
    for (let key in data) {
      event[key] = data[key];
    }

    return event
  }
}
