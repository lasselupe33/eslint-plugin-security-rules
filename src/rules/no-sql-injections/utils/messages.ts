export enum MessageIds {
  VULNERABLE_QUERY = "vulnerable-query",
  PARAMTERIZED_FIX_VALUES = "parameterized-fix-values",
  PARAMTERIZED_FIX_IDENTIFIERS = "parameterized-fix-identifiers",
  ESCAPE_FIX_VALUES = "escape-fix-values",
  ESCAPE_FIX_IDENTIFIERS = "escape-fix-identifiers",
}

export const errorMessages: Record<MessageIds, string> = {
  [MessageIds.VULNERABLE_QUERY]: "The query is vulnerable to SQL injections",
  [MessageIds.PARAMTERIZED_FIX_VALUES]:
    "(R) Replace argument with value placeholders",
  [MessageIds.PARAMTERIZED_FIX_IDENTIFIERS]:
    "Replace argument with identifier placeholders",
  [MessageIds.ESCAPE_FIX_VALUES]: "Escape as query values",
  [MessageIds.ESCAPE_FIX_IDENTIFIERS]: "Escape as query identifiers",
};
