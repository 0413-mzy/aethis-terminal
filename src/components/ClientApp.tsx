'use client';

import { GameShell } from '@/components/layout/GameShell';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MainContent } from '@/components/layout/MainContent';
import { ModalLayer } from '@/components/layout/ModalLayer';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ParticleCanvas } from '@/components/effects/ParticleCanvas';
import { FloatingTexts } from '@/components/effects/FloatingText';
import { PetCompanion } from '@/components/character/PetCompanion';

export default function ClientApp() {
  return (
    <GameShell>
      <ParticleCanvas />
      <FloatingTexts />
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
      <ModalLayer />
      <ToastContainer />
      <PetCompanion />
    </GameShell>
  );
}
