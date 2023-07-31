import upath from "upath";
import { existsSync } from "fs";
import { dynamicImportJson } from "./utils/dynamicImport";

export default class LocalDataMappingManager {
  private localDataMapping?: Record<string, string[]>
  mappingPath: string

  constructor(localDataPath: string, private isPagesJSRepo: boolean) {
    this.mappingPath = upath.join(localDataPath, 'mapping.json')
  }

  getLocalDataMapping = async () => {
    if (!this.localDataMapping) {
      this.localDataMapping = await this.readLocalDataMapping()
    }
    return this.localDataMapping
  }

  async refreshMapping() {
    this.localDataMapping = await this.readLocalDataMapping()
  }
  
  private readLocalDataMapping() { 
    if (!existsSync(this.mappingPath)) {
      throw new Error(
        `The localData's mapping.json does not exist, expected the file to be at "${this.mappingPath}".`
      );
    }
    return dynamicImportJson(this.mappingPath);
  }
}
