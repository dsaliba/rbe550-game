import React, { useEffect, useState } from 'react';
import supabase from './supabase'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
//Atribution: Graph code developed with help of AI
// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Statistics = () => {
  const [modesData, setModesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('Paths')
          .select('mode, score');

        if (error) throw error;

        const groupedData = {};
        data.forEach(item => {
          if (!groupedData[item.mode]) {
            groupedData[item.mode] = [];
          }
          groupedData[item.mode].push(item.score);
        });

        setModesData(groupedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Improved error bars plugin
  const errorBarsPlugin = {
    id: 'errorBars',
    afterDatasetsDraw(chart, args, options) {
      const { ctx, data, chartArea: { top, bottom, left, right } } = chart;
      const dataset = data.datasets[0];
      
      if (!dataset.errorPlus || !dataset.errorMinus) return;
      
      ctx.save();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;

      dataset.data.forEach((value, index) => {
        const bar = chart.getDatasetMeta(0).data[index];
        if (!bar) return;

        const centerX = bar.x;
        const topY = bar.y;
        const bottomY = topY + dataset.errorPlus[index] * (bottom - top) / (chart.scales.y.max - chart.scales.y.min);
        
        // Draw vertical error bar
        ctx.beginPath();
        ctx.moveTo(centerX, topY);
        ctx.lineTo(centerX, bottomY);
        ctx.stroke();
        
        // Draw horizontal caps
        const capWidth = 8;
        ctx.beginPath();
        ctx.moveTo(centerX - capWidth/2, bottomY);
        ctx.lineTo(centerX + capWidth/2, bottomY);
        ctx.stroke();
      });
      ctx.restore();
    }
  };

  const prepareChartData = () => {
    const modes = Object.keys(modesData);
    const means = [];
    const errorPlus = [];
    const errorMinus = [];
    const backgroundColors = [];

    modes.forEach((mode, index) => {
      const scores = modesData[mode];
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const stdDev = Math.sqrt(scores.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / scores.length);
      
      means.push(mean);
      errorPlus.push(stdDev);
      errorMinus.push(stdDev);
      backgroundColors.push(`hsl(${(index * 120) % 360}, 70%, 50%)`);
    });

    return {
      labels: modes,
      datasets: [{
        label: 'Average Score',
        data: means,
        color: 'white',
        backgroundColor: backgroundColors,
        borderColor: 'white',
        borderWidth: 1,
        errorPlus: errorPlus,
        errorMinus: errorMinus
      }]
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        color: 'white', 
        labels: {
          color: 'white',
          font: {
            size: 14,
          },
          generateLabels: (chart) => {
            return chart.data.labels.map((label, i) => ({
               
              text: `${label} (${chart.data.datasets[0].data[i].toFixed(2)})`,
              fillStyle: chart.data.datasets[0].backgroundColor[i],
              strokeStyle: 'white',
              fontColor: 'white',
              lineWidth: 1,
              hidden: false
              
            }));
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const stdDev = context.dataset.errorPlus[context.dataIndex];
            return [
              `${label}: ${value.toFixed(2)}`,
              `±${stdDev.toFixed(2)} std. dev.`
            ];
          }
        }
      },
      title: {
        display: true,
        text: 'Average Scores by Mode with Error Bars',
        color: 'white',
        font: {
          size: 18
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'white'
        },
        title: {
          display: true,
          text: 'Score',
          color: 'white'
        },
        grid: {
          color: 'rgba(255,255,255,0.1)'
        }
      },
      x: {
        ticks: {
          color: 'white'
        },
        title: {
          display: true,
          text: 'Mode',
          color: 'white'
        },
        grid: {
          color: 'rgba(255,255,255,0.1)'
        }
      }
    }
  };

  ChartJS.register(errorBarsPlugin);

  if (loading) return <div style={{ color: 'white' }}>Loading data...</div>;
  if (error) return <div style={{ color: 'white' }}>Error: {error}</div>;

  return (
    <div style={{ 
      width: '30%', 
      margin: '0 auto',
      color: 'white',
      backgroundColor: '#1a1a1a',
      padding: '20px',
      borderRadius: '10px'
    }}>
      <h1 style={{ color: 'white', textAlign: 'center' }}>Path Statistics</h1>
      <div style={{ height: '500px', position: 'relative' }}>
        <Bar 
          data={prepareChartData()} 
          options={options} 
          plugins={[errorBarsPlugin]}
        />
      </div>
      <div style={{ 
        marginTop: '20px', 
        fontStyle: 'italic',
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center'
      }}>
        <p>Error bars represent ±1 standard deviation from the mean.</p>
      </div>
    </div>
  );
};

export default Statistics;