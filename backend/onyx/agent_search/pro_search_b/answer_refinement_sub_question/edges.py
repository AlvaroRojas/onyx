from collections.abc import Hashable

from langgraph.types import Send

from onyx.agent_search.pro_search_b.answer_initial_sub_question.states import (
    AnswerQuestionInput,
)
from onyx.agent_search.pro_search_b.expanded_retrieval.states import (
    ExpandedRetrievalInput,
)
from onyx.utils.logger import setup_logger

logger = setup_logger()


def send_to_expanded_refined_retrieval(state: AnswerQuestionInput) -> Send | Hashable:
    logger.debug("sending to expanded retrieval for follow up question via edge")

    return Send(
        "refined_sub_question_expanded_retrieval",
        ExpandedRetrievalInput(
            question=state["question"],
            sub_question_id=state["question_id"],
            base_search=False,
        ),
    )
