import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

// const marks = [
//   {
//     value: -1,
//     label: '-1',
//   },
//   {
//     value: 0,
//     label: '0',
//   },
//   {
//     value: 1,
//     label: '1',
//   },
// ];

function valuetext(value) {
  return `${value}°C`;
}

export default function Track({changeFunc, min=-1, max=1}) {
  const stepLabel = (max - min) / 4
  const marks = [{
    value: 0,
    label: `0`
  }]
  for (let i = min; i <= max; i+=stepLabel) {
    marks.push({
      value: i,
      label: `${Math.round(i*100)/100}`
    })
  }

  return (
    <Box sx={{ width: 450 }} ml={3}>
      <Typography id="track-inverted-range-slider" gutterBottom>
        <strong>Отделение от фона</strong>
      </Typography>
      <Slider
        onChange={e => changeFunc(e.target.value)}
        aria-labelledby="track-inverted-range-slider"
        // getAriaValueText={valuetext}
        defaultValue={[min, max]}
        step={0.01}
        min={min}
        max={max}
        marks={marks}
      />
    </Box>
  );
}