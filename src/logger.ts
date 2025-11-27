import boxen, { type Options as BoxenOptions } from 'boxen';
import kleur from 'kleur';
import { homedir } from 'node:os';
import { normalize, sep } from 'node:path';

interface Logger {
  line(): void;
  clearLine(): void;
  writeInThisLine(message: string, clearLine?: boolean): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  critical(message: string): never;
  printBox(values: string[], options: BoxenOptions): void;
  path(path: string): string;
}

export const logger: Logger = {
  line(): void {
    console.log();
  },

  clearLine(): void {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  },

  writeInThisLine(message: string, clearLine: boolean = true): void {
    if (clearLine) {
      this.clearLine();
    }

    process.stdout.write(message);
  },

  info(message: string): void {
    console.log(`[ ${kleur.blue('INFO')} ] ${message}`);
  },

  warn(message: string): void {
    console.log(`[ ${kleur.yellow('WARNING')} ] ${message}`);
  },

  error(message: string): void {
    console.log(`[ ${kleur.red('ERROR')} ] ${message}`);
  },

  critical(message: string): never {
    console.log(`[ ${kleur.magenta('CRITICAL')} ] ${message}`);

    process.exit(1);
  },

  printBox(values: string[], options: BoxenOptions): void {
    this.line();

    console.log(boxen(values.join('\n'), options));
  },

  path(path: string): string {
    path = normalize(path);
    const home = normalize(homedir() + sep);

    if (path.startsWith(home)) {
      path = path.slice(home.length);
      path = `~${sep}${path}`;
    }

    return kleur.yellow(path);
  },
} as const;
