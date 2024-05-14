import { useEffect, useState } from 'react'
import { useLoaderData } from "react-router-dom";
import * as XLSX from "xlsx"

import Heatmap from './plots/Heatmap'
import Lineplot from './plots/Lineplot'
import Rgb from './plots/Rgb.jsx'

import InputFileUpload from './mui/InputFileUpload'
import SmartInput from './mui/SmartInput'
import SelectStatic from './mui/SelectStatic'
import NumberSlider from './mui/NumberSlider'
import GitHubLabel from './mui/GitHubLabel'
import ColorTextFields from './mui/ColorTextFields'
import Track from './mui/Track'
import HiddenImage from './mui/HiddenImage.jsx'
import FormDialog from './mui/FormDialog'

import { Stack } from '@mui/material';
import Button from '@mui/material/Button';

const smoothMethods = {
  golay: 'Фильтр Савицкого - Голея',
  nadarai: 'Формула Надарая - Ватсона'
}

const colors = [
  'Earth',
  'Blackbody',
  'Bluered',
  'Blues',
  'Cividis',
  'Electric',
  'Greens',
  'Greys',
  'Hot',
  'Jet',
  'Picnic',
  'Portland',
  'Rainbow',
  'RdBu',
  'Reds',
  'Viridis',
  'YlGnBu',
  'YlOrRd'
]

const colorsDict = Object.assign({}, ...Object.entries({...colors}).map(([a,b]) => ({ [b]: b })))

