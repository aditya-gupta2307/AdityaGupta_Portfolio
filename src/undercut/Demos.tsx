import { useMemo, useState } from 'react';
import { simulatePL, undercutGap, type UndercutInput } from './models';

const CARS = ['Car A', 'Car B', 'Car C', 'Car D', 'Car E'];
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const id = `s-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div className="slider">
      <label htmlFor={id}>
        <span>{label}</span>
        <output htmlFor={id}>
          {value.toFixed(step < 1 ? (step < 0.1 ? 2 : 1) : 0)}
          {unit}
        </output>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

/** Strengths → win and podium chances, by simulation and in closed form. */
export function RankingDemo() {
  const [s, setS] = useState([1.2, 0.9, 0.6, 0.2, 0]);
  const res = useMemo(() => simulatePL(s), [s]);
  const max = Math.max(...res.simPodium, 0.01);

  return (
    <div className="demo">
      <div className="demo__label">Illustration · hypothetical cars, not Undercut’s fitted ratings</div>
      <div className="demo__grid">
        <div className="demo__controls">
          <p className="demo__hint">
            Set each car’s log-strength. The model picks a winner with probability proportional to e^strength, then second place from who is left, and so on.
          </p>
          {CARS.map((c, i) => (
            <Slider key={c} label={c} value={s[i]} min={-1} max={2} step={0.05} onChange={(v) => setS((x) => x.map((y, j) => (j === i ? v : y)))} />
          ))}
        </div>
        <div className="demo__out" aria-live="polite">
          <table className="bars">
            <caption className="sr-only">Win and podium chances from {res.sims.toLocaleString()} simulated races</caption>
            <thead>
              <tr>
                <th scope="col">Car</th>
                <th scope="col">Win (sim)</th>
                <th scope="col">Win (exact)</th>
                <th scope="col">Podium</th>
              </tr>
            </thead>
            <tbody>
              {CARS.map((c, i) => (
                <tr key={c}>
                  <th scope="row">{c}</th>
                  <td>
                    <span className="bar" style={{ ['--w' as string]: res.simWin[i] / max }} />
                    {pct(res.simWin[i])}
                  </td>
                  <td className="muted">{pct(res.exactWin[i])}</td>
                  <td>
                    <span className="bar bar--soft" style={{ ['--w' as string]: res.simPodium[i] / max }} />
                    {pct(res.simPodium[i])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="demo__note">
            {res.sims.toLocaleString()} simulated races. Simulated and exact win chances agree to within sampling noise; podium chances need the simulation.
          </p>
        </div>
      </div>
    </div>
  );
}

/** The undercut as a toy model: does pitting first get you ahead? */
export function UndercutDemo() {
  const [i, setI] = useState<UndercutInput>({ gap: 2.0, fresh: 1.6, wear: 0.1, warmup: 0.6, laps: 2 });
  const trace = useMemo(() => undercutGap(i), [i]);
  const set = (k: keyof UndercutInput) => (v: number) => setI((x) => ({ ...x, [k]: v }));
  const final = trace[trace.length - 1].gap;
  const works = final < 0;

  const W = 520;
  const H = 220;
  const pad = { l: 44, r: 16, t: 16, b: 34 };
  const ys = trace.map((t) => t.gap);
  const lo = Math.min(-1, ...ys);
  const hi = Math.max(1, ...ys);
  const x = (k: number) => pad.l + (k / (trace.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + ((hi - v) / (hi - lo)) * (H - pad.t - pad.b);
  const path = trace.map((t, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)},${y(t.gap).toFixed(1)}`).join(' ');

  return (
    <div className="demo">
      <div className="demo__label">Illustration · a simplified toy model, like the one on Undercut’s Learn page</div>
      <div className="demo__grid">
        <div className="demo__controls">
          <Slider label="Gap to the car ahead" value={i.gap} min={0.2} max={5} step={0.1} unit="s" onChange={set('gap')} />
          <Slider label="New-tyre advantage" value={i.fresh} min={0} max={3} step={0.1} unit="s/lap" onChange={set('fresh')} />
          <Slider label="Old tyres losing per lap" value={i.wear} min={0} max={0.5} step={0.05} unit="s" onChange={set('wear')} />
          <Slider label="Out-lap warm-up loss" value={i.warmup} min={0} max={2} step={0.1} unit="s" onChange={set('warmup')} />
          <Slider label="Laps before the rival stops" value={i.laps} min={1} max={4} step={1} onChange={set('laps')} />
        </div>
        <div className="demo__out">
          <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`Gap after each step; final gap ${final.toFixed(2)} seconds`}>
            <line x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} className="chart__zero" />
            <text x={W - pad.r} y={y(0) - 6} textAnchor="end" className="chart__label">
              level
            </text>
            <text x={pad.l - 8} y={y(hi) + 4} textAnchor="end" className="chart__tick">
              {hi.toFixed(1)}s
            </text>
            <text x={pad.l - 8} y={y(lo) + 4} textAnchor="end" className="chart__tick">
              {lo.toFixed(1)}s
            </text>
            <path d={path} className="chart__line" data-works={works} />
            {trace.map((t, k) => (
              <g key={k}>
                <circle cx={x(k)} cy={y(t.gap)} r={4} className="chart__dot" data-works={works} />
                <text x={x(k)} y={H - 12} textAnchor={k === 0 ? 'start' : k === trace.length - 1 ? 'end' : 'middle'} className="chart__tick">
                  {k === 0 ? 'Pit' : k === trace.length - 1 ? 'Rival out' : `L${k}`}
                </text>
              </g>
            ))}
          </svg>
          <p className={`demo__verdict${works ? ' demo__verdict--ok' : ''}`} aria-live="polite">
            {works
              ? `The undercut works: ${Math.abs(final).toFixed(2)}s ahead once the rival has stopped.`
              : `Not enough: still ${final.toFixed(2)}s behind. Stop earlier, or hope for a slow stop ahead.`}
          </p>
        </div>
      </div>
    </div>
  );
}
