
import Plot from 'react-plotly.js'

export default function Heatmap({z, clickFunc, width=600, height=500, color='Earth', type, shapes=[]}) {
    return (
      <div className="heatmap-item">
        <Plot 
          data={[
            {
              z,
              type,
              colorscale: color,
              zsmooth: 'fast'
            }
          ]} 
          onClick={async e => clickFunc(e)}
          layout={{
            xaxis: {
              ticks: '',
              showticklabels: false,
              showgrid: false
            },
            yaxis: {
              ticks: '',
              showticklabels: false,
              showgrid: false
            },
            shapes: shapes,
            width: width, 
            height: height,
            margin: {t: 0, b: 0, l: 0, r: 0},
            template: "plotly_white",
            x: 0.11,
            xanchor: "left",
            y: 1.1,
            yanchor: "top",
            showactive: true,
            paper_bgcolor: 'rgba(119, 204, 247, .01)',
            plot_bgcolor: 'rgba(119, 204, 247, .01)',
            }}
        />
      </div>
    )
  }
  