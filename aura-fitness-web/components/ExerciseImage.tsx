"use client";

import Image from "next/image";
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

  return (
    <Image
      src={src}
      alt={alt || exercise.name}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized
      className={className}
      onError={() => setSrc(fallbackSrc)}
    />
  );
}
