"use client";

import { motion } from "framer-motion";

function Bone({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 page-enter"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Bone className="h-8 w-48" />
          <Bone className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-4">
          <Bone className="h-10 w-32 rounded-2xl" />
          <Bone className="h-10 w-64 rounded-xl" />
          <Bone className="h-10 w-10 rounded-xl" />
          <Bone className="h-11 w-11 rounded-xl" />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <Bone className="min-h-[320px] lg:col-span-4 rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 lg:col-span-8 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Bone key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <Bone className="min-h-[300px] lg:col-span-7 rounded-2xl" />
        <Bone className="min-h-[300px] lg:col-span-5 rounded-2xl" />
      </div>
    </motion.div>
  );
}

export function WorkoutSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 page-enter"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Bone className="h-8 w-56" />
          <Bone className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-4">
          <Bone className="h-10 w-36 rounded-xl" />
          <Bone className="h-10 w-52 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Bone key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Bone key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4 lg:col-span-4">
          <Bone className="h-56 rounded-2xl" />
          <Bone className="h-40 rounded-2xl" />
          <Bone className="h-40 rounded-2xl" />
        </div>
      </div>
    </motion.div>
  );
}

export function NutritionSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 page-enter"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Bone className="h-8 w-48" />
          <Bone className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-4">
          <Bone className="h-10 w-36 rounded-xl" />
          <Bone className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <Bone className="min-h-[400px] lg:col-span-4 rounded-2xl" />
        <div className="space-y-4 lg:col-span-8">
          {[1, 2, 3, 4].map((i) => (
            <Bone key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function ProgressSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 page-enter"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Bone className="h-8 w-52" />
          <Bone className="h-4 w-80" />
        </div>
        <Bone className="h-10 w-40 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-8">
          <Bone className="h-[480px] rounded-2xl" />
          <div className="grid grid-cols-2 gap-8">
            <Bone className="h-40 rounded-2xl" />
            <Bone className="h-40 rounded-2xl" />
          </div>
        </div>
        <div className="space-y-8 lg:col-span-4">
          <Bone className="h-64 rounded-2xl" />
          <Bone className="h-48 rounded-2xl" />
        </div>
      </div>
    </motion.div>
  );
}

export function GenericPageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 page-enter"
    >
      <div className="space-y-2">
        <Bone className="h-8 w-52" />
        <Bone className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Bone key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    </motion.div>
  );
}
