import { useEffect, useState } from 'react'
import { useLoaderData } from "react-router-dom";
import * as XLSX from "xlsx"

import Heatmap from './plots/Heatmap'
import BasicLineChart from './plots/BasicLineChart';

import InputFileUpload from './mui/InputFileUpload'
import SmartInput from './mui/SmartInput'
import SelectStatic from './mui/SelectStatic'
import NumberSlider from './mui/NumberSlider'
import Track from './mui/Track'
import ColorSwitch from './mui/ColorSwitch';
import CheckboxListSecondary from './mui/CheckboxListSecondary'

import { Stack } from '@mui/material';
import Button from '@mui/material/Button';

import getRandomColor from './getRandomColor'

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
  const {nm, settings} = useLoaderData()

  const [name, setName] = useState(null) // Имя текущего HSI

  const [sign, setSign] = useState({
    spectres: [],
    filter: settings.filter,
    h: settings.h
  })

  const [hmap, setHmap] = useState({
    expression: settings.channel,
    index_story: settings.index_story,
    channel: null, 
    colormap: settings.colormap, 
    min_thr: settings.t1, 
    max_thr: settings.t2, 
    min_lim: -1, 
    max_lim: 1, 
    type: 'heatmap'
  })

  const [roi, setRoi] = useState(settings.rois_story.map(roi_str => ({roi_str, active: false, color: getRandomColor()})))
  
  useEffect(() => {
    if (name) getChannel()
  }, [name, hmap.expression])

  useEffect(() => {
    reloadSpectres()
  }, [sign.filter, sign.h])

  const openHSI = async e => {
    const files = e.target.files
    if (!files) return 

    const {name} = files[0]

    const request = `http://localhost:8000/open?name=${name}`
    const response = await fetch(request)
    const {nameHSI} = await response.json()
    setName(nameHSI)
  }

  const getChannel = async () => {
    const response = await fetch(`http://localhost:8000/bands?` + new URLSearchParams({expr: hmap.expression}));
    const { spectral_index, max, min } = await response.json();
    setHmap({...hmap,
      channel: spectral_index, 
      min_lim: Math.floor(min*100)/100, 
      max_lim: Math.ceil(max*100)/100
    })
  };

  const pressChannel = async e => {
    if (e.type === 'keydown' && e.key === "Enter" || e.type === 'blur') {
      setHmap({...hmap, expression: e.target.value})}
  };

  const reloadSpectres = async () => {
    const new_spectres = await Promise.all(
      sign.spectres.map(async spec => ({
          ...spec,
          spectre: await fetchSpectre(spec.x, spec.y)
        })
      )
    )
    setSign({...sign, spectres: new_spectres})
  }

  const setSmartSpectre = async e => {
    if (e.key == 'Enter') {
      const str = e.target.value.split(' | ')
      const xy_arr = str.filter(item => item)
      console.log(xy_arr)
      if (xy_arr.length === 0) {
        setSign({...sign, spectres: []})
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
      if (res.length !== 0) setSign({...sign, spectres: res})
    }
  }

  const fetchSpectre = async (x, y) => {
    const request = `http://localhost:8000/spectre?x=${x}&y=${y}&method=${sign.filter}&h=${sign.h}`
    const response = await fetch(request)
    const {spectre} = await response.json()
    return spectre
  }

  const pushSpectre = async e => {
    const {x, y} = e.points[0]
    const spectre = await fetchSpectre(x, y)
    setSign({...sign, spectres: [...sign.spectres, {x, y, spectre, color: getRandomColor()}]})
  }

  const str2Numbers = name => {
    const [x0, x1, y0, y1] = name.split(',').map(num_str => Number(num_str.split('=')[1]))
    return [x0, x1, y0, y1]
  }

  const convert2Shapes = () => {
    const filter_settings = roi.filter(el => el.active)
    const rectangles = filter_settings.map(el => {
      const [x0, x1, y0, y1] = str2Numbers(el.roi_str)
      return {
        type: 'rect',
        x0: x0,
        y0: y0,
        x1: x1,
        y1: y1,
        line: {
          color: el.color
        }
      }
    })
    return [...rectangles, ...sign.spectres.map(spec => ({
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

  const thresholding = arr => {
    // Маскирование двумерного массива
    return arr.map(row => row.map(item => (hmap.min_thr <= item && item <= hmap.max_thr) || item == 0 ? item : null))
  }

  const upload = async filename => {
    const request = `http://localhost:8000/upload?`
    const response = await fetch(request, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        method: sign.filter,
        h: sign.h,
        expr: hmap.expression,
        t1: hmap.min_thr,
        t2: hmap.max_thr,
        rois: roi.filter(el => el.active).map(el => str2Numbers(el.roi_str)), // Двумерный массив
        filename
      })
    })
    
    const result = await response.json()
    console.log(result)
  }

  const saveSpectre2Xlsx = () => {
    let start = nm.map((val, indx) => ({band: indx, nm: val}))
    sign.spectres.forEach(spec => {
      start = start.map((item, indx) => ({...item, [`${spec.x},${spec.y}`]: spec.spectre[indx]}))
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(start)
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1')
    XLSX.writeFile(wb, 'Спектры.xlsx')
  }

  const saveSettings = async () => {
    console.log(roi.map(el => el.roi_str))
    const request = `http://localhost:8000/settings/save?`
    const response = await fetch(request, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        channel: hmap.expression,
        index_story: hmap.index_story,
        rois_story: roi.map(el => el.roi_str), // Двумерный массив
        colormap: hmap.colormap,
        filter: sign.filter,
        h: sign.h,
        t1: hmap.min_thr,
        t2: hmap.max_thr
      })
    })
    
    const result = await response.json()
    console.log(result)
  }

  return (
    <div className="page">

      <InputFileUpload clickFunc={openHSI}/>

      {hmap.channel && <Button onClick={saveSettings}>Сохранить настройки</Button>}

      {hmap.channel && <div className="workflow">

        <Stack direction={'row'} spacing={5}>
          <SmartInput pressChannel={pressChannel} story={hmap.index_story} defaultValue={hmap.expression} title='Умный индекс'/>
          <SelectStatic menuItems={colorsDict} value={hmap.colormap} handleChange={e => setHmap({...hmap, colormap: e.target.value})} title='Раскраска'/>
          <SelectStatic menuItems={smoothMethods} value={sign.filter} handleChange={e => setSign({...sign, filter: e.target.value})} title='Сглаживание' nullElem={true}/>
        </Stack>

        <Stack direction={'row'} spacing={5}>

          <div className="switch-plot-type">
            <ColorSwitch handleChange={e => setHmap({...hmap, type: ['surface', 'heatmap'][Number(e.target.checked)]})}/>
          </div>
          <Track value={[hmap.min_thr, hmap.max_thr]} handleChange={(e, newValue)=> setHmap({...hmap, min_thr: newValue[0], max_thr: newValue[1]})} min={hmap.min_lim} max={hmap.max_lim}/>
          <NumberSlider min={3} changeFunc={e => setSign({...sign, h: e.target.value})} value={sign.h}/>

        </Stack>

        <div className="plots">
          <Stack direction={'row'}>

            <Heatmap z={thresholding(hmap.channel)} clickFunc={pushSpectre} color={hmap.colormap} shapes={convert2Shapes()} type={hmap.type}/>

            <Stack>
              <Stack direction={'row'}>
                <SmartInput pressChannel={setSmartSpectre} value={sign.spectres.map(item=>`${item.x},${item.y}`).join(' | ')} title='Умный спектр'/>
                <Button sx={{mt:3, width: 'max-content'}} onClick={saveSpectre2Xlsx} variant="contained">Save</Button>
              </Stack>
              <BasicLineChart data={sign.spectres} width={640} height={450}/>
            </Stack>

          </Stack>
        </div>

        <CheckboxListSecondary itemStory={roi} setItem={setRoi} submitFunc={upload}/>

      </div>}
    </div>
  )
}

export default App
