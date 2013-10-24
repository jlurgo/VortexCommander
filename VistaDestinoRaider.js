var VistaDestinoRaider = function(opt){
    $.extend(true, this, opt);
    this.start();
};

VistaDestinoRaider.prototype.start = function(){
    var _this = this;
    this.portal = new NodoPortalBidi();
    NodoRouter.instancia.conectarBidireccionalmenteCon(this.portal);
    
    this.portal.pedirMensajes(  new FiltroAND([new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.posicion"),
                                               new FiltroXClaveValor("ranger", this.nombreRaider)]),
                                function(mensaje){_this.posicionRecibida(mensaje);});
    
    this.portal.pedirMensajes(  new FiltroAND([new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.confirmaciondearribo"),
                                               new FiltroXClaveValor("ranger", this.nombreRaider)]),
                                function(mensaje){_this.confirmacionDeArriboRecibida(mensaje);});
    
    this.portal.pedirMensajes(  new FiltroAND([new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.goingTo"),
                                               new FiltroXClaveValor("ranger", this.nombreRaider)]),
                                function(mensaje){_this.eventoGoingToRecibido(mensaje);});
    
    this.ajustarFlecha = this.ajustarFlecha_cuando_no_hay_destino;
    this.cuerpo_flecha = new paper.Path();
    this.cuerpo_flecha.strokeWidth = 10;
    this.cuerpo_flecha.opacity = 0.5;    
    this.cuerpo_flecha.strokeColor = 'red';
    
    this.punta_flecha = new paper.Path();   
    this.punta_flecha.fillColor = 'red';      
    this.punta_flecha.closed = true;      
    this.punta_flecha.opacity = 0.5;
    
    google.maps.event.addListener(this.mapa, 
                              'bounds_changed', 
                              function(){
                                  _this.ajustarFlecha();
                              });
};

VistaDestinoRaider.prototype.posicionRecibida = function(posicion){
    this.posicionActualRaider = new google.maps.LatLng(posicion.latitud,posicion.longitud);
    this.ajustarFlecha();
};

VistaDestinoRaider.prototype.eventoGoingToRecibido = function(goingTo){
    this.destinoRaider = new google.maps.LatLng(goingTo.latitud,goingTo.longitud);
    this.ajustarFlecha = this.ajustarFlecha_cuando_hay_destino;
    this.ajustarFlecha();
};

VistaDestinoRaider.prototype.confirmacionDeArriboRecibida = function(confirmacion){
    this.destinoRaider = null;
    this.ajustarFlecha = this.ajustarFlecha_cuando_no_hay_destino;   
};

VistaDestinoRaider.prototype.ajustarFlecha_cuando_hay_destino = function(){
    var xyOrigenFlecha = this.mapa.getPointFromLatLng(this.posicionActualRaider);
    var xyPuntaFlecha = this.mapa.getPointFromLatLng(this.destinoRaider);

    var versor_destino = xyPuntaFlecha.add(xyOrigenFlecha.multiply(-1)).normalize(25);
    this.punta_flecha.segments =[
        xyPuntaFlecha.add(versor_destino.rotate(155)),
        xyPuntaFlecha,
        xyPuntaFlecha.add(versor_destino.rotate(-155))
    ];
    
    var linea_corte = new paper.Path();
    linea_corte.segments = [
       xyOrigenFlecha,
       xyPuntaFlecha.add(versor_destino.normalize(2).multiply(-1))
    ]; 
    var intersecciones_con_punta_flecha = this.punta_flecha.getIntersections(linea_corte);
    linea_corte.remove();
    
    var xy_fin_cuerpo_flecha = xyOrigenFlecha;
    if(intersecciones_con_punta_flecha.length > 0){
        xy_fin_cuerpo_flecha = intersecciones_con_punta_flecha[0]; 
    };
    
    this.cuerpo_flecha.segments = [
       xyOrigenFlecha,
       xy_fin_cuerpo_flecha
    ];
};

VistaDestinoRaider.prototype.ajustarFlecha_cuando_no_hay_destino = function(){
    
};
