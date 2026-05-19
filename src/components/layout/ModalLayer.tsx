'use client';

import { useUIStore } from '@/stores/uiStore';
import { Modal } from '@/components/ui/Modal';
import { PrologueModal } from '@/components/story/PrologueModal';
import { StoryChapterModal } from '@/components/story/StoryChapterModal';
import { LevelUpModal } from '@/components/character/LevelUpModal';
import { DeathModal } from '@/components/character/DeathModal';
import { DailyRewardModal } from '@/components/notifications/DailyRewardModal';
import { AchievementToast } from '@/components/notifications/AchievementToast';
import { BossEncounterModal } from '@/components/boss/BossEncounterModal';

export function ModalLayer() {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);

  return (
    <>
      <Modal isOpen={activeModal === 'characterCreation'} onClose={() => {}} size="lg" closeOnBackdrop={false}>
        <PrologueModal />
      </Modal>

      <Modal isOpen={activeModal === 'levelUp'} onClose={closeModal} size="md">
        <LevelUpModal />
      </Modal>

      <Modal isOpen={activeModal === 'dailyReward'} onClose={closeModal} size="sm">
        <DailyRewardModal />
      </Modal>

      <Modal isOpen={activeModal === 'bossEncounter'} onClose={closeModal} size="md">
        <BossEncounterModal />
      </Modal>

      <Modal isOpen={activeModal === 'death'} onClose={closeModal} size="sm">
        <DeathModal />
      </Modal>

      <Modal isOpen={activeModal === 'storyChapter'} onClose={closeModal} size="lg">
        <StoryChapterModal />
      </Modal>

      <AchievementToast />
    </>
  );
}
