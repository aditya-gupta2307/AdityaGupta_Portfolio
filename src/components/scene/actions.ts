import { enterWorkspace, goTo, setState, type DeskObjectId } from '../../state/store';

/** What each desk object does when clicked (or its HTML twin is pressed). */
export function activateDeskObject(id: DeskObjectId) {
  switch (id) {
    case 'monitor':
    case 'mouse':
      enterWorkspace({ mode: 'desktop' });
      break;
    case 'keyboard':
      enterWorkspace({ mode: 'terminal' });
      break;
    case 'car':
      setState({ focus: 'car' });
      break;
    case 'purdue':
      goTo('about');
      break;
    case 'headphones':
      goTo('about');
      break;
    case 'mug':
      setState((s) => ({ mugTurns: s.mugTurns + 1 }));
      break;
    case 'cube':
      setState((s) => ({ cubeTurns: s.cubeTurns + 1 }));
      break;
    case 'lamp':
      setState((s) => ({ lampOn: !s.lampOn }));
      break;
  }
}
