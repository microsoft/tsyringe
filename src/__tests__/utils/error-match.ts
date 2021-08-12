export default function errorMatch(lines: RegExp[]): RegExp {
  return new RegExp(lines.map((x) => x.source).join("\\s+"));
}
