export type EditorTool = 'text' | 'pen' | 'eraser';

export interface NormalizedPoint { x: number; y: number; pressure: number; }
export interface InkStroke { id: string; tool: 'pen'; color: string; width: number; points: NormalizedPoint[]; }
export interface LetterPage { id: string; text: string; strokes: InkStroke[]; }
export interface LetterDocument { schemaVersion: 1; pages: LetterPage[]; }
export interface EditorSnapshot { document: LetterDocument; activePageId: string; }
export interface LetterEditorState extends EditorSnapshot { tool: EditorTool; past: EditorSnapshot[]; future: EditorSnapshot[]; }
