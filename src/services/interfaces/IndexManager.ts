export interface CollectionIndex {
    [key: string]: Index[]
}

export interface Index {
    name: string
    unique: boolean
    background: boolean
    spec: [IndexField]
}

export interface IndexField {
    [key: string]: -1 | 1 | 0
}

export interface IndexManager {
    ensureIndexes(collectionIndex: CollectionIndex): Promise<Array<string>>;
}