function App() {
  const {nm, settings, parameters, inputStory} = useLoaderData()

  const [name, setName] = useState(null) // Имя текущего HSI
  const [rgb, setRgb] = useState(null)
  const [channel, setChannel] = useState(null)
  const [coordinates, setCoordinates] = useState([parameters.x, parameters.y])
  const [spectre, setSpectre] = useState(null)
  const [method, setMethod] = useState(parameters.filter)
  const [h, setH] = useState(parameters.h)
  const [expr, setExpr] = useState(inputStory[0])
  const [rois, setRois] = useState([])

  const [coordROI, setCoordROI] = useState('x0=100, x1=150, y0=100, y1=150')
  const [color, setColor] = useState('#1ae221') // Цвет ROI
  const [description, setDescription] = useState('')

  // Настройки
  const [roisStory, setRoisStory] = useState(settings)
  const [message, setMessage] = useState('')
  const [extremum, setExtremum] = useState([-1, 1]) // [min, max] из channel (для Heatmap)
  const [thr, setThr] = useState([extremum[0], extremum[1]])
  const [colorHM, setColorHM] = useState(parameters.color_HM) // Цвет Heatmap
  
  const fetchFunc = async e => {
    const files = e.target.files
    if (!files) return 

    const {name} = files[0]

    const request = `http://localhost:8000/open?name=${name}`
    const response = await fetch(request)
    const {nameHSI} = await response.json()
    setName(nameHSI)
    console.log(nameHSI)
  }

  const getChannel = async (expr) => {
    const [t1, t2] = thr
    const response = await fetch(`http://localhost:8000/bands?` + new URLSearchParams({
      expr: expr,
      t1: t1,
      t2: t2
    }));
    const { spectral_index, max, min, result } = await response.json();
    setChannel(spectral_index);
    setExtremum([min, max])
    setThr([min, max])
    console.log(result)
  };

  const pressChannel = async ({ key, target: { value } }) => {
    if (key === "Enter") {
      setExpr(value)
      getChannel(value);
    }
  };

  const clickXY = async (e) => {
    const {x, y} = e.points[0]
    setCoordinates([x, y])
    await getSpectre(x, y)
  }

  const getSpectre = async (x, y) => {
    const request = `http://localhost:8000/spectre?x=${x}&y=${y}&method=${method}&h=${h}`
    const response = await fetch(request)
    const {spectre} = await response.json()
    setSpectre(spectre)
  }

  const str2Numbers = name => {
    const [x0, x1, y0, y1] = name.split(',').map(num_str => Number(num_str.split('=')[1]))
    return [x0, x1, y0, y1]
  }

  const convert2Shapes = (rois) => {
    const union = [...rois, {name: coordROI, color}]
    return union.map(({name, color}) => {
      const [x0, x1, y0, y1] = str2Numbers(name)
      
      return {
        type: 'rect',
        x0: x0,
        y0: y0,
        x1: x1,
        y1: y1,
        line: {
          color: color
        }
      }
    })
    
  }

  const getRgb = async () => {
    const request = 'http://localhost:8000/rgb'
    const response = await fetch(request)
    const {rgb} = await response.json()
    setRgb(rgb)
  }

  useEffect(() => {
    if (!name) return 
    getSpectre(coordinates[0], coordinates[1])
  }, [h, method, name])

  useEffect(() => {
    if (name) {
      getChannel(expr)
      // getRgb()
    }
  }, [name])

  const addRoiButton = async e => {
    const response = await fetch(`http://localhost:8000/settings/add_roi?` + new URLSearchParams({
      name: coordROI,
      color: color,
      description: description
    }));
    const {data, result} = await response.json();
    setRoisStory(data)
    setMessage(result)
  }

  const thresholding = (arr, thr) => {
    // Маскирование двумерного массива
    const [t1, t2] = thr
    return arr.map(row => row.map(item => (t1 <= item && item <= t2) || item == 0 ? item : null))
  }

  const upload = async (filename) => {
    const save_filter = document.querySelectorAll('#demo-simple-select-autowidth')[1].innerHTML
    const [text1, slider1, slider2, text2] = document.querySelectorAll("input[aria-labelledby='track-inverted-range-slider']")
    const selectors = document.querySelectorAll(".rois-panel > .MuiBox-root> .MuiBox-root")

    const request = `http://localhost:8000/upload?`
    const response = await fetch(request, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        method: Object.keys(smoothMethods).filter(item => smoothMethods[item]==save_filter)[0],
        h: document.querySelector("input[step='1']").value,
        expr: document.querySelector('#free-solo-2-demo').value,
        t1: slider1.value,
        t2: slider2.value,
        rois: Array.from(selectors).map(selector => str2Numbers(selector.innerHTML)), // Двумерный массив
        filename: filename
      })
    })
    
    const result = await response.json()
    console.log(result)
  }

  const saveSpectre2Xlsx = () => {

    const dataaa = spectre.map((val, indx) => ({band: indx, nm: nm[indx], value: val}))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(dataaa)
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1')
    XLSX.writeFile(wb, 'table.xlsx')
  }

  return (
    <>
    <div className="page">
      
      <InputFileUpload clickFunc={fetchFunc}/>

      {name && <FormDialog submitFunc={upload}/>}

      {spectre && <Button onClick={saveSpectre2Xlsx} variant="contained">Таблица спектра</Button>}

      <div className="workflow">

        <div className="head-panel">


          <Stack direction={'row'} spacing={5}>

            {name && <SmartInput pressChannel={pressChannel} dopFunc={getChannel} story={inputStory} defaultValue={inputStory[0]}/>}
            {rgb && <HiddenImage component={<Rgb rgb={rgb} />} title='Цветное изображение'/>}

          </Stack>


          <Stack direction={'row'} spacing={5}>

            {channel && <SelectStatic menuItems={colorsDict} currentValue={colorHM} changeFunc={setColorHM} title='Раскраска'/>}
            {channel && <Track changeFunc={setThr} min={extremum[0]} max={extremum[1]}/>}

            <div className="filter-panel">

            <Stack ml={5}>

              {name && <SelectStatic menuItems={smoothMethods} currentValue={method} changeFunc={setMethod} title='Сглаживание' nullElem={true}/>}
              {name && <NumberSlider min={method == 'golay' ? 3 : 1} changeFunc={setH}/>}

            </Stack>

        </div>

          </Stack>

        </div>

        <div className="plots">
          <Stack direction={'row'}>

            {channel && <Heatmap z={thresholding(channel, thr)} clickFunc={clickXY} color={colorHM} shapes={convert2Shapes(rois)}/>}
            {spectre && <Lineplot x={nm} y={spectre} title={`x=${coordinates[0]}, y=${coordinates[1]}`} width={450} height={450}/>}

          </Stack>
        </div>

        <div className="rois-panel">

            {name && <ColorTextFields 
              changeRoi={setCoordROI}
              setColor={setColor} 
              setDescription={setDescription}
              clickFunc={addRoiButton}
              message={message}
          />}

        {name && <GitHubLabel labels={roisStory} pendingValue={rois} setPendingValue={setRois}/>}

        </div>

      </div>

    </div>
    </>
  )
}

export default App
