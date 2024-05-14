import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';

const Input = styled(MuiInput)`
  width: 50px;
`;

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

  const [value, setValue] = React.useState([min, max]);

  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
    changeFunc(event.target.value)
  };

  // const handleInputChange = (event) => {
  //   setValue(event.target.value === '' ? [0, 0] : [Number(event.target.value[0]), Number(event.target.value[1])]);
  // };

  // const handleBlur = () => {
  //   if (value < min) {
  //     setValue([min, value[1]]);
  //   } else if (value > max) {
  //     setValue([value[0], max]);
  //   }
  // };

  return (
    <Box sx={{ width: 450 }} ml={3}>
      <Typography textAlign='center' id="track-inverted-range-slider" gutterBottom>
        <strong>Отделение от фона</strong>
      </Typography>
      <Grid container spacing={3} alignItems="center">

      <Grid item>
            <Input
              value={Math.round(value[0]*100)/100}
              size="small"
              // onChange={handleInputChange}
              // onBlur={handleBlur}
              inputProps={{
                step: 0.01,
                min: min,
                max: max,
                type: 'number',
                'aria-labelledby': 'track-inverted-range-slider',
              }}
            />
        </Grid>
        <Grid item xs>

            <Slider
            value={value}
              onChange={handleSliderChange}
              aria-labelledby="track-inverted-range-slider"
              // getAriaValueText={valuetext}
              // defaultValue={[min, max]}
              step={0.01}
              min={min}
              max={max}
              marks={marks}
              color="secondary"
            />
        </Grid>
          <Grid item>
            <Input
              value={Math.round(value[1]*100)/100}
              size="small"
              // onChange={handleInputChange}
              // onBlur={handleBlur}
              inputProps={{
                step: 0.01,
                min: min,
                max: max,
                type: 'number',
                'aria-labelledby': 'track-inverted-range-slider',
              }}
            />

        </Grid>

      </Grid>
    </Box>
  );
}