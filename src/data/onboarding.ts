export type OnboardingStep = {
  id: "territory" | "offline" | "priority";
  titleKey: "onboarding.territory.title" | "onboarding.offline.title" | "onboarding.priority.title";
  textKey: "onboarding.territory.text" | "onboarding.offline.text" | "onboarding.priority.text";
};

export const onboardingSteps: OnboardingStep[] = [
  { id: "territory", titleKey: "onboarding.territory.title", textKey: "onboarding.territory.text" },
  { id: "offline", titleKey: "onboarding.offline.title", textKey: "onboarding.offline.text" },
  { id: "priority", titleKey: "onboarding.priority.title", textKey: "onboarding.priority.text" },
];
