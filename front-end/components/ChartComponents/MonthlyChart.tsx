'use client';

import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
});

interface ChartData {
  month: string;
  amount: number;
}

interface Props {
  data: ChartData[];
  title: string;
}

const MonthlyExpenseChart = ({ data, title }: Props) => {

  const months = data.map((item) => item.month);
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
      trigger: 'item',
      confine: true,
      appendToBody: false,
      backgroundColor: '#2c2c2c',
      borderColor: '#555',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        return `${params.name}<br/>₹ ${params.value}`;
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
      data: months,
      axisLine: { lineStyle: { color: '#888' } },
      axisLabel: { color: '#ccc' },
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
          color: '#1976d2',
          borderRadius: [6, 6, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: '#42a5f5',
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
          <p>No monthly data available for the selected year.</p>
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

export default MonthlyExpenseChart;