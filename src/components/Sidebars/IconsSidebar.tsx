import React, { useState } from "react";
import SettingsModal from "../Settings/Settings";
import { SidebarAbleToShow } from "../FileEditorContainer";
import { FiSearch, FiFolder, FiEdit, FiFolderPlus, FiSettings } from "react-icons/fi";
import NewNoteComponent from "../File/NewNote";
import NewDirectoryComponent from "../File/NewDirectory";

interface LeftSidebarProps {
  onFileSelect: (name: string, path: string) => void;
  sidebarShowing: SidebarAbleToShow;
  makeSidebarShow: (show: SidebarAbleToShow) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  onFileSelect,
  sidebarShowing,
  makeSidebarShow,
}) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [isNewDirectoryModalOpen, setIsNewDirectoryModalOpen] = useState(false);

  return (
    <div className="h-full bg-slate-800 flex flex-col items-center justify-between p-1 gap-2">
      <div
        className="flex items-center justify-center w-[2.5rem] h-10 cursor-pointer p-1 rounded flex items-center justify-center hover:bg-slate-500"
        style={{
          backgroundColor: sidebarShowing === "search" ? "#475569" : "",
        }}
        onClick={() => makeSidebarShow("search")}
      >
        <FiSearch className="text-slate-100 text-xl" />
      </div>
      <div
        className="flex items-center justify-center w-[2.5rem] h-10 cursor-pointer p-1 rounded flex items-center justify-center hover:bg-slate-500"
        style={{
          backgroundColor: sidebarShowing === "files" ? "#475569" : "",
        }}
        onClick={() => makeSidebarShow("files")}
      >
        <FiFolder className="text-slate-100 text-xl" />
      </div>
      <hr className="w-full" />
      <div
        className="flex items-center justify-center w-[2.5rem] h-10 cursor-pointer p-1 rounded flex items-center justify-center hover:bg-slate-500"
        onClick={() => setIsNewNoteModalOpen(true)}
      >
        <FiEdit className="text-slate-100 text-xl" />
      </div>
      <div
        className="flex items-center justify-center w-[2.5rem] h-10 cursor-pointer p-1 rounded flex items-center justify-center hover:bg-slate-500"
        onClick={() => setIsNewDirectoryModalOpen(true)}
      >
        <FiFolderPlus className="text-slate-100 text-xl" />
      </div>
      <NewNoteComponent
        isOpen={isNewNoteModalOpen}
        onClose={() => setIsNewNoteModalOpen(false)}
        onFileSelect={onFileSelect}
      />
      <NewDirectoryComponent
        isOpen={isNewDirectoryModalOpen}
        onClose={() => setIsNewDirectoryModalOpen(false)}
        onDirectoryCreate={() => console.log("Directory created")}
      />
      <div className="flex-grow border-1 border-yellow-300"></div>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      <div
        className="flex items-center justify-center w-[2.5rem] h-10 cursor-pointer p-1 rounded flex items-center justify-center hover:bg-slate-500"
        onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)}
      >
        <FiSettings className="text-slate-100 text-xl" />
      </div>
    </div>
  );
};

export default LeftSidebar;
