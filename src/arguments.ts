import type { SupportedBrowser } from 'puppeteer';
import { parseArgs } from 'node:util';
import assert from 'node:assert';

const parsedArgs = parseArgs({
    allowPositionals: true,
    options: {
        browser: {
            type: 'string',
            short: 'b',
            default: 'chrome',
        },

        headless: {
            type: 'boolean',
            short: 'h',
            default: false,
        },
    },
});

export const username = parsedArgs.positionals[0];
assert(username, 'Username is required as first positional argument');

export const password = parsedArgs.positionals[1];
assert(password, 'Password is required as second positional argument');

export const browser = parsedArgs.values.browser as SupportedBrowser;

export const headless = parsedArgs.values.headless;
