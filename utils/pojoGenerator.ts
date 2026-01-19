/**
 * Java POJO Generator
 * Converts JSON structure to Java 17 POJO/Record classes
 */

export type PojoStyle = 'record' | 'class' | 'lombok';

interface GeneratedClass {
  className: string;
  code: string;
  isNested: boolean;
}

interface FieldInfo {
  name: string;
  type: string;
  isArray: boolean;
  isObject: boolean;
  nestedClassName?: string;
}

/**
 * Convert string to PascalCase (for class names)
 */
const toPascalCase = (str: string): string => {
  // Remove .json extension if present
  str = str.replace(/\.json$/i, '');
  // Remove array index notation
  str = str.replace(/\[\d+\]/g, '');
  // Convert to PascalCase
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toUpperCase());
};

/**
 * Convert string to camelCase (for field names)
 */
const toCamelCase = (str: string): string => {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

/**
 * Map JSON type to Java type
 */
const getJavaType = (value: unknown, fieldName: string): { type: string; nestedClassName?: string } => {
  if (value === null) {
    return { type: 'Object' };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: 'List<Object>' };
    }
    const itemType = getJavaType(value[0], fieldName);
    if (itemType.nestedClassName) {
      return { type: `List<${itemType.nestedClassName}>`, nestedClassName: itemType.nestedClassName };
    }
    return { type: `List<${itemType.type}>` };
  }

  if (typeof value === 'object') {
    const className = toPascalCase(fieldName);
    return { type: className, nestedClassName: className };
  }

  switch (typeof value) {
    case 'string':
      return { type: 'String' };
    case 'number':
      // Check if it's an integer or floating point
      if (Number.isInteger(value)) {
        // Use Long for large numbers, Integer for small
        return { type: Math.abs(value) > 2147483647 ? 'Long' : 'Integer' };
      }
      return { type: 'Double' };
    case 'boolean':
      return { type: 'Boolean' };
    default:
      return { type: 'Object' };
  }
};

/**
 * Analyze JSON object and extract field information
 */
const analyzeObject = (obj: Record<string, unknown>): FieldInfo[] => {
  const fields: FieldInfo[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const javaType = getJavaType(value, key);
    fields.push({
      name: toCamelCase(key),
      type: javaType.type,
      isArray: Array.isArray(value),
      isObject: typeof value === 'object' && value !== null && !Array.isArray(value),
      nestedClassName: javaType.nestedClassName,
    });
  }

  return fields;
};

/**
 * Generate Java Record class
 */
const generateRecord = (className: string, fields: FieldInfo[]): string => {
  const fieldList = fields
    .map((f) => `    ${f.type} ${f.name}`)
    .join(',\n');

  return `public record ${className}(
${fieldList}
) {}`;
};

/**
 * Generate Java Class with getters/setters
 */
const generateClass = (className: string, fields: FieldInfo[]): string => {
  const fieldDeclarations = fields
    .map((f) => `    private ${f.type} ${f.name};`)
    .join('\n');

  const gettersSetters = fields
    .map((f) => {
      const capitalizedName = f.name.charAt(0).toUpperCase() + f.name.slice(1);
      const getter = f.type === 'Boolean' 
        ? `    public ${f.type} is${capitalizedName}() {\n        return ${f.name};\n    }`
        : `    public ${f.type} get${capitalizedName}() {\n        return ${f.name};\n    }`;
      const setter = `    public void set${capitalizedName}(${f.type} ${f.name}) {\n        this.${f.name} = ${f.name};\n    }`;
      return `${getter}\n\n${setter}`;
    })
    .join('\n\n');

  return `public class ${className} {

${fieldDeclarations}

    public ${className}() {
    }

${gettersSetters}
}`;
};

/**
 * Generate Lombok annotated class
 */
const generateLombokClass = (className: string, fields: FieldInfo[]): string => {
  const fieldDeclarations = fields
    .map((f) => `    private ${f.type} ${f.name};`)
    .join('\n');

  return `import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ${className} {

${fieldDeclarations}
}`;
};

/**
 * Recursively generate classes for nested objects
 */
const generateNestedClasses = (
  obj: Record<string, unknown>,
  className: string,
  style: PojoStyle,
  processedClasses: Set<string>
): GeneratedClass[] => {
  const classes: GeneratedClass[] = [];

  if (processedClasses.has(className)) {
    return classes;
  }
  processedClasses.add(className);

  const fields = analyzeObject(obj);

  // Generate nested classes first
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
          const nestedClassName = toPascalCase(key);
          const nestedClasses = generateNestedClasses(
            value[0] as Record<string, unknown>,
            nestedClassName,
            style,
            processedClasses
          );
          classes.push(...nestedClasses);
        }
      } else {
        const nestedClassName = toPascalCase(key);
        const nestedClasses = generateNestedClasses(
          value as Record<string, unknown>,
          nestedClassName,
          style,
          processedClasses
        );
        classes.push(...nestedClasses);
      }
    }
  }

  // Generate main class
  let code: string;
  switch (style) {
    case 'record':
      code = generateRecord(className, fields);
      break;
    case 'lombok':
      code = generateLombokClass(className, fields);
      break;
    case 'class':
    default:
      code = generateClass(className, fields);
      break;
  }

  classes.push({
    className,
    code,
    isNested: false,
  });

  return classes;
};

/**
 * Check if imports are needed
 */
const getRequiredImports = (classes: GeneratedClass[]): string[] => {
  const imports: Set<string> = new Set();
  
  for (const cls of classes) {
    if (cls.code.includes('List<')) {
      imports.add('import java.util.List;');
    }
  }

  return Array.from(imports);
};

/**
 * Main function to generate Java POJO from JSON
 */
export const generatePojo = (
  jsonData: unknown,
  className: string,
  style: PojoStyle = 'record'
): { code: string; classes: GeneratedClass[] } => {
  const processedClasses = new Set<string>();
  let classes: GeneratedClass[] = [];

  // Handle array at root level
  if (Array.isArray(jsonData)) {
    if (jsonData.length > 0 && typeof jsonData[0] === 'object' && jsonData[0] !== null) {
      classes = generateNestedClasses(
        jsonData[0] as Record<string, unknown>,
        className,
        style,
        processedClasses
      );
    }
  } else if (typeof jsonData === 'object' && jsonData !== null) {
    classes = generateNestedClasses(
      jsonData as Record<string, unknown>,
      className,
      style,
      processedClasses
    );
  }

  // Build final code with imports
  const imports = getRequiredImports(classes);
  const importSection = imports.length > 0 ? imports.join('\n') + '\n\n' : '';
  
  // Reverse to put main class first, then nested classes
  const reversedClasses = [...classes].reverse();
  const allCode = reversedClasses.map((c) => c.code).join('\n\n// ---\n\n');

  return {
    code: importSection + allCode,
    classes: reversedClasses,
  };
};

/**
 * Generate POJOs from multiple JSON files
 */
export const generatePojosFromFiles = (
  files: { name: string; content: string }[],
  style: PojoStyle = 'record'
): { fileName: string; className: string; code: string }[] => {
  const results: { fileName: string; className: string; code: string }[] = [];

  for (const file of files) {
    try {
      const jsonData = JSON.parse(file.content);
      const className = toPascalCase(file.name);
      const { code } = generatePojo(jsonData, className, style);
      
      results.push({
        fileName: file.name,
        className,
        code,
      });
    } catch (e) {
      console.error(`Failed to parse ${file.name}:`, e);
    }
  }

  return results;
};

export default generatePojo;
