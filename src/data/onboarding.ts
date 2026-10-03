import { Users, SmartphoneNfc, TrendingUp, type LucideIcon } from "lucide-react";

export type OnboardingStep = { icon: LucideIcon; title: string; text: string };

export const onboardingSteps: OnboardingStep[] = [
  {
    icon: Users,
    title: "Priorize quem mais precisa",
    text: "O RoteACS organiza as famílias do seu território por nível de prioridade, ajudando você a identificar quais visitas precisam acontecer primeiro.",
  },
  {
    icon: SmartphoneNfc,
    title: "Funciona sem internet",
    text: "Continue trabalhando mesmo sem conexão. Seus registros permanecem no dispositivo e podem ser sincronizados quando houver sinal.",
  },
  {
    icon: TrendingUp,
    title: "O território muda. A prioridade também.",
    text: "Quando novas informações são registradas, a prioridade das famílias pode ser atualizada para ajudar você a decidir onde ir primeiro.",
  },
];
