export interface ContractRegistrationHelper {
    registerContracts(): Promise<Array<string>>;
}