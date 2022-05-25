//Desarrollo de las visualizaciones
import * as d3 from 'd3';
import { numberWithCommas3 } from '../helpers';
import { getInTooltip, getOutTooltip, positionTooltip } from '../modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C',
COLOR_ANAG_PRIM_3 = '#9E3515';
let tooltip = d3.select('#tooltip');

export function initChart(iframe) {
    d3.csv('https://raw.githubusercontent.com/EnvejecimientoEnRed/informe_perfil_mayores_2022_demografia_1_8/main/data/pre_mas65_europa.csv', function(error,data) {
        if (error) throw error;
        //Botones para elegir gráfico o mapa
        let currentType = 'viz';
        
        data.sort(function(x, y){
            return d3.descending(+x.OBS_VALUE, +y.OBS_VALUE);
        });

        let margin = {top: 12.5, right: 15, bottom: 25, left: 110},
            width = document.getElementById('chart').clientWidth - margin.left - margin.right,
            height = document.getElementById('chart').clientHeight - margin.top - margin.bottom;

        let svg = d3.select("#chart")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let x = d3.scaleLinear()
            .domain([0, 25])
            .range([ 0, width]);

        let xAxis = function(svg) {
            svg.call(d3.axisBottom(x).ticks(5));
            svg.call(function(g){
                g.selectAll('.tick line')
                    .attr('class', function(d,i) {
                        if (d == 0) {
                            return 'line-special';
                        }
                    })
                    .attr('y1', '0')
                    .attr('y2', `-${height}`)
            });
        }

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        let y = d3.scaleBand()
                .range([ 0, height ])
                .domain(data.map(function(d) { return d.NAME; }))
                .padding(.1);

        let yAxis = function(svg) {
            svg.call(d3.axisLeft(y));
            svg.call(function(g){g.selectAll('.tick line').remove()});
        }

        svg.append("g")
            .call(yAxis);

        ///// DESARROLLO DEL GRÁFICO
        function initViz() {
            svg.selectAll("bars")
                .data(data)
                .enter()
                .append("rect")
                .attr('class','rect')
                .attr("x", x(0) )
                .attr("y", function(d) { return y(d.NAME) + 2.25; })
                .attr("width", function(d) { return x(0); })
                .attr("height", y.bandwidth() / 1.5 )
                .attr("fill", function(d) {
                    if (d.ID == 'EU27_2020' || d.ID == 'ES') {
                        return COLOR_ANAG_PRIM_3;
                    } else {
                        return COLOR_PRIMARY_1;
                    }
                })
                .on('mouseover', function(d,i,e) {
                    //Opacidad de las barras
                    let bars = svg.selectAll('.rect');  
                    bars.each(function() {
                        this.style.opacity = '0.4';
                    });
                    this.style.opacity = '1';

                    //Texto
                    let html = '';
                    if(d.NAME == 'UE-27') {
                        html = '<p class="chart__tooltip--title">' + d.NAME + '</p>' + 
                        '<p class="chart__tooltip--text">Un <b>' + numberWithCommas3(parseFloat(d.OBS_VALUE).toFixed(1)) + '%</b> de habitantes de la Unión Europea tiene 65 años o más.</p>';
                    } else {
                        html = '<p class="chart__tooltip--title">' + d.NAME + '</p>' + 
                        '<p class="chart__tooltip--text">Un <b>' + numberWithCommas3(parseFloat(d.OBS_VALUE).toFixed(1)) + '%</b> de habitantes de este país tiene 65 años o más.</p>';
                    }                    
            
                    tooltip.html(html);

                    //Tooltip
                    positionTooltip(window.event, tooltip);
                    getInTooltip(tooltip);
                })
                .on('mouseout', function(d,i,e) {
                    //Quitamos los estilos de la línea
                    let bars = svg.selectAll('.rect');
                    bars.each(function() {
                        this.style.opacity = '1';
                    });
                
                    //Quitamos el tooltip
                    getOutTooltip(tooltip);
                })
                .transition()
                .duration(2000)
                .attr("width", function(d) { return x(+d.OBS_VALUE); });
        }

        function animateViz() {
            svg.selectAll(".rect")
                .attr("width", function(d) { return x(0); })
                .transition()
                .duration(2000)
                .attr("width", function(d) { return x(+d.OBS_VALUE); });
        }

        ///// DESARROLLO DEL MAPA

        ///// CAMBIO
        function setChart(type) {
            if(type != currentType) {
                if(type == 'viz') {
                    //Cambiamos color botón
                    document.getElementById('data_map').classList.remove('active');
                    document.getElementById('data_viz').classList.add('active');
                    //Cambiamos gráfico
                    document.getElementById('map').classList.remove('active');
                    document.getElementById('viz').classList.add('active');
                } else {
                    //Cambiamos color botón
                    document.getElementById('data_map').classList.add('active');
                    document.getElementById('data_viz').classList.remove('active');
                    //Cambiamos gráfico
                    document.getElementById('viz').classList.remove('active');
                    document.getElementById('map').classList.add('active');
                }
            }            
        }

        /////
        /////
        // Resto - Chart
        /////
        /////
        initViz();

        document.getElementById('data_viz').addEventListener('click', function() {            
            //Cambiamos gráfico
            setChart('viz');
            //Cambiamos valor actual
            currentType = 'viz';
        });

        document.getElementById('data_map').addEventListener('click', function() {
            //Cambiamos gráfico
            setChart('map');
            //Cambiamos valor actual
            currentType = 'map';
        });

        //Animación del gráfico
        document.getElementById('replay').addEventListener('click', function() {
            animateViz();

            setTimeout(() => {
                setChartCanvas(); 
            }, 4000);
        });

        /////
        /////
        // Resto
        /////
        /////

        //Iframe
        setFixedIframeUrl('informe_perfil_mayores_2022_demografia_1_8','comparativa_europa_personas_mayores');

        //Redes sociales > Antes tenemos que indicar cuál sería el texto a enviar
        setRRSSLinks('comparativa_europa_personas_mayores');

        //Captura de pantalla de la visualización
        setTimeout(() => {
            setChartCanvas(); 
        }, 4000);     

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            setChartCanvasImage('comparativa_europa_personas_mayores');
        });

        //Altura del frame
        setChartHeight();
    });    
}