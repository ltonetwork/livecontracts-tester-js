import { HTTPContext } from './HTTPContext';
import { MongoClient } from 'mongodb';
const fail = require('assert').fail;

export class DBContext {
  protected mongo: MongoClient;
  protected fixturePath: string;
  protected httpContext: HTTPContext;
  protected admin: any;

  constructor(scope: any) {
    this.httpContext = scope.httpContext;
    this.mongo = new MongoClient(this.httpContext.mongoUrl, { useNewUrlParser: true })
  }

  public async connect() {
    return this.mongo.connect(function(err, db) {
      if (err) {
        fail(err);
      }
    });
  }

  public close(): void {
    this.mongo.close();
  }

  public async backupDatabase(scope: any) {
    let dbList = this.admin.listDatabases(function(err, result) {
      if (err) {
        fail(err);
      }
      console.log(result);

      return result;
    }); 

  }
}
