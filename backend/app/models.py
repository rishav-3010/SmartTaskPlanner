from beanie import Document
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    """Task status options"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"


class TaskPriority(str, Enum):
    """Task priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskDependency(BaseModel):
    """Task dependency information"""
    task_id: str
    task_title: str


class Task(Document):
    """Task model for MongoDB"""
    goal_id: str
    title: str
    description: str
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    estimated_hours: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    dependencies: List[TaskDependency] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "tasks"


class Goal(Document):
    """Goal model for MongoDB"""
    title: str
    description: str
    deadline: Optional[datetime] = None
    total_estimated_hours: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "goals"


# Request/Response Models (for API)
class GoalCreate(BaseModel):
    """Request model for creating a goal"""
    title: str
    description: str
    deadline: Optional[str] = None  # ISO format string


class TaskResponse(BaseModel):
    """Response model for a single task"""
    id: str
    title: str
    description: str
    status: str
    priority: str
    estimated_hours: Optional[float]
    start_date: Optional[str]
    end_date: Optional[str]
    dependencies: List[TaskDependency]


class GoalResponse(BaseModel):
    """Response model for a goal with tasks"""
    id: str
    title: str
    description: str
    deadline: Optional[str]
    total_estimated_hours: Optional[float]
    tasks: List[TaskResponse]
    created_at: str