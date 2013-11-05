var RangerBot = function(){
    this.start();
};
RangerBot.prototype.start = function(){
    var _this = this;
    this.portal =  new NodoPortalBidi();         
    NodoRouter.instancia.conectarBidireccionalmenteCon(this.portal);
    
    this.posicion = new google.maps.LatLng(-34.603683 + (Math.random()*0.01)-0.005,
                                           -58.381569 + (Math.random()*0.01)-0.005);
    
    this.rumbo = Math.random()*360 - 180;
    
    this.periodoActualizacionPosicion = 2; //segundos
    this.velocidad = 50; //metros/segundo
    
    this.nombre = "BOT_" + Math.floor((Math.random()*1000)+1).toString();
    
    this.calcularDestinoRandom();
    this.portal.enviarMensaje({
        tipoDeMensaje: "vortex.commander.goingTo",
        ranger: this.nombre,
        latitud: this.destino.lat(),
        longitud: this.destino.lng()
    });
    
    setInterval(function(){
            _this.calcularProximaPosicion();
            _this.enviarPosicion();
        }
        , this.periodoActualizacionPosicion * 1000);
    
    this.portal.pedirMensajes( new FiltroAND([new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.goto"),
                                               new FiltroXClaveValor("ranger", this.nombre)]),
                                this.goToRecibido.bind(this));
};

RangerBot.prototype.goToRecibido = function(mensaje){   
    this.destino = new google.maps.LatLng(mensaje.latitudDestino, mensaje.longitudDestino);
    this.portal.enviarMensaje({
            tipoDeMensaje: "vortex.commander.goingTo",
            ranger: this.nombre,
            latitud: this.destino.lat(),
            longitud: this.destino.lng()
        });
};

RangerBot.prototype.enviarPosicion = function(){
    this.portal.enviarMensaje({
                tipoDeMensaje: "vortex.commander.posicion",
                ranger: this.nombre,
                latitud: this.posicion.lat(),
                longitud: this.posicion.lng()
            });
};

RangerBot.prototype.calcularDestinoRandom = function(){
    this.destino = new google.maps.LatLng(  this.posicion.lat() + (Math.random()*0.01)-0.005 ,
                                            this.posicion.lng() + (Math.random()*0.01)-0.005);   
};

RangerBot.prototype.apuntarAlDestino = function(){
    var rumbo_al_destino = google.maps.geometry.spherical.computeHeading(this.posicion, this.destino);
    
//    if(rumbo_al_destino>this.rumbo){
//        if((rumbo_al_destino-this.rumbo)<180) this.rumbo += (rumbo_al_destino-this.rumbo)/2;
//        else this.rumbo-=(rumbo_al_destino-this.rumbo)/2;        
//    }else{
//        if((this.rumbo-rumbo_al_destino)<180) this.rumbo -= (this.rumbo-rumbo_al_destino)/2;
//        else this.rumbo+=(this.rumbo-rumbo_al_destino)/2; 
//    }
//    if(this.rumbo > 180) this.rumbo-=360;
//    if(this.rumbo < -180) this.rumbo+=360; 
    
    this.rumbo = rumbo_al_destino;
};

RangerBot.prototype.calcularProximaPosicion = function(){
    this.apuntarAlDestino();
    if(this.llegoAlDestino()) {
        this.posicion = this.destino;
        this.enviarPosicion();
        this.portal.enviarMensaje({
            tipoDeMensaje: "vortex.commander.confirmaciondearribo",
            ranger: this.nombre
        });
        this.calcularDestinoRandom(); 
        this.portal.enviarMensaje({
            tipoDeMensaje: "vortex.commander.goingTo",
            ranger: this.nombre,
            latitud: this.destino.lat(),
            longitud: this.destino.lng()
        });
    }else{
        this.posicion = google.maps.geometry.spherical.computeOffset(this.posicion, this.velocidad * this.periodoActualizacionPosicion, this.rumbo);
    };    
};

RangerBot.prototype.llegoAlDestino = function(){  
    var distancia_al_destino = google.maps.geometry.spherical.computeDistanceBetween(this.posicion, this.destino);
    var distancia_al_proximo_punto = google.maps.geometry.spherical.computeDistanceBetween(this.posicion, 
                                                                                           google.maps.geometry.spherical.computeOffset(this.posicion, this.velocidad * this.periodoActualizacionPosicion, this.rumbo));   
    return distancia_al_destino<=distancia_al_proximo_punto;
};    