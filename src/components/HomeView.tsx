/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  Award, 
  Flame, 
  Trophy, 
  Clock, 
  Play, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  Brain,
  Star
} from "lucide-react";
import { UserProgress } from "../types";

interface HomeViewProps {
  progress: UserProgress;
  onNavigateTo: (screen: string) => void;
  onMarkTaskComplete: (taskId: string, nodeTitle: string, xpReward: number) => void;
}

export default function HomeView({ progress, onNavigateTo, onMarkTaskComplete }: HomeViewProps) {
  const activeRoadmap = progress.activeRoadmap;

  // Find next uncompleted task in active roadmap
  const getNextTask = () => {
    if (!activeRoadmap) return null;
    for (const node of activeRoadmap.nodes) {
      for (const task of node.tasks) {
        if (!progress.completedTasks.includes(task.id)) {
          return { node, task };
        }
      }
    }
    return null;
  };

  const nextTaskInfo = getNextTask();

  // Completed percentage of active roadmap
  const getRoadmapProgressPercent = () => {
    if (!activeRoadmap) return 0;
    const totalTasks = activeRoadmap.nodes.reduce((sum, node) => sum + node.tasks.length, 0);
    if (totalTasks === 0) return 0;
    const completedInRoadmap = activeRoadmap.nodes.reduce((sum, node) => {
      const completed = node.tasks.filter(t => progress.completedTasks.includes(t.id)).length;
      return sum + completed;
    }, 0);
    return Math.round((completedInRoadmap / totalTasks) * 100);
  };

  const roadmapPercent = getRoadmapProgressPercent();
  const xpPercent = Math.min(100, Math.round((progress.xp / progress.xpToNextLevel) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      id="home-view"
    >
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-xl border border-slate-800 gap-4" id="home-hero">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/30 text-indigo-300 rounded-full border border-indigo-500/20">
              {progress.isPremium ? "🌌 Premium Mentor Mode" : "🌱 Free Account"}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              {progress.streak} Day Streak
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-sans">
            Welcome back, Learner!
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            "The beautiful thing about learning is that nobody can take it away from you." Commit to your daily study and forge new boundaries.
          </p>
        </div>

        {/* Level Stats */}
        <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50" id="home-level-card">
          <div className="relative flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-full text-white font-bold text-xl shadow-lg shadow-indigo-600/30">
            {progress.level}
            <div className="absolute -inset-1 rounded-full border-2 border-indigo-400 animate-pulse opacity-40"></div>
          </div>
          <div className="space-y-1 min-w-[140px]">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Level progress</span>
              <span className="text-indigo-300 font-semibold">{progress.xp} / {progress.xpToNextLevel} XP</span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">Reach {progress.xpToNextLevel - progress.xp} more XP to leveling up</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Focus & Progress Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Todays Agenda Card (Left-Center, Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="todays-tasks">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900 font-sans">Today's Practice & Focus</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">June 18, 2026</span>
            </div>

            {nextTaskInfo ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 relative group hover:border-indigo-100 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                      Active: {activeRoadmap?.skillName} • {nextTaskInfo.node.title}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      {nextTaskInfo.task.title}
                    </h3>
                  </div>
                  <span className="shrink-0 text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
                    +{nextTaskInfo.task.type === 'coding' ? 50 : 30} XP
                  </span>
                </div>

                <p className="text-slate-600 text-sm">
                  {nextTaskInfo.task.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono mt-1 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {nextTaskInfo.task.estimatedMinutes} mins
                  </span>
                  <span className="flex items-center gap-1 capitalize">
                    <BookOpen className="w-3.5 h-3.5" />
                    Mode: {nextTaskInfo.task.type}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (nextTaskInfo.task.type === 'coding') {
                        onNavigateTo("workspace");
                      } else {
                        onMarkTaskComplete(nextTaskInfo.task.id, nextTaskInfo.node.title, 30);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition shadow-md shadow-indigo-600/10"
                    id="start-task-btn"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {nextTaskInfo.task.type === 'coding' ? "Open in Workspace" : "Read Concept & Complete"}
                  </button>
                  <button 
                    onClick={() => onNavigateTo("roadmap")}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100/50 rounded-lg transition"
                  >
                    View Roadmap
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-semibold text-slate-900 text-sm">All Current Roadmap Tasks Cleared!</h3>
                {activeRoadmap ? (
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Outstanding achievements! Practice the final project, submit your code in the Project Workspace, or create a brand new mentor path.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    You have no active learning plans configured. Visit the Roadmap screen to build a customized mentor roadmap.
                  </p>
                )}
                <button
                  onClick={() => onNavigateTo("roadmap")}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all"
                >
                  Configure Roadmap <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Practice Items */}
            <div className="space-y-3 pt-3">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider font-mono">More learning modes for today:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div 
                  onClick={() => onNavigateTo("challenge")}
                  className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl cursor-pointer hover:shadow-sm transition"
                  id="link-daily-challenge"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-amber-800 font-bold text-xs">⚡ Daily Challenge</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">+100-300 XP</span>
                  </div>
                  <p className="text-[11px] text-amber-700/80 mt-1">
                    Solve today's coding query or Multiple Choice quiz to secure your streak!
                  </p>
                </div>

                <div 
                  onClick={() => onNavigateTo("chat")}
                  className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl cursor-pointer hover:shadow-sm transition"
                  id="link-ai-tutor"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-800 font-bold text-xs">🤖 Live AI Tutor</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">AI-Powered</span>
                  </div>
                  <p className="text-[11px] text-emerald-700/80 mt-1">
                    Discuss concepts, ask technical doubts, or review quick mock interviews.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Career & Active Roadmap Overview Sidebar (Right, Span 1) */}
        <div className="space-y-6">
          
          {/* Active Roadmap Progress */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="home-roadmap-card">
            <h2 className="text-sm font-bold text-slate-900 font-sans tracking-tight">Active Roadmap</h2>
            
            {activeRoadmap ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">{activeRoadmap.skillName}</h3>
                  <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded font-mono">{activeRoadmap.level} Target</span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {activeRoadmap.description}
                </p>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Roadmap Progress</span>
                    <span className="text-slate-800 font-bold">{roadmapPercent}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${roadmapPercent}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTo("roadmap")}
                  className="w-full text-center py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 transition flex items-center justify-center gap-1"
                >
                  Browse Full Path <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <div className="w-10 h-10 bg-slate-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-700">No Target Roadmap</h3>
                <p className="text-[11px] text-slate-400 max-w-[180px] mx-auto">
                  Build any target roadmap dynamically with server-cached AI intelligence.
                </p>
                <button
                  onClick={() => onNavigateTo("roadmap")}
                  className="px-3 py-1.5 bg-indigo-600 text-white font-semibold text-xs rounded-lg hover:bg-indigo-700 transition"
                >
                  Generate Now
                </button>
              </div>
            )}
          </div>

          {/* Goals / Achievements Badge Highlights */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="home-achievements-badges">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 font-sans tracking-tight">Active Achievements</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50 text-center space-y-1">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-bold text-slate-700 block">Novice</span>
              </div>
              <div className={`flex flex-col items-center p-2 rounded-lg text-center space-y-1 ${progress.completedChallenges.length > 0 ? 'bg-amber-50/55 text-amber-900' : 'bg-slate-50 text-slate-400 opacity-60'}`}>
                <Award className={`w-5 h-5 ${progress.completedChallenges.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold block">Challenger</span>
              </div>
              <div className={`flex flex-col items-center p-2 rounded-lg text-center space-y-1 ${progress.streak >= 3 ? 'bg-orange-50 text-orange-900' : 'bg-slate-50 text-slate-400 opacity-60'}`}>
                <Flame className={`w-5 h-5 ${progress.streak >= 3 ? 'text-orange-600 fill-orange-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold block">Streak 3d</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTo("dashboard")}
              className="w-full text-center py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 transition mt-1"
            >
              Check Statistics & Leaderboards
            </button>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
