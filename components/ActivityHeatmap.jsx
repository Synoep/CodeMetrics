import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const ActivityHeatmap = ({ data, year }) => {
  // Transform the data into the format expected by react-calendar-heatmap
  const heatmapData = data.map(item => ({
    date: item.date,
    count: item.count
  }));

  // Custom color scale for the heatmap
  const colorScale = [
    { threshold: 0, color: '#1a1a1a' },    // No activity
    { threshold: 1, color: '#0e4429' },    // Low activity
    { threshold: 3, color: '#006d32' },    // Medium activity
    { threshold: 5, color: '#26a641' },    // High activity
    { threshold: 7, color: '#39d353' }     // Very high activity
  ];

  return (
    <div className="bg-[#0c1c29] rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Activity Heatmap</h2>
      <div className="overflow-x-auto">
        <CalendarHeatmap
          startDate={new Date(year, 0, 1)}
          endDate={new Date(year, 11, 31)}
          values={heatmapData}
          classForValue={(value) => {
            if (!value) return 'color-empty';
            return `color-scale-${Math.min(Math.floor(value.count / 2), 4)}`;
          }}
          tooltipDataAttrs={value => ({
            'data-tip': value.date 
              ? `${value.date}: ${value.count} submissions`
              : 'No submissions'
          })}
        />
      </div>
      <div className="flex justify-end mt-4 space-x-2">
        {colorScale.map((scale, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-sm mr-1"
              style={{ backgroundColor: scale.color }}
            />
            <span className="text-sm text-gray-400">
              {index === 0 ? '0' : 
               index === colorScale.length - 1 ? `${scale.threshold}+` : 
               scale.threshold}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityHeatmap; 