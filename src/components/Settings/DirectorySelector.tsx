import React, { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";

interface DirectorySelectorProps {
  setErrorMsg: (error: string) => void;
}

const DirectorySelector: React.FC<DirectorySelectorProps> = ({
  setErrorMsg,
}) => {
  const [userDirectory, setUserDirectory] = useState<string>("");

  const handleDirectorySelection = async () => {
    const paths = await window.files.openDirectoryDialog();
    if (paths && paths[0]) {
      setUserDirectory(paths[0]);
    }
  };

  useEffect(() => {
    const directory = window.electronStore.getUserDirectory();
    if (directory) {
      setUserDirectory(directory);
    }
  }, []);

  useEffect(() => {
    if (!userDirectory) {
      setErrorMsg("Please select a directory");
    } else {
      window.electronStore.setUserDirectory(userDirectory);
      setErrorMsg("");
    }
  }, [userDirectory]);

  return (
    <div>
      <Button
        className="bg-slate-300  border-none h-10 hover:bg-slate-100 cursor-pointer w-[140px] text-center pt-0 pb-0 pr-2 pl-2"
        onClick={handleDirectorySelection}
        placeholder=""
      >
        Select Directory
      </Button>
      {userDirectory && (
        <p className="mt-2 text-xs text-slate-900">
          Selected: <strong>{userDirectory}</strong>
        </p>
      )}
    </div>
  );
};

export default DirectorySelector;
