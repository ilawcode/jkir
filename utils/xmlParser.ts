/**
 * XML Parser Utility
 * Converts between XML strings and JavaScript objects,
 * and provides XML formatting/minification.
 */

export interface XmlNode {
    [key: string]: unknown;
    _attributes?: Record<string, string>;
    _text?: string;
    _cdata?: string;
}

/**
 * Parse an XML string into a JavaScript object.
 * Supports attributes, text content, CDATA sections, and nested elements.
 */
export function parseXml(xmlString: string): unknown {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString.trim(), 'application/xml');

    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
        const errorText = parseError.textContent || 'XML parse hatası';
        throw new Error(errorText);
    }

    return elementToObject(doc.documentElement);
}

/**
 * Convert a DOM Element to a JavaScript object recursively.
 */
function elementToObject(element: Element): unknown {
    const result: Record<string, unknown> = {};

    // Collect attributes
    if (element.attributes.length > 0) {
        const attrs: Record<string, string> = {};
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            attrs[`@${attr.name}`] = attr.value;
        }
        Object.assign(result, attrs);
    }

    // Collect child elements
    const childElements = Array.from(element.children);

    if (childElements.length === 0) {
        // Leaf node - has text content or CDATA
        const textContent = element.textContent?.trim() || '';

        // Check if this node has both attributes and text
        if (Object.keys(result).length > 0 && textContent) {
            result['#text'] = inferType(textContent);
            return result;
        }

        // Pure text node with no attributes
        if (Object.keys(result).length === 0) {
            return inferType(textContent);
        }

        return result;
    }

    // Group children by tag name to detect arrays
    const childGroups: Record<string, Element[]> = {};
    childElements.forEach((child) => {
        const tag = child.tagName;
        if (!childGroups[tag]) {
            childGroups[tag] = [];
        }
        childGroups[tag].push(child);
    });

    // Process child groups
    for (const [tag, elements] of Object.entries(childGroups)) {
        if (elements.length > 1) {
            // Multiple elements with the same tag → array
            result[tag] = elements.map((el) => elementToObject(el));
        } else {
            result[tag] = elementToObject(elements[0]);
        }
    }

    // If there's also direct text content mixed with children
    const directTextNodes = Array.from(element.childNodes).filter(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
    );
    if (directTextNodes.length > 0) {
        const text = directTextNodes.map((n) => n.textContent?.trim()).join(' ');
        if (text) {
            result['#text'] = text;
        }
    }

    return result;
}

/**
 * Infer the JavaScript type from a string value.
 */
function inferType(value: string): unknown {
    if (value === '') return '';
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;

    // Try number
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== '') {
        return num;
    }

    return value;
}

/**
 * Convert a JavaScript object back to an XML string.
 */
export function objectToXml(obj: unknown, rootTag?: string): string {
    if (obj === null || obj === undefined) {
        return rootTag ? `<${rootTag}/>` : '';
    }

    if (typeof obj !== 'object') {
        return rootTag ? `<${rootTag}>${escapeXml(String(obj))}</${rootTag}>` : escapeXml(String(obj));
    }

    const entries = Object.entries(obj as Record<string, unknown>);

    // If no rootTag is provided and the object has exactly one key, use that as root
    if (!rootTag && entries.length === 1 && typeof entries[0][1] === 'object') {
        return objectToXml(entries[0][1], entries[0][0]);
    }

    const tag = rootTag || 'root';
    let xml = '';

    // Separate attributes from children
    const attributes: string[] = [];
    const children: [string, unknown][] = [];
    let textContent: string | null = null;

    for (const [key, value] of entries) {
        if (key.startsWith('@')) {
            attributes.push(`${key.slice(1)}="${escapeXml(String(value))}"`);
        } else if (key === '#text') {
            textContent = String(value);
        } else {
            children.push([key, value]);
        }
    }

    // Build opening tag
    const attrStr = attributes.length > 0 ? ' ' + attributes.join(' ') : '';

    if (children.length === 0 && textContent === null) {
        return `<${tag}${attrStr}/>`;
    }

    xml += `<${tag}${attrStr}>`;

    if (textContent !== null) {
        xml += escapeXml(textContent);
    }

    for (const [childKey, childValue] of children) {
        if (Array.isArray(childValue)) {
            for (const item of childValue) {
                xml += objectToXml(item, childKey);
            }
        } else if (typeof childValue === 'object' && childValue !== null) {
            xml += objectToXml(childValue, childKey);
        } else {
            xml += `<${childKey}>${escapeXml(String(childValue ?? ''))}</${childKey}>`;
        }
    }

    xml += `</${tag}>`;

    return xml;
}

/**
 * Escape special XML characters.
 */
function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Format (pretty-print) an XML string.
 */
export function formatXml(xmlString: string, indent: string = '  '): string {
    // First, parse to validate
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString.trim(), 'application/xml');

    const parseError = doc.querySelector('parsererror');
    if (parseError) {
        throw new Error(parseError.textContent || 'Geçersiz XML');
    }

    // Use XMLSerializer and then format
    const serializer = new XMLSerializer();
    const raw = serializer.serializeToString(doc);

    // Format the raw XML with proper indentation
    let formatted = '';
    let indentLevel = 0;
    const pad = () => indent.repeat(indentLevel);

    // Remove existing whitespace between tags
    const stripped = raw.replace(/(>)\s*(<)/g, '$1\n$2');
    const lines = stripped.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Closing tag
        if (trimmed.startsWith('</')) {
            indentLevel--;
            formatted += pad() + trimmed + '\n';
        }
        // Self-closing tag
        else if (trimmed.endsWith('/>')) {
            formatted += pad() + trimmed + '\n';
        }
        // Opening tag with content and closing tag on same line (e.g., <tag>value</tag>)
        else if (trimmed.match(/^<[^/][^>]*>[^<]*<\/[^>]+>$/)) {
            formatted += pad() + trimmed + '\n';
        }
        // Opening tag
        else if (trimmed.startsWith('<') && !trimmed.startsWith('<?')) {
            formatted += pad() + trimmed + '\n';
            if (!trimmed.includes('</')) {
                indentLevel++;
            }
        }
        // Processing instruction or other
        else {
            formatted += pad() + trimmed + '\n';
        }
    }

    return formatted.trim();
}

/**
 * Minify an XML string by removing unnecessary whitespace.
 */
export function minifyXml(xmlString: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString.trim(), 'application/xml');

    const parseError = doc.querySelector('parsererror');
    if (parseError) {
        throw new Error(parseError.textContent || 'Geçersiz XML');
    }

    const serializer = new XMLSerializer();
    const raw = serializer.serializeToString(doc);

    // Remove whitespace between tags
    return raw
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .replace(/> </g, '><')
        .trim();
}

/**
 * Detect if a string is XML content.
 */
export function isXmlContent(content: string): boolean {
    const trimmed = content.trim();
    return trimmed.startsWith('<') && trimmed.endsWith('>') && !trimmed.startsWith('{');
}

/**
 * Detect file type from file name extension.
 */
export function getFileType(fileName: string): 'json' | 'xml' | 'unknown' {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.json')) return 'json';
    if (lower.endsWith('.xml')) return 'xml';
    return 'unknown';
}

/**
 * Get default content for a file type.
 */
export function getDefaultContent(fileType: 'json' | 'xml' | 'unknown'): string {
    switch (fileType) {
        case 'json':
            return '{}';
        case 'xml':
            return '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n</root>';
        default:
            return '';
    }
}
