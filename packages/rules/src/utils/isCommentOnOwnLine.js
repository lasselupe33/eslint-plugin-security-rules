export function isCommentOnOwnLine(sourceCode, comment) {
    const previousToken = sourceCode.getTokenBefore(comment);
    return previousToken?.loc.end.line !== comment.loc?.start.line;
}
//# sourceMappingURL=isCommentOnOwnLine.js.map