import { ApiResponse, CropCalendar, CalendarTask, CropStage, CropStageInfo, Crop } from '../../types';

// Crop stage definitions for different crops
const CROP_STAGES: Record<string, CropStageInfo[]> = {
  'Tomato': [
    {
      stage: 'seedling',
      name: 'Seedling Stage',
      nameMr: 'अंकुरण टप्पा',
      nameHi: 'अंकुरण चरण',
      duration: 15,
      description: 'Initial growth phase after germination. Focus on maintaining optimal temperature and moisture.',
      descriptionMr: 'अंकुरणानंतर प्रारंभिक वाढ टप्पा. इष्टतम तापमान आणि आर्द्रता राखण्यावर लक्ष केंद्रित करा.',
      descriptionHi: 'अंकुरण के बाद प्रारंभिक वृद्धि चरण। इष्टतम तापमान और नमी बनाए रखने पर ध्यान दें।',
      benefits: ['Strong root development', 'Healthy plant establishment'],
      benefitsMr: ['मजबूत मुळ विकास', 'निरोगी वनस्पती स्थापना'],
      benefitsHi: ['मजबूत जड़ विकास', 'स्वस्थ पौधा स्थापना'],
      icon: 'sprout',
      color: 'bg-emerald-100 text-emerald-700'
    },
    {
      stage: 'vegetative',
      name: 'Vegetative Stage',
      nameMr: 'वनस्पती टप्पा',
      nameHi: 'वानस्पतिक चरण',
      duration: 45,
      description: 'Rapid leaf and stem growth. Critical for nutrient management and pest control.',
      descriptionMr: 'पाने आणि खोड यांची वेगवान वाढ. पोषक व्यवस्थापन आणि कीटक नियंत्रणासाठी महत्त्वाचे.',
      descriptionHi: 'पत्तियों और तने की तीव्र वृद्धि। पोषक तत्व प्रबंधन और कीट नियंत्रण के लिए महत्वपूर्ण।',
      benefits: ['Maximum leaf area', 'Strong plant structure'],
      benefitsMr: ['जास्तीत जास्त पान क्षेत्र', 'मजबूत वनस्पती रचना'],
      benefitsHi: ['अधिकतम पत्ती क्षेत्र', 'मजबूत पौधा संरचना'],
      icon: 'leaf',
      color: 'bg-green-100 text-green-700'
    },
    {
      stage: 'flowering',
      name: 'Flowering Stage',
      nameMr: 'फुलांचा टप्पा',
      nameHi: 'फूल चरण',
      duration: 30,
      description: 'Flower formation and pollination. Ensure adequate water and avoid stress.',
      descriptionMr: 'फुलांची निर्मिती आणि परागकण. पुरेसे पाणी सुनिश्चित करा आणि तणाव टाळा.',
      descriptionHi: 'फूल निर्माण और परागण। पर्याप्त पानी सुनिश्चित करें और तनाव से बचें।',
      benefits: ['High fruit set', 'Better yield potential'],
      benefitsMr: ['उच्च फळ निर्धारण', 'चांगली उत्पादन क्षमता'],
      benefitsHi: ['उच्च फल निर्धारण', 'बेहतर उपज क्षमता'],
      icon: 'flower',
      color: 'bg-pink-100 text-pink-700'
    },
    {
      stage: 'fruiting',
      name: 'Fruiting Stage',
      nameMr: 'फळांचा टप्पा',
      nameHi: 'फलन चरण',
      duration: 60,
      description: 'Fruit development and maturation. Monitor for diseases and maintain consistent irrigation.',
      descriptionMr: 'फळ विकास आणि परिपक्वता. रोगांचे निरीक्षण करा आणि सातत्यपूर्ण सिंचन राखा.',
      descriptionHi: 'फल विकास और परिपक्वता। रोगों की निगरानी करें और निरंतर सिंचाई बनाए रखें।',
      benefits: ['Quality fruit development', 'Optimal harvest timing'],
      benefitsMr: ['गुणवत्तापूर्ण फळ विकास', 'इष्टतम कापणी वेळ'],
      benefitsHi: ['गुणवत्तापूर्ण फल विकास', 'इष्टतम कटाई समय'],
      icon: 'cherry',
      color: 'bg-red-100 text-red-700'
    },
    {
      stage: 'harvesting',
      name: 'Harvesting Stage',
      nameMr: 'कापणीचा टप्पा',
      nameHi: 'कटाई चरण',
      duration: 30,
      description: 'Optimal harvest window. Monitor market prices and weather for best timing.',
      descriptionMr: 'इष्टतम कापणी खिडकी. सर्वोत्तम वेळेसाठी बाजार भाव आणि हवामानाचे निरीक्षण करा.',
      descriptionHi: 'इष्टतम कटाई खिडकी। सर्वोत्तम समय के लिए बाजार मूल्य और मौसम की निगरानी करें।',
      benefits: ['Maximum yield', 'Best quality'],
      benefitsMr: ['जास्तीत जास्त उत्पादन', 'सर्वोत्तम गुणवत्ता'],
      benefitsHi: ['अधिकतम उपज', 'सर्वोत्तम गुणवत्ता'],
      icon: 'scissors',
      color: 'bg-amber-100 text-amber-700'
    }
  ],
  'Onion': [
    {
      stage: 'seedling',
      name: 'Seedling Stage',
      nameMr: 'अंकुरण टप्पा',
      nameHi: 'अंकुरण चरण',
      duration: 20,
      description: 'Bulb formation begins. Maintain consistent moisture.',
      descriptionMr: 'कंद निर्मिती सुरू होते. सातत्यपूर्ण आर्द्रता राखा.',
      descriptionHi: 'कंद निर्माण शुरू होता है। निरंतर नमी बनाए रखें।',
      benefits: ['Strong root system', 'Healthy establishment'],
      benefitsMr: ['मजबूत मुळ प्रणाली', 'निरोगी स्थापना'],
      benefitsHi: ['मजबूत जड़ प्रणाली', 'स्वस्थ स्थापना'],
      icon: 'sprout',
      color: 'bg-emerald-100 text-emerald-700'
    },
    {
      stage: 'vegetative',
      name: 'Vegetative Stage',
      nameMr: 'वनस्पती टप्पा',
      nameHi: 'वानस्पतिक चरण',
      duration: 60,
      description: 'Leaf growth and bulb development. Critical irrigation phase.',
      descriptionMr: 'पाने वाढ आणि कंद विकास. महत्त्वाचा सिंचन टप्पा.',
      descriptionHi: 'पत्ती वृद्धि और कंद विकास। महत्वपूर्ण सिंचाई चरण।',
      benefits: ['Bulb size development', 'Leaf health'],
      benefitsMr: ['कंद आकार विकास', 'पाने आरोग्य'],
      benefitsHi: ['कंद आकार विकास', 'पत्ती स्वास्थ्य'],
      icon: 'layers',
      color: 'bg-green-100 text-green-700'
    },
    {
      stage: 'harvesting',
      name: 'Harvesting Stage',
      nameMr: 'कापणीचा टप्पा',
      nameHi: 'कटाई चरण',
      duration: 15,
      description: 'Bulb maturity. Top fall indicates readiness.',
      descriptionMr: 'कंद परिपक्वता. शीर्ष पडणे तयारी दर्शवते.',
      descriptionHi: 'कंद परिपक्वता। शीर्ष गिरना तत्परता दर्शाता है।',
      benefits: ['Optimal bulb size', 'Good storage quality'],
      benefitsMr: ['इष्टतम कंद आकार', 'चांगली साठवण गुणवत्ता'],
      benefitsHi: ['इष्टतम कंद आकार', 'अच्छी भंडारण गुणवत्ता'],
      icon: 'scissors',
      color: 'bg-amber-100 text-amber-700'
    }
  ],
  'Grape': [
    {
      stage: 'seedling',
      name: 'Bud Break',
      nameMr: 'कलिका फुटणे',
      nameHi: 'कली फूटना',
      duration: 10,
      description: 'Initial bud break and shoot emergence.',
      descriptionMr: 'प्रारंभिक कलिका फुटणे आणि शूट उदय.',
      descriptionHi: 'प्रारंभिक कली फूटना और शूट उद्भव।',
      benefits: ['Uniform bud break', 'Healthy shoots'],
      benefitsMr: ['एकसमान कलिका फुटणे', 'निरोगी शूट'],
      benefitsHi: ['समान कली फूटना', 'स्वस्थ शूट'],
      icon: 'sprout',
      color: 'bg-emerald-100 text-emerald-700'
    },
    {
      stage: 'vegetative',
      name: 'Vegetative Growth',
      nameMr: 'वनस्पती वाढ',
      nameHi: 'वानस्पतिक वृद्धि',
      duration: 90,
      description: 'Vine growth, leaf development, and canopy management.',
      descriptionMr: 'वाइन वाढ, पाने विकास आणि छत व्यवस्थापन.',
      descriptionHi: 'बेल वृद्धि, पत्ती विकास और छतरी प्रबंधन।',
      benefits: ['Strong vine structure', 'Optimal canopy'],
      benefitsMr: ['मजबूत वाइन रचना', 'इष्टतम छत'],
      benefitsHi: ['मजबूत बेल संरचना', 'इष्टतम छतरी'],
      icon: 'leaf',
      color: 'bg-green-100 text-green-700'
    },
    {
      stage: 'flowering',
      name: 'Flowering',
      nameMr: 'फुलांचा टप्पा',
      nameHi: 'फूल चरण',
      duration: 15,
      description: 'Bloom and fruit set. Critical for yield.',
      descriptionMr: 'फुलणे आणि फळ निर्धारण. उत्पादनासाठी महत्त्वाचे.',
      descriptionHi: 'खिलना और फल निर्धारण। उपज के लिए महत्वपूर्ण।',
      benefits: ['Good fruit set', 'Yield potential'],
      benefitsMr: ['चांगले फळ निर्धारण', 'उत्पादन क्षमता'],
      benefitsHi: ['अच्छा फल निर्धारण', 'उपज क्षमता'],
      icon: 'flower',
      color: 'bg-pink-100 text-pink-700'
    },
    {
      stage: 'fruiting',
      name: 'Berry Development',
      nameMr: 'बेरी विकास',
      nameHi: 'बेरी विकास',
      duration: 90,
      description: 'Berry growth, veraison, and ripening.',
      descriptionMr: 'बेरी वाढ, वेराइसन आणि पिकणे.',
      descriptionHi: 'बेरी वृद्धि, वेराइसन और पकना।',
      benefits: ['Quality berries', 'Optimal sugar content'],
      benefitsMr: ['गुणवत्तापूर्ण बेरी', 'इष्टतम साखर सामग्री'],
      benefitsHi: ['गुणवत्तापूर्ण बेरी', 'इष्टतम चीनी सामग्री'],
      icon: 'grape',
      color: 'bg-purple-100 text-purple-700'
    },
    {
      stage: 'harvesting',
      name: 'Harvest',
      nameMr: 'कापणी',
      nameHi: 'कटाई',
      duration: 30,
      description: 'Harvest window. Monitor Brix levels.',
      descriptionMr: 'कापणी खिडकी. ब्रिक्स पातळीचे निरीक्षण करा.',
      descriptionHi: 'कटाई खिडकी। ब्रिक्स स्तर की निगरानी करें।',
      benefits: ['Optimal harvest timing', 'Export quality'],
      benefitsMr: ['इष्टतम कापणी वेळ', 'निर्यात गुणवत्ता'],
      benefitsHi: ['इष्टतम कटाई समय', 'निर्यात गुणवत्ता'],
      icon: 'scissors',
      color: 'bg-amber-100 text-amber-700'
    }
  ]
};

