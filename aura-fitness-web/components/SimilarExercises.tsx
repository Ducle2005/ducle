"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { ExerciseCard } from "@/components/ExerciseCard";
import { exerciseApi, Exercise } from "@/lib/exerciseApi";

interface SimilarExercisesProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
}

export function SimilarExercises({ exercise, onSelect }: SimilarExercisesProps) {
  const [similarExercises, setSimilarExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSimilarExercises = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await exerciseApi.getExercises({
        size: 6,
        muscle: exercise.muscleGroup,
      });

      const similar = (response.content || [])
        .filter((item) => item.id !== exercise.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      setSimilarExercises(similar);
    } catch (error) {
      console.error("Failed to load similar exercises:", error);
    } finally {
      setIsLoading(false);
    }
  }, [exercise.id, exercise.muscleGroup]);

  useEffect(() => {
    void loadSimilarExercises();
  }, [loadSimilarExercises]);

  if (isLoading || similarExercises.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Lightbulb size={17} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.22em] text-orange-50">
            Bài tập thay thế
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">Cùng nhóm cơ, phù hợp để đổi biến thể.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {similarExercises.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * index }}
          >
            <ExerciseCard exercise={item} onSelect={onSelect} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
