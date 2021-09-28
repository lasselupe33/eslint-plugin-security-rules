import { isCommentOnOwnLine } from "./isCommentOnOwnLine";
import { isCommentOverflowing } from "./isCommentOverflowing";
import { isSpecialComment } from "./isSpecialComment";
export function captureRelatedComments(sourceCode, comments, startIndex, { maxLength, whitespaceSize }) {
    let comment = comments[startIndex];
    if (!comment) {
        return;
    }
    for (let i = startIndex + 1; i < comments.length; i++) {
        const nextComment = comments[i];
        if (!nextComment ||
            nextComment.value.trim() === "" ||
            nextComment.loc?.start.line !== (comment.loc?.end.line ?? 0) + 1 ||
            isSpecialComment(nextComment) ||
            !isCommentOnOwnLine(sourceCode, nextComment)) {
            break;
        }
        comment = mergeComments(comment, nextComment);
        if (!isCommentOverflowing(nextComment.value + (comments[i + 1]?.value.trim().split(" ")[0] ?? ""), {
            maxLength,
            whitespaceSize,
        })) {
            break;
        }
    }
    return comment;
}
function mergeComments(a, b) {
    const newComment = { ...a };
    newComment.value = `${a.value.trim()} ${b.value.trim()}`;
    if (newComment.loc && b.loc) {
        newComment.loc.end = b.loc.end;
    }
    if (newComment.range && b.range) {
        newComment.range[1] = b.range[1];
    }
    return newComment;
}
//# sourceMappingURL=captureRelatedComments.js.map