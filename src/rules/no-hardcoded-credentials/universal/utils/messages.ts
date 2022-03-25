export enum MessageIds {
  HARDCODED_CREDENTIAL = "hardcoded-credential",
}

export const errorMessages: Record<MessageIds, string> = {
  [MessageIds.HARDCODED_CREDENTIAL]:
    "Credentials shouldn't be hardcoded. Use process env instead or a secret manager.",
};
