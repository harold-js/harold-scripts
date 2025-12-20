import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import Handlebars from 'handlebars';
import generatePages from '../scripts/build/generate-pages.js';

describe('Generate Pages', () => {
  let originalExistsSync;
  let originalReaddirSync;
  let originalReadFileSync;
  let originalWriteFileSync;
  let originalMkdirSync;
  let originalCwd;
  let writtenFiles;

  beforeEach(() => {
    // Store originals
    originalExistsSync = fs.existsSync;
    originalReaddirSync = fs.readdirSync;
    originalReadFileSync = fs.readFileSync;
    originalWriteFileSync = fs.writeFileSync;
    originalMkdirSync = fs.mkdirSync;
    originalCwd = process.cwd;

    // Mock process.cwd to return consistent path
    process.cwd = () => '/test';

    // Track written files
    writtenFiles = {};

    // Mock fs.mkdirSync to track directory creation
    fs.mkdirSync = (dirPath, options) => {
      // Do nothing, just track
    };

    // Mock fs.writeFileSync to capture written content
    fs.writeFileSync = (filePath, content) => {
      writtenFiles[filePath] = content;
    };
  });

  afterEach(() => {
    // Restore originals
    fs.existsSync = originalExistsSync;
    fs.readdirSync = originalReaddirSync;
    fs.readFileSync = originalReadFileSync;
    fs.writeFileSync = originalWriteFileSync;
    fs.mkdirSync = originalMkdirSync;
    process.cwd = originalCwd;
  });

  describe('basic functionality', () => {
    it('should compile .hbs files to HTML', async () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['index.hbs'];
      fs.readFileSync = (filePath) => {
        if (filePath.includes('index.hbs')) {
          return Buffer.from('<html><body><h1>Hello World</h1></body></html>');
        }
        return Buffer.from('');
      };

      await generatePages();

      // Check that HTML was written
      const outputPath = '/test/build/index.html';
      assert.ok(writtenFiles[outputPath], 'Should write index.html');
      assert.ok(
        writtenFiles[outputPath].includes('Hello World'),
        'Should contain page content'
      );
    });

    it('should pass publicRelativeFileDir to templates', async () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['page-with-var.hbs'];
      fs.readFileSync = (filePath) => {
        if (filePath.includes('page-with-var.hbs')) {
          return Buffer.from(
            '<html><body><p>Public dir: {{publicRelativeFileDir}}</p></body></html>'
          );
        }
        return Buffer.from('');
      };

      await generatePages();

      const outputPath = '/test/build/page-with-var.html';
      assert.ok(writtenFiles[outputPath], 'Should write output file');
      assert.ok(
        writtenFiles[outputPath].includes('Public dir: build'),
        'Should inject publicRelativeFileDir variable'
      );
    });

    it('should preserve file names without .hbs extension', async () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['about.hbs', 'contact.hbs'];
      fs.readFileSync = () => Buffer.from('<html><body>Content</body></html>');

      await generatePages();

      // Should create about.html and contact.html
      assert.ok(writtenFiles['/test/build/about.html'], 'Should create about.html');
      assert.ok(
        writtenFiles['/test/build/contact.html'],
        'Should create contact.html'
      );
    });

    it('should process multiple .hbs files', async () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['page1.hbs', 'page2.hbs', 'page3.hbs'];
      fs.readFileSync = (filePath) => {
        if (filePath.includes('page1.hbs'))
          return Buffer.from('<html><body>Page 1</body></html>');
        if (filePath.includes('page2.hbs'))
          return Buffer.from('<html><body>Page 2</body></html>');
        if (filePath.includes('page3.hbs'))
          return Buffer.from('<html><body>Page 3</body></html>');
        return Buffer.from('');
      };

      await generatePages();

      // All pages should be written
      assert.ok(writtenFiles['/test/build/page1.html'], 'Should create page1.html');
      assert.ok(writtenFiles['/test/build/page2.html'], 'Should create page2.html');
      assert.ok(writtenFiles['/test/build/page3.html'], 'Should create page3.html');

      // Verify content
      assert.ok(writtenFiles['/test/build/page1.html'].includes('Page 1'));
      assert.ok(writtenFiles['/test/build/page2.html'].includes('Page 2'));
      assert.ok(writtenFiles['/test/build/page3.html'].includes('Page 3'));
    });
  });

  describe('file filtering', () => {
    it('should skip non-.hbs files', async () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => [
        'index.hbs',
        'readme.md',
        'script.js',
        'styles.css',
      ];
      fs.readFileSync = (filePath) => {
        if (filePath.includes('.hbs')) {
          return Buffer.from('<html><body>Page</body></html>');
        }
        return Buffer.from('');
      };

      await generatePages();

      // Only .hbs file should be processed
      assert.ok(
        writtenFiles['/test/build/index.html'],
        'Should process .hbs file'
      );
      assert.ok(
        !writtenFiles['/test/build/readme.html'],
        'Should not process .md file'
      );
      assert.ok(
        !writtenFiles['/test/build/script.html'],
        'Should not process .js file'
      );
    });

    it('should handle directory with only non-.hbs files', async () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['readme.md', 'config.json'];

      // Capture console.log
      const originalLog = console.log;
      let logOutput = '';
      console.log = (msg) => {
        logOutput += msg;
      };

      await generatePages();

      console.log = originalLog;

      // Should not write any files
      assert.strictEqual(
        Object.keys(writtenFiles).length,
        0,
        'Should not write any files'
      );

      // Should log warning
      assert.ok(
        logOutput.includes('No .hbs files found'),
        'Should warn about no .hbs files'
      );
    });
  });

  describe('error handling', () => {
    it('should handle missing pages directory gracefully', async () => {
      fs.existsSync = () => false;

      // Capture console.log
      const originalLog = console.log;
      let logOutput = '';
      console.log = (msg) => {
        logOutput += msg;
      };

      await generatePages();

      console.log = originalLog;

      // Should not throw
      assert.strictEqual(
        Object.keys(writtenFiles).length,
        0,
        'Should not write any files'
      );

      // Should log warning
      assert.ok(
        logOutput.includes('No pages directory found'),
        'Should warn about missing directory'
      );
    });

    it('should handle empty pages directory', async () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => [];

      // Capture console.log
      const originalLog = console.log;
      let logOutput = '';
      console.log = (msg) => {
        logOutput += msg;
      };

      await generatePages();

      console.log = originalLog;

      // Should not write any files
      assert.strictEqual(
        Object.keys(writtenFiles).length,
        0,
        'Should not write any files'
      );

      // Should log warning
      assert.ok(
        logOutput.includes('No .hbs files found'),
        'Should warn about empty directory'
      );
    });

    it('should handle Handlebars compilation errors', async () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['broken.hbs'];
      fs.readFileSync = () =>
        Buffer.from('<html>{{#if unclosed}</html>'); // Malformed template

      // Should throw error
      await assert.rejects(
        async () => {
          await generatePages();
        },
        (err) => {
          return err.message.includes('Parse error') || err.name === 'Error';
        },
        'Should throw on template compilation error'
      );
    });
  });

  describe('Handlebars integration', () => {
    it('should support Handlebars expressions', async () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['dynamic.hbs'];
      fs.readFileSync = () =>
        Buffer.from(`
        <html>
          <body>
            {{#if publicRelativeFileDir}}
              <p>Has public dir</p>
            {{/if}}
          </body>
        </html>
      `);

      await generatePages();

      const output = writtenFiles['/test/build/dynamic.html'];
      assert.ok(output, 'Should create output file');
      assert.ok(
        output.includes('Has public dir'),
        'Should evaluate if expression'
      );
    });

    it('should support Handlebars helpers', async () => {
      // Register a custom helper for testing
      Handlebars.registerHelper('uppercase', (str) => {
        return str.toUpperCase();
      });

      fs.existsSync = () => true;
      fs.readdirSync = () => ['helper-test.hbs'];
      fs.readFileSync = () =>
        Buffer.from('<html><body>{{uppercase "hello"}}</body></html>');

      await generatePages();

      const output = writtenFiles['/test/build/helper-test.html'];
      assert.ok(output, 'Should create output file');
      assert.ok(output.includes('HELLO'), 'Should use custom helper');

      // Cleanup
      Handlebars.unregisterHelper('uppercase');
    });

    it('should support Handlebars partials', async () => {
      // Register a partial for testing
      Handlebars.registerPartial('test-partial', '<p>Partial content</p>');

      fs.existsSync = () => true;
      fs.readdirSync = () => ['with-partial.hbs'];
      fs.readFileSync = () =>
        Buffer.from('<html><body>{{> test-partial}}</body></html>');

      await generatePages();

      const output = writtenFiles['/test/build/with-partial.html'];
      assert.ok(output, 'Should create output file');
      assert.ok(
        output.includes('Partial content'),
        'Should render partial'
      );

      // Cleanup
      Handlebars.unregisterPartial('test-partial');
    });
  });

  describe('HTML minification', () => {
    it('should minify HTML output when config.minifyHtml is true', async () => {
      // Mock config
      const configModule = await import('../scripts/build/constants.js');
      const originalMinifyHtml = configModule.default.minifyHtml;
      configModule.default.minifyHtml = true;

      fs.existsSync = () => true;
      fs.readdirSync = () => ['minify-test.hbs'];
      fs.readFileSync = () =>
        Buffer.from(`
        <html>
          <head>
            <title>Test</title>
          </head>
          <body>
            <h1>Hello</h1>
            <p>World</p>
          </body>
        </html>
      `);

      await generatePages();

      const output = writtenFiles['/test/build/minify-test.html'];
      assert.ok(output, 'Should create output file');
      
      // Minified HTML should have less whitespace
      assert.ok(
        !output.includes('\n        '),
        'Should remove extra whitespace'
      );

      // Restore config
      configModule.default.minifyHtml = originalMinifyHtml;
    });

    it('should skip minification when config.minifyHtml is false', async () => {
      // Mock config
      const configModule = await import('../scripts/build/constants.js');
      const originalMinifyHtml = configModule.default.minifyHtml;
      configModule.default.minifyHtml = false;

      fs.existsSync = () => true;
      fs.readdirSync = () => ['no-minify.hbs'];
      fs.readFileSync = () =>
        Buffer.from(`<html>
  <body>
    <h1>Test</h1>
  </body>
</html>`);

      await generatePages();

      const output = writtenFiles['/test/build/no-minify.html'];
      assert.ok(output, 'Should create output file');
      
      // Should preserve formatting (though Handlebars may affect it slightly)
      assert.ok(output.includes('Test'), 'Should contain content');

      // Restore config
      configModule.default.minifyHtml = originalMinifyHtml;
    });
  });

  describe('output path', () => {
    it('should write output to correct location', async () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['test-page.hbs'];
      fs.readFileSync = () => Buffer.from('<html><body>Test</body></html>');

      await generatePages();

      // Should write to build/test-page.html
      const expectedPath = '/test/build/test-page.html';
      assert.ok(
        writtenFiles[expectedPath],
        `Should write to ${expectedPath}`
      );
    });

    it('should handle nested file paths correctly', async () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['my.page.name.hbs'];
      fs.readFileSync = () => Buffer.from('<html><body>Test</body></html>');

      await generatePages();

      // Should use first part before extension as filename
      const expectedPath = '/test/build/my.page.name.html';
      assert.ok(
        writtenFiles[expectedPath],
        'Should handle dotted filenames'
      );
    });
  });
});

