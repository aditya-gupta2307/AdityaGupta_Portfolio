import { Workspace } from './Workspace';
import { enterWorkspace, useStore } from '../../state/store';
import { profile } from '../../data/profile';

/**
 * What the 3D monitor displays. It mirrors the real workspace but is inert:
 * the interactive copy lives in the page, so screen readers and keyboards use
 * that one. Clicking the screen scrolls into the full workspace.
 */
export function ScreenView() {
  const closing = useStore((s) => s.scene === 'contact');
  return (
    <div className="screen" aria-hidden="true">
      <div className="screen__inert" inert>
        <Workspace variant="screen" />
      </div>
      <div className="screen__closing" data-visible={closing}>
        <p className="screen__closing-kicker">Thanks for stopping by</p>
        <p className="screen__closing-title">Let’s build something.</p>
        <p className="screen__closing-mail">{profile.links.email}</p>
      </div>
      <button type="button" className="screen__hit" tabIndex={-1} onClick={() => enterWorkspace()}>
        Open the workspace
      </button>
    </div>
  );
}
