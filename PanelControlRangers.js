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
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        styles: [{
            featureType: "poi",
            stylers: [
                { visibility: "off" }
            ]   
        }]
    };
    this.mapa = new google.maps.Map(this.ui.find("#div_mapa")[0], mapOptions);
    
    this.mapa.getPointFromLatLng = function(pos){
        var overlay = new google.maps.OverlayView();
        overlay.draw = function() {};
        overlay.setMap(_this.mapa);
        
        var proj = overlay.getProjection();
        var punto = proj.fromLatLngToContainerPixel(pos);
        return new paper.Point(punto.x, punto.y);
    }
    
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

    this.alClickearEnMapa = function(posicion){
    };
    this.btn_go_to = new BotonRedondoFlotante({ 
        ui: this.botonera_ranger.find("#btn_go_to"),
        alPrender: function(){
            _this.mapa.setOptions({draggableCursor:'crosshair'});
            _this.alClickearEnMapa = function(posicion){
                _this.rangerSeleccionado.goTo(posicion); 
            }
        },          
        alApagar: function(){
            _this.mapa.setOptions({draggableCursor:null});
            _this.alClickearEnMapa = function(posicion){
            };
        }
    });
    
    this.btn_dejar_rastro = new BotonRedondoFlotante({ 
        ui: this.botonera_ranger.find("#btn_dejar_rastro"),
        alPrender: function(){
            _this.rangerSeleccionado.dejarRastro();
        },          
        alApagar: function(){
            _this.rangerSeleccionado.yaNoDejarRastro();
        }
    });
        
    this.portal = new NodoPortalBidi();
    NodoRouter.instancia.conectarBidireccionalmenteCon(this.portal);
    
    this.rangers = {};
    
    this.portal.pedirMensajes(  new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.posicion"),
                                function(mensaje){_this.posicionRecibida(mensaje);});
    var _this = this;
    
    this.rangerSeleccionado = vista_ranger_null;
    
    paper.setup(this.ui.find("#layer_commander")[0]);
    this.vistaPeriferica = new paper.Path.Rectangle({
        point: [0,0],
        size: paper.project.view.size,
        strokeColor: 'gray',
        strokeWidth: 40,
        opacity: 0.2
    });
    var tool = new paper.Tool();

    tool.onMouseDown = function(event) {
        var overlay = new google.maps.OverlayView();
        overlay.draw = function() {};
        overlay.setMap(_this.mapa);        
        var proj = overlay.getProjection();
        var latLngClickeada = proj.fromContainerPixelToLatLng(new google.maps.Point(event.point.x, event.point.y));
        _this.alClickearEnMapa(latLngClickeada);    
    };
    
    tool.onMouseDrag = function(event) {
        var overlay = new google.maps.OverlayView();
        overlay.draw = function() {};
        overlay.setMap(_this.mapa);        
        var proj = overlay.getProjection();
        var centroDesplazadoPaper = paper.project.view.center.add(event.delta.multiply(-1));
        
        var latLngNuevoCentro = proj.fromContainerPixelToLatLng(new google.maps.Point(centroDesplazadoPaper.x, centroDesplazadoPaper.y));
        for(var key_ranger in _this.rangers){
            _this.rangers[key_ranger].actualizarMarcadorPosicion();
        }
        _this.mapa.panTo(latLngNuevoCentro);
    };
        
    this.ui.find("#layer_commander").mousewheel(function(event, delta, deltaX, deltaY) {
        _this.mapa.setZoom(_this.mapa.getZoom() + delta);
        for(var key_ranger in _this.rangers){
            _this.rangers[key_ranger].actualizarMarcadorPosicion();
        }
    });
    
    paper.project.view.onResize = function(event) {
        _this.vistaPeriferica.segments[0].point = new paper.Point(0, paper.project.view.size.height);
        _this.vistaPeriferica.segments[1].point = new paper.Point(0, 0);
        _this.vistaPeriferica.segments[2].point = new paper.Point(paper.project.view.size.width, 0);
        _this.vistaPeriferica.segments[3].point = new paper.Point(paper.project.view.size.width, paper.project.view.size.height);
    };
    
    paper.view.onFrame = function (event) {
        paper.view.draw(); 
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
