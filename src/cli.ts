#!/usr/bin/env node
import { Command } from 'commander';
import { PostmanConverter } from './lib/converters/postman-converter.js';
import { resolvePath } from './utils/file.js';
import fs from 'node:fs';

const program = new Command();

program
  .name('yaak2postman')
  .description('Convert YAAK files to Postman format')
  .version('1.0.0')
  .argument('[type]', 'Type of conversion (env or collection)')
  .argument('[file]', 'Path to JSON file')
  .action((inputType: string | undefined, inputFile: string | undefined) => {
    const file = inputType && !inputFile ? inputType : inputFile;
    const type = inputType && !inputFile ? undefined : inputType;

    if (!file) {
      console.error('Error: File path is required');
      process.exit(1);
    }

    const resolvedPath = resolvePath(file);

    if (!fs.existsSync(resolvedPath)) {
      console.error(`Error: File not found: ${resolvedPath}`);
      process.exit(1);
    }

    try {
      const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
      JSON.parse(fileContent);
    } catch (error) {
      console.error('Error: Invalid JSON file');
      process.exit(1);
    }

    try {
      if (!type) {
        console.log('Processing both env and collection for file:', resolvedPath);
        
        const collectionConverter = new PostmanConverter(resolvedPath, 'collection');
        const collectionResults = collectionConverter.convert();
        
        const envConverter = new PostmanConverter(resolvedPath, 'env');
        const envResults = envConverter.convert();
        
        console.log('\nConversion completed successfully!');
        console.log('\nGenerated files:');
        const allResults = [...collectionResults, ...envResults];
        for (const result of allResults) {
          console.log(`- ${result.type}: ${result.outputPath}`);
        }
        
        return;
      }

      if (type !== 'env' && type !== 'collection') {
        console.error('Error: Type must be either "env" or "collection"');
        process.exit(1);
      }

      const converter = new PostmanConverter(resolvedPath, type as 'env' | 'collection');
      const results = converter.convert();

      console.log('\nConversion completed successfully!');
      console.log('\nGenerated files:');
      for (const result of results) {
        console.log(`- ${result.type}: ${result.outputPath}`);
      }

    } catch (error) {
      console.error('Error during conversion:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program.parse(); 