"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postcss = require('postcss');
const fs = require("fs");
const path = require("path");
const ava_1 = require("ava");
const get_css_code_snippet_1 = require("../src/get-css-code-snippet");
const safe = require('postcss-safe-parser');
const css = fs.readFileSync(path.join(__dirname, 'fixtures', 'report.css'), 'utf-8');
const test = ava_1.default;
test.before(async (t) => {
    const parsedCSS = await postcss().process(css, { from: 'report.css', parser: safe });
    t.context.ast = parsedCSS.root;
});
test(`getCSSCodeSnippet - If node type is 'atrule' with no children, it should print the atrule without braces.`, (t) => {
    const node = t.context.ast.nodes[0];
    const expected = `@charset "UTF-8";`;
    t.is((0, get_css_code_snippet_1.getCSSCodeSnippet)(node), expected);
});
test(`getCSSCodeSnippet - If node type is 'comment' it should print only the comment.`, (t) => {
    const node = t.context.ast.nodes[1];
    const expected = '/* comment */';
    t.is((0, get_css_code_snippet_1.getCSSCodeSnippet)(node), expected);
});
test(`getCSSCodeSnippet - If node type is 'rule' it should print only the selector.`, (t) => {
    const node = t.context.ast.nodes[2];
    const expected = '.selector { }';
    t.is((0, get_css_code_snippet_1.getCSSCodeSnippet)(node), expected);
});
test(`getCSSCodeSnippet - If node type is 'decl' and the first item in the rule, it should print the rule and only the decl.`, (t) => {
    const ruleNode = t.context.ast.nodes[2];
    const node = ruleNode.nodes[0];
    const expected = `.selector {
    color: #000;
}`;
    t.is((0, get_css_code_snippet_1.getCSSCodeSnippet)(node), expected);
});
test(`getCSSCodeSnippet - If node type is 'decl' and the second item in the rule, it should print the rule and only the decl.`, (t) => {
    const ruleNode = t.context.ast.nodes[2];
    const node = ruleNode.nodes[1];
    const expected = `.selector {
    font-size: 1rem;
}`;
    t.is((0, get_css_code_snippet_1.getCSSCodeSnippet)(node), expected);
});
test(`getCSSCodeSnippet - If node type is 'atrule', it should print the atrule.`, (t) => {
    const node = t.context.ast.nodes[3];
    const expected = `@keyframes keyname { }`;
    t.is((0, get_css_code_snippet_1.getCSSCodeSnippet)(node), expected);
});
test(`getCSSCodeSnippet - If node type is 'rule' and it is inside an atrule, it should print the atrule and the rule.`, (t) => {
    const atRuleNode = t.context.ast.nodes[3];
    const node = atRuleNode.nodes[0];
    const expected = `@keyframes keyname {
    0% { }
}`;
    t.is((0, get_css_code_snippet_1.getCSSCodeSnippet)(node), expected);
});
test(`getCSSCodeSnippet - If node type is 'comment' and it is inside a rule and an atrule, it should print the atrule, the rule and the comment.`, (t) => {
    const atRuleNode = t.context.ast.nodes[3];
    const ruleNode = atRuleNode.nodes[0];
    const node = ruleNode.nodes[0];
    const expected = `@keyframes keyname {
    0% {
        /* keyframe comment */
    }
}`;
    t.is((0, get_css_code_snippet_1.getCSSCodeSnippet)(node), expected);
});
test(`getCSSCodeSnippet - If node type is 'decl' and it is inside a rule and an atrule, it should print the atrule, the rule and the decl.`, (t) => {
    const atRuleNode = t.context.ast.nodes[3];
    const ruleNode = atRuleNode.nodes[0];
    const node = ruleNode.nodes[1];
    const expected = `@keyframes keyname {
    0% {
        width: 0;
    }
}`;
    t.is((0, get_css_code_snippet_1.getCSSCodeSnippet)(node), expected);
});
test(`getCSSCodeSnippet - If node type is 'rule' with multiple selectors it should print each selector on its own line.`, (t) => {
    const node = t.context.ast.nodes[4];
    const expected = '.selector1,\n.selector2 { }';
    t.is((0, get_css_code_snippet_1.getCSSCodeSnippet)(node), expected);
});
test(`getCSSCodeSnippet - If node type is 'decl' and it is inside a rule, atrule, and another atrule, all should print with correct indentation.`, (t) => {
    const atRuleNode = t.context.ast.nodes[5];
    const nestedAtRuleNode = atRuleNode.nodes[0];
    const ruleNode = nestedAtRuleNode.nodes[0];
    const node = ruleNode.nodes[0];
    const expected = `@media all and (min-width:29.9385em) {
    @supports (display:flex) {
        .document-head .center .document-actions {
            flex-grow: 9999;
        }
    }
}`;
    t.is((0, get_css_code_snippet_1.getCSSCodeSnippet)(node), expected);
});
test(`getFullCSSCodeSnippet - If node type is 'atrule' with no children, it should print the atrule without braces.`, (t) => {
    const node = t.context.ast.nodes[0];
    const expected = `@charset "UTF-8";`;
    t.is((0, get_css_code_snippet_1.getFullCSSCodeSnippet)(node), expected);
});
test(`getFullCSSCodeSnippet - If node type is 'comment' it should print only the comment.`, (t) => {
    const node = t.context.ast.nodes[1];
    const expected = '/* comment */';
    t.is((0, get_css_code_snippet_1.getFullCSSCodeSnippet)(node), expected);
});
test(`getFullCSSCodeSnippet - If node type is 'rule' it should print the selector and its children.`, (t) => {
    const node = t.context.ast.nodes[2];
    const expected = `.selector {
    color: #000;
    font-size: 1rem;
}`;
    t.is((0, get_css_code_snippet_1.getFullCSSCodeSnippet)(node), expected);
});
test(`getFullCSSCodeSnippet - If node type is 'decl' and the first item in the rule, it should print the rule and all the decls.`, (t) => {
    const ruleNode = t.context.ast.nodes[2];
    const node = ruleNode.nodes[0];
    const expected = `.selector {
    color: #000;
    font-size: 1rem;
}`;
    t.is((0, get_css_code_snippet_1.getFullCSSCodeSnippet)(node), expected);
});
test(`getFullCSSCodeSnippet - If node type is 'decl' and the second item in the rule, it should print the rule and all the decls.`, (t) => {
    const ruleNode = t.context.ast.nodes[2];
    const node = ruleNode.nodes[1];
    const expected = `.selector {
    color: #000;
    font-size: 1rem;
}`;
    t.is((0, get_css_code_snippet_1.getFullCSSCodeSnippet)(node), expected);
});
test(`getFullCSSCodeSnippet - If node type is 'atrule', it should print the atrule and all the children.`, (t) => {
    const node = t.context.ast.nodes[3];
    const expected = `@keyframes keyname {
    0% {
        /* keyframe comment */
        width: 0;
        height: 0;
    }
}`;
    t.is((0, get_css_code_snippet_1.getFullCSSCodeSnippet)(node), expected);
});
test(`getFullCSSCodeSnippet - If node type is 'rule' and it is inside an atrule, it should print the atrule all the children`, (t) => {
    const atRuleNode = t.context.ast.nodes[3];
    const node = atRuleNode.nodes[0];
    const expected = `@keyframes keyname {
    0% {
        /* keyframe comment */
        width: 0;
        height: 0;
    }
}`;
    t.is((0, get_css_code_snippet_1.getFullCSSCodeSnippet)(node), expected);
});
test(`getFullCSSCodeSnippet - If node type is 'comment' and it is inside a rule and an atrule, it should print the atrule, the rule, the comment and all the decls.`, (t) => {
    const atRuleNode = t.context.ast.nodes[3];
    const ruleNode = atRuleNode.nodes[0];
    const node = ruleNode.nodes[0];
    const expected = `@keyframes keyname {
    0% {
        /* keyframe comment */
        width: 0;
        height: 0;
    }
}`;
    t.is((0, get_css_code_snippet_1.getFullCSSCodeSnippet)(node), expected);
});
test(`getFullCSSCodeSnippet - If node type is 'decl' and it is inside a rule and an atrule, it should print the atrule, the rule, the comment and all the decls.`, (t) => {
    const atRuleNode = t.context.ast.nodes[3];
    const ruleNode = atRuleNode.nodes[0];
    const node = ruleNode.nodes[1];
    const expected = `@keyframes keyname {
    0% {
        /* keyframe comment */
        width: 0;
        height: 0;
    }
}`;
    t.is((0, get_css_code_snippet_1.getFullCSSCodeSnippet)(node), expected);
});
test(`getFullCSSCodeSnippet - If node type is 'rule' with multiple selectors it should print each selector on its own line.`, (t) => {
    const node = t.context.ast.nodes[4];
    const expected = `.selector1,\n.selector2 {
    color: #000;
}`;
    t.is((0, get_css_code_snippet_1.getFullCSSCodeSnippet)(node), expected);
});
test(`getFullCSSCodeSnippet - If node type is 'decl', the first item and it is inside a rule, atrule, and another atrule, all should print with correct indentation.`, (t) => {
    const atRuleNode = t.context.ast.nodes[5];
    const nestedAtRuleNode = atRuleNode.nodes[0];
    const ruleNode = nestedAtRuleNode.nodes[0];
    const node = ruleNode.nodes[0];
    const expected = `@media all and (min-width:29.9385em) {
    @supports (display:flex) {
        .document-head .center .document-actions {
            flex-grow: 9999;
            flex-direction: column;
        }
    }
}`;
    t.is((0, get_css_code_snippet_1.getFullCSSCodeSnippet)(node), expected);
});
test(`getFullCSSCodeSnippet - If node type is 'decl', the second item and it is inside a rule, atrule, and another atrule, all should print with correct indentation.`, (t) => {
    const atRuleNode = t.context.ast.nodes[5];
    const nestedAtRuleNode = atRuleNode.nodes[0];
    const ruleNode = nestedAtRuleNode.nodes[0];
    const node = ruleNode.nodes[1];
    const expected = `@media all and (min-width:29.9385em) {
    @supports (display:flex) {
        .document-head .center .document-actions {
            flex-grow: 9999;
            flex-direction: column;
        }
    }
}`;
    t.is((0, get_css_code_snippet_1.getFullCSSCodeSnippet)(node), expected);
});
