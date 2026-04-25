import { useState } from "react";
import { motion } from "motion/react";
import { 
  Zap, 
  Brain, 
  FlaskConical, 
  Settings, 
  DollarSign, 
  Rocket, 
  ChevronLeft, 
  ChevronRight, 
  Award,
  Twitter,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  evaluateQuestionnaire, 
  QuestionnaireEvaluation, 
  QuestionnaireAnswer 
} from "@/src/services/geminiService";
import { saveEvaluation } from "@/src/services/dbService";

const QUESTIONNAIRE_STEPS = [
  {
    category: "Problem & Clarity",
    icon: Brain,
    questions: [
      "What exact problem are you solving in one sentence (no buzzwords)?",
      "Who specifically has this problem (not “users”, be precise)?",
      "Why does this problem actually matter right now?",
      "What happens if your solution doesn’t exist?",
      "Why hasn’t this already been solved properly?"
    ]
  },
  {
    category: "Product Depth",
    icon: FlaskConical,
    questions: [
      "What part of your product is truly new vs copied?",
      "What breaks if your system gets 1000 real users tomorrow?",
      "What part of your product is hardest to build—and did you actually build it?",
      "Show one feature that cannot be faked in a demo.",
      "What did you deliberately NOT build and why?"
    ]
  },
  {
    category: "Technical Execution",
    icon: Settings,
    questions: [
      "What is your core architecture (explain in 60 seconds)?",
      "Where does your data come from—and can you legally & reliably access it long-term?",
      "What are your system’s biggest failure points?",
      "How do you handle scaling, latency, or on-chain constraints?",
      "If we remove one dependency (API/SDK), does your product still work?"
    ]
  },
  {
    category: "Business & Incentives",
    icon: DollarSign,
    questions: [
      "Who pays for this—and why would they continue paying?",
      "What is your unfair advantage vs competitors?",
      "What stops a bigger player from copying you in 2 weeks?",
      "How does your product create real value, not just token hype?",
      "What are the first 100 users doing inside your product?"
    ]
  },
  {
    category: "Traction & Validation",
    icon: Rocket,
    questions: [
      "Do you have any real users, data, or usage—even small?",
      "What surprised you most during testing?",
      "What assumption did you prove wrong?",
      "If forced to launch tomorrow, what would break first?",
      "Why will this still exist in 6 months?"
    ]
  }
];

