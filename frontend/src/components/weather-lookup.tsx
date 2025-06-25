"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WeatherData {
  id: string;
  request_date: string;
  location: string;
  notes: string;
  weather_data: {
    request: {
      type: string;
      query: string;
      language: string;
      unit: string;
    };
    location: {
      name: string;
      country: string;
      region: string;
      lat: string;
      lon: string;
      timezone_id: string;
      localtime: string;
      localtime_epoch: number;
      utc_offset: string;
    };
    current: {
      observation_time: string;
      temperature: number;
      weather_code: number;
      weather_icons: string[];
      weather_descriptions: string[];
      wind_speed: number;
      wind_degree: number;
      wind_dir: string;
      pressure: number;
      precip: number;
      humidity: number;
      cloudcover: number;
      feelslike: number;
      uv_index: number;
      visibility: number;
      is_day: string;
    };
  };
  created_at: string;
}

export function WeatherLookup() {
  const [weatherId, setWeatherId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weatherId.trim()) {
      setError("Please enter a weather request ID");
      return;
    }

    setIsLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const response = await fetch(`http://localhost:8000/weather/${weatherId.trim()}`);
      
      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Weather data not found");
      }
    } catch (err) {
      setError("Network error: Could not connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Lookup Weather Data</CardTitle>
        <CardDescription>
          Enter a weather request ID to retrieve stored weather data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weatherId">Weather Request ID</Label>
            <Input
              id="weatherId"
              type="text"
              placeholder="Enter weather request ID..."
              value={weatherId}
              onChange={(e) => setWeatherId(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : "Lookup Weather Data"}
          </Button>

          {error && (
            <div className="p-3 rounded-md bg-red-900/20 text-red-500 border border-red-500">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {weatherData && (
            <div className="space-y-4 mt-6">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500">

                <div className="space-y-3">

                  <div>
                    <h4 className="font-medium text-blue-300 mb-1">Location</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-blue-400">Name:</span> {weatherData.weather_data.location.name}</p>
                      <p><span className="text-blue-400">Country:</span> {weatherData.weather_data.location.country}</p>
                      <p><span className="text-blue-400">Local Time:</span> {weatherData.weather_data.location.localtime}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-300 mb-1">Current Weather</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-blue-400">Temperature:</span> {weatherData.weather_data.current.temperature}°C</p>
                      <p><span className="text-blue-400">Feels Like:</span> {weatherData.weather_data.current.feelslike}°C</p>
                      <p><span className="text-blue-400">Condition:</span> {weatherData.weather_data.current.weather_descriptions.join(", ")}</p>
                      <p><span className="text-blue-400">Humidity:</span> {weatherData.weather_data.current.humidity}%</p>
                      <p><span className="text-blue-400">Wind:</span> {weatherData.weather_data.current.wind_speed} km/h {weatherData.weather_data.current.wind_dir}</p>
                      <p><span className="text-blue-400">Pressure:</span> {weatherData.weather_data.current.pressure} mb</p>
                      <p><span className="text-blue-400">Visibility:</span> {weatherData.weather_data.current.visibility} km</p>
                      <p><span className="text-blue-400">UV Index:</span> {weatherData.weather_data.current.uv_index}</p>
                      <p><span className="text-blue-400">Cloud Cover:</span> {weatherData.weather_data.current.cloudcover}%</p>
                      <p><span className="text-blue-400">Precipitation:</span> {weatherData.weather_data.current.precip} mm</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-300 mb-1">Request Details</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-blue-400">Request Date:</span> {weatherData.request_date}</p>
                      <p><span className="text-blue-400">Location:</span> {weatherData.location}</p>
                      {weatherData.notes && (
                        <p><span className="text-blue-400">Notes:</span> {weatherData.notes}</p>
                      )}
                      <p><span className="text-blue-400">Created:</span> {formatDate(weatherData.created_at)}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
