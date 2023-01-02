"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const pq = require("proxyquire");
const proxyquire = pq.noCallThru().noPreserveCache();
const mock = (packages) => {
    const paths = {};
    for (const [pkg, locales] of Object.entries(packages)) {
        for (const [locale, messages] of Object.entries(locales)) {
            const msgs = {};
            if (messages) {
                for (const [name, value] of Object.entries(messages)) {
                    msgs[name] = { message: value };
                }
            }
            paths[`${pkg}/_locales/${locale}/messages.json`] = messages && msgs;
        }
    }
    return proxyquire('../src/get-message', paths).getMessage;
};
(0, ava_1.default)('It gets a string for the provided key in the specified locale', (t) => {
    const getMessage = mock({
        [__dirname]: {
            en: { foo: 'color' },
            'en-gb': { foo: 'colour' }
        }
    });
    const message = getMessage('foo', __dirname, { language: 'en-gb' });
    t.is(message, 'colour');
});
(0, ava_1.default)('It defaults to "en" if no locale is specified', (t) => {
    const getMessage = mock({
        [__dirname]: {
            en: { foo: 'color' },
            'en-gb': { foo: 'colour' }
        }
    });
    const message = getMessage('foo', __dirname);
    t.is(message, 'color');
});
(0, ava_1.default)('It falls back to the base locale if the specified dialect is not avaiable', (t) => {
    const getMessage = mock({
        [__dirname]: {
            es: { foo: 'bar (es)' },
            'es-es': { foo: 'bar (es-es)' }
        }
    });
    const message = getMessage('foo', __dirname, { language: 'es-mx' });
    t.is(message, 'bar (es)');
});
(0, ava_1.default)('It falls back to "en" if the specified locale is not available', (t) => {
    const getMessage = mock({
        [__dirname]: {
            en: { foo: 'bar (en)' },
            'en-us': { foo: 'bar (en-us)' }
        }
    });
    const message = getMessage('foo', __dirname, { language: 'foo-bar' });
    t.is(message, 'bar (en)');
});
(0, ava_1.default)('It throws if no localization file is available', (t) => {
    const getMessage = mock({ [__dirname]: {} });
    t.throws(() => {
        getMessage('foo', __dirname, { language: 'foo-bar' });
    });
});
(0, ava_1.default)('It returns the key if no localization entry is available', (t) => {
    const getMessage = mock({ [__dirname]: { en: { foo: 'bar (en)' } } });
    const message = getMessage('foobar', __dirname);
    t.is(message, 'foobar');
});
(0, ava_1.default)('It supports substitutions', (t) => {
    const getMessage = mock({ [__dirname]: { en: { foo: 'bar $1' } } });
    const message = getMessage('foo', __dirname, { substitutions: ['baz'] });
    t.is(message, 'bar baz');
});
