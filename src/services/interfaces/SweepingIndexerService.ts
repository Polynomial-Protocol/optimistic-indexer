export interface SweepingIndexerService {
    reconcilePastEvents(): Promise<void>;
}