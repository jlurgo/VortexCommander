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
    
    this.rangers = {};
    
    this.portal.pedirMensajes(  new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.posicion"),
                                this.posicionRecibida.bind(this));
};

AppVortexCommander.prototype.posicionRecibida = function(posicion){
    var lat_long_posicion = new google.maps.LatLng(posicion.latitud,posicion.longitud);
    if(this.rangers[posicion.usuario] !== undefined) return;
    this.rangers[posicion.usuario] = new VistaRangerEnMapa({
        mapa: this.mapa,
        nombre: posicion.usuario,
        posicionInicial: lat_long_posicion
    });
};

AppVortexCommander.prototype.dibujarEn = function(panel){
    panel.append(this.ui);
};
