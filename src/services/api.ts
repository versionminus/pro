import { ApiRequest, ApiResponse, ApiContract, FieldUniqueValue, FieldUniqueValuesResponse } from '@/types/api';

// Add constant for environment
const DEPLOYMENT_ENV = process.env.NODE_ENV === 'development' ? 'local' : 'production';
const API_BASE_URL = 'https://api.example.com';
// Force local mode for development - make sure this is true during local development
const isLocalMode = true; // Hardcoded for local development
console.log('Environment mode:', { DEPLOYMENT_ENV, isLocalMode });

// Generate a random unique ID for query results
const randomUid = () => {
  // Generate a random string of length 36 using base36 characters
  let uid = '';
  while (uid.length < 36) {
    uid += Math.random().toString(36).substring(2);
  }
  return uid.substring(0, 36);
};

// Function to load mock data from files
const mockDataCache: Record<string, any> = {};

// Define a variable to store the mapping from field names to their S3 filenames (e.g., "cell_line" → "uid-012.json")
let localUniqueValuesMapping: Record<string, string> = {};

// Function to load the mapping file
const loadUniqueValuesMapping = async (): Promise<void> => {
  try {
    // Using a relative path from the public folder as the base
    const response = await fetch('/tests/mock/api/mapping.json');
    if (response.ok) {
      localUniqueValuesMapping = await response.json();
      console.log('Loaded field name to ID mapping:', localUniqueValuesMapping);
    } else {
      console.error('Failed to load mapping.json:', response.status);
      // Exit the process if running in Node.js (for scripts/tests)
      if (typeof process !== 'undefined' && process.exit) {
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('Error loading mapping.json:', error);
    // Exit the process if running in Node.js (for scripts/tests)
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(1);
    }
  }
};

// Load the mapping when the module initializes
loadUniqueValuesMapping();

const getMockData = async (endpoint: string, requestData?: any) => {
  console.log(`Getting mock data for: ${endpoint}, field: ${requestData}`);

  // Define the base path
  const s3BasePath = '/tests/mock/s3/versionminus/pro';

  try {
    if (endpoint === 'get-readouts') {
      // Use a simple approach with the first readout file
      const path = `${s3BasePath}/readouts/1.json`;

      if (!mockDataCache[path]) {
        console.log(`Loading mock data from ${path}`);
        const response = await fetch(path);

        if (!response.ok) {
          console.error(`Failed to load mock data: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to load mock data: ${response.status}`);
        }

        mockDataCache[path] = await response.json();
      }

      return mockDataCache[path];
    }
    else if (endpoint === 'get-unique-values') {
      const fieldName = requestData;

      // Check if we have a mapping for this field
      if (!localUniqueValuesMapping[fieldName]) {
        console.warn(`No mapping found for field '${fieldName}'.`);
        // Exit the process if running in Node.js (for scripts/tests)
        if (typeof process !== 'undefined' && process.exit) {
          process.exit(1);
        }
      }

      // Use the mapped filename directly from the mapping.json file
      const mappedFilename = localUniqueValuesMapping[fieldName];
      const path = `${s3BasePath}/unique/${mappedFilename}`;

      console.log(`Attempting to load from path: ${path}`);

      if (!mockDataCache[path]) {
        console.log(`Loading mock data for field '${fieldName}' from ${path} (mapped file: ${mappedFilename})`);
        try {
          const response = await fetch(path);

          if (!response.ok) {
            console.error(`No mock file for field '${fieldName}' (file: ${mappedFilename}): ${response.status}`);
            throw new Error(`No mock file for field '${fieldName}' (file: ${mappedFilename})`);
          }

          // Get the raw response text first to check for JSON parsing issues
          const responseText = await response.text();

          // Try to parse the JSON with better error handling
          let rawData;
          try {
            rawData = JSON.parse(responseText);
          } catch (parseError) {
            console.error(`JSON parsing error for '${fieldName}' (file: ${mappedFilename}):`, parseError);
            console.error(`Invalid JSON content (first 100 chars): ${responseText.substring(0, 100)}...`);
            throw new Error(`JSON parsing error for '${fieldName}': ${parseError.message}`);
          }

          // Transform the raw data into the expected format if needed
          // S3 files might contain just an array of values without the wrapper structure
          if (Array.isArray(rawData)) {
            // The raw data is an array, transform it into the expected format
            mockDataCache[path] = {
              field: fieldName,
              values: rawData,
              total: rawData.length,
              status: "success"
            };
            console.log(`Transformed array data for field '${fieldName}':`, mockDataCache[path]);
          } else {
            // The data already has the expected format
            mockDataCache[path] = rawData;
          }
        } catch (error) {
          const msg = `Error loading mock data for field '${fieldName}'`;
          console.error(msg, error);
          // Log the path that failed for debugging
          console.error(`Failed path: ${path}`);
          // Fallback to default data
          throw new Error(`${msg}: ${error.message}`);
        }
      }

      return mockDataCache[path];
    }
  } catch (error) {
    // Enhanced error logging with more context
    console.error(`Error in getMockData for endpoint '${endpoint}' with data:`, requestData);
    console.error('Error details:', error);

    if (error instanceof SyntaxError) {
      console.error('SyntaxError detected: This is likely due to invalid JSON format in one of the mock files');
    }

    if (error instanceof TypeError) {
      console.error('TypeError detected: This might be due to incorrect property access or undefined values');
    }
  }

  return null;
};

export const apiService = {
  async getContract(): Promise<ApiContract> {
    // This would be replaced with actual API call
    return {
      fields: [
        { name: 'file_format', type: 'string', values: ['json', 'csv', 'parquet'], description: 'The format of the requested data' },
        { name: 'created', type: 'string', description: 'Filter by specific created date (YYYYMMDD)', pattern: '^\\d{8}$' },
        { name: 'created_from', type: 'string', description: 'Filter by created from date (YYYYMMDD)', pattern: '^\\d{8}$' },
        { name: 'created_to', type: 'string', description: 'Filter by created to date (YYYYMMDD)', pattern: '^\\d{8}$' },
        { name: 'cell_type', type: 'string', description: 'Filter by cell type(s)' },
        { name: 'cell_line', type: 'string', description: 'Filter by cell line(s)' },
        { name: 'primary_cultured_cell', type: 'string', description: 'Filter by primary cultured cell(s)' },
        { name: 'therapeutic_area', type: 'string', description: 'Filter by therapeutic area(s)' },
        { name: 'modality_type', type: 'string', description: 'Filter by modality type(s)' },
        { name: 'modality_effect', type: 'string', description: 'Filter by modality effect(s)' },
        { name: 'modality_concentration', type: 'string', description: 'Filter by modality concentration(s)' },
        { name: 'modality_unit_concentration', type: 'string', description: 'Filter by modality unit concentration(s)' },
        { name: 'modality_timepoint', type: 'string', description: 'Filter by modality timepoint(s)' },
        { name: 'supplier', type: 'string', description: 'Filter by supplier(s)' },
        { name: 'stimulus_type', type: 'string', description: 'Filter by stimulus type(s)' },
        { name: 'stimulus_concentration', type: 'string', description: 'Filter by stimulus concentration(s)' },
        { name: 'stimulus_unit_concentration', type: 'string', description: 'Filter by stimulus unit concentration(s)' },
        { name: 'stimulus_timepoint', type: 'string', description: 'Filter by stimulus timepoint(s)' },
        { name: 'cell_state_pre_stimulus', type: 'string', description: 'Filter by cell state pre stimulus(s)' },
        { name: 'cell_state_post_stimulus', type: 'string', description: 'Filter by cell state post stimulus(s)' },
        { name: 'parameter_entity', type: 'string', description: 'Filter by parameter entity(s)' },
        { name: 'parameter_process', type: 'string', description: 'Filter by parameter process(s)' },
        { name: 'parameter_technique', type: 'string', description: 'Filter by parameter technique(s)' },
        { name: 'parameter_type', type: 'string', description: 'Filter by parameter type(s)' },
        { name: 'measure_type', type: 'string', description: 'Filter by measure type(s)' },
        { name: 'instrument', type: 'string', description: 'Filter by instrument(s)' },
        { name: 'ensembl_id', type: 'string', description: 'Filter by ensembl id(s)' },
        { name: 'gene_symbol', type: 'string', description: 'Filter by gene symbol(s)' },
        { name: 'primary_annotation', type: 'string', description: 'Filter by primary annotation(s)' },
        { name: 'readout_value', type: 'string', description: 'Filter by readout value(s)' },
        { name: 'qualifier', type: 'string', description: 'Filter by qualifier(s)' },
        { name: 'screen', type: 'string', description: 'Filter by screen(s)' },
        { name: 'initials', type: 'string', description: 'Filter by initials(s)' },
        { name: 'signoff_initials', type: 'string', description: 'Filter by signoff initials(s)' },
        { name: 'analysis_version', type: 'string', description: 'Filter by analysis version(s)' },
        { name: 'eln_assay', type: 'string', description: 'Filter by eln assay(s)' },
        { name: 'eln_analysis', type: 'string', description: 'Filter by eln analysis(s)' },
        { name: 'ta_favourable_direction', type: 'string', description: 'Filter by ta favourable direction(s)' },
        { name: 'dose_response', type: 'string', description: 'Filter by dose response(s)' },
        { name: 'channel_name', type: 'string', description: 'Filter by channel name(s)' },
        { name: 'iidp', type: 'string', description: 'Filter by iidp(s)' },
        { name: 'analysis_hash', type: 'string', description: 'Filter by analysis hash(s)' },
        { name: 'ano_annotation', type: 'string', description: 'Filter by ano annotation(s)' },
        { name: 'aty_annotation_type', type: 'string', description: 'Filter by aty annotation type(s)' },
        { name: 'pre_cell_state', type: 'string', description: 'Filter by pre cell state(s)' },
        { name: 'post_cell_state', type: 'string', description: 'Filter by post cell state(s)' },
        { name: 'modality_supplier', type: 'string', description: 'Filter by modality supplier(s)' },
        { name: 'eln_number', type: 'string', description: 'Filter by eln number(s)' },
        { name: 'analysis_eln', type: 'string', description: 'Filter by analysis eln(s)' }
      ]
    };
  },  async search(request: ApiRequest): Promise<ApiResponse> {
    console.log('API Request:', request);

    if (isLocalMode) {
      console.log('Using mock data for search request');
      try {
        const mockResponse = await getMockData('get-readouts', request);
        if (mockResponse) {
          console.log('Mock response found:', mockResponse);

          // Transform mock response to match expected format
          return {
            data: Array.from({ length: mockResponse.record_count || 50 }, (_, i) => {
              const row: Record<string, any> = {};

              // Only include fields that are in the request (either with values or empty string)
              Object.keys(request).forEach(key => {
              if (key !== 'file_format') {
                row[key] = `${key}_value_${i}`;
              }
              });

              return row;
            }),
            total: mockResponse.record_count || 50,
            id: mockResponse.uid || randomUid()
          };
        }
      } catch (error) {
        console.error('Error getting mock readouts data:', error);
      }
    }

    // Original mock response for production or fallback
    const mockData = Array.from({ length: 50 }, (_, i) => {
      const row: Record<string, any> = {};

      // Only include fields that are in the request (either with values or empty string)
      Object.keys(request).forEach(key => {
        if (key !== 'file_format') {
          row[key] = `${key}_value_${i}`;
        }
      });

      return row;
    });

    return {
      data: mockData,
      total: mockData.length,
      id: randomUid()
    };
  },  async getFieldUniqueValues(fieldName: string): Promise<FieldUniqueValue[]> {
    console.log(`Fetching unique values for field: ${fieldName}`);

    // Check if running in local environment
    if (isLocalMode) {
      console.log('Using mock data for field:', fieldName);

      try {
        // Get mock data from our file-based mock system
        const mockResponse = await getMockData('get-unique-values', fieldName);
        if (mockResponse?.values) {
          console.log('Mock values found for', fieldName, ':', mockResponse.values);
          return mockResponse.values;
        } else if (Array.isArray(mockResponse)) {
          console.log('Mock values found as array for', fieldName, ':', mockResponse);
          return mockResponse;
        }
      } catch (error) {
        console.error(`Error getting mock data for field ${fieldName}:`, error);
      }

      // Exit the process if running in Node.js (for scripts/tests)
      if (typeof process !== 'undefined' && process.exit) {
        process.exit(1);
      }
    }

    // For non-local environments, make actual API call
    try {
      const response = await fetch(`${API_BASE_URL}/fields/${fieldName}/values`);
      const data = await response.json();
      return data.values || [];
    } catch (error) {
      console.error(`Error fetching values for ${fieldName}:`, error);
      return [];
    }
  },

  async downloadData(id: string, format: 'json' | 'csv' | 'parquet'): Promise<void> {
    console.log(`Downloading data ${id} in ${format} format`);
    // This would trigger actual download
    const link = document.createElement('a');
    link.href = `${API_BASE_URL}/download/${id}?format=${format}`;
    link.download = `data.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
