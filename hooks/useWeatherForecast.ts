"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchOpenMeteoForecast } from "../services/weather/openMeteo";
import type { ItineraryStop, WeatherDay, WeatherHour } from "../types/travel";

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

export function useWeatherForecast(trip: ItineraryStop) {
  const [state, setState] = useState<WeatherState>(initialState);

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));

    try {
      const forecast = await fetchOpenMeteoForecast(trip.lat, trip.lng);
      setState({
        hours: forecast.hours,
        days: forecast.days,
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
