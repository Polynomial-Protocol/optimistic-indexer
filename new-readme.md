# why an indexer is needed - it’s importance

An indexer is critical for building the backend (APIs) for an application that runs on the blockchain. This is because
blockchains (e.g.- all EVM chains like Ethereum, Optimism, etc.) emits events in the transaction receipts of each block
mined which contains necessary information about the state change that happened due to the transactions inside the
block.

e.g. If we submit a transaction to transfer an NFT, the block in which the transaction gets mined emits an event with
the following structure:

    Transfer(address from, address to, uint256 tokenId)

This event contains information like the sender, receiver, and the id of the token transferred. This information is
useful for any application that wants to take some action for any token transfer for the NFT contract.

# Limitations of the current indexer

1. It only supports Optimism chain for now.
2. Ordering of events is not guaranteed. This is because it uses websockets to listen for current events and a
   reconciliation loop to index events that were missed (due to downtime or disconnected websockets or any other reason)
3. The current indexer is not optimized for performance. It is a single-threaded application that reads events from
   the chain and saves them into the database. This is not scalable for a large number of events.

# examples of applications in a chain that would benefit the most from an indexer

Almost all applications that have a smart contract deployed on a blockchain use one of the 2 approaches to index events.
a. Use a decentralised indexer like Graph to index events of the smart contract
b. Run an in-house indexer to index events

Application that use the second approach will benefit the most from this indexer.

# how an open sourced model will help all the developers on-chain in their dev process

An open-source indexer will save significant development time spent in writing an indexer from scratch.

# if dev using anything other than kubernetes - changes to do

It has a Dockerfile that can be used to build and run the indexer in any environment which supports containers.