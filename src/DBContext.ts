const MongoClient = require('mongodb').MongoClient;

export class DBContext {
  protected static mongo: any;
  protected static fixturePath: string;

  public static connect(scope: any): void {
    let url = 'mongo://localhost';
    this.mongo = new MongoClient(url);
  }

  public backupDatabase(scope: any): void {

  }
}
