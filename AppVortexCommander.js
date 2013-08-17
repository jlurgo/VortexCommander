var AppVortexCommander = function(opt){
    this.o = opt;
    this.start();
};

AppVortexCommander.prototype.start = function(){
    this.ui = $('#plantilla_app_vortex_commander').clone();
    var pos_obelisco = new google.maps.LatLng(-34.603683,-58.381569);
    var mapOptions = {
        zoom: 18,
        center: pos_obelisco, 
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.mapa = new google.maps.Map(this.ui.find("#div_mapa")[0], mapOptions);
    
    this.portal = new NodoPortalBidi();
    NodoRouter.instancia.conectarBidireccionalmenteCon(this.portal);
    
    this.marcador_posicion = new google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
        map: this.mapa,
        center: pos_obelisco,
        radius: 5,
        visible: false   
    });
    this.derrotero = [];
    this.linea_derrotero = new google.maps.Polyline({
        path: this.derrotero,
        strokeColor: "#CC55AA",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: this.mapa
    });
    this.portal.pedirMensajes(  new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.posicion"),
                                this.posicionRecibida.bind(this));
};

AppVortexCommander.prototype.posicionRecibida = function(posicion){
    var lat_long_posicion = new google.maps.LatLng(posicion.latitud,posicion.longitud);
    this.mapa.panTo(lat_long_posicion);
    this.marcador_posicion.setVisible(true);
    this.marcador_posicion.setCenter(lat_long_posicion);    
    this.derrotero.push(lat_long_posicion);
    this.linea_derrotero.setPath(this.derrotero);
};

AppVortexCommander.prototype.dibujarEn = function(panel){
    panel.append(this.ui);
};
