import { deskObjects } from '../../data/deskObjects';
import { activateDeskObject } from '../scene/actions';
import { getState, setState } from '../../state/store';

/**
 * HTML twins of the clickable desk objects. They make the 3D interactions
 * discoverable, and give keyboard and screen-reader users the same actions;
 * focusing one highlights its object in the scene.
 */
export function DeskHints() {
  const items = deskObjects.filter((o) => ['car', 'keyboard', 'monitor', 'purdue', 'headphones', 'cube', 'mug', 'lamp'].includes(o.id));
  return (
    <div className="hints reveal" style={{ ['--d' as string]: '420ms' }}>
      <p className="hints__label">Everything on the desk is interactive</p>
      <ul className="hints__list">
        {items.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              className="hints__btn"
              data-object={o.id}
              onClick={() => activateDeskObject(o.id)}
              onMouseEnter={() => setState({ hovered: o.id })}
              onMouseLeave={() => getState().hovered === o.id && setState({ hovered: null })}
              onFocus={() => setState({ hovered: o.id })}
              onBlur={() => getState().hovered === o.id && setState({ hovered: null })}
            >
              {o.action}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
