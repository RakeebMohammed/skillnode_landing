"use client";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

type Item = { name: string; value: number };
export function TrafficChart({ items }: { items: Item[] }) { return <Doughnut data={{ labels: items.map(i => i.name), datasets: [{ data: items.map(i => i.value) }] }} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />; }
export function DeviceChart({ items }: { items: Item[] }) { return <Bar data={{ labels: items.map(i => i.name), datasets: [{ label: "Sessions", data: items.map(i => i.value) }] }} options={{ responsive: true, plugins: { legend: { display: false } } }} />; }
export function DailyChart({ items }: { items: { date: string; value: number }[] }) { return <Line data={{ labels: items.map(i => i.date), datasets: [{ label: "Page views", data: items.map(i => i.value), tension: 0.35 }] }} options={{ responsive: true, plugins: { legend: { display: false } } }} />; }
