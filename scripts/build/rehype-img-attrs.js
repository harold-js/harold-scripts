import { visit } from 'unist-util-visit';
import sizeOf from 'image-size';
import path from 'node:path';
import fs from 'node:fs';
import chalk from 'chalk';

/**
 * Rehype plugin to add width, height, loading, and decoding attributes to images
 * Prevents Cumulative Layout Shift (CLS) and improves Core Web Vitals
 */
export default function rehypeImgAttrs(options = {}) {
  const { publicPath = 'build', srcPath = 'src' } = options;

  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img' && node.properties) {
        const { src, alt } = node.properties;

        // Add loading="lazy" for better performance (browser native lazy loading)
        if (!node.properties.loading) {
          node.properties.loading = 'lazy';
        }

        // Add decoding="async" for better rendering performance
        if (!node.properties.decoding) {
          node.properties.decoding = 'async';
        }

        // Try to get image dimensions if not already set
        if (src && (!node.properties.width || !node.properties.height)) {
          try {
            // Handle relative paths
            let imagePath = src;

            // If it's a relative path, resolve it
            if (!src.startsWith('http://') && !src.startsWith('https://')) {
              // Try multiple possible locations
              const possiblePaths = [
                path.join(process.cwd(), publicPath, src),
                path.join(process.cwd(), srcPath, 'assets', src),
                path.join(process.cwd(), srcPath, src),
                path.join(process.cwd(), src),
              ];

              imagePath = possiblePaths.find((p) => fs.existsSync(p));
            }

            if (imagePath && fs.existsSync(imagePath)) {
              const dimensions = sizeOf(imagePath);

              if (dimensions.width && dimensions.height) {
                node.properties.width = dimensions.width;
                node.properties.height = dimensions.height;
              }
            }
          } catch {
            // Silently fail - dimensions are optional
            console.log(
              chalk.yellow(
                `Could not determine dimensions for image: ${src || 'unknown'}`
              )
            );
          }
        }

        // Ensure alt text exists (accessibility and SEO)
        if (!alt || alt.trim() === '') {
          console.log(
            chalk.yellow(`Warning: Image missing alt text: ${src || 'unknown'}`)
          );
        }
      }
    });
  };
}
