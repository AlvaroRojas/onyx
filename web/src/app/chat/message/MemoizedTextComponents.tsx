import {
  Citation,
  QuestionCardProps,
  DocumentCardProps,
} from "@/components/search/results/Citation";
import { LoadedOnyxDocument, OnyxDocument } from "@/lib/search/interfaces";
import React, { memo } from "react";
import isEqual from "lodash/isEqual";
import { SourceIcon } from "@/components/SourceIcon";
import { WebResultIcon } from "@/components/WebResultIcon";
import { SubQuestionDetail } from "../interfaces";
import { ValidSources } from "@/lib/types";

export const MemoizedAnchor = memo(
  ({
    docs,
    subQuestions,
    openQuestion,
    updatePresentingDocument,
    children,
  }: {
    subQuestions?: SubQuestionDetail[];
    openQuestion?: (question: SubQuestionDetail) => void;
    docs?: OnyxDocument[] | null;
    updatePresentingDocument: (doc: OnyxDocument) => void;
    children: React.ReactNode;
  }): JSX.Element => {
    const value = children?.toString();
    // return <></>
    if (value?.startsWith("[") && value?.endsWith("]")) {
      const match = value.match(/\[(D|Q)?(\d+)\]/);
      console.log("match", match);

      if (match) {
        const isSubQuestion = match[1] === "Q";
        const isDocument = !isSubQuestion;

        // Fix: parseInt now uses match[2], which is the numeric part
        const index = parseInt(match[2], 10) - 1;

        const associatedDoc = isDocument ? docs?.[index] : null;
        const associatedSubQuestion = isSubQuestion
          ? subQuestions?.[index]
          : undefined;

        if (!associatedDoc && !associatedSubQuestion) {
          return (
            <>
              [{docs?.length}]{isSubQuestion ? "Q" : "D"}
              {children}
            </>
          );
        }

        let icon: React.ReactNode = null;
        if (associatedDoc?.source_type === "web") {
          icon = <WebResultIcon url={associatedDoc.link} />;
        } else {
          icon = (
            <SourceIcon
              sourceType={associatedDoc?.source_type as ValidSources}
              iconSize={18}
            />
          );
        }

        return (
          <MemoizedLink
            updatePresentingDocument={updatePresentingDocument}
            document={
              associatedDoc
                ? {
                    ...associatedDoc,
                    icon,
                    link: associatedDoc.link,
                  }
                : undefined
            }
            question={associatedSubQuestion}
            openQuestion={openQuestion}
          >
            {children}
          </MemoizedLink>
        );
      }
    }
    return (
      <MemoizedLink updatePresentingDocument={updatePresentingDocument}>
        {children}
      </MemoizedLink>
    );
  }
);
export const MemoizedLink = memo(
  ({
    node,
    document,
    updatePresentingDocument,
    question,
    openQuestion,
    ...rest
  }: Partial<DocumentCardProps & QuestionCardProps> & {
    node?: any;
    [key: string]: any;
  }) => {
    const value = rest.children;
    const questionCardProps: QuestionCardProps | undefined =
      question && openQuestion
        ? {
            question: question,
            openQuestion: openQuestion,
          }
        : undefined;

    const documentCardProps: DocumentCardProps | undefined =
      document && document.link && updatePresentingDocument
        ? {
            url: document.link,
            icon: document.icon as unknown as React.ReactNode,
            document: document as LoadedOnyxDocument,
            updatePresentingDocument: updatePresentingDocument!,
          }
        : undefined;

    if (value?.toString().startsWith("*")) {
      return (
        <div className="flex-none bg-background-800 inline-block rounded-full h-3 w-3 ml-2" />
      );
    } else if (value?.toString().startsWith("[")) {
      return (
        <>
          {documentCardProps ? (
            <Citation document_info={documentCardProps}>
              {rest.children}
            </Citation>
          ) : (
            <Citation question_info={questionCardProps}>
              {rest.children}
            </Citation>
          )}
        </>
      );
    }

    return (
      <a
        onMouseDown={() => rest.href && window.open(rest.href, "_blank")}
        className="cursor-pointer text-link hover:text-link-hover"
      >
        {rest.children}
      </a>
    );
  }
);

export const MemoizedParagraph = memo(
  function MemoizedParagraph({ children, fontSize }: any) {
    return (
      <p
        className={`text-default my-0 ${
          fontSize === "sm" ? "leading-tight text-sm" : ""
        }`}
      >
        {children}
      </p>
    );
  },
  (prevProps, nextProps) => {
    const areEqual = isEqual(prevProps.children, nextProps.children);
    return areEqual;
  }
);

MemoizedAnchor.displayName = "MemoizedAnchor";
MemoizedLink.displayName = "MemoizedLink";
MemoizedParagraph.displayName = "MemoizedParagraph";
