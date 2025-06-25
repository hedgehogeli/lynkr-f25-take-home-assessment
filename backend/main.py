from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn

# my imports
from datetime import datetime
import requests
import uuid


app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

def fetch_weather_data(location: str) -> Dict[str, Any]:
    """
    Fetch weather data from WeatherStack API

    Originally uses httpx async since API calls should be async, but noticing that
    requirements.txt has `requests` already, so assuming `requests` is intended
    """
    params = {
        "access_key": "9aa7da6068a10e0e5d4900a4d99ab79f", # hardcoded b/c key is throwaway
        "query": location,
        "units": "m" # m for metric
    }
    
    try:
        response = requests.get("http://api.weatherstack.com/current", params=params)
        response.raise_for_status()

        data = response.json()
        if "error" in data: 
            raise HTTPException(status_code=400, detail=f"Weather API error: {data['error']['info']}")
        return data
    
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch weather data: {str(e)}")

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    """
    1. Receive form data (date, location, notes)
    2. Calls WeatherStack API for the location
    3. Stores combined data with unique ID in memory
    4. Returns the ID to frontend
    """

    # Validation
    if not request.location.strip():
        raise HTTPException(status_code=400, detail="Location is required")
    if not request.date.strip():
        raise HTTPException(status_code=400, detail="Date is required")
    
    # API call
    weather_data = await fetch_weather_data(request.location)

    # bookkeeping
    weather_id = str(uuid.uuid4())
    combined_data = {
        "id": weather_id,
        "request_date": request.date,
        "location": request.location,
        "notes": request.notes,
        "weather_data": weather_data,
        "created_at": datetime.utcnow().isoformat(),
    }
    weather_storage[weather_id] = combined_data
    
    return WeatherResponse(id=weather_id)

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)