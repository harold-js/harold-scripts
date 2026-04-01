import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import generatePosts from '../scripts/build/generate-posts.js';

describe('Generate Posts Warnings', () => {
  let tempDir;
  let originalCwd;
  let originalConsoleLog;
  let logOutput;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harold-posts-'));
    originalCwd = process.cwd();
    originalConsoleLog = console.log;
    logOutput = '';

    process.chdir(tempDir);
    console.log = (message) => {
      logOutput += String(message);
    };

    fs.mkdirSync(path.join(tempDir, 'src', 'posts'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'src', 'blog-layouts'), {
      recursive: true,
    });
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should warn only when the posts root directory is empty', async () => {
    await generatePosts();

    assert.ok(
      logOutput.includes('Posts root directory is empty'),
      'Should warn when the configured posts root directory has no entries'
    );
  });

  it('should not warn when posts exist only in subdirectories', async () => {
    fs.mkdirSync(path.join(tempDir, 'src', 'posts', 'nested'), {
      recursive: true,
    });

    fs.writeFileSync(
      path.join(tempDir, 'src', 'blog-layouts', 'post.hbs'),
      '<html><body>{{{content}}}</body></html>',
      'utf8'
    );

    fs.writeFileSync(
      path.join(tempDir, 'src', 'posts', 'nested', 'hello.md'),
      `---
layout: post
title: Nested Post
publicationDate: 2026-01-01
---

Hello from a nested post.
`,
      'utf8'
    );

    await generatePosts();

    assert.ok(
      !logOutput.includes('Posts root directory is empty'),
      'Should not warn when nested posts exist'
    );
    assert.ok(
      fs.existsSync(
        path.join(tempDir, 'build', 'posts', 'nested', 'hello.html')
      ),
      'Should generate nested post output'
    );
    assert.ok(
      fs.existsSync(path.join(tempDir, 'src', 'jsonData', 'posts.json')),
      'Should generate posts.json for nested posts'
    );
  });
});
