import type { DeskObjectId } from '../state/store';

export interface DeskObject {
  id: DeskObjectId;
  label: string;
  hint: string;
  /** Label for the equivalent HTML button outside the canvas. */
  action: string;
}

export const deskObjects: DeskObject[] = [
  { id: 'car', label: 'Undercut', hint: 'My F1 forecasting project — click to explore', action: 'Explore Undercut' },
  { id: 'monitor', label: 'Workspace', hint: 'Open the desktop', action: 'Open the workspace' },
  { id: 'keyboard', label: 'Keyboard', hint: 'Open the portfolio terminal', action: 'Open the terminal' },
  { id: 'mouse', label: 'Mouse', hint: 'Take over the desktop', action: 'Use the desktop' },
  { id: 'purdue', label: 'Purdue University', hint: 'B.S. Computer Science · Class of 2029', action: 'Education' },
  { id: 'headphones', label: 'Off the keyboard', hint: 'Guitar and music — more in About', action: 'About me' },
  { id: 'cube', label: 'Puzzles', hint: 'Click to turn the top layer', action: 'Turn the cube' },
  { id: 'mug', label: 'Coffee', hint: 'Usually involved when a bug keeps me up late', action: 'Turn the mug' },
  { id: 'lamp', label: 'Desk lamp', hint: 'Click to switch it', action: 'Switch the lamp' },
];

export const deskObject = (id: DeskObjectId) => deskObjects.find((o) => o.id === id)!;
