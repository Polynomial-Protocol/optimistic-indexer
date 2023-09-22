import {ChainService} from "./interfaces/ChainService";
import {ethers} from "ethers";

export class ChainServiceImpl implements ChainService {
    delayFunc = (ms: number) => new Promise(res => setTimeout(res, ms));

    constructor(private provider: ethers.providers.Provider) {
    }

    async getCurrentBlockNumber(): Promise<number> {
        return await this.provider.getBlockNumber();
    }

    async getTimestamp(blockNumber: number): Promise<number> {
        let block: any = await this.provider.getBlock(blockNumber);
        if (!block) {
            await this.delayFunc(5000);
            block = await this.provider.getBlock(blockNumber);
        }

        if (block) {
            return block.timestamp;
        }
        return 0;
    }

    async getTimestampByHash(transactionHash: string): Promise<number> {
        let block: any = await this.provider.getTransaction(transactionHash);
        if (!block) {
            await this.delayFunc(5000);
            block = await this.provider.getTransaction(transactionHash);
        }

        if (block) {
            return block.timestamp
        }
        return 0;
    }

}