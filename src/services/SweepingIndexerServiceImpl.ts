import {OptimisticContract} from "../models/OptimisticContract";
import {SweepingIndexerService} from "./interfaces/SweepingIndexerService";
import {EventReconciliationServiceImpl} from "./EventReconciliationServiceImpl";
import {ChainService} from "./interfaces/ChainService";
import {EventService} from "./interfaces/EventService";
import {Contract} from "ethers";

export class SweepingIndexerServiceImpl implements SweepingIndexerService {
    constructor(private OptimisticContract: OptimisticContract, private contract: Contract, private eventService: EventService,
                private chainService: ChainService) {
    }


    async reconcilePastEvents(): Promise<void> {
        for (let event of this.OptimisticContract.eventsToIndex) {
            const eventReconciliationService = new EventReconciliationServiceImpl(this.eventService, this.chainService,
                this.contract, this.OptimisticContract, event);
            await eventReconciliationService.reconcile();
        }
    }
}