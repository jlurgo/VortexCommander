var AdministradorDeBots = function(){
    this.start();
};
AdministradorDeBots.prototype.start = function(){
    var clienteHTTP = new NodoClienteHTTP('http://router-vortex.herokuapp.com', 100);             
    NodoRouter.instancia.conectarBidireccionalmenteCon(clienteHTTP);
    
    this.btn_crear_bots = $("#btn_crear_bot");
    this.bots = [];
    var _this = this;
    this.btn_crear_bots.click(function(){
        _this.bots.push(new RangerBot()); 
    });
};

var administrador_de_bots = new AdministradorDeBots();