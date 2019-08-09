export interface IComment extends ICommentTemplate {
  id: string;
  manual: boolean;
  user: ICommentUser;
  created_at: string;
  updated_at: string;
}

export interface ICommentTemplate {
  commentable_id: string;
  commentable_type: COMMENTABLE_TYPE;
  text: string;
}

export enum COMMENTABLE_TYPE {
  USER = "User",
  DEAL = "Deal",
  OFFER = "Offer",
  OfferConfirmation = "OfferConfirmation",
  CUSTOMER = "Customer",
  PROJECT = "Project",
  INVOICE = "Invoice",
  CONTACT = "Contact"
}

export interface ICommentUser {
  id: string;
  firstname: string;
  lastname: string;
}
