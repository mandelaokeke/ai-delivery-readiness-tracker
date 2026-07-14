export type WorkstreamStatus = "Green" | "Yellow" | "Red";
export type RiskSeverity = "Low" | "Medium" | "High";

export type Workstream = {
  id: string;
  organisation_id?: string;
  name: string;
  owner_name: string;
  milestone: string;
  risks: string;
  status: WorkstreamStatus;
  severity: RiskSeverity;
  progress: number;
  due_date?: string | null;
};

export type OrganisationContext = {
  id: string;
  name: string;
  role: string;
};

export const demoOrganisation: OrganisationContext = {
  id: "demo",
  name: "Northstar Delivery",
  role: "Owner",
};

export const demoWorkstreams: Workstream[] = [
  {
    id: "demo-migration",
    name: "Data migration",
    owner_name: "Amara Lewis",
    milestone: "Validation complete",
    risks: "Mapping exceptions need client approval",
    status: "Yellow",
    severity: "Medium",
    progress: 68,
    due_date: "2026-07-22",
  },
  {
    id: "demo-training",
    name: "Client enablement",
    owner_name: "Jordan Chen",
    milestone: "Training deck approved",
    risks: "Attendance confirmations still outstanding",
    status: "Green",
    severity: "Low",
    progress: 84,
    due_date: "2026-07-18",
  },
  {
    id: "demo-integrations",
    name: "Platform integrations",
    owner_name: "Mina Patel",
    milestone: "Production handshake",
    risks: "Security review is blocking credentials",
    status: "Red",
    severity: "High",
    progress: 42,
    due_date: "2026-07-16",
  },
  {
    id: "demo-cutover",
    name: "Launch & cutover",
    owner_name: "Leo Grant",
    milestone: "Go-live rehearsal",
    risks: "No material blocker reported",
    status: "Green",
    severity: "Low",
    progress: 76,
    due_date: "2026-07-28",
  },
];
