export function splitPascalCase(str) {
  return str.replace(/([A-Z])/g, ' $1').trim();
}