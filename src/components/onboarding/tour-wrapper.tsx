"use client";

import { useEffect } from "react";
import { Onborda, OnbordaProvider, useOnborda } from "onborda";

import { TourCard } from "@/components/onboarding/tour-card";
import { appTours, MAIN_TOUR_NAME } from "@/components/onboarding/tour-config";

const TOUR_DONE_KEY = "shaadi_tour_v1_done";

function TourAutoStart() {
  const { startOnborda } = useOnborda();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(TOUR_DONE_KEY)) return;
    const t = setTimeout(() => startOnborda(MAIN_TOUR_NAME), 900);
    return () => clearTimeout(t);
  }, [startOnborda]);

  return null;
}

export function TourWrapper({ children }: { children: React.ReactNode }) {
  return (
    <OnbordaProvider>
      <Onborda
        steps={appTours}
        cardComponent={TourCard}
        shadowRgb="0,0,0"
        shadowOpacity="0.25"
        cardTransition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {children}
      </Onborda>
      <TourAutoStart />
    </OnbordaProvider>
  );
}
