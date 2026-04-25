import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert,
  Search,
  Wand2,
  List,
  Linkedin,
  Twitter
} from "lucide-react";
import { QuickAnalysis } from "@/src/components/QuickAnalysis";
import { SubmissionWizard } from "@/src/components/SubmissionWizard";
import { Leaderboard } from "@/src/components/Leaderboard";
import { Button } from "@/components/ui/button";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"quick" | "wizard" | "leaderboard">("quick");

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              <span className="font-black tracking-tighter text-xl uppercase">PROBE</span>
            </div>
            
            <div className="flex gap-1 p-1 bg-muted/30 border border-border/50 rounded-lg">
              <Button
                variant={currentPage === "quick" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage("quick")}
                className={`rounded-md font-mono text-[10px] uppercase tracking-widest px-4 ${currentPage === "quick" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                <Search className="w-3" /> Quick Analysis
              </Button>
              <Button
                variant={currentPage === "wizard" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage("wizard")}
                className={`rounded-md font-mono text-[10px] uppercase tracking-widest px-4 ${currentPage === "wizard" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                <Wand2 className="w-3" /> Submission Dossier
              </Button>
              <Button
                variant={currentPage === "leaderboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage("leaderboard")}
                className={`rounded-md font-mono text-[10px] uppercase tracking-widest px-4 ${currentPage === "leaderboard" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                <List className="w-3" /> Top Scans
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <a 
                href="https://linkedin.com/in/shreedharcva" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://x.com/botcody2023" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </nav>

        {/* Header */}
        <header className="mt-16 mb-12 text-center pt-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-4"
          >
            <ShieldAlert className="w-3 h-3" />
            PROTOCOL STATUS: ACTIVE / {currentPage === "quick" ? "RAPID ASSESSMENT" : currentPage === "wizard" ? "DETAILED AUDIT" : "LEADERBOARD ACTIVE"}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <h1 className="text-8xl md:text-10xl font-black tracking-tighter uppercase leading-none">
              PROBE
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-primary text-xl font-mono uppercase tracking-[0.3em] font-bold mb-4"
          >
            Peer Review & Objective Benchmarking Engine
          </motion.p>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-sm max-w-2xl mx-auto font-mono"
          >
            {currentPage === "quick" 
              ? "Rapid scanning protocol for technical alignment and strategic viability."
              : "Institutional-grade dossier generation through multi-vector architectural inquiry."}
          </motion.p>
        </header>

        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: currentPage === "quick" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: currentPage === "quick" ? 20 : -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentPage === "quick" ? (
                <QuickAnalysis />
              ) : currentPage === "wizard" ? (
                <SubmissionWizard />
              ) : (
                <Leaderboard />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer Info */}
        <footer className="mt-24 pt-8 border-t border-border/50 text-center">
          <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-[0.3em]">
            Institutional Evaluation Subsystem v2.4.1 // Secure Transmission Active
          </p>
        </footer>
      </div>
    </div>
  );
}
