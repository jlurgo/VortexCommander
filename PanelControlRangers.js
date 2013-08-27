var PanelControlRangers = function(opt){
    this.o = opt;
    this.start();
};

PanelControlRangers.prototype.start = function(){
    var _this = this;
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
    
    this.botonera_ranger = this.ui.find("#botonera_ranger");
    this.btn_seguir_ranger = new BotonRedondoFlotante({ 
        ui: this.botonera_ranger.find("#btn_seguir_ranger"),
        alPrender: function(){
            _this.seguirRanger(_this.rangerSeleccionado);
        },
        alApagar: function(){
            _this.noSeguirRangers();
        }
    });

    this.alClickearEnMapa = function(evento){
    };
    this.btn_go_to = new BotonRedondoFlotante({ 
        ui: this.botonera_ranger.find("#btn_go_to"),
        alPrender: function(){
            _this.mapa.setOptions({draggableCursor:'crosshair'});
            _this.alClickearEnMapa = function(evento){
                _this.rangerSeleccionado.goTo(evento.latLng); 
            }
        },          
        alApagar: function(){
            _this.mapa.setOptions({draggableCursor:null});
            _this.alClickearEnMapa = function(evento){
            };
        }
    });
    
    this.portal = new NodoPortalBidi();
    NodoRouter.instancia.conectarBidireccionalmenteCon(this.portal);
    
    this.rangers = {};
    
    this.portal.pedirMensajes(  new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.posicion"),
                                function(mensaje){_this.posicionRecibida(mensaje);});
    var _this = this;

    var mouse_down = false;
    google.maps.event.addListener(this.mapa, 'mousedown', function(evento) {
        mouse_down = true;
    });
    
    google.maps.event.addListener(this.mapa, 'mouseup', function(evento) {
        if(mouse_down) _this.alClickearEnMapa(evento);
         mouse_down = false;
    });
    
    this.rangerSeleccionado = vista_ranger_null;
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
            _this.mostrarBotoneraRanger();   
            if(_this.btn_seguir_ranger.prendido) _this.seguirRanger(ranger);
        }
    });
};

PanelControlRangers.prototype.desSeleccionarRangers = function(){
    for(var key_ranger in this.rangers){
        this.rangers[key_ranger].desSeleccionar();
    }
    this.rangerSeleccionado = vista_ranger_null;
    this.ocultarBotoneraRanger();         
};

PanelControlRangers.prototype.seleccionarRanger = function(ranger){
    this.desSeleccionarRangers();
    ranger.seleccionar();  
    this.rangerSeleccionado = ranger;
};

PanelControlRangers.prototype.seguirRanger = function(ranger){
    this.noSeguirRangers();
    ranger.seguirConPaneo(); 
};

PanelControlRangers.prototype.noSeguirRangers = function(){
    for(var key_ranger in this.rangers){
        this.rangers[key_ranger].yaNoSeguirConPaneo();
    }
};

PanelControlRangers.prototype.mostrarBotoneraRanger = function(){
    this.botonera_ranger.show();
};

PanelControlRangers.prototype.ocultarBotoneraRanger = function(){
    this.botonera_ranger.hide();
};

PanelControlRangers.prototype.dibujarEn = function(panel){
    panel.append(this.ui);
    var _this = this;
};
