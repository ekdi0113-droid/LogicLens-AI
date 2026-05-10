import { useState, useEffect } from 'react';
import { 
  Search, 
  Send, 
  AlertCircle, 
  MessageSquare, 
  RefreshCw,
  Copy,
  Check,
  Zap,
  Shield,
  Activity,
  Triangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from './lib/utils';
import { analyzeLogic } from './services/geminiService';
import { AnalysisResult } from './types';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Simulated progress loader
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAnalyzing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 98) return prev;
          const increment = Math.random() * 15;
          return Math.min(prev + increment, 98);
        });
      }, 600);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      const resp = await analyzeLogic(inputText);
      setResult(resp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.speech_script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-slate-200 selection:bg-brand-cyan/30">
      <header className="sticky top-0 z-50 bg-brand-bg/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-cyan rounded flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Search className="w-5 h-5 text-slate-900" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">LogicLens <span className="text-brand-cyan">AI</span></h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 border border-slate-800 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400">CORE_V3_ONLINE</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent" />
              
              {/* Disclaimer */}
              <div className="mb-4 p-3 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-normal">
                  LogicLens AI는 논리적 사고를 돕는 <span className="text-brand-cyan">조력자</span>입니다. 
                  제공되는 분석은 참고용이며, 최종적인 판단은 작성자 본인에게 있습니다.
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-cyan/70" />
                  <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">분석 텍스트 입력</h2>
                </div>
                <span className="text-[9px] font-mono text-slate-600">{inputText.length} 자</span>
              </div>
              <textarea
                className="w-full h-[380px] p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 text-slate-300 focus:ring-1 focus:ring-brand-cyan/30 focus:border-brand-cyan/30 transition-all outline-none resize-none text-sm leading-relaxed text-center"
                placeholder="분석할 글을 여기에 입력하거나 붙여넣으세요..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputText.trim()}
                className={cn(
                  "w-full mt-4 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group relative overflow-hidden",
                  isAnalyzing || !inputText.trim() 
                    ? "bg-slate-800/50 text-slate-500 cursor-not-allowed" 
                    : "bg-brand-cyan text-slate-950 shadow-[0_4px_20px_rgba(6,182,212,0.2)] hover:shadow-[0_4px_30px_rgba(6,182,212,0.4)] active:scale-[0.98]"
                )}
              >
                {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isAnalyzing ? "분석 중..." : "글 분석 시작하기"}
              </button>
              {error && (
                <div className="mt-4 p-3 bg-red-950/20 border border-red-900/30 rounded-lg flex items-center gap-2 text-[11px] text-red-400">
                  <AlertCircle className="w-3 h-3" /> {error}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-900/10 rounded-2xl border border-slate-800/50 border-dashed">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 border-2 border-brand-cyan/10 rounded-full border-t-brand-cyan animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-black text-brand-cyan">{Math.floor(progress)}%</span>
                    </div>
                  </div>
                  <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <motion.div 
                      className="h-full bg-brand-cyan shadow-[0_0_10px_#06b6d4]"
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "easeOut", duration: 0.5 }}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">Processing Rhetorical Nodes...</p>
                </motion.div>
              ) : result ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 bg-slate-900/30 border border-slate-800/50 rounded-2xl p-5">
                      <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">AI 멘토링 요약</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
                    </div>
                    <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-5 flex flex-col items-center justify-center">
                      <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">설득력 점수</h3>
                      <div className="text-4xl font-black text-white">{result.score}<span className="text-[10px] text-slate-600 ml-1">/100</span></div>
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-brand-cyan" style={{ width: `${result.score}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-7 bg-slate-950/40 border border-slate-800/50 rounded-2xl p-6 relative overflow-hidden">
                      <h3 className="text-[9px] font-bold text-brand-cyan/50 uppercase tracking-[0.3em] mb-8 text-center">논리 전개 구조 (Sequence)</h3>
                      <div className="space-y-0 flex flex-col items-center">
                        {result.logic_map.map((item, idx) => (
                          <div key={idx} className="w-full flex flex-col items-center">
                            <div className={cn("w-full p-4 border rounded-xl relative bg-slate-900/40 transition-colors", item.isLogical ? "border-brand-cyan/20" : "border-brand-amber/30")}>
                              <span className={cn("absolute -top-2.5 left-4 px-2 py-0.5 bg-slate-950 text-[8px] font-black border uppercase tracking-tighter", item.isLogical ? "text-brand-cyan border-brand-cyan/40" : "text-brand-amber border-brand-amber/40")}>
                                {item.stage}
                              </span>
                              <p className="text-xs font-bold text-slate-200 mb-1">{item.content}</p>
                              <p className="text-[10px] text-slate-500 italic">{item.connectionAnalysis}</p>
                            </div>
                            {idx < result.logic_map.length - 1 && <div className="h-4 w-[1px] bg-slate-800" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-5 space-y-4 flex flex-col">
                      <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-5 flex flex-col">
                        <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">수사학적 삼각형 (Triangle)</h3>
                        <div className="w-full aspect-square relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={[
                              { subject: 'Logos', A: result.balance.logos },
                              { subject: 'Pathos', A: result.balance.pathos },
                              { subject: 'Ethos', A: result.balance.ethos },
                            ]}>
                              <PolarGrid stroke="#1e293b" />
                              <PolarAngleAxis 
                                dataKey="subject" 
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                              />
                              <PolarRadiusAxis 
                                domain={[0, 100]} 
                                tick={false} 
                                axisLine={false} 
                              />
                              <Radar
                                name="Balance"
                                dataKey="A"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                fill="#06b6d4"
                                fillOpacity={0.4}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2 pb-4 border-b border-slate-800/50">
                          {[
                            { label: '논리 (Logos)', val: result.balance.logos, color: 'text-brand-cyan' },
                            { label: '감성 (Pathos)', val: result.balance.pathos, color: 'text-brand-rose' },
                            { label: '신뢰 (Ethos)', val: result.balance.ethos, color: 'text-brand-amber' }
                          ].map(stat => (
                            <div key={stat.label} className="text-center">
                              <p className="text-[8px] font-bold text-slate-600 uppercase whitespace-nowrap">{stat.label}</p>
                              <p className={cn("text-xs font-black", stat.color)}>{stat.val}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 space-y-4">
                          <div className="flex gap-3">
                            <div className="w-1 h-1 rounded-full bg-brand-cyan mt-1.5 shrink-0" />
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block">Logos: 논리적 이성</span>
                              <p className="text-[9px] text-slate-500 leading-tight">타당한 근거와 데이터를 통한 설득의 힘</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-1 h-1 rounded-full bg-brand-rose mt-1.5 shrink-0" />
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block">Pathos: 감성적 공감</span>
                              <p className="text-[9px] text-slate-500 leading-tight">청중의 마음을 움직이는 심리적 유대감</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-1 h-1 rounded-full bg-brand-amber mt-1.5 shrink-0" />
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block">Ethos: 화자의 신뢰</span>
                              <p className="text-[9px] text-slate-500 leading-tight">화자의 인격과 전문성이 주는 메시지의 무게</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-5 flex-1">
                        <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-4">논리적 개선 제안</h3>
                        <div className="space-y-3">
                          {result.suggestions.slice(0, 3).map((s, i) => (
                            <div key={i} className="flex gap-2 text-[11px] text-slate-400 leading-relaxed pb-2 border-b border-slate-800/50 last:border-0"><Shield className="w-3 h-3 text-brand-cyan shrink-0 mt-0.5" />{s}</div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-5 border-l-brand-amber/30">
                        <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-4">맞춤법 및 문법 교정</h3>
                        <div className="space-y-2">
                          {result.grammar_fixes && result.grammar_fixes.length > 0 ? (
                            result.grammar_fixes.map((fix, i) => (
                              <div key={i} className="text-[10px] text-brand-amber/80 font-mono leading-tight flex gap-2">
                                <span className="shrink-0">•</span> {fix}
                              </div>
                            ))
                          ) : (
                            <div className="text-[10px] text-slate-600 italic">감지된 문법적 오류가 없습니다.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="px-5 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
                      <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-brand-cyan" /><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">교정 대본</h3></div>
                      <button onClick={handleCopy} className={cn("text-[10px] font-bold uppercase transition-all px-3 py-1 rounded", copied ? "text-green-500 bg-green-500/10" : "text-brand-cyan hover:bg-brand-cyan/10")}>
                        {copied ? "복사됨" : "대본 복사하기"}
                      </button>
                    </div>
                    <div className="p-8 max-h-[600px] overflow-y-auto custom-scrollbar bg-slate-950/20">
                      <div className="markdown-body text-sm text-slate-400 italic leading-loose font-serif">
                        <ReactMarkdown>{result.speech_script}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[500px] flex items-center justify-center border border-slate-800 border-dashed rounded-3xl relative p-12">
                  <div className="text-center">
                    <div className="inline-flex p-5 bg-slate-900/50 rounded-2xl border border-slate-800 mb-6 shadow-2xl"><Search className="w-10 h-10 text-brand-cyan/20" /></div>
                    <h2 className="text-xl font-black text-slate-200 mb-2">Analyzer Standby</h2>
                    <p className="text-xs text-slate-500 font-mono tracking-tight uppercase">Enter text to perform heuristic logical analysis</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #06b6d4; }
      `}</style>
    </div>
  );
}
