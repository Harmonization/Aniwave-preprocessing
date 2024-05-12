import * as React from 'react';

import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1
  });

  export default function InputFileUpload({clickFunc}) {
    return (
      <Button
        
        onChange={clickFunc}
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
      >
        Загрузить HSI
        <VisuallyHiddenInput type="file" />
      </Button>
    );
  }

// export default function MenuButtons({clickFuncs=[]}) {
    
//   return (
//     <Stack direction="row" spacing={2}>
//       <InputFileUpload clickFunc={clickFuncs && clickFuncs[0]}/>

//       <Button color="secondary">Secondary</Button>

//       <Button variant="contained" color="success">
//         Success
//       </Button>

//       <Button variant="outlined" color="error">
//         Error
//       </Button>

//     </Stack>
//   );
// }