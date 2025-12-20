import { describe, it } from 'node:test';
import assert from 'node:assert';
import rehypeImgAttrs from '../scripts/build/rehype-img-attrs.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to create a simple 1x1 PNG image buffer
const create1x1PNG = () => {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
};

describe('Rehype Image Attributes Plugin', () => {

  describe('loading attribute', () => {
    it('should add loading="lazy" to images without it', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'https://example.com/image.jpg',
              alt: 'Test Image',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeImgAttrs();
      plugin(tree);

      assert.strictEqual(
        tree.children[0].properties.loading,
        'lazy',
        'Should add loading="lazy"'
      );
    });

    it('should preserve existing loading attribute', async () => {
      // Create an AST node directly since markdown can't express loading attribute
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'test.jpg',
              loading: 'eager',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeImgAttrs();
      plugin(tree);

      assert.strictEqual(
        tree.children[0].properties.loading,
        'eager',
        'Should preserve existing loading attribute'
      );
    });
  });

  describe('decoding attribute', () => {
    it('should add decoding="async" to images without it', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'https://example.com/image.jpg',
              alt: 'Test Image',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeImgAttrs();
      plugin(tree);

      assert.strictEqual(
        tree.children[0].properties.decoding,
        'async',
        'Should add decoding="async"'
      );
    });

    it('should preserve existing decoding attribute', async () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'test.jpg',
              decoding: 'sync',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeImgAttrs();
      plugin(tree);

      assert.strictEqual(
        tree.children[0].properties.decoding,
        'sync',
        'Should preserve existing decoding attribute'
      );
    });
  });

  describe('dimension extraction', () => {
    it('should not extract dimensions from HTTP URLs', async () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'http://example.com/image.jpg',
              alt: 'Test',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeImgAttrs();
      plugin(tree);

      assert.ok(
        !tree.children[0].properties.width,
        'Should not add width for HTTP URLs'
      );
      assert.ok(
        !tree.children[0].properties.height,
        'Should not add height for HTTP URLs'
      );
    });

    it('should not extract dimensions from HTTPS URLs', async () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'https://example.com/image.jpg',
              alt: 'Test',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeImgAttrs();
      plugin(tree);

      assert.ok(
        !tree.children[0].properties.width,
        'Should not add width for HTTPS URLs'
      );
      assert.ok(
        !tree.children[0].properties.height,
        'Should not add height for HTTPS URLs'
      );
    });

    it('should handle non-existent local images gracefully', async () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'non-existent-image.jpg',
              alt: 'Test',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeImgAttrs();
      
      // Should not throw
      assert.doesNotThrow(() => {
        plugin(tree);
      }, 'Should handle non-existent images gracefully');

      assert.ok(
        !tree.children[0].properties.width,
        'Should not add width for non-existent images'
      );
    });

    it('should preserve existing width and height', async () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'test.jpg',
              alt: 'Test',
              width: 500,
              height: 300,
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeImgAttrs();
      plugin(tree);

      assert.strictEqual(
        tree.children[0].properties.width,
        500,
        'Should preserve existing width'
      );
      assert.strictEqual(
        tree.children[0].properties.height,
        300,
        'Should preserve existing height'
      );
    });
  });

  describe('alt text validation', () => {
    it('should warn about missing alt text', async () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'test.jpg',
            },
            children: [],
          },
        ],
      };

      // Capture console.log output
      const originalLog = console.log;
      let logOutput = '';
      console.log = (msg) => {
        logOutput += msg;
      };

      const plugin = rehypeImgAttrs();
      plugin(tree);

      console.log = originalLog;

      assert.ok(
        logOutput.includes('missing alt text'),
        'Should warn about missing alt text'
      );
    });

    it('should warn about empty alt text', async () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'test.jpg',
              alt: '   ',
            },
            children: [],
          },
        ],
      };

      const originalLog = console.log;
      let logOutput = '';
      console.log = (msg) => {
        logOutput += msg;
      };

      const plugin = rehypeImgAttrs();
      plugin(tree);

      console.log = originalLog;

      assert.ok(
        logOutput.includes('missing alt text'),
        'Should warn about empty alt text'
      );
    });

    it('should not warn when alt text is present', async () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'test.jpg',
              alt: 'A descriptive alt text',
            },
            children: [],
          },
        ],
      };

      const originalLog = console.log;
      let logOutput = '';
      console.log = (msg) => {
        logOutput += msg;
      };

      const plugin = rehypeImgAttrs();
      plugin(tree);

      console.log = originalLog;

      assert.ok(
        !logOutput.includes('missing alt text'),
        'Should not warn when alt text is present'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle nodes without properties', async () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            // No properties
            children: [],
          },
        ],
      };

      const plugin = rehypeImgAttrs();
      
      assert.doesNotThrow(() => {
        plugin(tree);
      }, 'Should handle nodes without properties');
    });

    it('should handle non-img elements', async () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: {
              src: 'test.jpg',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeImgAttrs();
      plugin(tree);

      assert.ok(
        !tree.children[0].properties.loading,
        'Should not add loading to non-img elements'
      );
    });

    it('should handle corrupted image files gracefully', async () => {
      // Create a corrupted "image" file
      const corruptDir = path.join(__dirname, 'fixtures', 'corrupt');
      fs.mkdirSync(corruptDir, { recursive: true });
      const corruptPath = path.join(corruptDir, 'corrupt.png');
      fs.writeFileSync(corruptPath, 'This is not a valid PNG file');

      const relativePath = path.relative(process.cwd(), corruptPath);
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: relativePath,
              alt: 'Test',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeImgAttrs({
        publicPath: path.dirname(corruptPath),
        srcPath: 'src',
      });

      assert.doesNotThrow(() => {
        plugin(tree);
      }, 'Should handle corrupted images gracefully');

      // Cleanup
      fs.unlinkSync(corruptPath);
      fs.rmSync(corruptDir, { recursive: true, force: true });
    });
  });

  describe('integration', () => {
    it('should process multiple images in one document', async () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'https://example.com/image1.jpg',
              alt: 'Image 1',
            },
            children: [],
          },
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'https://example.com/image2.jpg',
              alt: 'Image 2',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeImgAttrs();
      plugin(tree);

      assert.strictEqual(
        tree.children[0].properties.loading,
        'lazy',
        'First image should have loading'
      );
      assert.strictEqual(
        tree.children[1].properties.loading,
        'lazy',
        'Second image should have loading'
      );
      assert.strictEqual(
        tree.children[0].properties.decoding,
        'async',
        'First image should have decoding'
      );
      assert.strictEqual(
        tree.children[1].properties.decoding,
        'async',
        'Second image should have decoding'
      );
    });
  });
});

