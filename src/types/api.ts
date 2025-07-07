export interface ApiField {
  name: string;
  type: string;
  values?: string[];
  description?: string;
  pattern?: string;
}

export interface ApiContract {
  fields: ApiField[];
}

export interface FilterValue {
  field: string;
  values: string[];
}

export interface FieldUniqueValue {
  value: string;
  count: number;
}

export interface FieldUniqueValuesResponse {
  field: string;
  values: FieldUniqueValue[];
  total: number;
  status: 'success' | 'error';
  message?: string;
}

export interface ApiRequest {
  file_format?: 'json' | 'csv' | 'parquet';
  created?: string;
  created_from?: string;
  created_to?: string;
  cell_type?: string;
  cell_line?: string;
  primary_cultured_cell?: string;
  therapeutic_area?: string;
  modality_type?: string;
  modality_effect?: string;
  modality_concentration?: string;
  modality_unit_concentration?: string;
  modality_timepoint?: string;
  supplier?: string;
  stimulus_type?: string;
  stimulus_concentration?: string;
  stimulus_unit_concentration?: string;
  stimulus_timepoint?: string;
  cell_state_pre_stimulus?: string;
  cell_state_post_stimulus?: string;
  parameter_entity?: string;
  parameter_process?: string;
  parameter_technique?: string;
  parameter_type?: string;
  measure_type?: string;
  instrument?: string;
  ensembl_id?: string;
  gene_symbol?: string;
  primary_annotation?: string;
  readout_value?: string;
  qualifier?: string;
  screen?: string;
  initials?: string;
  signoff_initials?: string;
  analysis_version?: string;
  eln_assay?: string;
  eln_analysis?: string;
  ta_favourable_direction?: string;
  dose_response?: string;
  channel_name?: string;
  iidp?: string;
  analysis_hash?: string;
  ano_annotation?: string;
  aty_annotation_type?: string;
  pre_cell_state?: string;
  post_cell_state?: string;
  modality_supplier?: string;
  eln_number?: string;
  analysis_eln?: string;
}

export interface ApiResponse {
  data: Record<string, any>[];
  total: number;
  id: string;
}
