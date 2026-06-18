/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Home, 
  Trophy, 
  BookOpen, 
  Terminal, 
  Brain, 
  User, 
  Sparkles, 
  Flame, 
  Award,
  BookMarked
} from "lucide-react";
import { UserProgress, LearningRoadmap } from "./types";
import HomeView from "./components/HomeView";
import DashboardView from "./components/DashboardView";
import RoadmapView from "./components/RoadmapView";
import ChallengeView from "./components/ChallengeView";
import WorkspaceView from "./components/WorkspaceView";
import TutorView from "./components/TutorView";
import ProfileView from "./components/ProfileView";

// Default initial state
const INITIAL_PROGRESS: UserProgress = {
  level: 1,
  xp: 0,
  xpToNextLevel: 1000,
  streak: 3,
  lastActiveDate: new Date().toISOString().split("T")[0],
  badges: ["pioneer"],
  weakAreas: [],
  completedTasks: [],
  completedChallenges: [],
  activeRoadmap: null,
  knowledgeBase: [
    {
      id: "doc_1",
      name: "ECMAScript_Aggregates_CheatSheet.txt",
      content: "Ensure async loops do not block node runtime execution. Always clean up timeouts inside custom React side effects. Use scoped variable maps where possible to enhance continuous database limits.",
      addedAt: new Date().toISOString()
    }
  ],
  isPremium: false
};

