import { IMocoCompany } from "./company.model";

export enum MocoGender {
  FEMALE = "F",
  MALE = "M",
  UNKNOWN = "U"
}

export interface IMocoContactTemplate {
  gender: MocoGender;
  firstname: string;
  lastname: string;
  work_email?: string;
  work_phone?: string;
  mobile_phone?: string;
}

export interface IMocoContact extends IMocoContactTemplate {
  id: number;
  title: string;
  job_position: string;
  work_fax: string;
  work_address: string;
  home_email: string;
  home_address: string;
  birthday: string;
  info: string;
  avatar_url: string;
  tags: string[];
  company: IMocoCompany;
  created_at: string;
  updated_at: string;
}
