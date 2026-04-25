import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Trophy, Clock, Zap, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLeaderboard, LeaderboardEntry } from "@/src/services/dbService";

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getLeaderboard();
        setEntries(data);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Evaluation Leaderboard</h2>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Global Scan Benchmarks</p>
        </div>
      </div>

      <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50 p-4">
          <div className="grid grid-cols-12 gap-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-4">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Project Name</div>
            <div className="col-span-2 text-center">Score</div>
            <div className="col-span-2 text-center">Attempts</div>
            <div className="col-span-1 text-center">Flag</div>
            <div className="col-span-2 text-right">Last Scan</div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {entries.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground font-mono text-sm">
                No evaluation data found in telemetry.
              </div>
            ) : (
              entries.map((entry, index) => (
                <div 
                  key={entry.id} 
                  className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-primary/5 transition-colors group px-8"
                >
                  <div className="col-span-1 font-mono text-muted-foreground group-hover:text-primary transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="col-span-4">
                    <p className="font-bold tracking-tight uppercase group-hover:text-primary transition-colors">{entry.projectName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]" title={entry.verdict}>
                      {entry.verdict}
                    </p>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-2xl font-black">{entry.totalScore}</span>
                    <span className="text-[10px] text-muted-foreground font-mono ml-1">/100</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <Badge variant="outline" className="font-mono text-[10px] border-border/50">
                      {entry.attempts} TRY
                    </Badge>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {entry.type === "RAPID" ? (
                      <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20 text-[8px] font-mono p-1 px-2">RAPID</Badge>
                    ) : (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-[8px] font-mono p-1 px-2">AUDIT</Badge>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {entry.timestamp?.toDate().toLocaleDateString()}
                      </div>
                      <div className="text-[8px] font-mono text-muted-foreground/50">
                        {entry.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
