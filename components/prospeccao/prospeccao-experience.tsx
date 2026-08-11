"use client";

import { useState } from "react";
import { LockScreen } from "@/components/prospeccao/lock-screen";
import { OficinasProvider } from "@/components/prospeccao/oficinas-store";
import { ScriptsProvider } from "@/components/prospeccao/scripts-store";
import { StrategiesProvider } from "@/components/prospeccao/strategies-store";
import { ProspeccaoHub } from "@/components/prospeccao/prospeccao-hub";

export type ProspeccaoExperienceProps = {
  accessCode: string;
  title: string;
  logo: string;
  brandName: string;
  homeHref: string;
};

export function ProspeccaoExperience({ accessCode, title, logo, brandName, homeHref }: ProspeccaoExperienceProps) {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <LockScreen onUnlock={() => setUnlocked(true)} accessCode={accessCode} title={title} logo={logo} brandName={brandName} />;
  }

  return (
    <OficinasProvider>
      <ScriptsProvider>
        <StrategiesProvider>
          <ProspeccaoHub title={title} homeHref={homeHref} />
        </StrategiesProvider>
      </ScriptsProvider>
    </OficinasProvider>
  );
}
