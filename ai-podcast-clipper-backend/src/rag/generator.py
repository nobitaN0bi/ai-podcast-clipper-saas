"""
RAG Generation Pipeline
Production-grade LLM generation with prompt templates and structured output.
"""

from typing import List, Optional, Type, TypeVar
from datetime import datetime
import json

from pydantic import BaseModel

from .schemas import (
    PromptTemplate,
    QueryRequest,
    RetrievalResult,
    RAGResponse,
    EffectSuggestion,
    SuggestionResponse,
)
from .retriever import ProductionRetriever


T = TypeVar("T", bound=BaseModel)


class PromptRegistry:
    """Registry of prompt templates"""
    
    def __init__(self):
        self._templates: dict[str, PromptTemplate] = {}
        self._register_defaults()
    
    def _register_defaults(self):
        """Register default prompt templates"""
        
        # Effect suggestion prompt
        self.register(PromptTemplate(
            name="effect_suggestion",
            system_prompt="""You are an expert video editor AI assistant specialized in viral content creation.
            
Your task is to suggest video effects, transitions, and enhancements that will maximize engagement and viral potential.

Guidelines:
- Focus on effects that match the content tone and audience
- Prioritize mobile-first viewing (vertical video optimization)
- Consider platform-specific best practices (TikTok, Instagram Reels, YouTube Shorts)
- Suggest specific timing and placement for effects

Always provide actionable, specific recommendations with clear reasoning.""",
            user_template="""Video Context:
{query}

Available Effects and Templates:
{context}

Based on the video context and available effects, suggest 3-5 effects that would enhance this video's viral potential.

For each suggestion, provide:
1. Effect name
2. Why it fits this content
3. When/where to apply it
4. Expected engagement impact

Respond in JSON format with an array of suggestions.""",
            output_schema={
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "effect_id": {"type": "string"},
                        "name": {"type": "string"},
                        "reason": {"type": "string"},
                        "confidence": {"type": "number"}
                    }
                }
            },
            max_tokens=1500,
            temperature=0.5,
            model="gpt-4o-mini"
        ))
        
        # Viral analysis prompt
        self.register(PromptTemplate(
            name="viral_analysis",
            system_prompt="""You are a viral content analyst specializing in short-form video.

Your expertise includes:
- Hook writing and opening frames
- Retention optimization
- Emotional triggers and storytelling
- Platform algorithm optimization
- Caption and CTA strategies

Analyze content objectively and provide actionable insights.""",
            user_template="""Transcript:
{query}

Similar Viral Content Patterns:
{context}

Analyze this content for viral potential and provide:
1. Overall viral score (0-100)
2. Top 3 strengths
3. Top 3 areas for improvement
4. Specific recommendations

Be specific and actionable in your analysis.""",
            max_tokens=2000,
            temperature=0.7,
            model="gpt-4o-mini"
        ))
        
        # Content Q&A prompt
        self.register(PromptTemplate(
            name="content_qa",
            system_prompt="""You are a helpful AI assistant with access to a knowledge base about video editing, content creation, and viral marketing.

Answer questions accurately based on the provided context. If the context doesn't contain relevant information, say so clearly.

Be concise but thorough. Cite specific sources when relevant.""",
            user_template="""Question: {query}

Relevant Knowledge:
{context}

Provide a helpful, accurate answer based on the knowledge above.""",
            max_tokens=1000,
            temperature=0.3,
            model="gpt-4o-mini"
        ))
    
    def register(self, template: PromptTemplate):
        """Register a prompt template"""
        self._templates[template.name] = template
    
    def get(self, name: str) -> Optional[PromptTemplate]:
        """Get a prompt template by name"""
        return self._templates.get(name)
    
    def list_templates(self) -> List[str]:
        """List all registered template names"""
        return list(self._templates.keys())


