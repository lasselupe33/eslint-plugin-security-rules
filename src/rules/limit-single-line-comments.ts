import type { Rule } from "eslint";
import { Comment } from "estree";

import { COMMENT_BOILERPLATE_SIZE } from "../constants";
import { captureRelatedComments } from "../utils/captureRelatedComments";
import { isCommentOnOwnLine } from "../utils/isCommentOnOwnLine";
import { isCommentOverflowing } from "../utils/isCommentOverflowing";
import { isSpecialComment } from "../utils/isSpecialComment";

export const limitSingleLineCommentsRule: Rule.RuleModule = {
  meta: {
    type: "layout",
    fixable: "whitespace",
  },
  create: (context: Rule.RuleContext): Rule.RuleListener => {
    const maxLength = (context.options[0] as number) ?? 60;

    const sourceCode = context.getSourceCode();
    const comments = sourceCode.getAllComments();

    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      const whitespaceSize = comment?.loc?.start.column ?? 0;

      if (
        comment &&
        comment.loc &&
        comment.type === "Line" &&
        isCommentOverflowing(comment.value, { maxLength, whitespaceSize }) &&
        !isSpecialComment(comment) &&
        isCommentOnOwnLine(sourceCode, comment)
      ) {
        context.report({
          loc: comment.loc,
          message: `Comments may not exceed ${maxLength} characters`,
          fix: (fixer): Rule.Fix => {
            const fixableComment = captureRelatedComments(
              sourceCode,
              comments,
              i,
              { whitespaceSize, maxLength }
            );

            if (!fixableComment?.range) {
              throw new Error(
                "<eslint-plugin-comment-length/limit-single-line-comments>: unable to fix incompatible comment"
              );
            }

            const newValue = fixCommentLength(fixableComment, {
              maxLength,
              whitespaceSize,
            });

            return fixer.replaceTextRange(fixableComment.range, newValue);
          },
        });
      }
    }

    return {};
  },
};

function fixCommentLength(
  comment: Comment,
  { maxLength, whitespaceSize }: { maxLength: number; whitespaceSize: number }
): string {
  const whitespace = " ".repeat(whitespaceSize);
  const lineStartSize = whitespaceSize + COMMENT_BOILERPLATE_SIZE;
  const words = comment.value.trim().split(" ");

  const newValue = words.reduce(
    (acc, curr) => {
      const lengthIfAdded = acc.currentLineLength + curr.length + 1;
      const splitToNewline = lengthIfAdded > maxLength;

      if (splitToNewline) {
        return {
          value: `${acc.value}\n${whitespace}// ${curr}`,
          currentLineLength: lineStartSize,
        };
      } else {
        return {
          value: `${acc.value} ${curr}`,
          currentLineLength: lengthIfAdded,
        };
      }
    },
    { value: "//", currentLineLength: lineStartSize }
  );

  return newValue.value;
}
