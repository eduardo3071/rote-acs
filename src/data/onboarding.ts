export type OnboardingStep = {
  id: "territory" | "offline" | "priority";
  title: string;
  text: string;
};

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "territory",
    title: "Priorize quem mais precisa",
    text: "O RoteACS organiza as famílias do seu território por nível de prioridade, ajudando você a identificar quais visitas precisam acontecer primeiro.",
  },
  {
    id: "offline",
    title: "Funciona sem internet",
    text: "Continue trabalhando mesmo sem conexão. Seus registros permanecem no dispositivo e podem ser sincronizados quando houver sinal.",
  },
  {
    id: "priority",
    title: "O território muda. A prioridade também.",
    text: "Quando novas informações são registradas, a prioridade das famílias pode ser atualizada para ajudar você a decidir onde ir primeiro.",
  },
];
