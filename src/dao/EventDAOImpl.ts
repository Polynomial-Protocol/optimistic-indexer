import { EventDAO } from "./interface/EventDAO";
import { Collection, Db } from "mongodb";
import * as events from "events";
import { OptimisticEventDBO } from "../models/OptimisticEventDBO";
import { OptimisticContractService } from "../services/interfaces/OptimisticContractService";

export class EventDAOImpl implements EventDAO {
  private events: Collection;
  private sweepData: Collection;

  constructor(db: Db, private contractService: OptimisticContractService) {
    this.events = db.collection("events");
    this.sweepData = db.collection("sweepData");
  }

  async getLastBlockProcessedForEvent(
    contractIdentifier: string,
    eventName: string
  ): Promise<number> {
    const doc = await this.sweepData.findOne({
      contractIdentifier: contractIdentifier,
      eventName: eventName,
    });
    if (doc === null) {
      const contract = await this.contractService.getContract(
        contractIdentifier
      );
      return contract.startIdx;
    }

    return doc["blockNumber"];
  }

  async save(OptimisticEventDBO: OptimisticEventDBO): Promise<boolean> {
    try {
      await this.events.insertOne(OptimisticEventDBO);
      return true;
    } catch (error) {
      console.error("Could not save event due to error: %s", error);
      return false;
    }
  }

  async updateLastProcessedBlockForEvent(
    identifier: string,
    name: string,
    currentBlockNumber: number
  ): Promise<void> {
    await this.sweepData.updateOne(
      { contractIdentifier: identifier, eventName: name },
      { $set: { blockNumber: currentBlockNumber } },
      { upsert: true }
    );
  }
}
