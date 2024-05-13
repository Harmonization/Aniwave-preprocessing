import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';


import SimpleSnackbar from './SimpleSnackbar'

export default function ColorTextFields({ changeRoi, setColor, setDescription, clickFunc, message }) {
  return (
    <Box
      component="form"
      sx={{
        '& > :not(style)': { m: 1, width: '270px' },
      }}
      noValidate
      autoComplete="off"
    >
      <TextField 
        onChange={e => changeRoi(e.target.value)}
        defaultValue={'x0=100, x1=150, y0=100, y1=150'} 
        label="Координаты ROI" 
        color="secondary" 
        focused />

      <TextField
        onChange={e => setDescription(e.target.value)}
        label="Описание"
        variant="standard"
        color="warning"
        focused
      />

      <TextField 
        onChange={e => setColor(e.target.value)} 
        defaultValue='#1ae221' 
        type='color' 
        label="Цвет ROI" 
        color="secondary" 
        focused 
      />


      <SimpleSnackbar message={message} clickFunc={clickFunc}/>

    </Box>
  );
}
