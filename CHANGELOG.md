# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2026-01-11

### Changed
- Updated `@mariozechner/pi-coding-agent` from 0.37.2 to 0.37.8
- Updated `@sinclair/typebox` from 0.34.46 to 0.34.47
- Updated `@types/node` from 25.0.3 to 25.0.6
- Updated `peerDependencies` to require `>=0.37.0` (was `>=0.35.0`)

### Maintenance
- Added CHANGELOG.md to track version changes
- All tests passing with updated dependencies

## [0.3.0] - 2026-01-07

### Changed
- **BREAKING:** Migrated from hook/custom tool system to unified extensions API (requires pi-coding-agent >=0.35.0)
- Installation path changed from `~/.pi/agent/tools/` to `~/.pi/agent/extensions/`
- Updated peer dependency to require pi-coding-agent >=0.35.0

### Added
- Support for unified extension lifecycle events
- Automatic language detection for Python and TypeScript/JavaScript
- Context injection to guide agent toward SCIP tools
- Proper truncation of all tool outputs (2000 lines or 50KB limit)
- `scip_reindex` tool for manual index regeneration

### Migration
To migrate from 0.2.x:
1. Update pi to >=0.35.0
2. Update @qualisero/pi-agent-scip to >=0.3.0
3. Move symlink from `~/.pi/agent/tools/` to `~/.pi/agent/extensions/`

## [0.2.x] - 2025-01-04

### Features
- Initial release with hook-based integration
- SCIP tools for Python and TypeScript/JavaScript
- Tools: scip_find_definition, scip_find_references, scip_list_symbols, scip_search_symbols, scip_project_tree
- Automatic index generation and management
- Workspace support (pnpm, Yarn)
