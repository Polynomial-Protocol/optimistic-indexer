export interface Event {
    name: string;
    signature: string;
}

export interface OptimisticContract {
    identifier: string;
    abi: string[];
    address: string;
    eventsToIndex: OptimisticEvent[];
    startIdx: number;
    disabled?: boolean;
}

export interface OptimisticEvent {
    name: string
    arguments: string[]
}