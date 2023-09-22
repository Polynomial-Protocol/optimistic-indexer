import {CollectionIndex, Index, IndexManager} from "./interfaces/IndexManager";
import {Db} from "mongodb";

export class IndexManagerImpl implements IndexManager {
    public constructor(private db: Db) {
    }

    async ensureIndexes(collectionIndex: CollectionIndex): Promise<Array<string>> {
        let indexNames = new Array<string>();
        for (let collectionIndexKey in collectionIndex) {
            const indexes: Index[] = collectionIndex[collectionIndexKey]
            for (let index of indexes) {
                const indexName = await this.db.collection(collectionIndexKey).createIndex(
                    index.spec, {background: index.background, unique: index.unique});
                indexNames.push(indexName);
            }
        }

        return Promise.resolve(indexNames);
    }
}