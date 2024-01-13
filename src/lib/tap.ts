export function tap(fn: Function) {
  return (x: unknown) => {
    fn(x);
    return x;
  };
}
