function character()
{
	var public = this;
	public.name = "John Doe";
	public.gender = "M";
	public.species = "Human";
	public.traits = [];
	public.cash = 0;
	public.starting_age = 18;
	public.age = 18;
	public.ageing_starts = 34;
	public.max_age = public.starting_age+MAX_TERMS*TERM_LENGTH;
	public.ageing = new ageing(public);
	public.rank = "";
	public.UPP = new UPP(humanUPPData);
	public.skillSet = new skillSet();
	public.equipment = new equipmentSet(public);
	public.careers = [];
	public.injuryCrisis = false;
	public.ageingCrisis = false;
	public.deceased = false;
	public.hadFirstCareer = false;
	public.numbered = false;
	public.id = 0;
	public.skillsDelimiter = false; // true = skills separated by a comma and a space; false = skills separated by a space
	public.skillLinkChar = "-";
	public.skillSortOpt = true;
	public.survivalTable = true; // true = survival failure = roll on the mishap table, exit career; false = survival failure = death
	public.log = new eventLog();
	
	public.generate = function()
	{
		var i=0;
		public.skillSet.skillsDelimiter = public.skillsDelimiter;
		public.skillSet.skillLinkChar = public.skillLinkChar;
		public.skillSet.skillSortOpt = public.skillSortOpt;
		var numBackgroundSkills = public.UPP.EDU.modifier() + 3;
		var chosenBackgroundSkills = backgroundSkillsChoice.getAllWeightedChoices();
		if(chosenBackgroundSkills.length <= numBackgroundSkills)
		{
			for(i=0;i<chosenBackgroundSkills.length;i++)
				public.skillSet.addSkill(chosenBackgroundSkills[i].name,true);
		}
		else
		{
			for(i=0;i<numBackgroundSkills;i++)
			{
				do
				{
					var skillName = backgroundSkillsChoice.randomChoice(); // DECISION - use decision class
				}
				while(!public.skillSet.addSkill(skillName, true));
			}
		}
		var careerName = "";
		careerName = careerChoice.randomChoice(); // DECISION - use decision class
		var drafted = false;
		var desireToContinue = true;
		do
		{
			var currentCareer = new Career(public, careerName);
			currentCareer.drafted = drafted;
			currentCareer.firstCareer = !public.hadFirstCareer;
			currentCareer.execute(); 
			if(public.deceased) 
				break;
			if(currentCareer.failedQualification && !currentCareer.drafted) // did not make it into the career.
			{
				switch(failedQualificationChoice.randomChoice()) // DECISION: use decision class
				{
					case "Drifter": // take the Drifting career
						careerName = "Drifter";
						drafted = true; // the "drafted" flag here just means automatic qualification and auto-detect "taking a term" in the Drifters
						break;
					case "Draft": // submit to the draft
						careerName = ["Aerospace Defense","Marine","Maritime Defense","Navy","Scout","Surface Defense"].random();
						drafted = true;
						break;
					case "Quit":
						desireToContinue = false;
				}
			}
			else
			{
				public.careers.push(currentCareer); // made it through at least one interrupted term!  push it onto the career history.
				if(public.injuryCrisis) // the career gave the character an Injury Crisis (reduced one characteristic to zero but recovered)
				{
					switch(injuryCrisisChoice.randomChoice()) // DECISION: use decision class
					{
						case "Drifter":
							careerName = "Drifter"; // take terms in the Drifting Career
							drafted = true; // the "drafted" flag here just means automatic qualification
							break;
						case "Quit":
							desireToContinue = false; // alternately, the character has had enough and character generation ends
					}
				}
				else
				{
					if(currentCareer.name != "Drifter")
						careerChoice.choices.nameSearch(currentCareer.name).excluded = true;
					if(careerChoice.checkChoiceWeights() == 0) // can't go back to same career; check if no more careers to choose from
						careerChoice.resetWeights();
					switch(postCareerDecision.randomChoice()) // DECISION: use decision class
					{
						case "Go":
							drafted = false;
							careerName = careerChoice.randomChoice(); // DECISION: use decision class
							break;
						case "Quit":
							desireToContinue = false; // alternately, the character has had enough and character generation ends.
					}
				}
			}
		}
		while(public.age < public.max_age && desireToContinue); 
	} // end public.generate the character
	
	public.nobleTitle = function()
	{
		switch(public.UPP.SOC.value)
		{
			case 10: return public.gender == "M" ? "Lord" : "Lady";
			case 11: return public.gender == "M" ? "Sir" : "Dame";
			case 12: return public.gender == "M" ? "Baron" : "Baroness";
			case 13: return public.gender == "M" ? "Marquis" : "Marchioness";
			case 14: return public.gender == "M" ? "Count" : "Countess";
			case 15: return public.gender == "M" ? "Duke" : "Duchess";
			case 16: return public.gender == "M" ? "Archduke" : "Archduchess";
			case 17: return public.gender == "M" ? "Crown Prince" : "Crown Princess";
			case 18: return public.gender == "M" ? "Emporer" : "Empress";
			default:
				return "";
		}
	}
	
	public.toString = function()
	{
		var result = "";
		if(public.numbered)
			result += "" + public.id + ". ";
		result += (public.rank ? public.rank + " " : "") + (public.nobleTitle() ? public.nobleTitle() + " " : "") + public.name + " ";
		result += "(" + (public.gender == "M" ? "Male " : "Female ") + public.species + ") ";
		result += public.deceased ? "DECEASED " : "";
		result += public.UPP.toString() + " ";
		result += "Age " + public.age + "\r\n";
		for(var i=0;i<public.careers.length;i++)
			result += public.careers[i] + ", ";
		result = result.replace(/,\s$/,"");
		result += "   Cr" + public.cash + "\r\n";
		if(public.traits.length > 0)
			result += public.species + " traits: " + public.traits.join(", ") + "\r\n";
		result += public.skillSet.toString() + "\r\n";
		result += public.equipment;
		result += "\r\nCharacter Event Log:\r\n";
		result += public.log + "\r\n";
		return result;
	}

} // end character class

