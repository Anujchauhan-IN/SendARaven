import type { EditorSnapshot, EditorTool, InkStroke, LetterDocument, LetterEditorState, NormalizedPoint } from '../../types/letter';

const HISTORY_LIMIT = 100;
export type EditorAction =
  | { type: 'set-tool'; tool: EditorTool }
  | { type: 'set-active-page'; pageId: string }
  | { type: 'set-text'; text: string }
  | { type: 'add-stroke'; stroke: InkStroke }
  | { type: 'erase-strokes'; strokeIds: string[] }
  | { type: 'clear-ink' }
  | { type: 'add-page'; pageId: string }
  | { type: 'undo' }
  | { type: 'redo' };

export function createLetterDocument(pageId = 'page-1'): LetterDocument {
  return { schemaVersion: 1, pages: [{ id: pageId, text: '', strokes: [] }] };
}
export function createEditorState(document = createLetterDocument()): LetterEditorState {
  const firstPage = document.pages[0];
  if (!firstPage) throw new Error('A letter must contain at least one page.');
  return { document, activePageId: firstPage.id, tool: 'text', past: [], future: [] };
}
function snapshot(state: LetterEditorState): EditorSnapshot { return { document: state.document, activePageId: state.activePageId }; }
function commit(state: LetterEditorState, next: EditorSnapshot): LetterEditorState {
  return { ...state, ...next, past: [...state.past, snapshot(state)].slice(-HISTORY_LIMIT), future: [] };
}
function updateActivePage(state: LetterEditorState, update: (page: LetterDocument['pages'][number]) => LetterDocument['pages'][number]): EditorSnapshot {
  return { activePageId: state.activePageId, document: { ...state.document, pages: state.document.pages.map((page) => page.id === state.activePageId ? update(page) : page) } };
}
export function letterEditorReducer(state: LetterEditorState, action: EditorAction): LetterEditorState {
  switch (action.type) {
    case 'set-tool': return { ...state, tool: action.tool };
    case 'set-active-page': return state.document.pages.some((page) => page.id === action.pageId) ? { ...state, activePageId: action.pageId } : state;
    case 'set-text': {
      const page = state.document.pages.find((item) => item.id === state.activePageId);
      return !page || page.text === action.text ? state : commit(state, updateActivePage(state, (item) => ({ ...item, text: action.text })));
    }
    case 'add-stroke': return action.stroke.points.length < 2 ? state : commit(state, updateActivePage(state, (page) => ({ ...page, strokes: [...page.strokes, action.stroke] })));
    case 'erase-strokes': {
      const ids = new Set(action.strokeIds);
      return ids.size === 0 ? state : commit(state, updateActivePage(state, (page) => ({ ...page, strokes: page.strokes.filter((stroke) => !ids.has(stroke.id)) })));
    }
    case 'clear-ink': {
      const page = state.document.pages.find((item) => item.id === state.activePageId);
      return !page?.strokes.length ? state : commit(state, updateActivePage(state, (item) => ({ ...item, strokes: [] })));
    }
    case 'add-page':
      return state.document.pages.some((page) => page.id === action.pageId) ? state : commit(state, { activePageId: action.pageId, document: { ...state.document, pages: [...state.document.pages, { id: action.pageId, text: '', strokes: [] }] } });
    case 'undo': {
      const previous = state.past.at(-1);
      return previous ? { ...state, ...previous, past: state.past.slice(0, -1), future: [snapshot(state), ...state.future] } : state;
    }
    case 'redo': {
      const next = state.future[0];
      return next ? { ...state, ...next, past: [...state.past, snapshot(state)].slice(-HISTORY_LIMIT), future: state.future.slice(1) } : state;
    }
  }
}
export function normalizePoint(clientX: number, clientY: number, bounds: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>, pressure = 0.5): NormalizedPoint {
  return { x: clamp((clientX - bounds.left) / bounds.width), y: clamp((clientY - bounds.top) / bounds.height), pressure: clamp(pressure || 0.5) };
}
export function denormalizePoint(point: NormalizedPoint, width: number, height: number) { return { x: point.x * width, y: point.y * height }; }
export function strokeIdsNearPath(strokes: InkStroke[], path: NormalizedPoint[], radius = 0.025): string[] {
  const radiusSquared = radius * radius;
  return strokes.filter((stroke) => stroke.points.some((point) => path.some((eraser) => { const dx = point.x - eraser.x; const dy = point.y - eraser.y; return dx * dx + dy * dy <= radiusSquared; }))).map((stroke) => stroke.id);
}
export function serializeLetter(document: LetterDocument): string { return JSON.stringify(document); }
export function parseLetter(value: string): LetterDocument { const candidate: unknown = JSON.parse(value); if (!isLetterDocument(candidate)) throw new Error('Invalid letter document.'); return candidate; }
function isLetterDocument(value: unknown): value is LetterDocument {
  if (!value || typeof value !== 'object') return false;
  const document = value as Partial<LetterDocument>;
  return document.schemaVersion === 1 && Array.isArray(document.pages) && document.pages.length > 0 && document.pages.every((page) => page && typeof page.id === 'string' && typeof page.text === 'string' && Array.isArray(page.strokes) && page.strokes.every((stroke) => stroke && typeof stroke.id === 'string' && stroke.tool === 'pen' && typeof stroke.color === 'string' && typeof stroke.width === 'number' && Array.isArray(stroke.points) && stroke.points.every((point) => typeof point.x === 'number' && point.x >= 0 && point.x <= 1 && typeof point.y === 'number' && point.y >= 0 && point.y <= 1 && typeof point.pressure === 'number' && point.pressure >= 0 && point.pressure <= 1)));
}
function clamp(value: number): number { return Math.min(1, Math.max(0, value)); }
