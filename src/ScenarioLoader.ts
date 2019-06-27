import * as fs from 'fs';
const YAML = require('js-yaml');
const JSON = require('json');

export class ScenarioLoader {
  protected static SCENARIO_FILES = [
    '.yml',
    '.json',
    '/scenario.yml',
    '/scenario.json'
  ]

  public static load(name: string, path: string): any {
    let file = ScenarioLoader.findScenarioFile(name, path);
    let scenario = ScenarioLoader.parseScenario(file);

    return scenario
  }

  protected static findScenarioFile(name: string, path: string): string {
    let file;
    for (let ext of ScenarioLoader.SCENARIO_FILES) {
      file = `${path}/../../scenarios/${name}${ext}`;
      if (fs.existsSync(file)) {
        return file;
      }
    }

    throw new Error(`Unable to load scenario ${name}. Neither YAML or JSON file found`);
  }

  protected static parseScenario(file: string): any {
    let ext = file.substr(file.lastIndexOf('.') + 1);
    switch (ext) {
      case 'yml':
        return ScenarioLoader.parseYamlScenario(file);
      case 'json':
        return ScenarioLoader.parseJsonScenario(file);
    }

    throw new Error(`Dont know how to parse ${file}. (How did we get here?`);
  }

  protected static parseYamlScenario(fileName: string): any {
    const file = fs.readFileSync(fileName);
    let scenario = YAML.safeLoad(file)
    if (!scenario) {
      throw new Error(`Unable to load scenario: failed to parse ${file}`);
    }

    return scenario;
  }

  protected static parseJsonScenario(fileName: string): any {
    const file = fs.readFileSync(fileName);
    let scenario = JSON.parse(file);
    if (!scenario) {
      throw new Error(`Unable to load scenario: failed to parse ${file}`);
    }

    return scenario;
  }
}
