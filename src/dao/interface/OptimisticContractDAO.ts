import {OptimisticContract} from "../../models/OptimisticContract";
import {Filter} from "mongodb/mongodb.ts34";

export interface OptimisticContractDAO {
    save(contract: OptimisticContract): Promise<boolean>;

    get(identifier: string): Promise<OptimisticContract>;

    query(criteria: Filter<OptimisticContract>): Promise<Array<OptimisticContract>>;
}