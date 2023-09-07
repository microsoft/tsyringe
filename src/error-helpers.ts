import constructor from "./types/constructor.ts";

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
  error: Error
): string {
  const [, params = null] =
    ctor.toString().match(/constructor\(([\w, ]+)\)/) || [];
  const dep = formatDependency(params, paramIdx);
  return composeErrorMessage(
    `Cannot inject the dependency ${dep} of "${ctor.name}" constructor. Reason:`,
    error
  );
}