// Generate tasks for a crop stage
const generateTasksForStage = (
  cropType: string,
  cropVariety: string,
  stage: CropStageInfo,
  startDate: Date,
  weatherData?: any
): CalendarTask[] => {
  const tasks: CalendarTask[] = [];
  const baseTasks: Record<string, Record<CropStage, any[]>> = {
    'Tomato': {
      'seedling': [
        { type: 'irrigation', title: 'Light watering every 2-3 days', urgency: 'medium', day: 1 },
        { type: 'fertilizer', title: 'Apply starter fertilizer (NPK 19:19:19)', urgency: 'high', day: 5 },
        { type: 'pest_control', title: 'Monitor for damping off disease', urgency: 'high', day: 3 }
      ],
      'vegetative': [
        { type: 'irrigation', title: 'Regular irrigation - maintain soil moisture', urgency: 'high', day: 1 },
        { type: 'fertilizer', title: 'Apply nitrogen-rich fertilizer', urgency: 'high', day: 15 },
        { type: 'pruning', title: 'Remove suckers and lower leaves', urgency: 'medium', day: 20 },
        { type: 'pest_control', title: 'Spray for early blight prevention', urgency: 'high', day: 10 }
      ],
      'flowering': [
        { type: 'irrigation', title: 'Maintain consistent moisture - avoid stress', urgency: 'high', day: 1 },
        { type: 'fertilizer', title: 'Apply phosphorus and potassium', urgency: 'high', day: 10 },
        { type: 'pest_control', title: 'Monitor for flower thrips', urgency: 'medium', day: 5 }
      ],
      'fruiting': [
        { type: 'irrigation', title: 'Deep irrigation every 4-5 days', urgency: 'high', day: 1 },
        { type: 'fertilizer', title: 'Calcium application for fruit quality', urgency: 'high', day: 20 },
        { type: 'pest_control', title: 'Spray for fruit borer control', urgency: 'high', day: 15 },
        { type: 'harvest', title: 'Start harvesting mature fruits', urgency: 'medium', day: 45 }
      ],
      'harvesting': [
        { type: 'harvest', title: 'Daily harvesting of ripe fruits', urgency: 'high', day: 1 },
        { type: 'irrigation', title: 'Reduce irrigation frequency', urgency: 'medium', day: 5 }
      ]
    },
    'Onion': {
      'seedling': [
        { type: 'irrigation', title: 'Light frequent irrigation', urgency: 'high', day: 1 },
        { type: 'fertilizer', title: 'Apply basal dose of NPK', urgency: 'high', day: 5 }
      ],
      'vegetative': [
        { type: 'irrigation', title: 'Regular irrigation - critical phase', urgency: 'high', day: 1 },
        { type: 'fertilizer', title: 'Top dressing with nitrogen', urgency: 'high', day: 20 },
        { type: 'pest_control', title: 'Monitor for thrips and onion fly', urgency: 'high', day: 15 }
      ],
      'harvesting': [
        { type: 'irrigation', title: 'Stop irrigation 15 days before harvest', urgency: 'high', day: -15 },
        { type: 'harvest', title: 'Harvest when tops fall naturally', urgency: 'high', day: 0 }
      ]
    },
    'Grape': {
      'seedling': [
        { type: 'irrigation', title: 'Light irrigation to support bud break', urgency: 'medium', day: 1 }
      ],
      'vegetative': [
        { type: 'irrigation', title: 'Regular irrigation during growth', urgency: 'high', day: 1 },
        { type: 'pruning', title: 'Summer pruning and training', urgency: 'medium', day: 30 },
        { type: 'fertilizer', title: 'Apply balanced fertilizer', urgency: 'high', day: 20 },
        { type: 'pest_control', title: 'Spray for downy mildew prevention', urgency: 'high', day: 15 }
      ],
      'flowering': [
        { type: 'irrigation', title: 'Reduce irrigation slightly', urgency: 'medium', day: 1 },
        { type: 'pest_control', title: 'Protect flowers from pests', urgency: 'high', day: 5 }
      ],
      'fruiting': [
        { type: 'irrigation', title: 'Deep irrigation for berry development', urgency: 'high', day: 1 },
        { type: 'fertilizer', title: 'Potassium application for quality', urgency: 'high', day: 45 },
        { type: 'pest_control', title: 'Spray for powdery mildew', urgency: 'high', day: 30 },
        { type: 'pruning', title: 'Leaf removal for better air circulation', urgency: 'medium', day: 60 }
      ],
      'harvesting': [
        { type: 'harvest', title: 'Harvest at optimal Brix (18-22°)', urgency: 'high', day: 0 },
        { type: 'irrigation', title: 'Stop irrigation before harvest', urgency: 'high', day: -7 }
      ]
    }
  };

  const cropTasks = baseTasks[cropType]?.[stage.stage] || [];
  
  cropTasks.forEach((taskDef: any, idx: number) => {
    const taskDate = new Date(startDate);
    taskDate.setDate(startDate.getDate() + taskDef.day);
    
    // Adjust based on weather if weather-dependent
    let adjustedDate = taskDate;
    if (weatherData && taskDef.type === 'pest_control') {
      // Delay spraying if rain predicted
      const rainPredicted = weatherData.forecast7Day?.some((d: any) => 
        new Date(d.date) >= taskDate && new Date(d.date) <= new Date(taskDate.getTime() + 2 * 24 * 60 * 60 * 1000) && 
        (d.rainfall || 0) > 5
      );
      if (rainPredicted) {
        adjustedDate = new Date(taskDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      }
    }

    const task: CalendarTask = {
      id: `${cropType}_${stage.stage}_${idx}`,
      cropId: cropType,
      cropVariety,
      stage: stage.stage,
      taskType: taskDef.type as any,
      title: taskDef.title,
      titleMr: taskDef.title, // In production, add translations
      titleHi: taskDef.title,
      description: `Task for ${stage.name} stage`,
      descriptionMr: `${stage.nameMr} टप्प्यासाठी कार्य`,
      descriptionHi: `${stage.nameHi} चरण के लिए कार्य`,
      scheduledDate: adjustedDate.toISOString().split('T')[0],
      dueDate: new Date(adjustedDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      urgency: taskDef.urgency,
      isCompleted: false,
      recommendations: [
        `Complete this task during ${stage.name} stage`,
        'Monitor weather conditions before proceeding'
      ],
      recommendationsMr: [
        `${stage.nameMr} टप्प्यात हे कार्य पूर्ण करा`,
        'पुढे जाण्यापूर्वी हवामान परिस्थितीचे निरीक्षण करा'
      ],
      recommendationsHi: [
        `${stage.nameHi} चरण के दौरान इस कार्य को पूरा करें`,
        'आगे बढ़ने से पहले मौसम की स्थिति की निगरानी करें'
      ],
      weatherDependent: taskDef.type === 'pest_control' || taskDef.type === 'irrigation',
      weatherCondition: taskDef.type === 'pest_control' ? 'No rain for 24h, Wind speed < 15 km/h' : undefined,
      icon: taskDef.type === 'irrigation' ? 'droplet' : 
            taskDef.type === 'fertilizer' ? 'flask-conical' :
            taskDef.type === 'pest_control' ? 'shield-check' :
            taskDef.type === 'pruning' ? 'scissors' :
            taskDef.type === 'harvest' ? 'scissors' : 'check-circle',
      color: taskDef.type === 'irrigation' ? 'bg-blue-100 text-blue-700' :
             taskDef.type === 'fertilizer' ? 'bg-amber-100 text-amber-700' :
             taskDef.type === 'pest_control' ? 'bg-red-100 text-red-700' :
             taskDef.type === 'pruning' ? 'bg-purple-100 text-purple-700' :
             taskDef.type === 'harvest' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
    };
    tasks.push(task);
  });

  return tasks;
};

export const CropCalendarApi = {
  // Generate calendar for a crop
  generateCalendar: async (
    crop: Crop,
    sowingDate: string,
    weatherData?: any
  ): Promise<ApiResponse<CropCalendar>> => {
    try {
      const stages = CROP_STAGES[crop.cropType] || CROP_STAGES['Tomato'];
      const sowing = new Date(sowingDate);
      let currentDate = new Date(sowing);
      let currentStage: CropStage = 'seedling';
      let progress = 0;
      const allTasks: CalendarTask[] = [];

      stages.forEach((stage, idx) => {
        const stageStartDate = new Date(currentDate);
        const stageTasks = generateTasksForStage(
          crop.cropType,
          crop.variety,
          stage,
          stageStartDate,
          weatherData
        );
        allTasks.push(...stageTasks);
        
        currentDate = new Date(stageStartDate);
        currentDate.setDate(stageStartDate.getDate() + stage.duration);
        
        // Determine current stage
        const today = new Date();
        if (today >= stageStartDate && today <= currentDate) {
          currentStage = stage.stage;
          const daysInStage = Math.floor((today.getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24));
          progress = Math.min(100, Math.max(0, (daysInStage / stage.duration) * 100 + (idx * (100 / stages.length))));
        }
      });

      const expectedHarvestDate = new Date(sowing);
      const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);
      expectedHarvestDate.setDate(sowing.getDate() + totalDuration);

      const calendar: CropCalendar = {
        cropId: crop.cropId,
        cropType: crop.cropType,
        cropVariety: crop.variety,
        sowingDate,
        currentStage,
        stages,
        tasks: allTasks.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()),
        expectedHarvestDate: expectedHarvestDate.toISOString().split('T')[0],
        progress: Math.round(progress),
        lastUpdated: new Date().toISOString()
      };

      return { success: true, data: calendar };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to generate calendar' };
    }
  },

  // Update task completion
  updateTask: async (
    calendarId: string,
    taskId: string,
    updates: Partial<CalendarTask>
  ): Promise<ApiResponse<CalendarTask>> => {
    try {
      // In production, save to Supabase
      // For now, return mock success
      return {
        success: true,
        data: {
          id: taskId,
          cropId: '',
          cropVariety: '',
          stage: 'seedling',
          taskType: 'irrigation',
          title: '',
          description: '',
          scheduledDate: '',
          dueDate: '',
          urgency: 'medium',
          isCompleted: false,
          recommendations: [],
          weatherDependent: false,
          icon: 'check-circle',
          color: 'bg-slate-100',
          ...updates
        } as CalendarTask
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update task' };
    }
  }
};
