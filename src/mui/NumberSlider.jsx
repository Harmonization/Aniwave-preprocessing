import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { Typography } from '@mui/material';

export default function SliderSizes({min, changeFunc, value=5}) {
  return (
    <Box sx={{ width: 400 }}>
      <Typography textAlign='center' id="input-slider" gutterBottom><strong>Длина окна фильтрации</strong></Typography>
      <Slider 
        color="secondary"
        min={min}
        max={25}
        onChange={changeFunc}
        value={value}
        aria-label="Default" 
        valueLabelDisplay="auto"
      />
    </Box>
  );
}