import chalk from 'chalk';

export const logNewline = (): void => {
    process.stdout.write('\n');
};

export const logSuccess = (message: string): void => {
    process.stdout.write(`✅ ${message}\n`);
};

export const logFailure = (message: string): void => {
    process.stdout.write(`❌ ${message}\n`);
};

export type Task = () => void;

export const logTask = (message: string): Task => {
    process.stdout.write(`🟧 ${message} ...`);

    return () => {
        process.stdout.write(`${chalk.greenBright(' [DONE]')}\n`);
    };
};
