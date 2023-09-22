export interface EventReconciliationService {
    reconcile(): Promise<void>;
}