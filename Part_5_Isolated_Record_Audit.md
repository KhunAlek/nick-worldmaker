# Part 5 — Isolated Release-Test Record Audit

## Evidence source

This audit uses the remote D1 inventory captured by the successful `Close 15 July 2026` workflow run `29475820894` before its fresh fixture was created. The source file is:

`release-evidence/2026-07-15-closure/part-5-isolated-record-inventory.json`

The successful run separately proved that its own fresh M3 fixture was deleted after verification. The records below are older test residue already present before that successful fixture.

## Summary

- **Production family affected:** No. `family-nick` is not included in this test-family inventory.
- **Pre-existing release-test families found:** 19
- **Families with submissions/reviews:** 10
- **Empty seeded families:** 9
- **Total test submissions:** 18
- **Total test reviews:** 18
- **Total mission-progress rows:** 27
- **Classification:** Abandoned non-production test data; safe candidates for a separately controlled cleanup after the verified SQL backup is retained.
- **Action taken in Part 5:** Inventory and classification only. No deletion was performed.

## Families with recorded test activity

| Family ID | Display name | Submissions | Reviews | Progress rows | Last activity UTC |
|---|---|---:|---:|---:|---|
| `d0639c9f-e34b-4dad-a187-d309a9a35884` | Release Test 15 July Closure M3 | 2 | 2 | 2 | 2026-07-16 06:03:10 |
| `8c31d89d-186e-4a16-9a3d-d998f51f27ff` | Release Test 29420911131-3-V1-M07 | 2 | 2 | 2 | 2026-07-15 14:02:35 |
| `919c51a6-0a74-4ed8-91ee-ea5f29ea88a9` | Release Test 29385563930-1-V1-M07 | 2 | 2 | 2 | 2026-07-15 03:03:29 |
| `183b4a06-d097-4200-a1b2-427adb02ddf7` | Release Test 29385506177-1-V1-M07 | 2 | 2 | 2 | 2026-07-15 03:02:16 |
| `98528cda-cd32-469f-837c-37999324b0ec` | Release Test 29384100888-1 | 1 | 1 | 1 | 2026-07-15 02:27:15 |
| `a26a016b-3567-4f42-9f81-b7a452112046` | Release Test 29383491833-1 | 1 | 1 | 1 | 2026-07-15 02:12:35 |
| `da937a97-4e1b-41c9-acc6-bc5a5261ed38` | Release Test 29383461176-1 | 2 | 2 | 2 | 2026-07-15 02:11:43 |
| `62c6a71b-0985-4285-8de0-452bd0692dc3` | Release Test 29383353182-1 | 2 | 2 | 2 | 2026-07-15 02:09:17 |
| `7803e732-ddcc-4570-9c0b-3103badf7ab4` | Release Test 29383321951-1 | 2 | 2 | 2 | 2026-07-15 02:08:06 |
| `adaa1121-5bcf-402a-9dcc-5f76ed60633e` | Release Test 29383092616-1 | 2 | 2 | 2 | 2026-07-15 02:03:05 |

## Empty seeded test families

| Family ID | Display name | Progress rows |
|---|---|---:|
| `2e1341db-658d-4261-9dd1-86e2507ea78d` | Release Test Production Ops 2026-07-15 | 1 |
| `306615db-dedf-4f9a-8d26-84ee2005282f` | Release Test 29421714333-1 | 1 |
| `53738502-b7ee-4d1d-a1a6-578689799d98` | Release Test 29421471821-1 | 1 |
| `63c01655-f320-4525-b921-478585e3abb9` | Release Test 29420911131-1-V1-M07 | 1 |
| `71df4f67-d9c3-4c5f-85e8-c7e23a8b2437` | Release Test Production Ops 2026-07-15 | 1 |
| `912fb9e0-4800-4447-ac21-8e458cbd529d` | Release Test 29420911131-2-V1-M07 | 1 |
| `91857c8e-6b5d-41ff-8c28-c5aa801036ab` | Release Test 29474572841-1 | 1 |
| `a715608c-68a9-423e-b64e-d11afb383f62` | Release Test 29421675732-1 | 1 |
| `ae7bc720-d807-43fd-80f7-7435d59ee5b6` | Release Test Production Ops 2026-07-15 | 1 |

## Cleanup rule for a later controlled operation

Delete only the explicitly listed test-family IDs and their dependent rows, in dependency-safe order: `sessions`, `reviews`, `submissions`, `audit_log`, `mission_progress`, `access_codes` if any, then `families`. Never use a broad name-only deletion that could touch `family-nick`. Before and after cleanup, compare Nick's `mission_progress` snapshot and retain the verified SQL export registered in `D1_Backup_Register.md`.
