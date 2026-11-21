import * as THREE from 'three';

/**
 * Material factories. Objects that highlight on hover get their own instances
 * so the highlight never leaks onto another object.
 */

export const aluminium = (color = '#b9bec6', roughness = 0.34) =>
  new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness, clearcoat: 0.25, clearcoatRoughness: 0.4 });

export const darkMetal = (color = '#2c2f34', roughness = 0.42) =>
  new THREE.MeshPhysicalMaterial({ color, metalness: 0.9, roughness });

export const plastic = (color: string, roughness = 0.62) =>
  new THREE.MeshStandardMaterial({ color, metalness: 0, roughness });

export const glossy = (color: string, roughness = 0.28) =>
  new THREE.MeshPhysicalMaterial({ color, metalness: 0, roughness, clearcoat: 1, clearcoatRoughness: 0.12 });

export const paint = (color: string) =>
  new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.55,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
  });

export const rubber = (color = '#141517') => new THREE.MeshStandardMaterial({ color, metalness: 0, roughness: 0.9 });

export const glass = () =>
  new THREE.MeshPhysicalMaterial({ color: '#030304', metalness: 0, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02 });

export const ceramic = (color = '#ecebe7') =>
  new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.25, sheen: 0.2 });

/** Every mesh in a subtree, for highlight and disposal. */
export function meshesOf(obj: THREE.Object3D) {
  const out: THREE.Mesh[] = [];
  obj.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) out.push(o as THREE.Mesh);
  });
  return out;
}

export function disposeMaterials(list: THREE.Material[]) {
  list.forEach((m) => {
    Object.values(m).forEach((v) => {
      if (v instanceof THREE.Texture) v.dispose();
    });
    m.dispose();
  });
}
