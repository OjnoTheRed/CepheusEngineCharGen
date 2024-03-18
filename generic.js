function dice(numDice)
{
	var result = 0;
	for(var i=0;i<numDice;i++)
		result += Math.floor(Math.random()*6)+1
	return result;
}

function d20()
{
	return Math.floor(Math.random()*20)+1;
}

function d3()
{
	return Math.floor(Math.random()*3)+1;
}

function d2()
{
	return Math.floor(Math.random()*2)+1;
}

function flux()
{
	return dice(1)-dice(1);
}

function radioSelect(buttonSet)
{
	for(var i=0;i<buttonSet.length;i++)
		if(buttonSet[i].checked)
			return buttonSet[i].value;
	return false;
}

function checkboxSelect(checkboxSet)
{
	var returnSet = [];
	for(var i=0;i<checkboxSet.length;i++)
		if(checkboxSet[i].checked)
			returnSet.push(checkboxSet[i].value);
	return returnSet.length == 0 ? false : returnSet;
}

function pseudoHex(someInteger)
{
	if(someInteger < 0 || someInteger > 33 || someInteger != Math.floor(someInteger))
		throw "Illegal value passed to pseudoHex: " + someInteger + ". A pseudo hexadecimal must be an integer from 0 to 33";
	switch(someInteger)
	{
		case 10: return "A";
		case 11: return "B";
		case 12: return "C";
		case 13: return "D";
		case 14: return "E";
		case 15: return "F";
		case 16: return "G";
		case 17: return "H";
		case 18: return "J";
		case 19: return "K";
		case 20: return "L";
		case 21: return "M";
		case 22: return "N";
		case 23: return "P";
		case 24: return "Q";
		case 25: return "R";
		case 26: return "S";
		case 27: return "T";
		case 28: return "U";
		case 29: return "V";
		case 30: return "W";
		case 31: return "X";
		case 32: return "Y";
		case 33: return "Z";
		default:
			return "" + someInteger;
	}
}

function readPseudoHex(digitString)
{
	switch(digitString)
	{
		case "0": return 0;
		case "1": return 1;
		case "2": return 2;
		case "3": return 3;
		case "4": return 4;
		case "5": return 5;
		case "6": return 6;
		case "7": return 7;
		case "8": return 8;
		case "9": return 9;
		case "A": return 10;
		case "B": return 11;
		case "C": return 12;
		case "D": return 13;
		case "E": return 14;
		case "F": return 15;
		case "G": return 16;
		case "H": return 17;
		case "J": return 18;
		case "K": return 19;
		case "L": return 20;
		case "M": return 21;
		case "N": return 22;
		case "P": return 23;
		case "Q": return 24;
		case "R": return 25;
		case "S": return 26;
		case "T": return 27;
		case "U": return 28;
		case "V": return 29;
		case "W": return 30;
		case "X": return 31;
		case "Y": return 32;
		case "Z": return 33;
		default:
			throw "Illegal value " + digitString + " passed to readPseudoHex.";
	}
}

Array.prototype.search = function(searchString)
{
	var i = this.length;
	while(i--)
		if(this[i]==searchString)
			return i;
	return -1;
}

Array.prototype.nameSearch = function(searchString)
{
	var i = this.length;
	while(i--)
		if(this[i].name==searchString)
			return this[i];
	return -1;
}

Array.prototype.nameSearchIndex = function(searchString)
{
	var i = this.length;
	while(i--)
		if(this[i].name==searchString)
			return i;
	return -1;
}

Array.prototype.random = function()
{
	var i = Math.floor(Math.random()*this.length);
	return this[i];
}

String.prototype.pad = function(paddedLength)
{
	if(this.length>paddedLength)
		return this.substr(0,paddedLength);
	var s = this;
	for(var i=this.length;i<paddedLength;i++)
		s += " ";
	return s;
}

function array_sort_by_name(a, b)
{
	return a.name.localeCompare(b.name);
}

function dice_table(table_data_object, objWithProperties)
{
	var public = this;
	public.table = table_data_object;
	public.numDice = table_data_object.dice;
	public.min = table_data_object.min;
	public.max = table_data_object.max;
	public.modData = table_data_object.mods;
	public.DM = 0;
	
	public.roll = function()
	{
		var diceRoll = dice(public.numDice);
		diceRoll += public.DM;
		diceRoll = Math.max(public.min, Math.min(public.max, diceRoll));
		return public.table[diceRoll];
	}
	
	public.setDMs = function(objWithProperties)
	{
		for(var i=0;i<public.modData.length;i++)
			public.DM += public.modData[i][objWithProperties[public.modData[i].property]];
	}

	if(arguments.length > 1)
		public.setDMs(objWithProperties);
	
}

//debug tool only
function displayObject(someObject, objectName)
{
	if(arguments.length<2)
		objectName = "someObject";
	var s = "";
	for(eachProperty in someObject)
		s += objectName + "." + eachProperty + " = " + someObject[eachProperty] + "\n";
	window.alert(s);
}