
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartTooltipContent } from "./ui/chart"

const data = [
  { day: "Monday", lastWeek: 4000, thisWeek: 2400 },
  { day: "Tuesday", lastWeek: 3000, thisWeek: 1398 },
  { day: "Wednesday", lastWeek: 2000, thisWeek: 9800 },
  { day: "Thursday", lastWeek: 2780, thisWeek: 3908 },
  { day: "Friday", lastWeek: 1890, thisWeek: 4800 },
  { day: "Saturday", lastWeek: 2390, thisWeek: 3800 },
  { day: "Sunday", lastWeek: 3490, thisWeek: 4300 },
]

export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Comparison</CardTitle>
        <CardDescription>This Week vs. Last Week</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="lastWeek" fill="hsl(var(--secondary))" name="Last Week" radius={[4, 4, 0, 0]} />
            <Bar dataKey="thisWeek" fill="hsl(var(--primary))" name="This Week" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
