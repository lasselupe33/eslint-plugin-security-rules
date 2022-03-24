export enum MessageIds {
  INSECURE_CIPHER = "insecure-cipher",
  SAFE_ALGORITHM_FIX_128 = "safe-algorithm-fix-128",
  SAFE_ALGORITHM_FIX_192 = "safe-algorithm-fix-192",
  SAFE_ALGORITHM_FIX_256 = "safe-algorithm-fix-256",
}

export const errorMessages: Record<MessageIds, string> = {
  [MessageIds.INSECURE_CIPHER]:
    "The cipher algorithm is insecure and should not be used.",
  [MessageIds.SAFE_ALGORITHM_FIX_128]:
    "Replace {{alg}} with AES-128-GCM (Requires key of size 16 bytes)",
  [MessageIds.SAFE_ALGORITHM_FIX_192]:
    "Replace {{alg}} with AES-192-GCM (Requires key of size 24 bytes)",
  [MessageIds.SAFE_ALGORITHM_FIX_256]:
    "Replace {{alg}} with AES-256-GCM (Requires key of size 32 bytes)",
};
