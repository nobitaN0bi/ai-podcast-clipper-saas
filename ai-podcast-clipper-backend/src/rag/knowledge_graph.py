"""
Agentic Knowledge Graph
Graph-based context expansion for enhanced RAG retrieval.
"""

from typing import List, Optional, Set
from datetime import datetime
from collections import defaultdict

from .schemas import (
    GraphNode,
    GraphEdge,
    GraphQuery,
    GraphTraversalResult,
    NodeType,
    RelationshipType,
)


class InMemoryGraphStore:
    """In-memory graph store for development/testing"""
    
    def __init__(self):
        self.nodes: dict[str, GraphNode] = {}
        self.edges: dict[str, GraphEdge] = {}
        self.adjacency: dict[str, List[str]] = defaultdict(list)  # node_id -> [edge_ids]
        self.reverse_adjacency: dict[str, List[str]] = defaultdict(list)  # target_id -> [edge_ids]
    
    def add_node(self, node: GraphNode) -> str:
        """Add a node to the graph"""
        self.nodes[node.id] = node
        return node.id
    
    def add_edge(self, edge: GraphEdge) -> str:
        """Add an edge to the graph"""
        self.edges[edge.id] = edge
        self.adjacency[edge.source_id].append(edge.id)
        self.reverse_adjacency[edge.target_id].append(edge.id)
        return edge.id
    
    def get_node(self, node_id: str) -> Optional[GraphNode]:
        """Get a node by ID"""
        return self.nodes.get(node_id)
    
    def get_edge(self, edge_id: str) -> Optional[GraphEdge]:
        """Get an edge by ID"""
        return self.edges.get(edge_id)
    
    def get_outgoing_edges(self, node_id: str) -> List[GraphEdge]:
        """Get all outgoing edges from a node"""
        edge_ids = self.adjacency.get(node_id, [])
        return [self.edges[eid] for eid in edge_ids if eid in self.edges]
    
    def get_incoming_edges(self, node_id: str) -> List[GraphEdge]:
        """Get all incoming edges to a node"""
        edge_ids = self.reverse_adjacency.get(node_id, [])
        return [self.edges[eid] for eid in edge_ids if eid in self.edges]
    
    def get_neighbors(self, node_id: str, relationship_types: Optional[List[RelationshipType]] = None) -> List[GraphNode]:
        """Get neighboring nodes"""
        edges = self.get_outgoing_edges(node_id)
        
        if relationship_types:
            edges = [e for e in edges if e.relationship in relationship_types]
        
        neighbor_ids = [e.target_id for e in edges]
        return [self.nodes[nid] for nid in neighbor_ids if nid in self.nodes]
    
    def count_nodes(self) -> int:
        return len(self.nodes)
    
    def count_edges(self) -> int:
        return len(self.edges)


