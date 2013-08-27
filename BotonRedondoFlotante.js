var BotonRedondoFlotante = function(opt){
    this.o = opt;
    this.start();
};

BotonRedondoFlotante.prototype.start = function(){
    var _this = this;  
    this.prendido = false;
    this.o.ui.addClass("boton_redondo_flotante_apagado");
    this.o.ui.click(function(){   
        if(_this.prendido){
            _this.prendido = false;
            _this.o.ui.removeClass("boton_redondo_flotante_prendido");
            _this.o.ui.addClass("boton_redondo_flotante_apagado");
            _this.o.alApagar();
        }
        else{
            _this.prendido = true; 
            _this.o.ui.removeClass("boton_redondo_flotante_apagado");
            _this.o.ui.addClass("boton_redondo_flotante_prendido");
            _this.o.alPrender();
        }
    });    
};