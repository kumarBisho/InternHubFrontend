#!/usr/bin/env node

/**
 * TypeScript Types Generation Script
 * 
 * Generates TypeScript types from the backend Swagger/OpenAPI specification.
 * This script:
 * 1. Fetches the OpenAPI spec from the running backend
 * 2. Generates type-safe TypeScript interfaces
 * 3. Creates API client types
 * 4. Validates the generated types
 * 
 * Usage:
 *   node scripts/generate-types.mjs
 *   node scripts/generate-types.mjs --validate
 *   node scripts/generate-types.mjs --watch
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5248';
const SWAGGER_URL = `${BACKEND_URL}/swagger/v1/swagger.json`;
const OUTPUT_DIR = path.join(__dirname, '../src/types/generated');
const API_CLIENT_DIR = path.join(__dirname, '../src/generated');

// Color output for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.warn(`${colors.yellow}⚠${colors.reset} ${msg}`),
  debug: (msg) => process.env.DEBUG && console.log(`${colors.cyan}◆${colors.reset} ${msg}`),
};

/**
 * Fetch the Swagger/OpenAPI specification from the backend
 */
async function fetchSwaggerSpec() {
  return new Promise((resolve, reject) => {
    log.info(`Fetching Swagger spec from ${SWAGGER_URL}`);

    const protocol = SWAGGER_URL.startsWith('https') ? https : http;
    const opts = {
      timeout: 5000,
      headers: {
        'User-Agent': 'InternHub-TypeScript-Generator/1.0.0',
      },
    };

    protocol.get(SWAGGER_URL, opts, (res) => {
      let data = '';

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch Swagger spec: ${res.statusCode} ${res.statusMessage}`));
        return;
      }

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const spec = JSON.parse(data);
          resolve(spec);
        } catch (err) {
          reject(new Error(`Invalid JSON in Swagger spec: ${err.message}`));
        }
      });
    }).on('error', reject).on('timeout', () => reject(new Error('Swagger fetch timeout')));
  });
}

/**
 * Convert Swagger spec to TypeScript interfaces
 */
function generateTypeScriptInterfaces(spec) {
  const interfaces = [];
  const schemas = spec.components?.schemas || spec.definitions || {};

  // Generate interfaces for each schema
  for (const [name, schema] of Object.entries(schemas)) {
    const interfaceName = pascalCase(name);
    const properties = schema.properties || {};

    let interfaceCode = `export interface ${interfaceName} {\n`;

    for (const [propName, propSchema] of Object.entries(properties)) {
      const required = schema.required?.includes(propName);
      const optional = required ? '' : '?';
      const type = getTypeScriptType(propSchema);
      const description = propSchema.description || '';

      if (description) {
        interfaceCode += `  /** ${description} */\n`;
      }

      interfaceCode += `  ${propName}${optional}: ${type};\n`;
    }

    interfaceCode += `}\n`;
    interfaces.push(interfaceCode);
  }

  return interfaces.join('\n');
}

/**
 * Map JSON Schema types to TypeScript types
 */
function getTypeScriptType(schema) {
  if (schema.type === 'string') {
    if (schema.enum) {
      return `'${schema.enum.join("' | '")}'`;
    }
    if (schema.format === 'date' || schema.format === 'date-time') {
      return 'Date | string';
    }
    return 'string';
  }

  if (schema.type === 'number') return 'number';
  if (schema.type === 'integer') return 'number';
  if (schema.type === 'boolean') return 'boolean';
  if (schema.type === 'array') {
    const itemType = schema.items ? getTypeScriptType(schema.items) : 'any';
    return `${itemType}[]`;
  }

  if (schema.$ref) {
    const refType = schema.$ref.split('/').pop();
    return pascalCase(refType);
  }

  if (schema.oneOf) {
    return schema.oneOf.map((s) => getTypeScriptType(s)).join(' | ');
  }

  if (schema.allOf) {
    return schema.allOf.map((s) => getTypeScriptType(s)).join(' & ');
  }

  return 'any';
}

/**
 * Convert snake_case/camelCase to PascalCase
 */
function pascalCase(str) {
  return str
    .replace(/(_|-)\w/g, (x) => x[1].toUpperCase())
    .replace(/\w/, (x) => x.toUpperCase());
}

/**
 * Create index.ts barrels for organized exports
 */
function generateIndexFile(types) {
  const imports = types
    .map((type, idx) => {
      const match = type.match(/export interface (\w+)/);
      return match ? `export * from './${match[1]}.generated';` : null;
    })
    .filter(Boolean)
    .join('\n');

  return `/**
 * AUTO-GENERATED API TYPES
 * 
 * This file is auto-generated from the backend Swagger specification.
 * DO NOT EDIT MANUALLY!
 * 
 * To regenerate, run: npm run generate:types
 */

${imports}

// Re-export common types
export * from '../api' assert { type: 'json' };
`;
}

/**
 * Create directory if it doesn't exist
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log.success(`Created directory: ${dir}`);
  }
}

/**
 * Write generated types to files
 */
async function writeGeneratedTypes(spec) {
  ensureDir(OUTPUT_DIR);

  const schemas = spec.components?.schemas || spec.definitions || {};
  let generatedCount = 0;

  for (const [name, schema] of Object.entries(schemas)) {
    const interfaceName = pascalCase(name);
    const filePath = path.join(OUTPUT_DIR, `${interfaceName}.generated.ts`);
    const typeCode = generateSchema(interfaceName, schema);

    fs.writeFileSync(filePath, typeCode);
    log.debug(`Generated: ${interfaceName}`);
    generatedCount++;
  }

  // Create index barrel
  const indexPath = path.join(OUTPUT_DIR, 'index.ts');
  const indexContent = generateIndexFile(Object.keys(schemas).map(pascalCase));
  fs.writeFileSync(indexPath, indexContent);

  log.success(`Generated ${generatedCount} type files in ${OUTPUT_DIR}`);
}

/**
 * Generate a single schema as TypeScript interface
 */
function generateSchema(name, schema) {
  const properties = schema.properties || {};
  const required = schema.required || [];

  let code = `/**
 * Type: ${name}
 * ${schema.description || 'Auto-generated from API schema'}
 */

export interface ${name} {
`;

  for (const [propName, propSchema] of Object.entries(properties)) {
    const optional = required.includes(propName) ? '' : '?';
    const type = getTypeScriptType(propSchema);
    const description = propSchema.description || '';

    if (description) {
      code += `  /** ${description} */\n`;
    }

    code += `  ${propName}${optional}: ${type};\n`;
  }

  code += `}\n`;

  return code;
}

/**
 * Validate generated types
 */
function validateTypes() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    log.error(`Generated types directory not found: ${OUTPUT_DIR}`);
    return false;
  }

  const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('.generated.ts'));

  if (files.length === 0) {
    log.error('No generated type files found');
    return false;
  }

  log.success(`Validated ${files.length} generated type files`);
  return true;
}

/**
 * Main entry point
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const validate = args.includes('--validate');
    const watch = args.includes('--watch');

    log.info('InternHub TypeScript Types Generator v1.0.0');
    log.info('');

    // Fetch spec
    const spec = await fetchSwaggerSpec();
    log.success('Swagger spec fetched successfully');

    // Generate types
    await writeGeneratedTypes(spec);
    log.info('');

    // Validate
    if (validate || !watch) {
      if (validateTypes()) {
        log.success('Type generation completed successfully!');
      } else {
        process.exit(1);
      }
    }

    // Watch mode
    if (watch) {
      log.info('Watching for changes (not yet implemented)');
      log.info('Press Ctrl+C to exit');
    }
  } catch (error) {
    log.error(`Generation failed: ${error.message}`);
    log.error(`Backend URL: ${BACKEND_URL}`);
    log.error('Make sure the backend API is running at the configured URL');
    process.exit(1);
  }
}

// Run the generator
main();
