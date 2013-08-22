var RangerBot = function(){
    this.start();
};
RangerBot.prototype.start = function(){
    var _this = this;
    this.portal =  new NodoPortalBidi();         
    NodoRouter.instancia.conectarBidireccionalmenteCon(this.portal);
    
    this.posicion = new google.maps.LatLng(-34.603683 + (Math.random()*0.01)-0.005,
                                           -58.381569 + (Math.random()*0.01)-0.005);
    
    this.vectorDirector = {
        x:(Math.random()*0.001)-0.0005,
        y:(Math.random()*0.001)-0.0005
    }
    this.nombre = "BOT_" + Math.floor((Math.random()*100)+1).toString();
    setInterval(function(){_this.enviarPosicion();}
               , 1000);
    
};

RangerBot.prototype.enviarPosicion = function(){
    this.calcularPosicion();
    this.portal.enviarMensaje({
                tipoDeMensaje: "vortex.commander.posicion",
                usuario: this.nombre,
                latitud: this.posicion.lat(),
                longitud: this.posicion.lng()
            });
};

RangerBot.prototype.calcularPosicion = function(){
    this.vectorDirector.x += (Math.random()*0.001)-0.0005;
    this.vectorDirector.y += (Math.random()*0.001)-0.0005;
    this.posicion = new google.maps.LatLng(this.posicion.lat() + this.vectorDirector.x,
                                           this.posicion.lng() + this.vectorDirector.y);
    
};