"use client";

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface SalesChartProps {
    data: any[];
}

export default function SalesChart({ data }: SalesChartProps) {
    if (!data || data.length === 0) return <div>No sales data available.</div>;

    const chartData = {
        labels: data.map(d => d.date),
        datasets: [
            {
                label: 'Sales ($)',
                data: data.map(d => d.total),
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.5)',
                tension: 0.3
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: 'white' }
            },
            title: {
                display: true,
                text: 'Last 30 Days Sales',
                color: 'white'
            },
        },
        scales: {
            x: { ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
    };

    return <Line options={options} data={chartData} />;
}
