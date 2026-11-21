/**
 * Mutable objects shared between the scroll timeline (GSAP), the render loop
 * (React Three Fiber) and a few DOM elements. They are written many times a
 * second, so they live outside React state on purpose.
 */

export interface CameraState {
  px: number;
  py: number;
  pz: number;
  tx: number;
  ty: number;
  tz: number;
  fov: number;
  /** Lens shift as a fraction of the viewport, used to make room for copy. */
  shiftX: number;
  shiftY: number;
  /** Desk lamp intensity multiplier. */
  lamp: number;
  /** How much the pointer is allowed to move the camera. */
  parallax: number;
}

/** Written by the scroll timeline, read by the camera rig every frame. */
export const rig: CameraState = {
  px: 1.05,
  py: 0.7,
  pz: 1.3,
  tx: 0,
  ty: 0.18,
  tz: -0.05,
  fov: 32,
  shiftX: 0.2,
  shiftY: 0,
  lamp: 1,
  parallax: 1,
};

/** The monitor's on-screen rectangle in CSS pixels, written every frame. */
export const screenRect = { x: 0, y: 0, w: 0, h: 0, valid: false };

/** Pointer position in -1..1, smoothed by the camera rig. */
export const pointer = { x: 0, y: 0 };

/** Monitor screen geometry, in metres (world space). */
export const SCREEN = {
  width: 0.612,
  height: 0.344,
  center: [0, 0.335, -0.19] as [number, number, number],
  /** CSS size the in-monitor interface is laid out at. */
  cssWidth: 1280,
  cssHeight: 720,
};
