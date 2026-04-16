'use client';

import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
});

interface ChartData {
  day: number;
  amount: number;
}

interface Props {
  data: ChartData[];
  title: string;
}

const DailyChart = ({ data, title }: Props) => {
  const days = data.map((item) => item.day);
  const values = data.map((item) => item.amount);

  const option = {
    backgroundColor: '#1e1e1e',

    title: {
      text: title,
      left: 'center',
      textStyle: {
        color: '#fff',
        fontSize: 16,
      },
    },

    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      confine: true,
      appendToBody: false,
      backgroundColor: '#2c2c2c',
      borderColor: '#555',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        const item = params[0];
        return `${item.name}<br/>₹ ${item.value}`;
      },
    },

    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },

    xAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: '#888' } },
      axisLabel: { color: '#ccc' },
      name: 'Day',
      nameTextStyle: { color: '#ccc' },
    },

    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#888' } },
      splitLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#ccc' },
    },

    series: [
      {
        name: title,
        type: 'bar',
        data: values,
        barWidth: '40%',
        itemStyle: {
          color: '#4caf50',
          borderRadius: [6, 6, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: '#66bb6a',
          },
        },
      },
    ],
  };

  const chartCardStyle = {
    width: '100%',
    marginTop: '20px',
    background: '#111827',
    padding: '22px',
    borderRadius: '18px',
    minHeight: '360px',
  };

  if (!data || data.length === 0) {
    return (
      <div style={chartCardStyle}>
        <div className="monthly-chart-empty">
          <p>No daily data available for the selected month.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={chartCardStyle}>
      <ReactECharts option={option} style={{ height: 350 }} />
    </div>
  );
};

export default DailyChart;
