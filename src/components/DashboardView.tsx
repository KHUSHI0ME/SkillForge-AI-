/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { 
  Trophy, 
  Award, 
  Flame, 
  TrendingUp, 
  Briefcase, 
  BookOpen, 
  ShieldAlert, 
  Target, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react";
import { UserProgress, LeaderboardUser } from "../types";

interface DashboardViewProps {
  progress: UserProgress;
  onNavigateTo: (screen: string) => void;
}

export default function DashboardView({ progress, onNavigateTo }: DashboardViewProps) {
  
  // Dynamic mock leaderboard populated with active learners
  const leaderboard: LeaderboardUser[] = useMemo(() => {
    const list: LeaderboardUser[] = [
      { rank: 1, name: "Yash Sharma", xp: 4850, streak: 12 },
      { rank: 2, name: "Liam O'Connor", xp: 4100, streak: 8 },
      { rank: 3, name: "Nisha Rao", xp: 3500, streak: 15 },
      { rank: 4, name: "You (Learner)", xp: 1200 + progress.xp + (progress.level - 1) * 1000, streak: progress.streak, isCurrentUser: true },
      { rank: 5, name: "Alexander K.", xp: 2150, streak: 4 },
      { rank: 6, name: "Sofia Chen", xp: 1980, streak: 5 },
      { rank: 7, name: "Raj Patel", xp: 1450, streak: 3 },
    ];
    // Sort list by XP decreasingly and update ranks accordingly
    return list.sort((a, b) => b.xp - a.xp).map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [progress.xp, progress.level, progress.streak]);

  // Weak areas - dynamically recommended based on the active roadmap and quiz count
  const recommendedInterventions = useMemo(() => {
    if (progress.weakAreas.length > 0) {
      return progress.weakAreas;
    }
    // Default helpful ones if none detected yet
    if (progress.activeRoadmap) {
      return [
        `Asynchronous Execution in ${progress.activeRoadmap.skillName}`,
        `Complex Syntax & Edge Cases`,
        "Theoretical quiz speed & accuracy"
      ];
    }
    return [
      "Coding Problem Structuring",
      "Dynamic state management & variables",
      "Unit testing & logical boundary parameters"
    ];
  }, [progress.weakAreas, progress.activeRoadmap]);

  // Chart data: simple custom SVG coordinate plotting for weekly learning hours
  // Let's draw an elegant bar graph or area chart inside SVG for full responsiveness and speed!
  const mockStudyLog = [
    { day: "Mon", hours: 1.5, completed: 1 },
    { day: "Tue", hours: 2.2, completed: 2 },
    { day: "Wed", hours: 0.8, completed: 0 },
    { day: "Thu", hours: 3.5, completed: 3 },
    { day: "Fri", hours: 1.2, completed: 1 },
    { day: "Sat", hours: 4.0, completed: 4 },
    { day: "Sun", hours: 2.0, completed: 2 },
  ];

  const maxHours = Math.max(...mockStudyLog.map(d => d.hours));

  // Count badges
  const badgeDetails = [
    { id: "pioneer", name: "Roadmap Pioneer", desc: "Generated your first dynamically personalized AI learning plan", icon: Target, unlocked: progress.activeRoadmap !== null, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    { id: "streak3", name: "Trident Streaker", desc: "Maintained a dedicated 3+ day learning streak", icon: Flame, unlocked: progress.streak >= 3, color: "bg-orange-100 text-orange-700 border-orange-200" },
    { id: "challenger", name: "Challenge Master", desc: "Successfully resolved at least 1 daily coding or quiz query", icon: Trophy, unlocked: progress.completedChallenges.length > 0, color: "bg-amber-100 text-amber-700 border-amber-200" },
    { id: "workspace", name: "Modular Artisan", desc: "Reviewed or compiled modular code files through active AI check", icon: Briefcase, unlocked: progress.completedTasks.length > 0, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { id: "multiverse", name: "Lore Keeper", desc: "Uploaded document materials to the AI Knowledge Base", icon: BookOpen, unlocked: progress.knowledgeBase.length > 0, color: "bg-purple-100 text-purple-700 border-purple-200" },
    { id: "premium", name: "Ascendant Mind", desc: "Unlocked comprehensive premium mentor guidance", icon: Sparkles, unlocked: progress.isPremium, color: "bg-pink-100 text-pink-700 border-pink-200" },
  ];

  const unlockedCount = badgeDetails.filter(b => b.unlocked).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      id="dashboard-root"
    >
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Level</span>
            <span className="text-2xl font-bold text-slate-900">Lvl {progress.level}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Earned Badges</span>
            <span className="text-2xl font-bold text-slate-900">{unlockedCount} / 6</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg shrink-0">
            <Flame className="w-6 h-6 fill-orange-50" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Active Streak</span>
            <span className="text-2xl font-bold text-slate-900">{progress.streak} Days</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Cleared Activities</span>
            <span className="text-2xl font-bold text-slate-900">{progress.completedTasks.length + progress.completedChallenges.length} Tasks</span>
          </div>
        </div>

      </div>

      {/* Charts & Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Weekly Progress Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="study-analytics">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 font-sans">Weekly Mindscape Hours</h2>
              <p className="text-xs text-slate-500">Tracks hours logged per day completing quizzes & code review.</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold font-mono">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs last week
            </div>
          </div>

          {/* SVG Custom Rendered Bar Chart */}
          <div className="relative h-48 w-full pt-4 font-mono">
            {/* Axis marks */}
            <div className="absolute left-0 bottom-8 h-32 flex flex-col justify-between text-[10px] text-slate-400">
              <span>{Math.ceil(maxHours)}h</span>
              <span>{Math.ceil(maxHours / 2)}h</span>
              <span>0h</span>
            </div>

            {/* Bars container */}
            <div className="ml-8 mr-2 h-32 flex justify-between items-end pb-1 border-b border-slate-100">
              {mockStudyLog.map((log, i) => {
                const heightPercent = maxHours > 0 ? (log.hours / maxHours) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative max-w-[40px]">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-[10px] py-1 px-2 rounded tracking-normal text-center select-none pointer-events-none z-10 whitespace-nowrap">
                      Hours: {log.hours}h <br /> Completed: {log.completed}
                    </div>
                    {/* Bar */}
                    <div 
                      className={`w-4 rounded-t-md transition-all duration-500 ${
                        log.hours > 2.5 
                          ? "bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:to-indigo-300" 
                          : "bg-gradient-to-t from-slate-400 to-slate-300 group-hover:to-indigo-400"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>
                );
              })}
            </div>

            {/* Labels under axis */}
            <div className="ml-8 mr-2 flex justify-between text-[10px] font-semibold text-slate-500 pt-2">
              {mockStudyLog.map((log, i) => (
                <span key={i} className="w-10 text-center">{log.day}</span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl flex items-start gap-3 border border-slate-100/50">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-800">Insight: Saturday Peak</span>
              <p className="text-[11px] text-slate-500">
                You log 60% of your practical code revisions on weekends. Try scheduling a brief 15-minute concept review on Wednesday to maintain optimal retention.
              </p>
            </div>
          </div>
        </div>

        {/* Global Leaderboard Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="leaderboard">
          <div className="space-y-1 pb-2 border-b border-slate-50">
            <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">Vanguard Leaderboard</h2>
            <p className="text-xs text-slate-500">Global weekly XP rankings.</p>
          </div>

          <div className="space-y-2.5">
            {leaderboard.map((user) => (
              <div 
                key={user.rank}
                className={`flex justify-between items-center p-2.5 rounded-xl transition ${
                  user.isCurrentUser 
                    ? "bg-indigo-50/60 border border-indigo-100 shadow-sm" 
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank visual indicator */}
                  <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold font-mono rounded-full ${
                    user.rank === 1 ? "bg-amber-100 text-amber-800" :
                    user.rank === 2 ? "bg-slate-200 text-slate-800" :
                    user.rank === 3 ? "bg-orange-100 text-orange-800" : "bg-slate-50 text-slate-500"
                  }`}>
                    {user.rank}
                  </span>
                  <div>
                    <span className={`text-xs font-medium block ${user.isCurrentUser ? "text-indigo-950 font-bold" : "text-slate-800"}`}>
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Streak: {user.streak}d</span>
                  </div>
                </div>
                
                <span className={`text-xs font-bold font-mono ${user.isCurrentUser ? "text-indigo-600" : "text-slate-700"}`}>
                  {user.xp.toLocaleString()} XP
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Weak Areas Intervention & Badges Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Weak Areas intervention */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="weak-areas">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-50">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 font-sans">Priority Intervention Areas</h3>
          </div>

          <p className="text-xs text-slate-500">
            Areas requiring minor reinforcement based on quiz checks & workspace query diagnostics.
          </p>

          <div className="space-y-3 pt-1">
            {recommendedInterventions.map((area, i) => (
              <div key={i} className="flex gap-2.5 p-3 rounded-lg bg-indigo-50/30 border border-slate-100 text-xs">
                <span className="font-bold text-indigo-700">0{i+1}</span>
                <p className="text-slate-700 font-medium select-none">{area}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTo("challenge")}
            className="w-full text-center py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-all mt-1"
          >
            Review Flashcards & Quizzes
          </button>
        </div>

        {/* Badges container (Spans remaining columns) */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="user-badges">
          <div className="space-y-1 pb-2 border-b border-slate-50">
            <h3 className="text-sm font-bold text-slate-900 font-sans">Achievement Milestone Forge</h3>
            <p className="text-xs text-slate-500">Milestones unlocked based on dynamic mentoring activities completed.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badgeDetails.map((b) => {
              const IconComp = b.icon;
              return (
                <div 
                  key={b.id} 
                  className={`p-4 rounded-xl border flex items-start gap-3 transition ${
                    b.unlocked 
                      ? "bg-white border-slate-100 shadow-sm" 
                      : "bg-slate-50/40 border-slate-100 opacity-50 grayscale"
                  }`}
                >
                  <div className={`p-2.5 rounded-lg shrink-0 border ${b.unlocked ? b.color : 'bg-slate-200 text-slate-400 border-slate-300'}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      {b.name}
                      {b.unlocked && <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded">Earned</span>}
                    </span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
