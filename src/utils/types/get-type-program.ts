import {
  TSNode,
  TSToken,
  TSESTree,
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
  get(key: TSESTree.Node): TSNode | TSToken;
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

const typeProgramCache = new WeakMap<
  RuleContext<string, readonly unknown[]>,
  TypeProgram
>();

export function getTypeProgram(
  context: RuleContext<string, readonly unknown[]>
): TypeProgram {
  if (typeProgramCache.has(context)) {
    return typeProgramCache.get(context);
  }

  try {
    const parserServices = getParserServices(context);

    const typeProgram = {
      parserServices,
      checker: parserServices.program.getTypeChecker(),
    };

    typeProgramCache.set(context, typeProgram);
    return typeProgram;
  } catch (err) {
    // In case we are unable to resolve the parserServices we must assume that
    // TypeScript is not available in the current context. Hence we must
    // fallback to a simpler from of parsing
    return undefined;
  }
}
