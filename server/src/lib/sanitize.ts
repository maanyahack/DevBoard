// Import sanitize-html — a library that strips dangerous HTML from strings.
// This prevents Cross-Site Scripting (XSS) attacks where malicious users
// inject <script> tags or event handlers into content.
import sanitizeHtml from 'sanitize-html';

// Define the default sanitization options — a whitelist of allowed HTML tags
// and attributes. Everything NOT in this list will be stripped.
const defaultOptions: sanitizeHtml.IOptions = {
  // 'allowedTags' — only these HTML elements will be preserved.
  // Anything else (like <script>, <iframe>, <object>, <embed>) is removed.
  // This is a whitelist approach: safe by default, only permitting known-safe tags.
  allowedTags: [
    // Heading tags for structured content (h1-h6)
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Block-level content tags
    'blockquote', 'p', 'div', 'pre',
    // Links — note: href values are validated separately below
    'a',
    // Lists
    'ul', 'ol', 'nl', 'li',
    // Inline formatting
    'b', 'i', 'strong', 'em', 'strike', 'code',
    // Horizontal rule and line break
    'hr', 'br',
    // Tables
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td',
    // Generic inline container
    'span',
  ],

  // 'allowedAttributes' — only these attributes are permitted per tag.
  // Attributes not listed here are stripped even if the tag is allowed.
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],     // Links need href, target, rel
    td: ['align', 'valign'],                    // Table cell alignment
    th: ['align', 'valign'],                    // Table header alignment
    code: ['class'],                            // For syntax highlighting classes
    span: ['class'],                            // For styling spans
  },

  // 'allowedSchemes' — only these URL schemes are allowed in href/src attributes.
  // This prevents javascript: or data: URIs which could execute code.
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],

  // Allows protocol-relative URLs like "//example.com/image.png"
  allowProtocolRelative: true,
};

/**
 * sanitizeContent — cleans rich HTML content (like note bodies).
 *
 * Allows formatting tags (bold, italic, links, tables, etc.) but strips
 * anything dangerous. Use this for user-generated content that needs
 * basic HTML formatting support.
 */
export function sanitizeContent(dirty: string): string {
  // If the input is empty/falsy, return an empty string immediately.
  if (!dirty) return '';
  // Run the dirty string through sanitize-html with our whitelist options.
  return sanitizeHtml(dirty, defaultOptions);
}

/**
 * sanitizePlainText — strips ALL HTML tags, leaving only the text content.
 *
 * Use this for fields that should never contain HTML, like titles,
 * categories, or display names. Even if a user somehow submits HTML,
 * it will be stripped to plain text.
 */
export function sanitizePlainText(dirty: string): string {
  if (!dirty) return '';
  // Pass empty options: no allowed tags, no allowed attributes, no allowed schemes.
  // This strips everything, leaving only the text between tags.
  // '.trim()' removes any leading/trailing whitespace.
  return sanitizeHtml(dirty, {
    allowedTags: [],           // No tags allowed — strip everything
    allowedAttributes: {},     // No attributes allowed
    allowedSchemes: [],        // No URL schemes allowed
  }).trim();
}
