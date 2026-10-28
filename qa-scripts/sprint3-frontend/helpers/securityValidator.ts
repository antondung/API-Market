export interface CurlValidationResult {
  valid: boolean;
  errors: string[];
  hasPreComments: boolean;
  hasBrokenContinuation: boolean;
  preservedContentType?: string;
  hasMaskedKey: boolean;
}

/**
 * Validates a generated cURL snippet against POSIX shell syntax and security rules.
 */
export function validateCurlSnippet(curlText: string): CurlValidationResult {
  const errors: string[] = [];
  const lines = curlText.split(/\r?\n/).map((l) => l.trimEnd());

  let curlStarted = false;
  let hasPreComments = false;
  let hasBrokenContinuation = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#')) {
      if (!curlStarted) {
        hasPreComments = true;
      } else {
        // Comment found after curl invocation started!
        errors.push(`Line ${i + 1}: Comment found after 'curl' invocation. In POSIX shell, comments break line continuations.`);
      }
      continue;
    }

    if (line.startsWith('curl')) {
      curlStarted = true;
    }

    if (curlStarted && i < lines.length - 1) {
      // Check line continuation
      if (line.endsWith('\\')) {
        // Valid continuation mark
        // Next non-empty line must not be a comment
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && nextLine.startsWith('#')) {
          hasBrokenContinuation = true;
          errors.push(`Line ${i + 1}: Line continuation '\\' followed immediately by a comment on line ${i + 2}.`);
        }
      } else if (!line.startsWith('#') && i < lines.length - 1 && lines[i + 1].trim().length > 0) {
        // Line doesn't end with backslash but there's a subsequent command line
        // Only permissible if it's the final line of curl arguments
        errors.push(`Line ${i + 1}: Missing trailing '\\' line continuation.`);
      }
    }
  }

  // Check header Content-Type preservation
  let preservedContentType: string | undefined;
  const ctMatch = curlText.match(/-H\s+['"]Content-Type:\s*([^'"]+)['"]/i);
  if (ctMatch) {
    preservedContentType = ctMatch[1].trim();
  }

  // Check credential masking
  const hasMaskedKey =
    curlText.includes('your_api_key_here') ||
    curlText.includes('your_token_here') ||
    curlText.includes('API_KEY') ||
    curlText.includes('***') ||
    /Bearer\s+(api_[a-z0-9_]*\*+|\<[A-Z_]+\>)/i.test(curlText);

  return {
    valid: errors.length === 0,
    errors,
    hasPreComments,
    hasBrokenContinuation,
    preservedContentType,
    hasMaskedKey,
  };
}

/**
 * Validates that browser network requests do NOT violate Anti-SSRF policies
 * (no direct browser calls to external provider domains).
 */
export function validateAntiSsrf(
  interceptedUrls: string[],
  allowedPrefixes: string[] = [
    'http://127.0.0.1',
    'http://localhost',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ]
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  for (const urlStr of interceptedUrls) {
    try {
      const url = new URL(urlStr);
      const isAllowed = allowedPrefixes.some((prefix) => urlStr.startsWith(prefix)) || urlStr.startsWith('/');
      if (!isAllowed) {
        violations.push(`Illegal direct outbound request to third-party host: ${urlStr}`);
      }
    } catch {
      // Relative URLs are safe local calls
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
