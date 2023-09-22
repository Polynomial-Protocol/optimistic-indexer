import {OptimisticContractService} from "./interfaces/OptimisticContractService";
import {OptimisticContract} from "../models/OptimisticContract";
import {OptimisticContractDAO} from "../dao/interface/OptimisticContractDAO";

export class OptimisticContractServiceImpl implements OptimisticContractService {

    public constructor(private dao: OptimisticContractDAO) {
    }

    async disableContract(identifier: string): Promise<boolean> {
        let contract = await this.getContract(identifier);
        contract.disabled = true;
        await this.save(contract);

        return true;
    }

    async getContract(identifier: string): Promise<OptimisticContract> {
        return await this.dao.get(identifier);
    }

    async save(contract: OptimisticContract): Promise<boolean> {
        const id = await this.dao.save(contract);
        return Promise.resolve(id);
    }

    async getActiveContracts(): Promise<Array<OptimisticContract>> {
        return await this.dao.query({disabled: false});
    }
}