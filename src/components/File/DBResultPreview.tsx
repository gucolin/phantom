import { DBQueryResult } from "electron/main/database/Schema";
import React from "react";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns"; // for human-readable time format

interface DBResultPreview {
  dbResult: DBQueryResult;
  onSelect: (name: string, path: string) => void;
}

export const DBResultPreview: React.FC<DBResultPreview> = ({
  dbResult: entry,
  onSelect,
}) => {
  const modified = formatModifiedDate(entry.filemodified);
  return (
    <div
      className="pr-2 pb-1 mt-0 text-slate-950 pt-1 rounded border-solid border-slate-300 bg-slate-200 border-[0.1px] pl-2 cursor-pointer hover:scale-104 hover:bg-slate-300 transition-transform duration-300"
      onClick={() => onSelect(getFileName(entry.notepath), entry.notepath)}
    >
      <ReactMarkdown className="text-slate-800">{entry.content}</ReactMarkdown>
      <div className="text-xs text-slate-600 mt-0">
        Similarity: {cosineDistanceToPercentage(entry._distance)}% |{" "}
        {modified && (
          <span className="text-xs text-slate-600">Modified {modified}</span>
        )}
      </div>
    </div>
  );
};

interface DBSearchPreviewProps {
  dbResult: DBQueryResult;
  onSelect: (name: string, path: string) => void;
}

export const DBSearchPreview: React.FC<DBSearchPreviewProps> = ({
  dbResult: entry,
  onSelect,
}) => {
  const modified = formatModifiedDate(entry.filemodified);

  return (
    <div
      className="bg-slate-200 border border-slate-400 rounded transition-transform duration-300 cursor-pointer hover:scale-104 hover:bg-slate-300 p-2"
      onClick={() => onSelect(getFileName(entry.notepath), entry.notepath)}
    >
      <ReactMarkdown className="text-slate-800 break-words mt-0">
        {entry.content}
      </ReactMarkdown>
      <div className="text-xs text-slate-600 mt-0">
        Similarity: {cosineDistanceToPercentage(entry._distance)}% |{" "}
        {modified && (
          <span className="text-xs text-slate-600">Modified {modified}</span>
        )}
      </div>
    </div>
  );
};

const cosineDistanceToPercentage = (similarity: number) => {
  return ((1 - similarity) * 100).toFixed(2);
};

export function getFileName(filePath: string): string {
  const parts = filePath.split(/[/\\]/);
  return parts.pop() || "";
}

const formatModifiedDate = (date: Date) => {
  if (!date || isNaN(new Date(date).getTime())) {
    return "";
  }
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};
