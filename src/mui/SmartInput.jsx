import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

export default function SmartInput({ pressChannel, dopFunc, defaultValue='', value=null, story = [], title='Умная строка' }) {
  return (
    <Autocomplete
      value={value || defaultValue}
      // defaultValue={defaultValue}
      onKeyDown={pressChannel}
      onBlur={e => dopFunc(e.target.value)}
      freeSolo
      id="free-solo-2-demo"
      disableClearable
      options={story}
      style={{ width: 500, margin: 15 }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={title}
          InputProps={{
            ...params.InputProps,
            type: "search",
          }}
        />
      )}
    />
  );
}