from typing import List, Dict, Any
from datetime import datetime
from app.models import Goal, Task, TaskDependency, TaskPriority, TaskStatus
from app.services.gemini_service import gemini_service


class TaskService:
    """Service for managing task generation and operations"""
    
    async def create_goal_with_tasks(self, title: str, description: str, deadline: str = None) -> Dict[str, Any]:
        """
        Create a goal and generate tasks using AI
        
        Args:
            title: Goal title
            description: Goal description
            deadline: Optional deadline string
            
        Returns:
            Dict with goal and generated tasks
        """
        
        # Parse deadline if provided
        deadline_dt = None
        if deadline:
            try:
                deadline_dt = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
            except Exception as e:
                print(f"Failed to parse deadline: {e}")
        
        # Create the goal in database
        goal = Goal(
            title=title,
            description=description,
            deadline=deadline_dt
        )
        await goal.insert()
        
        # Generate tasks using Gemini AI
        try:
            ai_response = await gemini_service.generate_task_breakdown(
                goal_title=title,
                goal_description=description,
                deadline=deadline
            )
            
            # Update goal with total estimated hours
            if "total_estimated_hours" in ai_response:
                goal.total_estimated_hours = ai_response["total_estimated_hours"]
                await goal.save()
            
            # Create tasks in database
            tasks = await self._create_tasks_from_ai_response(
                goal_id=str(goal.id),
                ai_response=ai_response
            )
            
            return {
                "goal": goal,
                "tasks": tasks,
                "ai_insights": {
                    "total_estimated_hours": ai_response.get("total_estimated_hours", 0),
                    "suggested_timeline": ai_response.get("suggested_timeline", "")
                }
            }
            
        except Exception as e:
            # If AI generation fails, delete the goal and raise error
            await goal.delete()
            raise Exception(f"Failed to generate tasks: {str(e)}")
    
    async def _create_tasks_from_ai_response(self, goal_id: str, ai_response: Dict[str, Any]) -> List[Task]:
        """
        Create Task documents from AI response
        
        Args:
            goal_id: ID of the parent goal
            ai_response: Response from Gemini AI
            
        Returns:
            List of created Task documents
        """
        
        tasks_data = ai_response.get("tasks", [])
        created_tasks = []
        task_title_to_id = {}  # Map task titles to IDs for dependency resolution
        
        # First pass: Create all tasks without dependencies
        for task_data in tasks_data:
            task = Task(
                goal_id=goal_id,
                title=task_data.get("title", "Untitled Task"),
                description=task_data.get("description", ""),
                estimated_hours=task_data.get("estimated_hours"),
                priority=self._parse_priority(task_data.get("priority", "medium")),
                status=TaskStatus.PENDING,
                start_date=self._parse_date(task_data.get("start_date")),
                end_date=self._parse_date(task_data.get("end_date")),
                dependencies=[]
            )
            
            await task.insert()
            created_tasks.append(task)
            task_title_to_id[task.title] = str(task.id)
        
        # Second pass: Update dependencies
        for i, task_data in enumerate(tasks_data):
            dependencies_list = task_data.get("dependencies", [])
            
            if dependencies_list:
                task = created_tasks[i]
                task_dependencies = []
                
                for dep in dependencies_list:
                    # Dependencies can be task titles or indices
                    if isinstance(dep, str):
                        # It's a task title
                        if dep in task_title_to_id:
                            task_dependencies.append(TaskDependency(
                                task_id=task_title_to_id[dep],
                                task_title=dep
                            ))
                    elif isinstance(dep, int):
                        # It's an index
                        if 0 <= dep < len(created_tasks):
                            dep_task = created_tasks[dep]
                            task_dependencies.append(TaskDependency(
                                task_id=str(dep_task.id),
                                task_title=dep_task.title
                            ))
                
                task.dependencies = task_dependencies
                await task.save()
        
        return created_tasks
    
    async def get_goal_with_tasks(self, goal_id: str) -> Dict[str, Any]:
        """
        Retrieve a goal with all its tasks
        
        Args:
            goal_id: ID of the goal
            
        Returns:
            Dict with goal and tasks
        """
        
        goal = await Goal.get(goal_id)
        if not goal:
            raise ValueError(f"Goal not found: {goal_id}")
        
        tasks = await Task.find(Task.goal_id == goal_id).to_list()
        
        return {
            "goal": goal,
            "tasks": tasks
        }
    
    async def update_task_status(self, task_id: str, status: TaskStatus) -> Task:
        """Update task status"""
        task = await Task.get(task_id)
        if not task:
            raise ValueError(f"Task not found: {task_id}")
        
        task.status = status
        task.updated_at = datetime.utcnow()
        await task.save()
        
        return task
    
    def _parse_priority(self, priority_str: str) -> TaskPriority:
        """Parse priority string to enum"""
        priority_map = {
            "low": TaskPriority.LOW,
            "medium": TaskPriority.MEDIUM,
            "high": TaskPriority.HIGH,
            "critical": TaskPriority.CRITICAL
        }
        return priority_map.get(priority_str.lower(), TaskPriority.MEDIUM)
    
    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string to datetime"""
        if not date_str:
            return None
        
        try:
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except Exception as e:
            print(f"Failed to parse date {date_str}: {e}")
            return None


# Create singleton instance
task_service = TaskService()