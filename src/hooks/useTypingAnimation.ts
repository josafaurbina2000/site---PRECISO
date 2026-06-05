import { useState, useEffect, useCallback } from "react";

/**
 * Hook for cycling through text phrases with typing animation effect.
 */
export function useTypingAnimation(
  phrases: string[],
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDuration = 2500
) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPhrase = phrases[currentPhraseIndex];

  const tick = useCallback(() => {
    if (isDeleting) {
      setCurrentText((prev) => prev.slice(0, -1));
    } else {
      setCurrentText((prev) => currentPhrase.slice(0, prev.length + 1));
    }
  }, [currentPhrase, isDeleting]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && currentText === currentPhrase) {
      // Pause at full text
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
    } else if (isDeleting && currentText === "") {
      // Move to next phrase
      setIsDeleting(false);
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    } else {
      // Continue typing/deleting
      timeout = setTimeout(tick, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [currentText, currentPhrase, isDeleting, phrases.length, tick, typingSpeed, deletingSpeed, pauseDuration]);

  return { currentText, isDeleting };
}
