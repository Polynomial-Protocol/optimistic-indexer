import {OptimisticContract} from "../models/OptimisticContract";
import {OptimisticContractDAO} from "./interface/OptimisticContractDAO";
import {Collection, Db, Document, Filter} from "mongodb";
import {WithId} from "mongodb/mongodb.ts34";

export class OptimisticContractDAOImpl implements OptimisticContractDAO {
    private collection: Collection;
    private static COLLECTION_NAME = "contracts";

    private static getContractFromDBObject(document: WithId<Document>): OptimisticContract {
        return {
            identifier: document['identifier'],
            abi: document['abi'],
            address: document['address'],
            eventsToIndex: document['eventsToIndex'],
            startIdx: document['startIdx'],
            disabled: document['disabled'] || false
        }
    }

    public constructor(database: Db) {
        this.collection = database.collection(OptimisticContractDAOImpl.COLLECTION_NAME);
    }

    async query(criteria: Filter<OptimisticContract>): Promise<Array<OptimisticContract>> {
        const result = await this.collection.find({disabled: {"$ne": true}});
        let contracts = await result.toArray();
        return contracts.map((value) => {
            return OptimisticContractDAOImpl.getContractFromDBObject(value);
        });
    }

    async get(identifier: string): Promise<OptimisticContract> {
        const result = await this.collection.findOne({identifier: identifier});
        if (result) {
            return {
                identifier: result['identifier'],
                abi: result['abi'],
                address: result['address'],
                eventsToIndex: result['eventsToIndex'],
                startIdx: result['startIdx']
            };
        }
        return Promise.reject('No such contract found with identifier: ' + identifier);
    }

    async save(contract: OptimisticContract): Promise<boolean> {
        const result = await this.collection.replaceOne({identifier: contract.identifier}, contract, {upsert: true})
        return result.modifiedCount == 1
    }

}