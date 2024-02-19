import NewNoteComponent from "./File/NewNote";
import React, { useEffect, useState } from "react";
import { FiDivideSquare, FiMessageSquare } from "react-icons/fi";
import classNames from "classnames";

export const titleBarHeight = "30px";
interface TitleBarProps {
  onFileSelect: (name: string, path: string) => void;
  chatbotOpen: boolean;
  similarFilesOpen: boolean;
  toggleChatbot: () => void;
  toggleSimilarFiles: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({
  onFileSelect,
  chatbotOpen,
  similarFilesOpen,
  toggleChatbot,
  toggleSimilarFiles,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    const fetchPlatform = async () => {
      const response = await window.electron.getPlatform();
      setPlatform(response);
    };

    fetchPlatform();
  }, []);
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  return (
    <div
      id="customTitleBar"
      className={`h-titlebar bg-slate-50 flex justify-between border-b border-slate-200 border-solid`}
    >
      <div
        className=" flex"
        style={
          platform === "darwin"
            ? { marginLeft: "70px" }
            : { marginLeft: "10px" }
        }
      >
        <NewNoteComponent
          isOpen={isModalOpen}
          onClose={toggleModal}
          onFileSelect={onFileSelect}
        />
      </div>

      <div
        className="flex gap-1 pr-2 py-[0.125rem]"
        style={platform === "win32" ? { marginRight: "8.5rem" } : {}}
      >
        <button className={classNames("rounded px-2 py-1", {
          "bg-slate-200": similarFilesOpen,
        })} onClick={toggleSimilarFiles}>
          <FiDivideSquare
            className="text-slate-900 cursor-pointer text-base"
          />
        </button>

        <button className={classNames("rounded px-2 py-1", {
            "bg-slate-200": chatbotOpen,
          })}
          onClick={toggleChatbot}>
          <FiMessageSquare
            className="text-slate-900 cursor-pointer text-base"
          />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
