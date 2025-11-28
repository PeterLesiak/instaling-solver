<div align="center">

# 🌟 instaling-solver

**A modern CLI companion for automating your https://instaling.pl sessions**

![Version](https://img.shields.io/badge/version-2.0.1-blue)
![License](https://img.shields.io/badge/license-MIT-purple)
![Platform](https://img.shields.io/badge/platform-CLI-lightgrey)

</div>

> [!IMPORTANT]  
> This tool is intended for **personal educational automation only**. Use responsibly and accept the risk of possible account suspension.

## 📖 Table of Contents

1. [✨ Overview](#-overview)
2. [🚀 Features](#-features)
3. [📦 Installation & Setup](#-installation--setup)
4. [🧰 Usage Guide — CLI Commands](#-usage-guide--cli-commands)
5. [⚙️ Configuration Files Explained](#️-configuration-files-explained)
6. [🛠️ Developer Guide / Contributing](#️-developer-guide--contributing)
7. [📄 License](#-license)

## ✨ Overview

`instaling-solver` provides a modern CLI for automating your **Instaling.pl** vocabulary-learning sessions. It simulates human typing, manages multiple accounts, and includes a complete configuration system.

## 🚀 Features

- 🔄 Automatic flow of Instaling sessions
- ⌨️ Human-like typing simulation (WPM, typos, delays)
- ⚙️ Clean JSON-based configs
- 🧪 Typewriter mode for testing input behavior
- 🔍 Config init/clear/find tools
- 🛡️ Lightweight architecture with zero bloat

## 📦 Installation & Setup

```
npm install -g instaling-solver@latest
```

```
instaling-solver
```

## 🧰 Usage Guide — CLI Commands

### 🔹 `solve` — Run Learning Sessions

Runs https://instaling.pl sessions using:

- accounts from `accounts.json`
- realistic typing simulation & delays from `options.json`
- answer memory from `storage.json`

```
instaling-solver solve

# or shorter
instaling-solver
```

### 🔹 `config` — Manage Solver Configuration

#### `config find`

Shows file paths for accounts, options, and storage. The paths are operating system specific.

#### `config init`

Creates all config files if missing.

#### `config clear`

Deletes all config files (permanently).

Examples:

```
instaling-solver config find
instaling-solver config init
instaling-solver config clear
```

### 🔹 `typewriter` — Test Typing Simulation

Simulates typing with your settings from `options.json`:

```
instaling-solver typewriter
```

## ⚙️ Configuration Files Explained

`instaling-solver config init` generates:

### 📁 `accounts.json`

Stores Instaling login credentials and account names.

```json
[
  {
    "name": "Optional account name to display instead of username",
    "username": "Username to your account",
    "password": "Password to your account (will not be hashed!)"
  }
]
```

### 📁 `options.json`

Defines typing and behavior settings.

```json
{
  "inputTyping": { "wpm": 40, "typoRate": 0.05 },
  "reactionTime": { "from": 1000, "to": 1600 },
  "errorRate": 0.02
}
```

Field meaning:

- **wpm** → Base number of words per minute
- **typoRate** → Frequency of intentional typos (from 0 to 1)
- **reactionTime** → How long to wait before answering
- **errorRate** → Chance of intentionally wrong answers (from 0 to 1)

### 📁 `storage.json`

Internal memory for previously solved items.

```json
[
  {
    "question": "Prefiero _____ ______ ___ los amigos que estar sola.",
    "translation": "spędzać czas z przyjaciółmi",
    "answer": "pasar tiempo con los amigos",
    "updatedAt": "11/27/2025, 1:15:29 PM"
  }
]
```

## 🛠️ Developer Guide / Contributing

### 1️⃣ Clone the Repository

```
git clone https://github.com/PeterLesiak/instaling-solver
cd ./instaling-solver
```

### 2️⃣ Install Dependencies

```
pnpm install
```

### 3️⃣ Run the CLI

```
.instaling-solver
.instaling-solver help
```

### 4️⃣ (Optional) Setup an Alias

```bash
# For e.g. when using bash
alias instaling-solver='~/instaling-solverinstaling-solver'

instaling-solver
```

> [!TIP]  
> Use pnpm for all development commands.

### Useful Commands

| Purpose      | Command             |
| ------------ | ------------------- |
| Build binary | `pnpm build`        |
| Run CLI      | `.instaling-solver` |
| Typecheck    | `pnpm typecheck`    |
| Format code  | `pnpm format`       |

## 📄 License

[MIT License.](./LICENSE)
