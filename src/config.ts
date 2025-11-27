import prompt from 'prompts';
import { z } from 'zod';
import envPaths from 'env-paths';
import kleur from 'kleur';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { logger } from '~/logger';
import { projectName } from '~/metadata';

const configDir = envPaths(projectName, { suffix: '' }).config;

class Config<T> {
  readonly path: string;
  readonly schema: z.ZodType<T>;

  constructor({ path, schema }: { path: string; schema: z.ZodType<T> }) {
    this.path = path;
    this.schema = schema;
  }

  store: T | null = null;

  async syncWithStore(mode: 'read' | 'write'): Promise<boolean> {
    await mkdir(configDir, { recursive: true });

    try {
      if (mode == 'read') {
        const buffer = await readFile(this.path, { encoding: 'utf8' });
        const contents = JSON.parse(buffer);

        this.store = this.schema.parse(contents);
      }

      if (mode == 'write') {
        const data = this.store === null ? '' : JSON.stringify(this.store);
        await writeFile(this.path, data, { encoding: 'utf8' });
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  async clear(): Promise<this> {
    rm(this.path, { force: true });

    return this;
  }

  async validate(): Promise<
    { success: true } | { success: false; error: 'missing-config' | 'invalid-config' }
  > {
    try {
      const files = await readdir(configDir, { withFileTypes: true });
      const fileExists = files.some(
        dirent => dirent.name === basename(this.path) && dirent.isFile(),
      );

      if (!fileExists) throw new Error();
    } catch {
      return { success: false, error: 'missing-config' };
    }

    try {
      const buffer = await readFile(this.path, { encoding: 'utf8' });
      const contents = JSON.parse(buffer) as unknown;

      this.schema.parse(contents);

      return { success: true };
    } catch {
      return { success: false, error: 'invalid-config' };
    }
  }
}

export type AccountsConfigStore = {
  name?: string;
  username: string;
  password: string;
}[];

export class AccountsConfig extends Config<AccountsConfigStore> {
  constructor() {
    super({
      path: join(configDir, 'accounts.json'),
      schema: z.array(
        z.object({
          name: z.string().optional(),
          username: z.string(),
          password: z.string(),
        }),
      ),
    });
  }

  selectedAccountIndex: number | null = null;

  async chooseAccount(): Promise<AccountsConfigStore[number]> {
    const accounts = this.store;

    if (!accounts || !accounts.length) {
      logger.critical('Accounts config could not find any account to select.');
    }

    if (accounts.length == 1) {
      const selectedAccount = accounts[0]!;
      this.selectedAccountIndex = 0;

      logger.info(
        `Selecting the only account available: ${kleur.green(selectedAccount.name ?? selectedAccount.username)}`,
      );
    } else {
      const { selectedAccount } = await prompt({
        name: 'selectedAccount',
        type: 'select',
        choices: accounts.map((account, i) => ({
          title: account.name || account.username,
          value: i,
        })),
      });

      this.selectedAccountIndex = selectedAccount;
    }

    return accounts![this.selectedAccountIndex!]!;
  }

  async setup(): Promise<boolean> {
    await mkdir(configDir, { recursive: true });

    const valid = await this.validate();

    if (!valid.success) {
      logger.warn(
        `The accounts config file is ${valid.error === 'missing-config' ? 'missing' : 'invalid'}.`,
      );

      const { confirm } = await prompt({
        name: 'confirm',
        type: 'confirm',
        message:
          'Do you want to proceed and *override* the accounts config with new data?',
        initial: valid.error === 'missing-config',
      });

      if (!confirm) {
        process.exit(0);
      }

      const account = await prompt([
        {
          name: 'name',
          type: 'text',
          message: 'Enter the name (identifier) of the account. (optional)',
        },
        { name: 'username', type: 'text', message: 'Enter the username of the account.' },
        {
          name: 'password',
          type: 'password',
          message: 'Enter the password for the account',
        },
      ]);

      this.store = [account];

      console.log();
    }

    await this.syncWithStore(valid.success ? 'read' : 'write');

    return valid.success;
  }
}

export async function setupAccountsConfig(): Promise<{
  accountsConfig: AccountsConfig;
  accounts: AccountsConfigStore;
}> {
  const accountsConfig = new AccountsConfig();
  await accountsConfig.setup();

  return { accountsConfig, accounts: accountsConfig.store! };
}

export type OptionsConfigStore = {
  inputTyping: {
    wpm: number;
    typoRate: number;
  };
  reactionTime: {
    from: number;
    to: number;
  };
  errorRate: number;
};

export class OptionsConfig extends Config<OptionsConfigStore> {
  constructor() {
    super({
      path: join(configDir, 'options.json'),
      schema: z.object({
        inputTyping: z.object({
          wpm: z.number().positive(),
          typoRate: z.number().min(0).max(1),
        }),
        reactionTime: z.object({
          from: z.number().nonnegative(),
          to: z.number().nonnegative(),
        }),
        errorRate: z.number().min(0).max(1),
      }),
    });
  }

  async setup(): Promise<boolean> {
    await mkdir(configDir, { recursive: true });

    const valid = await this.validate();

    if (!valid.success) {
      logger.warn(
        `The options config file is ${valid.error === 'missing-config' ? 'missing' : 'invalid'}.`,
      );

      const { confirm } = await prompt({
        name: 'confirm',
        type: 'confirm',
        message:
          'Do you want to proceed and *override* the options config with recommended data?',
        initial: valid.error === 'missing-config',
      });

      if (!confirm) {
        process.exit(0);
      }

      this.store = {
        inputTyping: { wpm: 40, typoRate: 0.05 },
        reactionTime: { from: 1000, to: 1600 },
        errorRate: 0.02,
      };

      console.log();
    }

    await this.syncWithStore(valid.success ? 'read' : 'write');

    return valid.success;
  }
}

export async function setupOptionsConfig(): Promise<{
  optionsConfig: OptionsConfig;
  options: OptionsConfigStore;
}> {
  const optionsConfig = new OptionsConfig();
  await optionsConfig.setup();

  return { optionsConfig, options: optionsConfig.store! };
}

export type StorageConfigStore = {
  question: string;
  translation: string;
  answer: string;
  updatedAt: string;
}[];

export class StorageConfig extends Config<StorageConfigStore> {
  constructor() {
    super({
      path: join(configDir, 'storage.json'),
      schema: z.array(
        z.object({
          question: z.string(),
          translation: z.string(),
          answer: z.string(),
          updatedAt: z.string(),
        }),
      ),
    });
  }

  updateStore(question: string, translation: string, answer: string): void {
    const store = this.store;

    if (!store) return;

    const updatedAt = new Date().toLocaleString();

    for (const comp of store) {
      if (comp.question === question && comp.translation === translation) {
        comp.answer = answer;
        comp.updatedAt = updatedAt;

        return;
      }
    }

    store.push({ question, translation, answer, updatedAt });
  }

  findInStore(question: string, translation: string): StorageConfigStore[number] | null {
    const store = this.store;

    if (!store) return null;

    for (const comp of store) {
      if (comp.question === question && comp.translation === translation) {
        return comp;
      }
    }

    return null;
  }

  async setup(): Promise<boolean> {
    await mkdir(configDir, { recursive: true });

    const valid = await this.validate();

    if (!valid.success) {
      logger.warn(
        `The storage config file is ${valid.error === 'missing-config' ? 'missing' : 'invalid'}.`,
      );

      const { confirm } = await prompt({
        name: 'confirm',
        type: 'confirm',
        message:
          'Do you want to proceed and *override* the storage config with empty data?',
        initial: valid.error === 'missing-config',
      });

      if (!confirm) {
        process.exit(0);
      }

      this.store = [];

      logger.line();
    }

    await this.syncWithStore(valid.success ? 'read' : 'write');

    return valid.success;
  }
}

export async function setupStorageConfig(): Promise<{
  storageConfig: StorageConfig;
  storage: StorageConfigStore;
}> {
  const storageConfig = new StorageConfig();
  await storageConfig.setup();

  return { storageConfig, storage: storageConfig.store! };
}
