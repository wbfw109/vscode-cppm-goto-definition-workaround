# Change Log

## [0.0.7] - 2025-08-13

- Changed command ID from `cppm.copyModuleNameForQuickOpen` to `cppm.searchModuleInQuickOpen` to better reflect its behavior.

## [0.0.6] - 2025-08-13

### Fixed

- Corrected Quick Open search to replace `.` and `:` with `/` instead of space for accurate file path matching.

## [0.0.5] - 2025-08-09

### Docs

- Restructured README Features and Requirements sections for clarity.

## [0.0.4] - 2025-08-09

### Added

- Extended parsing capabilities to handle:
  - `export import` statements.
  - Multi-line module declarations.
  - Lines containing comments.
- Limited parsing depth to 5 lines to avoid performance issues.

### Fixed

- Corrected Quick Open search prefix from `" / "` to `"/"`.
  - Removed unintended leading space introduced in v0.0.3.

## [0.0.3] - 2025-08-09

- Added `" / "` prefix to the Quick Open search text to improve matching by hinting that the first word may represent a folder name.
- Added extension icon, categories, and keywords to package metadata.

## [0.0.2] - 2025-08-08

- Added command category `"C++"` so the Command Palette entry now appears as `C++: Copy Module Name for Quick Open` instead of `Copy Module Name for Quick Open`.

- Updated `README.md` with command ID (`cppm.copyModuleNameForQuickOpen`) and usage instructions.

## [0.0.1]

- Initial release
