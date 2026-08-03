"use client";

import { useState } from "react";
import { LockScreen } from "@/components/prospeccao/lock-screen";
import { OficinasProvider } from "@/components/prospeccao/oficinas-store";
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
      <ProspeccaoHub title={title} homeHref={homeHref} />
    </OficinasProvider>
  );
}
