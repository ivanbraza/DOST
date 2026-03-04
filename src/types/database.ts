/**
 * Database type definitions for Supabase tables
 * Based on the new schema for document management, e-signatures, and approval workflows
 */

// ============================================
// USER & PROFILE TYPES
// ============================================

export interface Profile {
  id: string // UUID references auth.users
  fullname: string | null
  suffix: string | null
  prefix: string | null
  user_position: string | null
  department: string | null
  updated_at: string | null
}

export interface Department {
  id: number
  name: string
  manager_id: string | null // UUID references auth.users
}

export interface Position {
  id: number
  user_id: string // UUID references auth.users
  title: string
  is_management: boolean
}

export interface UserSupervisor {
  id: number
  user_id: string // UUID
  supervisor_id: string // UUID
  supervisor_type: string | null
  is_primary: boolean
  created_at: string | null
}

// ============================================
// PROJECT TYPES
// ============================================

export interface Project {
  id: number
  user_id: string // UUID references auth.users
  program_title: string | null
  project_title: string | null
  project_leader: string | null
  project_duration: string | null
  program_startDate: string | null // DATE
  program_endDate: string | null // DATE
  sex: string | null
  address: string | null
  telephone: string | null
  email: string | null
  monitoring_agency: string | null
  cooperating_agencies: string | null
  implementing_agency: string | null
  base_station: string | null
  other_imple_sites: string | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

export interface ProjectAgency {
  id: number
  project_id: number
  agency_name: string
}

export interface Template {
  id: number
  template_name: string | null
  project_id: number
}

export interface ProjectTeam {
  id: number
  project_id: number
  user_id: string // UUID
  team_role: string | null
  can_be_signer: boolean
  added_by: string | null // UUID
  added_at: string | null
}

// ============================================
// PROPOSAL TYPES
// ============================================

export interface Proposal {
  id: number
  user_id: string // UUID
  sdg: string | null
  hnrda: string | null
  dost_pillars: string | null
  executive_summary: string | null
  introduction: string | null
  rationale_significance: string | null
  general_objective: string | null
  methodology: string | null
  potential_outcomes: string | null
  target_beneficiaries: string | null
  sustainability_plan: string | null
  gad_score: number | null
  project_management: string | null
  source_of_funds: number | null
  created_at: string | null
}

export interface ExpectedOutput {
  id: number
  proposal_id: number | null
  output_type: string | null
  output_description: string | null
  Q1_value: string | null
  Q2_value: string | null
  Q3_value: string | null
  Q4_value: string | null
}

export interface SocialEcoImpact {
  id: number
  proposal_id: number | null
  impact_type: string | null
  impact_description: string | null
  Q1_value: string | null
  Q2_value: string | null
  Q3_value: string | null
  Q4_value: string | null
}

export interface LiteratureCited {
  id: number
  proposal_id: number | null
  citation_text: string | null
}

export interface DocumentSignatory {
  id: number
  user_id: string // UUID
  proposal_id: number | null
  signatory_role: string | null
  display_order: string | null
  order_index: string | null
  status: string | null
  signed_at: string | null // DATE
}

// ============================================
// ROLES & PERMISSIONS TYPES
// ============================================

export interface Role {
  id: number
  title: string
  description: string | null
  level: number | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

export interface RolePage {
  id: number
  role_id: number
  page_name: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
  can_approve: boolean
}

export interface UserRole {
  id: number
  user_id: string // UUID
  role_id: number
  department_id: number | null
  is_active: boolean
  assigned_by: string | null // UUID
  assigned_at: string | null
}

// ============================================
// WORKFLOW TYPES
// ============================================

export interface StatusCode {
  id: number
  status_name: string
  status_category: string | null
  color_code: string | null
  is_active: boolean
  created_at: string | null
}

export interface DocumentType {
  id: number
  type_name: string
  table_name: string | null
  requires_approval: boolean
  created_at: string | null
}

export interface DocumentSignatoryTemplate {
  id: number
  document_type_id: number | null
  step_order: number
  signatory_label: string
  is_required: boolean
  created_at: string | null
}

export interface DocumentSignatoryAssignment {
  id: number
  document_type_id: number | null
  document_id: number
  step_order: number
  signatory_label: string
  signatory_id: string // UUID
  assigned_by: string | null // UUID
  assigned_at: string | null
}

export interface DocumentWorkflow {
  id: number
  document_type_id: number | null
  document_id: number
  current_step: number
  current_status_id: number | null
  completion_percentage: number
  submitted_at: string | null
  completed_at: string | null
  last_activity: string | null
  created_at: string | null
}

export interface DocumentApproval {
  id: number
  workflow_id: number | null
  step_order: number
  signatory_label: string
  signatory_id: string | null // UUID
  decision: 'approved' | 'rejected' | 'pending' | 'revision_needed' | null
  comments: string | null
  // E-SIGNATURE FIELDS
  e_signature: string | null // Base64 image
  signature_ip: string | null
  signature_user_agent: string | null
  signature_date: string | null
  certificate_id: string | null
  // Tracking
  assigned_at: string | null
  actioned_at: string | null
  is_current: boolean
  created_at: string | null
  // Rejection routing
  rejected_step: number | null
  return_to_step: number
}

export interface ESignature {
  id: number
  approval_id: number | null
  user_id: string // UUID
  document_type_id: number | null
  document_id: number | null
  signature_image: string
  signature_hash: string | null
  certificate_info: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  signed_at: string | null
  consent_text: string | null
  consent_version: string | null
}

// ============================================
// DRAFT & HISTORY TYPES
// ============================================

export interface DocumentDraft {
  id: number
  user_id: string // UUID
  document_type_id: number | null
  document_id: number | null
  form_data: Record<string, any>
  current_section: string | null
  completion_percentage: number
  last_activity: string | null
  expires_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface DocumentHistory {
  id: number
  workflow_id: number | null
  user_id: string | null // UUID
  action: string
  action_details: Record<string, any> | null
  previous_status_id: number | null
  new_status_id: number | null
  ip_address: string | null
  user_agent: string | null
  created_at: string | null
}

export interface Notification {
  id: number
  user_id: string // UUID
  document_type_id: number | null
  document_id: number | null
  workflow_id: number | null
  approval_id: number | null
  notification_type: string
  title: string | null
  message: string | null
  triggered_by: string | null // UUID
  is_read: boolean
  created_at: string | null
  read_at: string | null
}

// ============================================
// BUDGET TYPES
// ============================================

export interface BudgetCategory {
  id: number
  proposal_id: number | null
  category_name: string | null
}

export interface BudgetLineItem {
  id: number
  category_id: number | null
  item_name: string | null
  is_procurement_related: boolean | null
  created_at: string | null
}

export interface BudgetRevision {
  id: number
  item_id: number | null
  revision_number: number | null
  amount: string | null
  justification: string | null
  created_at: string | null
}

export interface FundSource {
  id: number
  fund_source_name: string | null
  agency_type: string | null
}

export interface BudgetItemAllocation {
  id: number
  item_id: number | null
  fund_source_id: number | null
  amount: string | null
  created_at: string | null
}

export interface PpmpItem {
  id: number
  item_id: number | null
  code: string | null
  general_description: string | null
  unit: string | null
  quantity: number | null
  unit_cost: number | null
  estimated_budget: number | null
  mode_of_procurement: string | null
  created_at: string | null
}

export interface PpmpSchedule {
  id: number
  ppmp_items_id: number | null
  year: string | null // DATE
  month_number: number | null
  planned_quantity: number | null
  created_at: string | null
}

export interface FinancialReport {
  id: number
  item_id: number | null
  transaction_type: string | null
  year: string | null // DATE
  quarter_number: number | null
  amount: number | null
  created_at: string | null
}

export interface MonthlyCashProgram {
  id: number
  item_id: number | null
  year: string | null // DATE
  month_number: number | null
  amount: number | null
  created_at: string | null
}

export interface RodDisbursement {
  id: number
  item_id: number | null
  transaction_date: string | null // DATE
  ada_number: string | null
  payee: string | null
  particulars: string | null
  amount: number | null
  created_at: string | null
}

// ============================================
// OBJECTIVE & ACTIVITY TYPES
// ============================================

export interface Objective {
  id: number
  proposal_id: number | null
  objectives_text: string | null
  objective_percentage: string | null
}

export interface Activity {
  id: number
  objective_id: number | null
  activity_text: string | null
  activity_percentage: string | null
}

export interface RiskAssumption {
  id: number
  objective_id: number | null
  risk_description: string | null
}

export interface ActionPlan {
  id: number
  objective_id: number | null
  action_description: string | null
}

export interface Accomplishment {
  id: number
  activity_id: number | null
  accomp_description: string | null
  Q1_value: string | null
  Q2_value: string | null
  Q3_value: string | null
  Q4_value: string | null
  created_at: string | null
}

export interface ObjectiveActual {
  id: number
  activity_id: number | null
  quarter_number: number | null
  actual_value: string | null
  created_at: string | null
}

export interface PerExplanation {
  id: number
  actual_id: number | null
  catch_up_plan: string | null
  problem_concerns: string | null
  suggested_solutions: string | null
  created_at: string | null
}

// ============================================
// NARRATIVE REPORT TYPES
// ============================================

export interface NarrativeReport {
  id: number
  project_id: number
  year: string | null // DATE
  quarter_number: number | null
  updated_at: string | null
  user_id: string // UUID
  created_by: string // UUID
  updated_by: string | null // UUID
}

export interface NarrativeOutputAccomp {
  id: number
  report_id: number | null
  output_id: number | null
  accomplishment_text: string | null
  updated_at: string | null
  user_id: string // UUID
  created_by: string // UUID
  updated_by: string | null // UUID
}

export interface NarrativeObjEntry {
  id: number
  report_id: number | null
  objective_id: number | null
  milestone_text: string | null
  updated_at: string | null
  user_id: string // UUID
  created_by: string // UUID
  updated_by: string | null // UUID
}

export interface NarrativeIssue {
  id: number
  report_id: number | null
  output_id: number | null
  problem_text: string | null
  solutions_text: string | null
  updated_at: string | null
  user_id: string // UUID
  created_by: string // UUID
  updated_by: string | null // UUID
}

// ============================================
// USER APPROVAL TYPES (Extended)
// ============================================

export interface PendingUser {
  id: string
  email: string | null
  created_at: string | null
  user_metadata: {
    full_name?: string
    prefix?: string
    suffix?: string
    department?: string
    position?: string
    role?: number
    approved?: boolean
  }
  email_confirmed_at: string | null
}

export type ApprovalAction = 'approve' | 'reject'

// ============================================
// VIEW TYPES
// ============================================

export interface DocumentStatusView {
  workflow_id: number
  document_type: string
  document_id: number
  project_title: string | null
  current_status: string
  status_color: string | null
  current_step: number
  completion_percentage: number
  submitted_at: string | null
  completed_at: string | null
  owner_name: string | null
}

export interface SignatoryQueueView {
  approval_id: number
  signatory_id: string
  document_type: string
  document_id: number
  project_title: string | null
  step_order: number
  signatory_label: string
  assigned_at: string
  days_pending: number
  document_owner: string | null
}

export interface DocumentSignatoriesView {
  document_type_id: number
  document_type: string
  document_id: number
  step_order: number
  signatory_label: string
  signatory_name: string | null
  signatory_position: string | null
  decision: string | null
  signed_at: string | null
  status_text: string
}
