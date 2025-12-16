"""
RAG System Pydantic Models
Production-grade validated schemas for RAG pipeline operations.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Literal, Optional
from datetime import datetime
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================

class SourceType(str, Enum):
    VIDEO = "video"
    TRANSCRIPT = "transcript"
    PROMPT = "prompt"
    EFFECT = "effect"
    TEMPLATE = "template"
    ASSET = "asset"


class NodeType(str, Enum):
    VIDEO = "video"
    CREATOR = "creator"
    EFFECT = "effect"
    TAG = "tag"
    PROMPT = "prompt"


class RelationshipType(str, Enum):
    CREATED_BY = "created_by"
    HAS_TAG = "has_tag"
    USES_EFFECT = "uses_effect"
    SUGGESTED_FOR = "suggested_for"
    GENERATES = "generates"
    FOLLOWS = "follows"


# ============================================================================
# CONTENT SCHEMAS
# ============================================================================

class ContentChunk(BaseModel):
    """Validated chunk for RAG ingestion"""
    id: str = Field(..., min_length=1, description="Unique chunk identifier")
    content: str = Field(..., min_length=10, max_length=2000, description="Text content")
    source_type: SourceType = Field(..., description="Type of source content")
    source_id: str = Field(..., description="ID of the source document")
    metadata: dict = Field(default_factory=dict, description="Additional metadata")
    embedding: Optional[list[float]] = Field(None, description="Embedding vector")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    @field_validator("content")
    @classmethod
    def clean_content(cls, v: str) -> str:
        """Normalize whitespace in content"""
        return " ".join(v.split())
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "chunk_001",
                "content": "This is a sample transcript segment about AI video editing.",
                "source_type": "transcript",
                "source_id": "video_123",
                "metadata": {"speaker": "host", "timestamp": 123.45}
            }
        }


class Document(BaseModel):
    """Full document for indexing"""
    id: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    source_type: SourceType
    metadata: dict = Field(default_factory=dict)
    tags: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# QUERY SCHEMAS
# ============================================================================

class QueryRequest(BaseModel):
    """Validated query for RAG retrieval"""
    query: str = Field(..., min_length=3, max_length=500, description="Search query")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of results")
    filter_types: list[SourceType] = Field(default_factory=list, description="Filter by source types")
    use_reranking: bool = Field(default=True, description="Enable cross-encoder reranking")
    min_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Minimum similarity score")
    include_metadata: bool = Field(default=True, description="Include metadata in results")
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "best transitions for viral videos",
                "top_k": 5,
                "filter_types": ["effect", "template"],
                "use_reranking": True
            }
        }


class RetrievalResult(BaseModel):
    """Single retrieval result"""
    chunk: ContentChunk
    score: float = Field(..., ge=0.0, le=1.0)
    rerank_score: Optional[float] = Field(None, ge=0.0, le=1.0)


class RAGResponse(BaseModel):
    """Structured output from RAG pipeline"""
    answer: str = Field(..., description="Generated answer")
    sources: list[RetrievalResult] = Field(default_factory=list)
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    latency_ms: int = Field(..., ge=0, description="Processing time in milliseconds")
    query: str = Field(..., description="Original query")
    
    class Config:
        json_schema_extra = {
            "example": {
                "answer": "For viral videos, consider using quick-cut transitions...",
                "sources": [],
                "confidence": 0.85,
                "latency_ms": 234,
                "query": "best transitions for viral videos"
            }
        }


# ============================================================================
# PROMPT SCHEMAS
# ============================================================================

class PromptTemplate(BaseModel):
    """Validated prompt template for LLM"""
    name: str = Field(..., min_length=1, max_length=50)
    system_prompt: str = Field(..., min_length=10, max_length=2000)
    user_template: str = Field(..., min_length=10, max_length=2000)
    output_schema: Optional[dict] = Field(None, description="Expected output JSON schema")
    max_tokens: int = Field(default=1000, ge=100, le=4000)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    model: str = Field(default="gpt-4o-mini")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "effect_suggestion",
                "system_prompt": "You are an expert video editor AI assistant.",
                "user_template": "Given the video description: {query}\n\nSuggest effects from: {context}",
                "max_tokens": 1000,
                "temperature": 0.5
            }
        }


# ============================================================================
# KNOWLEDGE GRAPH SCHEMAS
# ============================================================================

class GraphNode(BaseModel):
    """Knowledge graph node"""
    id: str = Field(..., min_length=1)
    type: NodeType
    properties: dict = Field(default_factory=dict)
    embedding: Optional[list[float]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GraphEdge(BaseModel):
    """Knowledge graph edge"""
    id: str = Field(..., min_length=1)
    source_id: str = Field(..., min_length=1)
    target_id: str = Field(..., min_length=1)
    relationship: RelationshipType
    weight: float = Field(default=1.0, ge=0.0, le=10.0)
    properties: dict = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GraphQuery(BaseModel):
    """Query for graph traversal"""
    start_node_id: str
    relationship_types: list[RelationshipType] = Field(default_factory=list)
    max_depth: int = Field(default=2, ge=1, le=5)
    limit: int = Field(default=10, ge=1, le=100)


class GraphTraversalResult(BaseModel):
    """Result from graph traversal"""
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    paths: list[list[str]] = Field(default_factory=list, description="Node ID paths")


# ============================================================================
# SUGGESTION SCHEMAS
# ============================================================================

class EffectSuggestion(BaseModel):
    """Suggested effect for video"""
    effect_id: str
    name: str
    reason: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    preview_url: Optional[str] = None


class SuggestionResponse(BaseModel):
    """Response with multiple suggestions"""
    suggestions: list[EffectSuggestion]
    query_context: str
    latency_ms: int


# ============================================================================
# INDEXING SCHEMAS
# ============================================================================

class IndexingRequest(BaseModel):
    """Request to index new content"""
    documents: list[Document]
    batch_size: int = Field(default=100, ge=1, le=1000)
    update_existing: bool = Field(default=False)


class IndexingResult(BaseModel):
    """Result of indexing operation"""
    success: bool
    documents_indexed: int
    documents_failed: int
    errors: list[str] = Field(default_factory=list)
    latency_ms: int
