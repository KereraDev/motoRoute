import { useRef, useState, useCallback } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

export function useCommentsSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const openComments = useCallback((postId: string) => {
    setActivePostId(postId);
    bottomSheetRef.current?.present(); // Muestra el sheet
  }, []);

  const closeComments = useCallback(() => {
    bottomSheetRef.current?.dismiss(); // Oculta el sheet
    setActivePostId(null);
  }, []);

  return {
    bottomSheetRef,
    activePostId,
    openComments,
    closeComments,
  };
}
