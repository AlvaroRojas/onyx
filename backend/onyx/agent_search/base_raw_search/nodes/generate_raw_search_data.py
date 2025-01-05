from onyx.agent_search.core_state import CoreState
from onyx.agent_search.expanded_retrieval.states import ExpandedRetrievalInput
from onyx.utils.logger import setup_logger

logger = setup_logger()


def generate_raw_search_data(state: CoreState) -> ExpandedRetrievalInput:
    logger.info("generate_raw_search_data")
    return ExpandedRetrievalInput(
        subgraph_config=state["config"],
        subgraph_primary_llm=state["primary_llm"],
        subgraph_fast_llm=state["fast_llm"],
        subgraph_db_session=state["db_session"],
        question=state["config"].search_request.query,
        base_search=True,
        subgraph_search_tool=state["search_tool"],
    )
