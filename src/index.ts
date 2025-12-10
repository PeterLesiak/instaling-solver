#!/usr/bin/env node
import { program } from 'commander';
import kleur from 'kleur';

import solve from '~/commands/solve';
import config, { acceptedOperations } from '~/commands/config';
import typewriter from '~/commands/typewriter';
import { logger } from '~/logger';
import { projectName, projectVersion } from '~/metadata';

program
  .name(projectName)
  .version(projectVersion)
  .description('Command-line tool to help automate https://instaling.pl sessions');

program
  .command('solve', { isDefault: true })
  .description(`run sessions from the user's account (default)`)
  .option('-p, --pause', 'pause after the end of each session')
  .action(({ pause }) => {
    solve({ pause: pause ?? false });
  });

program
  .command('config')
  .description(`operate on the config files`)
  .argument(
    '<operation>',
    `accepted values: ${kleur.bold(acceptedOperations.join(', '))}`,
    value => {
      if (!acceptedOperations.includes(value as any)) {
        logger.critical(
          `Invalid config operation ${kleur.red(value)}, accepted values: ${kleur.bold(acceptedOperations.join(', '))}`,
        );
      }

      return value;
    },
  )
  .action(operation => {
    config({ operation });
  });

program
  .command('typewriter')
  .description(
    `simulate the typing of input fields, this is helpful for testing different config options`,
  )
  .action(() => {
    typewriter();
  });

program.parse();
