# Harold Scripts - Test Coverage Plan

This document outlines the recommended test coverage for harold-scripts to ensure reliability, maintainability, and confidence in the codebase.

## Current Test Coverage ✅

### 1. HTML Minification (`minify-html.test.js`)
- [x] Minifies HTML by removing whitespace
- [x] Removes HTML comments
- [x] Uses short doctype
- [x] Minifies inline CSS
- [x] Minifies inline JavaScript
- [x] Preserves required attributes
- [x] Handles empty HTML
- [x] Handles plain text
- [x] Preserves special characters
- [x] Keeps self-closing slashes

### 2. Handlebars Helpers (`generate-posts.test.js`)
- [x] formatDate helper with various formats
- [x] relativePath helper
- [x] hostDirName helper
- [x] responsiveImg helper

### 2.1 Posts List Helper (`posts-list-helper.test.js`) ✅
- [x] Generate post list with all posts
- [x] Sort posts by publication date (newest first)
- [x] Handle missing posts.json file
- [x] Handle empty posts array
- [x] Paginate posts with perPageLimit
- [x] Handle currentPage parameter
- [x] Handle invalid page numbers (returns null)
- [x] Handle currentPage < 1 (defaults to page 1)
- [x] Filter posts by tag (byTagName)
- [x] Return empty for non-existent tag
- [x] Hide images with noImage flag
- [x] Show images by default
- [x] Hide excerpts with noExcerpt flag
- [x] Show excerpts by default
- [x] Hide tags with noTags flag
- [x] Show tags by default
- [x] Hide date with noDate flag
- [x] Show date by default
- [x] Format dates with custom dateFormat
- [x] Hide read more button with noReadMoreButton flag
- [x] Show read more button by default
- [x] Customize read more button label
- [x] Use custom className for styling
- [x] Combine pagination and filtering
- [x] Combine multiple display options

**Tests: 25 tests (all passing)**

### 6. Generate Partials (`generate-partials.test.js`) ✅
- [x] Register all .hbs files in partials directory
- [x] Convert file names to partial names (remove .hbs)
- [x] Partials available in Handlebars after registration
- [x] Skip non-.hbs files
- [x] Handle directory with only non-.hbs files
- [x] Handle missing partials directory gracefully
- [x] Handle empty partials directory
- [x] Handle file read errors (propagates errors)
- [x] Preserve HTML content in partials
- [x] Handle partials with Handlebars expressions
- [x] Handle nested partial references
- [x] Register multiple partials from different files

**Tests: 12 tests (all passing)**

### 3. Utility Functions (`generate-posts.test.js`)
- [x] chunkArray utility function (6 tests)
- [x] sortPostsByDate utility (4 tests)
- [x] filterPostsByTag utility (5 tests)

### 4. Front Matter Parsing (`front-matter.test.js`) ✅
- [x] normalizeLineEndings utility (8 tests)
- [x] hasRequiredFields utility (9 tests)
- [x] extractFrontMatter utility (6 tests)
- [x] Parse valid front matter with all required fields
- [x] Parse front matter with CRLF line endings (Windows)
- [x] Parse front matter with optional fields (excerpt, tags, coverImage)
- [x] Handle front matter with special characters
- [x] Handle front matter with YAML arrays (tags)
- [x] Handle file without front matter
- [x] Validate required fields are present
- [x] Detect missing required fields

**Tests: 192 | Suites: 60 | Pass: 192 | Fail: 0 | Skipped: 0**

---

## Recommended Test Coverage 📋

### Priority 1: Core Critical Functions (High Impact)

#### 3. **Front Matter Parsing** (`front-matter.test.js`) ✅ COMPLETED
**Why:** Core functionality that was the source of the CRLF bug
**Complexity:** Medium
**Impact:** High - affects all blog post generation

Tests implemented:
- [x] normalizeLineEndings - converts CRLF to LF
- [x] normalizeLineEndings - preserves LF
- [x] normalizeLineEndings - handles mixed line endings
- [x] normalizeLineEndings - handles Buffer input
- [x] hasRequiredFields - validates all required fields present
- [x] hasRequiredFields - detects missing fields
- [x] hasRequiredFields - handles edge cases (null, undefined, empty)
- [x] extractFrontMatter - extracts from vfile
- [x] extractFrontMatter - handles missing data/matter
- [x] Parse valid front matter with all required fields
- [x] Handle CRLF line endings (Windows)
- [x] Handle optional fields (excerpt, tags, coverImage)
- [x] Handle front matter with special characters
- [x] Handle front matter with YAML arrays (tags)
- [x] Handle files without front matter
- [x] Validate required fields are present
- [x] Detect missing required fields

