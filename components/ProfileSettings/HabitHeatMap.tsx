import React, { useEffect, useRef, useState } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Svg, { Rect, Text, G } from "react-native-svg";
import * as d3 from "d3";
import { HabitTrackingEntry } from "@/types/types";
import HeatMapStats from "./HeatMapStats";

interface HeatMapProps {
  data: HabitTrackingEntry[];
  width?: number;
  height?: number;
}

interface MonthLabel {
  date: Date;
  label: string;
  x: number;
}

const HabitHeatMap: React.FC<HeatMapProps> = ({
  data,
  width = Dimensions.get("window").width - 20,
  height = 200,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const cellSize: number = Math.floor((width - 60) / 13);
  const cellPadding: number = 1;
  const [monthLabels, setMonthLabels] = React.useState<MonthLabel[]>([]);
  const [dates, setDates] = React.useState<Date[]>([]);
  
  const entriesKey = data.map(entry => `${entry.date}:${entry.count}`).join('|');


  useEffect(() => {
    if (!data.length) return;

    const sortedData: HabitTrackingEntry[] = [...data].sort(
      (a: HabitTrackingEntry, b: HabitTrackingEntry) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Correctly type the color scale using d3.ScaleLinear
    const maxCount =
      d3.max(sortedData, (d: HabitTrackingEntry) => d.count) || 1;
    const colorScale = d3
      .scaleSequential()
      .domain([0, maxCount])
      .interpolator(d3.interpolateBlues);

    const today: Date = new Date();
    const startDate: Date = new Date(today);
    startDate.setDate(startDate.getDate() - 90); // Changed from 365 to 90 days (approximately 3 months)

    const calculatedDates: Date[] = d3.timeDays(startDate, today);
    setDates(calculatedDates);

    const months: Date[] = d3.timeMonths(startDate, today);
    const calculatedMonthLabels: MonthLabel[] = months.map(
      (date: Date): MonthLabel => ({
        date,
        label: date.toLocaleString("default", { month: "short" }),
        x: Math.floor(
          d3.timeWeeks(startDate, date).length * (cellSize + cellPadding)
        ),
      })
    );
    setMonthLabels(calculatedMonthLabels);

    return () => {
      // Cleanup if needed
    };
  }, [data, width, height, cellSize, cellPadding, entriesKey]);

  const weekDays: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDateStr = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const getColor = (count: number): string => {
    const maxCount = d3.max(data, (d: HabitTrackingEntry) => d.count) || 1;
    const colorScale = d3
      .scaleSequential()
      .domain([0, maxCount])
      .interpolator(d3.interpolateBlues);
    return colorScale(count);
  };

  

  return (
    <View>
      <View style={{ marginVertical: 1 }}>
    
        <Svg width={width} height={height}>
          {/* Month labels */}
          <G transform={`translate(40, 0)`}>
            {monthLabels.map((month: MonthLabel, i: number) => (
              <Text
                key={i}
                x={month.x}
                y={15}
                fontSize={10}
                textAnchor="start"
                fill="#666"
              >
                {month.label}
              </Text>
            ))}
          </G>

          {/* Weekday labels */}
          <G transform={`translate(0, 30)`}>
            {weekDays.map((day: string, i: number) => (
              <Text
                key={i}
                x={10}
                y={i * (cellSize + cellPadding) + cellSize / 2}
                fontSize={10}
                textAnchor="start"
                fill="#666"
                alignmentBaseline="middle"
              >
                {day}
              </Text>
            ))}
          </G>

          {/* Heat map cells */}
          <G transform={`translate(40, 30)`}>
            {dates.map((date: Date, i: number) => {
              const dateStr: string = getDateStr(date);
              const count: number =
                data.find((d: HabitTrackingEntry) => d.date === dateStr)
                  ?.count || 0;
              const weekOfYear: number = d3.timeWeek.count(dates[0], date);
              const dayOfWeek: number = date.getDay();

              return (
                <Rect
                  key={i}
                  x={weekOfYear * (cellSize + cellPadding)}
                  y={dayOfWeek * (cellSize + cellPadding)}
                  width={cellSize}
                  height={cellSize}
                  fill={getColor(count)}
                  rx={2}
                />
              );
            })}
          </G>
        </Svg>
      </View>
      <HeatMapStats data={data} />
    </View>
  );
};

export default HabitHeatMap;

