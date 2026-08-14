import { AchievementCard } from "@/components/meu-dia/achievement-card";
import type { AchievementWithStatus } from "@/lib/gamification/queries";

export function AchievementGrid({ achievements }: { achievements: AchievementWithStatus[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {achievements.map((achievement) => (
        <AchievementCard key={achievement.key} achievement={achievement} />
      ))}
    </div>
  );
}
