import fs from 'node:fs';
import path from 'node:path';

export function resolvePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
        return path.normalize(filePath);
    }
    return path.resolve(process.cwd(), filePath);
}

export function readJsonFile<T>(filePath: string): T {
    const resolvedPath = resolvePath(filePath);
    const fileContent = fs.readFileSync(resolvedPath, 'utf8');
    return JSON.parse(fileContent);
}

export function saveJsonFile(filePath: string, data: unknown): void {
    const outputDir = path.dirname(filePath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
} 