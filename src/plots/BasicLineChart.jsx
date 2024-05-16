import * as React from 'react';
import { useLoaderData } from "react-router-dom";

import { LineChart } from '@mui/x-charts/LineChart';

export default function BasicLineChart({data, width=500, height=300}) {
  const {nm} = useLoaderData()
  const series = data.length !== 0 ? data.map(data_item => ({data: data_item.spectre, showMark: false, color: data_item.color})) : [{data: nm, showMark: false, color: 'coral'}]
  return (
    <LineChart
      xAxis={[{ data: nm, max: nm[nm.length-1]+15, min: nm[0]-15 }]}
      series={series}
      width={width}
      height={height}
      sx={{
        '& .MuiLineElement-root': {
          // strokeDasharray: '10 5',
          strokeWidth: 4,
        },
        '& .MuiChartsAxis-tickLabel tspan': {
          fontSize: 14,
        }
      }}
    />
  );
}