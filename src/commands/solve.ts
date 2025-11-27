import puppeteer, { type KeyInput } from 'puppeteer';
import kleur from 'kleur';

import { simulateReactionTime, simulateTyping } from '~/inputSimulation';
import { setupAccountsConfig, setupOptionsConfig, setupStorageConfig } from '~/config';
import { logger } from '~/logger';
import { delay, randomInt, type Miliseconds } from '~/utils';

export const website = {
  loginUrl: 'https://instaling.pl/teacher.php?page=login',
  sessionUrl: 'https://instaling.pl/ling2/html_app/app.php?child_id=',
  cookiesModalSelector: '.fc-consent-root',
  loginInputSelector: '[name=log_email]',
  passwordInputSelector: '[name=log_password]',
  loginButtonSelector: 'form button[type=submit]',
  loadingModalSelector: '#loading',
  closeNewWordModalSelector: '#know_new',
  closePossibleWordModalSelector: '#skip',
  startSessionButtonSelector: '#start_session_button',
  continueSessionButtonSelector: '#continue_session_button',
  finishModalSelector: '#finish_page',
  questionContainerSelector: '.usage_example',
  originalTranslationSelector: '.translation',
  answerInputSelector: '#answer',
  submitAnswerButtonSelector: '#check',
  correctAnswerSelector: '#word',
  nextQuestionButtonSelector: '#nextword',
};

