function startGenerating()
{
	var i = 0;
	var skillSort = document.getElementById("sortBySkill").value;
	var allCharacters = [];
	var skillLinkChar = document.getElementById("skillLinkChar").value;
	var skillSortOpt = document.getElementById("skillSortOpt").value;
	
	CascadeLibrary = [ AnimalsCascade, SciencesCascade, GunCombatCascade, GunneryCascade, MeleeCascade, VehicleCascade, AircraftCascade, WatercraftCascade ];
	
	careerChoice = new decision(careerChoiceData);
	careerChoice.applyWeights("Career");

	failedQualificationChoice = new decision(failedQualificationChoiceData);
	failedQualificationChoice.applyWeights("failedQualification");
	
	injuryCrisisChoice = new decision(injuryCrisisChoiceData);
	injuryCrisisChoice.applyWeights("injuryCrisis");
	
	postCareerDecision = new decision(postCareerDecisionData);
	postCareerDecision.applyWeights("careerCompletion");
	
	endOfTermDecision = new decision(endOfTermDecisionData);
	endOfTermDecision.applyWeights("termCompletion");
	
	backgroundSkillsChoice = new decision(backgroundSkillsChoiceData);
	backgroundSkillsChoice.applyWeights("backgroundSkills");
	
	weaponBenefitChoice = new decision(weaponBenefitChoiceData);
	weaponBenefitChoice.applyWeights("weaponChoice");
	
	weaponChoiceifHaveWeapon = new decision(weaponChoiceifHaveWeaponData);
	weaponChoiceifHaveWeapon.applyWeights("subsequentWeaponChoice");
	
	skillTableChoice = new decision(skillTableChoiceData);
	skillTableChoice.applyWeights("skillTable");
	
	benefitTableChoice = new decision(benefitTableChoiceData);
	benefitTableChoice.applyWeights("benefitTable");
	
	animalsCascadeChoice = new decision(AnimalsCascade);
	animalsCascadeChoice.applyWeights("animalsCascade");

	sciencesCascadeChoice = new decision(SciencesCascade);
	sciencesCascadeChoice.applyWeights("sciencesCascade");
	
	gunCombatChoice = new decision(GunCombatCascade);
	gunCombatChoice.applyWeights("gunCombatCascade");
	
	gunneryChoice = new decision(GunneryCascade);
	gunneryChoice.applyWeights("gunneryCascade");
	
	meleeCombatChoice = new decision(MeleeCascade);
	meleeCombatChoice.applyWeights("meleeCombatCascade");
	
	vehicleChoice = new decision(VehicleCascade);
	vehicleChoice.applyWeights("vehicleCascade");
	
	aircraftChoice = new decision(AircraftCascade);
	aircraftChoice.applyWeights("aircraftCascade");
	
	watercraftChoice = new decision(WatercraftCascade);
	watercraftChoice.applyWeights("watercraftCascade");

	CascadeDecisionObjects = [ animalsCascadeChoice, sciencesCascadeChoice, gunCombatChoice, gunneryChoice, meleeCombatChoice, vehicleChoice, aircraftChoice, watercraftChoice ];
	
	var numChar = parseInt(document.getElementsByName("numCharacters")[0].value);
	var insertNumbers = document.getElementsByName("insertNumbers")[0].checked;
	MAX_TERMS = parseInt(document.getElementsByName("maxTerms")[0].value);
	var species = document.getElementsByName("species")[0].value;
	var skillsDelimiter = document.getElementsByName("skillsDelimiter")[0].checked;
	var survivalOption = document.getElementsByName("survivalOption")[0].value == "1";
			
	var saveText = "";
	
	counter = 0;

	for(i=0;i<numChar;i++)
	{
		var myCharacter;
		switch(species)
		{
			case "human":
				myCharacter = new character();
				break;
			case "esper":
				myCharacter = new esper();
				break;
			case "avians":
				myCharacter = new avian();
				break;
			case "insectan":
				myCharacter = new insectan();
				break;
			case "merfolk":
				myCharacter = new merfolk();
				break;
			case "reptilian":
				myCharacter = new reptilian();
				break;
		}
		
		myCharacter.skillLinkChar = skillLinkChar;
		myCharacter.skillSortOpt = skillSortOpt;
		myCharacter.gender = Math.floor(Math.random()*2) == 0 ? "F" : "M";
		myCharacter.name = (myCharacter.gender == "F" ? femaleFirstNames.random() : maleFirstNames.random()) + " " + familyNames.random();
		myCharacter.numbered = insertNumbers;
		myCharacter.skillsDelimiter = skillsDelimiter;
		myCharacter.survivalTable = survivalOption;
		myCharacter.generate();
		allCharacters.push(myCharacter);
		careerChoice.includeAll();
		careerChoice.restoreWeights();
	}
	
	if(skillSort != "Do Not Sort")
	{
		saveText += "Characters sorted by the following skill: " + skillSort + "\r\n";
		allCharacters.sort(function (a, b) { 
												var skill_a = a.skillSet.findSkill(skillSort);
												var skill_b = b.skillSet.findSkill(skillSort);
												if(!skill_a && skill_b)
													return 1;
												if(skill_a && !skill_b)
													return -1;
												if(!skill_a && !skill_b)
													return 0;
												return skill_b.level - skill_a.level
											});
	}
	
	allCharacters.map(function(v, i) {v.id = i; saveText += v.toString() + "\r\n+-----------------------------------------------------------------+\r\n"});


	var blob = new Blob([saveText], {type: "text/plain;charset=utf-8"});
	saveAs(blob, "My Characters.txt");
}

