"""
RAG Retrieval Service
Production-grade retrieval with similarity search and cross-encoder reranking.
"""

from typing import List, Optional
from datetime import datetime

from .schemas import (
    QueryRequest,
    ContentChunk,
    RetrievalResult,
    SourceType,
)
from .indexer import EmbeddingService, VectorStore


class CrossEncoderReranker:
    """Cross-encoder for reranking results"""
    
    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        self.model_name = model_name
        self._model = None
    
    @property
    def model(self):
        if self._model is None:
            from sentence_transformers import CrossEncoder
            self._model = CrossEncoder(self.model_name)
        return self._model
    
    def rerank(
        self,
        query: str,
        documents: List[str],
        top_k: Optional[int] = None
    ) -> List[tuple[int, float]]:
        """
        Rerank documents by relevance to query.
        Returns list of (original_index, score) tuples sorted by score descending.
        """
        if not documents:
            return []
        
        pairs = [(query, doc) for doc in documents]
        scores = self.model.predict(pairs)
        
        indexed_scores = list(enumerate(scores))
        indexed_scores.sort(key=lambda x: x[1], reverse=True)
        
        if top_k:
            indexed_scores = indexed_scores[:top_k]
        
        return indexed_scores


class ProductionRetriever:
    """Production-grade retrieval service"""
    
    def __init__(
        self,
        embedding_model: str = "text-embedding-3-small",
        reranker_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2",
        persist_dir: str = "/data/vectordb"
    ):
        self.embedder = EmbeddingService(model_name=embedding_model)
        self.reranker = CrossEncoderReranker(model_name=reranker_model)
        self.store = VectorStore(persist_dir=persist_dir)
    
    def _build_where_filter(self, filter_types: List[SourceType]) -> Optional[dict]:
        """Build ChromaDB where filter"""
        if not filter_types:
            return None
        
        type_values = [t.value for t in filter_types]
        if len(type_values) == 1:
            return {"source_type": type_values[0]}
        return {"source_type": {"$in": type_values}}
    
    def retrieve(self, request: QueryRequest) -> List[RetrievalResult]:
        """
        Retrieve relevant chunks for a query.
        Uses embedding similarity search followed by optional cross-encoder reranking.
        """
        start_time = datetime.utcnow()
        
        # Step 1: Embed query
        query_embeddings = self.embedder.embed([request.query])
        if not query_embeddings:
            return []
        query_embedding = query_embeddings[0]
        
        # Step 2: Similarity search (over-fetch for reranking)
        fetch_k = request.top_k * 3 if request.use_reranking else request.top_k
        where_filter = self._build_where_filter(request.filter_types)
        
        results = self.store.query(
            query_embedding=query_embedding,
            n_results=fetch_k,
            where=where_filter
        )
        
        if not results or not results.get("documents") or not results["documents"][0]:
            return []
        
        documents = results["documents"][0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]
        
        # Convert distances to similarity scores (ChromaDB uses L2 distance)
        # For cosine space, distance is 1 - cosine_similarity
        similarities = [1 - d for d in distances]
        
        # Step 3: Create initial results
        initial_results = []
        for i, (doc, meta, sim) in enumerate(zip(documents, metadatas, similarities)):
            if sim < request.min_score:
                continue
            
            chunk = ContentChunk(
                id=meta.get("chunk_id", f"chunk_{i}"),
                content=doc,
                source_type=SourceType(meta.get("source_type", "transcript")),
                source_id=meta.get("source_id", "unknown"),
                metadata=meta
            )
            
            initial_results.append(RetrievalResult(
                chunk=chunk,
                score=max(0, min(1, sim)),  # Clamp to [0, 1]
                rerank_score=None
            ))
        
        if not initial_results:
            return []
        
        # Step 4: Reranking (optional)
        if request.use_reranking and len(initial_results) > 1:
            docs_to_rerank = [r.chunk.content for r in initial_results]
            reranked = self.reranker.rerank(
                query=request.query,
                documents=docs_to_rerank,
                top_k=request.top_k
            )
            
            final_results = []
            for orig_idx, rerank_score in reranked:
                result = initial_results[orig_idx]
                result.rerank_score = float(rerank_score)
                final_results.append(result)
            
            return final_results[:request.top_k]
        
        # Sort by similarity score
        initial_results.sort(key=lambda x: x.score, reverse=True)
        return initial_results[:request.top_k]
    
    async def aretrieve(self, request: QueryRequest) -> List[RetrievalResult]:
        """Async retrieval (embedding is async, rest is sync)"""
        # Embed query async
        query_embeddings = await self.embedder.aembed([request.query])
        if not query_embeddings:
            return []
        query_embedding = query_embeddings[0]
        
        # Rest is sync (ChromaDB doesn't have async API)
        fetch_k = request.top_k * 3 if request.use_reranking else request.top_k
        where_filter = self._build_where_filter(request.filter_types)
        
        results = self.store.query(
            query_embedding=query_embedding,
            n_results=fetch_k,
            where=where_filter
        )
        
        if not results or not results.get("documents") or not results["documents"][0]:
            return []
        
        documents = results["documents"][0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]
        
        similarities = [1 - d for d in distances]
        
        initial_results = []
        for i, (doc, meta, sim) in enumerate(zip(documents, metadatas, similarities)):
            if sim < request.min_score:
                continue
            
            chunk = ContentChunk(
                id=meta.get("chunk_id", f"chunk_{i}"),
                content=doc,
                source_type=SourceType(meta.get("source_type", "transcript")),
                source_id=meta.get("source_id", "unknown"),
                metadata=meta
            )
            
            initial_results.append(RetrievalResult(
                chunk=chunk,
                score=max(0, min(1, sim)),
                rerank_score=None
            ))
        
        if not initial_results:
            return []
        
        if request.use_reranking and len(initial_results) > 1:
            docs_to_rerank = [r.chunk.content for r in initial_results]
            reranked = self.reranker.rerank(
                query=request.query,
                documents=docs_to_rerank,
                top_k=request.top_k
            )
            
            final_results = []
            for orig_idx, rerank_score in reranked:
                result = initial_results[orig_idx]
                result.rerank_score = float(rerank_score)
                final_results.append(result)
            
            return final_results[:request.top_k]
        
        initial_results.sort(key=lambda x: x.score, reverse=True)
        return initial_results[:request.top_k]
