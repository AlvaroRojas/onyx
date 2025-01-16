import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { OnyxDocument } from "@/lib/search/interfaces";
import { SubQuestionDetail } from "../interfaces";
import { SourceChip2 } from "../input/ChatInputBar";
import { ResultIcon } from "@/components/chat_search/sources/SourceCard";
import { openDocument } from "@/lib/search/utils";
import { SourcesDisplay } from "./SourcesDisplay";
import ReactMarkdown from "react-markdown";
import { MemoizedAnchor } from "./MemoizedTextComponents";
import { MemoizedParagraph } from "./MemoizedTextComponents";
import { extractCodeText, preprocessLaTeX } from "./codeUtils";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { useStreamingMessages } from "./StreamingMessages";

interface SubQuestionsDisplayProps {
  subQuestions: SubQuestionDetail[];
  documents: OnyxDocument[];
  toggleDocumentSelection: () => void;
  setPresentingDocument: (document: OnyxDocument) => void;
  unToggle: boolean;
}

const SubQuestionDisplay: React.FC<{
  subQuestion: SubQuestionDetail;
  documents: OnyxDocument[];
  isLast: boolean;
  unToggle: boolean;
  isFirst: boolean;
  setPresentingDocument: (document: OnyxDocument) => void;
}> = ({
  subQuestion,
  documents,
  isLast,
  unToggle,
  isFirst,
  setPresentingDocument,
}) => {
  const [analysisToggled, setAnalysisToggled] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const processContent = (content: string | JSX.Element) => {
    if (typeof content !== "string") {
      return content;
    }

    const codeBlockRegex = /```(\w*)\n[\s\S]*?```|```[\s\S]*?$/g;
    const matches = content.match(codeBlockRegex);

    if (matches) {
      content = matches.reduce((acc, match) => {
        if (!match.match(/```\w+/)) {
          return acc.replace(match, match.replace("```", "```plaintext"));
        }
        return acc;
      }, content);

      const lastMatch = matches[matches.length - 1];
      if (!lastMatch.endsWith("```")) {
        return preprocessLaTeX(content);
      }
    }
    // Add newlines after ]] or ) if there's text immediately following
    content = content.replace(/(\]\]|\))((?!\s|\n|\[|\(|$).)/g, "$1\n$2");

    return (
      preprocessLaTeX(content) + (subQuestion.is_generating ? " [*]() " : "")
    );
  };

  const finalContent = subQuestion.answer
    ? (processContent(subQuestion.answer as string) as string)
    : "";

  const paragraphCallback = useCallback(
    (props: any) => (
      <MemoizedParagraph fontSize={"sm"}>{props.children}</MemoizedParagraph>
    ),
    []
  );

  const anchorCallback = useCallback(
    (props: any) => (
      <MemoizedAnchor
        updatePresentingDocument={setPresentingDocument!}
        docs={subQuestion.context_docs?.top_documents || documents}
      >
        {props.children}
      </MemoizedAnchor>
    ),
    [documents]
  );

  const textCallback = useCallback(
    (props: any) => (
      <span className="text-sm leading-tight">{props.children}</span>
    ),
    []
  );

  const markdownComponents = useMemo(
    () => ({
      a: anchorCallback,
      p: paragraphCallback,
      code: ({ node, className, children }: any) => {
        const codeText = extractCodeText(
          node,
          subQuestion.answer as string,
          children
        );

        return (
          <CodeBlock className={className} codeText={codeText}>
            {children}
          </CodeBlock>
        );
      },
      li: ({ children }: any) => (
        <li className="text-sm leading-tight">{children}</li>
      ),
      ul: ({ children }: any) => (
        <ul className="text-sm leading-tight pl-4 mt-0 mb-2">{children}</ul>
      ),
      ol: ({ children }: any) => (
        <ol className="text-sm leading-tight pl-4 mt-0 mb-2">{children}</ol>
      ),
    }),
    [anchorCallback, paragraphCallback, textCallback, subQuestion.answer]
  );

  useEffect(() => {
    setToggled(!unToggle);
  }, [unToggle]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (toggled) {
      setIsVisible(true);
    } else {
      timer = setTimeout(() => setIsVisible(false), 500);
    }
    return () => clearTimeout(timer);
  }, [toggled]);

  const renderedMarkdown = useMemo(() => {
    return (
      <ReactMarkdown
        className="prose max-w-full text-base"
        components={markdownComponents}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {finalContent}
      </ReactMarkdown>
    );
  }, [finalContent, markdownComponents]);

  return (
    <div className="bg- relative">
      <div
        className={`absolute left-[5px] ${
          isFirst ? "top-[9px]" : "top-0"
        } bottom-0 w-[2px]  bg-neutral-200  ${
          isLast && !toggled ? "h-4" : "h-full"
        }`}
      />
      <div className="flex items-start pb-4">
        <div
          className={`absolute left-0 w-3 h-3 rounded-full mt-[9px] z-10 ${
            subQuestion.answer
              ? "bg-neutral-700"
              : "bg-neutral-700 rotating-circle"
          }`}
        />
        <div className="ml-8 w-full">
          <div
            className="flex items-center py-1 cursor-pointer"
            onClick={() => setToggled(!toggled)}
          >
            <div className="text-black text-base font-medium leading-normal flex-grow">
              {subQuestion.question}
            </div>
            <ChevronDown
              className={`transition-transform duration-500 ease-in-out ${
                toggled ? "rotate-180" : ""
              }`}
              size={16}
            />
          </div>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              toggled ? "max-h-[1000px]" : "max-h-0"
            }`}
          >
            {isVisible && (
              <div
                className={`transform transition-all duration-500 ease-in-out origin-top ${
                  toggled ? "scale-y-100 opacity-100" : "scale-y-95 opacity-0"
                }`}
              >
                <div className="pl-0 pb-2">
                  <div className="mb-4 flex flex-col gap-2">
                    <div className="text-[#4a4a4a] text-xs font-medium leading-normal">
                      Searching
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {subQuestion.sub_queries?.map((query, queryIndex) => (
                        <SourceChip2
                          key={queryIndex}
                          icon={<FiSearch size={10} />}
                          title={query.query}
                          includeTooltip
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mb-4  flex flex-col gap-2">
                    <div className="text-[#4a4a4a] text-xs font-medium leading-normal">
                      Reading
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(subQuestion.context_docs?.top_documents
                        ? subQuestion.context_docs?.top_documents
                        : documents.filter((doc) =>
                            subQuestion.context_docs?.top_documents?.some(
                              (contextDoc) =>
                                contextDoc.document_id === doc.document_id
                            )
                          )
                      )
                        .slice(0, 10)
                        .map((doc, docIndex) => {
                          const truncatedIdentifier =
                            doc.semantic_identifier?.slice(0, 20) || "";
                          return (
                            <SourceChip2
                              includeAnimation
                              onClick={() =>
                                openDocument(doc, setPresentingDocument)
                              }
                              key={docIndex}
                              icon={<ResultIcon doc={doc} size={10} />}
                              title={`${truncatedIdentifier}${
                                truncatedIdentifier.length === 20 ? "..." : ""
                              }`}
                            />
                          );
                        })}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div
                      className="text-[#4a4a4a] cursor-pointer items-center text-xs flex gap-x-1 font-medium leading-normal"
                      onClick={() => setAnalysisToggled(!analysisToggled)}
                    >
                      Analysis
                      <ChevronDown
                        className={`transition-transform duration-200 ${
                          analysisToggled ? "" : "-rotate-90"
                        }`}
                        size={8}
                      />
                    </div>
                    {analysisToggled && (
                      <div className="flex flex-wrap gap-2">
                        {renderedMarkdown}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SubQuestionsDisplay: React.FC<SubQuestionsDisplayProps> = ({
  subQuestions,
  documents,
  toggleDocumentSelection,
  setPresentingDocument,
}) => {
  const { dynamicSubQuestions } = useStreamingMessages(subQuestions);

  return (
    <div className="w-full">
      <style jsx global>{`
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .rotating-circle::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 2px solid transparent;
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: rotate 1s linear infinite;
        }
      `}</style>
      <div className="relative">
        {/* {subQuestions.map((subQuestion, index) => ( */}
        {dynamicSubQuestions.map((subQuestion, index) => (
          // {dynamicSubQuestions.map((subQuestion, index) => (
          <SubQuestionDisplay
            key={index}
            subQuestion={subQuestion}
            documents={documents}
            isLast={index === subQuestions.length - 1}
            isFirst={index === 0}
            setPresentingDocument={setPresentingDocument}
            unToggle={
              subQuestion?.sub_queries == undefined ||
              subQuestion?.sub_queries.length == 0 ||
              (subQuestion?.sub_queries?.length > 0 &&
                (subQuestion.answer == undefined ||
                  subQuestion.answer.length > 3))
              //   subQuestion == undefined &&
              //   subQuestion.answer != undefined &&
              //   !(
              //     dynamicSubQuestions[index + 1] != undefined ||
              //     dynamicSubQuestions[index + 1]?.sub_queries?.length! > 0
              //   )
            }
          />
        ))}
        {dynamicSubQuestions.length < subQuestions.length && (
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      {dynamicSubQuestions.length > 0 && (
        <SourcesDisplay
          toggleDocumentSelection={toggleDocumentSelection}
          documents={documents}
        />
      )}
    </div>
  );
};

export default SubQuestionsDisplay;
