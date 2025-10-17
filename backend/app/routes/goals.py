from fastapi import APIRouter, HTTPException
from app.models import GoalCreate, Goal
from app.services.task_service import task_service
from app.database import init_db  # Add this import
from typing import List
import traceback

router = APIRouter(prefix="/api/goals", tags=["goals"])

@router.get("/", response_model=List[dict])
async def list_goals():
    """List all goals"""
    try:
        print("=== DEBUG: list_goals called ===")
        
        # Initialize database on each request (serverless!)
        await init_db()
        print("=== DEBUG: DB initialized, fetching goals ===")
        
        goals = await Goal.find_all().to_list()
        print(f"=== DEBUG: Found {len(goals)} goals ===")
        
        return [
            {
                "id": str(goal.id),
                "title": goal.title,
                "description": goal.description,
                "deadline": goal.deadline.isoformat() if goal.deadline else None,
                "total_estimated_hours": goal.total_estimated_hours,
                "created_at": goal.created_at.isoformat()
            }
            for goal in goals
        ]
        
    except Exception as e:
        print(f"=== ERROR in list_goals ===")
        print(f"Error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to list goals: {str(e)}")

@router.post("/", response_model=dict)
async def create_goal(goal_data: GoalCreate):
    """Create a new goal and generate tasks using AI"""
    try:
        print(f"=== DEBUG: create_goal called with: {goal_data.dict()} ===")
        
        # Initialize database
        await init_db()
        print("=== DEBUG: DB initialized ===")
        
        result = await task_service.create_goal_with_tasks(
            title=goal_data.title,
            description=goal_data.description,
            deadline=goal_data.deadline
        )
        
        goal = result["goal"]
        tasks = result["tasks"]
        
        print(f"=== DEBUG: Goal created with {len(tasks)} tasks ===")
        
        return {
            "success": True,
            "goal": {
                "id": str(goal.id),
                "title": goal.title,
                "description": goal.description,
                "deadline": goal.deadline.isoformat() if goal.deadline else None,
                "total_estimated_hours": goal.total_estimated_hours,
                "created_at": goal.created_at.isoformat()
            },
            "tasks": [
                {
                    "id": str(task.id),
                    "title": task.title,
                    "description": task.description,
                    "status": task.status.value,
                    "priority": task.priority.value,
                    "estimated_hours": task.estimated_hours,
                    "start_date": task.start_date.isoformat() if task.start_date else None,
                    "end_date": task.end_date.isoformat() if task.end_date else None,
                    "dependencies": [
                        {"task_id": dep.task_id, "task_title": dep.task_title}
                        for dep in task.dependencies
                    ]
                }
                for task in tasks
            ],
            "ai_insights": result["ai_insights"]
        }
        
    except Exception as e:
        print(f"=== ERROR in create_goal ===")
        print(f"Error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to create goal: {str(e)}")

@router.get("/{goal_id}", response_model=dict)
async def get_goal(goal_id: str):
    """Get a specific goal with all its tasks"""
    try:
        await init_db()  # Initialize DB
        
        result = await task_service.get_goal_with_tasks(goal_id)
        goal = result["goal"]
        tasks = result["tasks"]
        
        return {
            "success": True,
            "goal": {
                "id": str(goal.id),
                "title": goal.title,
                "description": goal.description,
                "deadline": goal.deadline.isoformat() if goal.deadline else None,
                "total_estimated_hours": goal.total_estimated_hours,
                "created_at": goal.created_at.isoformat()
            },
            "tasks": [
                {
                    "id": str(task.id),
                    "title": task.title,
                    "description": task.description,
                    "status": task.status.value,
                    "priority": task.priority.value,
                    "estimated_hours": task.estimated_hours,
                    "start_date": task.start_date.isoformat() if task.start_date else None,
                    "end_date": task.end_date.isoformat() if task.end_date else None,
                    "dependencies": [
                        {"task_id": dep.task_id, "task_title": dep.task_title}
                        for dep in task.dependencies
                    ]
                }
                for task in tasks
            ]
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve goal: {str(e)}")