class KnowledgeGraph:
    """Agentic Knowledge Graph for context expansion"""
    
    def __init__(self, store: Optional[InMemoryGraphStore] = None):
        self.store = store or InMemoryGraphStore()
    
    def add_video(
        self,
        video_id: str,
        creator_id: str,
        tags: List[str],
        effects: List[str],
        embedding: Optional[List[float]] = None
    ) -> GraphNode:
        """Add a video node with relationships"""
        # Create video node
        video_node = GraphNode(
            id=video_id,
            type=NodeType.VIDEO,
            properties={"creator_id": creator_id},
            embedding=embedding
        )
        self.store.add_node(video_node)
        
        # Create creator relationship
        self.store.add_edge(GraphEdge(
            id=f"{video_id}_created_by_{creator_id}",
            source_id=video_id,
            target_id=creator_id,
            relationship=RelationshipType.CREATED_BY
        ))
        
        # Create tag relationships
        for tag in tags:
            tag_node_id = f"tag_{tag.lower().replace(' ', '_')}"
            if not self.store.get_node(tag_node_id):
                self.store.add_node(GraphNode(
                    id=tag_node_id,
                    type=NodeType.TAG,
                    properties={"name": tag}
                ))
            
            self.store.add_edge(GraphEdge(
                id=f"{video_id}_has_tag_{tag_node_id}",
                source_id=video_id,
                target_id=tag_node_id,
                relationship=RelationshipType.HAS_TAG
            ))
        
        # Create effect relationships
        for effect_id in effects:
            self.store.add_edge(GraphEdge(
                id=f"{video_id}_uses_{effect_id}",
                source_id=video_id,
                target_id=effect_id,
                relationship=RelationshipType.USES_EFFECT
            ))
        
        return video_node
    
    def add_creator(
        self,
        creator_id: str,
        name: str,
        following: Optional[List[str]] = None
    ) -> GraphNode:
        """Add a creator node"""
        creator_node = GraphNode(
            id=creator_id,
            type=NodeType.CREATOR,
            properties={"name": name}
        )
        self.store.add_node(creator_node)
        
        # Add following relationships
        for followed_id in (following or []):
            self.store.add_edge(GraphEdge(
                id=f"{creator_id}_follows_{followed_id}",
                source_id=creator_id,
                target_id=followed_id,
                relationship=RelationshipType.FOLLOWS
            ))
        
        return creator_node
    
    def add_effect(
        self,
        effect_id: str,
        name: str,
        category: str,
        suggested_tags: Optional[List[str]] = None
    ) -> GraphNode:
        """Add an effect node"""
        effect_node = GraphNode(
            id=effect_id,
            type=NodeType.EFFECT,
            properties={"name": name, "category": category}
        )
        self.store.add_node(effect_node)
        
        # Create suggested_for relationships to tags
        for tag in (suggested_tags or []):
            tag_node_id = f"tag_{tag.lower().replace(' ', '_')}"
            if not self.store.get_node(tag_node_id):
                self.store.add_node(GraphNode(
                    id=tag_node_id,
                    type=NodeType.TAG,
                    properties={"name": tag}
                ))
            
            self.store.add_edge(GraphEdge(
                id=f"{effect_id}_suggested_for_{tag_node_id}",
                source_id=effect_id,
                target_id=tag_node_id,
                relationship=RelationshipType.SUGGESTED_FOR
            ))
        
        return effect_node
    
    def traverse(self, query: GraphQuery) -> GraphTraversalResult:
        """Traverse the graph from a starting node"""
        visited_nodes: Set[str] = set()
        visited_edges: Set[str] = set()
        paths: List[List[str]] = []
        
        def dfs(node_id: str, depth: int, current_path: List[str]):
            if depth > query.max_depth:
                return
            if node_id in visited_nodes:
                return
            if len(paths) >= query.limit:
                return
            
            visited_nodes.add(node_id)
            current_path.append(node_id)
            
            if len(current_path) > 1:
                paths.append(current_path.copy())
            
            # Get outgoing edges
            edges = self.store.get_outgoing_edges(node_id)
            if query.relationship_types:
                edges = [e for e in edges if e.relationship in query.relationship_types]
            
            for edge in edges:
                visited_edges.add(edge.id)
                dfs(edge.target_id, depth + 1, current_path)
            
            current_path.pop()
        
        dfs(query.start_node_id, 0, [])
        
        result_nodes = [self.store.nodes[nid] for nid in visited_nodes if nid in self.store.nodes]
        result_edges = [self.store.edges[eid] for eid in visited_edges if eid in self.store.edges]
        
        return GraphTraversalResult(
            nodes=result_nodes,
            edges=result_edges,
            paths=paths[:query.limit]
        )
    
    def expand_context(
        self,
        node_ids: List[str],
        max_depth: int = 2,
        relationship_types: Optional[List[RelationshipType]] = None
    ) -> List[GraphNode]:
        """Expand context by traversing from multiple starting nodes"""
        all_nodes: Set[str] = set()
        
        for node_id in node_ids:
            if not self.store.get_node(node_id):
                continue
            
            result = self.traverse(GraphQuery(
                start_node_id=node_id,
                relationship_types=relationship_types or [],
                max_depth=max_depth,
                limit=20
            ))
            
            for node in result.nodes:
                all_nodes.add(node.id)
        
        return [self.store.nodes[nid] for nid in all_nodes if nid in self.store.nodes]
    
    def find_related_effects(self, video_id: str) -> List[GraphNode]:
        """Find effects related to a video through shared tags"""
        video = self.store.get_node(video_id)
        if not video or video.type != NodeType.VIDEO:
            return []
        
        # Get video's tags
        tag_edges = [e for e in self.store.get_outgoing_edges(video_id) 
                     if e.relationship == RelationshipType.HAS_TAG]
        tag_ids = [e.target_id for e in tag_edges]
        
        # Find effects suggested for these tags
        related_effects: Set[str] = set()
        for tag_id in tag_ids:
            # Find effects that are suggested for this tag
            for edge in self.store.edges.values():
                if (edge.relationship == RelationshipType.SUGGESTED_FOR 
                    and edge.target_id == tag_id):
                    effect = self.store.get_node(edge.source_id)
                    if effect and effect.type == NodeType.EFFECT:
                        related_effects.add(edge.source_id)
        
        return [self.store.nodes[eid] for eid in related_effects if eid in self.store.nodes]
    
    def get_popular_effects_for_tags(self, tags: List[str], limit: int = 5) -> List[GraphNode]:
        """Get popular effects for given tags"""
        tag_node_ids = [f"tag_{t.lower().replace(' ', '_')}" for t in tags]
        
        effect_scores: dict[str, int] = defaultdict(int)
        
        for tag_id in tag_node_ids:
            for edge in self.store.edges.values():
                if (edge.relationship == RelationshipType.SUGGESTED_FOR 
                    and edge.target_id == tag_id):
                    effect_scores[edge.source_id] += 1
        
        sorted_effects = sorted(effect_scores.items(), key=lambda x: x[1], reverse=True)
        top_effect_ids = [eid for eid, _ in sorted_effects[:limit]]
        
        return [self.store.nodes[eid] for eid in top_effect_ids if eid in self.store.nodes]
