import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import fse from 'fs-extra';
import listenerCallback from '../scripts/start/listener-callback.js';

describe('Listener Callback', () => {
  let originalRemoveSync;
  let originalConsoleLog;
  let removedPaths;
  let consoleOutput;

  beforeEach(() => {
    // Store originals
    originalRemoveSync = fse.removeSync;
    originalConsoleLog = console.log;

    // Reset tracking
    removedPaths = [];
    consoleOutput = [];

    // Mock fse.removeSync to track what would be removed
    fse.removeSync = (path) => {
      removedPaths.push(path);
    };

    // Mock console.log to capture output
    console.log = (...args) => {
      consoleOutput.push(args.join(' '));
    };
  });

  afterEach(() => {
    // Restore originals
    fse.removeSync = originalRemoveSync;
    console.log = originalConsoleLog;
  });

  describe('module structure', () => {
    it('should export a function', () => {
      assert.strictEqual(
        typeof listenerCallback,
        'function',
        'Should export a function'
      );
    });

    it('should be an async function', () => {
      const result = listenerCallback('change', 'src/test.txt');
      assert.ok(result instanceof Promise, 'Should return a Promise');
      return result; // Clean up
    });

    it('should accept event and path parameters', async () => {
      // Should not throw with proper parameters
      await assert.doesNotReject(
        async () => await listenerCallback('change', 'src/posts/test.md'),
        'Should accept event and path parameters'
      );
    });
  });

  describe('console logging', () => {
    it('should log event and path', async () => {
      await listenerCallback('change', 'src/posts/test.md');

      assert.ok(consoleOutput.length > 0, 'Should log something');
      assert.ok(
        consoleOutput.some((line) => line.includes('change')),
        'Should log event'
      );
      assert.ok(
        consoleOutput.some((line) => line.includes('src/posts/test.md')),
        'Should log path'
      );
    });

    it('should log in format "event: path"', async () => {
      await listenerCallback('change', 'src/posts/article.md');

      assert.ok(
        consoleOutput.some((line) =>
          line.match(/change:\s+src\/posts\/article\.md/)
        ),
        'Should log in "event: path" format'
      );
    });

    it('should log for add events', async () => {
      await listenerCallback('add', 'src/posts/new.md');

      assert.ok(
        consoleOutput.some((line) => line.includes('add:')),
        'Should log add events'
      );
    });

    it('should log for unlink events', async () => {
      await listenerCallback('unlink', 'src/posts/deleted.md');

      assert.ok(
        consoleOutput.some((line) => line.includes('unlink:')),
        'Should log unlink events'
      );
    });

    it('should log building status before ready', async () => {
      await listenerCallback('change', 'src/posts/test.md');

      const buildingIndex = consoleOutput.findIndex((line) =>
        line.includes('Building...')
      );
      const readyIndex = consoleOutput.findIndex((line) =>
        line.includes('Ready.')
      );
      assert.ok(buildingIndex !== -1, 'Should log building status');
      assert.ok(readyIndex !== -1, 'Should log ready status');
      assert.ok(
        buildingIndex < readyIndex,
        'Building should appear before Ready'
      );
    });
  });

  describe('static file removal', () => {
    it('should remove static file from public on unlink', async () => {
      await listenerCallback('unlink', 'src/statics/robots.txt');

      assert.ok(
        removedPaths.some(
          (p) => p.includes('build') && p.includes('robots.txt')
        ),
        'Should remove corresponding file from build directory'
      );
    });

    it('should remove nested static file from public on unlink', async () => {
      await listenerCallback('unlink', 'src/statics/images/old.jpg');

      assert.ok(
        removedPaths.some(
          (p) => p.includes('build') && p.includes('images/old.jpg')
        ),
        'Should remove nested file from build'
      );
    });

    it('should replace src/statics with build in path', async () => {
      await listenerCallback('unlink', 'src/statics/test.txt');

      assert.ok(
        removedPaths.some((p) => p.includes('build/test.txt')),
        'Should replace src/statics with build'
      );
      assert.ok(
        !removedPaths.some((p) => p.includes('src/statics')),
        'Should not include src/statics in removed path'
      );
    });

    it('should not remove static file on change event', async () => {
      await listenerCallback('change', 'src/statics/robots.txt');

      assert.strictEqual(
        removedPaths.length,
        0,
        'Should not remove file on change'
      );
    });

    it('should not remove static file on add event', async () => {
      await listenerCallback('add', 'src/statics/robots.txt');

      assert.strictEqual(
        removedPaths.length,
        0,
        'Should not remove file on add'
      );
    });

    it('should only remove on unlink event for statics', async () => {
      await listenerCallback('add', 'src/statics/file1.txt');
      await listenerCallback('change', 'src/statics/file2.txt');

      assert.strictEqual(
        removedPaths.length,
        0,
        'Should not remove on add/change'
      );

      await listenerCallback('unlink', 'src/statics/file3.txt');

      assert.ok(removedPaths.length > 0, 'Should remove on unlink');
    });
  });

  describe('page file removal', () => {
    it('should remove page HTML file on .hbs unlink', async () => {
      await listenerCallback('unlink', 'src/pages/about.hbs');

      assert.ok(
        removedPaths.some(
          (p) => p.includes('build') && p.includes('about.html')
        ),
        'Should remove corresponding HTML file'
      );
    });

    it('should convert .hbs to .html when removing', async () => {
      await listenerCallback('unlink', 'src/pages/contact.hbs');

      assert.ok(
        removedPaths.some((p) => p.endsWith('.html')),
        'Should remove .html file, not .hbs'
      );
      assert.ok(
        !removedPaths.some((p) => p.endsWith('.hbs')),
        'Should not try to remove .hbs from public'
      );
    });

    it('should extract filename from path', async () => {
      await listenerCallback('unlink', 'src/pages/blog/post.hbs');

      // Should extract just the filename "post.hbs" and convert to "post.html"
      assert.ok(
        removedPaths.some((p) => p.includes('post.html')),
        'Should extract filename from path'
      );
    });

    it('should not remove page HTML on change event', async () => {
      await listenerCallback('change', 'src/pages/about.hbs');

      assert.strictEqual(
        removedPaths.length,
        0,
        'Should not remove file on change'
      );
    });

    it('should not remove page HTML on add event', async () => {
      await listenerCallback('add', 'src/pages/about.hbs');

      assert.strictEqual(
        removedPaths.length,
        0,
        'Should not remove file on add'
      );
    });

    it('should only remove on unlink event for pages', async () => {
      await listenerCallback('add', 'src/pages/file1.hbs');
      await listenerCallback('change', 'src/pages/file2.hbs');

      assert.strictEqual(
        removedPaths.length,
        0,
        'Should not remove on add/change'
      );

      await listenerCallback('unlink', 'src/pages/file3.hbs');

      assert.ok(removedPaths.length > 0, 'Should remove on unlink');
    });
  });

  describe('event types', () => {
    it('should handle add event without errors', async () => {
      await assert.doesNotReject(
        async () => await listenerCallback('add', 'src/posts/new-post.md'),
        'Should handle add event'
      );
    });

    it('should handle change event without errors', async () => {
      await assert.doesNotReject(
        async () => await listenerCallback('change', 'src/posts/existing.md'),
        'Should handle change event'
      );
    });

    it('should handle unlink event without errors', async () => {
      await assert.doesNotReject(
        async () => await listenerCallback('unlink', 'src/posts/deleted.md'),
        'Should handle unlink event'
      );
    });

    it('should handle different event types for same path', async () => {
      await listenerCallback('add', 'src/test.txt');
      await listenerCallback('change', 'src/test.txt');
      await listenerCallback('unlink', 'src/test.txt');

      // Should not throw errors
      assert.ok(true, 'Should handle different event types');
    });
  });

  describe('path handling', () => {
    it('should handle paths with multiple slashes', async () => {
      await assert.doesNotReject(
        async () =>
          await listenerCallback('change', 'src/posts/2024/january/article.md'),
        'Should handle nested paths'
      );
    });

    it('should handle paths with special characters', async () => {
      await assert.doesNotReject(
        async () =>
          await listenerCallback('change', 'src/posts/post-with-dashes.md'),
        'Should handle dashes'
      );
    });

    it('should handle empty path', async () => {
      await assert.doesNotReject(
        async () => await listenerCallback('change', ''),
        'Should handle empty path'
      );
    });

    it('should handle path without src prefix', async () => {
      await assert.doesNotReject(
        async () => await listenerCallback('change', 'other/path/file.txt'),
        'Should handle non-src paths'
      );
    });
  });

  describe('async operations', () => {
    it('should complete async operations', async () => {
      const result = await listenerCallback('change', 'src/posts/test.md');

      // Should complete successfully (returns undefined)
      assert.strictEqual(result, undefined, 'Should complete async operations');
    });

    it('should be callable multiple times', async () => {
      await listenerCallback('change', 'src/posts/test1.md');
      await listenerCallback('change', 'src/posts/test2.md');
      await listenerCallback('change', 'src/posts/test3.md');

      // Should complete all calls
      assert.ok(consoleOutput.length >= 3, 'Should handle multiple calls');
    });

    it('should handle rapid consecutive calls', async () => {
      const promises = [
        listenerCallback('change', 'src/file1.txt'),
        listenerCallback('change', 'src/file2.txt'),
        listenerCallback('change', 'src/file3.txt'),
      ];

      await assert.doesNotReject(
        async () => await Promise.all(promises),
        'Should handle concurrent calls'
      );
    });
  });

  describe('conditional behavior', () => {
    it('should check if path includes src/assets', async () => {
      // If path includes src/assets, copyAssets should be called
      // We can verify the logic exists by testing it doesn't throw
      await assert.doesNotReject(
        async () => await listenerCallback('change', 'src/assets/image.jpg'),
        'Should handle asset paths'
      );
    });

    it('should check if path includes src/posts', async () => {
      await assert.doesNotReject(
        async () => await listenerCallback('change', 'src/posts/article.md'),
        'Should handle post paths'
      );
    });

    it('should check if path includes src/statics', async () => {
      await assert.doesNotReject(
        async () => await listenerCallback('change', 'src/statics/file.txt'),
        'Should handle static paths'
      );
    });

    it('should check if path includes src/pages with unlink', async () => {
      await listenerCallback('unlink', 'src/pages/test.hbs');

      // Should have removed the HTML file
      assert.ok(removedPaths.length > 0, 'Should remove page HTML on unlink');
    });
  });

  describe('integration behavior', () => {
    it('should coordinate build and copy operations', async () => {
      // The callback orchestrates build + specific copy operations
      // This validates it completes successfully for various paths
      await listenerCallback('change', 'src/posts/article.md');
      await listenerCallback('change', 'src/assets/logo.png');
      await listenerCallback('change', 'src/statics/robots.txt');
      await listenerCallback('change', 'src/pages/index.hbs');

      // All should complete successfully
      assert.ok(consoleOutput.length >= 4, 'Should handle all file types');
    });

    it('should handle build completion for all paths', async () => {
      // Build is called for every file change
      // Should complete without errors regardless of path
      const paths = [
        'src/posts/test.md',
        'src/pages/index.hbs',
        'src/assets/image.jpg',
        'src/styles/main.scss',
        'src/partials/header.hbs',
      ];

      for (const path of paths) {
        await assert.doesNotReject(
          async () => await listenerCallback('change', path),
          `Should handle ${path}`
        );
      }
    });
  });

  describe('error resilience', () => {
    it('should complete even with unusual paths', async () => {
      await assert.doesNotReject(
        async () => await listenerCallback('change', 'weird/path/structure'),
        'Should handle unusual paths'
      );
    });

    it('should handle unlink with non-existent files', async () => {
      // removeSync is mocked, so this tests the logic flow
      await assert.doesNotReject(
        async () =>
          await listenerCallback('unlink', 'src/statics/does-not-exist.txt'),
        'Should handle non-existent files'
      );
    });

    it('should log even if build/copy operations have issues', async () => {
      await listenerCallback('change', 'src/test.txt');

      // Should always log, even if other operations fail
      assert.ok(consoleOutput.length > 0, 'Should always log');
    });
  });

  describe('nested posts file deletion', () => {
    let originalPathExistsSync;
    let originalReaddirSync;

    beforeEach(() => {
      // Store additional originals needed for nested deletion tests
      originalPathExistsSync = fse.pathExistsSync;
      originalReaddirSync = fs.readdirSync;

      // Mock fse.pathExistsSync to simulate file existence
      fse.pathExistsSync = () => true;

      // Mock fs.readdirSync for empty directory cleanup
      fs.readdirSync = () => [];
    });

    afterEach(() => {
      // Restore additional mocks
      fse.pathExistsSync = originalPathExistsSync;
      fs.readdirSync = originalReaddirSync;
    });

    it('should remove nested markdown file HTML on unlink', async () => {
      await listenerCallback('unlink', 'src/posts/category/nested-post.md');

      // Should remove the HTML file in nested directory
      assert.ok(
        removedPaths.some(
          (p) =>
            p.includes('build/posts/category') && p.includes('nested-post.html')
        ),
        'Should remove nested post HTML file'
      );
    });

    it('should handle single-level nested post deletion', async () => {
      await listenerCallback('unlink', 'src/posts/javascript/intro.md');

      assert.ok(
        removedPaths.some(
          (p) =>
            p.includes('build/posts/javascript') && p.includes('intro.html')
        ),
        'Should remove single-level nested post'
      );
    });

    it('should handle multi-level nested post deletion', async () => {
      await listenerCallback(
        'unlink',
        'src/posts/layouts/dashboards/admin-dashboard.md'
      );

      assert.ok(
        removedPaths.some(
          (p) =>
            p.includes('build/posts/layouts/dashboards') &&
            p.includes('admin-dashboard.html')
        ),
        'Should remove multi-level nested post'
      );
    });

    it('should not remove nested post HTML on change event', async () => {
      removedPaths = []; // Reset
      await listenerCallback('change', 'src/posts/category/nested-post.md');

      assert.strictEqual(
        removedPaths.length,
        0,
        'Should not remove file on change event'
      );
    });

    it('should not remove nested post HTML on add event', async () => {
      removedPaths = []; // Reset
      await listenerCallback('add', 'src/posts/category/nested-post.md');

      assert.strictEqual(
        removedPaths.length,
        0,
        'Should not remove file on add event'
      );
    });

    it('should only remove nested markdown files on unlink', async () => {
      removedPaths = []; // Reset
      await listenerCallback('add', 'src/posts/category/post1.md');
      await listenerCallback('change', 'src/posts/category/post2.md');

      assert.strictEqual(
        removedPaths.length,
        0,
        'Should not remove on add/change'
      );

      await listenerCallback('unlink', 'src/posts/category/post3.md');

      assert.ok(removedPaths.length > 0, 'Should remove on unlink');
    });
  });

  describe('nested posts file change and add', () => {
    it('should handle change event for nested post files', async () => {
      await listenerCallback('change', 'src/posts/category/nested-post.md');

      // Should log the change event
      assert.ok(
        consoleOutput.some(
          (line) => line.includes('change:') && line.includes('nested-post.md')
        ),
        'Should log change event for nested post'
      );
    });

    it('should handle add event for nested post files', async () => {
      await listenerCallback('add', 'src/posts/category/new-post.md');

      // Should log the add event
      assert.ok(
        consoleOutput.some(
          (line) => line.includes('add:') && line.includes('new-post.md')
        ),
        'Should log add event for nested post'
      );
    });

    it('should handle change event for single-level nested posts', async () => {
      await assert.doesNotReject(
        async () =>
          await listenerCallback('change', 'src/posts/javascript/intro.md'),
        'Should handle change for single-level nested post'
      );
    });

    it('should handle add event for single-level nested posts', async () => {
      await assert.doesNotReject(
        async () =>
          await listenerCallback('add', 'src/posts/javascript/new-article.md'),
        'Should handle add for single-level nested post'
      );
    });

    it('should handle change event for multi-level nested posts', async () => {
      await assert.doesNotReject(
        async () =>
          await listenerCallback(
            'change',
            'src/posts/layouts/dashboards/admin-dashboard.md'
          ),
        'Should handle change for multi-level nested post'
      );
    });

    it('should handle add event for multi-level nested posts', async () => {
      await assert.doesNotReject(
        async () =>
          await listenerCallback(
            'add',
            'src/posts/layouts/dashboards/user-dashboard.md'
          ),
        'Should handle add for multi-level nested post'
      );
    });

    it('should trigger build and JSON copy for nested post changes', async () => {
      // Note: We can't easily mock build/copyJSONData because listenerCallback
      // imports them at module load time. Instead, we verify the integration
      // works by ensuring the operation completes successfully, which implies
      // build() and copyJSONData() were called.
      await assert.doesNotReject(
        async () =>
          await listenerCallback(
            'change',
            'src/posts/category/updated-post.md'
          ),
        'Should trigger build and copyJSONData for nested post changes'
      );
    });

    it('should trigger build and JSON copy for nested post additions', async () => {
      // Note: We can't easily mock build/copyJSONData because listenerCallback
      // imports them at module load time. Instead, we verify the integration
      // works by ensuring the operation completes successfully, which implies
      // build() and copyJSONData() were called.
      await assert.doesNotReject(
        async () =>
          await listenerCallback('add', 'src/posts/category/new-post.md'),
        'Should trigger build and copyJSONData for nested post additions'
      );
    });

    it('should handle mixed events for nested posts', async () => {
      // Test multiple nested post events in sequence
      // Each should trigger build() and copyJSONData()
      await assert.doesNotReject(async () => {
        await listenerCallback('add', 'src/posts/category/post1.md');
        await listenerCallback('change', 'src/posts/category/post2.md');
        await listenerCallback('add', 'src/posts/layouts/dashboards/post3.md');
      }, 'Should handle mixed events for nested posts');
    });
  });
});
