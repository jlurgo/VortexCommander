$(function () {            
    Vx.conectarCon(new NodoClienteHTTP('http://router-vortex.herokuapp.com'));
    //Vx.conectarCon(new NodoConectorSocket('https://server-vortex.herokuapp.com'));
    
    var panel_control = new PanelControlRangers();        
    panel_control.dibujarEn($('#panel_principal'))
});

(function() {
        var canvas = document.getElementById('layer_commander'),
                context = canvas.getContext('2d');

        // resize the canvas to fill browser window dynamically
        window.addEventListener('resize', resizeCanvas, false);
        
        function resizeCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                
                /**
                 * Your drawings need to be inside this function otherwise they will be reset when 
                 * you resize the browser window and the canvas goes will be cleared.
                 */
                drawStuff(); 
        }
        resizeCanvas();
        
        function drawStuff() {
                // do your drawing stuff here
        }
})();
