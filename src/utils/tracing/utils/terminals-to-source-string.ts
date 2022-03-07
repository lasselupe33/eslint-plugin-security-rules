import {
  isConstantTerminalNode,
  isImportTerminalNode,
  isNodeTerminalNode,
  isUnresolvedTerminalNode,
  TerminalNode,
} from "../types/nodes";

export function terminalsToSourceString(terminals: TerminalNode[]): string {
  return terminals
    .map((terminal) => {
      if (isConstantTerminalNode(terminal)) {
        return terminal.value;
      } else if (isNodeTerminalNode(terminal)) {
        return `\${${terminal.astNode.type}}`;
      } else if (isImportTerminalNode(terminal)) {
        return `${terminal.imported}(${terminal.source})`;
      } else if (isUnresolvedTerminalNode(terminal)) {
        return `__${terminal.reason}__`;
      }
    })
    .join("");
}
