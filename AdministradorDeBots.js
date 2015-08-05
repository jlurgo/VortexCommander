var AdministradorDeBots = function(){
    this.start();
};
AdministradorDeBots.prototype.start = function () {
    //Vx.conectarCon(new NodoConectorSocket('https://router-vortex.herokuapp.com'));
    Vx.conectarCon(new NodoConectorSocket('https://server-vortex.herokuapp.com'));

    this.btn_crear_bots = $("#btn_crear_bot");
    this.contador_bots = $("#contador_bots");
    this.contador_bots.text("0");

    this.bots = [];
    this.base_id_bots = Math.floor((Math.random() * 1000) + 1).toString();
    this.cantidad_de_bots = 0;
    var _this = this;
    this.btn_crear_bots.click(function () {
        _this.cantidad_de_bots += 1;
        var nombre = "BOT_" + _this.base_id_bots + "_" + _this.cantidad_de_bots.toString();
        _this.bots.push(new RangerBot({ nombre: nombre }));
        _this.contador_bots.text(_this.cantidad_de_bots.toString());
    });
};

var administrador_de_bots = new AdministradorDeBots();