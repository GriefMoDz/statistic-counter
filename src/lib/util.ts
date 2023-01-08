import { Injector, util } from "replugged";

const inject = new Injector();

export type Predicate<Arg> = (arg: Arg) => boolean;

export function findInReactTree(node: JSX.Element | JSX.Element[], predicate: Predicate<JSX.Element>): JSX.Element | null {
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
};

export function forceUpdate(element: Element | null): void {
  if (!element) return;

  const instance = util.getOwnerInstance<any>(element);
  if (instance) {
    const forceRerender = inject.instead(instance, 'render', () => {
      forceRerender();

      return null;
    });

    instance.forceUpdate(() => instance.forceUpdate(() => {}));
  }
}
