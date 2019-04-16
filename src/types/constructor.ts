/** Constructor type */
type constructor<T> = {
  new (...args: any[]): T;
};

export default constructor;
