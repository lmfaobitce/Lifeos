export type Hub =
  | "dashboard"
  | "fitness"
  | "ovier"
  | "goals"
  | "university"
  | "journal"
  | "notes"
  | "learning"
  | "analytics";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  hub: Hub;
}

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface OvierBatch {
  name: string;
  totalPieces: number;
  skus: OvierSKU[];
}

export interface OvierSKU {
  sku: string;
  colour: string;
  construction: "pique" | "flat-knit";
  fit: "SF" | "RF";
  size: string;
  price: number;
}

export interface FitnessStats {
  currentWeight?: number;
  weeklyWorkouts: number;
  avgCalories?: number;
  avgProtein?: number;
  avgSleep?: number;
  recoveryScore?: number;
}

export interface DashboardSummary {
  fitness: FitnessStats;
  activeGoals: number;
  upcomingDeadlines: number;
  ovierProgress: {
    phase: string;
    completedTasks: number;
    totalTasks: number;
  };
}
