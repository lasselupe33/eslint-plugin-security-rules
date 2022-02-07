import {
  TSESLint,
  ParserServices,
  ESLintUtils,
} from "@typescript-eslint/utils";
import type { TypeChecker } from "typescript/lib/typescript";

export type TypeProgram =
  | {
      parserServices: ParserServices;
      checker: TypeChecker;
    }
  | undefined;

export function getTypeProgram(
  context: TSESLint.RuleContext<string, unknown[]>
): TypeProgram {
  try {
    const parserServices = ESLintUtils.getParserServices(context);

    return {
      parserServices,
      checker: parserServices.program.getTypeChecker(),
    };
  } catch (err) {
    // In case we are unable to resolve the parserServices we must assume that
    // TypeScript is not available in the current context. Hence we must
    // fallback to a simpler from of parsing
    return undefined;
  }
}
