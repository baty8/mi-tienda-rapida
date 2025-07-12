
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart"

const data = [
  { day: "Monday", lastWeek: 4000, thisWeek: 2400 },
  { day: "Tuesday", lastWeek: 3000, thisWeek: 1398 },
  { day: "Wednesday", lastWeek: 2000, thisWeek: 9800 },
  { day: "Thursday", lastWeek: 2780, thisWeek: 3908 },
  { day: "Friday", lastWeek: 1890, thisWeek: 4800 },
  { day: "Saturday", lastWeek: 2390, thisWeek: 3800 },
  { day: "Sunday", lastWeek: 3490, thisWeek: 4300 },
]

const chartConfig = {
  thisWeek: {
    label: "This Week",
    color: "hsl(var(--primary))",
  },
  lastWeek: {
    label: "Last Week",
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig;


export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Comparison</CardTitle>
        <CardDescription>This Week vs. Last Week</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${Number(value) / 1000}k`}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Legend />
            <Bar dataKey="lastWeek" fill="var(--color-lastWeek)" radius={4} />
            <Bar dataKey="thisWeek" fill="var(--color-thisWeek)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
