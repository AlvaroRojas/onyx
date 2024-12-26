from typing import Literal

from langgraph.types import Command
from langgraph.types import Send

from onyx.agent_search.core_state import extract_core_fields
from onyx.agent_search.expanded_retrieval.nodes.doc_verification import (
    DocVerificationInput,
)
from onyx.agent_search.expanded_retrieval.states import ExpandedRetrievalState


def verification_kickoff(
    state: ExpandedRetrievalState,
) -> Command[Literal["doc_verification"]]:
    documents = state["retrieved_documents"]
    return Command(
        update={},
        goto=[
            Send(
                node="doc_verification",
                arg=DocVerificationInput(
                    doc_to_verify=doc,
                    question=state["question"],
                    **extract_core_fields(state),
                ),
            )
            for doc in documents
        ],
    )
