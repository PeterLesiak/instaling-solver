# instaling-solver v1.0.0

[1. How to use](#how-to-use) <br />
[2. Using firefox instead of chrome](#using-firefox-instead-of-chrome) <br />
[3. Running in headless mode (without window)](#running-in-headless-mode-without-window) <br />

<hr />

## How to use

Clone or download this repository, for example using [git](https://git-scm.com/)

> ```sh
> git clone https://github.com/PeterLesiak/instaling-solver.git
> ```

Install dependencies, [nodejs](https://nodejs.org/en) **required**

> ```sh
> npm ci
> ```

Build from source

> ```sh
> npm run build
> ```

Now you can start using the script

> ```sh
> node ./dist/index.js [USERNAME] [PASSWORD]
> # example
> node ./dist/index.js 3ckt74 wiub7
> ```

Your storage data will be saved in ./storage.json file

<hr />

## Using env file to store password

Pass the path to .env file instead of password in cli

> ```sh
> node ./dist/index.js 3ckt74 ./acounts.env
> ```

accounts.env (relative to `index.js`)

```env
3ckt74=wiub7
```

<hr />

## Using firefox instead of chrome

Install firefox browser for [puppeteer](https://pptr.dev/)

> ```sh
> npx puppeteer browsers install firefox
> ```

Use the `--browser` flag in cli

> ```sh
> node ./dist/index.js [USERNAME] [PASSWORD] --browser firefox
> # or shorter
> node ./dist/index.js [USERNAME] [PASSWORD] -b firefox
> ```

<hr />

## Running in headless mode (without window)

Pass the `--headless` flag in cli

> ```sh
> node ./dist/index.js [USERNAME] [PASSWORD] --headless
> # or shorter
> node ./dist/index.js [USERNAME] [PASSWORD] -h
> ```
