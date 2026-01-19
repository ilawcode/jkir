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
 * Convert plural field name to singular for better type inference
 */
const toSingular = (str: string): string => {
  // Simple pluralization rules
  if (str.endsWith('ies')) {
    return str.slice(0, -3) + 'y';
  }
  if (str.endsWith('es')) {
    return str.slice(0, -2);
  }
  if (str.endsWith('s') && !str.endsWith('ss')) {
    return str.slice(0, -1);
  }
  return str;
};

/**
 * Check if field name suggests it should be an object type
 * Common patterns: ends with "Info", "Data", "Details", "Config", "Settings", "Response", "Request", etc.
 */
const shouldInferAsObject = (fieldName: string): boolean => {
  const objectSuffixes = ['info', 'data', 'details', 'config', 'settings', 'response', 'request', 'result', 'options', 'params', 'body', 'payload', 'content', 'metadata'];
  const lowerName = fieldName.toLowerCase();
  return objectSuffixes.some(suffix => lowerName.endsWith(suffix)) || 
         lowerName.includes('_') || // snake_case usually indicates object
         /[A-Z]/.test(fieldName); // camelCase usually indicates object
};

/**
 * Map JSON type to Java type
 */
const getJavaType = (value: unknown, fieldName: string): { type: string; nestedClassName?: string } => {
  if (value === null) {
    // Try to infer type from field name for null values
    // If field name suggests it's an object, use the class name
    if (shouldInferAsObject(fieldName)) {
      const className = toPascalCase(fieldName);
      return { type: className, nestedClassName: className };
    }
    // Otherwise use Object as fallback
    return { type: 'Object' };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      // For empty arrays, try to infer type from field name (e.g., "users" -> "User")
      const singularName = toSingular(fieldName);
      const inferredClassName = toPascalCase(singularName);
      return { type: `List<${inferredClassName}>`, nestedClassName: inferredClassName };
    }
    const itemType = getJavaType(value[0], toSingular(fieldName));
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

  return `import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
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
    if (value === null) {
      // For null values that should be objects, generate an empty placeholder class
      if (shouldInferAsObject(key)) {
        const nestedClassName = toPascalCase(key);
        if (!processedClasses.has(nestedClassName)) {
          processedClasses.add(nestedClassName);
          // Generate empty class as placeholder
          let code: string;
          switch (style) {
            case 'record':
              code = `public record ${nestedClassName}() {}`;
              break;
            case 'lombok':
              code = `import lombok.Getter;\nimport lombok.Setter;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;\n\n@Getter\n@Setter\n@NoArgsConstructor\n@AllArgsConstructor\npublic class ${nestedClassName} {\n}`;
              break;
            case 'class':
            default:
              code = `public class ${nestedClassName} {\n\n    public ${nestedClassName}() {\n    }\n}`;
              break;
          }
          classes.push({ className: nestedClassName, code, isNested: true });
        }
      }
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
          // Use singular form for array item class name (e.g., "users" -> "User")
          const nestedClassName = toPascalCase(toSingular(key));
          const nestedClasses = generateNestedClasses(
            value[0] as Record<string, unknown>,
            nestedClassName,
            style,
            processedClasses
          );
          classes.push(...nestedClasses);
        } else if (value.length === 0) {
          // For empty arrays, generate placeholder class based on field name
          const nestedClassName = toPascalCase(toSingular(key));
          if (!processedClasses.has(nestedClassName)) {
            processedClasses.add(nestedClassName);
            let code: string;
            switch (style) {
              case 'record':
                code = `public record ${nestedClassName}() {}`;
                break;
              case 'lombok':
                code = `import lombok.Getter;\nimport lombok.Setter;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;\n\n@Getter\n@Setter\n@NoArgsConstructor\n@AllArgsConstructor\npublic class ${nestedClassName} {\n}`;
                break;
              case 'class':
              default:
                code = `public class ${nestedClassName} {\n\n    public ${nestedClassName}() {\n    }\n}`;
                break;
            }
            classes.push({ className: nestedClassName, code, isNested: true });
          }
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
 * Generate POJOs from multiple JSON files (legacy - combined code)
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

/**
 * Generated file info for file tree structure
 */
export interface GeneratedFile {
  className: string;
  fileName: string;
  code: string;
  sourceFile: string;
}

/**
 * Add imports to class code
 */
const addImportsToCode = (code: string): string => {
  const needsList = code.includes('List<');
  if (needsList) {
    return 'import java.util.List;\n\n' + code;
  }
  return code;
};

/**
 * Generate separate files for each class from JSON
 */
export const generatePojoFiles = (
  jsonData: unknown,
  className: string,
  sourceFileName: string,
  style: PojoStyle = 'record'
): GeneratedFile[] => {
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

  // Convert to GeneratedFile format - each class is a separate file
  return classes.map((cls) => ({
    className: cls.className,
    fileName: `${cls.className}.java`,
    code: addImportsToCode(cls.code),
    sourceFile: sourceFileName,
  }));
};

/**
 * Generate separate POJO files from multiple JSON files
 * Returns a flat list of all generated Java files
 */
export const generatePojoFilesFromMultiple = (
  files: { name: string; content: string }[],
  style: PojoStyle = 'record'
): GeneratedFile[] => {
  const allFiles: GeneratedFile[] = [];
  const processedClassNames = new Set<string>();

  for (const file of files) {
    try {
      const jsonData = JSON.parse(file.content);
      const className = toPascalCase(file.name);
      const generatedFiles = generatePojoFiles(jsonData, className, file.name, style);
      
      // Add files, avoiding duplicates by class name
      for (const genFile of generatedFiles) {
        if (!processedClassNames.has(genFile.className)) {
          processedClassNames.add(genFile.className);
          allFiles.push(genFile);
        }
      }
    } catch (e) {
      console.error(`Failed to parse ${file.name}:`, e);
    }
  }

  return allFiles;
};

export default generatePojo;
