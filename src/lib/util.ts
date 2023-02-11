import type { Predicate } from '@types';

import { util } from 'replugged';
import { inject } from '@index';

export function findInReactTree(
  node: React.ReactElement | React.ReactElement[],
  predicate: Predicate<React.ReactElement>
): React.ReactElement | null {
  const stack = [node].flat();

  while (stack.length !== 0) {
    const node = stack.pop();

    if (node && predicate(node)) {
      return node;
    }

    if (node?.props?.children) {
      stack.push(...[node.props.children].flat());
    }
  }

  return null;
}

export function forceUpdate(element: Element | null): void {
  if (!element) return;

  const instance = util.getOwnerInstance(element);
  if (instance) {
    const forceRerender = inject.instead(instance, 'render', () => {
      forceRerender();

      return null;
    });

    instance.forceUpdate(() => instance.forceUpdate(() => {}));
  }
}
