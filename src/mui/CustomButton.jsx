import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { purple } from '@mui/material/colors';

const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(purple[500]),
  backgroundColor: purple[500],
  '&:hover': {
    backgroundColor: purple[700],
  },
}));

export default function CustomButton({clickFunc}) {
  return (
    <ColorButton onClick={e => clickFunc(e.target.value)} variant="contained">Добавить / Удалить ROI</ColorButton>
  );
}
