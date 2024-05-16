import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

export default function Track({value, handleChange, min=-1, max=1}) {
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
      <Typography textAlign='center' id="track-inverted-range-slider" gutterBottom>
        <strong>Отделение от фона</strong>
      </Typography>
      <Grid container spacing={3} alignItems="center">

      
        <Grid item xs>

            <Slider
            value={value}
              onChange={handleChange}
              aria-labelledby="track-inverted-range-slider"
              valueLabelDisplay="auto" 
              step={0.01}
              min={min}
              max={max}
              marks={marks}
              color="secondary"
            />
        </Grid>
          

      </Grid>
    </Box>
  );
}