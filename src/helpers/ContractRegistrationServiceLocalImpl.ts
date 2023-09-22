import { ContractRegistrationHelper } from "./ContractRegistrationHelper";
import { OptimisticContractService } from "../services/interfaces/OptimisticContractService";
import { OptimisticContract } from "../models/OptimisticContract";

const yaml = require("js-yaml");
const fs = require("fs");

export class ContractRegistrationServiceLocalImpl
  implements ContractRegistrationHelper
{
  public constructor(
    private contractsPath: string,
    private contractService: OptimisticContractService
  ) {}

  async registerContracts(): Promise<any> {
    const contracts: OptimisticContract[] = yaml.load(
      fs.readFileSync(this.contractsPath, "utf8")
    );
    let identifiers: Set<string> = new Set<string>();

    for (let contract of contracts) {
      let contractFromDB: OptimisticContract;
      try {
        contractFromDB = await this.contractService.getContract(
          contract.identifier
        );
        contractFromDB.abi = contract.abi;
        contractFromDB.address = contract.address;
        contractFromDB.eventsToIndex = contract.eventsToIndex;
        contractFromDB.disabled = contract.disabled;
      } catch (e) {
        contractFromDB = {
          identifier: contract.identifier,
          abi: contract.abi,
          startIdx: contract.startIdx,
          address: contract.address,
          eventsToIndex: contract.eventsToIndex,
          disabled: contract.disabled,
        };
      }

      await this.contractService.save(contractFromDB);

      identifiers.add(contract.identifier);
    }
    return identifiers;
  }
}
