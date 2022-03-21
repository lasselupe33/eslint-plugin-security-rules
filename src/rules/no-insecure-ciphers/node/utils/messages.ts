export enum MessageIds {
  INSECURE_CIPHER = "insecure-cipher",
  NOT_RECOMMENDED_CIPHER = "not-recommended-cipher",
  SAFE_ALGORITHM_FIX = "safe-algorithm-fix",
}

export const errorMessages: Record<MessageIds, string> = {
  [MessageIds.INSECURE_CIPHER]:
    "The cipher algorithm is insecure and should not be used.",
  [MessageIds.NOT_RECOMMENDED_CIPHER]:
    "The cipher algorithm is not recommended as safer alternatives exist. Use these instead.",
  [MessageIds.SAFE_ALGORITHM_FIX]: "Replace algorithm with AES-256-CBC",
};