function ageing(character)
{
	var public = this;
	public.character = character;
	public.age_list = new Array();
	var outer_max_age = public.character.ageing_starts+(MAX_TERMS+5)*TERM_LENGTH;
	var i = 0;
	do
	{
		var nextAge = public.character.ageing_starts+(i*TERM_LENGTH);
		var list_item = new Object();
			list_item.age = nextAge;
			list_item.checked = false;
		public.age_list.push(list_item);
		i++;
	}
	while(nextAge <= outer_max_age);
	
	public.nextAgeCheckDue = function()
	{
		for(var i=0;i<public.age_list.length;i++)
			if(public.age_list[i].checked == false)
				return public.age_list[i];
	}

	public.addToAge = function(numYears)
	{
		for(var i=0;i<numYears;i++)
		{
			public.character.age++;
			var checkObject = public.nextAgeCheckDue();
			if(public.character.age == checkObject.age)
			{
				checkObject.checked = true;
				checkAgeing();
			}
		}
	}
	
	function checkAgeing()
	{
		var attr = [];
		var ageingTableDM = Math.floor((public.character.age - public.character.starting_age) / TERM_LENGTH);
		switch(dice(2)-ageingTableDM)
		{
			case -6:
				public.character.log.newEntry("At age " + public.character.age + ", reduced three physical characteristics by 2, reduce one mental characteristic by 1. ");
				public.character.UPP.STR.add(-2);
				if(public.character.UPP.STR.value == 0)
					ageingCrisis("STR");
				public.character.UPP.DEX.add(-2);
				if(public.character.UPP.DEX.value == 0)
					ageingCrisis("DEX");
				public.character.UPP.END.add(-2);
				if(public.character.UPP.END.value == 0)
					ageingCrisis("END");
				public.character.UPP.INT.add(-1);
				if(public.character.UPP.INT.value == 0)
					ageingCrisis("INT");
				break;
			case -5:
				public.character.log.newEntry("At age " + public.character.age + ", reduced three physical characteristics by 2. ");
				public.character.UPP.STR.add(-2);
				if(public.character.UPP.STR.value == 0)
					ageingCrisis("STR");
				public.character.UPP.DEX.add(-2);
				if(public.character.UPP.DEX.value == 0)
					ageingCrisis("DEX");
				public.character.UPP.END.add(-2);
				if(public.character.UPP.END.value == 0)
					ageingCrisis("END");
				break;
			case -4:
				switch(d3())
				{
					case 1:
						attr = ["STR", "DEX", "END"];
						break;
					case 2:
						attr = ["DEX", "STR", "END"];
						break;
					case 3:
						attr = ["END", "STR", "DEX"];
				}
				public.character.log.newEntry("At age " + public.character.age + ", reduced " + attr[1] + " and " + attr[2] + " by 2, and " + attr[0] + " by 1.");
				public.character.UPP[attr[0]].add(-1);
				if(public.character.UPP[attr[0]].value == 0)
					ageingCrisis(attr[0]);
				public.character.UPP[attr[1]].add(-2);
				if(public.character.UPP[attr[1]].value == 0)
					ageingCrisis(attr[1]);
				public.character.UPP[attr[2]].add(-2);
				if(public.character.UPP[attr[2]].value == 0)
					ageingCrisis(attr[2]);
				break;
			case -3:
				switch(d3())
				{
					case 1:
						attr = ["STR", "DEX", "END"];
						break;
					case 2:
						attr = ["DEX", "STR", "END"];
						break;
					case 3:
						attr = ["END", "STR", "DEX"];
				}
				public.character.log.newEntry("At age " + public.character.age + ", reduced " + attr[1] + " and " + attr[2] + " by 1, and " + attr[0] + " by 2.");
				public.character.UPP[attr[0]].add(-2);
				if(public.character.UPP[attr[0]].value == 0)
					ageingCrisis(attr[0]);
				public.character.UPP[attr[1]].add(-1);
				if(public.character.UPP[attr[1]].value == 0)
					ageingCrisis(attr[1]);
				public.character.UPP[attr[2]].add(-1);
				if(public.character.UPP[attr[2]].value == 0)
					ageingCrisis(attr[2]);
				break;
			case -2:
				public.character.log.newEntry("At age " + public.character.age + ", reduced three physical characteristics by 1. ");
				public.character.UPP.STR.add(-1);
				if(public.character.UPP.STR.value == 0)
					ageingCrisis("STR");
				public.character.UPP.DEX.add(-1);
				if(public.character.UPP.DEX.value == 0)
					ageingCrisis("DEX");
				public.character.UPP.END.add(-1);
				if(public.character.UPP.END.value == 0)
					ageingCrisis("END");
				break;
			case -1:
				switch(d3())
				{
					case 1:
						attr = ["STR", "DEX", "END"];
						break;
					case 2:
						attr = ["DEX", "STR", "END"];
						break;
					case 3:
						attr = ["END", "STR", "DEX"];
				}
				public.character.log.newEntry("At age " + public.character.age + ", reduced " + attr[1] + " and " + attr[2] + " by 1. ");
				public.character.UPP[attr[1]].add(-1);
				if(public.character.UPP[attr[1]].value == 0)
					ageingCrisis(attr[1]);
				public.character.UPP[attr[2]].add(-1);
				if(public.character.UPP[attr[2]].value == 0)
					ageingCrisis(attr[2]);
				break;
			case 0:
				switch(d3())
				{
					case 1:
						attr = ["STR", "DEX", "END"];
						break;
					case 2:
						attr = ["DEX", "STR", "END"];
						break;
					case 3:
						attr = ["END", "STR", "DEX"];
				}
				public.character.log.newEntry("At age " + public.character.age + ", reduced " + attr[0] + " by 1. ");
				public.character.UPP[attr[0]].add(-1);
				if(public.character.UPP[attr[0]].value == 0)
					ageingCrisis(attr[0]);
				break;
			default:
				public.character.log.newEntry("At age " + public.character.age + " there was no effect from age. ");
				break;
		}
	} //end checkAgeing

	function ageingCrisis(attr)
	{
		public.character.log.newEntry("This resulted in an ageing crisis. ");
		var medicalExpense = (Math.floor(Math.random()*6)+1)*10000;
		public.character.log.newEntry("An immediate medical expense of Cr" + medicalExpense + " is needed to save " + public.character.name + "'s life. ");
		if(public.cash < medicalExpense)
		{
			public.character.log.newEntry("Unfortunately " + public.character.name + " possessed insufficient funds and died.");
			public.character.deceased = true;
			return;
		}
		public.character.log.newEntry(attr + " is now set to 1 and character automatically fails qualification rolls. ");
		public.character.UPP[attr].value = 1
		public.character.injuryCrisis = true;
		public.cash -= medicalExpense;
	}
} // end ageing class

