import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()


class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')  # or 'gemini-2.5-pro'

    
    async def generate_task_breakdown(self, goal_title: str, goal_description: str, deadline: str = None) -> Dict[str, Any]:
        """
        Generate a structured task breakdown using Gemini AI
        
        Args:
            goal_title: The main goal title
            goal_description: Detailed description of the goal
            deadline: Optional deadline string
            
        Returns:
            Dict containing tasks with dependencies and timelines
        """
        
        # Build the prompt
        prompt = self._build_task_breakdown_prompt(goal_title, goal_description, deadline)
        
        try:
            # Generate response from Gemini
            response = self.model.generate_content(prompt)
            
            # Parse the JSON response
            result = self._parse_gemini_response(response.text)
            
            return result
            
        except Exception as e:
            print(f"Error generating task breakdown: {e}")
            raise
    
    def _build_task_breakdown_prompt(self, goal_title: str, goal_description: str, deadline: str = None) -> str:
        """Build the prompt for Gemini"""
        
        deadline_text = f"\nDeadline: {deadline}" if deadline else "\nNo specific deadline provided."
        
        prompt = f"""You are an expert project manager and task breakdown specialist. 

Goal: {goal_title}
Description: {goal_description}{deadline_text}

Break down this goal into a detailed, actionable task plan. For each task:
1. Create clear, specific task titles
2. Provide detailed descriptions
3. Estimate hours needed (realistic estimates)
4. Set priority (low, medium, high, critical)
5. Identify dependencies (which tasks must be completed before others)
6. Suggest start and end dates based on the deadline and task order

Return your response as a valid JSON object with this EXACT structure:

{{
  "tasks": [
    {{
      "title": "Task title",
      "description": "Detailed description of what needs to be done",
      "estimated_hours": 8,
      "priority": "high",
      "dependencies": [],
      "start_date": "2025-10-16",
      "end_date": "2025-10-18"
    }}
  ],
  "total_estimated_hours": 40,
  "suggested_timeline": "Brief timeline overview"
}}

Rules:
- Create 5-15 tasks depending on goal complexity
- Be specific and actionable
- Consider realistic time estimates
- Identify critical path and dependencies
- Tasks should flow logically
- Use ISO date format (YYYY-MM-DD)
- First tasks should have no dependencies
- Later tasks can depend on earlier ones using the task title

Return ONLY the JSON, no additional text or markdown formatting."""

        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> Dict[str, Any]:
        """Parse and validate Gemini's JSON response"""
        
        # Clean up response (remove markdown code blocks if present)
        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        try:
            # Parse JSON
            result = json.loads(cleaned)
            
            # Validate structure
            if "tasks" not in result:
                raise ValueError("Response missing 'tasks' field")
            
            return result
            
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON: {e}")
            print(f"Response text: {response_text}")
            raise ValueError(f"Invalid JSON response from Gemini: {e}")


# Create a singleton instance
gemini_service = GeminiService()