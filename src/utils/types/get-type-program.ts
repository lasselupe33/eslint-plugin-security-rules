import { Node } from "@typescript-eslint/types/dist/ast-spec";
import {
  TSNode,
  TSToken,
} from "@typescript-eslint/typescript-estree/dist/ts-estree";
import { getParserServices } from "@typescript-eslint/utils/dist/eslint-utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";
import { TypeChecker } from "typescript/lib/typescript";

/**
 * The performance of the typings inside @typescript-eslint are very poor.
 * Hence we manually type a subset in order to greatly improve editor
 * performance.
 */
interface ParserWeakMapESTreeToTSNode {
  get(key: Node): TSNode | TSToken;
  has(key: unknown): boolean;
}

type LimitedParserServices = {
  esTreeNodeToTSNodeMap: ParserWeakMapESTreeToTSNode;
  hasFullTypeInformation: boolean;
};

export type TypeProgram =
  | {
      parserServices: LimitedParserServices;
      checker: TypeChecker;
    }
  | undefined;

export function getTypeProgram(
  context: RuleContext<string, unknown[]>
): TypeProgram {
  try {
    const parserServices = getParserServices(context);

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
