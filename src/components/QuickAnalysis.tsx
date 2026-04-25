import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  AlertTriangle, 
  Zap, 
  Target, 
  Code, 
  Layers, 
  Smartphone, 
  CheckCircle2, 
  TrendingUp, 
  MessageSquare, 
  PlayCircle, 
  Sparkles,
  ArrowRight,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { judgeProject, JudgingResult } from "@/src/services/geminiService";
import { saveEvaluation } from "@/src/services/dbService";

const CRITERIA_ICONS: Record<string, any> = {
  "Originality / Novelty": Zap,
  "Problem-Solution Fit": Target,
  "Technical Depth": Code,
  "On-chain Innovation": Layers,
  "User Experience (UX)": Smartphone,
  "Execution Quality": CheckCircle2,
  "Market Potential": TrendingUp,
  "Clarity of Pitch": MessageSquare,
  "Demo Impact": PlayCircle,
  "Hackathon Spirit": Sparkles,
};

export function QuickAnalysis() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [isJudging, setIsJudging] = useState(false);
  const [result, setResult] = useState<JudgingResult | null>(null);

  const handleJudge = async () => {
    if (!description.trim() || !projectName.trim()) return;
    setIsJudging(true);
    setResult(null);
    try {
      const res = await judgeProject(description);
      setResult(res);
      // Save to Firestore
      await saveEvaluation({
        projectName: projectName,
        totalScore: res.totalScore,
        type: "RAPID",
        verdict: res.verdict
      });
    } catch (error) {
      console.error("Judging failed:", error);
    } finally {
      setIsJudging(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-12"
    >
      <div className="space-y-6">
        <div className="max-w-md">
          <label className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] mb-2 block">Identity Tag / Project Name</label>
          <input 
            type="text"
            placeholder="PROJECT_ID_01..."
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full bg-card/50 border border-primary/20 rounded-none p-3 font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors uppercase"
          />
        </div>

        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="relative">
              <Textarea
                placeholder="Paste project description, pitch deck content, or GitHub URL..."
                className="min-h-[200px] bg-transparent border-none focus-visible:ring-0 text-lg font-mono resize-none p-0 placeholder:text-muted-foreground/50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="absolute bottom-0 right-0 p-2 flex gap-2">
                <Button 
                  onClick={handleJudge} 
                  disabled={isJudging || !description.trim() || !projectName.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 py-6 text-lg rounded-none skew-x-[-12deg]"
                >
                <span className="skew-x-[12deg] flex items-center gap-2">
                  {isJudging ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                      JUDGING...
                    </>
                  ) : (
                    <>
                      EXECUTE ANALYSIS
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="quick-results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 border-primary/30 bg-primary/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Trophy className="w-32 h-32" />
                </div>
                <CardContent className="p-8 flex flex-col justify-center h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-6xl">{result.verdictEmoji}</span>
                    <div>
                      <h2 className="text-4xl font-bold tracking-tight">{result.verdict}</h2>
                      <p className="text-primary font-mono text-sm uppercase tracking-widest">Final Verdict</p>
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-8xl font-black leading-none">{result.totalScore}</span>
                    <span className="text-2xl font-mono text-muted-foreground mb-2">/ 100</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    CRITICAL ANALYSIS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-sm leading-relaxed italic">
                    "{result.criticalAnalysis}"
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-xl font-mono uppercase tracking-wider">Metric Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {result.scores.map((s, i) => {
                    const Icon = CRITERIA_ICONS[s.name] || Zap;
                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{s.name}</span>
                          </div>
                          <span className="font-mono text-primary">{s.score}/10</span>
                        </div>
                        <Progress value={s.score * 10} className="h-1 bg-muted" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    STRATEGIC RECOMMENDATIONS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {result.upgradeSuggestions.map((s, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <p className="text-sm text-muted-foreground leading-relaxed">{s}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  );
}
