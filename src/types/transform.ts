interface Transform<TIn, TOut> {
  transform: (incoming: TIn, ...args: any[]) => TOut;
}

export default Transform;
