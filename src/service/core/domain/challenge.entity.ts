// export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type MysteryStatus = "finished" | "available"; // can change!

export interface Mystery {
  id: string;
  title: string;
  description: string;
  // difficulty: DifficultyLevel;
  // category: string;
  xpReward: number;
  estimatedTime: string; // will change! (time in seconds)
  // status: MysteryStatus; // can change!
  completionRate: number; // will change! (process on backend)
  // icon: string;
  // tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MysteryDetail extends Mystery {
  storyIntro: string;
  storyContext: string;
  // objectives: string[];
  hints: Hint[]; // will change!
  database: DatabaseSchema;
  expectedOutput: QueryResult;
  // testCases: TestCase[];
}

export interface Hint {
  id: string;
  order: number;
  content: string;
  // xpPenalty: number;
}

export interface DatabaseSchema { // adapt on management of database schemas
  tables: Table[];
  relationships: Relationship[];
}

export interface Table {
  name: string;
  description: string;
  columns: Column[];
  sampleData: Record<string, unknown>[];
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
  description: string;
}

export interface Relationship {
  fromTable: string;
  toTable: string;
  type: "one-to-one" | "one-to-many" | "many-to-many";
  fromColumn: string;
  toColumn: string;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
}

// export interface TestCase {
//   id: string;
//   description: string;
//   expectedResult: QueryResult;
//   weight: number; // percentage of total score
// }

export interface UserMysteryProgress {
  mysteryId: string;
  userId: string;
  // status: MysteryStatus;
  attempts: number;
  hintsUsed: number;
  currentQuery: string;
  startedAt?: string;
  completedAt?: string;
  timeSpent: number; // in seconds
  score?: number;
}