**Completed: 31 tests**

**Refactoring done:**
- Extracted `normalizeLineEndings()` to utils.js
- Extracted `hasRequiredFields()` to utils.js
- Extracted `extractFrontMatter()` to utils.js
- Updated generate-posts.js to use new utility functions

---

### 4. Rehype Image Attributes Plugin (`rehype-img-attrs.test.js`) ✅
- [x] Add loading="lazy" to images without it
- [x] Add decoding="async" to images without it
- [x] Preserve existing loading/decoding attributes
- [x] Handle HTTP/HTTPS image URLs (skip dimension extraction)
- [x] Handle non-existent local images gracefully
- [x] Warn on missing alt text
- [x] Warn on empty alt text
- [x] Don't warn when alt text is present
- [x] Handle images with existing width/height
- [x] Handle corrupted/invalid image files
- [x] Handle nodes without properties
- [x] Handle non-img elements
- [x] Process multiple images in one document

### 5. Rehype Style Wrappers Plugin (`rehype-style-wrappers.test.js`) ✅
- [x] Wrap images with ?style=wide in wide-content div
- [x] Wrap images with ?style=wide-content in wide-content div
- [x] Handle ?style=centered (preserve parameter for backward compatibility)
- [x] Wrap iframes with ?style=embed in embeded-media-container
- [x] Wrap iframes with ?style=embeded in embeded-media-container
- [x] Wrap iframes with ?style=embeded-media in embeded-media-container
- [x] Wrap iframes with ?style=vimeo in embeded-media-container with vimeo class
- [x] Handle unknown style parameters (restore original src)
- [x] Handle images without style parameter (no-op)
- [x] Handle iframes without style parameter (no-op)
- [x] Handle style parameter with & separator
- [x] Handle nodes without properties
- [x] Handle nodes without src property
- [x] Process multiple elements in document
- [x] Handle style parameter at beginning of query string

**Tests: 16 tests (all passing)**

---

### Priority 2: Configuration & Data Processing (Medium Impact)

#### 6. **Configuration Loading** (`constants.test.js`) ✅ COMPLETED
**Why:** Central configuration affects entire build process
**Complexity:** Low-Medium (cosmiconfig integration)
**Impact:** High - wrong config breaks everything

Tests implemented:
- [x] Have srcDirName defined
- [x] Have layoutsDirName defined
- [x] Have postsDirName defined
- [x] Have publicDirName defined
- [x] Have hostDirName defined as string
- [x] Have minifyCss as boolean
- [x] Have minifyHtml as boolean
- [x] Have all required directory names
- [x] Not have empty strings for critical directories
- [x] Have string values for all directory names
- [x] Have frontMatterAvailableKeys defined
- [x] Have at least 3 front matter keys
- [x] Have required front matter keys (layout, title, publicationDate)
- [x] Have exactly 3 required front matter keys
- [x] Have optional front matter keys (excerpt, tags, coverImage)
- [x] Have at least 3 optional front matter keys
- [x] Have properly structured frontMatterAvailableKeys
- [x] Not have duplicate front matter key names
- [x] Export an object
- [x] Have all expected properties
- [x] Not have unexpected properties
- [x] Provide all constants needed by generate-posts
- [x] Provide all constants needed by generate-pages
- [x] Provide all constants needed by generate-partials
- [x] Provide all constants needed by generate-styles
- [x] Provide all constants needed by copy-assets
- [x] Provide all constants needed by copy-statics
- [x] Provide all constants needed by copy-json-data
- [x] Provide all constants needed by prepare-dirs
- [x] Use cosmiconfig to load configuration
- [x] Handle missing config file gracefully
- [x] Provide fallback values for configurable options

**Completed: 32 tests**

---

#### 7. **Posts List Helper** (`posts-list-helper.test.js`) ✅ COMPLETED
**Why:** Complex logic for rendering post lists with pagination
**Complexity:** High (multiple features, filtering, pagination)
**Impact:** Medium - used in templates

