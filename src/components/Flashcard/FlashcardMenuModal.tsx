import React, { useState } from "react";

import Modal from "../Generic/Modal";
import { Button } from "@material-tailwind/react";
import FlashcardReviewModal from "./FlashcardReviewModal";
import FlashcardCreateModal from "./FlashcardCreateModal";

interface FlashcardMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFileToCreateFlashcard?: string;
  initialFileToReviewFlashcard?: string;
}

const FlashcardMenuModal: React.FC<FlashcardMenuModalProps> = ({
  isOpen,
  onClose,
  initialFileToCreateFlashcard,
  initialFileToReviewFlashcard,
}) => {
  const [isCreateFlashcardMode, setIsCreateFlashcardMode] = useState<boolean>(
    !!initialFileToCreateFlashcard
  );
  const [isReviewFlashcardMode, setIsReviewFlashcardMode] = useState<boolean>(
    !!initialFileToReviewFlashcard
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      // tailwindStylesOnBackground="bg-gradient-to-r from-orange-900 to-yellow-900"
    >
      <div className="ml-6 mt-2 mb-6 w-full h-full min-w-[900px]">
        <h2 className="text-xl font-semibold mb-3 text-white">
          Flashcard Mode
        </h2>
        {isReviewFlashcardMode && (
          <FlashcardReviewModal
            isOpen={isReviewFlashcardMode}
            onClose={() => setIsReviewFlashcardMode(false)}
          />
        )}
        {isCreateFlashcardMode && (
          <FlashcardCreateModal
            isOpen={isCreateFlashcardMode}
            onClose={() => setIsCreateFlashcardMode(false)}
            initialFlashcardFile={initialFileToCreateFlashcard}
          />
        )}

        <Button
          className="bg-slate-600 border-none h-20 w-96 text-center
            mt-4 mr-16
            cursor-pointer
            disabled:pointer-events-none
            disabled:opacity-25"
          onClick={() => setIsCreateFlashcardMode(true)}
          // Write to the flashcards directory if the flashcards generated are valid
          // onClick={async () => await storeFlashcardPairsAsJSON(flashcardQAPairs, fileToGenerateFlashcardsFor)}
          placeholder={""}
        >
          {"Create new flashcards"}
        </Button>

        <Button
          className="bg-orange-900/75 border-none h-20 w-96 text-center
            mt-4 ml-16
            cursor-pointer
            disabled:pointer-events-none
            disabled:opacity-25"
          // Write to the flashcards directory if the flashcards generated are valid
          onClick={async () => setIsReviewFlashcardMode(true)}
          placeholder={""}
        >
          {"Review my existing cards"}
        </Button>
      </div>
    </Modal>
  );
};

export default FlashcardMenuModal;
