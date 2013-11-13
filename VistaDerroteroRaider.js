var VistaDerroteroRaider = function(opt){
    $.extend(true, this, opt);
    this.start();
};

VistaDerroteroRaider.prototype.start = function(){
    var _this = this;
    this.derrotero = [];
    
    this.linea_derrotero = new paper.Path();
    this.linea_derrotero.strokeWidth = 5;
    this.linea_derrotero.strokeColor = 'orange';
    this.linea_derrotero.opacity = 0.7;
    this.linea_derrotero.strokeJoin = 'round';
    this.linea_derrotero.strokeCap = 'round';
    
    this.portal = new NodoPortalBidi();
    NodoRouter.instancia.conectarBidireccionalmenteCon(this.portal);
    
    this.portal.pedirMensajes(  new FiltroAND([new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.posicion"),
                                               new FiltroXClaveValor("ranger", this.nombreRaider)]),
                                function(mensaje){_this.posicionRecibida(mensaje);});
    
    this.ajustarDibujo = this.ajustarDibujo_cuando_esta_invisible;
    
    google.maps.event.addListener(this.mapa, 
                              'bounds_changed', 
                              function(){
                                  _this.ajustarDibujo();
                              });
};

VistaDerroteroRaider.prototype.posicionRecibida = function(posicion){
    var posicionActualRaider = new google.maps.LatLng(posicion.latitud,posicion.longitud);
    this.derrotero.push(posicionActualRaider);
    this.ajustarDibujo();
};

VistaDerroteroRaider.prototype.ajustarDibujo_cuando_esta_visible = function(){    
    this.linea_derrotero.segments = [];
    for(var i=0; i<this.derrotero.length; i++){
        this.linea_derrotero.add(this.mapa.getPointFromLatLng(this.derrotero[i]));
    }
};

VistaDerroteroRaider.prototype.ajustarDibujo_cuando_esta_invisible = function(){
    
};

VistaDerroteroRaider.prototype.mostrar = function(){
    this.ajustarDibujo = this.ajustarDibujo_cuando_esta_visible;
};

VistaDerroteroRaider.prototype.ocultar = function(){
    this.linea_derrotero.segments = [];
    this.ajustarDibujo = this.ajustarDibujo_cuando_esta_invisible;
};