---

### Priority 3: File Operations (Medium-Low Impact)

#### 8. **Generate Pages** (`generate-pages.test.js`) ✅ COMPLETED
**Why:** Processes Handlebars pages into HTML
**Complexity:** Medium (file I/O, Handlebars compilation)
**Impact:** High - affects all page generation

Tests implemented:
- [x] Compile .hbs files to HTML
- [x] Pass publicRelativeFileDir to templates
- [x] Preserve file names without .hbs extension
- [x] Process multiple .hbs files
- [x] Skip non-.hbs files
- [x] Handle directory with only non-.hbs files
- [x] Handle missing pages directory gracefully
- [x] Handle empty pages directory
- [x] Handle Handlebars compilation errors
- [x] Support Handlebars expressions (if/else)
- [x] Support Handlebars helpers
- [x] Support Handlebars partials
- [x] Minify HTML output when config.minifyHtml is true
- [x] Skip minification when config.minifyHtml is false
- [x] Write output to correct location
- [x] Handle nested/dotted file names

**Completed: 16 tests**

---

#### 9. **Generate Partials** (`generate-partials.test.js`) ✅ COMPLETED
**Why:** Registers Handlebars partials for reuse
**Complexity:** Low-Medium
**Impact:** Medium - affects templates that use partials

Tests implemented:
- [x] Register all .hbs files in partials directory
- [x] Convert file names to partial names (remove .hbs)
- [x] Partials available in Handlebars after registration
- [x] Skip non-.hbs files
- [x] Handle directory with only non-.hbs files
- [x] Handle missing partials directory gracefully
- [x] Handle empty partials directory
- [x] Handle file read errors (propagates errors)
- [x] Preserve HTML content in partials
- [x] Handle partials with Handlebars expressions
- [x] Handle nested partial references
- [x] Register multiple partials from different files

**Completed: 12 tests**

### 7. Directory Preparation (`prepare-dirs.test.js`) ✅
- [x] Empty public directory before build
- [x] Always empty public directory (even when directories exist)
- [x] Create posts directory when posts exist in src
- [x] Skip posts directory when posts don't exist in src
- [x] Create assets directory when assets exist in src
- [x] Skip assets directory when assets don't exist in src
- [x] Create jsonData directory when jsonData exists in src
- [x] Skip jsonData directory when jsonData doesn't exist in src
- [x] Create all directories when all src directories exist
- [x] Create no subdirectories when no src directories exist
- [x] Create only posts directory when only posts exists
- [x] Create assets and jsonData when posts doesn't exist
- [x] Handle permission errors when emptying directory
- [x] Handle errors when creating subdirectories
- [x] Handle non-existent public directory (creates it)
- [x] Construct correct paths using process.cwd()
- [x] Use config values for directory names
- [x] Execute in correct order (empty before create)

**Tests: 18 tests (all passing)**

---

#### 10. **Generate Styles** (`generate-styles.test.js`) ✅ COMPLETED
**Why:** Compiles SCSS/CSS with PostCSS
**Complexity:** High (SCSS, PostCSS, autoprefixer, cssnano)
**Impact:** High - affects all styling

Tests implemented:
- [x] Handle missing styles directory
- [x] Handle empty styles directory
- [x] Use glob to find SCSS and CSS files
- [x] Search in src/styles directory
- [x] Filter files by extension
- [x] Skip partial files (starting with _)
- [x] Use config values for directory names
- [x] Construct output paths correctly
- [x] Handle async file processing
- [x] Process multiple files concurrently
- [x] Log errors to console
- [x] Check for styles directory existence before processing
- [x] Use glob.sync for file discovery
- [x] Call ensureDir for output directories
- [x] Handle integration behavior

**Completed: 15 tests**

**Note:** Tests focus on file discovery, filtering, error handling, and integration behavior without deep mocking of SCSS/PostCSS internals, as those libraries have their own test coverage.

---

#### 11. **Directory Preparation** (`prepare-dirs.test.js`) ✅ COMPLETED
**Why:** Sets up build directory structure
**Complexity:** Low (file system operations)
**Impact:** High - must run before build

