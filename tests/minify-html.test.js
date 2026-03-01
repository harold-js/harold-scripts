import { describe, it } from 'node:test';
import assert from 'node:assert';
import minifyHtml from '../scripts/build/minify-html.js';

describe('HTML Minification', () => {
  it('should minify HTML by removing whitespace', async () => {
    const html = `
      <html>
        <head>
          <title>Test</title>
        </head>
        <body>
          <h1>Hello World</h1>
          <p>This is a test.</p>
        </body>
      </html>
    `;

    const result = await minifyHtml(html);

    // Minified HTML should be shorter
    assert.ok(result.length < html.length, 'Minified HTML should be shorter');
    // Should not contain excessive whitespace
    assert.ok(!result.includes('  '), 'Should not contain multiple spaces');
  });

  it('should remove HTML comments', async () => {
    const html = `
      <html>
        <!-- This is a comment -->
        <body>
          <p>Content</p>
          <!-- Another comment -->
        </body>
      </html>
    `;

    const result = await minifyHtml(html);

    assert.ok(
      !result.includes('<!-- This is a comment -->'),
      'Should remove comments'
    );
    assert.ok(
      !result.includes('<!-- Another comment -->'),
      'Should remove all comments'
    );
    assert.ok(result.includes('<p>Content</p>'), 'Should keep content');
  });

  it('should use short doctype', async () => {
    const html = `
      <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
      <html>
        <body>
          <p>Content</p>
        </body>
      </html>
    `;

    const result = await minifyHtml(html);

    // Minifier uses lowercase doctype
    assert.ok(
      result.includes('<!doctype html>') || result.includes('<!DOCTYPE html>'),
      'Should use short doctype'
    );
  });

  it('should minify inline CSS', async () => {
    const html = `
      <style>
        body {
          margin: 0;
          padding: 0;
        }
      </style>
    `;

    const result = await minifyHtml(html);

    assert.ok(
      result.includes('body{margin:0;padding:0}') ||
        result.includes('body{margin:0,padding:0}'),
      'Should minify CSS'
    );
  });

  it('should minify inline JavaScript', async () => {
    const html = `
      <script>
        function test() {
          console.log("Hello");
        }
      </script>
    `;

    const result = await minifyHtml(html);

    // JavaScript should be minified (spaces removed)
    assert.ok(result.length < html.length, 'Should minify JavaScript');
  });

  it('should preserve required attributes', async () => {
    const html = `
      <html>
        <body>
          <img src="test.jpg" alt="Test" />
          <link rel="stylesheet" href="style.css" />
        </body>
      </html>
    `;

    const result = await minifyHtml(html);

    assert.ok(result.includes('src="test.jpg"'), 'Should preserve src');
    assert.ok(result.includes('alt="Test"'), 'Should preserve alt');
    assert.ok(result.includes('rel="stylesheet"'), 'Should preserve rel');
  });

  it('should handle empty HTML', async () => {
    const html = '';
    const result = await minifyHtml(html);

    assert.strictEqual(result, '', 'Should handle empty HTML');
  });

  it('should handle plain text', async () => {
    const html = 'Just plain text';
    const result = await minifyHtml(html);

    assert.strictEqual(result, 'Just plain text', 'Should handle plain text');
  });

  it('should preserve special characters', async () => {
    const html = '<p>&copy; 2025 &mdash; Test &amp; More</p>';
    const result = await minifyHtml(html);

    assert.ok(result.includes('&copy;'), 'Should preserve &copy;');
    assert.ok(result.includes('&mdash;'), 'Should preserve &mdash;');
    assert.ok(result.includes('&amp;'), 'Should preserve &amp;');
  });

  it('should keep self-closing slashes', async () => {
    const html = '<img src="test.jpg" /><br /><hr />';
    const result = await minifyHtml(html);

    // Should keep closing slashes as per keepClosingSlash: true config
    assert.ok(result.includes('/>'), 'Should keep self-closing slashes');
  });
});
