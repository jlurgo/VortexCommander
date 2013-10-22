var VistaRangerEnMapa = function(opt){
    this.o = opt;
    this.start();
};

VistaRangerEnMapa.prototype.start = function(){
    var _this = this;
    this.portal = new NodoPortalBidi();
    NodoRouter.instancia.conectarBidireccionalmenteCon(this.portal);
    this.posicionActual = this.o.posicionInicial;
    this.derrotero = [];
    this.portal.pedirMensajes(  new FiltroAND([new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.posicion"),
                                               new FiltroXClaveValor("ranger", this.o.nombre)]),
                                function(mensaje){_this.posicionRecibida(mensaje);});
    
    this.portal.pedirMensajes(  new FiltroAND([new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.confirmaciondearribo"),
                                               new FiltroXClaveValor("ranger", this.o.nombre)]),
                                function(mensaje){_this.confirmacionDeArriboRecibida(mensaje);});
    
    this.portal.pedirMensajes(  new FiltroAND([new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.goingTo"),
                                               new FiltroXClaveValor("ranger", this.o.nombre)]),
                                function(mensaje){_this.eventoGoingToRecibido(mensaje);});
    
    this.ajustarFlechaDestino = this.ajustarFlechaDestinoCuandoNoHayDestino;
    this.panear_al_recibir_posicion = false;
    this.dejar_rastro = false;
    google.maps.event.addListener(this.o.mapa, 
                                  'bounds_changed', 
                                  function(){
                                        _this.actualizarMarcadorPosicion();
                                        if(_this.dejar_rastro)_this.dibujarDerrotero();
                                  });
    this.marcador_posicion = new paper.Path.Circle(new paper.Point(-30, -30), 10);
    this.marcador_posicion.fillColor = 'red';
    this.marcador_posicion.onClick = function(){
        _this.o.mapa.panTo(_this.posicionActual);
        _this.o.onClick(_this);
    };
    this.marcador_posicion.onMouseEnter = function(event) {
        _this.marcador_posicion.fillColor = 'blue';
    }
    
    this.marcador_posicion.onMouseLeave = function(event) {
        _this.marcador_posicion.fillColor = 'red';
    }
    this.actualizarMarcadorPosicion();
};

VistaRangerEnMapa.prototype.posicionRecibida = function(posicion){
    this.posicionActual = new google.maps.LatLng(posicion.latitud,posicion.longitud);
    if(this.panear_al_recibir_posicion) this.o.mapa.panTo(this.posicionActual);
    this.derrotero.push(this.posicionActual);
    if(this.dejar_rastro)this.dibujarDerrotero();
    this.actualizarMarcadorPosicion();
};

VistaRangerEnMapa.prototype.getXYFromLatLng = function(pos){
    var overlay = new google.maps.OverlayView();
    overlay.draw = function() {};
    overlay.setMap(this.o.mapa);
    
    var proj = overlay.getProjection();
    return proj.fromLatLngToContainerPixel(pos);
}

VistaRangerEnMapa.prototype.actualizarMarcadorPosicion = function(){
    var posRanger = this.getXYFromLatLng(this.posicionActual);
    var rect = new paper.Path.Rectangle({
        point: [10,10],
        size: new paper.Size(paper.project.view.size.width - 20, paper.project.view.size.height - 20),
        visible: false
    });
    
    var recta_corte = new paper.Path()
    recta_corte.strokeWidth = 0;
    recta_corte.segments = [
       paper.project.view.center,
       [posRanger.x, posRanger.y]
    ];
    
    var intersecciones = rect.getIntersections(recta_corte);
    if(intersecciones.length>0){    
        var int = intersecciones[0].point;
        this.marcador_posicion.position = new paper.Point(int.x, int.y);
    }else{
        this.marcador_posicion.position = new paper.Point(posRanger.x, posRanger.y);
    }
    rect.remove();
    recta_corte.remove();        
};
    
VistaRangerEnMapa.prototype.confirmacionDeArriboRecibida = function(confirmacion){
    this.borrarFlechaDestino();
};
    
VistaRangerEnMapa.prototype.visibleEnElMapa = function(){
    return false;
};

VistaRangerEnMapa.prototype.eventoGoingToRecibido = function(goingTo){
    this.destino = new google.maps.LatLng(goingTo.latitud,goingTo.longitud);
    this.borrarFlechaDestino();
    this.flechaDestino = new google.maps.Polyline({
        path: [
            this.posicionActual,
            this.destino
        ],
        strokeColor: "orange",
        strokeOpacity:0.5,
        strokeWeight:2,
        icons: [{
          icon: {
                path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
            },
          offset: '100%'
        }],
        map: this.o.mapa
    });
    this.ajustarFlechaDestino = this.ajustarFlechaDestinoCuandoHayDestino;
};

VistaRangerEnMapa.prototype.borrarFlechaDestino = function(){
    if(this.flechaDestino === undefined) return;
    this.flechaDestino.setVisible(false);
    this.flechaDestino = undefined;
};

VistaRangerEnMapa.prototype.goTo = function(destino){
    this.portal.enviarMensaje({ tipoDeMensaje: "vortex.commander.goto",
                                ranger: this.o.nombre,
                                latitudDestino: destino.lat(),
                                longitudDestino: destino.lng() 
                              });
};

VistaRangerEnMapa.prototype.ajustarFlechaDestinoCuandoHayDestino = function(){
    this.flechaDestino.setPath([
        this.posicionActual,
        this.destino
    ]);
};

VistaRangerEnMapa.prototype.ajustarFlechaDestinoCuandoNoHayDestino = function(){
    
};

VistaRangerEnMapa.prototype.seleccionar = function(){
    this.marcador_posicion.strokeColor = 'black';
    this.marcador_posicion.strokeWidth = 2;
};

VistaRangerEnMapa.prototype.desSeleccionar = function(){
    this.marcador_posicion.strokeColor = 'red';
    this.marcador_posicion.strokeWidth = 0;
};

VistaRangerEnMapa.prototype.seguirConPaneo = function(){
    this.panear_al_recibir_posicion = true;
};

VistaRangerEnMapa.prototype.yaNoSeguirConPaneo = function(){
    this.panear_al_recibir_posicion = false;
};

VistaRangerEnMapa.prototype.dejarRastro = function(){
    this.dejar_rastro = true;
    this.dibujarDerrotero();
};

VistaRangerEnMapa.prototype.yaNoDejarRastro = function(){
    this.dejar_rastro = false;
    this.linea_derrotero.remove();
};

VistaRangerEnMapa.prototype.dibujarDerrotero = function(){
    if(this.linea_derrotero) this.linea_derrotero.remove();
    this.linea_derrotero = new paper.Path();
    this.linea_derrotero.strokeWidth = 10;
    this.linea_derrotero.strokeColor = 'orange';
    this.linea_derrotero.opacity = 0.7;
    this.linea_derrotero.strokeJoin = 'round';
    this.linea_derrotero.strokeCap = 'round';
    
    for(var i=0; i<this.derrotero.length; i++){
        var punto = this.getXYFromLatLng(this.derrotero[i]);
        this.linea_derrotero.add(new paper.Point(punto.x, punto.y));
    }
};

var vista_ranger_null = {
    goTo: function(){},
    seguirConPaneo: function(){}
};