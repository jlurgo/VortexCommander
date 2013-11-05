$(function () {            
    //var clienteHTTP = new NodoClienteHTTP('http://router-vortex.herokuapp.com', 1000); 
    var socket = io.connect('https://router-vortex.herokuapp.com');
    var adaptador = new NodoConectorSocket(socket);    
    NodoRouter.instancia.conectarBidireccionalmenteCon(adaptador);
    
    var panel_control = new PanelControlRangers();        
    panel_control.dibujarEn($('#panel_principal'))
});