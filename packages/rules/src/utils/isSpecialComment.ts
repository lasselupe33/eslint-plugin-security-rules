import { Comment } from "estree";

export function isSpecialComment(comment: Comment): boolean {
  return (
    comment.value.trim().startsWith("eslint-disable") ||
    comment.value.trim().startsWith("stylelint-disable") ||
    comment.value.trim().startsWith("tslint:disable") ||
    comment.value.trim().startsWith("eslint-enable") ||
    comment.value.trim().startsWith("stylelint-enable") ||
    comment.value.trim().startsWith("tslint:enable")
  );
}