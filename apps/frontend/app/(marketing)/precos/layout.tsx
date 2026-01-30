import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preços | Ouvify - Plataforma de Feedback',
  description: 'Conheça os planos da Ouvify. Plano gratuito, Starter, Pro e Enterprise. Comece grátis e escale conforme sua empresa cresce.',
  openGraph: {
    title: 'Preços | Ouvify - Planos que crescem com você',
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
