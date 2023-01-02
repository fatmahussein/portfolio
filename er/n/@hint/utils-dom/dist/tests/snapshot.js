"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const jsdom_1 = require("jsdom");
const src_1 = require("../src");
const defaultHTML = `<!doctype html>
<html>
    <body>
        <h1>Title</h1>
        <p>Content</p>
    </body>
</html>`;
const createSnapshot = (html = defaultHTML, location = false) => {
    const dom = new jsdom_1.JSDOM(html, {
        includeNodeLocations: location,
        runScripts: 'outside-only'
    });
    dom.window.eval(`(${src_1.createHelpers})()`);
    if (location) {
        dom.window.__webhint.nodeLocation = (node) => {
            return dom.nodeLocation(node);
        };
    }
    return [dom.window.eval('__webhint.snapshotDocument()'), dom];
};
(0, ava_1.default)('Create a snapshot', (t) => {
    const [snapshot] = createSnapshot();
    t.is(snapshot.type, 'root');
});
(0, ava_1.default)('Snapshot <template> element', (t) => {
    const [snapshot] = createSnapshot(`
        <!doctype html>
        <html>
            <head>
                <template><div>1</div><div>2</div></template>
            </head>
        </html>
    `);
    const html = snapshot.children.filter((c) => {
        return c.type === 'tag' && c.name === 'html';
    })[0];
    const head = html && html.children.filter((c) => {
        return c.type === 'tag' && c.name === 'head';
    })[0];
    const template = head && head.children.filter((c) => {
        return c.type === 'tag' && c.name === 'template';
    })[0];
    const fragment = template && template.children[0];
    t.is(template.children.length, 1);
    t.is(fragment && fragment.type, 'root');
    t.is(fragment && fragment.children.length, 2);
});
(0, ava_1.default)('Create a snapshot with location', (t) => {
    const [snapshot] = createSnapshot(defaultHTML, true);
    const html = snapshot.children.filter((c) => {
        return c.type === 'tag' && c.name === 'html';
    })[0];
    const location = html.sourceCodeLocation;
    t.is(location && location.startLine, 2);
    t.is(location && location.startCol, 1);
});
(0, ava_1.default)('Restore references', (t) => {
    const [snapshot] = createSnapshot();
    (0, src_1.restoreReferences)(snapshot);
    t.is(snapshot.children[0].parent, snapshot);
    t.is(snapshot.children[0].prev, null);
    t.is(snapshot.children[0].next, snapshot.children[1]);
    t.is(snapshot.children[1].prev, snapshot.children[0]);
    t.is(snapshot.children[snapshot.children.length - 1].next, null);
});
(0, ava_1.default)('Find an element', (t) => {
    const [snapshot, dom] = createSnapshot();
    (0, src_1.restoreReferences)(snapshot);
    const html = snapshot.children.filter((c) => {
        return c.type === 'tag' && c.name === 'html';
    })[0];
    const body = html.children.filter((c) => {
        return c.type === 'tag' && c.name === 'body';
    })[0];
    const h1 = body.children.filter((c) => {
        return c.type === 'tag' && c.name === 'h1';
    })[0];
    const targetH1 = dom.window.eval('document.querySelector("h1")');
    const foundH1 = dom.window.eval(`__webhint.findNode(${h1.id})`);
    t.is(foundH1, targetH1);
});
