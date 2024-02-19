import React, { useState } from "react";
import Modal from "../Generic/Modal";
import { Button } from "@material-tailwind/react";

interface NewDirectoryComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onDirectoryCreate: (path: string) => void;
}

const NewDirectoryComponent: React.FC<NewDirectoryComponentProps> = ({
  isOpen,
  onClose,
  onDirectoryCreate,
}) => {
  const [directoryName, setDirectoryName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const validNamePattern = /^[a-zA-Z0-9_\-/\s]+$/;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (newName === "") {
      setDirectoryName(newName);
      setErrorMessage("");
    } else if (validNamePattern.test(newName) && !newName.includes("../")) {
      setDirectoryName(newName);
      setErrorMessage("");
    } else {
      setDirectoryName(newName);
      setErrorMessage(
        "Directory name can only contain letters, numbers, underscores, hyphens, and slashes."
      );
    }
  };

  const sendNewDirectoryMsg = async () => {
    if (!directoryName || errorMessage) {
      return;
    }
    const normalizedDirectoryName = directoryName.replace(/\\/g, "/");
    const fullPath = await window.files.joinPath(
      window.electronStore.getUserDirectory(),
      normalizedDirectoryName
    );
    window.files.createDirectory(fullPath); // Assuming createDirectory is the method for directory creation
    onDirectoryCreate(fullPath);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendNewDirectoryMsg();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="ml-3 mr-6 mt-2 mb-2 h-full min-w-[400px]">
        <h2 className="text-xl font-semibold mb-3 text-slate-950">New Directory</h2>
        <input
          type="text"
          className="block w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
          value={directoryName}
          onChange={handleNameChange}
          onKeyDown={handleKeyPress}
          placeholder="Directory Name"
        />
        <Button
          className="bg-slate-300 mt-3 mb-2 border-none h-10 hover:bg-slate-100 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2"
          onClick={sendNewDirectoryMsg}
          placeholder={""}
        >
          Create
        </Button>
        {errorMessage && <p className="text-red-500 text-xs">{errorMessage}</p>}
      </div>
    </Modal>
  );
};

export default NewDirectoryComponent;
