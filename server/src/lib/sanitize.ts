import sanitizeHtml from 'sanitize-html';

const defaultOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'p',
    'a',
    'ul',
    'ol',
    'nl',
    'li',
    'b',
    'i',
    'strong',
    'em',
    'strike',
    'code',
    'hr',
    'br',
    'div',
    'table',
    'thead',
    'caption',
    'tbody',
    'tr',
    'th',
    'td',
    'pre',
    'span',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    td: ['align', 'valign'],
    th: ['align', 'valign'],
    code: ['class'],
    span: ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
  allowProtocolRelative: true,
};

export function sanitizeContent(dirty: string): string {
  if (!dirty) return '';
  return sanitizeHtml(dirty, defaultOptions);
}

export function sanitizePlainText(dirty: string): string {
  if (!dirty) return '';
  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
    allowedSchemes: [],
  }).trim();
}
