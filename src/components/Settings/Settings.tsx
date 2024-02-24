import React, { useState } from "react";
import Modal from "../Generic/Modal";
import LLMSettings from "./LLMSettings";
import EmbeddingModelSettings from "./EmbeddingSettings";
import RagSettings from "./RagSettings";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<ModalProps> = ({
  isOpen,
  onClose: onCloseFromParent,
}) => {
  const [willNeedToReIndex, setWillNeedToReIndex] = useState(false);
  const [activeTab, setActiveTab] = useState("llmSettings");

  const handleSave = () => {
    if (willNeedToReIndex) {
      console.log("reindexing files");
      window.database.indexFilesInDirectory();
    }
    onCloseFromParent();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleSave();
      }}
    >
      <div className="flex w-[40rem] h-[25rem]">
        <div className="flex flex-col ml-2 pr-1 w-[8rem]  bg-slate-200 text-slate-950 border-r-[0.1px] border-slate-300 border-solid border-b-0 border-t-0 border-l-0 gap-1">
          <div
            className={`flex items-center mt-2 rounded cursor-pointer p-2 border-b border-slate-200 hover:bg-slate-400 text-sm ${
              activeTab === "llmSettings"
                ? "bg-slate-300 text-slate-950 font-semibold"
                : "text-slate-800"
            }`}
            onClick={() => setActiveTab("llmSettings")}
          >
            LLM
          </div>
          <div
            className={`flex items-center rounded cursor-pointer p-2 hover:bg-slate-400 text-sm ${
              activeTab === "embeddingModel"
                ? "bg-slate-300 text-slate-950 font-semibold"
                : "text-slate-800"
            }`}
            onClick={() => setActiveTab("embeddingModel")}
          >
            Embedding Model
          </div>

          <div
            className={`flex items-center rounded cursor-pointer p-2 hover:bg-slate-400 text-sm ${
              activeTab === "RAG"
                ? "bg-slate-300 text-slate-950 font-semibold"
                : "text-slate-800"
            }`}
            onClick={() => setActiveTab("RAG")}
          >
            RAG{" "}
          </div>
        </div>

        <div className="flex-1 px-2 py-4">
          {activeTab === "llmSettings" && (
            <div className="mt-2 w-full">
              <LLMSettings />
            </div>
          )}
          {activeTab === "embeddingModel" && (
            <div className="w-full">
              <EmbeddingModelSettings
                handleUserHasChangedModel={() => setWillNeedToReIndex(true)}
              />
            </div>
          )}

          {activeTab === "RAG" && (
            <div className="w-full">
              <RagSettings>
                <h2 className="text-2xl font-semibold mb-0 text-slate-950 mb-4">RAG</h2>{" "}
                <h4 className="text-slate-900 mb-1">
                  Number of notes to feed to the LLM during Q&A:
                </h4>
              </RagSettings>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
