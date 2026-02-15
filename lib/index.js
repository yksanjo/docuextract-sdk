/**
 * DocuExtract SDK
 * Official JavaScript/TypeScript SDK for DocuExtract Gateway
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

/**
 * Document types supported by DocuExtract
 * @typedef {'invoice' | 'receipt' | 'form' | 'contract' | 'id_document' | 'generic'} DocumentType
 */

/**
 * Extraction result from the API
 * @typedef {Object} ExtractionResult
 * @property {boolean} success - Whether the extraction was successful
 * @property {string} requestId - Unique request identifier
 * @property {string} documentType - Type of document processed
 * @property {Object} extraction - Extracted content
 * @property {string} extraction.text - Full extracted text
 * @property {Array} extraction.pages - Page-level extraction
 * @property {Array} extraction.tables - Extracted tables
 * @property {Object} extraction.forms - Key-value pairs extracted
 * @property {Object} routing - Routing information
 * @property {Object} cost - Cost breakdown
 * @property {Object} performance - Performance metrics
 */

/**
 * Provider information
 * @typedef {Object} Provider
 * @property {string} name - Provider name
 * @property {boolean} enabled - Whether provider is enabled
 * @property {number} pricePerPage - Price per page
 * @property {Array<string>} routingPriority - Document types this provider handles
 */

/**
 * Pricing tier information
 * @typedef {Object} PricingTier
 * @property {number} tier - Tier number
 * @property {number} maxPages - Maximum pages for this tier
 * @property {number} discount - Discount percentage
 * @property {Object} effectivePrices - Effective prices after discount
 */

class DocuExtractClient {
  /**
   * Create a new DocuExtract client
   * @param {Object} options - Client options
   * @param {string} options.baseUrl - Base URL of the DocuExtract Gateway (default: http://localhost:3000)
   * @param {string} options.apiKey - API key for authentication (optional)
   * @param {string} options.clientId - Client ID for usage tracking (optional)
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.apiKey = options.apiKey;
    this.clientId = options.clientId || 'default';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 120000, // 2 minutes for large documents
    });
    
    // Add auth header if API key provided
    if (this.apiKey) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`;
    }
  }

  /**
   * Extract text from a document file
   * @param {string|Buffer} document - File path or Buffer
   * @param {Object} options - Extraction options
   * @param {DocumentType} options.documentType - Type of document
   * @param {string} options.forceProvider - Force a specific provider
   * @returns {Promise<ExtractionResult>}
   */
  async extract(document, options = {}) {
    const form = new FormData();
    
    // Handle file path or Buffer
    if (typeof document === 'string') {
      if (!fs.existsSync(document)) {
        throw new Error(`File not found: ${document}`);
      }
      const fileName = path.basename(document);
      const ext = path.extname(fileName).toLowerCase();
      const mimeType = this.getMimeType(ext);
      form.append('document', fs.createReadStream(document), { filename: fileName, contentType: mimeType });
    } else if (Buffer.isBuffer(document)) {
      form.append('document', document, { filename: options.fileName || 'document.pdf' });
    } else {
      throw new Error('Document must be a file path or Buffer');
    }
    
    // Add optional parameters
    if (options.documentType) {
      form.append('documentType', options.documentType);
    }
    if (options.forceProvider) {
      form.append('forceProvider', options.forceProvider);
    }
    form.append('clientId', this.clientId);
    
    const response = await this.client.post('/api/extract', form, {
      headers: form.getHeaders(),
    });
    
    return response.data;
  }

  /**
   * Extract text from a document buffer
   * @param {Buffer} buffer - Document buffer
   * @param {string} fileName - Original filename
   * @param {string} mimeType - MIME type
   * @param {Object} options - Extraction options
   * @returns {Promise<ExtractionResult>}
   */
  async extractBuffer(buffer, fileName, mimeType, options = {}) {
    const form = new FormData();
    form.append('document', buffer, { filename: fileName, contentType: mimeType });
    
    if (options.documentType) {
      form.append('documentType', options.documentType);
    }
    if (options.forceProvider) {
      form.append('forceProvider', options.forceProvider);
    }
    form.append('clientId', this.clientId);
    
    const response = await this.client.post('/api/extract', form, {
      headers: form.getHeaders(),
    });
    
    return response.data;
  }

  /**
   * Get list of available providers
   * @returns {Promise<Array<Provider>>}
   */
  async getProviders() {
    const response = await this.client.get('/api/providers');
    return response.data.providers;
  }

  /**
   * Get pricing information
   * @returns {Promise<Object>}
   */
  async getPricing() {
    const response = await this.client.get('/api/pricing');
    return response.data;
  }

  /**
   * Get health status of all providers
   * @returns {Promise<Object>}
   */
  async healthCheck() {
    const response = await this.client.get('/api/health');
    return response.data;
  }

  /**
   * Get usage statistics for current client
   * @returns {Promise<Object>}
   */
  async getUsage() {
    const response = await this.client.get(`/api/usage/${this.clientId}`);
    return response.data;
  }

  /**
   * Get routing information for a document type
   * @param {DocumentType} documentType - Document type
   * @returns {Promise<Object>}
   */
  async getRouting(documentType) {
    const response = await this.client.get(`/api/routing/${documentType}`);
    return response.data;
  }

  /**
   * Set client ID for usage tracking
   * @param {string} clientId - Client identifier
   */
  setClientId(clientId) {
    this.clientId = clientId;
  }

  /**
   * Get MIME type from file extension
   * @private
   */
  getMimeType(ext) {
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.tiff': 'image/tiff',
      '.tif': 'image/tiff',
      '.bmp': 'image/bmp',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DocuExtractClient;
} else if (typeof window !== 'undefined') {
  window.DocuExtractClient = DocuExtractClient;
}

module.exports = DocuExtractClient;
