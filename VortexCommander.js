$(function () {            
    var clienteHTTP = new NodoClienteHTTP('http://router-vortex.herokuapp.com', 100, true);             
    NodoRouter.instancia.conectarBidireccionalmenteCon(clienteHTTP);
    
    var panel_control = new PanelControlRangers();        
    panel_control.dibujarEn($('#panel_principal'))
});