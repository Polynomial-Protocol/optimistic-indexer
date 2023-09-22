import { EventReconciliationService } from "./interfaces/EventReconciliationService";
import { ReconcilerType } from "../models/ReconcilerType";
import { EventService } from "./interfaces/EventService";
import { ChainService } from "./interfaces/ChainService";
import { Contract, ethers } from "ethers";
import {
  OptimisticContract,
  OptimisticEvent,
} from "../models/OptimisticContract";
import { EventArg, OptimisticEventDBO } from "../models/OptimisticEventDBO";

export class EventReconciliationServiceImpl
  implements EventReconciliationService
{
  constructor(
    private eventService: EventService,
    private chainService: ChainService,
    private contract: Contract,
    private OptimisticContract: OptimisticContract,
    private OptimisticEvent: OptimisticEvent
  ) {}

  public static getArgs(
    argValues: ethers.utils.Result,
    args: string[]
  ): Array<EventArg> {
    let eventArgs = new Array<EventArg>();
    for (const argName of args) {
      let val = argValues[argName];
      if (val != undefined) {
        eventArgs.push({ key: argName, value: val });
      }
    }
    return eventArgs;
  }

  private async convertEvent(
    event: ethers.Event,
    contractAddress: string,
    reconcilerType: ReconcilerType
  ): Promise<OptimisticEventDBO> {
    let timestamp = await this.chainService.getTimestamp(event.blockNumber);
    return {
      name: event.event!,
      contractAddress: contractAddress,
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      logIndex: event.logIndex,
      signature: event.eventSignature,
      timestamp: timestamp,
      args: EventReconciliationServiceImpl.getArgs(
        event.args!,
        this.OptimisticEvent.arguments
      ),
      savedBy: reconcilerType,
    };
  }

  async reconcileBatch(fromBlock: number, toBlock: number) {
    console.log(
      `Reconciling ${this.OptimisticEvent.name} from ${fromBlock} to ${toBlock}`
    );
    let events = await this.contract.queryFilter(
      this.contract.filters[this.OptimisticEvent.name](),
      fromBlock,
      toBlock
    );

    if (events.length > 0) {
      for (let event of events) {
        const OptimisticEventDBO = await this.convertEvent(
          event,
          this.OptimisticContract.address,
          ReconcilerType.SWEEP
        );
        try {
          await this.eventService.save(OptimisticEventDBO);
        } catch (error: any) {
          console.log("Could not save event: %s", error.toString());
        }
      }
    }

    console.log(
      "[%s] Reconciled %s events of type: %s for contract: %s from block: %s to block: %s",
      new Date(Date.now()).toLocaleString(),
      events.length,
      this.OptimisticEvent.name,
      this.OptimisticContract.identifier,
      fromBlock,
      toBlock
    );
    await this.eventService.updateLastBlockProcessedForEvent(
      this.OptimisticContract.identifier,
      this.OptimisticEvent.name,
      toBlock
    );
  }

  async reconcile(): Promise<void> {
    let lastBlockNumber = await this.eventService.getLastBlockProcessedForEvent(
      this.OptimisticContract.identifier,
      this.OptimisticEvent.name
    );
    const currentBlockNumber = await this.chainService.getCurrentBlockNumber();

    const batchSize = 86400;

    while (lastBlockNumber < currentBlockNumber) {
      let toBlock = lastBlockNumber + batchSize;
      if (toBlock > currentBlockNumber) {
        toBlock = currentBlockNumber;
      }
      await this.reconcileBatch(lastBlockNumber, toBlock);
      lastBlockNumber = toBlock;
    }
  }
}
