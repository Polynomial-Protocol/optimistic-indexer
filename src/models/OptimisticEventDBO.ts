import {ReconcilerType} from "./ReconcilerType";

export interface OptimisticEventDBO {
    id?: string;
    contractAddress: string;
    transactionHash: string;
    name: string;
    timestamp?: number;
    args?: EventArg[];
    blockNumber: number;
    logIndex: number;
    signature: string | undefined;
    savedBy: ReconcilerType;
}

export interface EventArg {
    key: string
    value: any
}