function backgroundSkillsAvailable()
{
	backgroundSkillElements = document.getElementsByName("backgroundSkills");
	tradeCodeElements = document.getElementsByName("TradeCode");
	var lawLevel = parseInt(document.getElementsByName("Law")[0].value);
	
	if(lawLevel < 7)
	{
		document.getElementById("Gun Combat").disabled = false;
		document.getElementById("Melee Combat").disabled = true;
		document.getElementById("Melee Combat").value = 0;
	}
	else
	{
		document.getElementById("Gun Combat").disabled = true;
		document.getElementById("Gun Combat").value = 0;
		document.getElementById("Melee Combat").disabled = false;
	}
	if(lawLevel > 9)
	{
		document.getElementById("Gun Combat").disabled = true;
		document.getElementById("Gun Combat").value = 0;
		document.getElementById("Melee Combat").disabled = true;
		document.getElementById("Melee Combat").value = 0;
	}
	
	var tradeCodes = checkboxSelect(tradeCodeElements);
	if(!tradeCodes)
	{
		document.getElementById("Zero-G").disabled = true;
		document.getElementById("Zero-G").value = 0;
		document.getElementById("Survival").disabled = true;
		document.getElementById("Survival").value = 0;
		document.getElementById("Watercraft").disabled = true;
		document.getElementById("Watercraft").value = 0;
		document.getElementById("Streetwise").disabled = true;
		document.getElementById("Streetwise").value = 0;
		document.getElementById("Broker").disabled = true;
		document.getElementById("Broker").value = 0;
		return;
	}
	if(tradeCodes.search("As") != -1 || tradeCodes.search("Ic") != -1 || tradeCodes.search("Va") != -1)
		document.getElementById("Zero-G").disabled = false;
	else
	{
		document.getElementById("Zero-G").disabled = true;
		document.getElementById("Zero-G").value = 0;
	}
	
	if(tradeCodes.search("Lt") != -1 || tradeCodes.search("De") != -1)
		document.getElementById("Survival").disabled = false;
	else
	{
		document.getElementById("Survival").disabled = true;
		document.getElementById("Survival").value = 0;
	}

	if(tradeCodes.search("Wa") != -1 || tradeCodes.search("Fl") != -1)
		document.getElementById("Watercraft").disabled = false;
	else
	{
		document.getElementById("Watercraft").disabled = true;
		document.getElementById("Watercraft").value = 0;
	}
	
	if(tradeCodes.search("Hi") != -1)
		document.getElementById("Streetwise").disabled = false;
	else
	{
		document.getElementById("Streetwise").disabled = true;
		document.getElementById("Streetwise").value = 0;
	}

	if(tradeCodes.search("In") != -1)
		document.getElementById("Broker").disabled = false;
	else
	{
		document.getElementById("Broker").disabled = true;
		document.getElementById("Broker").value = 0;
	}
}

function disappear(divRef)
{
	divRef.style.visibility = "hidden";
}

function helpClick(divId)
{
	var divElem = document.getElementById(divId);
	divElem.style.visibility = "visible";
}