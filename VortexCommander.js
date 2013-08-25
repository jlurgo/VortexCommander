$(function () {            
    var clienteHTTP = new NodoClienteHTTP('http://router-vortex.herokuapp.com', 100);             
    NodoRouter.instancia.conectarBidireccionalmenteCon(clienteHTTP);
    
    var nodo_app_vcommander = new AppVortexCommander();        
    nodo_app_vcommander.dibujarEn($('#panel_principal'))
});