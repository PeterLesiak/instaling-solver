import prompt from 'prompts';

import { AccountsConfig, OptionsConfig, StorageConfig } from '~/config';
import { logger } from '~/logger';

export const acceptedOperations = ['find', 'clear', 'init'] as const;

export default async ({
  operation,
}: {
  operation: (typeof acceptedOperations)[number];
}) => {
  const accountsConfig = new AccountsConfig();
  const optionsConfig = new OptionsConfig();
  const storageConfig = new StorageConfig();

  if (operation === 'find') {
    logger.info(`Accounts config path: ${logger.path(accountsConfig.path)}`);
    logger.info(`Options config path: ${logger.path(optionsConfig.path)}`);
    logger.info(`Storage config path: ${logger.path(storageConfig.path)}`);
  }

  if (operation === 'clear') {
    const { confirm } = await prompt({
      name: 'confirm',
      type: 'confirm',
      message: 'Are you sure you want to *delete* all your configs?',
    });

    if (confirm) {
      await accountsConfig.clear();
      await optionsConfig.clear();
      await storageConfig.clear();
    }
  }

  if (operation === 'init') {
    const accountsConfigValid = await accountsConfig.setup();

    if (accountsConfigValid) {
      logger.info('The accounts config file is already valid, skipping.');
    }

    const optionsConfigValid = await optionsConfig.setup();

    if (optionsConfigValid) {
      logger.info('The options config file is already valid, skipping.');
    }

    const storageConfigValid = await storageConfig.setup();

    if (storageConfigValid) {
      logger.info('The storage config file is already valid, skipping.');
    }
  }
};
