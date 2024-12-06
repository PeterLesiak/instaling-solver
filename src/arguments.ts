import type { SupportedBrowser } from 'puppeteer';
import { configDotenv } from 'dotenv';
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
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

const passwordOrEnv = parsedArgs.positionals[1];
assert(passwordOrEnv, 'Password is required as second positional argument');

const envPath = resolve(fileURLToPath(import.meta.url), '../..', passwordOrEnv);
configDotenv({ path: envPath });

export const password = process.env[username] ?? passwordOrEnv;

export const browser = parsedArgs.values.browser as SupportedBrowser;

export const headless = parsedArgs.values.headless;
