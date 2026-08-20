/**
 * Utility class handling Mustache-style variable template substitution.
 * Replaces dynamic placeholders like {{baseUrl}} with active environment values.
 */
export class VariableParser {
  /**
   * Regex targeting Mustache syntax: {{ variable_name }}
   * Captures alphanumeric variable names while allowing whitespace around keys.
   */
  private static readonly VARIABLE_REGEX: RegExp =
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

  /**
   * Replaces placeholders in a given string with values from an environment map.
   * If a variable key is missing in the map, the placeholder is preserved as-is.
   *
   * @param template - Raw string containing {{ key }} syntax
   * @param variables - Key-value map of environment variables
   * @returns Resolved string with substituted values
   */
  static parse(template: string, variables?: Record<string, string>): string {
    if (!template) return template;

    // Fallback to empty object if variables is null or undefined
    const safeVariables = variables || {};

    return template.replace(
      this.VARIABLE_REGEX,
      (match: string, key: string): string => {
        return Object.prototype.hasOwnProperty.call(safeVariables, key)
          ? safeVariables[key]
          : match;
      },
    );
  }

  /**
   * Parses dynamic variables inside both header keys and header values.
   *
   * @param headers - Raw HTTP headers object
   * @param variables - Key-value map of environment variables
   * @returns New headers object with parsed key-value pairs
   */
  static parseHeaders(
    headers?: Record<string, string>,
    variables?: Record<string, string>,
  ): Record<string, string> {
    const parsedHeaders: Record<string, string> = {};
    const safeHeaders = headers || {};

    for (const [key, value] of Object.entries(safeHeaders)) {
      const parsedKey: string = this.parse(key, variables);
      const parsedValue: string = this.parse(value, variables);

      parsedHeaders[parsedKey] = parsedValue;
    }

    return parsedHeaders;
  }
}
