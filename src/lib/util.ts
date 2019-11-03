export type Predicate<Arg> = (arg: Arg) => boolean;

export const findInReactTree = (node: JSX.Element | JSX.Element[], predicate: Predicate<JSX.Element>): JSX.Element | null => {
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
