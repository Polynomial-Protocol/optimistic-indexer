import { OptimisticContractDAOImpl } from "./dao/OptimisticContractDAOImpl";
import { Db, MongoClient } from "mongodb";
import { IndexManager } from "./services/interfaces/IndexManager";
import { IndexManagerImpl } from "./services/IndexManagerImpl";
import * as path from "path";
import { ContractRegistrationServiceLocalImpl } from "./helpers/ContractRegistrationServiceLocalImpl";
import { OptimisticContractServiceImpl } from "./services/OptimisticContractServiceImpl";
import { Contract, ethers, providers } from "ethers";
import { EventServiceImpl } from "./services/EventServiceImpl";
import { EventDAOImpl } from "./dao/EventDAOImpl";
import { ChainServiceImpl } from "./services/ChainServiceImpl";
import { PointToPointIndexerServiceImpl } from "./services/PointToPointIndexerServiceImpl";
import { SweepingIndexerServiceImpl } from "./services/SweepingIndexerServiceImpl";
import { OptimisticContractService } from "./services/interfaces/OptimisticContractService";
import { EventService } from "./services/interfaces/EventService";
import { Kafka } from "kafkajs";
import {
  KafkaQueueServiceImpl,
  MockQueueServiceImpl,
} from "./queue/queue.service";

let cron = require("node-cron");
const yaml = require("js-yaml");
const fs = require("fs");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI!;
const CONTRACTS_FILE_PATH = path.resolve(
  __dirname,
  process.env.CONTRACTS_RELATIVE_PATH!
);
const NETWORK = process.env.NETWORK!;
const ALCHEMY_API_KEY_FOR_INDEXER = process.env.ALCHEMY_API_KEY_FOR_INDEXER!;
const ALCHEMY_API_KEY_FOR_RECONCILIATION =
  process.env.ALCHEMY_API_KEY_FOR_RECONCILIATION!;
const DB_NAME = process.env.DB_NAME!;
const INDEXES_FILE_PATH = path.resolve(
  __dirname,
  process.env.INDEXES_RELATIVE_PATH!
);
const RECONCILIATION_CRON = process.env.RECONCILIATION_CRON || "*/5 * * * *";
const EXPECTED_PONG_BACK = 15000;
const KEEP_ALIVE_CHECK_INTERVAL = 7500;
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID!;
const KAFKA_BOOTSTRAP_SERVER = process.env.KAFKA_BOOTSTRAP_SERVER!;
const KAFKA_API_KEY = process.env.KAFKA_API_KEY!;
const KAFKA_API_SECRET = process.env.KAFKA_API_SECRET!;
export const KAFKA_TOPIC = process.env.KAFKA_TOPIC!;

async function setupKafka() {
  const kafka = await new Kafka({
    clientId: KAFKA_CLIENT_ID,
    brokers: [KAFKA_BOOTSTRAP_SERVER],
    ssl: true,
    sasl: {
      mechanism: "plain",
      username: KAFKA_API_KEY,
      password: KAFKA_API_SECRET,
    },
  });

  const kafkaProducer = kafka.producer();
  await kafkaProducer.connect();
  console.log("Kafka Producer connected.");
  return {
    kafkaProducer,
  };
}

export const getProvider = (
  network: string,
  apiKey: string
): providers.WebSocketProvider => {
  const provider = ethers.providers.AlchemyProvider.getWebSocketProvider(
    network,
    apiKey
  );
  let pingTimeout: any = null;
  let keepAliveInterval: any = null;

  provider._websocket.on("open", () => {
    keepAliveInterval = setInterval(() => {
      provider._websocket.ping();

      pingTimeout = setTimeout(() => {
        provider._websocket.terminate();
      }, EXPECTED_PONG_BACK);
    }, KEEP_ALIVE_CHECK_INTERVAL);
  });

  provider._websocket.on("close", () => {
    console.error(
      "The websocket connection was closed, killing and restarting service..."
    );
    clearInterval(keepAliveInterval);
    clearTimeout(pingTimeout);
    process.exit(1);
  });

  provider._websocket.on("pong", () => {
    clearInterval(pingTimeout);
  });

  return provider;
};

async function getDatabase(mongoUri: string, dbName: string): Promise<Db> {
  const client = new MongoClient(mongoUri);
  await client.connect();
  return client.db(dbName);
}

async function createIndexes(
  filePath: string,
  db: Db,
  indexManager: IndexManager
): Promise<Array<string>> {
  const collectionIndexes = yaml.load(fs.readFileSync(filePath, "utf8"));
  return await indexManager.ensureIndexes(collectionIndexes);
}

async function reconcilePastEvents(
  contractService: OptimisticContractService,
  eventService: EventService
) {
  let chainProvider = getProvider(NETWORK, ALCHEMY_API_KEY_FOR_RECONCILIATION);
  let chainService = new ChainServiceImpl(chainProvider);
  let contracts = await contractService.getActiveContracts();
  for (let OptimisticContract of contracts) {
    const chainContract = new Contract(
      OptimisticContract.address,
      OptimisticContract.abi,
      chainProvider
    );
    await new SweepingIndexerServiceImpl(
      OptimisticContract,
      chainContract,
      eventService,
      chainService
    ).reconcilePastEvents();
  }
}

async function runIndexer(
  db: Db,
  contractService: OptimisticContractService,
  eventService: EventService
) {
  const chainProvider = getProvider(NETWORK, ALCHEMY_API_KEY_FOR_INDEXER);
  const chainService = new ChainServiceImpl(chainProvider);
  const pointToPointIndexerService = new PointToPointIndexerServiceImpl(
    contractService,
    eventService,
    chainService,
    chainProvider
  );
  await pointToPointIndexerService.startListeningForEventsFromActiveContracts();
}

async function actrunCronForReconcilingPastEvents(
  contractService: OptimisticContractService,
  eventService: EventService
) {
  cron.schedule(RECONCILIATION_CRON, () => {
    reconcilePastEvents(contractService, eventService);
  });
}

async function main() {
  const db = await getDatabase(MONGO_URI, DB_NAME);
  console.log("Connected to database: %s", db.databaseName);

  const indexesCreated = await createIndexes(
    INDEXES_FILE_PATH,
    db,
    new IndexManagerImpl(db)
  );
  console.log("Created indexes: [%s]", indexesCreated.toString());

  const contractService = new OptimisticContractServiceImpl(
    new OptimisticContractDAOImpl(db)
  );

  let queueService;
  if (process.env.PUSH_TO_KAFKA === "true") {
    const { kafkaProducer } = await setupKafka();
    queueService = new KafkaQueueServiceImpl(kafkaProducer);
  } else {
    queueService = new MockQueueServiceImpl();
  }

  const eventService = new EventServiceImpl(
    new EventDAOImpl(db, contractService),
    queueService
  );

  const contractRegistrationService = new ContractRegistrationServiceLocalImpl(
    CONTRACTS_FILE_PATH,
    contractService
  );
  await contractRegistrationService.registerContracts();

  console.log("Reconciling past events during boot up...");

  await reconcilePastEvents(contractService, eventService);

  await runIndexer(db, contractService, eventService);

  await actrunCronForReconcilingPastEvents(contractService, eventService);
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
});
