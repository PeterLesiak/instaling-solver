import { launch, type HTTPResponse, type JSHandle } from 'puppeteer';

import { browser as browserType, headless } from './arguments';
import { logTask } from './logger';

const browserCreated = logTask(`Creating new ${browserType} browser`);

export const browser = await launch({
    browser: browserType,
    headless,
});

browserCreated();

export const [page] = await browser.pages();

export const waitForClick = async (
    selector: string,
): Promise<[HTTPResponse | null, void]> => {
    return Promise.all([page.waitForNavigation(), page.click(selector)]);
};

export const getText = async (selector: string): Promise<string> => {
    return await page.$eval(selector, element => element.textContent!);
};

export const waitUntilLoaded = async (): Promise<JSHandle<false> | JSHandle<true>> => {
    return await page.waitForFunction(() => {
        const element = document.querySelector('#loading')!;

        return window.getComputedStyle(element).display == 'none';
    });
};

export const closeBrowser = async (): Promise<void> => {
    const browserClosed = logTask('Closing the browser');

    await browser.close();

    browserClosed();
};
