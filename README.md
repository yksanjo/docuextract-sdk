# DocuExtract SDK

Official JavaScript/TypeScript SDK for DocuExtract Gateway - Unified Document Intelligence API.

## Installation

```bash
npm install docuextract-sdk
```

## Quick Start

```javascript
const DocuExtractClient = require('docuextract-sdk');

// Create client
const client = new DocuExtractClient({
  baseUrl: 'http://localhost:3000',
  clientId: 'my-app'
});

// Extract text from PDF
const result = await client.extract('./invoice.pdf', {
  documentType: 'invoice'
});

console.log(result.extraction.text);
```

## API Reference

### `new DocuExtractClient(options)`

Create a new client instance.

**Options:**
- `baseUrl` - Gateway URL (default: `http://localhost:3000`)
- `apiKey` - API key for authentication
- `clientId` - Client ID for usage tracking

### `client.extract(document, options)`

Extract text from a document file.

**Parameters:**
- `document` - File path (string) or Buffer
- `options.documentType` - Document type: `invoice`, `receipt`, `form`, `contract`, `id_document`, `generic`
- `options.forceProvider` - Force specific provider: `langextract`, `aws`, `azure`

**Returns:** Extraction result with text, pages, tables, and forms

### `client.getProviders()`

Get list of available providers.

### `client.getPricing()`

Get pricing information including volume discounts.

### `client.healthCheck()`

Check health status of all providers.

### `client.getUsage()`

Get usage statistics for the current client.

### `client.getRouting(documentType)`

Get routing information for a document type.

## Example: Process Invoice

```javascript
const DocuExtractClient = require('docuextract-sdk');

const client = new DocuExtractClient({
  baseUrl: 'http://localhost:3000',
  clientId: 'billing-app'
});

const result = await client.extract('./invoice.pdf', {
  documentType: 'invoice'
});

console.log('Extracted text:', result.extraction.text);
console.log('Tables found:', result.extraction.tables);
console.log('Cost:', result.cost.finalCost);
```

## TypeScript Support

```typescript
import DocuExtractClient from 'docuextract-sdk';

const client = new DocuExtractClient({
  baseUrl: 'http://localhost:3000'
});

const result = await client.extract('./document.pdf', {
  documentType: 'invoice'
});
```

## License

MIT
