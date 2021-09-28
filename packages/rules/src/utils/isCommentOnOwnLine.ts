import type { SourceCode } from "eslint";
import type { Comment } from "estree";

export function isCommentOnOwnLine(
  sourceCode: SourceCode,
  comment: Comment
): boolean {
  const previousToken = sourceCode.getTokenBefore(comment);

  return previousToken?.loc.end.line !== comment.loc?.start.line;
}
