import { strict as request } from 'request';
import { Before, Given, When, Then } from 'cucumber';
import { strict as assert } from 'assert';
import { LTO, Account, Event } from 'lto-api';
import { EventChain } from './EventChain';

export class EventChainContext {
  private lto: LTO = new LTO();
  protected accounts: Account[];
  protected creator: Account;
  protected chain: EventChain = new EventChain();
  protected systemSignKey: string;

  public fetchSystemKey(): void {
    let headers = {
      'Accept': 'Application/json'
    };

    request({headers: headers, uri: '/', method: 'GET'}, (error, resp, body) => {
      if (error) {
        throw new Error('Failed to fetch systemkey');
      }

      this.systemSignKey = body.services.events.signkey ? body.services.events.signkey : null;
    });
  }

  public getAccount(accountRef: string): Account {
    if (!this.accounts[accountRef]) {
      let account = this.lto.createAccountFromExistingPhrase(accountRef);
      if (this.chain) {
        account['id'] = this.chain.createProjectionId(accountRef);

        let identity = this.createIdentity(account);
        let identityEvent = new Event(identity);
        identityEvent.addTo(this.chain).signWith(this.getCreator());
      }

      this.accounts[accountRef] = account;
    } 

    return this.accounts[accountRef];
  }

  public getChain(): EventChain {
    if (!this.chain) {
      throw new Error("This chain hasn't been created");
    }

    return this.chain;
  }

  public getCreator(): Account {
    if (!this.creator) {
      throw new Error("This chain hasn't been created");
    }

    return this.creator;
  }

  protected updateProjection(account: Account): void {
    let headers = {
      'Accept': 'Application/json'
    };
    let data = {
      'account': account
    }
    let chainId = this.getChain().id;

    request({headers: headers, uri: `event-chains/${chainId}`, body: data, method: 'GET'}, (error, resp, body) => {
      if (error) {
        throw new Error(`Can not find chain with chain id: ${chainId}`);
      }
      let chain = this.getChain();
      chain.update(body);
      chain.linkIdentities(this.accounts);
    });
  }

  public submit(account: Account = null) {
    account = account ? account : this.creator;
    let data = {
      'json': this.getChain(),
      'account': account
    }

    request({uri: 'event-chains', body: data, method: 'POST'}, (error, resp, body) => {
      if (error) {
        throw new Error('Failed to update chain');
      }
    });

    this.updateProjection(account);
  }

  public createIdentity(account: Account): any {
    return {
      '$schema': 'https://specs.livecontracts.io/v0.2.0/identity/schema.json#',
      'id': account['id'],
      'node': 'amqps://localhost',
      'signkeys': {
        'default': account.getPublicSignKey(),
        'system': this.systemSignKey

      },
      'encryptkey': account.getPublicEncryptKey()
    }
  }

  public chainIsCreatedBy(accountRef: string): void {
    let account = this.getAccount(accountRef);

    this.chain = new EventChain();
    this.chain.init(account);

    account['id'] = this.chain.createProjectionId(accountRef);

    let identity = this.createIdentity(account);
    let identityEvent = new Event(identity);
    identityEvent.addTo(this.chain).signWith(account);

    this.creator = account;
  }

  public createAccountWithSignKey(accountRef: string, key: string): void {
    if (this.accounts[accountRef]) {
      throw new Error(`The ${accountRef} account has already been defined`);
    }

    let account = this.lto.createAccountFromPrivateKey(key);
    account['id'] = this.chain.createProjectionId(accountRef);

    let identity = this.createIdentity(account)
    let identityEvent = new Event(identity);
    identityEvent.addTo(this.chain).signWith(this.getCreator());

    this.accounts[accountRef] = account;
  }

  private filterIdentitiesBySignKey(account: Account): any {
    return function(element): boolean {
      return element.signkeys.user === account.getPublicSignKey();
    }
  }

  public AccountIsPresent(accountRef: string): void {
    let account = this.getAccount(accountRef);

    if (!this.chain.isSynced()) {
      throw new Error('The chain has unsubmitted events');
    }

    let identity = this.chain.identities.filter(this.filterIdentitiesBySignKey);
    if (!identity) {
      assert.fail(`${accountRef} is not an identity on the chain`);
    }
  }
}
