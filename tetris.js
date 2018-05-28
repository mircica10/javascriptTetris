var setariJoc = {
	"comandaUrmatoare":undefined,
	"inaltime":15,
	"latime":10,
	"patratePiesa":[],
	"patrateZid":[],
	"functie":null,
    "viteza":500	
};

var figuriPosibile = {
    linie: [13, 14, 15, 16], 
    patrat: [13, 14, 23, 24],
    s : [13, 14, 24, 25],
    l : [13, 23, 33, 34],	
    t : [13, 22, 23, 24]
}

var mapNumereToFiguri = new Map();

mapNumereToFiguri.set(0, "linie");
mapNumereToFiguri.set(1, "patrat");
mapNumereToFiguri.set(2, "s");
mapNumereToFiguri.set(3, "l");
mapNumereToFiguri.set(4, "t");


function getFiguraRandom(){
	var random = getRandom(0, 5);
	var numarFigura = mapNumereToFiguri.get(random);
	return figuriPosibile[numarFigura];
}

function getRandom(min, max){
	return Math.floor( min + (Math.random() * max))
}

$(document).keydown(function(e){	
    if (e.keyCode == 37) {
	    setariJoc["comandaUrmatoare"] = "stanga";			
	} else if (e.keyCode == 39){
		setariJoc["comandaUrmatoare"] = "dreapta"
	} else if (e.keyCode == 38){
		setariJoc["comandaUrmatoare"] = "rotire";	
    }	
});

function getX(numar){
	let latime = setariJoc["latime"];
	return Math.floor(numar / latime);	
}

function getY(numar){
	let latime = setariJoc["latime"];
	return (numar % latime);	
}

function compunePozitieAbsoluta(x, y){
	let latime = setariJoc["latime"];
	return x * latime + y;
}

//testeaza daca pozitia este deja ocupata de zid
function ePozitiaValida(numar){
    let zid = setariJoc["patrateZid"];
	if(zid == undefined || zid.length == 0) {
	    return true;
	}
	return !(zid.includes(numar));	
}

class Linie {
	//primim patratele si directia
    constructor(patrate) {
		this.patrate = patrate;	    
	}
		
	coboara(){
	    var pozitiiViitoare = [];
		var zid = setariJoc["patrateZid"];
		var latime = setariJoc["latime"];
		for(var i = 0; i < this.patrate.length; ++i){
		    var valoareNoua = this.patrate[i] + latime;
			if(zid.includes(valoareNoua)){
				this.adaugaLaZid();
				clearFunction();
				verificaLiniePlina();
			} 
			pozitiiViitoare.push(valoareNoua);
		}	
		this.clearFromDisplay();
		this.patrate = pozitiiViitoare;
        this.showToDisplay();		
	}
	
	miscaLateral(stanga = true){
		var pozitiiViitoare = [];
		
		var latimeMaxima = setariJoc["latime"];
		var pas = (stanga == true) ? -1 : 1;
		
		for(var i = 0; i < this.patrate.length; ++i){
			var yNou = getY(this.patrate[i]) + pas;
			//daca vreo pozitie iese din ecran, nu facem mutarea
			if( yNou < 0 || yNou >= latimeMaxima){
			    return -1;
			}
			let valoareNoua = compunePozitieAbsoluta(getX(this.patrate[i]), yNou);
			pozitiiViitoare.push(valoareNoua);
		}
		this.clearFromDisplay();
		this.patrate = pozitiiViitoare;
        this.showToDisplay();	
		
	}
	
	rotate() {
		var pozitiiViitoare = [];
		let pivot = this.patrate[1];
		
		var pivotX = getX(pivot);
		var pivotY = getY(pivot);
		
		for(var i = 0; i < this.patrate.length; ++i){
			var xCurent = getX(this.patrate[i]);
			var yCurent = getY(this.patrate[i]);
			
			var xNou = pivotX + (pivotY - yCurent);	
			var yNou = pivotY + (pivotX - xCurent); 
			
			var pozitieNoua = compunePozitieAbsoluta(xNou, yNou);
			if(ePozitiaValida(pozitieNoua)){
				pozitiiViitoare.push(pozitieNoua);
			} else {
				return -1;
			}
		}
		
		this.clearFromDisplay();
		this.patrate = pozitiiViitoare;
		this.showToDisplay();		
	}		
	
	//functie care adauga la zid patratele curente
	adaugaLaZid(){
		let zid = setariJoc["patrateZid"];
		for(var i = 0; i < this.patrate.length; ++i){
			var elem = document.getElementById(this.patrate[i]);
			
			elem.classList.remove('partePiesa');
			elem.classList.remove('culoarePatrat');
			elem.classList.add('parteZid');			
		
   		    zid.push(this.patrate[i]);
		}
		this.patrate = undefined; 	
	}
	
	clearFromDisplay(){
		for(var i = 0; i < this.patrate.length; ++i){
			var elem = document.getElementById(this.patrate[i]);
			elem.classList.remove('partePiesa');
			elem.classList.add('culoarePatrat');	
		}		
	}
	