function eventLog()
{
	var public = this;
	var logEntries = new Array();
	
	public.newEntry = function(entryString)
	{
		logEntries.push(entryString);
	}
	
	public.toString = function()
	{
		var s = "";
		for(var i=0;i<logEntries.length;i++)
			s += logEntries[i] + "\r\n";
		return s;
	}
}

function UPP(uppDataObject)
{
	var public = this;
	for(var i=0;i<uppDataObject.length;i++)
		public[uppDataObject[i].abbrev] = new characteristic(uppDataObject[i].name, uppDataObject[i].abbrev, uppDataObject[i].dice, uppDataObject[i].mod, uppDataObject[i].afterDash, uppDataObject[i].max);
	
	public.toString = function()
	{
		var result = "";
		for(attribute in public)
			if(public[attribute].abbrev)
				result += public[attribute].toString();
		return result;
	}
}

function characteristic(name, abbrev, numDice, mod, afterDash, max)
{
	var public = this;
	if(arguments.length < 4)
		mod = 0;
	public.name = name;
	public.abbrev = abbrev;
	public.value = dice(numDice) + mod;
	public.afterDash = afterDash;
	public.max = max;
	
	public.modifier = function()
	{
		return Math.floor(public.value/3)-2;
	}
	
	public.check = function(targetNumber, diceMod)
	{
		if(arguments.length < 2)
			diceMod = 0;
		return dice(2)+diceMod+public.modifier() > targetNumber;
	}
	
	public.add = function(amount)
	{
		public.value += amount;
		if(public.value < 0) public.value = 0;
		if(public.value > public.max) public.value = public.max;
	}
	
	public.toString = function()
	{
		return (public.afterDash ? "-" : "") + pseudoHex(public.value);
	}
}

