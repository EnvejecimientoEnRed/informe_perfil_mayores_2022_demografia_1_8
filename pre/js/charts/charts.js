//Desarrollo de las visualizaciones
import * as d3 from 'd3';

import { numberWithCommas2 } from '../helpers';
//import { getInTooltip, getOutTooltip, positionTooltip } from './modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage, setCustomCanvas, setChartCustomCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C', 
COLOR_PRIMARY_2 = '#E37A42', 
COLOR_ANAG_1 = '#D1834F', 
COLOR_ANAG_2 = '#BF2727', 
COLOR_COMP_1 = '#528FAD', 
COLOR_COMP_2 = '#AADCE0', 
COLOR_GREY_1 = '#B5ABA4', 
COLOR_GREY_2 = '#64605A', 
COLOR_OTHER_1 = '#B58753', 
COLOR_OTHER_2 = '#731854';

export function initChart(iframe) {
    d3.csv('https://raw.githubusercontent.com/CarlosMunozDiazCSIC/informe_perfil_mayores_2022_demografia_1_8/main/data/pre_mas65_europa.csv', function(error,data) {
        if (error) throw error;
        //Botones para elegir gráfico o mapa
        let currentType = 'viz';
        
        data.sort(function(x, y){
            return d3.descending(+x.OBS_VALUE, +y.OBS_VALUE);
        });

        let margin = {top: 20, right: 30, bottom: 40, left: 100},
            width = document.getElementById('viz').clientWidth - margin.left - margin.right,
            height = document.getElementById('viz').clientHeight - margin.top - margin.bottom;

        let svg = d3.select("#viz")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let x = d3.scaleLinear()
            .domain([0, 25])
            .range([ 0, width]);

        let xAxis = function(g) {
            g.call(d3.axisBottom(x));
            g.call(function(svg) {
                svg.selectAll("text")	
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");
            });
        }

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        let y = d3.scaleBand()
                .range([ 0, height ])
                .domain(data.map(function(d) { return d.NAME; }))
                .padding(.1);

        svg.append("g")
            .call(d3.axisLeft(y));

        ///// DESARROLLO DEL GRÁFICO
        function initViz() {
            svg.selectAll("bars")
                .data(data)
                .enter()
                .append("rect")
                .attr('class','bars')
                .attr("x", x(0) )
                .attr("y", function(d) { return y(d.NAME) + 2.25; })
                .attr("width", function(d) { return x(0); })
                .attr("height", y.bandwidth() / 1.5 )
                .attr("fill", function(d) {
                    if (d.ID == 'EU27_2020' || d.ID == 'ES') {
                        return COLOR_ANAG_2;
                    } else {
                        return COLOR_PRIMARY_1;
                    }
                })
                .transition()
                .duration(1500)
                .attr("width", function(d) { return x(+d.OBS_VALUE); });
        }

        function animateViz() {
            svg.selectAll(".bars")
                .attr("width", function(d) { return x(0); })
                .transition()
                .duration(1500)
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
        //setChartCanvas();
        setTimeout(() => {
            setCustomCanvas();
        }, 6000);        

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            //setChartCanvasImage('comparativa_europa_personas_mayores');
            setChartCustomCanvasImage('comparativa_europa_personas_mayores');
        });

        //Altura del frame
        setChartHeight(iframe);
    });    
}