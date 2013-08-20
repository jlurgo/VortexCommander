var Soldado = function(opt){
    this.o = opt;
    this.start();
};

Soldado.prototype.start = function(){
    var _this = this;
    this.portal = new NodoPortalBidi();
    NodoRouter.instancia.conectarBidireccionalmenteCon(this.portal);
    
    this.marcador_posicion = new google.maps.Marker({
        map: this.o.mapa,
        title:this.o.nombre,
        position: this.o.posicionInicial,
        animation: google.maps.Animation.DROP,
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
        content: $("#plantilla_label_soldado").clone().text(this.o.nombre)[0]
    });
    
    google.maps.event.addListener(this.marcador_posicion, 'click', function() {
        _this.label_nombre.open(_this.o.mapa,_this.marcador_posicion);
    });
    this.label_nombre.open(this.o.mapa,this.marcador_posicion);
    
    this.portal.pedirMensajes(  new FiltroAND([new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.posicion"),
                                               new FiltroXClaveValor("usuario", this.o.nombre)]),
                                this.posicionRecibida.bind(this));
};

Soldado.prototype.posicionRecibida = function(posicion){
    var lat_long_posicion = new google.maps.LatLng(posicion.latitud,posicion.longitud);
    this.o.mapa.panTo(lat_long_posicion);
    this.marcador_posicion.setPosition(lat_long_posicion);    
    this.derrotero.push(lat_long_posicion);
    this.linea_derrotero.setPath(this.derrotero);
};

