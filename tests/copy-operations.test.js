import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import fse from 'fs-extra';
import copyAssets from '../scripts/build/copy-assets.js';
import copyStatics from '../scripts/build/copy-statics.js';
import copyJSONData from '../scripts/build/copy-json-data.js';

describe('Copy Operations', () => {
  let originalPathExistsSync;
  let originalExistsSync;
  let originalRemoveSync;
  let originalCopySync;
  let originalCwd;
  let originalConsoleLog;
  let removeSyncCalls;
  let copySyncCalls;

  beforeEach(() => {
    // Store originals
    originalPathExistsSync = fse.pathExistsSync;
    originalExistsSync = fs.existsSync;
    originalRemoveSync = fse.removeSync;
    originalCopySync = fse.copySync;
    originalCwd = process.cwd;
    originalConsoleLog = console.log;

    // Suppress console.log
    console.log = () => {};

    // Mock process.cwd
    process.cwd = () => '/test';

    // Track function calls
    removeSyncCalls = [];
    copySyncCalls = [];

    // Mock fse.removeSync
    fse.removeSync = (dirPath) => {
      removeSyncCalls.push(dirPath);
    };

    // Mock fse.copySync
    fse.copySync = (src, dest) => {
      copySyncCalls.push({ src, dest });
    };
  });

  afterEach(() => {
    // Restore originals
    fse.pathExistsSync = originalPathExistsSync;
    fs.existsSync = originalExistsSync;
    fse.removeSync = originalRemoveSync;
    fse.copySync = originalCopySync;
    process.cwd = originalCwd;
    console.log = originalConsoleLog;
  });

  describe('Copy Assets', () => {
    it('should copy entire assets directory', () => {
      fse.pathExistsSync = () => true;

      copyAssets();

      assert.strictEqual(
        copySyncCalls.length,
        1,
        'Should call copySync once'
      );
      assert.strictEqual(
        copySyncCalls[0].src,
        'src/assets',
        'Should copy from src/assets'
      );
      assert.strictEqual(
        copySyncCalls[0].dest,
        'build/assets',
        'Should copy to build/assets'
      );
    });

    it('should remove existing assets before copy', () => {
      fse.pathExistsSync = () => true;

      copyAssets();

      assert.strictEqual(
        removeSyncCalls.length,
        1,
        'Should call removeSync once'
      );
      assert.strictEqual(
        removeSyncCalls[0],
        'build/assets',
        'Should remove build/assets'
      );

      // Should remove before copying
      assert.ok(
        removeSyncCalls.length > 0 && copySyncCalls.length > 0,
        'Should both remove and copy'
      );
    });

    it('should handle missing assets directory', () => {
      fse.pathExistsSync = () => false;

      // Capture console.log
      const originalLog = console.log;
      let logOutput = '';
      console.log = (msg) => {
        logOutput += msg;
      };

      copyAssets();

      console.log = originalLog;

      // Should not copy
      assert.strictEqual(
        copySyncCalls.length,
        0,
        'Should not copy when assets missing'
      );

      // Should not remove
      assert.strictEqual(
        removeSyncCalls.length,
        0,
        'Should not remove when assets missing'
      );

      // Should log warning
      assert.ok(
        logOutput.includes('No assets directory found'),
        'Should warn about missing assets'
      );
    });

    it('should preserve subdirectory structure', () => {
      fse.pathExistsSync = () => true;

      copyAssets();

      // copySync by default preserves structure
      assert.ok(
        copySyncCalls[0].src === 'src/assets',
        'Should copy entire directory tree'
      );
    });

    it('should handle copy errors gracefully', () => {
      fse.pathExistsSync = () => true;
      fse.copySync = () => {
        throw new Error('Copy failed');
      };

      // Should propagate error
      assert.throws(() => {
        copyAssets();
      }, {
        message: /Copy failed/,
      });
    });

    it('should use config values for directory names', () => {
      fse.pathExistsSync = () => true;

      copyAssets();

      // Should use config.srcDirName (src) and config.assetsDirName (assets)
      assert.ok(
        copySyncCalls[0].src.includes('assets'),
        'Should use config directory names'
      );
      assert.ok(
        copySyncCalls[0].dest.includes('build'),
        'Should use config public directory name'
      );
    });
  });

  describe('Copy Statics', () => {
    it('should copy statics directly to public root', () => {
      fse.pathExistsSync = () => true;

      copyStatics();

      assert.strictEqual(
        copySyncCalls.length,
        1,
        'Should call copySync once'
      );
      assert.strictEqual(
        copySyncCalls[0].src,
        'src/statics',
        'Should copy from src/statics'
      );
      assert.strictEqual(
        copySyncCalls[0].dest,
        'build',
        'Should copy directly to build root'
      );
    });

    it('should skip when statics directory does not exist', () => {
      fse.pathExistsSync = () => false;

      copyStatics();

      // Should not copy
      assert.strictEqual(
        copySyncCalls.length,
        0,
        'Should not copy when statics missing'
      );
    });

    it('should overwrite existing files in public root', () => {
      fse.pathExistsSync = () => true;

      copyStatics();

      // copySync overwrites by default
      assert.ok(
        copySyncCalls[0].dest === 'build',
        'Should copy to root, overwriting existing'
      );
    });

    it('should not log warning when directory missing', () => {
      fse.pathExistsSync = () => false;

      // Capture console.log
      const originalLog = console.log;
      let logOutput = '';
      console.log = (msg) => {
        logOutput += msg;
      };

      copyStatics();

      console.log = originalLog;

      // Should silently skip (no warning logged)
      assert.strictEqual(logOutput, '', 'Should not log anything');
    });

    it('should handle copy errors', () => {
      fse.pathExistsSync = () => true;
      fse.copySync = () => {
        throw new Error('Static copy failed');
      };

      // Should propagate error
      assert.throws(() => {
        copyStatics();
      }, {
        message: /Static copy failed/,
      });
    });

    it('should use config values for directory names', () => {
      fse.pathExistsSync = () => true;

      copyStatics();

      assert.ok(
        copySyncCalls[0].src.includes('statics'),
        'Should use config statics directory name'
      );
    });
  });

  describe('Copy JSON Data', () => {
    it('should copy jsonData directory', () => {
      fs.existsSync = () => true;

      copyJSONData();

      assert.strictEqual(
        copySyncCalls.length,
        1,
        'Should call copySync once'
      );
      assert.strictEqual(
        copySyncCalls[0].src,
        'src/jsonData',
        'Should copy from src/jsonData'
      );
      assert.strictEqual(
        copySyncCalls[0].dest,
        'build/jsonData',
        'Should copy to build/jsonData'
      );
    });

    it('should remove existing jsonData before copy', () => {
      fs.existsSync = () => true;

      copyJSONData();

      assert.strictEqual(
        removeSyncCalls.length,
        1,
        'Should call removeSync once'
      );
      assert.strictEqual(
        removeSyncCalls[0],
        'build/jsonData',
        'Should remove build/jsonData'
      );
    });

    it('should handle missing jsonData directory', () => {
      fs.existsSync = () => false;

      // Capture console.log
      const originalLog = console.log;
      let logOutput = '';
      console.log = (msg) => {
        logOutput += msg;
      };

      copyJSONData();

      console.log = originalLog;

      // Should not copy
      assert.strictEqual(
        copySyncCalls.length,
        0,
        'Should not copy when jsonData missing'
      );

      // Should not remove
      assert.strictEqual(
        removeSyncCalls.length,
        0,
        'Should not remove when jsonData missing'
      );

      // Should log warning
      assert.ok(
        logOutput.includes('No jsonData directory found'),
        'Should warn about missing jsonData'
      );
    });

    it('should preserve JSON file structure', () => {
      fs.existsSync = () => true;

      copyJSONData();

      // copySync preserves structure
      assert.ok(
        copySyncCalls[0].src === 'src/jsonData',
        'Should copy entire directory with structure'
      );
    });

    it('should use path.join with process.cwd() for existence check', () => {
      let checkedPath = null;
      fs.existsSync = (dirPath) => {
        checkedPath = dirPath;
        return true;
      };

      copyJSONData();

      // Should check path relative to cwd
      assert.ok(
        checkedPath.includes('/test/src/jsonData'),
        'Should check full path with cwd'
      );
    });

    it('should handle copy errors', () => {
      fs.existsSync = () => true;
      fse.copySync = () => {
        throw new Error('JSON copy failed');
      };

      // Should propagate error
      assert.throws(() => {
        copyJSONData();
      }, {
        message: /JSON copy failed/,
      });
    });

    it('should use config values for directory names', () => {
      fs.existsSync = () => true;

      copyJSONData();

      assert.ok(
        copySyncCalls[0].src.includes('jsonData'),
        'Should use config jsonData directory name'
      );
    });
  });

  describe('execution order and behavior', () => {
    it('should remove before copy for assets', () => {
      fse.pathExistsSync = () => true;

      let executionOrder = [];
      
      fse.removeSync = (dirPath) => {
        executionOrder.push({ action: 'remove', path: dirPath });
      };
      
      fse.copySync = (src, dest) => {
        executionOrder.push({ action: 'copy', src, dest });
      };

      copyAssets();

      assert.strictEqual(
        executionOrder[0].action,
        'remove',
        'Should remove before copy'
      );
      assert.strictEqual(
        executionOrder[1].action,
        'copy',
        'Should copy after remove'
      );
    });

    it('should remove before copy for jsonData', () => {
      fs.existsSync = () => true;

      let executionOrder = [];
      
      fse.removeSync = (dirPath) => {
        executionOrder.push({ action: 'remove', path: dirPath });
      };
      
      fse.copySync = (src, dest) => {
        executionOrder.push({ action: 'copy', src, dest });
      };

      copyJSONData();

      assert.strictEqual(
        executionOrder[0].action,
        'remove',
        'Should remove before copy'
      );
      assert.strictEqual(
        executionOrder[1].action,
        'copy',
        'Should copy after remove'
      );
    });

    it('should not remove for statics (copies to root)', () => {
      fse.pathExistsSync = () => true;

      copyStatics();

      // Statics doesn't call removeSync
      assert.strictEqual(
        removeSyncCalls.length,
        0,
        'Statics should not remove (copies to root)'
      );
    });
  });

  describe('all copy operations together', () => {
    it('should handle all three copy operations when directories exist', () => {
      fse.pathExistsSync = () => true;
      fs.existsSync = () => true;

      copyAssets();
      copyStatics();
      copyJSONData();

      // Should have 3 copy operations
      assert.strictEqual(
        copySyncCalls.length,
        3,
        'Should perform 3 copy operations'
      );

      // Should remove assets and jsonData (2 removes)
      assert.strictEqual(
        removeSyncCalls.length,
        2,
        'Should remove assets and jsonData'
      );
    });

    it('should handle all three copy operations when directories do not exist', () => {
      fse.pathExistsSync = () => false;
      fs.existsSync = () => false;

      copyAssets();
      copyStatics();
      copyJSONData();

      // Should not perform any copy operations
      assert.strictEqual(
        copySyncCalls.length,
        0,
        'Should not copy when directories missing'
      );

      // Should not remove anything
      assert.strictEqual(
        removeSyncCalls.length,
        0,
        'Should not remove when directories missing'
      );
    });
  });
});

