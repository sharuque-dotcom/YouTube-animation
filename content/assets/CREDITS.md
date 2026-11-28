# 3D asset library (all CC0 / public domain)

Everything here is free for commercial use with no attribution required. We credit the authors anyway.

| Source | What | License |
|---|---|---|
| [Poly Haven](https://polyhaven.com) | Models: Dutch ships (large 01/02, medium), ship pinnace, modular wooden pier, modular fort, barrels, crate, cannon, treasure chest, lantern, coastal cliff, coast rocks (Smugglers Cove collection and others) | [CC0](https://polyhaven.com/license) |
| Poly Haven | HDRI skies: kloppenheim_06_puresky (sunset), belfast_sunset_puresky (env-ship default), industrial_sunset_puresky, evening_road_01_puresky, kloofendal_48d_partly_cloudy_puresky (midday), satara_night_no_lamps (night) | CC0 |
| Poly Haven | PBR textures: weathered_planks, wood_floor_deck, coast_sand_rocks_02, rock_face_03, castle_brick_02_red, painted_plaster_wall | CC0 |
| [Kenney](https://kenney.nl) | Pirate Kit 2.1 (70 low-poly ships, docks, palms, rocks, towers, props) | CC0 (see kenney/pirate-kit/License.txt) |

## Getting the files
The binaries are not committed (about 185 MB). In the "youtube-animation (3D assets)" cloud environment run:

    python3 pipeline/fetch-assets.py        # Poly Haven items in manifest.json
    node pipeline/fetch-kenney.cjs pirate-kit

A copy is also kept in the project files at `3d-assets/` (copy it to `content/assets/` if the asset sites are blocked).
Load them in a scene with `pipeline/assets.js` (`model('ph:dutch_ship_large_01')`, `model('kenney:pirate-kit/ship-large')`, `hdri()`, `texMaterial()`).

Added 28 Nov 2026 for the Mullaperiyar Short (all CC0, Poly Haven): textures old_stone_wall, forest_ground_04; models island_tree_01, island_tree_02, shrub_01, boulder_01.
