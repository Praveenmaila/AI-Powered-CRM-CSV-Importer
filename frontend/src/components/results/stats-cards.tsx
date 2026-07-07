"use client";

import { useEffect, useState } from "react";
import {
  FileCheck2,
  FileX2,
  Timer,
  Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDuration, formatNumber } from "@/lib/utils";
import type { ImportStatistics } from "@/types/api";

interface StatsCardsProps {
  statistics: ImportStatistics;
}

interface StatItem {
  label: string;
  value: number;
  format: (v: number) => string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

/**
 * Statistics cards showing import results in a responsive grid.
 * Each card has a count-up animation.
 */
export function StatsCards({ statistics }: StatsCardsProps) {
  const stats: StatItem[] = [
    {
      label: "Total Rows",
      value: statistics.total_rows,
      format: formatNumber,
      icon: Layers,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      label: "Imported",
      value: statistics.imported_count,
      format: formatNumber,
      icon: FileCheck2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Skipped",
      value: statistics.skipped_count,
      format: formatNumber,
      icon: FileX2,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Processing Time",
      value: statistics.processing_time_ms,
      format: formatDuration,
      icon: Timer,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} stat={stat} delay={index * 100} />
      ))}
    </div>
  );
}

function StatCard({ stat, delay }: { stat: StatItem; delay: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const Icon = stat.icon;

  // Count-up animation
  useEffect(() => {
    const duration = 1000; // 1 second
    const startTime = Date.now() + delay;
    let animationFrame: number;

    function animate() {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(stat.value * eased));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    }

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [stat.value, delay]);

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
        "animate-in fade-in slide-in-from-bottom-4"
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={cn("text-2xl sm:text-3xl font-bold tabular-nums", stat.color)}>
              {stat.format(displayValue)}
            </p>
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", stat.bgColor)}>
            <Icon className={cn("h-5 w-5", stat.color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
