import boxen, { type Options as BoxenOptions } from 'boxen';
import kleur from 'kleur';
import { homedir } from 'node:os';
import { normalize, sep } from 'node:path';

export const logger = {
  line(): void {
    console.log();
  },

  clearLine(): void {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  },

  write(message: string, clearLine: boolean = true): void {
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

  critical(message: string): void {
    console.log(`[ ${kleur.magenta('CRITICAL')} ] ${message}`);
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
