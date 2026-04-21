export interface Level1 {
  id: string;
  name: string;
  baseScore?: number;
}

export interface Level2 {
  id: string;
  name: string;
  parentId: string;
  baseScore?: number;
}

export type TargetType = 'student' | 'class' | 'dormitory';

export interface Level3 {
  id: string;
  name: string;
  parentId: string;
  level1Id: string;
  level2Id: string;
  evaluationType: string;
  targetType: TargetType;
  description: string;
  totalCount: number;
  maxScore: number;
  minScore: number;
  avgScore: number;
  normalizedScore: number | null;
  sourceType: string;
  latestEvaluationTime: string;
}

export interface EvaluationRecord {
  id: string;
  indicatorId: string;
  targetName: string;
  targetType: TargetType;
  className: string;
  score: number;
  source: string;
  evaluator: string;
  evaluateTime: string;
  remark: string;
}

export interface TrendData {
  indicatorId: string;
  weekTrend: number[];
  monthTrend: number[];
}

export interface ClassCompareData {
  indicatorId: string;
  classCompare: {
    className: string;
    avgScore: number;
    totalCount: number;
    normalizedScore: number;
    maxScore: number;
    minScore: number;
  }[];
}

export interface FilterState {
  semester: string;
  month: string;
  week: string;
  dateRange: [string, string] | null;
  targetTypes: TargetType[];
  level1Id: string;
  level2Id: string;
  classes: string[];
  dataSources: string[];
}

export type DisplayMode = 'normalizedScore' | 'evaluationCount' | 'targetType';

export interface GraphControlState {
  displayMode: DisplayMode;
  onlyWithData: boolean;
  hideLowFreq: boolean;
  hideEmptyCategory: boolean;
  expanded: boolean;
  autoFocusAnomaly: boolean;
  searchText: string;
}
