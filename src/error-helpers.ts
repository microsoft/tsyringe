import constructor from "./types/constructor";

function formatDependency(params: string | null, idx: number): string {
  if (params === null) {
    return `at position #${idx}`;
  }
  const argName = params.split(",")[idx].trim();
  return `"${argName}" at position #${idx}`;
}

function composeErrorMessage(msg: string, e: Error, indent = "    "): string {
  return [msg, ...e.message.split("\n").map(l => indent + l)].join("\n");
}

export function formatErrorCtor(
  ctor: constructor<any>,
  paramIdx: number,
  error: Error,
  propertyKey: string | symbol | undefined = undefined
): string {
  let params;
  let targetName;
  if (propertyKey) {
    const methodName = String(propertyKey);
    [, params] =
      ctor.constructor
        .toString()
        .match(new RegExp(`${methodName}\\(([\\w, ]+)\\)`)) || [];
    targetName = `${ctor.constructor.name}.${methodName}`;
  } else {
    [, params] = ctor.toString().match(/constructor\(([\w, ]+)\)/) || [];
    targetName = `${ctor.name} constructor`;
  }
  const dep = formatDependency(params, paramIdx);
  return composeErrorMessage(
    `Cannot inject the dependency ${dep} of ${targetName}. Reason:`,
    error
  );
}
