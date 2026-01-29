import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preços | Ouvy - Plataforma de Feedback',
  description: 'Conheça os planos da Ouvy. Plano gratuito, Starter, Pro e Enterprise. Comece grátis e escale conforme sua empresa cresce.',
  openGraph: {
    title: 'Preços | Ouvy - Planos que crescem com você',
    description: 'Planos flexíveis para gestão de feedbacks. Comece gratuitamente.',
  },
};

export default function PrecosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
