/**
 * Analiz dokümanı standartları (Confluence markdown).
 * Kullanıcıya gösterilmez; LLM'e instruction olarak verilir.
 */
export const ANALYSIS_STANDARDS_MD = `# Analyze and Document SOAP/REST API Specifications

Default table for who create documentation:

| **Document Owner**                | write static: Ugur Erdem         |
|-----------------------------------|-------------------|
| **Lansman Tarihi**                | create  month and year   |
| **Altyapı webservis key**         |                 |
| **Test Case**                     |                   |
| **Adapter Spec Dokümanları**      |                   |
| **Development Team**              | write static: CRCS-CORP                 |
| **Postman / Soap Collection**     |                   |

Document create for confluence markdown format, ensuring clarity and completeness. Include all necessary details for developers to implement and test the API effectively. create copyable md file 

Request and response should added on document, it is given in the prompt.

Create comprehensive documentation for the specified API endpoint including request/response structures, test scenarios, and error handling. Documentation must follow the standards below:

All Table header must be in Turkish Start with Uppercase letters, and use proper Markdown syntax for easy readability in Confluence.

**0. Adapter servisinin adres bilgilerini burada dolduralacaktır**

| Servis Adı | Servis Tipi | Endpoint/Operation | Ortam | 
|---|---|---|---|

- tablo olarak ekle burada manuel doldurulacaktır.
---


**1. Request Parameters Documentation**
| Parametre Adı | Açıklama (TR) | Konum | Format/Tür | Olası Değerler | Kaynak |
|----------------|-----------------|-----------|-------------|-----------------|---------|

Notes:
- Use camelCase for parameter names (English) but not start with uppercase
- Descriptions in Turkish
- Specify parameter constraints and validations
- Include source system/service information

**2. Response Structure Documentation**
| Parametre Adı | Açıklama (TR) | Format/Tür | Olası Değerler | İş Kuralları |
|----------------|-----------------|-------------|-----------------|----------------|

Notes:
- Include mock response examples in JSON/XML format
- Document nested objects/arrays clearly
- Specify data types and formats

**3. Error Handling**
| Error Code | Description (TR) | Scenario | Example Response |
|------------|-----------------|-----------|------------------|

Notes:
- Document all possible error states
- Include sample error responses
- Specify business impact

**4. Test Scenarios**
| Test ID | Scenario Description | Test Data | Expected Result | Success Criteria | Priority |
|---------|---------------------|------------|-----------------|------------------|-----------|

Notes:
- Cover positive and negative scenarios
- Include boundary value tests
- Test error conditions
- Validate business rules

**5. Mock Data Requirements**
- Provide realistic mock data examples
- Include all possible field variations
- Demonstrate field relationships
- Show formatted responses for success/error cases

Format all tables using proper Markdown syntax for easy copy-paste into Confluence..
`;

export function buildAnalysisPrompt(fileContents: { name: string; content: string }[]): string {
  const filesSection = fileContents
    .map((f) => `## Dosya: ${f.name}\n\`\`\`\n${f.content.slice(0, 8000)}\n\`\`\``)
    .join('\n\n');

  return `${ANALYSIS_STANDARDS_MD}

---

Aşağıdaki JSON/XML dosya içeriklerini yukarıdaki standartlara göre analiz et ve Confluence markdown dokümanı üret. Sadece markdown çıktı ver, ek açıklama yazma.

${filesSection}`;
}
