import * as fs from 'fs';
import YAML from 'yaml';
import JSON from 'json';

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
    for (let ext in ScenarioLoader.SCENARIO_FILES) {
      file = `${path}/${name}${ext}`;
      if (fs.statSync(file)) {
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
    let scenario = YAML.parse(file)
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
