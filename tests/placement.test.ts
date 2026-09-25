import assert from 'node:assert/strict';
import { test } from 'node:test';
import { create } from 'zustand';
import { checkTerrainFootprint, isPlant } from '../lib/terrain';
import { hasDuplicatePlacement } from '../lib/placement';
import { createCanvasSlice } from '../store/slices/canvasSlice';
import type { LocalPlacement } from '../lib/types';

const placement: LocalPlacement = { id: 'first', elementType: 'oak_tree', x: 20, y: 20, width: 192, height: 192, round: 1 };

test('blocks duplicates and finger jitter but permits close neighboring plants', () => {
  assert.equal(hasDuplicatePlacement([placement], 'oak_tree', 20, 20), true);
  assert.equal(hasDuplicatePlacement([placement], 'oak_tree', 23, 22), true);
  assert.equal(hasDuplicatePlacement([placement], 'oak_tree', 28, 20), false);
  assert.equal(hasDuplicatePlacement([placement], 'maple_tree', 20, 20), false);
  assert.equal(hasDuplicatePlacement([placement], 'oak_tree', 20, 20, 'first'), false);
});

test('back-to-back placement events consume exactly one slot', () => {
  const store = create(createCanvasSlice);
  assert.equal(store.getState().addPlacement(placement), true);
  assert.equal(store.getState().addPlacement({ ...placement, id: 'duplicate' }), false);
  assert.equal(store.getState().addPlacement({ ...placement, id: 'jitter', x: 22 }), false);
  assert.equal(store.getState().placements.length, 1);
  assert.equal(store.getState().addPlacement({ ...placement, id: 'neighbor', x: 28 }), true);
  assert.equal(store.getState().placements.length, 2);
});

test('plants include ground cover, invasive plants, and planted rain gardens', () => {
  for (const type of ['oak_tree', 'native_shrub', 'shade_fern', 'native_grass', 'moss_patch', 'invasive_vine', 'rain_garden']) {
    assert.equal(isPlant(type), true, type);
  }
  for (const type of ['bench', 'birdbath', 'log_pile', 'rock_garden', 'small_pond']) {
    assert.equal(isPlant(type), false, type);
  }
});

test('checks the whole footprint against water, rocks, sand, and canvas edges', () => {
  const pixels = new Uint8ClampedArray(20 * 20 * 4);
  const paint = (x: number, y: number, red: number, green: number) => pixels.set([red, green, 0, 255], (y * 20 + x) * 4);
  paint(10, 10, 255, 0);
  paint(5, 5, 0, 255);
  assert.match(checkTerrainFootprint(pixels, 20, 20, 8, 8, 4, 4, false)!, /water and rocks/);
  assert.match(checkTerrainFootprint(pixels, 20, 20, 4, 4, 2, 2, true)!, /Plants need grass/);
  assert.equal(checkTerrainFootprint(pixels, 20, 20, 4, 4, 2, 2, false), null);
  assert.equal(checkTerrainFootprint(pixels, 20, 20, 0, 0, 2, 2, true), null);
  assert.match(checkTerrainFootprint(pixels, 20, 20, -1, 0, 2, 2, false)!, /inside/);
  assert.match(checkTerrainFootprint(pixels, 20, 20, 19, 19, 2, 2, false)!, /inside/);
  assert.match(checkTerrainFootprint(pixels, 20, 20, NaN, 0, 2, 2, false)!, /inside/);
});
