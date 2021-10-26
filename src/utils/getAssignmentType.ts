import { Scope } from "eslint";
import { Identifier, VariableDeclarator } from "estree";

export function getAssignmentType(
  scope: Scope.Scope,
  variable: Scope.Variable
): "import" | "parameter" | "function" | "variable" | undefined {
  if (
    (variable.defs[0]?.node as VariableDeclarator).init?.type ===
    "CallExpression"
  ) {
    return "function";
  }

  if ((variable.defs[0]?.node.init as Identifier)?.type === "Identifier") {
    return "variable";
  }

  if (variable?.defs[0]?.type === "Parameter") {
    return "parameter";
  }

  // Hardcoded to assume function - i.e. get function name -
  // check if it is exist as a global import
  const importName = variable.defs[0]?.node?.init?.argument?.callee?.name;
  const importRef = scope.references.find(
    (it) => it.identifier.name === importName
  );

  if (importRef) {
    return "import";
  }
}
