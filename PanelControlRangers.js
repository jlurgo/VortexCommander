var PanelControlRangers = function(opt){
    this.o = opt;
    this.start();
};

PanelControlRangers.prototype.start = function(){
    this.ui = $('#plantilla_panel_control_rangers').clone();
    var pos_obelisco = new google.maps.LatLng(-34.603683,-58.381569);
    var mapOptions = {
        zoom: 18,
        center: pos_obelisco, 
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.mapa = new google.maps.Map(this.ui.find("#div_mapa")[0], mapOptions);
    var _this = this;
    this.ui.find("#div_mapa").show(function(){
        google.maps.event.trigger(_this.mapa, "resize");        
    });
    
    this.portal = new NodoPortalBidi();
    NodoRouter.instancia.conectarBidireccionalmenteCon(this.portal);
    
    this.rangers = {};
    
    var _this = this;
    this.portal.pedirMensajes(  new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.posicion"),
                                function(mensaje){_this.posicionRecibida(mensaje);});
    var _this = this;

    var mouse_down = false;
    google.maps.event.addListener(this.mapa, 'mousedown', function(event) {
        mouse_down = true;
    });
    
    google.maps.event.addListener(this.mapa, 'mouseup', function(event) {
        if(mouse_down) _this.rangerSeleccionado.goTo(event.latLng); 
         mouse_down = false;
    });
    
    this.rangerSeleccionado = {
        goTo: function(){}  
    };
};

PanelControlRangers.prototype.posicionRecibida = function(posicion){
    var _this = this;
    var lat_long_posicion = new google.maps.LatLng(posicion.latitud,posicion.longitud);
    if(this.rangers[posicion.ranger] !== undefined) return;
    this.rangers[posicion.ranger] = new VistaRangerEnMapa({
        mapa: this.mapa,
        nombre: posicion.ranger,
        posicionInicial: lat_long_posicion,
        onClick: function(ranger, e){
            _this.seleccionarRanger(ranger); 
            setTimeout(function(){
                _this.desSeleccionarRangers();
            }, 3000);            
        }
    });
};

PanelControlRangers.prototype.desSeleccionarRangers = function(){
    for(var key_ranger in this.rangers){
        this.rangers[key_ranger].desSeleccionar();
    }
    this.mapa.setOptions({draggableCursor:null});
    this.rangerSeleccionado = {
        goTo: function(){}  
    };
};

PanelControlRangers.prototype.seleccionarRanger = function(ranger){
    this.desSeleccionarRangers();
    ranger.seleccionar();  
    this.rangerSeleccionado = ranger;
    this.mapa.setOptions({draggableCursor:'crosshair'});
};

PanelControlRangers.prototype.dibujarEn = function(panel){
    panel.append(this.ui);
    var _this = this;
};