Tests implemented:
- [x] Empty public directory before build
- [x] Always empty public directory (even when directories exist)
- [x] Create posts directory when posts exist in src
- [x] Skip posts directory when posts don't exist in src
- [x] Create assets directory when assets exist in src
- [x] Skip assets directory when assets don't exist in src
- [x] Create jsonData directory when jsonData exists in src
- [x] Skip jsonData directory when jsonData doesn't exist in src
- [x] Create all directories when all src directories exist
- [x] Create no subdirectories when no src directories exist
- [x] Create only posts directory when only posts exists
- [x] Create assets and jsonData when posts doesn't exist
- [x] Handle permission errors when emptying directory
- [x] Handle errors when creating subdirectories
- [x] Handle non-existent public directory (creates it)
- [x] Construct correct paths using process.cwd()
- [x] Use config values for directory names
- [x] Execute in correct order (empty before create)

**Completed: 18 tests**

---

#### 12. **Copy Operations** (`copy-operations.test.js`) ✅ COMPLETED
**Why:** Copy assets, statics, and JSON data
**Complexity:** Low (fs-extra operations)
**Impact:** Medium - affects static files

Tests implemented:

**Copy Assets (6 tests):**
- [x] Copy entire assets directory
- [x] Remove existing assets before copy
- [x] Handle missing assets directory
- [x] Preserve subdirectory structure
- [x] Handle copy errors gracefully
- [x] Use config values for directory names

**Copy Statics (6 tests):**
- [x] Copy statics directly to public root
- [x] Skip when statics directory doesn't exist
- [x] Overwrite existing files in public root
- [x] Not log warning when directory missing (silent skip)
- [x] Handle copy errors
- [x] Use config values for directory names

**Copy JSON Data (7 tests):**
- [x] Copy jsonData directory
- [x] Remove existing jsonData before copy
- [x] Handle missing jsonData directory
- [x] Preserve JSON file structure
- [x] Use path.join with process.cwd() for existence check
- [x] Handle copy errors
- [x] Use config values for directory names

**Execution Order (3 tests):**
- [x] Remove before copy for assets
- [x] Remove before copy for jsonData
- [x] Not remove for statics (copies to root)

**Integration (2 tests):**
- [x] Handle all three operations when directories exist
- [x] Handle all three operations when directories do not exist

**Completed: 24 tests**

---

### Priority 3.5: Build Orchestration

#### 15. **Build Entry Point** (`build.test.js`) ✅ COMPLETED
**Why:** Orchestrates entire build pipeline
**Complexity:** Low (coordination logic)
**Impact:** High - ensures correct build sequence

Tests implemented:
- [x] Export build as default
- [x] Export an async function
- [x] Coordinate all build operations
- [x] Be callable multiple times
- [x] Orchestrate a complete build pipeline
- [x] Handle async operations correctly
- [x] Involve registerHelpers in build process
- [x] Involve generatePartials in build process
- [x] Involve generatePosts in build process
- [x] Involve generateStyles in build process
- [x] Involve generatePages in build process
- [x] Import all necessary build modules
- [x] Export both default and named exports
- [x] Complete build without errors on valid project
- [x] Handle projects without posts directory
- [x] Handle projects without styles directory
- [x] Handle projects without pages directory
- [x] Produce consistent results on repeated builds
- [x] Not mutate global state between builds
- [x] Complete build in reasonable time

**Completed: 20 tests**

---

#### 16. **Listener Callback** (`listener-callback.test.js`) ✅ COMPLETED
**Why:** Handles file watching during development
**Complexity:** Medium (event handling, conditional logic)
**Impact:** High - affects dev server experience

