import chalk from 'chalk';

import { startTime } from './performance';
import { page, waitAfterClick, getText, waitUntilLoaded, closeBrowser } from './browser';
import { getStorage, saveStorage } from './storage';
import { username, password, infinite } from './arguments';
import { logTask, logSuccess, logFailure, logNewline } from './logger';

const storage = await getStorage();

const pageRedirected = logTask('Redirecting to https://instaling.pl/teacher.php');
await page.goto('https://instaling.pl/teacher.php');
pageRedirected();

await page.click('.fc-cta-consent');

const userLogged = logTask(`Logging as ${username}`);
await page.type('#log_email', username);
await page.type('#log_password', password);
await waitAfterClick('button[type=submit]');
userLogged();

logSuccess(`Successfully logged as ${username}`);

const url = new URL(page.url());
const studentId = url.searchParams.get('student_id');

await page.goto(`https://instaling.pl/ling2/html_app/app.php?child_id=${studentId}`);

await waitUntilLoaded();

const startingSession = await page.$eval(
    '#start_session_page',
    element => window.getComputedStyle(element).display != 'none',
);

logSuccess(
    `${startingSession ? 'Starting new' : 'Continuing'} session with student_id ${studentId}`,
);

if (startingSession) {
    await page.click('#start_session_button');
} else {
    await page.click('#continue_session_button');
}

const handleAnnoyingPopup = async (): Promise<void> => {
    const annoyingPopupShown = await page.$eval(
        '#new_word_form',
        element => window.getComputedStyle(element).display != 'none',
    );

    if (!annoyingPopupShown) {
        return;
    }

    await page.click('#know_new');
    await page.click('#skip');

    await waitUntilLoaded();

    await handleAnnoyingPopup();
};

logNewline();

const firstTryAnswers = new Set<string>();
const totalAnswers = new Set<string>();

while (true) {
    await waitUntilLoaded();

    await handleAnnoyingPopup();

    const finished = await page.$eval(
        '#finish_page',
        element => window.getComputedStyle(element).display != 'none',
    );

    if (finished) {
        if (!infinite) break;

        await saveStorage(storage);

        await waitAfterClick('#return_mainpage');

        await page.goto(
            `https://instaling.pl/ling2/html_app/app.php?child_id=${studentId}`,
        );

        await waitUntilLoaded();

        const startingSession = await page.$eval(
            '#start_session_page',
            element => window.getComputedStyle(element).display != 'none',
        );

        logSuccess(
            `${startingSession ? 'Starting new' : 'Continuing'} session with student_id ${studentId}`,
        );

        if (startingSession) {
            await page.click('#start_session_button');
        } else {
            await page.click('#continue_session_button');
        }

        logNewline();

        continue;
    }

    const translation = await getText('.translation');
    const sentence = await getText('.usage_example');
    const record = storage[sentence];

    if (record) {
        logSuccess(
            `${chalk.green('Found')} in storage "${sentence}" => "${record.answer}"`,
        );

        if (!totalAnswers.has(record.answer)) {
            firstTryAnswers.add(record.answer);
        }
        totalAnswers.add(record.answer);

        await page.type('#answer', record.answer);
    }

    await page.click('#check');

    await waitUntilLoaded();

    if (!record) {
        const correct = await getText('#word');

        logFailure(`${chalk.red('Not found')} in storage "${sentence}" => "${correct}"`);
        storage[sentence] = { answer: correct, translation };
        totalAnswers.add(correct);
    }

    await page.click('#nextword');
}

logNewline();

logSuccess(
    `Session completed - ${totalAnswers.size} first try / ${firstTryAnswers.size} total`,
);

await saveStorage(storage);

await closeBrowser();

const durationSeconds = Math.round((performance.now() - startTime) / 10) / 100;
logSuccess(`Script took: ${durationSeconds}s`);
