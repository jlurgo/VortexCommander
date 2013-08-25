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
    
    this.nombre = "BOT_" + Math.floor((Math.random()*1000)+1).toString();
    
    this.calcularRumbo = this.calcularRumboRandomWalk;
    
    setInterval(function(){_this.enviarPosicion();}
               , 100);
    
    this.portal.pedirMensajes( new FiltroAND([new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.goto"),
                                               new FiltroXClaveValor("ranger", this.nombre)]),
                                this.goToRecibido.bind(this));
};

RangerBot.prototype.goToRecibido = function(mensaje){   
    this.destino = new google.maps.LatLng(mensaje.latitudDestino, mensaje.longitudDestino);
    this.calcularRumbo = this.calcularRumboGoingTo;
};

RangerBot.prototype.enviarPosicion = function(){
    this.calcularRumbo();
    this.heading += (this.heading_target-this.heading)/5;   
    this.posicion = new google.maps.LatLng(this.posicion.lat() + Math.cos(this.heading) * this.velocidad ,
                                           this.posicion.lng() + Math.sin(this.heading) * this.velocidad) ;
    this.portal.enviarMensaje({
                tipoDeMensaje: "vortex.commander.posicion",
                ranger: this.nombre,
                latitud: this.posicion.lat(),
                longitud: this.posicion.lng()
            });
};

RangerBot.prototype.calcularRumboRandomWalk = function(){
    if(Math.abs(this.heading_target-this.heading)<0.1) this.heading_target = Math.random()*2*Math.PI;    
};

RangerBot.prototype.calcularRumboGoingTo = function(){      
    this.heading_target = Math.atan2(  this.destino.lng() - this.posicion.lng(), 
                                this.destino.lat() - this.posicion.lat());
    if(Math.abs(this.heading_target-this.heading)<0.1) this.heading = this.heading_target;
    var distancia_al_destino = google.maps.geometry.spherical.computeDistanceBetween(this.posicion, this.destino);
    var distancia_al_proximo_punto = google.maps.geometry.spherical.computeDistanceBetween(this.posicion, 
                                                                                           new google.maps.LatLng(  this.posicion.lat() + Math.cos(this.heading_target) * this.velocidad ,
                                                                                                                    this.posicion.lng() + Math.sin(this.heading_target) * this.velocidad));   
    if(distancia_al_destino<=distancia_al_proximo_punto) {
            this.portal.enviarMensaje({
                tipoDeMensaje: "vortex.commander.confirmaciondearribo",
                ranger: this.nombre
            });
            this.calcularRumbo = this.calcularRumboRandomWalk;
    };
    
};