export function SubmissionWizard() {
  const [step, setStep] = useState(-1);
  const [projectInfo, setProjectInfo] = useState({
    title: "",
    description: "",
    personnels: "",
    xLink: ""
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isJudging, setIsJudging] = useState(false);
  const [hypePenalty, setHypePenalty] = useState(false);
  const [insightBonus, setInsightBonus] = useState(false);
  const [wizardResult, setWizardResult] = useState<QuestionnaireEvaluation | null>(null);

  const handleWizardSubmit = async () => {
    setIsJudging(true);
    setWizardResult(null);
    try {
      const formattedAnswers: QuestionnaireAnswer[] = [];
      QUESTIONNAIRE_STEPS.forEach(step => {
        step.questions.forEach(q => {
          formattedAnswers.push({
            category: step.category,
            question: q,
            answer: answers[q] || "N/A"
          });
        });
      });
      const res = await evaluateQuestionnaire(formattedAnswers);
      setWizardResult(res);

      // Save to Firestore
      const finalScore = res.totalRawScore + (insightBonus ? 10 : 0) - (hypePenalty ? 10 : 0);
      await saveEvaluation({
        projectName: projectInfo.title,
        totalScore: Math.min(Math.max(finalScore * 2, 0), 100), // Scale 50 to 100
        type: "AUDIT",
        verdict: res.executiveSummary
      });
    } catch (error) {
      console.error("Wizard evaluation failed:", error);
    } finally {
      setIsJudging(false);
    }
  };

  const finalWizardScore = wizardResult ? 
    (wizardResult.totalRawScore + (insightBonus ? 10 : 0) - (hypePenalty ? 10 : 0)) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      {!wizardResult ? (
        <Card className="border-border/50 bg-card/50 overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <div className="flex justify-between items-center mb-2">
              <Badge variant="outline" className="font-mono text-[10px] tracking-widest text-primary border-primary/50">
                STEP {step === -1 ? 1 : step + 2} OF {QUESTIONNAIRE_STEPS.length + 1}
              </Badge>
              <Progress value={((step + 2) / (QUESTIONNAIRE_STEPS.length + 1)) * 100} className="w-32 h-1" />
            </div>
            {step === -1 ? (
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Project Submission Details
                </CardTitle>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = QUESTIONNAIRE_STEPS[step].icon;
                  return Icon && <Icon className="w-6 h-6 text-primary" />;
                })()}
                <CardTitle className="text-2xl font-bold tracking-tight">
                  {QUESTIONNAIRE_STEPS[step].category}
                </CardTitle>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {step === -1 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Project Title</label>
                  <Input 
                    placeholder="Enter project name..."
                    className="bg-background/50 border-border/50 font-mono"
                    value={projectInfo.title}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Project Executive Summary</label>
                  <Textarea 
                    placeholder="Provide a concise overview of the submission..."
                    className="bg-background/50 border-border/50 font-mono min-h-[100px]"
                    value={projectInfo.description}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Participating Personnel</label>
                  <Input 
                    placeholder="Team members and roles..."
                    className="bg-background/50 border-border/50 font-mono"
                    value={projectInfo.personnels}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, personnels: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Twitter className="w-3" /> Link to X
                  </label>
                  <Input 
                    placeholder="https://x.com/project..."
                    className="bg-background/50 border-border/50 font-mono"
                    value={projectInfo.xLink}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, xLink: e.target.value }))}
                  />
                </div>
              </div>
            ) : (
              QUESTIONNAIRE_STEPS[step].questions.map((q, i) => (
                <div key={i} className="space-y-3">
                  <label className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                    <span className="text-primary">#0{i + 1}</span> {q}
                  </label>
                  <Textarea 
                    placeholder="Enter detailed response..."
                    className="bg-background/50 border-border/50 font-mono text-sm min-h-[80px] focus-visible:ring-primary/50"
                    value={answers[q] || ""}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q]: e.target.value }))}
                  />
                </div>
              ))
            )}

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => setStep(s => Math.max(-1, s - 1))}
                disabled={step === -1}
                className="rounded-none font-mono text-xs uppercase"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </Button>

              {step < QUESTIONNAIRE_STEPS.length - 1 ? (
                <Button 
                  onClick={() => setStep(s => s + 1)}
                  className="bg-primary text-primary-foreground rounded-none font-mono text-xs uppercase px-8"
                  disabled={step === -1 && (!projectInfo.title || !projectInfo.description)}
                >
                  Next Section <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <div className="flex gap-4 items-center">
                  <div className="flex gap-4 mr-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={hypePenalty} 
                        onChange={(e) => setHypePenalty(e.target.checked)}
                        className="accent-destructive"
                      />
                      <span className="text-[10px] font-mono uppercase tracking-tighter text-muted-foreground group-hover:text-destructive transition-colors">Risk Assessment Penalty (-10)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={insightBonus} 
                        onChange={(e) => setInsightBonus(e.target.checked)}
                        className="accent-primary"
                      />
                      <span className="text-[10px] font-mono uppercase tracking-tighter text-muted-foreground group-hover:text-primary transition-colors">Strategic Insight Bonus (+10)</span>
                    </label>
                  </div>
                  <Button 
                    onClick={handleWizardSubmit}
                    disabled={isJudging}
                    className="bg-primary text-primary-foreground rounded-none font-mono text-xs uppercase px-12 h-14"
                  >
                    {isJudging ? <Zap className="w-4 h-4 animate-spin" /> : "Finalize Evaluation"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-primary/40 bg-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Award className="w-40 h-40" />
              </div>
              <CardContent className="p-10 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-primary font-mono text-xs uppercase tracking-[0.2em] mb-2">Technical Assessment Score</p>
                    <div className="flex items-center gap-4">
                      <h2 className="text-5xl font-black">{finalWizardScore} <span className="text-xl font-normal text-muted-foreground">/ 50</span></h2>
                      {insightBonus && <Badge className="bg-primary text-black">Strategic</Badge>}
                      {hypePenalty && <Badge className="bg-destructive text-white">Risk Adj.</Badge>}
                    </div>
                  </div>
                  <Award className="w-16 h-16 text-primary opacity-50" />
                </div>
                <Separator className="bg-primary/20 mb-6" />
                <p className="text-xl font-bold italic leading-relaxed">
                  "{wizardResult.executiveSummary}"
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/80 p-6 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Metric Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono">Base Consensus</span>
                  <span className="font-mono text-primary">{wizardResult.totalRawScore}/50</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono">Incentives</span>
                  <span className="font-mono text-primary">+{insightBonus ? 10 : 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono">Risk Adjustments</span>
                  <span className="font-mono text-destructive">-{hypePenalty ? 10 : 0}</span>
                </div>
              </div>
              <Button 
                variant="link" 
                onClick={() => {
                  setWizardResult(null);
                  setStep(-1);
                }}
                className="text-primary p-0 h-auto font-mono text-[10px] uppercase hover:no-underline"
              >
                ← New Submission
              </Button>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase tracking-widest">Inquiry Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {wizardResult.scores.map((s, i) => (
                    <AccordionItem key={i} value={`q-${i}`} className="border-border/30">
                      <AccordionTrigger className="text-left py-3 hover:no-underline">
                        <div className="flex justify-between w-full pr-4 text-xs">
                          <span className="truncate max-w-[200px] font-mono">{s.question}</span>
                          <Badge className={s.score === 2 ? "bg-primary text-black" : s.score === 1 ? "bg-secondary" : "bg-destructive text-white"}>
                            {s.score}/2
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-xs font-mono text-muted-foreground pl-2 border-l border-primary/20">
                        {s.feedback}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-primary px-2">Sector Analysis</h3>
              {wizardResult.categoryDeepDive.map((cat, i) => (
                <Card key={i} className="border-border bg-card/30 hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-tight">{cat.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                      {cat.summary}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
