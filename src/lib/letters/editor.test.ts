import { describe, expect, it } from 'vitest';
import { createEditorState, createLetterDocument, denormalizePoint, letterEditorReducer, normalizePoint, parseLetter, serializeLetter, strokeIdsNearPath } from './editor';
import type { InkStroke } from '../../types/letter';

const stroke: InkStroke = { id: 'stroke-1', tool: 'pen', color: '#321b13', width: 2, points: [{ x: .25, y: .5, pressure: .6 }, { x: .75, y: .8, pressure: .7 }] };

describe('letter editor', () => {
  it('preserves typed text and vector ink on the same page', () => {
    let state = createEditorState();
    state = letterEditorReducer(state, { type: 'set-text', text: 'Dear Rowan,' });
    state = letterEditorReducer(state, { type: 'add-stroke', stroke });
    expect(state.document.pages[0]).toMatchObject({ text: 'Dear Rowan,', strokes: [stroke] });
  });

  it('keeps normalized ink stable at different render sizes', () => {
    const point = normalizePoint(150, 300, { left: 50, top: 100, width: 400, height: 800 }, .8);
    expect(point).toEqual({ x: .25, y: .25, pressure: .8 });
    expect(denormalizePoint(point, 800, 1600)).toEqual({ x: 200, y: 400 });
  });

  it('preserves each page while navigating and supports undo/redo', () => {
    let state = createEditorState(createLetterDocument('first'));
    state = letterEditorReducer(state, { type: 'set-text', text: 'Page one' });
    state = letterEditorReducer(state, { type: 'add-page', pageId: 'second' });
    state = letterEditorReducer(state, { type: 'set-text', text: 'Page two' });
    state = letterEditorReducer(state, { type: 'set-active-page', pageId: 'first' });
    expect(state.document.pages.map((page) => page.text)).toEqual(['Page one', 'Page two']);
    state = letterEditorReducer(state, { type: 'undo' });
    expect(state.document.pages[1]?.text).toBe('');
    state = letterEditorReducer(state, { type: 'redo' });
    expect(state.document.pages[1]?.text).toBe('Page two');
  });

  it('erases vector strokes by normalized path and serializes safely', () => {
    expect(strokeIdsNearPath([stroke], [{ x: .26, y: .51, pressure: .5 }])).toEqual(['stroke-1']);
    const document = { schemaVersion: 1 as const, pages: [{ id: 'one', text: 'Text', strokes: [stroke] }] };
    expect(parseLetter(serializeLetter(document))).toEqual(document);
    expect(() => parseLetter('{"schemaVersion":1,"pages":[]}')).toThrow('Invalid letter document');
  });
});
