import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import Handlebars from 'handlebars';
import generatePartials from '../scripts/build/generate-partials.js';

describe('Generate Partials', () => {
  let originalExistsSync;
  let originalReaddirSync;
  let originalReadFileSync;
  let originalCwd;

  beforeEach(() => {
    // Store originals
    originalExistsSync = fs.existsSync;
    originalReaddirSync = fs.readdirSync;
    originalReadFileSync = fs.readFileSync;
    originalCwd = process.cwd;

    // Mock process.cwd to return consistent path
    process.cwd = () => '/test';

    // Clear any existing partials
    Handlebars.unregisterPartial('header');
    Handlebars.unregisterPartial('footer');
    Handlebars.unregisterPartial('navigation');
    Handlebars.unregisterPartial('my-partial');
    Handlebars.unregisterPartial('test-partial');
    Handlebars.unregisterPartial('valid');
    Handlebars.unregisterPartial('rich-content');
    Handlebars.unregisterPartial('conditional');
    Handlebars.unregisterPartial('layout');
    Handlebars.unregisterPartial('content');
    Handlebars.unregisterPartial('sidebar');
    Handlebars.unregisterPartial('article');
  });

  afterEach(() => {
    // Restore originals
    fs.existsSync = originalExistsSync;
    fs.readdirSync = originalReaddirSync;
    fs.readFileSync = originalReadFileSync;
    process.cwd = originalCwd;
  });

  describe('basic functionality', () => {
    it('should register all .hbs files in partials directory', () => {
      // Mock fs functions
      fs.existsSync = () => true;
      fs.readdirSync = () => ['header.hbs', 'footer.hbs', 'navigation.hbs'];

      // Mock fs.readFileSync (used by to-vfile under the hood)
      fs.readFileSync = (filePath) => {
        if (filePath.includes('header.hbs')) {
          return Buffer.from('<header>Header Content</header>');
        }
        if (filePath.includes('footer.hbs')) {
          return Buffer.from('<footer>Footer Content</footer>');
        }
        if (filePath.includes('navigation.hbs')) {
          return Buffer.from('<nav>Nav Content</nav>');
        }
        return Buffer.from('');
      };

      generatePartials();

      // Test that partials are registered and usable
      const headerTemplate = Handlebars.compile('{{> header}}');
      const footerTemplate = Handlebars.compile('{{> footer}}');
      const navTemplate = Handlebars.compile('{{> navigation}}');

      assert.ok(
        headerTemplate({}).includes('Header Content'),
        'Header partial should be registered'
      );
      assert.ok(
        footerTemplate({}).includes('Footer Content'),
        'Footer partial should be registered'
      );
      assert.ok(
        navTemplate({}).includes('Nav Content'),
        'Navigation partial should be registered'
      );
    });

    it('should convert file names to partial names by removing .hbs', () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['my-partial.hbs'];
      fs.readFileSync = () => Buffer.from('<div>My Partial</div>');

      generatePartials();

      // Partial name should be 'my-partial' not 'my-partial.hbs'
      const template = Handlebars.compile('{{> my-partial}}');
      const result = template({});

      assert.ok(
        result.includes('My Partial'),
        'Partial name should not include .hbs extension'
      );
    });

    it('should make partials available in Handlebars after registration', () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['test-partial.hbs'];
      fs.readFileSync = () => Buffer.from('Test Content');

      generatePartials();

      // Verify partial is in Handlebars registry
      const partials = Handlebars.partials;
      assert.ok(partials['test-partial'], 'Partial should be in registry');
    });
  });

  describe('file filtering', () => {
    it('should skip non-.hbs files', () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => [
        'valid.hbs',
        'readme.md',
        'script.js',
        'styles.css',
      ];

      let readCount = 0;
      fs.readFileSync = () => {
        readCount++;
        return Buffer.from('Content');
      };

      generatePartials();

      // Should only read the .hbs file
      assert.strictEqual(readCount, 1, 'Should only read .hbs files');

      // Only valid partial should be registered
      const template = Handlebars.compile('{{> valid}}');
      assert.ok(
        template({}).includes('Content'),
        'Valid partial should be registered'
      );

      // Non-.hbs files should not be registered
      assert.ok(
        !Handlebars.partials['readme'],
        'Non-.hbs files should not be registered'
      );
    });

    it('should handle directory with only non-.hbs files', () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['readme.md', 'config.json'];

      let readCalled = false;
      fs.readFileSync = () => {
        readCalled = true;
        return Buffer.from('');
      };

      // Capture console.log
      const originalLog = console.log;
      let logOutput = '';
      console.log = (msg) => {
        logOutput += msg;
      };

      generatePartials();

      console.log = originalLog;

      // Should not try to read any files
      assert.strictEqual(readCalled, false, 'Should not read non-.hbs files');

      // Should log warning about no .hbs files
      assert.ok(
        logOutput.includes('No .hbs files found'),
        'Should warn about no .hbs files'
      );
    });
  });

  describe('error handling', () => {
    it('should handle missing partials directory gracefully', () => {
      fs.existsSync = () => false;

      // Capture console.log
      const originalLog = console.log;
      let logOutput = '';
      console.log = (msg) => {
        logOutput += msg;
      };

      // Should not throw
      assert.doesNotThrow(() => {
        generatePartials();
      }, 'Should handle missing directory gracefully');

      console.log = originalLog;

      // Should log warning
      assert.ok(
        logOutput.includes('No partials directory found'),
        'Should warn about missing directory'
      );
    });

    it('should handle empty partials directory', async () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => [];

      // Capture console.log
      const originalLog = console.log;
      let logOutput = '';
      console.log = (msg) => {
        logOutput += msg;
      };

      generatePartials();

      console.log = originalLog;

      // Should log warning
      assert.ok(
        logOutput.includes('No .hbs files found'),
        'Should warn about empty directory'
      );
    });

    it('should handle file read errors gracefully', () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['error.hbs', 'valid.hbs'];

      fs.readFileSync = (filePath) => {
        if (filePath.includes('error.hbs')) {
          throw new Error('File read error');
        }
        return Buffer.from('Valid content');
      };

      // Should throw error (current implementation doesn't catch read errors)
      assert.throws(() => {
        generatePartials();
      }, 'Should propagate file read errors');
    });
  });

  describe('partial content', () => {
    it('should preserve HTML content in partials', () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['rich-content.hbs'];

      const richHtml = `
        <div class="card">
          <h2>{{title}}</h2>
          <p>{{description}}</p>
          <a href="{{link}}">Read more</a>
        </div>
      `;

      fs.readFileSync = () => Buffer.from(richHtml);

      generatePartials();

      // Use the partial with data
      const template = Handlebars.compile('{{> rich-content}}');
      const result = template({
        title: 'Test Title',
        description: 'Test Description',
        link: '/test',
      });

      assert.ok(result.includes('Test Title'), 'Should render title');
      assert.ok(
        result.includes('Test Description'),
        'Should render description'
      );
      assert.ok(result.includes('/test'), 'Should render link');
    });

    it('should handle partials with Handlebars expressions', () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['conditional.hbs'];

      const conditionalPartial = `
        {{#if showContent}}
          <div>Content is shown</div>
        {{else}}
          <div>Content is hidden</div>
        {{/if}}
      `;

      fs.readFileSync = () => Buffer.from(conditionalPartial);

      generatePartials();

      // Test with showContent = true
      const template1 = Handlebars.compile('{{> conditional}}');
      const result1 = template1({ showContent: true });
      assert.ok(
        result1.includes('Content is shown'),
        'Should render if block when true'
      );

      // Test with showContent = false
      const template2 = Handlebars.compile('{{> conditional}}');
      const result2 = template2({ showContent: false });
      assert.ok(
        result2.includes('Content is hidden'),
        'Should render else block when false'
      );
    });

    it('should handle nested partial references', () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => ['layout.hbs', 'content.hbs'];

      fs.readFileSync = (filePath) => {
        if (filePath.includes('layout.hbs')) {
          return Buffer.from('<div>{{> content}}</div>');
        }
        if (filePath.includes('content.hbs')) {
          return Buffer.from('<p>Inner content</p>');
        }
        return Buffer.from('');
      };

      generatePartials();

      // Use layout partial which includes content partial
      const template = Handlebars.compile('{{> layout}}');
      const result = template({});

      assert.ok(
        result.includes('Inner content'),
        'Should handle nested partials'
      );
    });
  });

  describe('multiple files', () => {
    it('should register multiple partials from different files', () => {
      fs.existsSync = () => true;
      fs.readdirSync = () => [
        'header.hbs',
        'footer.hbs',
        'sidebar.hbs',
        'article.hbs',
      ];

      fs.readFileSync = (filePath) => {
        if (filePath.includes('header.hbs')) return Buffer.from('HEADER');
        if (filePath.includes('footer.hbs')) return Buffer.from('FOOTER');
        if (filePath.includes('sidebar.hbs')) return Buffer.from('SIDEBAR');
        if (filePath.includes('article.hbs')) return Buffer.from('ARTICLE');
        return Buffer.from('');
      };

      generatePartials();

      // All should be registered
      const template = Handlebars.compile(
        '{{> header}} {{> sidebar}} {{> article}} {{> footer}}'
      );
      const result = template({});

      assert.ok(result.includes('HEADER'), 'Header should be registered');
      assert.ok(result.includes('FOOTER'), 'Footer should be registered');
      assert.ok(result.includes('SIDEBAR'), 'Sidebar should be registered');
      assert.ok(result.includes('ARTICLE'), 'Article should be registered');
    });
  });
});
