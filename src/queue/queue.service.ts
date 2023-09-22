import { KAFKA_TOPIC } from "../indexer";
import { Producer } from "kafkajs";

export interface QueueServiceInterface {
  pushEvent(key: string, value: string): Promise<any>;
}

export class KafkaQueueServiceImpl implements QueueServiceInterface {
  constructor(private kafkaProducer: Producer) {}

  async pushEvent(key: string, value: string): Promise<any> {
    return await this.kafkaProducer.send({
      topic: KAFKA_TOPIC,
      messages: [
        {
          key: key,
          value: value,
        },
      ],
    });
  }
}

export class MockQueueServiceImpl implements QueueServiceInterface {
  async pushEvent(key: string, value: string): Promise<any> {
    return "Not implemented";
  }
}
