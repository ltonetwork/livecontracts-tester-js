const req = require('request');

export class HTTPContext {
  public url: string;
  public mongoUrl: string;

  constructor(url='http://localhost/', mongoUrl = 'mongodb://localhost:27018') {
    this.url = url;
    this.mongoUrl = mongoUrl;
  }

  public request(uri: string, method: string, headers?: any, data?: any): Promise<any>{
    return new Promise(function(resolve, reject) {
      let options = {};
      if (method !== 'GET' && data) {
        options = {uri: this.url + uri, method: method, headers: headers, body: data}
      } else {
        options = {uri: this.url + uri, method: method, headers: headers}
      }
      req(options, (error, resp, body) => {
        if (error) {
          reject(error);
        }

        try {
          resolve(body);
        } catch(e) {
          reject(e);
        }
      });
    }.bind(this));
  }
}
