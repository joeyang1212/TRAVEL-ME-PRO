"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWeatherForecast } from "../services/weather/openMeteo";
import type { ItineraryDay, WeatherDay, WeatherHour } from "../types/travel";

type WeatherState = {
  hours: WeatherHour[];
  days: WeatherDay[];
  loading: boolean;
  error: string;
  updatedAt: string;
};

const initialState: WeatherState = {
  hours: [],
  days: [],
  loading: false,
  error: "",
  updatedAt: "",
};

export function useWeatherForecast(trip: ItineraryDay) {
  const [state, setState] = useState<WeatherState>(initialState);

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));

    try {
      const forecast = await fetchWeatherForecast(trip.lat, trip.lng);
      setState({
        hours: forecast.hourly,
        days: forecast.daily,
        loading: false,
        error: "",
        updatedAt: `${trip.city}｜${new Date().toLocaleString("zh-TW")}`,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "天氣資料讀取失敗",
      }));
    }
  }, [trip.city, trip.lat, trip.lng]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
