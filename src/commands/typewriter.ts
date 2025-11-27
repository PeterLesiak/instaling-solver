import kleur from 'kleur';

import { simulateTyping } from '~/inputSimulation';
import { setupOptionsConfig } from '~/config';
import { logger } from '~/logger';
import { delay } from '~/utils';

export default async () => {
  const { options } = await setupOptionsConfig();

  const input = 'The quick brown fox jumps over the lazy dog.';

  let output = '';

  for (const step of simulateTyping(input, options.inputTyping)) {
    if (step.key === 'Backspace') {
      output = output.substring(0, output.length - 1);
    } else {
      output += step.key;
    }

    logger.writeInThisLine(output);
    logger.writeInThisLine(kleur.dim(input.substring(output.length)), false);
    process.stdout.moveCursor(output.length - input.length, 0);

    await delay(step.delay);
  }
};
