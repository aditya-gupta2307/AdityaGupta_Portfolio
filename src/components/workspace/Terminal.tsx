import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { complete, run, type Line, type CommandResult } from '../../data/terminal';
import { getState, openApp, pulseKey, setState, useStore } from '../../state/store';

function Row({ line }: { line: Line }) {
  if (line.kind === 'in')
    return (
      <div className="term__line term__line--in">
        <span className="term__prompt" aria-hidden="true">
          aditya@purdue ~ %
        </span>{' '}
        {line.text}
      </div>
    );
  if (line.kind === 'err') return <div className="term__line term__line--err">{line.text}</div>;
  if (line.kind === 'link')
    return (
      <div className="term__line">
        {line.text}
        <a href={line.href} target={line.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
          {line.label ?? line.href}
        </a>
      </div>
    );
  return <div className={`term__line${line.tone ? ` term__line--${line.tone}` : ''}`}>{line.text || ' '}</div>;
}

function apply(cmd: string, res: CommandResult) {
  setState((s) => ({
    term: res.clear ? [] : [...s.term, { kind: 'in', text: cmd }, ...res.lines],
    termHistory: cmd.trim() ? [...s.termHistory, cmd.trim()] : s.termHistory,
  }));
  if (res.open) {
    if (res.open.newTab) window.open(res.open.href, '_blank', 'noopener');
    else window.location.href = res.open.href;
  }
  if (res.action?.mode) setState({ mode: res.action.mode });
  if (res.action?.app) openApp(res.action.app);
}

const SUGGESTIONS = ['help', 'projects', 'skills', 'education', 'open undercut', 'contact'];

/**
 * The portfolio terminal. `interactive` is false for the copy drawn on the
 * 3D monitor, which mirrors the same output but takes no input.
 */
export function Terminal({ interactive }: { interactive: boolean }) {
  const lines = useStore((s) => s.term);
  const history = useStore((s) => s.termHistory);
  const [value, setValue] = useState('');
  const [cursor, setCursor] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => {
    if (interactive && getState().mode === 'terminal') input.current?.focus({ preventScroll: true });
  }, [interactive]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    pulseKey(e.key);
    if (e.key === 'Enter') {
      e.preventDefault();
      apply(value, run(value, [...history, value.trim()].filter(Boolean)));
      setValue('');
      setCursor(null);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setValue((v) => complete(v));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const i = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setValue(history[i]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cursor === null) return;
      const i = cursor + 1;
      if (i >= history.length) {
        setCursor(null);
        setValue('');
      } else {
        setCursor(i);
        setValue(history[i]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setState({ term: [] });
    }
  };

  return (
    <div className="term" onClick={() => interactive && input.current?.focus({ preventScroll: true })}>
      <div className="term__scroll" ref={scroller} role={interactive ? 'log' : undefined} aria-live={interactive ? 'polite' : undefined}>
        {lines.map((l, i) => (
          <Row key={i} line={l} />
        ))}
        <div className="term__line term__line--in term__entry">
          <label htmlFor={interactive ? 'term-input' : undefined} className="term__prompt">
            aditya@purdue ~ %
          </label>
          {interactive ? (
            <input
              id="term-input"
              ref={input}
              className="term__input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKey}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Terminal command"
              enterKeyHint="go"
            />
          ) : (
            <span className="term__input">
              <span className="term__caret" />
            </span>
          )}
        </div>
      </div>
      <div className="term__hints">
        {SUGGESTIONS.map((c) => (
          <button
            key={c}
            type="button"
            className="term__hint"
            tabIndex={interactive ? 0 : -1}
            onClick={(e) => {
              e.stopPropagation();
              apply(c, run(c, history));
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
