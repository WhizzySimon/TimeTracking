#!/usr/bin/env node

/**
 * Devlog Tag Validator
 * Validates that all DL-*.md files and INDEX.md use valid tags from TAGS.md
 * 
 * Checks:
 * 1. Every DL-*.md has "## Tags" section with comma-separated tags (no brackets)
 * 2. Each DL has 3-7 tags
 * 3. Each tag exists in TAGS.md
 * 4. INDEX.md tags column uses comma-separated tags that exist in TAGS.md
 * 
 * Exit code 1 on any violation
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const devlogDir = join(projectRoot, 'Docs', 'Devlog');

let hasErrors = false;

function error(msg) {
  console.error(`❌ ${msg}`);
  hasErrors = true;
}

function success(msg) {
  console.log(`✅ ${msg}`);
}

function extractTagsFromTagsMd() {
  const tagsPath = join(devlogDir, 'TAGS.md');
  const content = readFileSync(tagsPath, 'utf-8');
  const tags = new Set();
  
  const tagPattern = /\| `([a-z0-9-]+)` \|/g;
  let match;
  while ((match = tagPattern.exec(content)) !== null) {
    tags.add(match[1]);
  }
  
  const aliasSection = content.match(/## Aliases.*?\n([\s\S]*?)(?=\n---|\n## |$)/);
  if (aliasSection) {
    const aliasPattern = /\| `([a-z0-9-]+)` \|/g;
    while ((match = aliasPattern.exec(aliasSection[1])) !== null) {
      tags.add(match[1]);
    }
  }
  
  return tags;
}

function validateDevlogFile(filePath, validTags) {
  const fileName = filePath.split(/[/\\]/).pop();
  const content = readFileSync(filePath, 'utf-8');
  
  const tagsMatch = content.match(/## Tags\s*\n+[-*]?\s*tags:\s*\[([^\]]+)\]/);
  if (!tagsMatch) {
    const altMatch = content.match(/## Tags\s*\n+[-*]?\s*tags:\s*([^\n]+)/);
    if (altMatch && !altMatch[1].includes('[')) {
      error(`${fileName}: Tags line should use format "- tags: [tag1, tag2, ...]" with brackets`);
      return;
    }
    error(`${fileName}: Missing "## Tags" section or invalid format`);
    return;
  }
  
  const tagsStr = tagsMatch[1];
  const tags = tagsStr.split(',').map(t => t.trim());
  
  if (tags.length < 3) {
    error(`${fileName}: Has ${tags.length} tags, minimum is 3`);
  }
  if (tags.length > 7) {
    error(`${fileName}: Has ${tags.length} tags, maximum is 7`);
  }
  
  for (const tag of tags) {
    if (!validTags.has(tag)) {
      error(`${fileName}: Unknown tag "${tag}" not in TAGS.md`);
    }
  }
}

function validateIndexMd(validTags) {
  const indexPath = join(devlogDir, 'INDEX.md');
  const content = readFileSync(indexPath, 'utf-8');
  const lines = content.split('\n');
  
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.startsWith('|--')) continue;
    
    const columns = line.split('|').map(c => c.trim());
    if (columns.length < 6) continue;
    
    const tagsColumn = columns[5];
    if (!tagsColumn) continue;
    
    if (tagsColumn.includes('[') || tagsColumn.includes(']')) {
      error(`INDEX.md line ${i + 1}: Tags should be comma-separated without brackets`);
      continue;
    }
    
    const tags = tagsColumn.split(',').map(t => t.trim()).filter(t => t);
    for (const tag of tags) {
      if (!validTags.has(tag)) {
        error(`INDEX.md line ${i + 1}: Unknown tag "${tag}" not in TAGS.md`);
      }
    }
  }
}

function main() {
  console.log('Validating devlog tags...\n');
  
  const validTags = extractTagsFromTagsMd();
  console.log(`Found ${validTags.size} valid tags in TAGS.md\n`);
  
  const devlogFiles = readdirSync(devlogDir)
    .filter(f => f.startsWith('DL-') && f.endsWith('.md'));
  
  console.log(`Checking ${devlogFiles.length} devlog files...\n`);
  
  for (const file of devlogFiles) {
    validateDevlogFile(join(devlogDir, file), validTags);
  }
  
  console.log('\nChecking INDEX.md...\n');
  validateIndexMd(validTags);
  
  if (hasErrors) {
    console.log('\n❌ Validation FAILED - see errors above');
    process.exit(1);
  } else {
    success('\nAll devlog tags are valid!');
    process.exit(0);
  }
}

main();
