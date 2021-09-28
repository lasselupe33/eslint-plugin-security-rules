import { COMMENT_BOILERPLATE_SIZE } from "../constants";
export function isCommentOverflowing(value, { maxLength, whitespaceSize }) {
    return (value.trim().split(" ").length > 1 &&
        value.length + whitespaceSize + COMMENT_BOILERPLATE_SIZE > maxLength);
}
//# sourceMappingURL=isCommentOverflowing.js.map