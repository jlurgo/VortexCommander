var AdministradorDeBots = function(){
    this.start();
};
AdministradorDeBots.prototype.start = function(){
    //var clienteHTTP = new NodoClienteHTTP('http://router-vortex.herokuapp.com', 100);             
    
    var socket = io.connect('https://router-vortex.herokuapp.com');
    var adaptador = new NodoConectorSocket(socket);    
    NodoRouter.instancia.conectarBidireccionalmenteCon(adaptador);
    
    this.btn_crear_bots = $("#btn_crear_bot");
    this.bots = [];
    var _this = this;
    this.btn_crear_bots.click(function(){
        _this.bots.push(new RangerBot()); 
    });
};

var administrador_de_bots = new AdministradorDeBots();