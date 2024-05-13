import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { Typography } from '@mui/material';

export default function SliderSizes({min, changeFunc}) {
  return (
    <Box sx={{ width: 300 }}>
      <Typography id="input-slider" gutterBottom><strong>Длина окна фильтрации</strong></Typography>
      <Slider 
        color="secondary"
        min={min} 
        onChange={e => changeFunc(e.target.value)} 
        defaultValue={5} 
        aria-label="Default" 
        valueLabelDisplay="auto" 
      />
    </Box>
  );
}