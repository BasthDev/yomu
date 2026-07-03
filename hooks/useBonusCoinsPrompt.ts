import { useCallback, useEffect, useRef, useState } from "react";
import { CHAPTERS_PER_BONUS_AD } from "../utils/adConfig";

export function useBonusCoinsPrompt(
  isAdLoaded: boolean,
  isUnlockModalVisible: boolean,
) {
  const chaptersSinceBonusRef = useRef(0);
  const lastCountedChapterRef = useRef<string | null>(null);
  const bonusOfferedThisCycleRef = useRef(false);

  const [showPrompt, setShowPrompt] = useState(false);
  const [queuedPrompt, setQueuedPrompt] = useState(false);

  const tryShowPrompt = useCallback(
    (unlockModalVisible: boolean, adLoaded: boolean) => {
      if (unlockModalVisible) {
        setQueuedPrompt(true);
        return;
      }

      if (adLoaded) {
        setShowPrompt(true);
        setQueuedPrompt(false);
        return;
      }

      setQueuedPrompt(true);
    },
    [],
  );

  const recordChapterRead = useCallback(
    (chapterId: string) => {
      if (lastCountedChapterRef.current === chapterId) return;

      lastCountedChapterRef.current = chapterId;
      chaptersSinceBonusRef.current += 1;

      if (
        chaptersSinceBonusRef.current >= CHAPTERS_PER_BONUS_AD &&
        !bonusOfferedThisCycleRef.current
      ) {
        bonusOfferedThisCycleRef.current = true;
        tryShowPrompt(isUnlockModalVisible, isAdLoaded);
      }
    },
    [isAdLoaded, isUnlockModalVisible, tryShowPrompt],
  );

  useEffect(() => {
    if (queuedPrompt && !isUnlockModalVisible && isAdLoaded) {
      setShowPrompt(true);
      setQueuedPrompt(false);
    }
  }, [queuedPrompt, isUnlockModalVisible, isAdLoaded]);

  const skipBonus = useCallback(() => {
    setShowPrompt(false);
    setQueuedPrompt(false);
    chaptersSinceBonusRef.current = 0;
    bonusOfferedThisCycleRef.current = false;
  }, []);

  const completeBonus = useCallback(() => {
    setShowPrompt(false);
    setQueuedPrompt(false);
    chaptersSinceBonusRef.current = 0;
    bonusOfferedThisCycleRef.current = false;
  }, []);

  return {
    showPrompt,
    recordChapterRead,
    skipBonus,
    completeBonus,
  };
}
