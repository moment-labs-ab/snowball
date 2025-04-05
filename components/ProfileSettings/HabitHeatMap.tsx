import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import Svg, { Rect, Text, G, Line } from "react-native-svg";
import * as d3 from "d3";
import { HabitTrackingEntry } from "@/types/types";
import HeatMapStats from "./HeatMapStats";
import { useTrackingContext } from "@/context/TrackingContext";

interface HeatMapProps {
  data: HabitTrackingEntry[];
  height?: number;
}

interface MonthLabel {
  date: Date;
  label: string;
  x: number;
}

const HabitHeatMap: React.FC<HeatMapProps> = ({ data, height = Dimensions.get("window").height }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const { width: screenWidth } = useWindowDimensions();
  const width = Dimensions.get("window").width;

  const isLargeScreen = screenWidth > 390; // Detect iPad screens
  const cellSize: number = isLargeScreen
    ? Math.floor((width - 100) / 14) // More cells for bigger screens
    : Math.floor((width - 60) / 14);
  const cellPadding: number = 1;
  const [monthLabels, setMonthLabels] = React.useState<MonthLabel[]>([]);
  const [dates, setDates] = React.useState<Date[]>([]);
  const { tracking, isLoadingTracking } = useTrackingContext();

  const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resets time to 00:00:00
    return today;
  };
  const [todaysDate, setTodaysDate] = useState(getStartOfToday());

  const entriesKey = data
    .map((entry) => `${entry.date}:${entry.count}`)
    .join("|");

  useEffect(() => {
    if (!data.length) return;

    const sortedData: HabitTrackingEntry[] = [...data].sort(
      (a: HabitTrackingEntry, b: HabitTrackingEntry) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const maxCount =
      d3.max(sortedData, (d: HabitTrackingEntry) => d.count) || 1;
    const colorScale = d3
      .scaleSequential()
      .domain([maxCount, 0])
      .interpolator(d3.interpolateBlues);

    const today: Date = new Date();
    const startDate: Date = new Date(today);
    startDate.setDate(startDate.getDate() - 90);

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
  }, [data, tracking]);

  const weekDays: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDateStr = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const getColor = (count: number): string => {
    const maxCount = d3.max(data, (d: HabitTrackingEntry) => d.count) || 1;
    //const maxCount = 1
    const colorScale = d3
      .scaleSequential(['white',"#3e4e88"])
      .domain([0, maxCount])

    return colorScale(count);
  };
  if (data.length == 0) {
    return <ActivityIndicator></ActivityIndicator>;
  }

  return (
    <View style={{ flex: 1,alignItems: "center" }}>
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

          {/* Month separator lines */}
          <G transform={`translate(40, 30)`}>
            {monthLabels.map((month: MonthLabel, i: number) => (
              <Line
                key={`separator-${i}`}
                x1={month.x - cellPadding}
                y1={0}
                x2={month.x - cellPadding}
                y2={7 * (cellSize + cellPadding)}
                stroke="black"
                strokeWidth={4}
                strokeOpacity={0.5}
              />
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
              const isToday: boolean = dateStr === getDateStr(todaysDate);

              return (
                <Rect
                  key={i}
                  x={weekOfYear * (cellSize + cellPadding)}
                  y={dayOfWeek * (cellSize + cellPadding)}
                  width={cellSize}
                  height={cellSize}
                  fill={getColor(count)}
                  rx={2}
                  stroke={isToday ? "#acc936" : "none"}
                  strokeWidth={isToday ? 3 : 0}
                  onPressIn={() => {}}
                />
              );
            })}
          </G>
        </Svg>
      </View>
    </View>
  );
};

export default HabitHeatMap;
