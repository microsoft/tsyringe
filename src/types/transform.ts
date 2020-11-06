export interface Transform<In, Out> {
  transform: (incoming: In, ...args: any[]) => Out;
}
