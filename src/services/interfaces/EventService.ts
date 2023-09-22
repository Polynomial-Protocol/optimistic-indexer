import { OptimisticEventDBO } from "../../models/OptimisticEventDBO";

export interface EventService {
  getLastBlockProcessedForEvent(
    contractIdentifier: string,
    eventName: string
  ): Promise<number>;

  save(OptimisticEventDBO: OptimisticEventDBO): Promise<boolean>;

  updateLastBlockProcessedForEvent(
    identifier: string,
    name: string,
    currentBlockNumber: number
  ): Promise<void>;
}
