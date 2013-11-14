var VistaRangerEnMapa = function(opt){
    this.o = opt;
    this.start();
};

VistaRangerEnMapa.prototype.start = function(){
    var _this = this;
    this.portal = new NodoPortalBidi();
    NodoRouter.instancia.conectarBidireccionalmenteCon(this.portal);
    this.posicionActual = this.o.posicionInicial;
    this.portal.pedirMensajes(  new FiltroAND([new FiltroXClaveValor("tipoDeMensaje", "vortex.commander.posicion"),
                                               new FiltroXClaveValor("ranger", this.o.nombre)]),
                                function(mensaje){_this.posicionRecibida(mensaje);});
    
    this.panear_al_recibir_posicion = false;
    
    google.maps.event.addListener(this.o.mapa, 
                                  'bounds_changed', 
                                  function(){
                                        _this.actualizarMarcadorPosicion();
                                  });
    this.marcador_posicion = new paper.Path.Circle(new paper.Point(-30, -30), 10);
    this.marcador_posicion.fillColor = 'red';
    this.marcador_posicion.onClick = function(){        
        _this.o.onClick(_this);
    };
    this.marcador_posicion.onMouseEnter = function(event) {
        _this.marcador_posicion.fillColor = 'blue';
    }
    
    this.marcador_posicion.onMouseLeave = function(event) {
        _this.marcador_posicion.fillColor = 'red';
    }
    this.vista_destino = new VistaDestinoRaider({
        nombreRaider: this.o.nombre,
        mapa: this.o.mapa,
        icono_raider: this.marcador_posicion    
    });
    
    this.vista_derrotero = new VistaDerroteroRaider({
        nombreRaider: this.o.nombre,
        mapa: this.o.mapa
    });

    this.txt_nombre_raider = new paper.PointText(50, 50);
    this.txt_nombre_raider.fillColor = 'black';
    this.txt_nombre_raider.content = this.o.nombre;
    this.txt_nombre_raider.visible = true;
    
    this.actualizarMarcadorPosicion();
    
};

VistaRangerEnMapa.prototype.posicionRecibida = function(posicion){
    this.posicionActual = new google.maps.LatLng(posicion.latitud,posicion.longitud);
    if(this.panear_al_recibir_posicion) this.o.mapa.panTo(this.posicionActual);
    this.actualizarMarcadorPosicion();
};

VistaRangerEnMapa.prototype.actualizarMarcadorPosicion = function(){
    var posRanger = this.o.mapa.getPointFromLatLng(this.posicionActual);
    var rect = new paper.Path.Rectangle({
        point: [10,10],
        size: new paper.Size(paper.project.view.size.width - 20, paper.project.view.size.height - 20),
        visible: false
    });
    
    var recta_corte = new paper.Path()
    recta_corte.strokeWidth = 0;
    recta_corte.segments = [
       paper.project.view.center,
       posRanger
    ];
    
    var intersecciones = rect.getIntersections(recta_corte);
    if(intersecciones.length>0){    
        var int = intersecciones[0].point;
        this.marcador_posicion.position = new paper.Point(int.x, int.y);
        
        if(this.marcador_posicion.position.x == paper.project.view.size.width - 10){ //contra el borde derecho
            this.txt_nombre_raider.justification = 'right';
            this.txt_nombre_raider.point = this.marcador_posicion.position.add([-12,5]);
        }
        if(this.marcador_posicion.position.x == 10){ //contra el borde izquierdo
            this.txt_nombre_raider.justification = 'left';
            this.txt_nombre_raider.point = this.marcador_posicion.position.add([12,5]);
        }        
        if(this.marcador_posicion.position.y == paper.project.view.size.height - 10){ //contra el borde inferior
            this.txt_nombre_raider.justification = 'center';
            this.txt_nombre_raider.point = this.marcador_posicion.position.add([0,-13]);
        }
        if(this.marcador_posicion.position.y == 10){ //contra el borde superior
            this.txt_nombre_raider.justification = 'center';
            this.txt_nombre_raider.point = this.marcador_posicion.position.add([0,23]);
        }
        
    }else{
        this.marcador_posicion.position = posRanger;
        this.txt_nombre_raider.justification = 'center';
        this.txt_nombre_raider.point = this.marcador_posicion.position.add([0,23]); 
    }
    rect.remove();
    recta_corte.remove();     
};
    
VistaRangerEnMapa.prototype.goTo = function(destino){
    this.portal.enviarMensaje({ tipoDeMensaje: "vortex.commander.goto",
                                ranger: this.o.nombre,
                                latitudDestino: destino.lat(),
                                longitudDestino: destino.lng() 
                              });
};

VistaRangerEnMapa.prototype.seleccionar = function(){
    this.marcador_posicion.strokeColor = 'black';
    this.marcador_posicion.strokeWidth = 2;
};

VistaRangerEnMapa.prototype.desSeleccionar = function(){
    this.marcador_posicion.strokeColor = 'red';
    this.marcador_posicion.strokeWidth = 0;
};

VistaRangerEnMapa.prototype.seguirConPaneo = function () {
    this.o.mapa.panTo(this.posicionActual);
    this.panear_al_recibir_posicion = true;
};

VistaRangerEnMapa.prototype.yaNoSeguirConPaneo = function(){
    this.panear_al_recibir_posicion = false;
};

VistaRangerEnMapa.prototype.dejarRastro = function () {
    this.vista_derrotero.mostrar();
};

VistaRangerEnMapa.prototype.yaNoDejarRastro = function(){
    this.vista_derrotero.ocultar();
};

VistaRangerEnMapa.prototype.dejandoRastro = function () {
    return this.vista_derrotero.visible;
};

var vista_ranger_null = {
    goTo: function(){},
    seguirConPaneo: function(){}
};