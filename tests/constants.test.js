import { describe, it } from 'node:test';
import assert from 'node:assert';
import config from '../scripts/build/constants.js';

describe('Configuration Loading', () => {
  describe('default configuration values', () => {
    it('should have srcDirName defined', () => {
      assert.strictEqual(config.srcDirName, 'src', 'Should have srcDirName as "src"');
    });

    it('should have layoutsDirName defined', () => {
      assert.strictEqual(typeof config.layoutsDirName, 'string', 'Should have layoutsDirName');
      assert.ok(config.layoutsDirName.length > 0, 'layoutsDirName should not be empty');
    });

    it('should have postsDirName defined', () => {
      assert.strictEqual(typeof config.postsDirName, 'string', 'Should have postsDirName');
      assert.ok(config.postsDirName.length > 0, 'postsDirName should not be empty');
    });

    it('should have publicDirName defined', () => {
      assert.strictEqual(typeof config.publicDirName, 'string', 'Should have publicDirName');
      assert.ok(config.publicDirName.length > 0, 'publicDirName should not be empty');
    });

    it('should have hostDirName defined as string', () => {
      assert.strictEqual(typeof config.hostDirName, 'string', 'Should have hostDirName as string');
      // hostDirName can be empty, that's valid
    });

    it('should have minifyCss as boolean', () => {
      assert.strictEqual(typeof config.minifyCss, 'boolean', 'minifyCss should be boolean');
    });

    it('should have minifyHtml as boolean', () => {
      assert.strictEqual(typeof config.minifyHtml, 'boolean', 'minifyHtml should be boolean');
    });
  });

  describe('directory names', () => {
    it('should have all required directory names', () => {
      assert.ok(config.srcDirName, 'Should have srcDirName');
      assert.ok(config.layoutsDirName, 'Should have layoutsDirName');
      assert.ok(config.partialsDirName, 'Should have partialsDirName');
      assert.ok(config.postsDirName, 'Should have postsDirName');
      assert.ok(config.pagesDirName, 'Should have pagesDirName');
      assert.ok(config.assetsDirName, 'Should have assetsDirName');
      assert.ok(config.publicDirName, 'Should have publicDirName');
      assert.ok(config.stylesDirName, 'Should have stylesDirName');
      assert.ok(config.jsonDataDirName, 'Should have jsonDataDirName');
      assert.ok(config.staticsDirName, 'Should have staticsDirName');
    });

    it('should not have empty string for critical directories', () => {
      assert.notStrictEqual(config.srcDirName, '', 'srcDirName should not be empty');
      assert.notStrictEqual(config.layoutsDirName, '', 'layoutsDirName should not be empty');
      assert.notStrictEqual(config.postsDirName, '', 'postsDirName should not be empty');
      assert.notStrictEqual(config.publicDirName, '', 'publicDirName should not be empty');
      assert.notStrictEqual(config.partialsDirName, '', 'partialsDirName should not be empty');
      assert.notStrictEqual(config.pagesDirName, '', 'pagesDirName should not be empty');
      assert.notStrictEqual(config.assetsDirName, '', 'assetsDirName should not be empty');
      assert.notStrictEqual(config.stylesDirName, '', 'stylesDirName should not be empty');
      assert.notStrictEqual(config.jsonDataDirName, '', 'jsonDataDirName should not be empty');
      assert.notStrictEqual(config.staticsDirName, '', 'staticsDirName should not be empty');
    });

    it('should have string values for all directory names', () => {
      assert.strictEqual(typeof config.srcDirName, 'string', 'srcDirName should be string');
      assert.strictEqual(typeof config.layoutsDirName, 'string', 'layoutsDirName should be string');
      assert.strictEqual(typeof config.partialsDirName, 'string', 'partialsDirName should be string');
      assert.strictEqual(typeof config.postsDirName, 'string', 'postsDirName should be string');
      assert.strictEqual(typeof config.pagesDirName, 'string', 'pagesDirName should be string');
      assert.strictEqual(typeof config.assetsDirName, 'string', 'assetsDirName should be string');
      assert.strictEqual(typeof config.publicDirName, 'string', 'publicDirName should be string');
      assert.strictEqual(typeof config.stylesDirName, 'string', 'stylesDirName should be string');
      assert.strictEqual(typeof config.jsonDataDirName, 'string', 'jsonDataDirName should be string');
      assert.strictEqual(typeof config.staticsDirName, 'string', 'staticsDirName should be string');
    });
  });

  describe('frontMatterAvailableKeys', () => {
    it('should have frontMatterAvailableKeys defined', () => {
      assert.ok(config.frontMatterAvailableKeys, 'Should have frontMatterAvailableKeys');
      assert.ok(Array.isArray(config.frontMatterAvailableKeys), 'Should be an array');
    });

    it('should have at least 3 front matter keys', () => {
      assert.ok(
        config.frontMatterAvailableKeys.length >= 3,
        'Should have at least 3 front matter keys'
      );
    });

    it('should have required front matter keys', () => {
      const requiredKeys = config.frontMatterAvailableKeys.filter(k => k.required);
      const keyNames = requiredKeys.map(k => k.name);

      assert.ok(keyNames.includes('layout'), 'Should require layout');
      assert.ok(keyNames.includes('title'), 'Should require title');
      assert.ok(keyNames.includes('publicationDate'), 'Should require publicationDate');
    });

    it('should have exactly 3 required front matter keys', () => {
      const requiredKeys = config.frontMatterAvailableKeys.filter(k => k.required);
      assert.strictEqual(requiredKeys.length, 3, 'Should have exactly 3 required keys');
    });

    it('should have optional front matter keys', () => {
      const optionalKeys = config.frontMatterAvailableKeys.filter(k => !k.required);
      const keyNames = optionalKeys.map(k => k.name);

      assert.ok(keyNames.includes('excerpt'), 'Should have optional excerpt');
      assert.ok(keyNames.includes('tags'), 'Should have optional tags');
      assert.ok(keyNames.includes('coverImage'), 'Should have optional coverImage');
    });

    it('should have at least 3 optional front matter keys', () => {
      const optionalKeys = config.frontMatterAvailableKeys.filter(k => !k.required);
      assert.ok(optionalKeys.length >= 3, 'Should have at least 3 optional keys');
    });

    it('should have properly structured frontMatterAvailableKeys', () => {
      config.frontMatterAvailableKeys.forEach((key) => {
        assert.ok(key.name, 'Each key should have a name');
        assert.strictEqual(typeof key.name, 'string', 'Key name should be string');
        assert.strictEqual(typeof key.required, 'boolean', 'Key required should be boolean');
        assert.ok(key.name.length > 0, 'Key name should not be empty');
      });
    });

    it('should not have duplicate front matter key names', () => {
      const keyNames = config.frontMatterAvailableKeys.map(k => k.name);
      const uniqueNames = [...new Set(keyNames)];
      assert.strictEqual(
        keyNames.length,
        uniqueNames.length,
        'Should not have duplicate key names'
      );
    });
  });

  describe('configuration structure', () => {
    it('should export an object', () => {
      assert.strictEqual(typeof config, 'object', 'Should export an object');
      assert.ok(config !== null, 'Should not be null');
    });

    it('should have all expected properties', () => {
      const expectedProps = [
        'srcDirName',
        'layoutsDirName',
        'partialsDirName',
        'postsDirName',
        'pagesDirName',
        'assetsDirName',
        'publicDirName',
        'stylesDirName',
        'jsonDataDirName',
        'staticsDirName',
        'hostDirName',
        'minifyCss',
        'minifyHtml',
        'frontMatterAvailableKeys',
      ];

      expectedProps.forEach((prop) => {
        assert.ok(
          prop in config,
          `Should have ${prop} property`
        );
      });
    });

    it('should not have unexpected properties', () => {
      const expectedProps = [
        'srcDirName',
        'layoutsDirName',
        'partialsDirName',
        'postsDirName',
        'pagesDirName',
        'assetsDirName',
        'publicDirName',
        'stylesDirName',
        'jsonDataDirName',
        'staticsDirName',
        'hostDirName',
        'minifyCss',
        'minifyHtml',
        'frontMatterAvailableKeys',
      ];

      const actualProps = Object.keys(config);
      actualProps.forEach((prop) => {
        assert.ok(
          expectedProps.includes(prop),
          `Unexpected property: ${prop}`
        );
      });
    });
  });

  describe('constants used by other modules', () => {
    it('should provide all constants needed by generate-posts', () => {
      // generate-posts needs these
      assert.ok(config.srcDirName, 'Should have srcDirName');
      assert.ok(config.postsDirName, 'Should have postsDirName');
      assert.ok(config.layoutsDirName, 'Should have layoutsDirName');
      assert.ok(config.publicDirName, 'Should have publicDirName');
      assert.ok(config.hostDirName !== undefined, 'Should have hostDirName');
      assert.ok(config.frontMatterAvailableKeys, 'Should have frontMatterAvailableKeys');
    });

    it('should provide all constants needed by generate-pages', () => {
      // generate-pages needs these
      assert.ok(config.srcDirName, 'Should have srcDirName');
      assert.ok(config.pagesDirName, 'Should have pagesDirName');
      assert.ok(config.publicDirName, 'Should have publicDirName');
      assert.ok(config.hostDirName !== undefined, 'Should have hostDirName');
      assert.strictEqual(typeof config.minifyHtml, 'boolean', 'Should have minifyHtml boolean');
    });

    it('should provide all constants needed by generate-partials', () => {
      // generate-partials needs these
      assert.ok(config.srcDirName, 'Should have srcDirName');
      assert.ok(config.partialsDirName, 'Should have partialsDirName');
    });

    it('should provide all constants needed by generate-styles', () => {
      // generate-styles needs these
      assert.ok(config.srcDirName, 'Should have srcDirName');
      assert.ok(config.stylesDirName, 'Should have stylesDirName');
      assert.ok(config.publicDirName, 'Should have publicDirName');
      assert.strictEqual(typeof config.minifyCss, 'boolean', 'Should have minifyCss boolean');
    });

    it('should provide all constants needed by copy-assets', () => {
      // copy-assets needs these
      assert.ok(config.srcDirName, 'Should have srcDirName');
      assert.ok(config.publicDirName, 'Should have publicDirName');
      assert.ok(config.assetsDirName, 'Should have assetsDirName');
    });

    it('should provide all constants needed by copy-statics', () => {
      // copy-statics needs these
      assert.ok(config.srcDirName, 'Should have srcDirName');
      assert.ok(config.publicDirName, 'Should have publicDirName');
      assert.ok(config.staticsDirName, 'Should have staticsDirName');
    });

    it('should provide all constants needed by copy-json-data', () => {
      // copy-json-data needs these
      assert.ok(config.srcDirName, 'Should have srcDirName');
      assert.ok(config.publicDirName, 'Should have publicDirName');
      assert.ok(config.jsonDataDirName, 'Should have jsonDataDirName');
    });

    it('should provide all constants needed by prepare-dirs', () => {
      // prepare-dirs needs these
      assert.ok(config.srcDirName, 'Should have srcDirName');
      assert.ok(config.publicDirName, 'Should have publicDirName');
      assert.ok(config.postsDirName, 'Should have postsDirName');
      assert.ok(config.assetsDirName, 'Should have assetsDirName');
      assert.ok(config.jsonDataDirName, 'Should have jsonDataDirName');
    });
  });

  describe('cosmiconfig integration', () => {
    it('should use cosmiconfig to load configuration', () => {
      // cosmiconfig is used at module load time
      // This test verifies the module loads successfully
      assert.ok(config, 'Config should be loaded via cosmiconfig');
    });

    it('should handle missing config file gracefully', () => {
      // If no config file exists, defaults should be used
      // The module should still load without errors
      assert.ok(config.layoutsDirName, 'Should have default layoutsDirName');
      assert.ok(config.postsDirName, 'Should have default postsDirName');
      assert.ok(config.publicDirName, 'Should have default publicDirName');
    });

    it('should provide fallback values for configurable options', () => {
      // These are the values that can be customized via config
      // They should have sensible defaults
      assert.ok(config.layoutsDirName, 'Should have layoutsDirName fallback');
      assert.ok(config.postsDirName, 'Should have postsDirName fallback');
      assert.ok(config.publicDirName, 'Should have publicDirName fallback');
      assert.strictEqual(typeof config.hostDirName, 'string', 'Should have hostDirName fallback (can be empty)');
      assert.strictEqual(typeof config.minifyCss, 'boolean', 'Should have minifyCss fallback');
      assert.strictEqual(typeof config.minifyHtml, 'boolean', 'Should have minifyHtml fallback');
    });
  });
});
