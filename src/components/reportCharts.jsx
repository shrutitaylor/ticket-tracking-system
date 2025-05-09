import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadialBarChart, RadialBar, PolarAngleAxis, Cell, Legend
} from "recharts";

const COLORS = ["#34d399", "#f87171"];

const ReportsChart = ({ data }) => {
  const [weeklyCounts, setWeeklyCounts] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [todayNotPaidCount, setTodayNotPaidCount] = useState(0);

  const parseDate = (d) => {
    if (typeof d === "string") {
      const [day, month, year] = d.split("/").map(Number);
      return new Date(year, month - 1, day);
    } else if (d?.seconds) {
      return new Date(d.seconds * 1000);
    } else if (d instanceof Date) {
      return d;
    } else {
      return new Date(0);
    }
  };

  useEffect(() => {
    const now = new Date();

    // --- Weekly Counts ---
    const weeks = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const key = date.toLocaleDateString("en-GB");
      weeks[key] = 0;
    }

    data.forEach(ticket => {
      const date = parseDate(ticket.date).toLocaleDateString("en-GB");
      if (weeks[date] !== undefined) {
        weeks[date]++;
      }
    });

    const weekly = Object.entries(weeks)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        const [d1, m1, y1] = a.date.split("/").map(Number);
        const [d2, m2, y2] = b.date.split("/").map(Number);
        return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
      });

    setWeeklyCounts(weekly);

    // --- Today's and Yesterday's Counts ---
    const today = new Date();
    const todayStr = today.toLocaleDateString("en-GB");

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString("en-GB");

    let totalToday = 0;
    let notPaidToday = 0;
    let totalYesterday = 0;

    data.forEach(ticket => {
      const ticketDate = parseDate(ticket.date).toLocaleDateString("en-GB");

      if (ticketDate === todayStr) {
        totalToday++;
        if (!ticket.paid || ticket.paid.trim() === "") {
          notPaidToday++;
        }
      }

      if (ticketDate === yesterdayStr) {
        totalYesterday++;
      }
    });

    setTodayCount(totalToday);
    setTodayNotPaidCount(notPaidToday);
    setYesterdayCount(totalYesterday); // ✅ Fixed: you were incorrectly doing setYesterdayCount(yesterday)
  }, [data]);
  
  const radialData = [
    { name: "TODAY", value: todayCount, fill: "#ffd230" },
    { name: "YESTERDAY", value: yesterdayCount, fill: "#a685ff" },
  ];

  return (
    <div className="flex flex-cols font-aoMono w-full  gap-6 mt-6">
      {/* Weekly Bar Chart */}
      <div className="bg-white w-2/3 shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Weekly Report</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyCounts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#50a2ff" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Today's Sales Pie Chart */}
      <div className="bg-white w-1/3 shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Today's Sales</h2>
        <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart
                innerRadius="40%"
                outerRadius="100%"
                data={radialData}
                startAngle={180}
                endAngle={0}
                >
                <PolarAngleAxis
                    type="number"
                    domain={[0, Math.max(todayCount, yesterdayCount, 1)]}
                    tick={false}
                />
                <RadialBar
                    minAngle={15}
                    label={{ position: "insideStart", fill: "#fff" }}
                    background
                    clockWise
                    dataKey="value"
                />
                <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" align="center" />
                <Tooltip />
            </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReportsChart;
