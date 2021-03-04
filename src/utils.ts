export interface ElementAttributes {
  [name: string]: string;
}

export function $<Name extends keyof HTMLElementTagNameMap>(
  name: Name,
  attrs: ElementAttributes = {},
  children: HTMLElement[] = []
): HTMLElementTagNameMap[Name] {
  const control = document.createElement(name);

  Object.entries(attrs).forEach((pair) => control.setAttribute(...pair));
  control.append(...children);

  return control;
}

export function $append<
  Parent extends HTMLElement,
  Children extends HTMLElement[]
>(parent: Parent, ...children: Children): [Parent, ...Children] {
  parent.append(...children);
  return [parent, ...children];
}

export function $find<T extends HTMLElement>(selector: string): T | null {
  return document.querySelector(selector) as T | null;
}
