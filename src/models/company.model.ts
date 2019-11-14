export enum CompanyType {
  CUSTOMER = "customer",
  SUPPLIER = "supplier",
  ORGANIZATION = "organization"
}
export interface IMocoCompany {
  id: number;
  type: CompanyType;
  name: string;
}
