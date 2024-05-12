import { useState } from 'react'
import { useLoaderData } from "react-router-dom";

import Heatmap from './plots/Heatmap'
import Lineplot from './plots/Lineplot'

import InputFileUpload from './mui/InputFileUpload'
import SmartInput from './mui/SmartInput'

const inputStory = [
  'b70',
  'b203',
  'b150 + sin(b140)',
  'b100 - b40',
  'b30 * b60'
]

function App() {
  const [name, setName] = useState(null) // Имя текущего HSI
  const [channel, setChannel] = useState(null)
  const [coordinates, setCoordinates] = useState([0, 0])
  const [spectre, setSpectre] = useState(null)

  const {nm} = useLoaderData()

  const fetchFunc = async e => {
    const files = e.target.files
    if (!files) return 

    const {name} = files[0]

    const request = `http://localhost:8000/open?name=${name}`
    const response = await fetch(request)
    const {nameHSI} = await response.json()
    setName(nameHSI)
    console.log(nameHSI)
    setChannel(null)
    setSpectre(null)
  }

  const getChannel = async (expr) => {
    const response = await fetch(`http://localhost:8000/bands?` + new URLSearchParams({
      expr: expr
    }));
    const { spectral_index } = await response.json();
    setChannel(spectral_index);
  };

  const pressChannel = async ({ key, target: { value } }) => {
    if (key === "Enter") {
      getChannel(value);
    }
  };

  const clickXY = async (e) => {
    const {x, y} = e.points[0]
    setCoordinates([x, y])
    await getSpectre(x, y)
  }

  const getSpectre = async (x, y) => {
    const request = `http://localhost:8000/spectre?x=${x}&y=${y}`
    const response = await fetch(request)
    const {spectre} = await response.json()
    console.log(spectre)
    setSpectre(spectre)
  }

  return (
    <>
      <InputFileUpload clickFunc={fetchFunc}/>

      <div className="workflow">

        {name && <SmartInput pressChannel={pressChannel} story={inputStory} />}
        {channel && <Heatmap z={channel} clickFunc={clickXY}/>}
        {spectre && <Lineplot x={nm} y={spectre} title={`x=${coordinates[0]}, y=${coordinates[1]}`}/>}

      </div>
    </>
  )
}

export default App
