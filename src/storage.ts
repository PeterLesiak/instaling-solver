import { writeFile, readFile, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { logTask, logFailure, logSuccess } from './logger';

export type Storage = Record<string, { answer: string; translation: string }>;

const basePath = dirname(fileURLToPath(import.meta.url));

const storageFilePath = resolve(basePath, '../storage.json');

export const hasStorage = async (): Promise<boolean> => {
    try {
        await stat(storageFilePath);
        return true;
    } catch {
        return false;
    }
};

export const getStorage = async (): Promise<Storage> => {
    const storageLoaded = logTask('Loading storage file');

    const storageExists = await hasStorage();

    if (!storageExists) {
        storageLoaded();
        logFailure('Storage file not found');

        return {};
    }

    const file = await readFile(storageFilePath, { encoding: 'utf8' });

    storageLoaded();
    logSuccess(`Storage file found at ${storageFilePath}`);

    return JSON.parse(file);
};

export const saveStorage = async (storage: Storage): Promise<void> => {
    const storageSaved = logTask('Saving storage file');

    await writeFile(storageFilePath, JSON.stringify(storage));
    storageSaved();
};
