"use client";

import { Bar, Doughnut, Line } from "react-chartjs-2";
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

type Item = { name: string; value: number };
const colors = ["#147d64", "#38ad83", "#89d7a6", "#1c5f99", "#5d83d6", "#e3a63a", "#d46b78", "#9a71d4"];
const tooltip = { backgroundColor: "#13221b", titleColor: "#fff", bodyColor: "#d9efe2", padding: 12, cornerRadius: 10, displayColors: false, titleFont: { weight: "700" as const }, bodyFont: { weight: "600" as const } };

export function TrafficChart({ items }: { items: Item[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return <Doughnut data={{ labels: items.map(i => i.name), datasets: [{ data: items.map(i => i.value), backgroundColor: items.map((_, index) => colors[index % colors.length]), borderColor: "#fff", borderWidth: 4, hoverOffset: 10, borderRadius: 5 }] }} options={{ responsive: true, maintainAspectRatio: false, cutout: "68%", plugins: { legend: { position: "bottom", labels: { boxWidth: 9, boxHeight: 9, usePointStyle: true, pointStyle: "circle", padding: 16, color: "#516159", font: { size: 11, weight: "600" } } }, tooltip: { ...tooltip, callbacks: { label: context => { const value = Number(context.raw || 0); return `${context.label}: ${value} (${total ? Math.round((value / total) * 100) : 0}%)`; } } } } }} />;
}

export function DeviceChart({ items }: { items: Item[] }) {
  return <Bar data={{ labels: items.map(i => i.name), datasets: [{ label: "Sessions", data: items.map(i => i.value), backgroundColor: "#258150", borderRadius: 8, borderSkipped: false, maxBarThickness: 48, hoverBackgroundColor: "#147d64" }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: context => `${context.parsed.y} sessions` } } }, scales: { x: { grid: { display: false }, border: { display: false }, ticks: { color: "#708078", font: { size: 11, weight: "600" } } }, y: { beginAtZero: true, border: { display: false }, grid: { color: "rgba(21, 79, 49, .08)" }, ticks: { precision: 0, color: "#8a9891", font: { size: 10 } } } } }} />;
}

export function DailyChart({ items }: { items: { date: string; value: number }[] }) {
  return <Line data={{ labels: items.map(i => i.date), datasets: [{ label: "Page views", data: items.map(i => i.value), tension: 0.42, fill: true, borderColor: "#147d64", borderWidth: 3, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: "#fff", pointHoverBorderWidth: 3, pointHoverBorderColor: "#147d64", backgroundColor: (context) => { const chart = context.chart; const { ctx, chartArea } = chart; if (!chartArea) return "rgba(56, 173, 131, .2)"; const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom); gradient.addColorStop(0, "rgba(56, 173, 131, .36)"); gradient.addColorStop(1, "rgba(56, 173, 131, 0)"); return gradient; } }] }} options={{ responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: "index" }, plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: context => `${context.parsed.y} page views` } } }, scales: { x: { grid: { display: false }, border: { display: false }, ticks: { maxTicksLimit: 7, color: "#84928b", font: { size: 10, weight: "600" } } }, y: { beginAtZero: true, border: { display: false }, grid: { color: "rgba(21, 79, 49, .08)" }, ticks: { precision: 0, color: "#84928b", font: { size: 10 } } } } }} />;
}
