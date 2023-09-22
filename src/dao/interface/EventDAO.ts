import { OptimisticEventDBO } from "../../models/OptimisticEventDBO";

export interface EventDAO {
  getLastBlockProcessedForEvent(
    contractIdentifier: string,
    eventName: string
  ): Promise<number>;

  save(OptimisticEventDBO: OptimisticEventDBO): Promise<boolean>;

  updateLastProcessedBlockForEvent(
    contractIdentifier: string,
    eventName: string,
    currentBlockNumber: number
  ): Promise<void>;
}
