# Optimistic Indexer

![GitHub Stars](https://img.shields.io/github/stars/Polynomial-Protocol/optimistic-indexer?style=social)
![GitHub Issues](https://img.shields.io/github/issues/Polynomial-Protocol/optimistic-indexer)
![GitHub License](https://img.shields.io/github/license/Polynomial-Protocol/optimistic-indexer)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Built With](https://img.shields.io/badge/built%20with-Typescript-blue)
![Blockchain](https://img.shields.io/badge/blockchain-EVM--based-green)

**Easy-to-Setup, Low Latency Indexer for L2s**
<img  width="819"  alt="Optimistic Indexer"  src="https://github.com/Polynomial-Protocol/optimistic-indexer/assets/19399278/92a17c02-9957-4d86-8191-6b198926b315">

## What is Optimistic Indexer?

Optimistic Indexer is a Fast, Low Latency event indexer tailored for EVM-based blockchains. Written in TypeScript, it offers two concurrent modes:

- **Point-to-Point:** Indexes each block as they are added.
- **Reconciliation:** Catches up on any missed blocks.

The indexer is non-opinionated, exporting events to a MongoDB NOSQL database. It's designed to be part of a larger service architecture that reads these events to serve to end-users.


<img  height="512"  alt="Optimistic Indexer"  src="https://github.com/Polynomial-Protocol/optimistic-indexer/assets/19399278/67a96159-2947-43d7-b530-b46d90d36ccd">

### 🌟 Features

1. Registering new contracts and specifying the events to listen to.
2. Reading past and live events from the chain and storing them in the database for querying.
3. Optionally pushing events to a Kafka topic.

## 🚀 Quick Start

### 🔍 Prerequisites
Before running the indexer, make sure to install the following:

1. **Node.js**  and npm installed or use the docker container 
2. **MongoDB**: Install and run MongoDB 4.2+ or use a hosted MongoDB solution like MongoDB Atlas.
3. **Kafka (Optional)**: Install and run Kafka or use a hosted solution like Confluent if you wish to push events to a Kafka topic.
4. **Alchemy API Key**: Create an account on Alchemy to query the blockchain for events. Copy your API keys for both indexer and reconciliation tasks.

### 🛠️ Installation

1. Clone the repository
    ```bash
    git clone https://github.com/Polynomial-Protocol/intergalactic-indexer.git
    ```
    
2. Navigate to the project directory
    ```bash
    cd intergalactic-indexer
    ```

3. Install dependencies
    ```bash
    npm install
    ```

4. Create a `.env` file and populate it with your settings. An example is given below:
	```env
	MONGO_URI="mongodb://localhost:27017" # uri of mongodb installation
	APP_NAME="indexer" # anything that you want
	ALCHEMY_API_KEY_FOR_INDEXER="" # alchemy api key that will be used to listen for events using websockets
	ALCHEMY_API_KEY_FOR_RECONCILIATION="" # alchemy api key that will be used to run the reconciliation loop, you can use the same API key as above
	INDEXES_RELATIVE_PATH="artifacts/indexes.yaml" # this file is used to store all the mongodb indexes that have to be created, do not change it or else indexer will start running slowly due to slow db queries
	RECONCILIATION_CRON="*/2 * * * *" # cron expression for reconciliation, change it as needed
	DB_NAME="indexer" # name of the database in mongodb
	CONTRACTS_RELATIVE_PATH="artifacts/example-contract.yaml" # file where contracts and their index configuration are present
	NETWORK="optimism" # network for which the indexer will run
	KAFKA_API_KEY="" # kafka api key, only required if you wish to push events to a kafka topic
	KAFKA_API_SECRET="" # kafka api secret, only required if you wish to push events to a kafka topic
	KAFKA_BOOTSTRAP_SERVER="" # kafka bootstrap server, only required if you wish to push events to a kafka topic
	KAFKA_TOPIC=events # change it to point to correct name of topic name
	PUSH_EVENTS=false # set it to true if you wish to push events to a kafka topic
	```
5. Run the indexer
    ```bash
    npx ts-node src/indexer.ts
    ```

## 🔧 Configuring Contracts

Modify the configuration file specified by `CONTRACTS_RELATIVE_PATH` to include the smart contracts and events you wish to index. 

#### `example-contract.yaml` Breakdown

- `identifier`: A unique name for the contract.
- `abi`: The Application Binary Interface of the contract. It's an array of method and event descriptions. It is taken as string and ABI can be provided in JSON or by formatting it like [this](https://github.com/gnidan/abi-to-sol). Examples for both can be in artifacts folder
- `startIdx`: Starting block number for indexing events.
- `address`: Ethereum address where the contract is deployed.
- `eventsToIndex`: Events your application should listen for.
- `disabled`: Boolean flag indicating if the contract should be ignored.

## 💡 Additional Information

#### 📈 Importance of an Indexer

An indexer is indispensable for building robust backends for blockchain applications. Events emitted in transaction receipts contain vital information for applications, such as transfers of tokens in an NFT marketplace.

#### 🚧 Limitations of the Current Indexer

1. Only supports the Optimism chain for now.
2. Event ordering is not guaranteed. The indexer uses websockets to listen for current events and a reconciliation loop to index events that might be missed. 
3. Not optimized for performance; single-threaded. Not scalable for a large number of events

#### 📗 Examples of Applications

Almost all applications with a smart contract deployed on a blockchain could benefit from this indexer. Typically, dApps either use a decentralized indexer like The Graph or run an in-house indexer.

#### 🤝 How an Open-Sourced Model Will Help

Having an open-source indexer saves developers from reinventing the wheel, significantly cutting down on development time and cost.

#### 🐳 Non-Kubernetes Deployments

This project includes a Dockerfile for containerized deployment. Ensure Docker is installed if you're not using Kubernetes.


### 🌐 Community and Contributions

Open to contributions, please check the CONTRIBUTING.md file for details.

### ⚖️ License

This project is licensed under the MIT License - see the LICENSE.md file for details.

---

Made with 🔴 by Polynomial Protocol. 
For any issues or contributions, please refer to our [GitHub repository](https://github.com/Polynomial-Protocol/intergalactic-indexer).

Credits @phoenikx 
