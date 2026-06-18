/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  MapPin, 
  CheckCircle, 
  Circle, 
  BookOpen, 
  Code, 
  Clock, 
  Sparkles, 
  HelpCircle,
  FolderLock,
  ArrowRight
} from "lucide-react";
import { LearningRoadmap, UserProgress } from "../types";

interface RoadmapViewProps {
  progress: UserProgress;
  onSetRoadmap: (roadmap: LearningRoadmap) => void;
  onMarkTaskComplete: (taskId: string, nodeTitle: string, xpReward: number) => void;
  onNavigateTo: (screen: string) => void;
}

// 4 High-fidelity predefined templates to ensure immediate interactive value
const ROADMAP_TEMPLATES: LearningRoadmap[] = [
  {
    id: "premium-react-vite",
    skillName: "Full-Stack React & Vite Engine",
    level: "Intermediate",
    description: "Master modern component architecture, state management, full-stack routing, and bundling with Vite and Tailwind CSS.",
    nodes: [
      {
        id: "r_node_1",
        title: "Vite Environment & Component Scope",
        description: "Learn package structuring, file lifecycle, JSX bindings, and the virtual DOM.",
        duration: "2 hours",
        concepts: ["ES Modules", "JSX Compilation", "Scoped Tailwind Styles"],
        skillsGained: ["Component composition", "Vite file structuring"],
        tasks: [
          { id: "r_task_1_1", title: "React Components Concept", description: "Review functional interfaces and standard modular file exports.", type: "concept", estimatedMinutes: 15 },
          { id: "r_task_1_2", title: "Build Your First Module", description: "Create a modular component displaying customizable profile statistics in your Project Workspace.", type: "coding", estimatedMinutes: 30 }
        ]
      },
      {
        id: "r_node_2",
        title: "Dynamic Hooks & State Forge",
        description: "Control reactivity and avoid memory leaks using useState and descriptive side effects.",
        duration: "4 hours",
        concepts: ["useState structure", "useEffect boundaries", "Memory Leak Prevention"],
        skillsGained: ["Interactive state management", "Hooks synchronization"],
        tasks: [
          { id: "r_task_2_1", title: "State Hook Quiz Query", description: "Learn when and why not to trigger state modifications in component bodies.", type: "concept", estimatedMinutes: 15 },
          { id: "r_task_2_2", title: "Create custom debounce hook", description: "Build a reuseable debounce state custom hook to handle search fields efficiently.", type: "coding", estimatedMinutes: 45 }
        ]
      },
      {
        id: "r_node_3",
        title: "Full-Stack Express Integration",
        description: "Expose secure API endpoints, proxy sensitive secrets, and bridge Vite middleware.",
        duration: "5 hours",
        concepts: ["Express Router", "Security Header proxies", "Server-Sent Stream Events"],
        skillsGained: ["Full-stack data flow", "Backend secret shielding"],
        tasks: [
          { id: "r_task_3_1", title: "Full-stack proxy concept check", description: "Explain why client UI must never directly load private API keys.", type: "concept", estimatedMinutes: 20 },
          { id: "r_task_3_2", title: "Set up server health checks", description: "Add a status verification router checking connection limits and memory load dynamically.", type: "coding", estimatedMinutes: 60 }
        ]
      },
      {
        id: "r_node_4",
        title: "Robust Deployment & Bundling",
        description: "Deploy Node.js code with container tooling and static edge configurations.",
        duration: "3 hours",
        concepts: ["esbuild compilation", "Production start scripts", "Static asset mapping"],
        skillsGained: ["Standalone distribution", "Continuous Integration"],
        tasks: [
          { id: "r_task_4_1", title: "Production Build Check", description: "Review and evaluate custom esbuild options in package.json.", type: "concept", estimatedMinutes: 15 },
          { id: "r_task_4_2", title: "Compile & Verify Applet", description: "Generate static production assets and run Standalone node previews locally.", type: "coding", estimatedMinutes: 45 }
        ]
      }
    ],
    finalProjectDescription: "Build a complete real-time client-to-server Task Manager that securely calls private APIs on behalf of users with comprehensive state tracking."
  },
  {
    id: "machine-learning-basics",
    skillName: "Machine Learning Foundations",
    level: "Beginner",
    description: "Understand simple supervised classifiers, statistical models, features preparation, and model evaluation parameters.",
    nodes: [
      {
        id: "ml_node_1",
        title: "Features Engineering & Vectors",
        description: "Learn how features are structured, parsed and normalized as multi-dimensional matrices.",
        duration: "3 hours",
        concepts: ["Vector spaces", "Normalization", "MinMax Scaling"],
        skillsGained: ["Data cleaning", "Feature scaling mapping"],
        tasks: [
          { id: "ml_task_1_1", title: "Continuous Features Scaling Concept", description: "Read standard normalization methodologies and understand vector distances.", type: "concept", estimatedMinutes: 15 },
          { id: "ml_task_1_2", title: "Write MinMax normalization function", description: "Implement feature vector matrix normalization in JavaScript or Python manually.", type: "coding", estimatedMinutes: 30 }
        ]
      },
      {
        id: "ml_node_2",
        title: "Supervised Classifier Algorithms",
        description: "Study decision boundary trees, weights initialization, loss optimization, and prediction confidence.",
        duration: "5 hours",
        concepts: ["Weights & biases", "Sigmoid activation", "Entropy reduction"],
        skillsGained: ["Iterative classifier programming", "Decision thresholds"],
        tasks: [
          { id: "ml_task_2_1", title: "Logistic Loss quiz queries", description: "Answer conceptual doubts on gradient step vectors.", type: "concept", estimatedMinutes: 20 },
          { id: "ml_task_2_2", title: "Code Decision Tree Node Splitter", description: "Build an algorithmic selector sorting a simple mock data list based on entropy guidelines.", type: "coding", estimatedMinutes: 60 }
        ]
      }
    ],
    finalProjectDescription: "Develop an interactive client-side spam classifier that processes input text, cleans stop-words, and calculates probability vectors dynamically."
  }
];

