from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models import TaskStatus
from app.services.task_service import task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


class TaskStatusUpdate(BaseModel):
    """Request model for updating task status"""
    status: str


@router.patch("/{task_id}/status")
async def update_task_status(task_id: str, status_update: TaskStatusUpdate):
    """
    Update the status of a task
    
    Request body:
    {
        "status": "in_progress"  // pending, in_progress, completed, blocked
    }
    """
    try:
        # Validate status
        valid_statuses = ["pending", "in_progress", "completed", "blocked"]
        if status_update.status not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        # Convert string to enum
        status_enum = TaskStatus(status_update.status)
        
        # Update task
        task = await task_service.update_task_status(task_id, status_enum)
        
        return {
            "success": True,
            "task": {
                "id": str(task.id),
                "title": task.title,
                "status": task.status.value,
                "updated_at": task.updated_at.isoformat()
            }
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update task: {str(e)}")


@router.get("/{task_id}")
async def get_task(task_id: str):
    """
    Get a specific task by ID
    """
    try:
        from app.models import Task
        task = await Task.get(task_id)
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {
            "success": True,
            "task": {
                "id": str(task.id),
                "goal_id": task.goal_id,
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
                ],
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve task: {str(e)}")