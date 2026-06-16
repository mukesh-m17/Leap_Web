import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const STATUS_COLORS = {
  safe: { line: "#10b981", glow: "rgba(16,185,129,0.2)" },
  warning: { line: "#f59e0b", glow: "rgba(245,158,11,0.2)" },
  danger: { line: "#f43f5e", glow: "rgba(244,63,94,0.2)" },
};

export default function GasChart({ data = [], status = "safe" }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.safe;

  const chartData = {
    labels: data.map((_, i) => {
      const time = new Date(Date.now() - (data.length - i - 1) * 5000);
      return time.toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit",
        second: "2-digit"
      });
    }),
    datasets: [
      {
        label: "Gas Concentration",
        data,
        borderColor: colors.line,
        borderWidth: 3,
        pointBackgroundColor: colors.line,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: colors.line,
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 3,
        tension: 0.4,
        fill: true,
        backgroundColor: (ctx) => {
          const canvas = ctx.chart.ctx;
          const gradient = canvas.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, colors.glow);
          gradient.addColorStop(0.5, `${colors.glow.slice(0, -4)}0.1)`);
          gradient.addColorStop(1, "rgba(0,0,0,0)");
          return gradient;
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: "easeInOutCubic",
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(12, 20, 32, 0.95)",
        borderColor: colors.line,
        borderWidth: 2,
        titleColor: "#7a9bb5",
        bodyColor: "#e8f4f8",
        titleFont: {
          family: "'JetBrains Mono', monospace",
          size: 11,
          weight: "600",
        },
        bodyFont: {
          family: "'JetBrains Mono', monospace",
          size: 14,
          weight: "700",
        },
        padding: 16,
        displayColors: false,
        callbacks: {
          title: (ctx) => `Time: ${ctx[0].label}`,
          label: (ctx) => `${ctx.raw} ppm`,
          afterLabel: () => {
            if (status === "danger") return "⚠️ CRITICAL";
            if (status === "warning") return "⚠️ ELEVATED";
            return "✓ SAFE";
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(0,212,255,0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#3d5a72",
          font: {
            family: "'JetBrains Mono', monospace",
            size: 9,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        grid: {
          color: "rgba(0,212,255,0.08)",
          drawBorder: false,
        },
        ticks: {
          color: "#3d5a72",
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10,
          },
          callback: (v) => `${v} ppm`,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height: "280px", position: "relative" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}