export default function RoadmapView({ progress, onSetRoadmap, onMarkTaskComplete, onNavigateTo }: RoadmapViewProps) {
  const [searchSkill, setSearchSkill] = useState("");
  const [searchLevel, setSearchLevel] = useState("Beginner");
  const [customDetails, setCustomDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [genSuccessInfo, setGenSuccessInfo] = useState("");

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchSkill.trim()) {
      setErrorMessage("Please input a standard or custom skill target to generate.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setGenSuccessInfo("");

    try {
      const response = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName: searchSkill,
          level: searchLevel,
          details: customDetails,
        }),
      });

      const data = await response.json();

      if (response.status === 400 && data.isConfigError) {
        // Fallback or explain clearly
        setErrorMessage(data.error);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to make call on Express backend");
      }

      onSetRoadmap(data);
      setGenSuccessInfo(`Excellent! Customized AI Learning Mentor path for "${data.skillName}" created!`);
      setSearchSkill("");
      setCustomDetails("");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        "Backend could not parse. If you're offline or missing Gemini Secrets, we recommend selecting one of our high-quality pre-seeded templates below!"
      );
    } finally {
      setLoading(false);
    }
  };

  const activeRoadmap = progress.activeRoadmap;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      id="roadmap-root"
    >
      {/* Search & Custom Generator Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="custom-roadmap-forge">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            AI Roadmap Generator
          </h2>
          <p className="text-xs text-slate-500">
            Explain what skill target you wish to learn. Our backend Gemini API will formulate custom study units, conceptual check-lists, and practical coding exercises.
          </p>
        </div>

        <form onSubmit={handleGenerateRoadmap} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 font-mono">I want to learn...</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. AWS Cloud Infrastructure, Python Data Science, SQL Queries..."
                  value={searchSkill}
                  onChange={(e) => setSearchSkill(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 font-mono font-sans">For my experience level:</label>
              <select
                value={searchLevel}
                onChange={(e) => setSearchLevel(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
              >
                <option value="Beginner">Beginner Level</option>
                <option value="Intermediate">Intermediate Level</option>
                <option value="Advanced">Advanced Level</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Forging Path...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Forge AI Roadmap
                  </>
                )}
              </button>
            </div>
            
          </div>

          <div className="space-y-1.5">
            <details className="cursor-pointer group">
              <summary className="text-xs font-bold text-indigo-600 font-mono select-none outline-none">
                + Customize focus/goals (Optional context)
              </summary>
              <div className="mt-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="e.g. 'Ensure we study PostgreSQL aggregation functions', 'Focus on building neural layers from scratch'..."
                  value={customDetails}
                  onChange={(e) => setCustomDetails(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </details>
          </div>
        </form>

        {/* Notifications & Warning Alerts */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-amber-50 text-amber-900 border border-amber-100 rounded-xl text-xs space-y-2"
            >
              <p className="font-bold flex items-center gap-1">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Roadmap Generation Failed or Key Missing
              </p>
              <p className="leading-relaxed text-amber-800/90">{errorMessage}</p>
            </motion.div>
          )}

          {genSuccessInfo && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl text-xs font-medium"
            >
              {genSuccessInfo}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Primary Roadmap Node Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Span: The Node Sequence Visual Map (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6" id="nodes-scaffold">
            <div className="flex justify-between items-center pb-3 border-b border-slate-50">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 font-sans">Visual Learning Pathway</h3>
                <p className="text-xs text-slate-500">Solve milestones sequentially. Blue circles represent current active checkpoints.</p>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-mono py-1 px-2.5 rounded-full font-bold">
                {activeRoadmap ? activeRoadmap.nodes.length : 0} Core Checkpoints
              </span>
            </div>

            {activeRoadmap ? (
              <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {activeRoadmap.nodes.map((node, nodeIdx) => {
                  // Determine node completion status based on completed tasks
                  const nodeTasks = node.tasks.map(t => t.id);
                  const completedInNode = nodeTasks.filter(tid => progress.completedTasks.includes(tid));
                  const isNodeComplete = completedInNode.length === nodeTasks.length;
                  const isNodeActive = nodeIdx === 0 || activeRoadmap.nodes[nodeIdx - 1].tasks.every(t => progress.completedTasks.includes(t.id));

                  return (
                    <motion.div 
                      key={node.id} 
                      className={`relative space-y-3 transition duration-300 ${
                        isNodeComplete ? "opacity-75" : isNodeActive ? "opacity-100" : "opacity-60"
                      }`}
                    >
                      {/* Node Bullet Point Line Connector */}
                      <span className={`absolute -left-[21px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                        isNodeComplete ? "bg-emerald-500 border-emerald-500 text-white" :
                        isNodeActive ? "bg-white border-indigo-600 text-indigo-600 shadow-sm shadow-indigo-600/20" :
                        "bg-white border-slate-200 text-slate-400"
                      }`}>
                        {isNodeComplete ? (
                          <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <span className="text-[10px] font-bold font-mono">{nodeIdx + 1}</span>
                        )}
                      </span>

                      {/* Content Card */}
                      <div className={`p-5 rounded-xl border transition-all ${
                        isNodeActive ? "bg-white border-indigo-100/80 shadow-md shadow-indigo-600/[0.02]" : "bg-slate-50/50 border-slate-100"
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-slate-900">{node.title}</h4>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                            <Clock className="w-3.5 h-3.5" /> {node.duration}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1">{node.description}</p>

                        {/* Concepts tags */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {node.concepts.map((concept, ci) => (
                            <span key={ci} className="text-[10px] font-bold font-mono text-slate-600 bg-slate-100 p-1 rounded-sm">
                              {concept}
                            </span>
                          ))}
                        </div>

                        {/* Tasks list */}
                        <div className="mt-4 pt-3 border-t border-slate-100/50 space-y-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Milestone Tasks:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {node.tasks.map((task) => {
                              const isTaskCompleted = progress.completedTasks.includes(task.id);
                              return (
                                <div 
                                  key={task.id}
                                  className={`p-3 rounded-lg border text-left transition relative flex flex-col justify-between ${
                                    isTaskCompleted 
                                      ? "bg-slate-50 border-slate-100" 
                                      : "bg-white border-slate-200 hover:border-indigo-100 hover:shadow-xs"
                                  }`}
                                >
                                  <div>
                                    <div className="flex justify-between items-start gap-1">
                                      <span className="text-[10px] uppercase text-indigo-600 font-bold font-mono flex items-center gap-0.5">
                                        {task.type === 'coding' ? <Code className="w-3" /> : <BookOpen className="w-3" />}
                                        {task.type}
                                      </span>
                                      <span className="text-[9px] text-slate-500 font-mono font-bold">{task.estimatedMinutes}m</span>
                                    </div>
                                    <h5 className="text-xs font-bold text-slate-950 mt-1 line-clamp-1">{task.title}</h5>
                                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{task.description}</p>
                                  </div>

                                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[10px] text-indigo-500 font-bold">+{task.type === 'coding' ? 50 : 30} XP</span>
                                    {isTaskCompleted ? (
                                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                        <CheckCircle className="w-3 h-3 fill-emerald-50 text-emerald-600" /> Completed
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          if (task.type === 'coding') {
                                            onNavigateTo("workspace");
                                          } else {
                                            onMarkTaskComplete(task.id, node.title, 30);
                                          }
                                        }}
                                        className="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded"
                                      >
                                        {task.type === 'coding' ? "Solve Code" : "Done"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">No Active Learning Roadmap Selected</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Type any custom tech skill above or click one of our optimized templates on the right sidebar to load a robust mentoring journey.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Seed Templates and final milestone targets (Span 1) */}
        <div className="space-y-6">
          
          {/* Preset Curriculum Options */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="preset-curriculum">
            <div>
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider font-mono">Instant Mentorships:</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Click any robust seeding plan for an immediate sandbox experience:</p>
            </div>

            <div className="space-y-3">
              {ROADMAP_TEMPLATES.map((tmpl) => (
                <div 
                  key={tmpl.id}
                  onClick={() => onSetRoadmap(tmpl)}
                  className={`p-4 rounded-xl border cursor-pointer hover:shadow-xs transition flex flex-col justify-between ${
                    activeRoadmap?.id === tmpl.id 
                      ? "bg-indigo-50/40 border-indigo-200" 
                      : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                      {tmpl.level} Mode
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{tmpl.skillName}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-700 pt-2 mt-2 border-t border-slate-100/60">
                    Load Path <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Capstone Project Target */}
          {activeRoadmap && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-950 p-6 rounded-2xl shadow-lg text-white space-y-4" id="capstone-targets">
              <div className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-md w-fit">
                <FolderLock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-bold">MILESTONE CAPSTONE</span>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-50 font-sans tracking-tight">Capstone: Final Assessment Project</h4>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  {activeRoadmap.finalProjectDescription}
                </p>
              </div>

              <div className="pt-2 border-t border-indigo-800/40">
                <button
                  onClick={() => onNavigateTo("workspace")}
                  className="w-full text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition"
                >
                  Configure Base Files in Workspace
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );
}