	showToDisplay(){
		for(var i = 0; i < this.patrate.length; ++i){
			var elem = document.getElementById(this.patrate[i]);
			elem.classList.add('partePiesa');
			elem.classList.remove('culoarePatrat');			
		}		
	}
	
}

function stergeZid(){
	toggleZid(true);
}
function arataZid() {
    toggleZid(false);
}


function toggleZid(hide = true){
    var zid = setariJoc["patrateZid"];
    var toAdd = (hide == true ? 'culoarePatrat' : 'parteZid');
	var toRemove = (hide == true ? 'parteZid' : 'culoarePatrat');
	
	//pentru a evita sa fie stearsa linia de la baza zidului
	
	var elementMaximZid = setariJoc["inaltime"] * setariJoc["latime"];
	
	for(var i = 0; i < zid.length; ++i){
	    if(zid[i] < elementMaximZid){
		    var elem = document.getElementById(zid[i]);
		    elem.classList.add(toAdd);
		    elem.classList.remove(toRemove);
		}
	}
}

function getLinieDeSters(){
    //verificam pentru fiecare linie, de jos in sus
	let latime = setariJoc["latime"];
	let inaltime = setariJoc["inaltime"];
	let zid = setariJoc["patrateZid"];
	
	for(var i = inaltime - 1; i >= 0; --i){
	    var liniaCompleta = true;
		for(var j = 0; j < latime; j++){
            var patrat = i * latime + j; 		    
	        if(!zid.includes(patrat)){
			    liniaCompleta = false;
				break;
			}			
		}
	    if(liniaCompleta){
		    return i;
		}	
	}
    return -1;    
}


function verificaLiniePlina()
{
     var linieDeSters = getLinieDeSters();
	 while (linieDeSters > -1){		 
		 stergeZid();
	     genereazaZidDupaStergereLinie(linieDeSters);
	     arataZid();
		 linieDeSters = getLinieDeSters();
	 }
}

//copiem toate elementele pana la linia stearsa
//copiem toate elementele de deasupra liniei sterse, scazand latimea din valoare
function genereazaZidDupaStergereLinie(indiceLinieStearsa){
    let zidNou = [];
	let zid = setariJoc["patrateZid"];    
	let latime = setariJoc["latime"]
    let elementMinim = indiceLinieStearsa * latime;
    
	
	let elementMaxim = indiceLinieStearsa * (latime + 1);
	for(var i = 0; i < zid.length; ++i){
		    if(zid[i] >= elementMaxim){
		        zidNou.push(zid[i]);
		    } else if( zid[i] < elementMinim ) {
			    zidNou.push(zid[i] + latime);
		    }	
	}
    setariJoc["patrateZid"] = zidNou;
}


/*
function stergeLinieDinZid(numarLinie){
    let zid = setariJoc["patrateZid"];
    let latime = setariJoc["latime"];
    for(var i = 0; i < latime; ++i){
	    var numarDeStersDinZid = numarLinie * latime + i;
	    var elem = document.getElementById(numarDeStersDinZid);
		elem.classList.remove('parteZid');
		elem.classList.add('culoarePatrat');
		zid.remove(numarDeStersDinZid);
	}    
}
*/

function test() {
	clearInterval(setariJoc["functie"]);	
 }

 
 
function clearFunction(){
	clearInterval(setariJoc["functie"]);
	gameTest();
}


function repeta(linie){
    var funct = undefined;
	var comandaUrmatoare = setariJoc["comandaUrmatoare"];
	
	if(comandaUrmatoare == "stanga"){ 
	    linie.miscaLateral(true);
	} else if (comandaUrmatoare == "dreapta") {
	    linie.miscaLateral(false);
	} else if (comandaUrmatoare == "rotire") {
	    linie.rotate();	
	}	
	setariJoc["comandaUrmatoare"] = undefined;
		
	linie.coboara();		

}

function gameTest(){
	var patrateLinie = getFiguraRandom();
	
	var linie = new Linie(patrateLinie);
    
	var funct = repeta(linie);	
	
	var viteza = setariJoc["viteza"];
	
	setariJoc["functie"] = setInterval( function() {
	    repeta(linie);
	}, viteza);	
		
}


function arataBackground(){
	
	var latime = setariJoc["latime"];
	var inaltime = setariJoc["inaltime"];
	
	var panza = document.getElementById('panza');
	
	for(var i = 0; i < inaltime ; ++i){
        for(var j = 0; j < latime; ++j){	
            var patrat = document.createElement("div");
		    patrat.classList.add('patrat');
			patrat.classList.add('culoarePatrat');
		    patrat.id = i * latime + j;
		    panza.appendChild(patrat);		
        }		
	}
    //adauga zidul
    for(var  i = 0; i <  latime; ++i){
	    var patrat = document.createElement("div");
		patrat.classList.add('patrat');
		patrat.classList.add('parteZid');
		patrat.id = latime * inaltime + i;		
		panza.appendChild(patrat);		  
	    setariJoc["patrateZid"].push(latime * inaltime + i);		
	}	
}



