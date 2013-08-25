var RangerBot = function(){
    this.start();
};
RangerBot.prototype.start = function(){
    var _this = this;
    this.portal =  new NodoPortalBidi();         
    NodoRouter.instancia.conectarBidireccionalmenteCon(this.portal);
    
    this.posicion = new google.maps.LatLng(-34.603683 + (Math.random()*0.01)-0.005,
                                           -58.381569 + (Math.random()*0.01)-0.005);
    
    this.heading = Math.random()*2*Math.PI;
    this.heading_target = Math.random()*2*Math.PI;
    
    this.velocidad = 0.001;
    
    this.nombre = "BOT_" + Math.floor((Math.random()*100)+1).toString();
    setInterval(function(){_this.enviarPosicion();}
               , 100);
    
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
    this.heading += (this.heading_target-this.heading)/5;   
    if(Math.abs(this.heading_target-this.heading)<0.1) this.heading_target = Math.random()*2*Math.PI;
    
    this.posicion = new google.maps.LatLng(this.posicion.lat() + Math.cos(this.heading) * this.velocidad ,
                                           this.posicion.lng() + Math.sin(this.heading) * this.velocidad) ;
    
};