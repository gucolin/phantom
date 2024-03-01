import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

type OptionType = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  options: OptionType[];
  value: string;
  onChange: (value: string) => void;
  onDelete?: (value: string) => void;
  isLLMDropdown?: boolean;
  addButton?: {
    label: string;
    onClick: () => void;
  };
};

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  addButton,
  onDelete = () => {}, 
  isLLMDropdown = false 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleDeleteModelInDropdown = async (selectedModel: string) => {
    onDelete(selectedModel);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full " ref={wrapperRef}>
      <div
        className="flex justify-between items-center w-full py-2 border border-slate-300 rounded-md bg-slate-300 cursor-pointer hover:bg-slate-400 transition-colors"
        onClick={toggleDropdown}
      >
        <span className="ml-2 text-[13px] text-slate-600">{value}</span>
        <span
          className="transform transition-transform mr-2"
          style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
        >
          <FiChevronDown />
        </span>
      </div>
      {isOpen && (
        <div className="absolute w-full text-[13px] border text-slate-600 border-slate-300 rounded-md z-10 bg-white max-h-60 overflow-auto">
          {options.map((option, index) => (
            <div key={index} className="flex justify-between items-center py-2 pl-2 pr-2 hover:bg-slate-100 cursor-pointer rounded-md">
              <span className="w-full" onClick={() => handleOptionClick(option.value)}>
                {option.label}
              </span>
              {value === option.value ? (
                <span className="text-blue-500">&#10003;</span> // Tick mark
              ) : isLLMDropdown ? (
                <span onClick={() => handleDeleteModelInDropdown(option.value)} className="ml-2 text-[13px] text-red-700">
                  <FaTrash />
                </span>
              ) : null}
            </div>
          ))}

          {addButton && (
            <div
              className="py-2 pl-2 pr-2 mt-1 bg-slate-200 text-slate-700 text-center cursor-pointer rounded-md hover:bg-slate-300 transition-colors"
              onClick={addButton.onClick}
            >
              {addButton.label}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
