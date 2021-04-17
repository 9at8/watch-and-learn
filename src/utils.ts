export interface ElementAttributes {
  [name: string]: string;
}

export function $<Name extends keyof HTMLElementTagNameMap>(
  name: Name,
  attrs: ElementAttributes = {},
  children: HTMLElement[] = [],
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

export function exponentialWait(
  check: () => boolean,
  limit: number = 10000,
  initialTimeout = 50,
) {
  return new Promise<void>((resolve, reject) => {
    function wait(timeout: number) {
      setTimeout(() => {
        if (check()) {
          resolve();
        } else if (timeout > limit) {
          reject(
            `[watch-and-learn] Could not find video player in timelimit ${limit} ms.`,
          );
        } else {
          wait(timeout * 2);
        }
      }, timeout);
    }

    wait(initialTimeout);
  });
}
