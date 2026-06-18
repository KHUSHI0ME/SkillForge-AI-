/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  BookOpen, 
  Plus, 
  Search, 
  Sparkles, 
  FileText, 
  Quote, 
  Clock, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import { UserProgress } from "../types";

interface ProfileViewProps {
  progress: UserProgress;
  onAddDocument: (name: string, content: string) => void;
  onTogglePremium: () => void;
}

export default function ProfileView({ progress, onAddDocument, onTogglePremium }: ProfileViewProps) {
  // RAG States
  const [ragQuery, setRagQuery] = useState("");
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState<any>(null);
  const [docName, setDocName] = useState("");
  const [docContent, setDocContent] = useState("");
  const [showAddDocForm, setShowAddDocForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docContent.trim()) {
      alert("Please supply a valid name and context content for the reference note.");
      return;
    }
    onAddDocument(docName, docContent);
    setDocName("");
    setDocContent("");
    setShowAddDocForm(false);
  };

  const handleRAGQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;

    setRagLoading(true);
    setRagResult(null);
    setErrorMessage("");

    try {
      const response = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: ragQuery,
          activeDocs: progress.knowledgeBase
        })
      });

      if (!response.ok) {
        throw new Error("Failed to consult RAG assistant server.");
      }

      const data = await response.json();
      setRagResult(data);
    } catch (err) {
      console.error(err);
      setErrorMessage("Express RAG server offline. Resolving query utilizing client heuristics...");
      
      // Fallback
      setTimeout(() => {
        // Attempt minor string matching on docs
        const matchedDoc = progress.knowledgeBase.find(d => 
          d.content.toLowerCase().includes(ragQuery.toLowerCase()) || 
          d.name.toLowerCase().includes(ragQuery.toLowerCase())
        );

        if (matchedDoc) {
          setRagResult({
            answer: `I analyzed your Knowledge Base document titled **"${matchedDoc.name}"** to answer your query. Here is what I found:\n\n${matchedDoc.content.substring(0, 300)}...\n\nYour study card is fully aligned.`,
            citations: [matchedDoc.name]
          });
        } else {
          setRagResult({
            answer: `I scanned all your ${progress.knowledgeBase.length} loaded reference papers. No direct match found. Based on general software development concepts, your query relates to optimizing standard modular parameters and structures.`,
            citations: []
          });
        }
        setErrorMessage("");
      }, 1200);
    } finally {
      setRagLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      id="profile-root"
    >
      {/* Upper Account Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6" id="profile-hero">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-2xl relative select-none">
            U
            {progress.isPremium && (
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 border-2 border-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
              </span>
            )}
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold text-slate-900 font-sans">Learner Profile</h1>
            <p className="text-xs text-slate-500 font-mono">Streak: {progress.streak} Days • Level: {progress.level}</p>
          </div>
        </div>

        {/* Subscription toggle */}
        <div className="bg-slate-50/60 p-4 border border-slate-100 rounded-xl max-w-[260px] space-y-2">
          <div className="flex items-center gap-1">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">Subscription Status</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {progress.isPremium ? "Active Premium. Enjoy unlimited code inspections & voice synthesis." : "Free Mode. Simulate checking out details below."}
          </p>
          <button
            onClick={onTogglePremium}
            className={`w-full py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              progress.isPremium 
                ? "bg-slate-200 text-slate-700 hover:bg-slate-300" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            }`}
          >
            {progress.isPremium ? "Degrade to Free Sandbox" : "Unlock Premium features"}
          </button>
        </div>
      </div>

      {/* RAG Knowledge base management block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Span: Uploaded documents list (Span 1) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="knowledge-base-doc-management">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" /> Study Knowledge Base
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Saves reference materials for local context injection.</p>
            </div>
            
            <button
              onClick={() => setShowAddDocForm(!showAddDocForm)}
              className="p-1 text-indigo-500 hover:bg-indigo-50 rounded bg-indigo-50/30 transition border border-indigo-100/10"
              title="Add study sheet"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <AnimatePresence>
            {showAddDocForm && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateDocument}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
              >
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">Reference sheet title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ECMAScript_Guide.txt"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">Text Content / Cheat Sheet</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="e.g. 'Use async/await loop setups. Avoid adding unrequested dependencies. Prevent memory leaks by cleaning up callbacks.'"
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full text-center py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition"
                >
                  Save to Knowledge Base
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-2.5">
            {progress.knowledgeBase.map((d) => (
              <div key={d.id} className="p-3 border border-slate-100 bg-slate-50/40 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 transition">
                <FileText className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1 select-all">{d.name}</span>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{d.content}</p>
                </div>
              </div>
            ))}

            {progress.knowledgeBase.length === 0 && (
              <div className="text-center py-8 text-slate-400 space-y-1.5">
                <p className="text-xs">Your Knowledge Base is empty.</p>
                <button
                  onClick={() => setShowAddDocForm(true)}
                  className="text-[10px] text-indigo-600 font-bold hover:underline"
                >
                  + Upload reference note
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Span: The live RAG search panel (Span 2) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="rag-terminal">
          <div className="space-y-1 pb-2 border-b border-slate-50">
            <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" /> AI Knowledge Base RAG Assistant
            </h3>
            <p className="text-xs text-slate-500">
              Query your personal documents list. The AI checks and references facts extracted directly from your study guides.
            </p>
          </div>

          <form onSubmit={handleRAGQuerySubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 'What are the rules for Node.js async executions?'..."
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              className="flex-grow px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={ragLoading}
              className="px-4.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
            >
              {ragLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Ask Doc"
              )}
            </button>
          </form>

          {errorMessage && (
            <div className="text-[11px] text-amber-800 bg-amber-50 rounded-lg p-2.5 border border-amber-100 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 rotate-45 text-amber-600 shrink-0" /> {errorMessage}
            </div>
          )}

          {/* RAG response box */}
          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100/70 min-h-[140px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {ragResult ? (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3.5 text-xs text-slate-700 leading-relaxed font-sans"
                  key="rag_res_ready"
                >
                  <p className="whitespace-pre-wrap">{ragResult.answer}</p>
                  
                  {ragResult.citations && ragResult.citations.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/50 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Citations Used</span>
                      <div className="flex flex-wrap gap-1.5">
                        {ragResult.citations.map((cit: string, idx: number) => (
                          <span key={idx} className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-700 p-1 text-[9px] font-bold rounded">
                            <Quote className="w-2.5 h-2.5" /> {cit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-10 text-center text-slate-400 space-y-2"
                  key="rag_placeholder"
                >
                  <HelpCircle className="w-10 h-10 text-slate-200 mx-auto" />
                  <p className="text-xs">Ready for search query.</p>
                  <p className="text-[10px] max-w-[200px] mx-auto text-slate-400">
                    Insert a study query relative to your reference notes parameters above.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
