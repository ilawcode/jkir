import { jsonrepair } from 'jsonrepair';

/**
 * Leniently formats a JSON string.
 * If valid, formats it normally.
 * If invalid, tries to repair it first, then formats.
 * If still invalid, returns the original string or a basic indented version.
 */
export function lenientFormatJson(jsonString: string): { formatted: string; error: string | null } {
    const trimmed = jsonString.trim();
    if (!trimmed) return { formatted: '', error: null };

    // 1. Try standard JSON parse/format
    try {
        const parsed = JSON.parse(trimmed);
        return { formatted: JSON.stringify(parsed, null, 2), error: null };
    } catch (e) {
        // 2. Try jsonrepair
        try {
            const repaired = jsonrepair(trimmed);
            const parsed = JSON.parse(repaired);
            return { 
                formatted: JSON.stringify(parsed, null, 2), 
                error: (e as Error).message // Show the original error but return formatted content
            };
        } catch (repairError) {
            // 3. Last resort: basic line-based indenter for broken JSON
            return { 
                formatted: basicIndenter(trimmed, 'json'), 
                error: (e as Error).message 
            };
        }
    }
}

/**
 * Leniently formats an XML string.
 * If valid, formats it normally.
 * If invalid, uses a basic line-based indenter.
 */
export function lenientFormatXml(xmlString: string): { formatted: string; error: string | null } {
    const trimmed = xmlString.trim();
    if (!trimmed) return { formatted: '', error: null };

    try {
        // Attempt to use DOMParser for validation and proper serialization
        const parser = new DOMParser();
        const doc = parser.parseFromString(trimmed, 'application/xml');
        const parseError = doc.querySelector('parsererror');
        
        if (parseError) {
            throw new Error(parseError.textContent || 'Invalid XML');
        }

        const serializer = new XMLSerializer();
        const raw = serializer.serializeToString(doc);
        
        // Re-use the indent logic from xmlParser but make it more robust
        return { formatted: indentXml(raw), error: null };
    } catch (e) {
        // Return a basic indented version even if it's broken
        return { 
            formatted: indentXml(trimmed), 
            error: (e as Error).message 
        };
    }
}

/**
 * A basic indenter that works line-by-line based on brackets/tags.
 * This is a "brute force" approach for broken content.
 */
function basicIndenter(str: string, type: 'json' | 'xml'): string {
    const lines = str
        .replace(/([\{\}\[\]])/g, '\n$1\n') // Split JSON brackets
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

    let indentLevel = 0;
    const indent = '  ';
    let result = '';

    for (const line of lines) {
        if (line.match(/[\}\]]/)) indentLevel--;
        result += indent.repeat(Math.max(0, indentLevel)) + line + '\n';
        if (line.match(/[\{\[]/)) indentLevel++;
    }

    return result.trim();
}

/**
 * Robust XML indenter that doesn't rely on valid DOM.
 */
function indentXml(xml: string): string {
    let formatted = '';
    let indent = '';
    const tab = '  ';
    
    // Split by tags
    const nodes = xml.replace(/(>)\s*(<)/g, '$1\n$2').split('\n');
    
    for (const node of nodes) {
        const trimmed = node.trim();
        if (!trimmed) continue;
        
        if (trimmed.match(/^\/\w/)) {
            // End tag
            indent = indent.substring(tab.length);
        }
        
        formatted += indent + trimmed + '\r\n';
        
        if (trimmed.match(/^<\w/) && !trimmed.match(/\/>$/) && !trimmed.match(/<\/\w/)) {
            // Start tag (not self-closing and no end tag on same line)
            indent += tab;
        }
    }
    
    return formatted.trim();
}
