import {OptimisticContract} from "../../models/OptimisticContract";

export interface OptimisticContractService {
    save(contract: OptimisticContract): Promise<boolean>;

    getContract(identifier: string): Promise<OptimisticContract>;

    disableContract(identifier: string): Promise<boolean>;

    getActiveContracts(): Promise<Array<OptimisticContract>>;
}