function skillSet()
{
	var public = this;
	public.skillSet = new Array();
	public.skillsDelimiter = false; // false = just a space between the skills, true = comma and a space
	public.skillLinkChar = "-";
	public.skillSortOpt = true;
	
	public.findSkill = function(skillName)
	{
		var i = public.skillSet.length;
		while(i--)
			if(public.skillSet[i].name == skillName)
				return public.skillSet[i];
		return false;
	}

	public.addSkill = function(skillName, level0)
	{
		if(arguments.length < 2)
			level0 = false;
		var cascadeSkill = CascadeLibrary.nameSearch(skillName);
		while(cascadeSkill != -1)
		{
			skillName = CascadeDecisionObjects.nameSearch(cascadeSkill.name).randomChoice(); // DECISION: use decision class
			cascadeSkill = CascadeLibrary.nameSearch(skillName);
		}
		var existingSkill = public.findSkill(skillName);
		if(level0)
		{
			if(!existingSkill)
			{
				public.skillSet.push(new skill(skillName, 0, public.skillLinkChar));
				return true;
			}
			else
			{
				return false;
			}
		}
		if(existingSkill)
			existingSkill.level++;
		else
			public.skillSet.push(new skill(skillName, 1, public.skillLinkChar));
		return true;
	}
	
	public.toString = function()
	{
		var result = "";
		if(public.skillSortOpt)
			public.skillSet.sort(function(skill1, skill2) { return skill2.level - skill1.level; });
		else
			public.skillSet.sort(array_sort_by_name);
		for(var i=0;i<public.skillSet.length;i++)
			result += public.skillSet[i].toString() + (public.skillsDelimiter ? ", " : " ");
		return result.trim();
	}
}

function skill(name, level, linkChar)
{
	var public = this;
	public.name = name;
	public.level = level;
	if(arguments.length < 3)
		public.linkChar = "-";
	else
		public.linkChar = linkChar;
	
	public.toString = function()
	{
		return public.name + public.linkChar + public.level;
	}
}

var wpnDagger = { name:"Dagger", skill:"Slashing Weapons" };
var wpnSpear = { name:"Spear", skill:"Piercing Weapons" };
var wpnPike = { name:"Pike", skill:"Piercing Weapons" };
var wpnSword = { name:"Sword", skill:"Slashing Weapons" };
var wpnBroadsword = { name:"Broadsword", skill:"Slashing Weapons" };
var wpnHalberd = { name:"Halberd", skill:"Piercing Weapons" };
var wpnBayonet = { name:"Bayonet", skill:"Piercing Weapons" };
var wpnBlade = { name:"Blade", skill:"Slashing Weapons" };
var wpnCutlass = { name:"Cutlass", skill:"Slashing Weapons" };
var wpnFoil = { name:"Foil", skill:"Slashing Weapons" };
var wpnBow = { name:"Bow", skill:"Archery" };
var wpnCrossbow = { name:"Crossbow", skill:"Archery" };
var wpnRevolver = { name:"Revolver", skill:"Slug Pistol" };
var wpnAutoPistol = { name:"Auto Pistol", skill:"Slug Pistol" };
var wpnCarbine = { name:"Carbine", skill:"Slug Rifle" };
var wpnRifle = { name:"Rifle", skill:"Slug Rifle" };
var wpnShotgun = { name:"Shotgun", skill:"Shotgun" };
var wpnSMG = { name:"Submachinegun", skill:"Slug Rifle" };
var wpnAutoRifle = { name:"Auto Rifle", skill:"Slug Rifle" };
var wpnAssaultRifle = { name:"Assault Rifle", skill:"Slug Rifle" };
var wpnBodyPistol = { name:"Body Pistol", skill:"Slug Pistol" };
var wpnLaserCarbine = { name:"Laser Carbine", skill:"Energy Rifle" };
var wpnSnubPistol = { name:"Snub Pistol", skill:"Slug Pistol" };
var wpnAccRifle = { name:"Accelerator Rifle", skill:"Slug Rifle" };
var wpnLaserRifle = { name:"Laser Rifle", skill:"Energy Rifle" };
var wpnACR = { name:"Advanced Combat Rifle", skill:"Slug Rifle" };
var wpnGaussRifle = { name:"Gauss Rifle", skill:"Slug Rifle" };
var wpnLaserPistol = { name:"Laser Pistol", skill:"Energy Pistol" };

var weaponList = [ wpnDagger, wpnSpear, wpnPike, wpnSword, wpnBroadsword, wpnHalberd, wpnBayonet, wpnBlade, wpnCutlass, wpnFoil, wpnBow, wpnCrossbow, wpnRevolver, wpnAutoPistol, wpnCarbine, wpnRifle, wpnShotgun, wpnSMG, wpnAutoRifle, wpnAssaultRifle, wpnBodyPistol, wpnLaserCarbine, wpnSnubPistol, wpnAccRifle, wpnLaserRifle, wpnACR, wpnGaussRifle, wpnLaserPistol ];

//benefitItemTemplate = { name:"", onceOnly:false, weapon:false };
explorersBenefit = { name:"Explorers' Society", onceOnly:true, weapon:false };
researchVBenefit = { name:"Research Vessel", onceOnly:true, weapon:false };
courierVBenefit = { name:"Courier Vessel", onceOnly:true, weapon:false };
weaponBenefit = { name:"Weapon", onceOnly:false, weapon:true };

var specialCaseBenefits = [ explorersBenefit, weaponBenefit, researchVBenefit, courierVBenefit ];

