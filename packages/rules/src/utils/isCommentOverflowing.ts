import { COMMENT_BOILERPLATE_SIZE } from "../constants";

export function isCommentOverflowing(
  value: string,
  { maxLength, whitespaceSize }: { maxLength: number; whitespaceSize: number }
): boolean {
  return (
    value.trim().split(" ").length > 1 &&
    value.length + whitespaceSize + COMMENT_BOILERPLATE_SIZE > maxLength
  );
}
