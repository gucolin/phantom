import React, { useRef, useState } from "react";
import SimilarEntriesComponent from "./Similarity/SimilarFilesSidebar";
import TitleBar from "./TitleBar";
import ChatWithLLM from "./Chat/Chat";
import LeftSidebar from "./Sidebars/IconsSidebar";
import MilkdownEditor from "./File/MilkdownEditor";
import ResizableComponent from "./Generic/ResizableComponent";
import SidebarManager from "./Sidebars/MainSidebar";
import { toast } from "react-toastify";
import { removeFileExtension } from "@/functions/strings";
import { FiFileText } from "react-icons/fi";

interface FileEditorContainerProps {}
export type SidebarAbleToShow = "files" | "search";

const FileEditorContainer: React.FC<FileEditorContainerProps> = () => {
  const [editorContent, setEditorContent] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const lastSavedContentRef = useRef<string>("");
  const [showChatbot, setShowChatbot] = useState<boolean>(true);
  const [showSimilarFiles, setShowSimilarFiles] = useState<boolean>(true);
  const [sidebarShowing, setSidebarShowing] =
    useState<SidebarAbleToShow>("files");

  const onFileSelect = async (name: string, path: string) => {
    if (selectedFilePath && editorContent !== lastSavedContentRef.current) {
      try {
        await window.files.writeFile(selectedFilePath, editorContent); // save the current content.
      } catch (e) {
        toast.error("Error saving current file! Please try again.", {
          className: "mt-5",
        });
        return;
      }
    }
    setSelectedFileName(name);
    setSelectedFilePath(path);
  };
  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };
  const toggleSimilarFiles = () => {
    setShowSimilarFiles(!showSimilarFiles);
  };

  return (
    <div>
      <TitleBar
        onFileSelect={onFileSelect}
        chatbotOpen={showChatbot}
        similarFilesOpen={showSimilarFiles}
        toggleChatbot={toggleChatbot}
        toggleSimilarFiles={toggleSimilarFiles}
      />

      <div className="flex h-below-titlebar">
        <LeftSidebar
          onFileSelect={onFileSelect}
          sidebarShowing={sidebarShowing}
          makeSidebarShow={setSidebarShowing}
        />

        <ResizableComponent resizeSide="right" initialWidth={400}>
          <div className="h-full border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-slate-400 border-solid w-full">
            <SidebarManager
              selectedFilePath={selectedFilePath}
              onFileSelect={onFileSelect}
              sidebarShowing={sidebarShowing}
            />
          </div>
        </ResizableComponent>

        {selectedFilePath && (
          <div className="w-full h-full flex overflow-x-hidden">
            <div className="w-full flex h-full">
              <div className="h-full w-full">
                <div className="flex items-center justify-start bg-slate-300 p-2">
                  <FiFileText className="text-slate-950 mr-1" />

                  <h2 className="text-slate-800 text-sm pl-1 mb-0 pt-0 pb-0 font-semibold">
                    {removeFileExtension(selectedFileName ?? '')}
                  </h2>
                </div>
                <MilkdownEditor
                  filePath={selectedFilePath}
                  setContentInParent={setEditorContent}
                  lastSavedContentRef={lastSavedContentRef}
                />
              </div>
              {showSimilarFiles && (
                <ResizableComponent resizeSide="left" initialWidth={400}>
                  <SimilarEntriesComponent
                    filePath={selectedFilePath}
                    onFileSelect={onFileSelect}
                  />
                </ResizableComponent>
              )}
            </div>
          </div>
        )}
        {showChatbot && (
          <div
            className={`h-below-titlebar ${
              selectedFilePath ? "" : "absolute right-0"
            }`}
          >
            <ResizableComponent resizeSide="left" initialWidth={300}>
              <ChatWithLLM />
            </ResizableComponent>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEditorContainer;