export default async () => {
  const { accountsConfig } = await setupAccountsConfig();
  const { options } = await setupOptionsConfig();
  const { storageConfig } = await setupStorageConfig();

  const selectedAccount = await accountsConfig.chooseAccount();

  const browser = await puppeteer.launch({ headless: false });
  const [startingPage] = await browser.pages();
  const page = startingPage ?? (await browser.newPage());

  await page.goto(website.loginUrl);

  await hideCookiesModal();

  await simulateReactionTime(options.reactionTime);
  await page.focus(website.loginInputSelector);

  await simulateReactionTime(options.reactionTime);
  await typeIntoFocused(selectedAccount.username);

  await simulateReactionTime(options.reactionTime);
  await page.focus(website.passwordInputSelector);

  await simulateReactionTime(options.reactionTime);
  await typeIntoFocused(selectedAccount.password);

  await simulateReactionTime(options.reactionTime);
  await clickAndNavigate(website.loginButtonSelector);

  const studentId = new URL(page.url()).searchParams.get('student_id');

  if (!studentId) {
    await browser.close();

    logger.critical('Failed to retrieve get parameter "student_id" after login.');
  }

  const uniqueQuestionsStorage = new Set<string>();

  const sessionTracker = {
    totalQuestions: 0,
    uniqueQuestions: 0,
    firstTimeCorrect: 0,
    intentionalErrors: 0,
    learned: 0,
  };

  await page.goto(`${website.sessionUrl}${studentId}`);

  await waitUntilLoaded();
  await simulateReactionTime(options.reactionTime);

  logger.line();

  try {
    await page.click(website.startSessionButtonSelector);
    logger.info(`Starting new session with student_id = ${studentId}`);
  } catch {
    await page.click(website.continueSessionButtonSelector);
    logger.info(`Continuing existing session with student_id = ${studentId}`);
  }

  const safetyIterationLimit = 200;
  let safetyIterationIndex = 0;

  while (true) {
    if (++safetyIterationIndex > safetyIterationLimit) {
      logger.error(
        `Session while loop exceeded safety limit of ${safetyIterationLimit}, breaking from it.`,
      );
      break;
    }

    await waitUntilLoaded();

    const finished = await page.$eval(
      website.finishModalSelector,
      element => window.getComputedStyle(element).display !== 'none',
    );

    if (finished) break;

    const { question, state } = await solveQuestion();

    sessionTracker.totalQuestions += 1;

    if (!uniqueQuestionsStorage.has(question)) {
      if (state === 'correct') {
        sessionTracker.firstTimeCorrect += 1;
      }

      sessionTracker.uniqueQuestions += 1;
      uniqueQuestionsStorage.add(question);
    }

    if (state === 'intentionalError') {
      sessionTracker.intentionalErrors += 1;
    }

    if (state === 'learned') {
      sessionTracker.learned += 1;
    }
  }

  await storageConfig.syncWithStore('write');

  await browser.close();

  const maxLength = Object.values(sessionTracker)
    .map(v => v.toString().length)
    .reduce((max, v) => (v > max ? v : max));

  logger.printBox(
    [
      `Total questions:      ${kleur.yellow(sessionTracker.totalQuestions.toString().padStart(maxLength))}`,
      `Unique questions:     ${kleur.yellow(sessionTracker.uniqueQuestions.toString().padStart(maxLength))}`,
      `First time correct:   ${kleur.yellow(sessionTracker.firstTimeCorrect.toString().padStart(maxLength))}`,
      `Intentional errors:   ${kleur.yellow(sessionTracker.intentionalErrors.toString().padStart(maxLength))}`,
      `Learned answers:      ${kleur.yellow(sessionTracker.learned.toString().padStart(maxLength))}`,
    ],
    {
      title: 'Done - Summary',
      borderColor: 'green',
      borderStyle: 'single',
      textAlignment: 'left',
      padding: 2,
    },
  );

  async function solveQuestion(): Promise<{
    question: string;
    translation: string;
    answer: string;
    correctAnswer: string;
    state: 'correct' | 'intentionalError' | 'learned';
  }> {
    const question = await getText(website.questionContainerSelector);
    const translation = await getText(website.originalTranslationSelector);

    let answer = storageConfig.findInStore(question, translation)?.answer;
    let isIntentionalError = false;

    logger.writeInThisLine(
      `${kleur.cyan(translation)} ➡ ${answer ? kleur.dim(answer) : kleur.yellow('Not in storage')}`,
    );

    if (answer) {
      process.stdout.moveCursor(-answer.length, 0);
    }

    if (options.errorRate > Math.random()) {
      const answers = Object.values(storageConfig.store ?? []).filter(
        a => a.answer !== answer,
      );
      answer = answers[randomInt(0, answers.length)]?.answer;
      isIntentionalError = true;
    }

    await simulateReactionTime(options.reactionTime);
    await page.focus(website.answerInputSelector);

    if (answer) {
      await simulateReactionTime(options.reactionTime);

      let output = '';

      await typeIntoFocused(answer, ({ key }) => {
        if (key === 'Backspace') {
          output = output.substring(0, output.length - 1);
        } else {
          output += key;
        }

        logger.writeInThisLine(
          `${kleur.cyan(translation)} ➡ ${isIntentionalError ? kleur.red(output) : kleur.green(output)}`,
        );
        logger.writeInThisLine(kleur.dim(answer.substring(output.length)), false);
        process.stdout.moveCursor(output.length - answer.length, 0);
      });

      console.log();
    }

    await simulateReactionTime(options.reactionTime);
    await page.click(website.submitAnswerButtonSelector);

    await waitUntilLoaded();

    const correctAnswer = await getText(website.correctAnswerSelector);

    if (!answer) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      console.log(
        `${kleur.cyan(translation)} ➡ ${kleur.yellow('Not in storage')} [${kleur.green(correctAnswer)}]`,
      );
    }

    storageConfig.updateStore(question, translation, correctAnswer);

    await simulateReactionTime(options.reactionTime);
    await page.click(website.nextQuestionButtonSelector);

    return {
      question,
      translation,
      answer: answer ?? '',
      correctAnswer,
      state: answer ? (isIntentionalError ? 'intentionalError' : 'correct') : 'learned',
    };
  }

  async function typeIntoFocused(
    input: string,
    afterKeyPress?: ({ key, delay }: { key: string; delay: Miliseconds }) => void,
  ) {
    for await (const step of simulateTyping(input, options.inputTyping)) {
      try {
        await page.keyboard.press(step.key as KeyInput);
      } catch {
        await page.keyboard.sendCharacter(step.key);
      }

      afterKeyPress?.(step);

      await delay(step.delay);
    }
  }

  async function clickAndNavigate(selector: string): Promise<void> {
    await Promise.all([page.waitForNavigation(), page.click(selector)]);
  }

  async function getText(selector: string): Promise<string> {
    return await page.$eval(selector, element => element.textContent);
  }

  async function waitUntilLoaded(): Promise<void> {
    await page.waitForFunction(
      website => {
        const element = document.querySelector(website.loadingModalSelector)!;

        return window.getComputedStyle(element).display == 'none';
      },
      {},
      website,
    );

    try {
      await page.click(website.closeNewWordModalSelector);
      await page.click(website.closePossibleWordModalSelector);
      await waitUntilLoaded();
    } catch {}
  }

  async function hideCookiesModal(): Promise<void> {
    await page.evaluate(website => {
      const cookiesModal = document.querySelector(website.cookiesModalSelector);

      if (cookiesModal) {
        cookiesModal.remove();
      }
    }, website);
  }
};
