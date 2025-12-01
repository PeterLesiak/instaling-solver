import type { OptionsConfigStore } from '~/config';
import { delay, randomInt, randomLetter, type Miliseconds } from '~/utils';

const charsPerMinute = (wpm: number) => wpm * 5;

export async function simulateReactionTime(
  reactionTime: OptionsConfigStore['reactionTime'],
): Promise<void> {
  const time = randomInt(reactionTime.from, reactionTime.to);

  await delay(time as Miliseconds);
}

export function* simulateTyping(
  input: string,
  inputTypingFunction: OptionsConfigStore['inputTyping'],
): Generator<{ key: string; delay: Miliseconds }, void, undefined> {
  const baseDelay = (60 * 1000) / charsPerMinute(inputTypingFunction.wpm);

  const punctuationPauseFactor: Record<string, number> = {
    '!': 1.8,
    '?': 1.7,
    '.': 1.6,
    ';': 1.3,
    ',': 1.3,
    ':': 1.3,
    ' ': 1.2,
  };

  for (const [index, char] of [...input].entries()) {
    let jitter = baseDelay * (0.5 + Math.random());

    if (punctuationPauseFactor[char]) {
      jitter *= punctuationPauseFactor[char];
    }

    if (index % randomInt(15, 25) === 0 && Math.random() < 0.1) {
      jitter += baseDelay * 1.5;
    }

    if (inputTypingFunction.typoRate > Math.random()) {
      const typo = randomLetter();
      yield { key: typo, delay: (jitter * 0.8) as Miliseconds };
      yield { key: 'Backspace', delay: (jitter * 2) as Miliseconds };
    }

    yield { key: char, delay: jitter as Miliseconds };
  }
}
