var VistaRangerEnMapa = function(opt){
    this.o = opt;
    this.start();
};

VistaRangerEnMapa.prototype.start = function(){
    var _this = this;
    this.portal = new NodoPortalBidi();
    NodoRouter.instancia.conectarBidireccionalmenteCon(this.portal);
    
    this.marcador_posicion = new google.maps.Marker({
        map: this.o.mapa,
        title:this.o.nombre,
        position: this.o.posicionInicial,
        animation: google.maps.Animation.DROP,
        icon:"vortex_icon.png"
    });
    
    this.derrotero = [];
    this.linea_derrotero = new google.maps.Polyline({
        path: this.derrotero,
        strokeColor: "#CC55AA",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: this.o.mapa
    });
    
    this.label_nombre = new google.maps.InfoWindow({
        content: $("#plantilla_label_ranger").clone().text(this.o.nombre)[0]
    });
    
    var mouse_down = false;
    google.maps.event.addListener(this.marcador_posicion, 'mousedown', function(event) {
        mouse_down = true;
    });
    
    google.maps.event.addListener(this.marcador_posicion, 'mouseup', function(event) {
        if(mouse_down) _this.o.onClick(_this, event);  
         mouse_down = false;
    });
    
    this.label_nombre.open(this.o.mapa,this.marcador_posicion);
    
    setTimeout(function(){
        _this.label_nombre.close();
    },1000);
    
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
                                        _this.actualizarMarcadorPeriferico();
                                  });
    google.maps.event.addListener(this.o.mapa, 
                                  'click', 
                                  function(evt){
                                        _this.alClickearMapaEn(evt.latLng);
                                  });
};

VistaRangerEnMapa.prototype.alClickearMapaEn = function(pos){
    if(this.marcador_periferico){
        var xy_click = this.getXYFromLatLng(pos);
        if(this.marcador_periferico.contains(new paper.Point(xy_click.x, xy_click.y))){
            this.o.mapa.panTo(this.posicionActual);
        }
    }
};

VistaRangerEnMapa.prototype.posicionRecibida = function(posicion){
    this.posicionActual = new google.maps.LatLng(posicion.latitud,posicion.longitud);
    if(this.panear_al_recibir_posicion) this.o.mapa.panTo(this.posicionActual);
    this.marcador_posicion.setPosition(this.posicionActual);    
    this.derrotero.push(this.posicionActual);
    if(this.dejar_rastro)this.linea_derrotero.setPath(this.derrotero);
    this.actualizarMarcadorPeriferico();
};

VistaRangerEnMapa.prototype.getXYFromLatLng = function(pos){
    var overlay = new google.maps.OverlayView();
    overlay.draw = function() {};
    overlay.setMap(this.o.mapa);
    
    var proj = overlay.getProjection();
    return proj.fromLatLngToContainerPixel(pos);
}

VistaRangerEnMapa.prototype.actualizarMarcadorPeriferico = function(){
    if(this.marcador_periferico) this.marcador_periferico.remove();
    
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
        this.marcador_periferico = new paper.Path.Circle(new paper.Point(int.x, int.y), 10);
        this.marcador_periferico.fillColor = 'red';  
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
    this.marcador_posicion.setAnimation(google.maps.Animation.BOUNCE);
};

VistaRangerEnMapa.prototype.desSeleccionar = function(){
    this.marcador_posicion.setAnimation(null);
};

VistaRangerEnMapa.prototype.seguirConPaneo = function(){
    this.panear_al_recibir_posicion = true;
};

VistaRangerEnMapa.prototype.yaNoSeguirConPaneo = function(){
    this.panear_al_recibir_posicion = false;
};

VistaRangerEnMapa.prototype.dejarRastro = function(){
    this.dejar_rastro = true;
    this.linea_derrotero.setVisible(true);
};

VistaRangerEnMapa.prototype.yaNoDejarRastro = function(){
    this.dejar_rastro = false;
    this.linea_derrotero.setVisible(false);
};


var vista_ranger_null = {
    goTo: function(){},
    seguirConPaneo: function(){}
};