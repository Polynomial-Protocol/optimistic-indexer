import { EventService } from "./interfaces/EventService";
import { EventDAO } from "../dao/interface/EventDAO";
import { OptimisticEventDBO } from "../models/OptimisticEventDBO";
import { QueueServiceInterface } from "../queue/queue.service";

export class EventServiceImpl implements EventService {
  constructor(
    private eventDAO: EventDAO,
    private queueService: QueueServiceInterface
  ) {}

  async getLastBlockProcessedForEvent(
    contractIdentifier: string,
    eventName: string
  ): Promise<number> {
    return await this.eventDAO.getLastBlockProcessedForEvent(
      contractIdentifier,
      eventName
    );
  }

  async save(OptimisticEventDBO: OptimisticEventDBO): Promise<boolean> {
    const success = await this.eventDAO.save(OptimisticEventDBO);
    const { contractAddress, name } = OptimisticEventDBO;
    if (success) {
      const response = await this.queueService.pushEvent(
        `${contractAddress}-${name}`,
        JSON.stringify(OptimisticEventDBO)
      );
      console.log(response);
    }
    return success;
  }

  async updateLastBlockProcessedForEvent(
    identifier: string,
    name: string,
    currentBlockNumber: number
  ): Promise<void> {
    return await this.eventDAO.updateLastProcessedBlockForEvent(
      identifier,
      name,
      currentBlockNumber
    );
  }
}