Tests implemented:
- [x] Export a function
- [x] Be an async function
- [x] Accept event and path parameters
- [x] Log event and path
- [x] Log in format "event: path"
- [x] Log for add events
- [x] Log for unlink events
- [x] Remove static file from public on unlink
- [x] Remove nested static file from public on unlink
- [x] Replace src/statics with build in path
- [x] Not remove static file on change event
- [x] Not remove static file on add event
- [x] Only remove on unlink event for statics
- [x] Remove page HTML file on .hbs unlink
- [x] Convert .hbs to .html when removing
- [x] Extract filename from path
- [x] Not remove page HTML on change event
- [x] Not remove page HTML on add event
- [x] Only remove on unlink event for pages
- [x] Handle add event without errors
- [x] Handle change event without errors
- [x] Handle unlink event without errors
- [x] Handle different event types for same path
- [x] Handle paths with multiple slashes
- [x] Handle paths with special characters
- [x] Handle empty path
- [x] Handle path without src prefix
- [x] Complete async operations
- [x] Be callable multiple times
- [x] Handle rapid consecutive calls
- [x] Check if path includes src/assets
- [x] Check if path includes src/posts
- [x] Check if path includes src/statics
- [x] Check if path includes src/pages with unlink
- [x] Coordinate build and copy operations
- [x] Handle build completion for all paths
- [x] Complete even with unusual paths
- [x] Handle unlink with non-existent files
- [x] Log even if build/copy operations have issues

**Completed: 39 tests**

---

### Priority 4: Integration Tests (Optional but Recommended)

#### 13. **Full Build Integration** (`integration/build.test.js`)
**Why:** Ensure all pieces work together
**Complexity:** High
**Impact:** High - validates entire build pipeline

Tests needed:
- [ ] Build complete site from test fixtures
- [ ] Generate posts with front matter
- [ ] Generate pages from templates
- [ ] Compile and minify styles
- [ ] Copy assets and statics
- [ ] Create proper directory structure
- [ ] Handle build errors gracefully
- [ ] Verify output file contents
- [ ] Clean up test output after tests

**Estimated Tests:** 9 tests

---

#### 14. **CLI Integration** (`integration/cli.test.js`)
**Why:** Ensure CLI commands work correctly
**Complexity:** Medium
**Impact:** High - user-facing interface

Tests needed:
- [ ] Run `harold-scripts build` successfully
- [ ] Run `harold-scripts start` successfully
- [ ] Handle invalid commands
- [ ] Show help text
- [ ] Show version number
- [ ] Exit with correct codes

**Estimated Tests:** 6 tests

---

## Test Statistics Summary

### Current Coverage
- **Tests:** 297 ✅
- **Test Suites:** 96 ✅
- **Files Covered:** 16/16 (100%) - ALL modules tested! 🎉

### Recommended Coverage
- **Additional Tests:** ~99 (was ~130, completed 31)
- **Additional Suites:** 11 (completed Priority 1: Front Matter)
- **Total Tests (after all):** ~157
- **Files Covered (after all):** 14/15 (~93%)

### Time Estimates
- **Priority 1 (Critical):** ~3-4 hours (31 tests)
- **Priority 2 (Medium):** ~4-5 hours (35 tests)
- **Priority 3 (File Ops):** ~5-6 hours (49 tests)
- **Priority 4 (Integration):** ~3-4 hours (15 tests)

**Total Estimated Time:** 15-19 hours

---

## Testing Best Practices for Harold

### 1. **Use Test Fixtures**
Create `tests/fixtures/` with sample:
- Markdown files with various front matter
- Handlebars templates
- SCSS files
- Images (small test images)
- Configuration files

### 2. **Mock File System When Appropriate**
For unit tests, consider mocking `fs` operations to:
- Speed up tests
- Avoid side effects
- Test error conditions

### 3. **Use Temporary Directories**
For integration tests:
- Use `fs.mkdtempSync()` for test output
- Clean up after each test
- Avoid polluting the project

### 4. **Test Edge Cases**
- Empty inputs
- Missing files/directories
- Invalid formats
- Large files
- Special characters
- Unicode content

### 5. **Test Error Handling**
- File read errors
- Write permission errors
- Invalid YAML/HTML/CSS
- Missing dependencies
- Network errors (for remote images)

### 6. **Performance Tests** (Optional)
- Test build time for large sites (1000+ posts)
- Memory usage tests
- Concurrent file processing

---

## Conclusion

Implementing the Priority 1 and Priority 2 tests would provide **solid coverage** of the most critical functionality (~66 tests, covering ~60% of core logic). 

The full test suite would provide **comprehensive coverage** ensuring reliability across all features and edge cases.

**Recommended Approach:**
1. Start with Priority 1 (critical paths)
2. Add Priority 2 (configuration & data)
3. Add Priority 3 as needed (file operations)
4. Add Priority 4 for CI/CD confidence (integration)

This would bring harold-scripts to production-grade test coverage! 🎯

