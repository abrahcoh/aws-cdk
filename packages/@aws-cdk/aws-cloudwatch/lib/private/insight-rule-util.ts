/**
 * Utility function to convert all keys of an object to PascalCase.
 * Note: This can only be used for objects during initialization. If after that, use the
 * capitalizePropertyNames from the core library instead. That handles if an object name is resolved
 * @param obj the object that will have pascal case keys
 */
export function keysToPascalCase(obj: any): any {
  if (typeof(obj) !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(x => keysToPascalCase(x));
  }

  const newObj: any = { };
  for (const key of Object.keys(obj)) {
    const value = obj[key];

    const first = key.charAt(0).toUpperCase();
    const newKey = first + key.slice(1);
    newObj[newKey] = keysToPascalCase(value);
  }

  return newObj;
}