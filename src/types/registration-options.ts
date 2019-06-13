export enum Lifetime {
  TRANSIENT = "Transient",
  SINGLETON = "Singleton",
  SCOPED = "Scoped"
}

type RegistrationOptions = {
  lifetime?: Lifetime;
  singleton?: boolean;
};

export default RegistrationOptions;
