```                                                 
 __   __          _    ____  ____           _                         
 \ \ / /_ _  __ _| | _|___ \|  _ \ ___  ___| |_ _ __ ___   __ _ _ __  
  \ V / _` |/ _` | |/ / __) | |_) / _ \/ __| __| '_ ` _ \ / _` | '_ \ 
   | | (_| | (_| |   < / __/|  __/ (_) \__ \ |_| | | | | | (_| | | | |
   |_|\__,_|\__,_|_|\_\_____|_|   \___/|___/\__|_| |_| |_|\__,_|_| |_|
```

# YAAK to Postman Converter 🔄

> A powerful CLI tool to convert YAAK exported files into Postman collections and environments 🛠️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)

## Table of Contents

• [Overview](#overview)  
• [Features](#features)  
• [Installation](#installation)  
• [Usage](#usage)  
• [Examples](#examples)
• [Development](#development)  
• [API Reference](#api-reference)  
• [Contributing](#contributing)  
• [License](#license)  

## Overview 🎯

YAAK to Postman Converter is a command-line interface tool that transforms YAAK format files into Postman collections and environments. It maintains folder structures, request details, and environment variables while providing a seamless conversion experience.

## Features ✨

- 🔄 Convert YAAK files to Postman Collection v2.1.0
- 🌍 Environment variables support
- 📁 Preserves folder hierarchy
- 🔗 Handles both relative and absolute paths
- 🚀 Fast and efficient processing
- 💾 Automatic file saving
- 🎯 Type-safe implementation

## Installation 📦

```bash
# Using npm
npm install -g @bitecraft/yaak2postman

# Using Bun
bun install -g @bitecraft/yaak2postman

# Using pnpm
pnpm install -g @bitecraft/yaak2postman

# Using yarn
yarn global add @bitecraft/yaak2postman
```

## Usage 🚀

The CLI supports three main usage patterns:

```bash
# Convert both collection and environments
yaak2postman path/to/yaak-file.json

# Convert only collection
yaak2postman collection path/to/yaak-file.json

# Convert only environments
yaak2postman env path/to/yaak-file.json
```

## Examples 📝

### Converting a YAAK File
```bash
yaak2postman ./my-api.json
```

### Converting Only Collection
```bash
yaak2postman collection ./my-api.json
```

### Converting Only Environment
```bash
yaak2postman env ./my-api.json
```

## Development 🛠️

### Prerequisites

- Node.js >= 14.0.0
- Bun (latest version)
- TypeScript knowledge

### Setting Up Development Environment

1. Clone the repository:
```bash
git clone https://github.com/yourusername/yaak2postman.git
cd yaak2postman
```

2. Install dependencies:
```bash
bun install
```

3. Start development:
```bash
bun run start
```

### Building the Project

```bash
bun run build
```

## API Reference 📚

### YAAK Structure
The tool expects a YAAK file with the following structure:

```typescript
interface YaakData {
    resources: {
        workspaces: YaakWorkspace[];
        environments: YaakEnvironment[];
        folders: YaakFolder[];
        httpRequests: YaakRequest[];
    };
}
```

### Output Format
The tool generates Postman Collection v2.1.0 format files:

```typescript
interface PostmanCollection {
    info: {
        name: string;
        description: string;
        schema: string;
    };
    item: (PostmanFolder | PostmanRequest)[];
    variable: PostmanVariable[];
}
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ using TypeScript and Bun 