import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  Timestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface LeaderboardEntry {
  id?: string;
  projectName: string;
  totalScore: number;
  type: "RAPID" | "AUDIT";
  timestamp: Timestamp;
  attempts: number;
  verdict: string;
}

export async function saveEvaluation(data: {
  projectName: string;
  totalScore: number;
  type: "RAPID" | "AUDIT";
  verdict: string;
}) {
  const projectId = data.projectName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const projectRef = doc(db, "evaluations", projectId);

  const docSnap = await getDoc(projectRef);

  if (docSnap.exists()) {
    const existingData = docSnap.data();
    await updateDoc(projectRef, {
      totalScore: Math.max(existingData.totalScore, data.totalScore), // Keep best score
      lastScore: data.totalScore, // Store last score for info
      type: data.type,
      timestamp: serverTimestamp(),
      attempts: increment(1),
      verdict: data.verdict
    });
  } else {
    await setDoc(projectRef, {
      projectName: data.projectName,
      totalScore: data.totalScore,
      lastScore: data.totalScore,
      type: data.type,
      timestamp: serverTimestamp(),
      attempts: 1,
      verdict: data.verdict
    });
  }
}

export async function getLeaderboard(count = 20): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, "evaluations"),
    orderBy("totalScore", "desc"),
    limit(count)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as LeaderboardEntry));
}
