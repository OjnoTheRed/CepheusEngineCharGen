careerChoiceData = { name:"careerChoice", choices:["Athlete","Aerospace Defense","Agent","Barbarian","Belter","Bureaucrat","Colonist","Diplomat","Drifter","Entertainer","Hunter","Marine","Maritime Defense","Mercenary","Merchant","Navy","Noble","Physician","Pirate","Rogue","Scientist","Scout","Surface Defense","Technician"] };
failedQualificationChoiceData = { name:"failedQualification", choices:["Quit","Drifter","Draft"] };
injuryCrisisChoiceData = { name:"injuryCrisis", choices:["Quit","Drifter"] };
postCareerDecisionData = { name:"postCareer", choices:["Quit","Go"] };
endOfTermDecisionData = { name:"endOfTerm", choices:["Quit","Go"] };
backgroundSkillsChoiceData  = { name:"backgroundSkills", choices: ["Admin", "Advocate", "Animals", "Broker", "Carousing", "Comms", "Computer", "Electronics", "Engineering", "Gun Combat", "Life Sciences", "Linguistics", "Mechanics", "Medicine", "Melee Combat", "Physical Sciences", "Social Sciences", "Space Sciences", "Streetwise", "Survival", "Watercraft", "Zero-G" ] };
weaponBenefitChoiceData = { name:"weaponChoice", choices:[ "Dagger","Spear","Pike","Sword","Broadsword","Halberd","Bayonet","Blade","Cutlass","Foil","Bow","Crossbow","Revolver","Auto Pistol","Carbine","Rifle","Shotgun","Submachinegun","Auto Rifle","Assault Rifle","Body Pistol","Laser Carbine","Snub Pistol","Accelerator Rifle","Laser Rifle","Advanced Combat Rifle","Gauss Rifle","Laser Pistol" ] };weaponChoiceifHaveWeaponData = { name:"existingWeaponChoice", choices:[ "Skill in weapon", "New Weapon" ] };
skillTableChoiceData = { name:"skillTableChoice", choices:["personalDev", "service", "specialist", "advEdu"] };
benefitTableChoiceData = { name:"benefitTableChoice", choices:["cash", "material"] };function decision(decisionData){	var public = this;	public.data = decisionData;
	public.name = decisionData.name;	public.choices = [];	for(var i=0;i<public.data.choices.length;i++)		public.choices.push({name:public.data.choices[i],weight:1,savedWeight:1,excluded:false});
	public.randomChoice = function()	{
		if(public.checkChoiceWeights() == 0)
			public.resetWeights();
		var weightedChoiceIndex = [];		for(var i=0;i<public.choices.length;i++)			if(!public.choices[i].excluded)
				for(var j=0;j<public.choices[i].weight;j++)
					weightedChoiceIndex.push(public.choices[i].name);
		return weightedChoiceIndex.random();	}
	
	public.getAllWeightedChoices = function ()
	{
		var result = [];
		for(var i=0;i<public.choices.length;i++)
			if(!public.choices[i].excluded && public.choices[i].weight > 0)
				result.push(public.choices[i].name);
		return result;
	}
	public.resetWeights = function()
	{
		for(var i=0;i<public.choices.length;i++)
			public.choices[i].weight = 1;
	}
		public.setWeight = function(choiceName, weight)	{		public.choices.nameSearch(choiceName).weight = weight;	}	public.getWeight = function(choiceName)	{		return public.choices.nameSearch(choiceName).weight;	}
	
	public.exclude = function(choiceName)
	{
		public.choices.nameSearch(choiceName).excluded = true;
	}
	
	public.include = function(choiceName)
	{
		public.choices.nameSearch(choiceName).excluded = false;
	}
	
	public.includeAll = function()
	{
		for(var i=0;i<public.choices.length;i++)
			public.choices[i].excluded = false;
	}
	
	public.checkChoiceWeights = function()
	{
		var totalWeight = 0;
		for(var i=0;i<public.choices.length;i++)
			if(!public.choices[i].excluded)
				totalWeight += public.choices[i].weight;
		return totalWeight;
	}

	public.applyWeights = function(nameOfRangeSet)
	{
		var choiceElements = document.getElementsByName(nameOfRangeSet);
		for(var i=0;i<choiceElements.length;i++)
		{
			public.choices.nameSearch(choiceElements[i].id).weight = choiceElements[i].value;
			public.choices.nameSearch(choiceElements[i].id).savedWeight = choiceElements[i].value;
		}
		if(public.checkChoiceWeights() == 0)
			public.resetWeights();
	}
	
	public.restoreWeights = function()
	{
		for(var i=0;i<public.choices.length;i++)
			public.choices[i].weight = public.choices[i].savedWeight;
	}
	
	public.display = function()
	{
		var s = "";
		s += public.name + ":\n";
		for(var i=0;i<public.choices.length;i++)
			s += public.choices[i].name + " weight: " + public.choices[i].weight + " excluded: " + public.choices[i].excluded + "\n";
		window.alert(s);
	}
	
	public.debugString = function()
	{
		var s = "";
		s += public.name + ":\n";
		for(var i=0;i<public.choices.length;i++)
			s += "--" + public.choices[i].name + "; Weight: " + public.choices[i].weight + "; Excluded?: " + public.choices[i].excluded + "\n";
		s += "\n";
		return s;
	}}