function equipmentSet(characterObject)
{
	var public = this;
	public.equipment = new Array();
	public.character = characterObject;
	
	public.findEquipment = function(equipmentName)
	{
		var i = public.equipment.length;
		while(i--)
			if(public.equipment[i].name == equipmentName)
				return public.equipment[i];
		return false;
	}
	
	public.addEquipment = function(equipmentName)
	{
		var specialCase = specialCaseBenefits.nameSearch(equipmentName);
		if(specialCase != -1)
		{
			if(specialCase.onceOnly)
				if(!public.findEquipment(equipmentName)) // i.e. in the 'once only' case, do nothing if we find it's already there
				{
					public.equipment.push(new equipment(equipmentName));
					public.character.log.newEntry(" Mustering Out Benefit: " + equipmentName);
				}
				else
				{
					public.character.log.newEntry(" Mustering Out Benefit: " + equipmentName + " cannot be received more than once.  Roll wasted.");
				}
			if(specialCase.weapon)
				chooseWeapon();
		}
		else
		{
			public.character.log.newEntry(" Mustering Out Benefit: " + equipmentName);
			var existingEquipment = public.findEquipment(equipmentName);
			if(existingEquipment)
				existingEquipment.amount++;
			else
				public.equipment.push(new equipment(equipmentName));
		}
		
	}
	
	public.toString = function()
	{
		return public.equipment.join(", ");
	}
	
	function chooseWeapon()
	{
		var hasWeapons = existingWeapons();
		var weaponChosen = "";
		if(hasWeapons)
		{
			switch(weaponChoiceifHaveWeapon.randomChoice())	// DECISION use decision class
			{
				case "Skill in weapon":
					var weaponName = hasWeapons.random(); // this could be a DECISION class but too difficult to construct mid-character generation
					var skillName = weaponList.nameSearch(weaponName).skill;
					public.character.skillSet.addSkill(skillName);
					public.character.log.newEntry(" Mustering Out Benefit: took skill in " + skillName + " because " + public.character.name + " already had a " + weaponName);
					break;
				case "New Weapon":
					weaponChosen = weaponBenefitChoice.randomChoice();
					public.equipment.push(new equipment(weaponChosen));
					public.character.log.newEntry(" Mustering Out Benefit: received " + weaponChosen);
			}
		}
		else
		{
			weaponChosen = weaponBenefitChoice.randomChoice();
			public.equipment.push(new equipment(weaponChosen)); //DECISION: use decision class
			public.character.log.newEntry(" Mustering Out Benefit: received " + weaponChosen);
		}
	}
	
	function existingWeapons()
	{
		var result = [];
		for(var i=0;i<weaponList.length;i++)
			if(public.findEquipment(weaponList[i].name))
				result.push(weaponList[i].name);
		return result.length == 0 ? false : result;
	}
}

function equipment(name)
{
	var public = this;
	public.name = name;
	public.amount = 1;
	
	public.toString = function()
	{
		if(public.amount == 1)
			return public.name;
		return public.name + "(x" + public.amount + ")";
	}
}

