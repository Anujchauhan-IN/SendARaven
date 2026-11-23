import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { createEditorState, denormalizePoint, letterEditorReducer, normalizePoint, strokeIdsNearPath } from '../../lib/letters/editor';
import type { InkStroke, NormalizedPoint } from '../../types/letter';
import './letter-composer.css';

const ravens = ['Phantom Raven', 'Swift Raven', 'Courier Raven', 'Wanderer Raven', 'Old Raven'];
let idCounter = 1;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`;

export default function LetterComposer() {
  const [state, dispatch] = useReducer(letterEditorReducer, undefined, () => createEditorState());
  const [draftStroke, setDraftStroke] = useState<InkStroke | null>(null);
  const [eraserPath, setEraserPath] = useState<NormalizedPoint[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const activePage = state.document.pages.find((page) => page.id === state.activePageId) ?? state.document.pages[0]!;
  const pageIndex = state.document.pages.findIndex((page) => page.id === activePage.id);
  const visibleStrokes = useMemo(() => draftStroke ? [...activePage.strokes, draftStroke] : activePage.strokes, [activePage.strokes, draftStroke]);

  useLayoutEffect(() => {
    const textLayer = textLayerRef.current;
    if (textLayer && textLayer.textContent !== activePage.text) textLayer.textContent = activePage.text;
  }, [activePage.id, activePage.text]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const bounds = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(bounds.width * scale));
      canvas.height = Math.max(1, Math.round(bounds.height * scale));
      const context = canvas.getContext('2d');
      if (!context) return;
      context.scale(scale, scale);
      context.clearRect(0, 0, bounds.width, bounds.height);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      for (const stroke of visibleStrokes) drawStroke(context, stroke, bounds.width, bounds.height);
      if (state.tool === 'eraser' && eraserPath.length) {
        const point = denormalizePoint(eraserPath.at(-1)!, bounds.width, bounds.height);
        context.beginPath();
        context.arc(point.x, point.y, Math.max(9, bounds.width * 0.022), 0, Math.PI * 2);
        context.strokeStyle = 'rgba(73, 42, 24, .55)';
        context.lineWidth = 1.5;
        context.stroke();
      }
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [visibleStrokes, eraserPath, state.tool]);

  function pagePoint(event: ReactPointerEvent<HTMLCanvasElement>) {
    return normalizePoint(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect(), event.pressure);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (state.tool === 'text') return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pagePoint(event);
    if (state.tool === 'pen') {
      setDraftStroke({ id: nextId('stroke'), tool: 'pen', color: '#321b13', width: 2.4, points: [point] });
    } else {
      setEraserPath([point]);
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const point = pagePoint(event);
    if (state.tool === 'pen') setDraftStroke((stroke) => stroke ? { ...stroke, points: [...stroke.points, point] } : null);
    if (state.tool === 'eraser') setEraserPath((points) => [...points, point]);
  }

  function finishPointer(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (draftStroke) dispatch({ type: 'add-stroke', stroke: draftStroke });
    if (eraserPath.length) dispatch({ type: 'erase-strokes', strokeIds: strokeIdsNearPath(activePage.strokes, eraserPath) });
    setDraftStroke(null);
    setEraserPath([]);
  }

  function goToPage(index: number) {
    const page = state.document.pages[index];
    if (page) dispatch({ type: 'set-active-page', pageId: page.id });
  }

  return (
    <section className="writing-room" aria-label="Letter composer">
      <header className="writing-header">
        <div className="wordmark" translate="no">SendARaven</div>
        <label className="recipient-field">
          <span>To</span>
          <input name="recipient" type="text" inputMode="text" autoComplete="off" spellCheck={false} placeholder="Raven ID" aria-label="Recipient Raven ID" />
        </label>
      </header>

      <div className="tool-rail" role="toolbar" aria-label="Writing tools">
        <ToolButton label="Text" symbol="T" active={state.tool === 'text'} onClick={() => dispatch({ type: 'set-tool', tool: 'text' })} />
        <ToolButton label="Pen" symbol="✒" active={state.tool === 'pen'} onClick={() => dispatch({ type: 'set-tool', tool: 'pen' })} />
        <ToolButton label="Eraser" symbol="⌫" active={state.tool === 'eraser'} onClick={() => dispatch({ type: 'set-tool', tool: 'eraser' })} />
        <span className="tool-divider" aria-hidden="true" />
        <ToolButton label="Undo" symbol="↶" disabled={!state.past.length} onClick={() => dispatch({ type: 'undo' })} />
        <ToolButton label="Redo" symbol="↷" disabled={!state.future.length} onClick={() => dispatch({ type: 'redo' })} />
      </div>

      <div className="parchment-frame">
        <div className="parchment" data-tool={state.tool}>
          <div
            ref={textLayerRef}
            className="text-layer"
            contentEditable={state.tool === 'text'}
            role="textbox"
            aria-multiline="true"
            aria-label={`Typed letter, page ${pageIndex + 1}`}
            data-placeholder="Write your letter…"
            suppressContentEditableWarning
            onInput={(event) => dispatch({ type: 'set-text', text: event.currentTarget.textContent ?? '' })}
          />
          <canvas
            ref={canvasRef}
            className="ink-layer"
            aria-label="Handwritten ink layer"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointer}
            onPointerCancel={finishPointer}
          />
        </div>
      </div>

      <nav className="page-strip" aria-label="Letter pages">
        <button type="button" onClick={() => goToPage(pageIndex - 1)} disabled={pageIndex === 0} aria-label="Previous page">‹</button>
        <span>Page {pageIndex + 1} of {state.document.pages.length}</span>
        <button type="button" onClick={() => dispatch({ type: 'add-page', pageId: nextId('page') })}>Add page</button>
        <button type="button" onClick={() => goToPage(pageIndex + 1)} disabled={pageIndex === state.document.pages.length - 1} aria-label="Next page">›</button>
      </nav>

      <footer className="dispatch-bar">
        <label>
          <span>Raven</span>
          <select name="raven" aria-label="Choose raven" defaultValue="Swift Raven">
            {ravens.map((raven) => <option key={raven}>{raven}</option>)}
          </select>
        </label>
        <button type="button" disabled title="Dispatch will be enabled after secure backend delivery is implemented">Seal & dispatch</button>
      </footer>
      <p className="dispatch-note">Dispatch is unavailable in this local writing proof.</p>
    </section>
  );
}

function ToolButton({ label, symbol, active = false, disabled = false, onClick }: { label: string; symbol: string; active?: boolean; disabled?: boolean; onClick: () => void }) {
  return <button type="button" className={active ? 'tool-button active' : 'tool-button'} aria-label={label} aria-pressed={active} disabled={disabled} onClick={onClick}><span aria-hidden="true">{symbol}</span><small>{label}</small></button>;
}

function drawStroke(context: CanvasRenderingContext2D, stroke: InkStroke, width: number, height: number) {
  if (stroke.points.length < 2) return;
  context.beginPath();
  const first = denormalizePoint(stroke.points[0]!, width, height);
  context.moveTo(first.x, first.y);
  for (let index = 1; index < stroke.points.length; index++) {
    const point = denormalizePoint(stroke.points[index]!, width, height);
    context.lineTo(point.x, point.y);
  }
  const pressure = stroke.points.reduce((sum, point) => sum + point.pressure, 0) / stroke.points.length;
  context.strokeStyle = stroke.color;
  context.globalAlpha = 0.88;
  context.lineWidth = stroke.width * (0.72 + pressure * 0.7) * Math.max(0.75, width / 560);
  context.stroke();
  context.globalAlpha = 1;
}
