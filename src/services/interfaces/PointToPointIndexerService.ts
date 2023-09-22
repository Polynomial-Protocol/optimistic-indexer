export interface PointToPointIndexerService {
    disableContract(identifier: string): Promise<boolean>;

    startListeningForEventsFromActiveContracts(): Promise<void>;
}