export default function App() {
  const [screen, setScreen] = useState<string>("home");
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [alertNotification, setAlertNotification] = useState<string | null>(null);

  // Sync state from Local Storage
  useEffect(() => {
    const saved = localStorage.getItem("skillforge_user_progress");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure initial documents exist if missing
        if (!parsed.knowledgeBase) parsed.knowledgeBase = INITIAL_PROGRESS.knowledgeBase;
        setProgress(parsed);
      } catch (err) {
        console.error("Local storage sync error:", err);
      }
    }
  }, []);

  // Write state to Local Storage
  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem("skillforge_user_progress", JSON.stringify(newProgress));
  };

  const handleSetRoadmap = (roadmap: LearningRoadmap) => {
    const updated = {
      ...progress,
      activeRoadmap: roadmap,
    };
    saveProgress(updated);
    showNotification(`New active learning roadmap selected: "${roadmap.skillName}"!`);
  };

  const handleAddXP = (xpAmount: number) => {
    let currentXp = progress.xp + xpAmount;
    let currentLevel = progress.level;
    let targetXp = progress.xpToNextLevel;
    let leveledUp = false;

    while (currentXp >= targetXp) {
      currentXp -= targetXp;
      currentLevel += 1;
      targetXp = Math.round(targetXp * 1.3);
      leveledUp = true;
    }

    const updated = {
      ...progress,
      xp: currentXp,
      level: currentLevel,
      xpToNextLevel: targetXp,
    };

    saveProgress(updated);

    if (leveledUp) {
      showNotification(`🎉 Congratulations! You reached Level ${currentLevel}!`);
    } else {
      showNotification(`+${xpAmount} XP received! Keep going!`);
    }
  };

  const handleMarkTaskComplete = (taskId: string, nodeTitle: string, xpReward: number) => {
    if (progress.completedTasks.includes(taskId)) return;

    const newCompleted = [...progress.completedTasks, taskId];
    const updated = {
      ...progress,
      completedTasks: newCompleted,
    };

    setProgress(updated);
    localStorage.setItem("skillforge_user_progress", JSON.stringify(updated));

    handleAddXP(xpReward);
    showNotification(`Task cleared! Completed task under "${nodeTitle}".`);
  };

  const handleAddChallengeCompleted = (challengeId: string) => {
    if (progress.completedChallenges.includes(challengeId)) return;

    const updated = {
      ...progress,
      completedChallenges: [...progress.completedChallenges, challengeId],
    };
    saveProgress(updated);
  };

  const handleAddDocument = (name: string, content: string) => {
    const newDoc = {
      id: "doc_" + Math.random().toString(),
      name,
      content,
      addedAt: new Date().toISOString()
    };

    const updated = {
      ...progress,
      knowledgeBase: [...progress.knowledgeBase, newDoc],
    };
    saveProgress(updated);
    showNotification(`Document "${name}" added to personal Knowledge Base!`);
  };

  const handleTogglePremium = () => {
    const nextPremium = !progress.isPremium;
    const updated = {
      ...progress,
      isPremium: nextPremium,
    };
    saveProgress(updated);
    showNotification(
      nextPremium 
        ? "🌌 Premium membership simulations fully unlocked! Access superior TTS and deep inspect mechanisms."
        : "Reverted to standard free sandboxed credentials."
    );
  };

  const showNotification = (msg: string) => {
    setAlertNotification(msg);
    setTimeout(() => {
      setAlertNotification(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800" id="app-viewport">
      
      {/* Visual Level Elevation / toast indicators */}
      {alertNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white p-4.5 rounded-xl text-xs flex gap-2 font-medium shadow-2xl animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{alertNotification}</span>
        </div>
      )}

      {/* Interactive Side bar Navigation Panel */}
      <aside className="w-full md:w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-900" id="sidebar-panel">
        {/* Brand Banner Logo */}
        <div className="p-6 border-b border-indigo-950/40 flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <BookMarked className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-tight leading-none">SkillForge AI</h1>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Personal Mentor</span>
          </div>
        </div>

        {/* Level bar details */}
        <div className="px-6 py-4 border-b border-indigo-950/20 bg-indigo-950/10 flex items-center gap-3">
          <span className="w-7 h-7 bg-indigo-500 rounded-full text-white font-bold text-xs flex items-center justify-center">
            {progress.level}
          </span>
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 font-mono">
              <span>Lvl {progress.level}</span>
              <span>{progress.xp} XP</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded mt-0.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full" 
                style={{ width: `${Math.min(100, Math.round((progress.xp / progress.xpToNextLevel) * 100))}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Screen paths selectors */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {[
            { id: "home", label: "Home Tasks", icon: Home },
            { id: "dashboard", label: "Dashboard Progress", icon: Trophy },
            { id: "roadmap", label: "AI Roadmap Path", icon: BookOpen },
            { id: "challenge", label: "Daily Challenge", icon: Flame },
            { id: "workspace", label: "Project Workspace", icon: Terminal },
            { id: "chat", label: "AI Tutor Chat", icon: Brain },
            { id: "profile", label: "Knowledge & Profile", icon: User },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = screen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
                  isActive 
                    ? "bg-indigo-600 text-white font-bold" 
                    : "hover:bg-slate-900 hover:text-slate-100 text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-indigo-950/20 text-center text-[10px] text-slate-500 font-mono">
          SkillForge AI v1.0.0
        </div>
      </aside>

      {/* Main content body panel */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header navigation bar */}
        <header className="bg-white border-b border-slate-100 py-3.5 px-6 md:px-8 flex items-center justify-between" id="header-navbar">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Current view</span>
            <span className="text-xs text-slate-400 font-bold">/</span>
            <span className="text-xs font-bold text-slate-950 capitalize">{screen.replace("-", " ")}</span>
          </div>

          <div className="flex items-center gap-4">
            {progress.activeRoadmap && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/50 rounded-lg text-xs font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <span>Active: {progress.activeRoadmap.skillName}</span>
              </div>
            )}

            <div className="flex items-center gap-1 bg-amber-500/20 text-amber-700 px-3 py-1 rounded-full text-xs font-bold font-mono border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span>{progress.streak} Day Streak</span>
            </div>
          </div>
        </header>

        {/* Primary View Area layout */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto" id="main-scrollable-container">
          
          {screen === "home" && (
            <HomeView 
              progress={progress} 
              onNavigateTo={setScreen}
              onMarkTaskComplete={handleMarkTaskComplete} 
            />
          )}

          {screen === "dashboard" && (
            <DashboardView 
              progress={progress}
              onNavigateTo={setScreen}
            />
          )}

          {screen === "roadmap" && (
            <RoadmapView 
              progress={progress}
              onSetRoadmap={handleSetRoadmap}
              onMarkTaskComplete={handleMarkTaskComplete}
              onNavigateTo={setScreen}
            />
          )}

          {screen === "challenge" && (
            <ChallengeView 
              progress={progress}
              onAddXP={handleAddXP}
              onAddChallengeCompleted={handleAddChallengeCompleted}
            />
          )}

          {screen === "workspace" && (
            <WorkspaceView 
              progress={progress}
              onAddXP={handleAddXP}
              onAddCompletedTask={(tid) => handleMarkTaskComplete(tid, "Project Playground Workspace Check", 100)}
            />
          )}

          {screen === "chat" && (
            <TutorView 
              progress={progress}
            />
          )}

          {screen === "profile" && (
            <ProfileView 
              progress={progress}
              onAddDocument={handleAddDocument}
              onTogglePremium={handleTogglePremium}
            />
          )}

        </div>

      </main>

    </div>
  );
}