function Career(characterObject, whichCareer)
{
	var public = this;
	public.character = characterObject;
	public.name = whichCareer;
	public.terms = 0;
	public.rank = 0;
	public.discharge = false;
	public.dishonourableDischarge = false;
	public.failedQualification = false;
	public.drafted = false;
	public.firstCareer = public.character.hadFirstCareer;
	var careerData = availableCareers.nameSearch(whichCareer);
	
	public.execute = function()
	{
		if(!public.drafted)
		{
			if(!qualify())
			{
				public.failedQualification = true;
				public.character.log.newEntry("Failed to qualify for " + careerData.description + ". ");
				return;
			}
			else
			{
				public.character.log.newEntry("<-- Qualified for " + careerData.description + ".-->");
				public.character.hadFirstCareer = true;
			}
		}
		else
		{
			if(public.name == "Drifter")
				public.character.log.newEntry("<-- Taking a term in the Drifters .-->");
			else
				public.character.log.newEntry("<-- Drafted into " + careerData.description + ".-->");
			public.character.hadFirstCareer = true;
		}
		if(public.firstCareer)
		{
			for(var i=0;i<careerData.service.length;i++)
				public.character.skillSet.addSkill(careerData.service[i],true);
			public.character.log.newEntry(" - Gained all Service skills at level-0 for " + careerData.description + " as this is the character's first career.");
		}
		var rankSkill = careerData.rankSkills[0];
		if(rankSkill)
		{
			public.character.skillSet.addSkill(rankSkill);
			public.character.log.newEntry("  > Skill gained as a result of reaching rank " + public.rank + ": " + rankSkill);
		}
		do
		{
			public.character.log.newEntry(" Term " + (public.terms + 1) + " in " + careerData.description + ": ");
			if(!survive())
			{
				if(public.character.survivalTable)
				{
					public.character.log.newEntry(" - Survival Mishap. ");
					survivalMishap();
				}
				else
				{
					public.character.log.newEntry(" - Survival Roll Failed: DEATH. ");
					public.character.deceased = true;
				}
				if(public.character.deceased || public.discharge)
				{
					public.character.ageing.addToAge(INTERRUPTED_TERM_LENGTH);
					break;
				}
			}
			var skillRolls = careerData.commissionChar ? 1 : 2;
			if(careerData.commissionChar && public.rank == 0 && !(public.terms == 0 && public.drafted))
				if(commission())
				{
					public.rank = 1;
					public.character.log.newEntry(" - Commissioned. Rank is now " + public.rank);
					skillRolls++;
					rankSkill = careerData.rankSkills[1];
					if(rankSkill)
					{
						public.character.skillSet.addSkill(rankSkill);
						public.character.log.newEntry("  > Skill gained as a result of reaching rank " + public.rank + ": " + rankSkill);
					}
				}
			if(careerData.advanceChar && public.rank >=1 && public.rank < 6)
				if(advancement())
				{
					public.character.log.newEntry(" - Advanced to rank " + (public.rank+1) + " - " + careerData.ranks[public.rank+1] + ". ");
					public.rank++;
					rankSkill = careerData.rankSkills[public.rank];
					if(rankSkill)
					{
						public.character.skillSet.addSkill(rankSkill);
						public.character.log.newEntry("  > Skill gained as a result of reaching rank " + public.rank + ": " + rankSkill);
					}
					skillRolls++;
				}
			gainSkills(skillRolls);
			public.terms++;
			public.character.ageing.addToAge(TERM_LENGTH);
			if(public.character.deceased)
				break;
			if(public.drafted && public.name == "Drifter")
				break;
			var reenlistRoll = dice(2);
		}
		while(reenlistRoll == 12 || (reenlistRoll >= careerData.reenlist && public.character.age < public.character.max_age && endOfTermDecision.randomChoice() == "Go")); //DECISION: use decision class
		public.character.rank = careerData.ranks[public.rank];
		if(!public.dishonourableDischarge && !public.character.deceased)
			musterOut();
		public.character.log.newEntry("<-- Career in " + careerData.description + " ends. -->");
	}
	
	function qualify()
	{
		var qualificationDM = public.character.careers.length*QUALIFICATION_DM_PER_PREVIOUS_CAREER;
		return public.character.UPP[careerData.qualChar].check(careerData.qualTarget, qualificationDM);
	}
	
	function survive()
	{
		return public.character.UPP[careerData.surviveChar].check(careerData.surviveTarget);
	}
	
	function commission()
	{
		return public.character.UPP[careerData.commissionChar].check(careerData.commissionTarget);
	}
	
	function advancement()
	{
		return public.character.UPP[careerData.advanceChar].check(careerData.advanceTarget);
	}
	
	function gainSkills(numRolls)
	{
		var whichTable = "";
		var checkChoiceWeights = 0;
		for(var i=0;i<numRolls;i++)
		{
			if(public.character.UPP.EDU.value < 8)
			{
				skillTableChoice.choices.nameSearch("advEdu").excluded = true; // exclude the Advanced Education Table, insufficient education
				checkChoiceWeights = skillTableChoice.checkChoiceWeights(); // now that we have excluded Advance Education, just check user has given weight to other tables
				if(checkChoiceWeights == 0) //Nope, no weight given, apply even random chance to any of the three other tables.
				{
					var advEduWeight = skillTableChoice.choices.nameSearch("advEdu").weight; 	// ... but save the advEduWeight
					whichTable = skillTableChoice.resetWeights(); 								// just in case EDU advances to 8
					if(advEduWeight > 1)														// and so we keep the users' strong weighting for advEdu
						skillTableChoice.choices.nameSearch("advEdu").weight = advEduWeight;
				}
			}
			else
				skillTableChoice.choices.nameSearch("advEdu").excluded = false;
			whichTable = skillTableChoice.randomChoice(); // DECISION: use decision class
			var skill = careerData[whichTable].random();
			public.character.log.newEntry("  > Skill roll on the " + skillTablesDescriptions[whichTable] + " table: gained " + skill);
			if(skill.startsWith("+"))
			{
				var attribute = skill.substr(3,3);
				var amount = parseInt(skill.substr(1,1));
				public.character.UPP[attribute].add(amount);
			}
			else
				public.character.skillSet.addSkill(skill);
		}
	}
	
	function survivalMishap()
	{
		var eventRoll = dice(1);
		switch(eventRoll)
		{
			case 1:
				var attr = "";
				var reduc = dice(1);
				switch(d3())
				{
					case 1:
						attr = "STR";
						break;
					case 2:
						attr = "DEX";
						break;
					case 3:
						attr = "END";
						break;
				}
				public.character.log.newEntry("  > Injured in action. Reduced " + attr + " by " + reduc + ". ");
				public.character.UPP[attr].add(-reduc);
				if(public.character.UPP[attr].value == 0)
					injuryCrisis(attr);
				else
					healingMedicalExpense(attr,reduc);
				break;
			case 2:
				public.discharge = true;
				public.character.log.newEntry("  > Honourable discharge from " + careerData.description + ". ");
				break;
			case 3:
				public.discharge = true;
				public.character.log.newEntry("  > Honorably discharged from " + careerData.description + " after a long legal battle. Legal issues create a debt of Cr10,000. ");
				public.character.cash -= 10000;
				break;
			case 4:
				public.discharge = true;
				public.dishonourableDischarge = true;
				public.character.log.newEntry("  > Dishonorably discharged from " + careerData.description + ". Lost all benefits. ");
				break;
			case 5:
				public.discharge = true;
				public.dishonourableDischarge = true;
				public.character.age += 4;
				public.character.log.newEntry("  > Dishonorably discharged from " + careerData.description + " after serving an extra 4 years in prison for a crime. Lost all benefits. ");
				break;
			case 6:
				public.discharge = true;
				public.character.log.newEntry("  > Medically discharged from " + careerData.description + ". ");
				injury();
		}
		
	}
		
	function injury()
	{
		var eventRoll = dice(1);
		switch(eventRoll)
		{
			case 1:
				var rc = Math.floor(Math.random()*3)+1;
				var attr = [];
				var reduc = dice(1);
				var reduc1 = 2;
				var reduc2 = 2;
				switch(rc)
				{
					case 1:
						attr = ["STR", "DEX", "END"];
						break;
					case 2:
						attr = ["DEX", "STR", "END"];
						break;
					case 3:
						attr = ["END", "STR", "DEX"];
						break;
				}
				public.character.log.newEntry("  > Nearly killed. Reduced " + attr[0] + " by " + reduc + ". Reduced both other physical characteristics by 2. ");
				public.character.UPP[attr[0]].add(-reduc);
				if(public.character.UPP[attr[0]].value == 0)
					injuryCrisis(attr[0]);
				else
					healingMedicalExpense(attr[0],reduc);
				if(!public.character.deceased)
				{
					public.character.UPP[attr[1]].add(-reduc1);
					if(public.character.UPP[attr[1]].value == 0)
						injuryCrisis(attr[1]);
					else
						healingMedicalExpense(attr[1],reduc1);
				}
				if(!public.character.deceased)
				{
					public.character.UPP[attr[2]].add(-reduc2);
					if(public.character.UPP[attr[2]].value == 0)
						injuryCrisis(attr[2]);
					else
						healingMedicalExpense(attr[2],reduc2);
				}
				break;
			case 2:
				var attr = "";
				var reduc = dice(1);
				switch(d3())
				{
					case 1:
						attr = "STR";
						break;
					case 2:
						attr = "DEX";
						break;
					case 3:
						attr = "END";
						break;
				}
				public.character.log.newEntry("  > Severely injured. Reduced  " + attr + " by " + reduc + ". ");
				public.character.UPP[attr].add(-reduc);
				if(public.character.UPP[attr].value == 0)
					injuryCrisis(attr);
				else
					healingMedicalExpense(attr,reduc);
				break;
			case 3:
				var eyeOrLimb = Math.floor(Math.random()*2) == 0 ? "eye" : "limb";
				var attr = eyeOrLimb == "eye" ? "DEX" : "STR";
				public.character.log.newEntry("  > Missing " + eyeOrLimb + ". Reduce " + attr + " by 2.");
				public.character.UPP[attr].add(-2);
				if(public.character.UPP[attr].value == 0)
					injuryCrisis(attr);
				else
					healingMedicalExpense(attr,2);
				break;
			case 4:
				var attr = "";
				switch(d3())
				{
					case 1:
						attr = "STR";
						break;
					case 2:
						attr = "DEX";
						break;
					case 3:
						attr = "END";
						break;
				}					
				public.character.log.newEntry("  > Scarred and injured. Reduced " + attr + " by 2. ");
				public.character.UPP[attr].add(-2);
				if(public.character.UPP[attr].value == 0)
					injuryCrisis(attr);					
				else
					healingMedicalExpense(attr,2);
				break;
			case 5:
				var attr = "";
				switch(d3())
				{
					case 1:
						attr = "STR";
						break;
					case 2:
						attr = "DEX";
						break;
					case 3:
						attr = "END";
						break;
				}					
				public.character.log.newEntry("  > Injured. Reduced " + attr + " by 1. ");
				public.character.UPP[attr].add(-1);
				if(public.character.UPP[attr].value == 0)
					injuryCrisis(attr);	
				else
					healingMedicalExpense(attr,1);
				break;
			case 6:
				public.character.log.newEntry("  > Lightly injured. No permanent effect. ");
		}
	}
		
	function injuryCrisis(attr)
	{
		public.character.log.newEntry("  > This resulted in an injury crisis. ");
		var medicalExpense = (Math.floor(Math.random()*6)+1)*10000;
		public.character.log.newEntry("   > An immediate medical expense of Cr" + medicalExpense + " is needed to save " + public.character.name + "'s life. ");
		if(public.character.cash < medicalExpense)
		{
			public.character.log.newEntry("   > Unfortunately " + public.character.name + " possessed insufficient funds and died.");
			public.character.deceased = true;
			return;
		}
		public.character.log.newEntry("   > " + attr + " is now set to 1 and character automatically fails qualification rolls. ");
		public.character.UPP[attr].value = 1
		public.character.injuryCrisis = true;
		public.character.cash -= medicalExpense;
	}

	function healingMedicalExpense(attribute, numPoints)
	{
		var subsidy = 0;
		switch(dice(2))
		{
			case 2:
			case 3:
				subsidy = 0;
				break;
			case 4:
			case 5:
			case 6:
			case 7:
				subsidy = careerData.medicalBills[0];
				break;
			case 8:
			case 9:
			case 10:
			case 11:
				subsidy = careerData.medicalBills[1];
				break;
			case 12:
				subsidy = careerData.medicalBills[2];
		}
		var medicalBill = numPoints*5000;
		public.character.log.newEntry("  > The total medical bill was Cr" + medicalBill + ", subsidized " + (subsidy*100) + "% by " + careerData.description + ". ");
		medicalBill -= medicalBill*subsidy;
		public.character.cash -= medicalBill;
		public.character.UPP[attribute].add(numPoints);
	}
	
	function musterOut()
	{
		var numBenefits = Math.floor(public.terms);
		var i = 0;
		var roll = 0;
		var whichTable = "";
		numBenefits += Math.max(0, public.rank-3);
		var benefit = "";
		var cashBenefitsLeft = 3;
		while(numBenefits > 0)
		{
			if(cashBenefitsLeft == 0)
				whichTable = "material"; // no cash benefits left!  Roll must be taken on material benefits table
			else
				whichTable = benefitTableChoice.randomChoice(); // DECISION - use decision class
			switch(whichTable)
			{
				case "cash":
					cashBenefitsLeft--;
					roll = dice(1);
					if(public.terms >=5 || public.character.skillSet.findSkill("Gambling"))
						roll++;
					public.character.cash += parseInt(careerData.cash[roll-1]);
					public.character.log.newEntry(" Mustering Out Benefit: cash of Cr" + careerData.cash[roll-1]);
					break;
				case "material":
					roll = dice(1);
					if(public.rank > 4)
						roll++;
					benefit = careerData.benefits[roll-1];
					if(benefit.startsWith("+"))
					{
						public.character.UPP[benefit.substr(3,3)].add(parseInt(benefit.substr(1,1))); // benefit = "+1 INT"
						public.character.log.newEntry(" Mustering Out Benefit: " + benefit);
					}
					else
						public.character.equipment.addEquipment(benefit);
			}
			numBenefits--;
		}
		if(public.terms >=5 && !public.dishonourableDischarge)
		{
			var pension = 8000 + (public.terms-4)*2000;
			public.character.equipment.addEquipment("Annual Pension from " + careerData.description + ": Cr" + pension);
		}
	}
	
	public.toString = function()
	{
		return public.name + "(" + public.terms + ")";
	}
}

