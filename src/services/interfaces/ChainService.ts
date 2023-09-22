export interface ChainService {
    getCurrentBlockNumber(): Promise<number>;

    getTimestamp(blockNumber: number): Promise<number>;

    getTimestampByHash(transactionHash: string): Promise<number>;
}