# Content Schema

This project now uses canonical lesson identity fields for content.

## Required Fields (per lesson row)

- `groupId` (string)
- `unitId` (number, positive integer)
- `orderIndex` (number, positive integer)
- `level` (number, positive integer, compatibility alias)
- `unit` (number, positive integer, compatibility alias)
- `topic` (string, non-empty)
- `english` (string, non-empty)
- `burmese` (string, non-empty)
- `pronunciation` (string, non-empty)

## Canonical vs Compatibility

- Canonical identity fields:
  - `groupId`
  - `unitId`
  - `orderIndex`
- Compatibility fields (kept for current clients during migration):
  - `level` (alias of `orderIndex`)
  - `unit` (alias of `unitId`)

## Group Mapping Rule

Current group naming convention by `orderIndex`:

- `1-3` -> `beginner`
- `4-6` -> `pre_intermediate`
- `7-9` -> `intermediate`
- `10-12` -> `upper_intermediate`

## Example Row

{
  "groupId": "beginner",
  "unitId": 1,
  "orderIndex": 1,
  "level": 1,
  "unit": 1,
  "topic": "Alphabet sounds & basic pronunciation",
  "english": "A",
  "burmese": "အေ",
  "pronunciation": "ay"
}

## File Locations

- `/Users/kyawhtet/Documents/EDU/CS/02_Web/01_Cloud_Language/v0/backend/data/lessons.english.json`
- `/Users/kyawhtet/Documents/EDU/CS/02_Web/01_Cloud_Language/v0/backend/data/lessons.chinese.json`

## Validation Command

Run this before commit when content changes:

cd /Users/kyawhtet/Documents/EDU/CS/02_Web/01_Cloud_Language/v0/backend
npm run content:check