function esper()
{
	var public = this;
	character.call(public);
	public.prototype = new character(); // these three lines implement inheritence from the character class constructor
	public.species = "Esper";
	public.UPP = new UPP(esperUPPData);
	public.traits = ["Psionic"];
}

function avian()
{
	var public = this;
	character.call(public);
	public.prototype = new character(); // these three lines implement inheritence from the character class constructor
	public.species = "Avian";
	public.UPP = new UPP(avianUPPData);
	public.traits = ["Weak Strength","Notable Dexterity","Weak Endurance","Flyer (9m)","Low Gravity Adaptation","Natural Pilot","Slow Speed (4.5m)","Small"];
	public.starting_age = 22;
	public.age = public.starting_age;
	public.ageing_starts = 46;
	public.max_age = public.starting_age+MAX_TERMS*TERM_LENGTH;
	public.skillSet.addSkill("Athletics",true);
}

function insectan()
{
	var public = this;
	character.call(public);
	public.prototype = new character();// these three lines implement inheritence from the character class constructor
	public.species = "Insectan";
	public.UPP = new UPP(insectanUPPData);
	public.traits = ["Notable Dexterity","Armoured","Bad First Impression","Caste","Cold-blooded","Fast Speed (9m)","Great Leaper","Hive Mentality"];
	public.skillSet.addSkill("Athletics",true);
}

function merfolk()
{
	var public = this;
	character.call(public);
	public.prototype = new character();// these three lines implement inheritence from the character class constructor
	public.species = "Merfolk";
	public.traits = ["Amphibious","Aquatic","Natural Swimmer","Water Dependent"];
}

function reptilian()
{
	var public = this;
	character.call(public);
	public.prototype = new character();// these three lines implement inheritence from the character class constructor
	public.species = "Reptilian";
	public.UPP = new UPP(reptilianUPPData);
	public.traits = ["Anti-Psionic","Fast Speed (9m)","Heat Endurance","Low-light Vision","Natural Weapon (teeth)","Low Gravity Adaptation"];
	public.starting_age = 22;
	public.age = public.starting_age;
	public.ageing_starts = 42;
	public.skillSet.addSkill("Natural Weapons");
}