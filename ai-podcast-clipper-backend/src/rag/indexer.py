"""
RAG Indexing Pipeline
Production-grade content indexing with chunking, embedding, and vector storage.
"""

import os
import hashlib
from typing import List, Optional, AsyncGenerator
from datetime import datetime

from .schemas import (
    Document,
    ContentChunk,
    SourceType,
    IndexingRequest,
    IndexingResult,
)


class TextChunker:
    """Semantic text chunking with overlap"""
    
    def __init__(
        self,
        chunk_size: int = 512,
        chunk_overlap: int = 50,
        separators: Optional[List[str]] = None
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = separators or ["\n\n", "\n", ". ", " "]
    
    def split(self, text: str) -> List[str]:
        """Split text into chunks using recursive character splitting"""
        chunks = []
        self._split_recursive(text, self.separators, chunks)
        return chunks
    
    def _split_recursive(self, text: str, separators: List[str], chunks: List[str]):
        """Recursively split text by separators"""
        if len(text) <= self.chunk_size:
            if text.strip():
                chunks.append(text.strip())
            return
        
        if not separators:
            # No more separators, force split
            for i in range(0, len(text), self.chunk_size - self.chunk_overlap):
                chunk = text[i:i + self.chunk_size]
                if chunk.strip():
                    chunks.append(chunk.strip())
            return
        
        sep = separators[0]
        parts = text.split(sep)
        
        current_chunk = ""
        for part in parts:
            if len(current_chunk) + len(part) + len(sep) <= self.chunk_size:
                current_chunk += (sep if current_chunk else "") + part
            else:
                if current_chunk.strip():
                    chunks.append(current_chunk.strip())
                current_chunk = part
        
        if current_chunk.strip():
            # Check if remaining chunk is too large
            if len(current_chunk) > self.chunk_size:
                self._split_recursive(current_chunk, separators[1:], chunks)
            else:
                chunks.append(current_chunk.strip())


class EmbeddingService:
    """Embedding generation service"""
    
    def __init__(self, model_name: str = "text-embedding-3-small"):
        self.model_name = model_name
        self._client = None
    
    @property
    def client(self):
        if self._client is None:
            from openai import OpenAI
            self._client = OpenAI()
        return self._client
    
    def embed(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts"""
        if not texts:
            return []
        
        # Batch requests to avoid rate limits
        batch_size = 100
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            response = self.client.embeddings.create(
                model=self.model_name,
                input=batch
            )
            embeddings = [item.embedding for item in response.data]
            all_embeddings.extend(embeddings)
        
        return all_embeddings
    
    async def aembed(self, texts: List[str]) -> List[List[float]]:
        """Async embedding generation"""
        from openai import AsyncOpenAI
        client = AsyncOpenAI()
        
        if not texts:
            return []
        
        response = await client.embeddings.create(
            model=self.model_name,
            input=texts
        )
        return [item.embedding for item in response.data]


class VectorStore:
    """ChromaDB vector store wrapper"""
    
    def __init__(self, collection_name: str = "knowledge_base", persist_dir: str = "/data/vectordb"):
        self.collection_name = collection_name
        self.persist_dir = persist_dir
        self._client = None
        self._collection = None
    
    @property
    def client(self):
        if self._client is None:
            import chromadb
            self._client = chromadb.PersistentClient(path=self.persist_dir)
        return self._client
    
    @property
    def collection(self):
        if self._collection is None:
            self._collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
        return self._collection
    
    def add(
        self,
        ids: List[str],
        documents: List[str],
        embeddings: List[List[float]],
        metadatas: Optional[List[dict]] = None
    ):
        """Add documents to the vector store"""
        self.collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas or [{}] * len(ids)
        )
    
    def query(
        self,
        query_embedding: List[float],
        n_results: int = 5,
        where: Optional[dict] = None
    ) -> dict:
        """Query the vector store"""
        return self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where,
            include=["documents", "metadatas", "distances"]
        )
    
    def delete(self, ids: List[str]):
        """Delete documents by ID"""
        self.collection.delete(ids=ids)
    
    def count(self) -> int:
        """Get document count"""
        return self.collection.count()


class ProductionIndexer:
    """Production-grade indexing pipeline"""
    
    def __init__(
        self,
        chunk_size: int = 512,
        chunk_overlap: int = 50,
        embedding_model: str = "text-embedding-3-small",
        persist_dir: str = "/data/vectordb"
    ):
        self.chunker = TextChunker(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        self.embedder = EmbeddingService(model_name=embedding_model)
        self.store = VectorStore(persist_dir=persist_dir)
    
    def _generate_chunk_id(self, doc_id: str, chunk_index: int, content: str) -> str:
        """Generate deterministic chunk ID"""
        hash_input = f"{doc_id}_{chunk_index}_{content[:50]}"
        return hashlib.md5(hash_input.encode()).hexdigest()[:16]
    
    def index_document(self, doc: Document) -> List[ContentChunk]:
        """Index a single document"""
        # Split into chunks
        text_chunks = self.chunker.split(doc.content)
        
        # Create ContentChunk objects
        chunks = []
        for i, text in enumerate(text_chunks):
            chunk = ContentChunk(
                id=self._generate_chunk_id(doc.id, i, text),
                content=text,
                source_type=doc.source_type,
                source_id=doc.id,
                metadata={
                    "title": doc.title,
                    "tags": doc.tags,
                    "chunk_index": i,
                    "total_chunks": len(text_chunks),
                    **doc.metadata
                }
            )
            chunks.append(chunk)
        
        # Generate embeddings
        texts = [c.content for c in chunks]
        embeddings = self.embedder.embed(texts)
        
        # Update chunks with embeddings
        for chunk, embedding in zip(chunks, embeddings):
            chunk.embedding = embedding
        
        # Store in vector DB
        self.store.add(
            ids=[c.id for c in chunks],
            documents=[c.content for c in chunks],
            embeddings=embeddings,
            metadatas=[{
                "source_type": c.source_type.value,
                "source_id": c.source_id,
                **c.metadata
            } for c in chunks]
        )
        
        return chunks
    
    def index_batch(self, request: IndexingRequest) -> IndexingResult:
        """Index a batch of documents"""
        start_time = datetime.utcnow()
        
        indexed = 0
        failed = 0
        errors = []
        
        for doc in request.documents:
            try:
                self.index_document(doc)
                indexed += 1
            except Exception as e:
                failed += 1
                errors.append(f"Failed to index {doc.id}: {str(e)}")
        
        latency = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        return IndexingResult(
            success=failed == 0,
            documents_indexed=indexed,
            documents_failed=failed,
            errors=errors,
            latency_ms=latency
        )
    
    async def aindex_document(self, doc: Document) -> List[ContentChunk]:
        """Async index a single document"""
        # Split into chunks
        text_chunks = self.chunker.split(doc.content)
        
        # Create ContentChunk objects
        chunks = []
        for i, text in enumerate(text_chunks):
            chunk = ContentChunk(
                id=self._generate_chunk_id(doc.id, i, text),
                content=text,
                source_type=doc.source_type,
                source_id=doc.id,
                metadata={
                    "title": doc.title,
                    "tags": doc.tags,
                    "chunk_index": i,
                    "total_chunks": len(text_chunks),
                    **doc.metadata
                }
            )
            chunks.append(chunk)
        
        # Generate embeddings async
        texts = [c.content for c in chunks]
        embeddings = await self.embedder.aembed(texts)
        
        # Update chunks with embeddings
        for chunk, embedding in zip(chunks, embeddings):
            chunk.embedding = embedding
        
        # Store in vector DB
        self.store.add(
            ids=[c.id for c in chunks],
            documents=[c.content for c in chunks],
            embeddings=embeddings,
            metadatas=[{
                "source_type": c.source_type.value,
                "source_id": c.source_id,
                **c.metadata
            } for c in chunks]
        )
        
        return chunks
