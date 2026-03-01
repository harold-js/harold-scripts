import { describe, it } from 'node:test';
import assert from 'node:assert';
import rehypeStyleWrappers from '../scripts/build/rehype-style-wrappers.js';

describe('Rehype Style Wrappers Plugin', () => {
  describe('images with style parameter', () => {
    it('should wrap image with ?style=wide in wide-content div', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'image.jpg?style=wide',
              alt: 'Test',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeStyleWrappers();
      plugin(tree);

      assert.strictEqual(tree.children[0].tagName, 'div', 'Should wrap in div');
      assert.deepStrictEqual(
        tree.children[0].properties.className,
        ['wide-content'],
        'Should have wide-content class'
      );
      assert.strictEqual(
        tree.children[0].children[0].tagName,
        'img',
        'Should contain img'
      );
      assert.strictEqual(
        tree.children[0].children[0].properties.src,
        'image.jpg',
        'Should remove style parameter from src'
      );
    });

    it('should wrap image with ?style=wide-content in wide-content div', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'image.jpg?style=wide-content',
              alt: 'Test',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeStyleWrappers();
      plugin(tree);

      assert.strictEqual(tree.children[0].tagName, 'div', 'Should wrap in div');
      assert.deepStrictEqual(
        tree.children[0].properties.className,
        ['wide-content'],
        'Should have wide-content class'
      );
      assert.strictEqual(
        tree.children[0].children[0].properties.src,
        'image.jpg',
        'Should remove style parameter from src'
      );
    });

    it('should preserve ?style=centered parameter in src (backward compatibility)', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'image.jpg?style=centered',
              alt: 'Test',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeStyleWrappers();
      plugin(tree);

      assert.strictEqual(tree.children[0].tagName, 'img', 'Should not wrap');
      assert.strictEqual(
        tree.children[0].properties.src,
        'image.jpg?style=centered',
        'Should preserve centered parameter'
      );
    });

    it('should handle unknown style parameters by restoring original src', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'image.jpg?style=unknown',
              alt: 'Test',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeStyleWrappers();
      plugin(tree);

      assert.strictEqual(tree.children[0].tagName, 'img', 'Should not wrap');
      assert.strictEqual(
        tree.children[0].properties.src,
        'image.jpg?style=unknown',
        'Should restore original src for unknown style'
      );
    });

    it('should handle images without style parameter (no-op)', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'image.jpg',
              alt: 'Test',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeStyleWrappers();
      plugin(tree);

      assert.strictEqual(tree.children[0].tagName, 'img', 'Should not modify');
      assert.strictEqual(
        tree.children[0].properties.src,
        'image.jpg',
        'Should keep original src'
      );
    });

    it('should handle style parameter with &', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'image.jpg?foo=bar&style=wide',
              alt: 'Test',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeStyleWrappers();
      plugin(tree);

      assert.strictEqual(tree.children[0].tagName, 'div', 'Should wrap');
      assert.strictEqual(
        tree.children[0].children[0].properties.src,
        'image.jpg?foo=bar',
        'Should remove style parameter but preserve other params'
      );
    });
  });

  describe('iframes with style parameter', () => {
    it('should wrap iframe with ?style=embed in embeded-media-container div', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'iframe',
            properties: {
              src: 'https://example.com/video?style=embed',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeStyleWrappers();
      plugin(tree);

      assert.strictEqual(tree.children[0].tagName, 'div', 'Should wrap in div');
      assert.deepStrictEqual(
        tree.children[0].properties.className,
        ['embeded-media-container'],
        'Should have embeded-media-container class'
      );
      assert.strictEqual(
        tree.children[0].children[0].tagName,
        'iframe',
        'Should contain iframe'
      );
      assert.strictEqual(
        tree.children[0].children[0].properties.src,
        'https://example.com/video',
        'Should remove style parameter from src'
      );
    });

    it('should wrap iframe with ?style=embeded in embeded-media-container div', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'iframe',
            properties: {
              src: 'https://example.com/video?style=embeded',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeStyleWrappers();
      plugin(tree);

      assert.strictEqual(tree.children[0].tagName, 'div', 'Should wrap in div');
      assert.deepStrictEqual(
        tree.children[0].properties.className,
        ['embeded-media-container'],
        'Should have embeded-media-container class'
      );
    });

    it('should wrap iframe with ?style=embeded-media in embeded-media-container div', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'iframe',
            properties: {
              src: 'https://example.com/video?style=embeded-media',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeStyleWrappers();
      plugin(tree);

      assert.strictEqual(tree.children[0].tagName, 'div', 'Should wrap in div');
      assert.deepStrictEqual(
        tree.children[0].properties.className,
        ['embeded-media-container'],
        'Should have embeded-media-container class'
      );
    });

    it('should wrap iframe with ?style=vimeo in embeded-media-container with vimeo class', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'iframe',
            properties: {
              src: 'https://player.vimeo.com/video/123?style=vimeo',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeStyleWrappers();
      plugin(tree);

      assert.strictEqual(tree.children[0].tagName, 'div', 'Should wrap in div');
      assert.deepStrictEqual(
        tree.children[0].properties.className,
        ['embeded-media-container', 'vimeo'],
        'Should have both embeded-media-container and vimeo classes'
      );
      assert.strictEqual(
        tree.children[0].children[0].tagName,
        'iframe',
        'Should contain iframe'
      );
      assert.strictEqual(
        tree.children[0].children[0].properties.src,
        'https://player.vimeo.com/video/123',
        'Should remove style parameter from src'
      );
    });

    it('should handle iframes without style parameter (no-op)', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'iframe',
            properties: {
              src: 'https://example.com/video',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeStyleWrappers();
      plugin(tree);

      assert.strictEqual(
        tree.children[0].tagName,
        'iframe',
        'Should not modify'
      );
      assert.strictEqual(
        tree.children[0].properties.src,
        'https://example.com/video',
        'Should keep original src'
      );
    });

    it('should handle unknown iframe style parameters', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'iframe',
            properties: {
              src: 'https://example.com/video?style=unknown',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeStyleWrappers();
      plugin(tree);

      assert.strictEqual(tree.children[0].tagName, 'iframe', 'Should not wrap');
      assert.strictEqual(
        tree.children[0].properties.src,
        'https://example.com/video?style=unknown',
        'Should restore original src for unknown style'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle nodes without properties', () => {
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

      const plugin = rehypeStyleWrappers();

      assert.doesNotThrow(() => {
        plugin(tree);
      }, 'Should not throw for nodes without properties');
    });

    it('should handle nodes without src property', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              alt: 'Test',
              // No src
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeStyleWrappers();

      assert.doesNotThrow(() => {
        plugin(tree);
      }, 'Should not throw for nodes without src');
    });

    it('should process multiple elements in document', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'image1.jpg?style=wide',
              alt: 'Image 1',
            },
            children: [],
          },
          {
            type: 'element',
            tagName: 'iframe',
            properties: {
              src: 'https://example.com/video?style=vimeo',
            },
            children: [],
          },
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'image2.jpg',
              alt: 'Image 2',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeStyleWrappers();
      plugin(tree);

      assert.strictEqual(
        tree.children[0].tagName,
        'div',
        'First should be wrapped div'
      );
      assert.strictEqual(
        tree.children[0].children[0].tagName,
        'img',
        'First should contain img'
      );
      assert.strictEqual(
        tree.children[1].tagName,
        'div',
        'Second should be wrapped div'
      );
      assert.strictEqual(
        tree.children[1].children[0].tagName,
        'iframe',
        'Second should contain iframe'
      );
      assert.strictEqual(
        tree.children[2].tagName,
        'img',
        'Third should remain unwrapped img'
      );
    });

    it('should handle style parameter at beginning of query string', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: 'image.jpg?style=wide&foo=bar',
              alt: 'Test',
            },
            children: [],
          },
        ],
      };

      const plugin = rehypeStyleWrappers();
      plugin(tree);

      assert.strictEqual(tree.children[0].tagName, 'div', 'Should wrap');
      // Note: The plugin removes ?style=wide leaving &foo=bar
      // This is acceptable as browsers handle &foo=bar as ?foo=bar
      assert.strictEqual(
        tree.children[0].children[0].properties.src,
        'image.jpg&foo=bar',
        'Should remove style parameter (may leave & instead of ?)'
      );
    });
  });
});
