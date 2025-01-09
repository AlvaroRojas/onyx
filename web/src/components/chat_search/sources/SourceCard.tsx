import { WebResultIcon } from "@/components/WebResultIcon";
import { SourceIcon } from "@/components/SourceIcon";
import { OnyxDocument } from "@/lib/search/interfaces";
import { truncateString } from "@/lib/utils";
import { openDocument } from "@/lib/search/utils";

export default function SourceCard({
  doc,
  setPresentingDocument,
}: {
  doc: OnyxDocument;
  setPresentingDocument?: (document: OnyxDocument) => void;
}) {
  return (
    <div
      key={doc.document_id}
      onClick={() => openDocument(doc, setPresentingDocument)}
      className="cursor-pointer text-left overflow-hidden flex flex-col gap-0.5 rounded-lg px-3 py-2 hover:bg-[#F1EEE8]/80 bg-[#F1EEE8]/75 w-[200px]"
    >
      <div className="line-clamp-1 font-semibold text-ellipsis  text-text-900  flex h-6 items-center gap-2 text-sm">
        {doc.is_internet || doc.source_type === "web" ? (
          <WebResultIcon url={doc.link} />
        ) : (
          <SourceIcon sourceType={doc.source_type} iconSize={18} />
        )}
        <p>{truncateString(doc.semantic_identifier || doc.document_id, 20)}</p>
      </div>
      <div className="line-clamp-2 text-sm font-semibold"></div>
      <div className="line-clamp-2 text-sm font-normal leading-snug text-text-700">
        {doc.blurb}
      </div>
    </div>
  );
}

interface SeeMoreBlockProps {
  documentSelectionToggled: boolean;
  toggleDocumentSelection?: () => void;
  uniqueSources: OnyxDocument["source_type"][];
}

export function SeeMoreBlock({
  documentSelectionToggled,
  toggleDocumentSelection,
  uniqueSources,
}: SeeMoreBlockProps) {
  return (
    <div
      onClick={toggleDocumentSelection}
      className={`
        cursor-pointer rounded-lg flex-none transition-all duration-500 hover:bg-[#F1EEE8]/80 bg-[#F1EEE8]/75 px-3 py-2
      `}
    >
      <div className="flex gap-y-2 flex-col items-start text-sm">
        <p className="flex-1 mr-1 font-semibold text-text-900 overflow-hidden text-ellipsis whitespace-nowrap">
          {documentSelectionToggled ? "Hide sources" : "Full Results"}
        </p>
        <div className="flex-shrink-0 flex gap-x-1  items-center">
          {uniqueSources.slice(0, 3).map((sourceType, ind) => (
            <div key={ind} className="inline-block ">
              <SourceIcon sourceType={sourceType} iconSize={16} />
            </div>
          ))}
          {uniqueSources.length > 3 && (
            <span className="text-xs text-text-700 font-semibold ml-1">
              +{uniqueSources.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
