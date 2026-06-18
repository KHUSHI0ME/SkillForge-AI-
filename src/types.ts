/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  type: 'concept' | 'quiz' | 'coding';
  estimatedMinutes: number;
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "3 hours"
  concepts: string[];
  tasks: RoadmapTask[];
  skillsGained: string[];
}

export interface LearningRoadmap {
  id: string;
  skillName: string;
  level: string; // e.g. "Beginner", "Intermediate", "Advanced"
  description: string;
  nodes: RoadmapNode[];
  finalProjectDescription: string;
}

export interface Challenge {
  id: string;
  title: string;
  type: 'quiz' | 'coding';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  codeTemplate?: string;
  correctAnswer?: string; // For quizzes
  options?: string[]; // For quiz options
  xpReward: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isVoice?: boolean;
}

export interface UserProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  lastActiveDate: string | null;
  badges: string[];
  weakAreas: string[];
  completedTasks: string[]; // roadmapTaskIds
  completedChallenges: string[]; // challengeIds
  activeRoadmap: LearningRoadmap | null;
  knowledgeBase: Array<{ id: string; name: string; content: string; addedAt: string }>;
  isPremium: boolean;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  streak: number;
  isCurrentUser?: boolean;
}
