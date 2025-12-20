import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import fse from 'fs-extra';
import prepareDirs from '../scripts/build/prepare-dirs.js';

describe('Directory Preparation', () => {
  let originalExistsSync;
  let originalEmptyDirSync;
  let originalEnsureDirSync;
  let originalCwd;
  let emptyDirCalls;
  let ensureDirCalls;

  beforeEach(() => {
    // Store originals
    originalExistsSync = fs.existsSync;
    originalEmptyDirSync = fse.emptyDirSync;
    originalEnsureDirSync = fse.ensureDirSync;
    originalCwd = process.cwd;

    // Mock process.cwd to return consistent path
    process.cwd = () => '/test';

    // Track function calls
    emptyDirCalls = [];
    ensureDirCalls = [];

    // Mock fse.emptyDirSync
    fse.emptyDirSync = (dirPath) => {
      emptyDirCalls.push(dirPath);
    };

    // Mock fse.ensureDirSync
    fse.ensureDirSync = (dirPath) => {
      ensureDirCalls.push(dirPath);
    };
  });

  afterEach(() => {
    // Restore originals
    fs.existsSync = originalExistsSync;
    fse.emptyDirSync = originalEmptyDirSync;
    fse.ensureDirSync = originalEnsureDirSync;
    process.cwd = originalCwd;
  });

  describe('public directory', () => {
    it('should empty public directory before build', () => {
      fs.existsSync = () => false; // No src directories exist

      prepareDirs();

      assert.strictEqual(
        emptyDirCalls.length,
        1,
        'Should call emptyDirSync once'
      );
      assert.strictEqual(
        emptyDirCalls[0],
        'build',
        'Should empty build directory'
      );
    });

    it('should always empty public directory even when directories exist', () => {
      fs.existsSync = () => true; // All src directories exist

      prepareDirs();

      assert.strictEqual(
        emptyDirCalls.length,
        1,
        'Should call emptyDirSync once'
      );
      assert.strictEqual(
        emptyDirCalls[0],
        'build',
        'Should empty build directory'
      );
    });
  });

  describe('posts directory', () => {
    it('should create posts directory when posts exist in src', () => {
      fs.existsSync = (dirPath) => {
        return dirPath.includes('/src/posts');
      };

      prepareDirs();

      assert.ok(
        ensureDirCalls.includes('build/posts'),
        'Should create build/posts directory'
      );
    });

    it('should skip posts directory when posts do not exist in src', () => {
      fs.existsSync = (dirPath) => {
        return !dirPath.includes('/src/posts');
      };

      prepareDirs();

      assert.ok(
        !ensureDirCalls.includes('build/posts'),
        'Should not create build/posts directory'
      );
    });
  });

  describe('assets directory', () => {
    it('should create assets directory when assets exist in src', () => {
      fs.existsSync = (dirPath) => {
        return dirPath.includes('/src/assets');
      };

      prepareDirs();

      assert.ok(
        ensureDirCalls.includes('build/assets'),
        'Should create build/assets directory'
      );
    });

    it('should skip assets directory when assets do not exist in src', () => {
      fs.existsSync = (dirPath) => {
        return !dirPath.includes('/src/assets');
      };

      prepareDirs();

      assert.ok(
        !ensureDirCalls.includes('build/assets'),
        'Should not create build/assets directory'
      );
    });
  });

  describe('jsonData directory', () => {
    it('should create jsonData directory when jsonData exists in src', () => {
      fs.existsSync = (dirPath) => {
        return dirPath.includes('/src/jsonData');
      };

      prepareDirs();

      assert.ok(
        ensureDirCalls.includes('build/jsonData'),
        'Should create build/jsonData directory'
      );
    });

    it('should skip jsonData directory when jsonData does not exist in src', () => {
      fs.existsSync = (dirPath) => {
        return !dirPath.includes('/src/jsonData');
      };

      prepareDirs();

      assert.ok(
        !ensureDirCalls.includes('build/jsonData'),
        'Should not create build/jsonData directory'
      );
    });
  });

  describe('combined scenarios', () => {
    it('should create all directories when all src directories exist', () => {
      fs.existsSync = () => true; // All directories exist

      prepareDirs();

      // Should empty public dir
      assert.strictEqual(emptyDirCalls.length, 1, 'Should empty public dir');

      // Should create all three subdirectories
      assert.ok(
        ensureDirCalls.includes('build/posts'),
        'Should create posts dir'
      );
      assert.ok(
        ensureDirCalls.includes('build/assets'),
        'Should create assets dir'
      );
      assert.ok(
        ensureDirCalls.includes('build/jsonData'),
        'Should create jsonData dir'
      );
      assert.strictEqual(
        ensureDirCalls.length,
        3,
        'Should create exactly 3 directories'
      );
    });

    it('should create no subdirectories when no src directories exist', () => {
      fs.existsSync = () => false; // No directories exist

      prepareDirs();

      // Should still empty public dir
      assert.strictEqual(emptyDirCalls.length, 1, 'Should empty public dir');

      // Should not create any subdirectories
      assert.strictEqual(
        ensureDirCalls.length,
        0,
        'Should not create any subdirectories'
      );
    });

    it('should create only posts directory when only posts exists in src', () => {
      fs.existsSync = (dirPath) => {
        return dirPath.includes('/src/posts');
      };

      prepareDirs();

      assert.ok(
        ensureDirCalls.includes('build/posts'),
        'Should create posts dir'
      );
      assert.ok(
        !ensureDirCalls.includes('build/assets'),
        'Should not create assets dir'
      );
      assert.ok(
        !ensureDirCalls.includes('build/jsonData'),
        'Should not create jsonData dir'
      );
      assert.strictEqual(
        ensureDirCalls.length,
        1,
        'Should create exactly 1 directory'
      );
    });

    it('should create only assets and jsonData when posts does not exist', () => {
      fs.existsSync = (dirPath) => {
        return !dirPath.includes('/src/posts');
      };

      prepareDirs();

      assert.ok(
        !ensureDirCalls.includes('build/posts'),
        'Should not create posts dir'
      );
      assert.ok(
        ensureDirCalls.includes('build/assets'),
        'Should create assets dir'
      );
      assert.ok(
        ensureDirCalls.includes('build/jsonData'),
        'Should create jsonData dir'
      );
      assert.strictEqual(
        ensureDirCalls.length,
        2,
        'Should create exactly 2 directories'
      );
    });
  });

  describe('error handling', () => {
    it('should handle permission errors when emptying directory', () => {
      fs.existsSync = () => false;
      
      // Mock emptyDirSync to throw permission error
      fse.emptyDirSync = () => {
        const error = new Error('EACCES: permission denied');
        error.code = 'EACCES';
        throw error;
      };

      // Should propagate the error
      assert.throws(() => {
        prepareDirs();
      }, {
        message: /permission denied/i,
      });
    });

    it('should handle errors when creating subdirectories', () => {
      fs.existsSync = () => true; // All directories exist
      
      // Reset emptyDirSync to not throw
      fse.emptyDirSync = () => {};
      
      // Mock ensureDirSync to throw error
      fse.ensureDirSync = () => {
        throw new Error('Failed to create directory');
      };

      // Should propagate the error
      assert.throws(() => {
        prepareDirs();
      }, {
        message: /Failed to create directory/,
      });
    });

    it('should handle non-existent public directory by creating it', () => {
      fs.existsSync = () => false;

      // emptyDirSync should create if not exists (fs-extra behavior)
      let emptyDirCreated = false;
      fse.emptyDirSync = (dirPath) => {
        emptyDirCreated = true;
        emptyDirCalls.push(dirPath);
      };

      prepareDirs();

      assert.ok(emptyDirCreated, 'Should call emptyDirSync to create/empty dir');
    });
  });

  describe('path construction', () => {
    it('should construct correct paths using process.cwd()', () => {
      let checkedPaths = [];
      fs.existsSync = (dirPath) => {
        checkedPaths.push(dirPath);
        return true;
      };

      prepareDirs();

      // Should check paths relative to process.cwd()
      assert.ok(
        checkedPaths.some((p) => p.includes('/test/src/posts')),
        'Should check posts path'
      );
      assert.ok(
        checkedPaths.some((p) => p.includes('/test/src/assets')),
        'Should check assets path'
      );
      assert.ok(
        checkedPaths.some((p) => p.includes('/test/src/jsonData')),
        'Should check jsonData path'
      );
    });

    it('should use config values for directory names', () => {
      fs.existsSync = () => true;

      prepareDirs();

      // Should use config.publicDirName (build) and config.postsDirName (posts)
      assert.ok(
        ensureDirCalls.includes('build/posts'),
        'Should use config directory names'
      );
    });
  });

  describe('execution order', () => {
    it('should empty public directory before creating subdirectories', () => {
      let executionOrder = [];
      
      fs.existsSync = () => true;
      
      fse.emptyDirSync = (dirPath) => {
        executionOrder.push({ action: 'empty', path: dirPath });
      };
      
      fse.ensureDirSync = (dirPath) => {
        executionOrder.push({ action: 'ensure', path: dirPath });
      };

      prepareDirs();

      // First action should be emptying the public directory
      assert.strictEqual(
        executionOrder[0].action,
        'empty',
        'Should empty directory first'
      );
      
      // All subsequent actions should be ensuring directories
      for (let i = 1; i < executionOrder.length; i++) {
        assert.strictEqual(
          executionOrder[i].action,
          'ensure',
          'Should create subdirectories after emptying'
        );
      }
    });
  });
});

