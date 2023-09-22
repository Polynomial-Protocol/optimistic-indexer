import {PointToPointIndexerService} from "./interfaces/PointToPointIndexerService";
import {Contract, ethers} from "ethers";
import {OptimisticContractService} from "./interfaces/OptimisticContractService";
import {EventService} from "./interfaces/EventService";
import {ReconcilerType} from "../models/ReconcilerType";
import {EventReconciliationServiceImpl} from "./EventReconciliationServiceImpl";
import {ChainService} from "./interfaces/ChainService";

export class PointToPointIndexerServiceImpl implements PointToPointIndexerService {
    private contracts: Map<string, Contract>;

    public constructor(private contractService: OptimisticContractService,
                       private eventService: EventService,
                       private chainService: ChainService,
                       private provider: ethers.providers.Provider) {
        this.contracts = new Map<string, Contract>();
    }

    public async disableContract(identifier: string): Promise<boolean> {
        const contract = this.contracts.get(identifier);
        if (contract === undefined) {
            return false;
        }

        const success = await this.contractService.disableContract(identifier);
        if (success) {
            await contract.removeAllListeners();
            return true;
        }
        return false;
    }


    public async startListeningForEventsFromActiveContracts() {
        const contracts = await this.contractService.getActiveContracts();
        for (let OptimisticContract of contracts) {
            const blockChainContract = new Contract(OptimisticContract.address, OptimisticContract.abi, this.provider);
            OptimisticContract.eventsToIndex.forEach(evt => {
                console.log("[%s] [Point to Point Indexer] => Running for Event: %s from Contract: %s, address: %s",
                    new Date(Date.now()).toLocaleString(), evt.name, OptimisticContract.identifier, OptimisticContract.address)
                blockChainContract.on(evt.name, async (...args) => {
                    console.log("[%s] [Point to Point Indexer]: Received event of type: %s from contract: %s",
                        new Date(Date.now()).toLocaleString(), evt.name, OptimisticContract.identifier);
                    let event: ethers.Event = args[args.length - 1];
                    let timestamp = await this.chainService.getTimestamp(event.blockNumber);
                    console.log("Transaction hash: %s Timestamp: %s", event.transactionHash, timestamp);
                    await this.eventService.save({
                        name: evt.name,
                        transactionHash: event.transactionHash,
                        contractAddress: OptimisticContract.address,
                        savedBy: ReconcilerType.POINT,
                        blockNumber: event.blockNumber,
                        timestamp: timestamp,
                        logIndex: event.logIndex,
                        signature: event.eventSignature,
                        args: EventReconciliationServiceImpl.getArgs(event.args!, evt.arguments)
                    })
                });
            });
            this.contracts.set(OptimisticContract.identifier, blockChainContract);
        }
    }
}