class ProductionGenerator:
    """Production-grade LLM generation service"""
    
    def __init__(self, default_model: str = "gpt-4o-mini"):
        self.default_model = default_model
        self.prompts = PromptRegistry()
        self._client = None
    
    @property
    def client(self):
        if self._client is None:
            from openai import OpenAI
            self._client = OpenAI()
        return self._client
    
    def _format_context(self, results: List[RetrievalResult]) -> str:
        """Format retrieval results as context string"""
        if not results:
            return "No relevant context found."
        
        context_parts = []
        for i, result in enumerate(results, 1):
            source_info = f"[Source: {result.chunk.source_type.value}]"
            score_info = f"[Relevance: {result.score:.2f}]"
            context_parts.append(f"{i}. {source_info} {score_info}\n{result.chunk.content}")
        
        return "\n\n".join(context_parts)
    
    def generate(
        self,
        query: str,
        context: List[RetrievalResult],
        template_name: str = "content_qa",
        response_model: Optional[Type[T]] = None
    ) -> RAGResponse:
        """
        Generate a response using the specified template.
        Optionally parse into a Pydantic model for structured output.
        """
        start_time = datetime.utcnow()
        
        template = self.prompts.get(template_name)
        if not template:
            raise ValueError(f"Unknown template: {template_name}")
        
        context_str = self._format_context(context)
        
        user_message = template.user_template.format(
            query=query,
            context=context_str
        )
        
        # Generate with OpenAI
        response = self.client.chat.completions.create(
            model=template.model,
            messages=[
                {"role": "system", "content": template.system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=template.temperature,
            max_tokens=template.max_tokens
        )
        
        answer = response.choices[0].message.content or ""
        
        # Calculate confidence based on context quality
        confidence = self._calculate_confidence(context)
        
        latency = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        return RAGResponse(
            answer=answer,
            sources=context,
            confidence=confidence,
            latency_ms=latency,
            query=query
        )
    
    def generate_structured(
        self,
        query: str,
        context: List[RetrievalResult],
        template_name: str,
        response_model: Type[T]
    ) -> T:
        """Generate with structured output parsing"""
        try:
            import instructor
            client = instructor.from_openai(self.client)
        except ImportError:
            raise ImportError("Install instructor for structured output: pip install instructor")
        
        template = self.prompts.get(template_name)
        if not template:
            raise ValueError(f"Unknown template: {template_name}")
        
        context_str = self._format_context(context)
        user_message = template.user_template.format(
            query=query,
            context=context_str
        )
        
        return client.chat.completions.create(
            model=template.model,
            response_model=response_model,
            messages=[
                {"role": "system", "content": template.system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=template.temperature,
            max_tokens=template.max_tokens
        )
    
    def _calculate_confidence(self, context: List[RetrievalResult]) -> float:
        """Calculate confidence score based on retrieval quality"""
        if not context:
            return 0.3  # Low confidence without context
        
        # Use rerank scores if available, otherwise similarity scores
        scores = []
        for result in context:
            if result.rerank_score is not None:
                scores.append(result.rerank_score)
            else:
                scores.append(result.score)
        
        if not scores:
            return 0.5
        
        # Weighted average (top results matter more)
        weights = [1.0 / (i + 1) for i in range(len(scores))]
        weighted_sum = sum(s * w for s, w in zip(scores, weights))
        weight_total = sum(weights)
        
        return min(1.0, max(0.0, weighted_sum / weight_total))
    
    async def agenerate(
        self,
        query: str,
        context: List[RetrievalResult],
        template_name: str = "content_qa"
    ) -> RAGResponse:
        """Async generation"""
        from openai import AsyncOpenAI
        client = AsyncOpenAI()
        
        start_time = datetime.utcnow()
        
        template = self.prompts.get(template_name)
        if not template:
            raise ValueError(f"Unknown template: {template_name}")
        
        context_str = self._format_context(context)
        user_message = template.user_template.format(
            query=query,
            context=context_str
        )
        
        response = await client.chat.completions.create(
            model=template.model,
            messages=[
                {"role": "system", "content": template.system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=template.temperature,
            max_tokens=template.max_tokens
        )
        
        answer = response.choices[0].message.content or ""
        confidence = self._calculate_confidence(context)
        latency = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        return RAGResponse(
            answer=answer,
            sources=context,
            confidence=confidence,
            latency_ms=latency,
            query=query
        )


class RAGPipeline:
    """Complete RAG pipeline combining retrieval and generation"""
    
    def __init__(
        self,
        embedding_model: str = "text-embedding-3-small",
        reranker_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2",
        generation_model: str = "gpt-4o-mini",
        persist_dir: str = "/data/vectordb"
    ):
        self.retriever = ProductionRetriever(
            embedding_model=embedding_model,
            reranker_model=reranker_model,
            persist_dir=persist_dir
        )
        self.generator = ProductionGenerator(default_model=generation_model)
    
    def query(
        self,
        query: str,
        top_k: int = 5,
        template_name: str = "content_qa",
        use_reranking: bool = True
    ) -> RAGResponse:
        """Execute full RAG pipeline"""
        # Retrieve
        request = QueryRequest(
            query=query,
            top_k=top_k,
            use_reranking=use_reranking
        )
        results = self.retriever.retrieve(request)
        
        # Generate
        return self.generator.generate(
            query=query,
            context=results,
            template_name=template_name
        )
    
    async def aquery(
        self,
        query: str,
        top_k: int = 5,
        template_name: str = "content_qa",
        use_reranking: bool = True
    ) -> RAGResponse:
        """Async RAG pipeline"""
        request = QueryRequest(
            query=query,
            top_k=top_k,
            use_reranking=use_reranking
        )
        results = await self.retriever.aretrieve(request)
        return await self.generator.agenerate(
            query=query,
            context=results,
            template_name=template_name
        )
    
    def suggest_effects(self, video_description: str, top_k: int = 10) -> SuggestionResponse:
        """Suggest effects for a video"""
        start_time = datetime.utcnow()
        
        # Retrieve effects and templates
        request = QueryRequest(
            query=video_description,
            top_k=top_k,
            filter_types=["effect", "template"],
            use_reranking=True
        )
        results = self.retriever.retrieve(request)
        
        # Generate suggestions
        response = self.generator.generate(
            query=video_description,
            context=results,
            template_name="effect_suggestion"
        )
        
        # Parse suggestions (basic JSON extraction)
        suggestions = []
        try:
            # Try to extract JSON from response
            answer = response.answer
            if "```json" in answer:
                json_str = answer.split("```json")[1].split("```")[0]
            elif "```" in answer:
                json_str = answer.split("```")[1].split("```")[0]
            else:
                json_str = answer
            
            parsed = json.loads(json_str)
            if isinstance(parsed, list):
                for item in parsed:
                    suggestions.append(EffectSuggestion(
                        effect_id=item.get("effect_id", "unknown"),
                        name=item.get("name", "Unknown Effect"),
                        reason=item.get("reason", ""),
                        confidence=float(item.get("confidence", 0.5))
                    ))
        except (json.JSONDecodeError, KeyError, IndexError):
            # Fallback: return empty suggestions
            pass
        
        latency = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        return SuggestionResponse(
            suggestions=suggestions,
            query_context=video_description,
            latency_ms=latency
        )
