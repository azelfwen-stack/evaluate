import { Level1, Level2, Level3, EvaluationRecord, TrendData, ClassCompareData, TargetType } from '../types';

// 一级指标：共 3 个
export const mockLevel1: Level1[] = [
  { id: 'l1-1', name: '思想品德', baseScore: 100 },
  { id: 'l1-2', name: '学业水平', baseScore: 100 },
  { id: 'l1-3', name: '身心健康', baseScore: 100 },
];

// 二级指标：每个一级 1～2 个
export const mockLevel2: Level2[] = [
  // 思想品德 → 2 个二级
  { id: 'l2-1-1', name: '遵纪守法', parentId: 'l1-1', baseScore: 50 },
  { id: 'l2-1-2', name: '品德修养', parentId: 'l1-1', baseScore: 50 },

  // 学业水平 → 2 个二级
  { id: 'l2-2-1', name: '课堂表现', parentId: 'l1-2', baseScore: 50 },
  { id: 'l2-2-2', name: '学业成绩', parentId: 'l1-2', baseScore: 50 },

  // 身心健康 → 1 个二级
  { id: 'l2-3-1', name: '体育锻炼', parentId: 'l1-3', baseScore: 100 },
];

// 三级指标生成函数
const generateL3 = (
  id: string,
  name: string,
  parentId: string,
  level1Id: string,
  targetType: TargetType,
  totalCount: number,
  avgScore: number,
  minScore: number,
  maxScore: number
): Level3 => {
  let normalizedScore: number | null = null;
  if (totalCount > 0) {
    if (maxScore === minScore) {
      normalizedScore = 100;
    } else {
      normalizedScore = ((avgScore - minScore) / (maxScore - minScore)) * 100;
    }
  }

  return {
    id,
    name,
    parentId,
    level1Id,
    level2Id: parentId,
    evaluationType: '日常评价',
    targetType,
    description: `关于${name}的详细评价指标，用于衡量${targetType === 'student' ? '学生' : targetType === 'class' ? '班级' : '宿舍'}的表现。`,
    totalCount,
    maxScore,
    minScore,
    avgScore,
    normalizedScore,
    sourceType: '系统采集',
    latestEvaluationTime: '2026-03-24 10:00:00',
  };
};

// 三级指标：每个二级 3～4 个
export const mockLevel3: Level3[] = [
  // ==============================================
  // 思想品德 l1-1
  // ==============================================
  // 遵纪守法 l2-1-1 → 4 个
  generateL3('l3-1-1-1', '按时出勤', 'l2-1-1', 'l1-1', 'student', 150, 95, 60, 100),
  generateL3('l3-1-1-2', '无违纪记录', 'l2-1-1', 'l1-1', 'student', 200, 98, 80, 100),
  generateL3('l3-1-1-3', '行为规范', 'l2-1-1', 'l1-1', 'student', 180, 92, 70, 100),
  generateL3('l3-1-1-4', '班级公约遵守', 'l2-1-1', 'l1-1', 'class', 45, 85, 50, 100),

  // 品德修养 l2-1-2 → 3 个
  generateL3('l3-1-2-1', '尊敬师长', 'l2-1-2', 'l1-1', 'student', 160, 94, 65, 100),
  generateL3('l3-1-2-2', '团结同学', 'l2-1-2', 'l1-1', 'student', 170, 90, 60, 100),
  generateL3('l3-1-2-3', '诚实守信', 'l2-1-2', 'l1-1', 'student', 190, 96, 75, 100),

  // ==============================================
  // 学业水平 l1-2
  // ==============================================
  // 课堂表现 l2-2-1 → 4 个
  generateL3('l3-2-1-1', '课堂互动', 'l2-2-1', 'l1-2', 'student', 300, 82, 30, 100),
  generateL3('l3-2-1-2', '专注度', 'l2-2-1', 'l1-2', 'student', 250, 78, 20, 100),
  generateL3('l3-2-1-3', '小组合作', 'l2-2-1', 'l1-2', 'student', 180, 88, 50, 100),
  generateL3('l3-2-1-4', '课堂纪律', 'l2-2-1', 'l1-2', 'class', 60, 92, 70, 100),

  // 学业成绩 l2-2-2 → 3 个
  generateL3('l3-2-2-1', '学科平均分', 'l2-2-2', 'l1-2', 'class', 50, 78, 40, 95),
  generateL3('l3-2-2-2', '进步幅度', 'l2-2-2', 'l1-2', 'student', 260, 75, 30, 90),
  generateL3('l3-2-2-3', '竞赛参与', 'l2-2-2', 'l1-2', 'student', 80, 88, 50, 100),

  // ==============================================
  // 身心健康 l1-3
  // ==============================================
  // 体育锻炼 l2-3-1 → 3 个
  generateL3('l3-3-1-1', '早操出勤', 'l2-3-1', 'l1-3', 'student', 0, 0, 0, 0),
  generateL3('l3-3-1-2', '体测成绩', 'l2-3-1', 'l1-3', 'student', 120, 70, 40, 95),
  generateL3('l3-3-1-3', '课外运动', 'l2-3-1', 'l1-3', 'student', 50, 90, 60, 100),
];

// ====================== 以下逻辑完全不变，直接复用 ======================

export const mockRecords: EvaluationRecord[] = [];
mockLevel3.forEach(l3 => {
  if (l3.totalCount > 0) {
    for (let i = 0; i < Math.min(l3.totalCount, 15); i++) {
      mockRecords.push({
        id: `rec-${l3.id}-${i}`,
        indicatorId: l3.id,
        targetName: l3.targetType === 'student' ? `学生${i + 1}` : l3.targetType === 'class' ? `高一(${i % 5 + 1})班` : `宿舍${100 + i}`,
        targetType: l3.targetType,
        className: `高一(${i % 5 + 1})班`,
        score: Math.floor(Math.random() * (l3.maxScore - l3.minScore + 1)) + l3.minScore,
        source: ['教师评价', '系统采集', '学生互评'][Math.floor(Math.random() * 3)],
        evaluator: `教师${Math.floor(Math.random() * 10)}`,
        evaluateTime: `2026-03-${Math.floor(Math.random() * 20 + 1).toString().padStart(2, '0')} 10:00:00`,
        remark: '表现良好',
      });
    }
  }
});

export const mockTrends: Record<string, TrendData> = {};
mockLevel3.forEach(l3 => {
  mockTrends[l3.id] = {
    indicatorId: l3.id,
    weekTrend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 40) + 60),
    monthTrend: Array.from({ length: 30 }, () => Math.floor(Math.random() * 40) + 60),
  };
});

export const mockClassCompare: Record<string, ClassCompareData> = {};
mockLevel3.forEach(l3 => {
  mockClassCompare[l3.id] = {
    indicatorId: l3.id,
    classCompare: Array.from({ length: 5 }, (_, i) => {
      const minScore = Math.floor(Math.random() * 20) + 40;
      const maxScore = Math.floor(Math.random() * 20) + 80;
      return {
        className: `高一(${i + 1})班`,
        avgScore: Math.floor(Math.random() * (maxScore - minScore)) + minScore,
        totalCount: Math.floor(Math.random() * 50) + 10,
        normalizedScore: Math.floor(Math.random() * 40) + 60,
        maxScore,
        minScore,
      };
    }),
  };
});