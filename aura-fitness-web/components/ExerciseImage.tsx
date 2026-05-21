"use client";

import { useEffect, useState } from "react";
import type { Exercise } from "@/lib/types";
import { getExerciseFallbackImageSrc, getExerciseImageSrc } from "@/lib/exerciseImage";

interface ExerciseImageProps {
  exercise: Exercise;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ExerciseImage({
  exercise,
  alt,
  className,
  sizes = "100vw",
  priority = false,
}: ExerciseImageProps) {
  const fallbackSrc = getExerciseFallbackImageSrc(exercise);
  const [src, setSrc] = useState(() => getExerciseImageSrc(exercise));

  useEffect(() => {
    setSrc(getExerciseImageSrc(exercise));
  }, [exercise]);

  const handleError = () => {
    setSrc((currentSrc) => (currentSrc === fallbackSrc ? currentSrc : fallbackSrc));
  };

  return (
    <img
      src={src}
      alt={alt || exercise.name}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      className={`absolute inset-0 h-full w-full ${className || ""}`.trim()}
      onError={handleError}
    />
  );
}
