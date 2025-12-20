import { visit } from 'unist-util-visit';

/**
 * Rehype plugin to handle query parameter-based styling
 * Allows markdown-friendly syntax like: ![alt](image.jpg?style=wide)
 * Wraps elements with appropriate container divs based on style parameter
 */
export default function rehypeStyleWrappers() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      // Handle images with ?style= parameter
      if (node.tagName === 'img' && node.properties && node.properties.src) {
        const src = node.properties.src;
        const styleMatch = src.match(/[?&]style=([^&]+)/);

        if (styleMatch) {
          const style = styleMatch[1];

          // Remove style parameter from src
          node.properties.src = src.replace(/[?&]style=[^&]+/, '');

          // Handle different styles
          switch (style) {
            case 'wide':
            case 'wide-content':
              // Wrap image in wide-content div
              if (parent && typeof index === 'number') {
                const wrapper = {
                  type: 'element',
                  tagName: 'div',
                  properties: {
                    className: ['wide-content'],
                  },
                  children: [node],
                };
                parent.children[index] = wrapper;
              }
              break;

            case 'centered':
              // Already handled by CSS selector img[src$="centered"]
              // Keep the parameter for backward compatibility
              node.properties.src = src; // Restore original src
              break;

            default:
              // Unknown style - keep original src
              node.properties.src = src;
              break;
          }
        }
      }

      // Handle iframes with ?style= parameter
      if (node.tagName === 'iframe' && node.properties && node.properties.src) {
        const src = node.properties.src;
        const styleMatch = src.match(/[?&]style=([^&]+)/);

        if (styleMatch) {
          const style = styleMatch[1];

          // Remove style parameter from src
          node.properties.src = src.replace(/[?&]style=[^&]+/, '');

          // Handle different styles
          switch (style) {
            case 'embed':
            case 'embeded':
            case 'embeded-media':
              // Wrap iframe in embeded-media-container div
              if (parent && typeof index === 'number') {
                const wrapper = {
                  type: 'element',
                  tagName: 'div',
                  properties: {
                    className: ['embeded-media-container'],
                  },
                  children: [node],
                };
                parent.children[index] = wrapper;
              }
              break;

            case 'vimeo':
              // Wrap iframe in embeded-media-container with vimeo class
              if (parent && typeof index === 'number') {
                const wrapper = {
                  type: 'element',
                  tagName: 'div',
                  properties: {
                    className: ['embeded-media-container', 'vimeo'],
                  },
                  children: [node],
                };
                parent.children[index] = wrapper;
              }
              break;

            default:
              // Unknown style - keep original src
              node.properties.src = src;
              break;
          }
        }
      }
    });
  };
}
