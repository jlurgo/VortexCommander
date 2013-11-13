var BotonRedondoFlotante = function(opt){
    this.o = opt;
    this.start();
};

BotonRedondoFlotante.prototype.start = function () {
    var _this = this;
    this.prendido = false;
    this.o.ui.addClass("boton_redondo_flotante_apagado");
    this.o.ui.click(function () {
        if (_this.prendido) {
            _this.apagar();
        }
        else {
            _this.prender();
        }
    });
};

BotonRedondoFlotante.prototype.prender = function () {
    this.prendido = true;
    this.o.ui.removeClass("boton_redondo_flotante_apagado");
    this.o.ui.addClass("boton_redondo_flotante_prendido");
    this.o.alPrender();
};

BotonRedondoFlotante.prototype.apagar = function () {
    this.prendido = false;
    this.o.ui.removeClass("boton_redondo_flotante_prendido");
    this.o.ui.addClass("boton_redondo_flotante_apagado");
    this.o.alApagar();
};