import { useEffect, useState } from 'react'
import { useLoaderData } from "react-router-dom";
import * as XLSX from "xlsx"

import Heatmap from './plots/Heatmap'
import BasicLineChart from './plots/BasicLineChart';

import InputFileUpload from './mui/InputFileUpload'
import SmartInput from './mui/SmartInput'
import SelectStatic from './mui/SelectStatic'
import NumberSlider from './mui/NumberSlider'
import GitHubLabel from './mui/GitHubLabel'
import ColorTextFields from './mui/ColorTextFields'
import Track from './mui/Track'
import FormDialog from './mui/FormDialog'
import ColorSwitch from './mui/ColorSwitch';

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

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function App() {
  const {nm, settings, parameters, inputStory} = useLoaderData()

  const [name, setName] = useState(null) // Имя текущего HSI
  const [channel, setChannel] = useState(null)
  const [spectre, setSpectre] = useState(null)
  const [rois, setRois] = useState([])
  const [filter, setFilter] = useState('golay')
  const [plotType, setPlotType] = useState('heatmap')
  const [xy, setXy] = useState([10, 20])
  const [spectres, setSpectres] = useState([])

  // Настройки
  const [roisStory, setRoisStory] = useState(settings)
  const [message, setMessage] = useState('')
  const [extremum, setExtremum] = useState([-1, 1]) // [min, max] из channel (для Heatmap)
  const [colorHM, setColorHM] = useState(parameters.color_HM) // Цвет Heatmap
  const [thr, setThr] = useState([extremum[0], extremum[1]])
  
  // Нахождение значений нижнего уровня
  const getH = () => document.querySelector("input[step='1']").value
  const getExpr = () => document.querySelector('#free-solo-2-demo').value || inputStory[0]
  const getCurRoi = () => document.querySelector("input[value^='x0=']").value
  const getColorRoi = () => document.querySelector("input[type='color']").value
  const getDescriptionRoi = () => document.querySelector("input[value='']").value

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

  const getChannel = async () => {
    const response = await fetch(`http://localhost:8000/bands?` + new URLSearchParams({
      expr: getExpr()
    }));
    const { spectral_index, max, min, result } = await response.json();
    setChannel(spectral_index);
    setExtremum([Math.floor(min*100)/100, Math.ceil(max*100)/100])
    console.log(result)
  };

  const pressChannel = async ({ key, target: { value } }) => {
    if (key === "Enter") {
      // setExpr(value)
      getChannel(value);
    }
  };

  const clickXY = async (e) => {
    const {x, y} = e.points[0]
    setXy([x, y])
    await getSpectre(x, y)
  }

  const reloadSpectres = async e => {
    const new_spectres = await Promise.all(
      spectres.map(async spec => ({
          x: spec.x,
          y: spec.y,
          spectre: await fetchSpectre(spec.x, spec.y, e.target.value),
          color: getRandomColor()
        })
      )
    )
    console.log(new_spectres)
    setSpectres(new_spectres)
  }

  const setSmartSpectre = async e => {
    if (e.key == 'Enter') {
      const str = e.target.value.split(' | ')
      const xy_arr = str.filter(item => item)
      console.log(xy_arr)
      if (xy_arr.length === 0) {
        setSpectres([])
        return
      }
      const spec_arr = await Promise.all(
        xy_arr.map(async xy_item => {
          const [x, y] = xy_item.split(',').map(el => Number(el))
          const spectre = await fetchSpectre(x, y)
          return {x, y, spectre, color: getRandomColor()}
        })
      )
      const res = spec_arr.filter(item => item.spectre)
      console.log(res)
      console.log(res.length !== 0)
      if (res.length !== 0) setSpectres(res)
    }
  }

  const getSmoothMethod = () => {
    const save_filter = document.querySelectorAll('#demo-simple-select-autowidth')[1]
    if (save_filter.querySelector('span')) return '' // Если без фильтра
    return Object.keys(smoothMethods).filter(item => smoothMethods[item]==save_filter.innerHTML)[0]
  }

  const fetchSpectre = async (x, y, h) => {
    const method = getSmoothMethod()
    const request = `http://localhost:8000/spectre?x=${x}&y=${y}&method=${method}&h=${h || getH()}`
    const response = await fetch(request)
    const {spectre} = await response.json()
    return spectre
  }

  const getSpectre = async (x, y) => {
    const spectre = await fetchSpectre(x, y)
    setSpectre(spectre)
    setSpectres([...spectres, {x, y, spectre, color: getRandomColor()}])
  }

  const str2Numbers = name => {
    const [x0, x1, y0, y1] = name.split(',').map(num_str => Number(num_str.split('=')[1]))
    return [x0, x1, y0, y1]
  }

  const convert2Shapes = (rois) => {
    const union = [...rois, {name: getCurRoi(), color: getColorRoi()}]
    const rectangles = union.map(({name, color}) => {
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
    return [...rectangles, ...spectres.map(spec => ({
      type: 'circle',
      xref: 'x',
      yref: 'y',
      fillcolor: spec.color,
      x0: spec.x-3,
      y0: spec.y-3,
      x1: spec.x+3,
      y1: spec.y+3,
      line: {
        color: spec.color
      }
    }))]
  }

  useEffect(() => {
    if (name) {
      getChannel()
    }
  }, [name])

  const addRoiButton = async e => {
    const response = await fetch(`http://localhost:8000/settings/add_roi?` + new URLSearchParams({
      name: getCurRoi(),
      color: getColorRoi(),
      description: getDescriptionRoi()
    }));
    const {data, result} = await response.json();
    setRoisStory(data)
    setMessage(result)
  }

  const thresholding = (arr) => {
    // Маскирование двумерного массива
    const [t1, t2] = thr
    return arr.map(row => row.map(item => (t1 <= item && item <= t2) || item == 0 ? item : null))
  }

  const upload = async (filename) => {
    const [t1, t2] = thr
    const selectors = document.querySelectorAll(".rois-panel > .MuiBox-root> .MuiBox-root")

    const request = `http://localhost:8000/upload?`
    const response = await fetch(request, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        method: getSmoothMethod(),
        h: getH(),
        expr: getExpr(),
        t1,
        t2,
        rois: Array.from(selectors).map(selector => str2Numbers(selector.innerHTML)), // Двумерный массив
        filename
      })
    })
    
    const result = await response.json()
    console.log(result)
  }

  const saveSpectre2Xlsx = () => {
    let start = nm.map((val, indx) => ({band: indx, nm: val}))
    spectres.forEach((spec, indx_spec) => {
      start = start.map((item, indx) => ({...item, [`${spec.x},${spec.y}`]: spec.spectre[indx]}))
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(start)
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1')
    XLSX.writeFile(wb, 'Спектры.xlsx')
  }

  return (
    <>
    <div className="page">
      
      <InputFileUpload clickFunc={fetchFunc}/>

      {name && <FormDialog submitFunc={upload}/>}

      <div className="workflow">

        <div className="head-panel">

        <Stack direction={'row'} spacing={5}>
          {name && <SmartInput pressChannel={pressChannel} dopFunc={getChannel} story={inputStory} defaultValue={inputStory[0]} title='Умный индекс'/>}
          {channel && <SelectStatic menuItems={colorsDict} value={colorHM} handleChange={e => setColorHM(e.target.value)} title='Раскраска'/>}
          {name && <SelectStatic menuItems={smoothMethods} value={filter} handleChange={e => setFilter(e.target.value)} title='Сглаживание' nullElem={true}/>}

        </Stack>

        <Stack direction={'row'} spacing={5}>

          <div className="switch-plot-type">
            
          {name && <ColorSwitch handleChange={e => setPlotType(['surface', 'heatmap'][Number(e.target.checked)])}/>}
          </div>
          {channel && <Track value={thr} handleChange={(e, newValue)=> setThr(newValue)} min={extremum[0]} max={extremum[1]}/>}
          {name && <NumberSlider min={3} changeFunc={e => reloadSpectres(e)} />}

        </Stack>

        </div>

        <div className="plots">
          <Stack direction={'row'}>

            {channel && <Heatmap z={thresholding(channel)} clickFunc={clickXY} color={colorHM} shapes={convert2Shapes(rois)} type={plotType}/>}

            <Stack>
              <Stack direction={'row'}>
                {channel && <SmartInput pressChannel={setSmartSpectre} value={spectres.map(item=>`${item.x},${item.y}`).join(' | ')} title='Умный спектр'/>}
                {spectre && <Button sx={{mt:3, width: 'max-content'}} onClick={saveSpectre2Xlsx} variant="contained">Save</Button>}
              </Stack>
              {spectres.length !==0 && <BasicLineChart data={spectres} width={640} height={450}/>}
            </Stack>

          </Stack>
        </div>

        <div className="rois-panel">

            {name && <ColorTextFields
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
