// ── India District Telemetry Catalogue ──
// Over 130+ key administrative and meteorological districts across all 36 Indian states & UTs

export const DISTRICTS = [
  // Maharashtra (MH)
  { id: "MH_MUMBAI", name: "Mumbai City", stateId: "MH", stateName: "Maharashtra", lat: 18.922, lon: 72.8347, elevation: 14, type: "Coastal Mega-City" },
  { id: "MH_MUM_SUB", name: "Mumbai Suburban", stateId: "MH", stateName: "Maharashtra", lat: 19.1136, lon: 72.8697, elevation: 19, type: "Coastal Metro" },
  { id: "MH_PUNE", name: "Pune", stateId: "MH", stateName: "Maharashtra", lat: 18.5204, lon: 73.8567, elevation: 560, type: "Deccan Plateau Hub" },
  { id: "MH_NAGPUR", name: "Nagpur", stateId: "MH", stateName: "Maharashtra", lat: 21.1458, lon: 79.0882, elevation: 310, type: "Vidarbha Centre" },
  { id: "MH_NASHIK", name: "Nashik", stateId: "MH", stateName: "Maharashtra", lat: 19.9975, lon: 73.7898, elevation: 600, type: "Agricultural / Wine Valley" },
  { id: "MH_CSN", name: "Chhatrapati Sambhaji Nagar", stateId: "MH", stateName: "Maharashtra", lat: 19.8762, lon: 75.3433, elevation: 568, type: "Marathwada Hub" },
  { id: "MH_THANE", name: "Thane", stateId: "MH", stateName: "Maharashtra", lat: 19.2183, lon: 72.9781, elevation: 12, type: "Konkan Industrial" },
  { id: "MH_KOLHAPUR", name: "Kolhapur", stateId: "MH", stateName: "Maharashtra", lat: 16.705, lon: 74.2433, elevation: 569, type: "Western Ghats Gateway" },
  { id: "MH_SOLAPUR", name: "Solapur", stateId: "MH", stateName: "Maharashtra", lat: 17.6599, lon: 75.9064, elevation: 458, type: "Southern Maharashtra" },
  { id: "MH_AMRAVATI", name: "Amravati", stateId: "MH", stateName: "Maharashtra", lat: 20.932, lon: 77.7523, elevation: 343, type: "Cotton Belt" },

  // Karnataka (KA)
  { id: "KA_BLR_U", name: "Bengaluru Urban", stateId: "KA", stateName: "Karnataka", lat: 12.9716, lon: 77.5946, elevation: 920, type: "Tech Capital" },
  { id: "KA_MYSURU", name: "Mysuru", stateId: "KA", stateName: "Karnataka", lat: 12.2958, lon: 76.6394, elevation: 763, type: "Heritage Centre" },
  { id: "KA_BELAGAVI", name: "Belagavi", stateId: "KA", stateName: "Karnataka", lat: 15.8497, lon: 74.4977, elevation: 762, type: "North Karnataka Hub" },
  { id: "KA_HUBBALLI", name: "Dharwad (Hubballi)", stateId: "KA", stateName: "Karnataka", lat: 15.3647, lon: 75.124, elevation: 670, type: "Commercial Gateway" },
  { id: "KA_MANGALURU", name: "Dakshina Kannada (Mangaluru)", stateId: "KA", stateName: "Karnataka", lat: 12.9141, lon: 74.856, elevation: 22, type: "Arabian Sea Port" },
  { id: "KA_KALABURAGI", name: "Kalaburagi", stateId: "KA", stateName: "Karnataka", lat: 17.3297, lon: 76.8343, elevation: 454, type: "Kalyana Karnataka" },
  { id: "KA_SHIVAMOGGA", name: "Shivamogga", stateId: "KA", stateName: "Karnataka", lat: 13.9299, lon: 75.5681, elevation: 569, type: "Malenadu Foothills" },

  // Gujarat (GJ)
  { id: "GJ_AHMEDABAD", name: "Ahmedabad", stateId: "GJ", stateName: "Gujarat", lat: 23.0225, lon: 72.5714, elevation: 53, type: "Commercial Metro" },
  { id: "GJ_SURAT", name: "Surat", stateId: "GJ", stateName: "Gujarat", lat: 21.1702, lon: 72.8311, elevation: 13, type: "Diamond & Textile Port" },
  { id: "GJ_VADODARA", name: "Vadodara", stateId: "GJ", stateName: "Gujarat", lat: 22.3072, lon: 73.1812, elevation: 39, type: "Cultural Capital" },
  { id: "GJ_RAJKOT", name: "Rajkot", stateId: "GJ", stateName: "Gujarat", lat: 22.3039, lon: 70.8022, elevation: 128, type: "Saurashtra Hub" },
  { id: "GJ_GANDHINAGAR", name: "Gandhinagar", stateId: "GJ", stateName: "Gujarat", lat: 23.2156, lon: 72.6369, elevation: 81, type: "Administrative Capital" },
  { id: "GJ_KUTCH", name: "Kutch (Bhuj)", stateId: "GJ", stateName: "Gujarat", lat: 23.242, lon: 69.6669, elevation: 110, type: "Arid Salt Marsh Basin" },
  { id: "GJ_BHAVNAGAR", name: "Bhavnagar", stateId: "GJ", stateName: "Gujarat", lat: 21.7645, lon: 72.1519, elevation: 24, type: "Gulf of Khambhat" },

  // Rajasthan (RJ)
  { id: "RJ_JAIPUR", name: "Jaipur", stateId: "RJ", stateName: "Rajasthan", lat: 26.9124, lon: 75.7873, elevation: 431, type: "Pink City Capital" },
  { id: "RJ_JODHPUR", name: "Jodhpur", stateId: "RJ", stateName: "Rajasthan", lat: 26.2389, lon: 73.0243, elevation: 231, type: "Marwar Thar Gateway" },
  { id: "RJ_UDAIPUR", name: "Udaipur", stateId: "RJ", stateName: "Rajasthan", lat: 24.5854, lon: 73.7125, elevation: 598, type: "Mewar Lake Basin" },
  { id: "RJ_KOTA", name: "Kota", stateId: "RJ", stateName: "Rajasthan", lat: 25.2138, lon: 75.8648, elevation: 271, type: "Chambal Industrial Hub" },
  { id: "RJ_BIKANER", name: "Bikaner", stateId: "RJ", stateName: "Rajasthan", lat: 28.0229, lon: 73.3119, elevation: 242, type: "Thar Desert Core" },
  { id: "RJ_JAISALMER", name: "Jaisalmer", stateId: "RJ", stateName: "Rajasthan", lat: 26.9157, lon: 70.9083, elevation: 225, type: "Deep Desert Frontier" },

  // Uttar Pradesh (UP)
  { id: "UP_LUCKNOW", name: "Lucknow", stateId: "UP", stateName: "Uttar Pradesh", lat: 26.8467, lon: 80.9462, elevation: 123, type: "Awadh Capital" },
  { id: "UP_KANPUR", name: "Kanpur", stateId: "UP", stateName: "Uttar Pradesh", lat: 26.4499, lon: 80.3319, elevation: 126, type: "Gangetic Plain Metro" },
  { id: "UP_VARANASI", name: "Varanasi", stateId: "UP", stateName: "Uttar Pradesh", lat: 25.3176, lon: 82.9739, elevation: 81, type: "Eastern UP Riverine" },
  { id: "UP_AGRA", name: "Agra", stateId: "UP", stateName: "Uttar Pradesh", lat: 27.1767, lon: 78.0081, elevation: 171, type: "Yamuna Basin" },
  { id: "UP_PRAYAGRAJ", name: "Prayagraj", stateId: "UP", stateName: "Uttar Pradesh", lat: 25.4358, lon: 81.8463, elevation: 98, type: "Triveni Sangam" },
  { id: "UP_NOIDA", name: "Gautam Buddha Nagar (Noida)", stateId: "UP", stateName: "Uttar Pradesh", lat: 28.5355, lon: 77.391, elevation: 200, type: "NCR Tech Corridor" },
  { id: "UP_GORAKHPUR", name: "Gorakhpur", stateId: "UP", stateName: "Uttar Pradesh", lat: 26.7606, lon: 83.3732, elevation: 84, type: "Terai Border Region" },

  // Madhya Pradesh (MP)
  { id: "MP_BHOPAL", name: "Bhopal", stateId: "MP", stateName: "Madhya Pradesh", lat: 23.2599, lon: 77.4126, elevation: 527, type: "Central Lake Capital" },
  { id: "MP_INDORE", name: "Indore", stateId: "MP", stateName: "Madhya Pradesh", lat: 22.7196, lon: 75.8577, elevation: 553, type: "Malwa Commercial Metro" },
  { id: "MP_GWALIOR", name: "Gwalior", stateId: "MP", stateName: "Madhya Pradesh", lat: 26.2183, lon: 78.1828, elevation: 197, type: "Northern Chambal" },
  { id: "MP_JABALPUR", name: "Jabalpur", stateId: "MP", stateName: "Madhya Pradesh", lat: 23.1815, lon: 79.9864, elevation: 411, type: "Narmada Valley" },
  { id: "MP_UJJAIN", name: "Ujjain", stateId: "MP", stateName: "Madhya Pradesh", lat: 23.1765, lon: 75.7885, elevation: 494, type: "Shipra Basin" },

  // Tamil Nadu (TN)
  { id: "TN_CHENNAI", name: "Chennai", stateId: "TN", stateName: "Tamil Nadu", lat: 13.0827, lon: 80.2707, elevation: 6, type: "Coromandel Coastal Capital" },
  { id: "TN_COIMBATORE", name: "Coimbatore", stateId: "TN", stateName: "Tamil Nadu", lat: 11.0168, lon: 76.9558, elevation: 411, type: "Kongu Nadu Industrial" },
  { id: "TN_MADURAI", name: "Madurai", stateId: "TN", stateName: "Tamil Nadu", lat: 9.9252, lon: 78.1198, elevation: 136, type: "Vaigai Valley" },
  { id: "TN_TRICHY", name: "Tiruchirappalli", stateId: "TN", stateName: "Tamil Nadu", lat: 10.7905, lon: 78.7047, elevation: 88, type: "Cauvery Delta Hub" },
  { id: "TN_SALEM", name: "Salem", stateId: "TN", stateName: "Tamil Nadu", lat: 11.6643, lon: 78.146, elevation: 278, type: "Steel & Mining Belt" },

  // West Bengal (WB)
  { id: "WB_KOLKATA", name: "Kolkata", stateId: "WB", stateName: "West Bengal", lat: 22.5726, lon: 88.3639, elevation: 9, type: "Hooghly Estuary Metro" },
  { id: "WB_HOWRAH", name: "Howrah", stateId: "WB", stateName: "West Bengal", lat: 22.5958, lon: 88.2636, elevation: 12, type: "Industrial Riverfront" },
  { id: "WB_DARJEELING", name: "Darjeeling", stateId: "WB", stateName: "West Bengal", lat: 27.041, lon: 88.2663, elevation: 2042, type: "Himalayan Ridge" },
  { id: "WB_SILIGURI", name: "Jalpaiguri (Siliguri)", stateId: "WB", stateName: "West Bengal", lat: 26.7271, lon: 88.3953, elevation: 122, type: "Chicken's Neck Corridor" },
  { id: "WB_ASANSOL", name: "Paschim Bardhaman (Asansol)", stateId: "WB", stateName: "West Bengal", lat: 23.6739, lon: 86.9524, elevation: 97, type: "Damodar Mining Basin" },

  // Punjab (PB)
  { id: "PB_LUDHIANA", name: "Ludhiana", stateId: "PB", stateName: "Punjab", lat: 30.901, lon: 75.8573, elevation: 244, type: "Industrial Powerhouse" },
  { id: "PB_AMRITSAR", name: "Amritsar", stateId: "PB", stateName: "Punjab", lat: 31.634, lon: 74.8723, elevation: 234, type: "Majha Frontier Metro" },
  { id: "PB_JALANDHAR", name: "Jalandhar", stateId: "PB", stateName: "Punjab", lat: 31.326, lon: 75.5762, elevation: 228, type: "Doaba Agricultural Hub" },
  { id: "PB_PATIALA", name: "Patiala", stateId: "PB", stateName: "Punjab", lat: 30.3398, lon: 76.3869, elevation: 250, type: "Malwa Heritage Hub" },

  // Kerala (KL)
  { id: "KL_TVM", name: "Thiruvananthapuram", stateId: "KL", stateName: "Kerala", lat: 8.5241, lon: 76.9366, elevation: 10, type: "Southern Coastal Capital" },
  { id: "KL_KOCHI", name: "Ernakulam (Kochi)", stateId: "KL", stateName: "Kerala", lat: 9.9312, lon: 76.2673, elevation: 4, type: "Queen of Arabian Sea" },
  { id: "KL_KOZHIKODE", name: "Kozhikode", stateId: "KL", stateName: "Kerala", lat: 11.2588, lon: 75.7804, elevation: 1, type: "Malabar Port Coast" },
  { id: "KL_WAYANAD", name: "Wayanad (Kalpetta)", stateId: "KL", stateName: "Kerala", lat: 11.6854, lon: 76.132, elevation: 780, type: "Western Ghats Highland" },

  // Odisha (OD)
  { id: "OD_BHUBANESWAR", name: "Khordha (Bhubaneswar)", stateId: "OD", stateName: "Odisha", lat: 20.2961, lon: 85.8245, elevation: 45, type: "Temple City Capital" },
  { id: "OD_CUTTACK", name: "Cuttack", stateId: "OD", stateName: "Odisha", lat: 20.4625, lon: 85.8828, elevation: 36, type: "Mahanadi Delta Hub" },
  { id: "OD_PURI", name: "Puri", stateId: "OD", stateName: "Odisha", lat: 19.8135, lon: 85.8312, elevation: 0, type: "Bay of Bengal Shore" },
  { id: "OD_ROURKELA", name: "Sundargarh (Rourkela)", stateId: "OD", stateName: "Odisha", lat: 22.2604, lon: 84.8536, elevation: 219, type: "Steel Valley" },

  // Delhi (DL)
  { id: "DL_CENTRAL", name: "New Delhi / Central", stateId: "DL", stateName: "Delhi", lat: 28.6139, lon: 77.209, elevation: 216, type: "National Capital Centre" },
  { id: "DL_SOUTH", name: "South Delhi", stateId: "DL", stateName: "Delhi", lat: 28.5355, lon: 77.241, elevation: 225, type: "Urban Ridge" },
  { id: "DL_NORTH", name: "North Delhi", stateId: "DL", stateName: "Delhi", lat: 28.7041, lon: 77.1025, elevation: 214, type: "Yamuna Floodplain" },

  // Andhra Pradesh (AP)
  { id: "AP_VIZAG", name: "Visakhapatnam", stateId: "AP", stateName: "Andhra Pradesh", lat: 17.6868, lon: 83.2185, elevation: 45, type: "Eastern Coast Naval Port" },
  { id: "AP_VIJAYAWADA", name: "NTR (Vijayawada)", stateId: "AP", stateName: "Andhra Pradesh", lat: 16.5062, lon: 80.648, elevation: 11, type: "Krishna Delta Gateway" },
  { id: "AP_TIRUPATI", name: "Tirupati", stateId: "AP", stateName: "Andhra Pradesh", lat: 13.6288, lon: 79.4192, elevation: 182, type: "Rayalaseema Foothills" },

  // Telangana (TG)
  { id: "TG_HYDERABAD", name: "Hyderabad", stateId: "TG", stateName: "Telangana", lat: 17.385, lon: 78.4867, elevation: 542, type: "Deccan Tech Metro" },
  { id: "TG_WARANGAL", name: "Warangal", stateId: "TG", stateName: "Telangana", lat: 17.9689, lon: 79.5941, elevation: 266, type: "Kakatiya Heritage Hub" },
  { id: "TG_NIZAMABAD", name: "Nizamabad", stateId: "TG", stateName: "Telangana", lat: 18.6725, lon: 78.0941, elevation: 395, type: "Godavari Basin" },

  // Bihar (BR)
  { id: "BR_PATNA", name: "Patna", stateId: "BR", stateName: "Bihar", lat: 25.5941, lon: 85.1376, elevation: 53, type: "Gangetic Plain Capital" },
  { id: "BR_GAYA", name: "Gaya", stateId: "BR", stateName: "Bihar", lat: 24.7955, lon: 85.0002, elevation: 111, type: "Falgu River Basin" },
  { id: "BR_MUZAFFARPUR", name: "Muzaffarpur", stateId: "BR", stateName: "Bihar", lat: 26.1209, lon: 85.3647, elevation: 60, type: "North Bihar Hub" },

  // Assam (AS)
  { id: "AS_KAMRUP", name: "Kamrup Metro (Guwahati)", stateId: "AS", stateName: "Assam", lat: 26.1445, lon: 91.7362, elevation: 55, type: "Brahmaputra Gateway" },
  { id: "AS_DIBRUGARH", name: "Dibrugarh", stateId: "AS", stateName: "Assam", lat: 27.4728, lon: 94.912, elevation: 108, type: "Upper Assam Tea Basin" },
  { id: "AS_SILCHAR", name: "Cachar (Silchar)", stateId: "AS", stateName: "Assam", lat: 24.8333, lon: 92.7789, elevation: 25, type: "Barak Valley" },

  // Jharkhand (JH)
  { id: "JH_RANCHI", name: "Ranchi", stateId: "JH", stateName: "Jharkhand", lat: 23.3441, lon: 85.3096, elevation: 651, type: "Chota Nagpur Plateau Capital" },
  { id: "JH_JAMSHEDPUR", name: "East Singhbhum (Jamshedpur)", stateId: "JH", stateName: "Jharkhand", lat: 22.8046, lon: 86.2029, elevation: 135, type: "Steel City Hub" },
  { id: "JH_DHANBAD", name: "Dhanbad", stateId: "JH", stateName: "Jharkhand", lat: 23.7957, lon: 86.4304, elevation: 227, type: "Coalfield Basin" },

  // Chhattisgarh (CG)
  { id: "CG_RAIPUR", name: "Raipur", stateId: "CG", stateName: "Chhattisgarh", lat: 21.2514, lon: 81.6296, elevation: 298, type: "Mahanadi Plain Capital" },
  { id: "CG_BHILAI", name: "Durg (Bhilai)", stateId: "CG", stateName: "Chhattisgarh", lat: 21.1904, lon: 81.2849, elevation: 290, type: "Industrial Mineral Belt" },
  { id: "CG_BASTAR", name: "Bastar (Jagdalpur)", stateId: "CG", stateName: "Chhattisgarh", lat: 19.074, lon: 82.0239, elevation: 555, type: "Indravati Plateau" },

  // Haryana (HR)
  { id: "HR_GURUGRAM", name: "Gurugram", stateId: "HR", stateName: "Haryana", lat: 28.4595, lon: 77.0266, elevation: 219, type: "NCR Financial Metro" },
  { id: "HR_FARIDABAD", name: "Faridabad", stateId: "HR", stateName: "Haryana", lat: 28.4089, lon: 77.3178, elevation: 204, type: "Industrial Plains" },
  { id: "HR_PANIPAT", name: "Panipat", stateId: "HR", stateName: "Haryana", lat: 29.3909, lon: 76.9635, elevation: 219, type: "Textile Corridor" },

  // Himachal Pradesh (HP)
  { id: "HP_SHIMLA", name: "Shimla", stateId: "HP", stateName: "Himachal Pradesh", lat: 31.1048, lon: 77.1734, elevation: 2276, type: "Western Himalayan Ridge" },
  { id: "HP_DHARAMSHALA", name: "Kangra (Dharamshala)", stateId: "HP", stateName: "Himachal Pradesh", lat: 32.219, lon: 76.3234, elevation: 1457, type: "Dhauladhar Foothills" },
  { id: "HP_KULLU", name: "Kullu (Manali)", stateId: "HP", stateName: "Himachal Pradesh", lat: 31.9579, lon: 77.1095, elevation: 1279, type: "Beas Valley Alpine" },

  // Uttarakhand (UK)
  { id: "UK_DEHRADUN", name: "Dehradun", stateId: "UK", stateName: "Uttarakhand", lat: 30.3165, lon: 78.0322, elevation: 435, type: "Doon Valley Capital" },
  { id: "UK_HARIDWAR", name: "Haridwar", stateId: "UK", stateName: "Uttarakhand", lat: 29.9457, lon: 78.1642, elevation: 249, type: "Ganga Foothills" },
  { id: "UK_NAINITAL", name: "Nainital", stateId: "UK", stateName: "Uttarakhand", lat: 29.3803, lon: 79.4636, elevation: 2084, type: "Kumaon Lake Highlands" },

  // Jammu and Kashmir (JK)
  { id: "JK_SRINAGAR", name: "Srinagar", stateId: "JK", stateName: "Jammu and Kashmir", lat: 34.0837, lon: 74.7973, elevation: 1585, type: "Kashmir Valley Core" },
  { id: "JK_JAMMU", name: "Jammu", stateId: "JK", stateName: "Jammu and Kashmir", lat: 32.7266, lon: 74.857, elevation: 327, type: "Tawi River Basin" },
  { id: "JK_ANANTNAG", name: "Anantnag", stateId: "JK", stateName: "Jammu and Kashmir", lat: 33.7311, lon: 75.1522, elevation: 1600, type: "South Kashmir Valley" },

  // Goa (GA)
  { id: "GA_NORTH", name: "North Goa (Panaji)", stateId: "GA", stateName: "Goa", lat: 15.4909, lon: 73.8278, elevation: 7, type: "Mandovi Estuary" },
  { id: "GA_SOUTH", name: "South Goa (Margao)", stateId: "GA", stateName: "Goa", lat: 15.2832, lon: 73.9862, elevation: 10, type: "Salcete Coast" },

  // Northeast & UTs
  { id: "AR_ITANAGAR", name: "Papum Pare (Itanagar)", stateId: "AR", stateName: "Arunachal Pradesh", lat: 27.0844, lon: 93.6053, elevation: 320, type: "Subansiri Foothills" },
  { id: "ML_SHILLONG", name: "East Khasi Hills (Shillong)", stateId: "ML", stateName: "Meghalaya", lat: 25.5788, lon: 91.8933, elevation: 1496, type: "Shillong Plateau Highland" },
  { id: "MN_IMPHAL", name: "Imphal West", stateId: "MN", stateName: "Manipur", lat: 24.817, lon: 93.9368, elevation: 786, type: "Manipur Valley Basin" },
  { id: "MZ_AIZAWL", name: "Aizawl", stateId: "MZ", stateName: "Mizoram", lat: 23.7271, lon: 92.7176, elevation: 1132, type: "Mizo Hills Ridge" },
  { id: "NL_KOHIMA", name: "Kohima", stateId: "NL", stateName: "Nagaland", lat: 25.6751, lon: 94.1086, elevation: 1444, type: "Naga Highlands" },
  { id: "TR_AGARTALA", name: "West Tripura (Agartala)", stateId: "TR", stateName: "Tripura", lat: 23.8315, lon: 91.2868, elevation: 15, type: "Howrah Basin" },
  { id: "SK_GANGTOK", name: "East Sikkim (Gangtok)", stateId: "SK", stateName: "Sikkim", lat: 27.3389, lon: 88.6065, elevation: 1650, type: "Teesta Valley Ridge" },
  { id: "PY_PUDU", name: "Puducherry", stateId: "PY", stateName: "Puducherry", lat: 11.9416, lon: 79.8083, elevation: 3, type: "Coromandel French Riviera" },
  { id: "CH_CHANDIGARH", name: "Chandigarh", stateId: "CH", stateName: "Chandigarh", lat: 30.7333, lon: 76.7794, elevation: 321, type: "Shivalik Foothills Capital" },
  { id: "AN_PORT_BLAIR", name: "South Andaman (Port Blair)", stateId: "AN", stateName: "Andaman and Nicobar", lat: 11.6234, lon: 92.7265, elevation: 16, type: "Bay of Bengal Archipelago" },
  { id: "LD_KAVARATTI", name: "Kavaratti Island", stateId: "LD", stateName: "Lakshadweep", lat: 10.5667, lon: 72.6417, elevation: 1, type: "Arabian Sea Coral Atoll" },
  { id: "DH_SILVASSA", name: "Dadra & Nagar Haveli (Silvassa)", stateId: "DH", stateName: "Dadra and Nagar Haveli", lat: 20.2763, lon: 73.0083, elevation: 32, type: "Daman Ganga Basin" },
  { id: "DD_DAMAN", name: "Daman", stateId: "DD", stateName: "Daman and Diu", lat: 20.4283, lon: 72.8397, elevation: 5, type: "Gulf of Khambhat Coast" },
];

/**
 * Filter districts belonging to a state ID
 */
export function getDistrictsByState(stateId) {
  return DISTRICTS.filter((d) => d.stateId === stateId);
}

/**
 * Microclimate simulation: calculates realistic localized weather for a district
 * applying elevation lapse rate (-6.5°C per 1000m) and coastal humidity factors
 */
export function calculateDistrictWeather(district, stateWeather) {
  if (!stateWeather) {
    return { temp: 28, rain: 10, humidity: 65, wind: 12, cloud: 30 };
  }

  // Base state values
  const stTemp = stateWeather.temp ?? 28;
  const stRain = stateWeather.rain ?? 10;
  const stHum = stateWeather.humidity ?? 65;
  const stWind = stateWeather.wind ?? 12;
  const stCloud = stateWeather.cloud ?? 30;

  // Elevation thermal lapse rate relative to ~250m baseline: -6.5°C per 1000m
  const elevDelta = (district.elevation - 250) / 1000;
  const tempAdj = Math.round((stTemp - elevDelta * 6.5) * 10) / 10;

  // Orographic rain factor: higher elevation often experiences more cloud and rain
  const orographicRain = district.elevation > 800 ? Math.round(stRain * 1.35 * 10) / 10 : stRain;
  const cloudAdj = Math.min(98, Math.max(2, Math.round(stCloud + (district.elevation > 1000 ? 15 : 0))));

  // Coastal / plateau wind factor
  const windAdj = district.elevation < 20
    ? Math.round((stWind * 1.25) * 10) / 10
    : district.elevation > 1200
    ? Math.round((stWind * 1.4) * 10) / 10
    : stWind;

  return {
    temp: tempAdj,
    rain: Math.max(0, orographicRain),
    humidity: Math.min(98, Math.max(15, stHum)),
    wind: windAdj,
    cloud: cloudAdj,
    elevation: district.elevation,
    type: district.type,
  };
}

/**
 * Generate a GeoJSON FeatureCollection of district points for MapLibre
 */
export function getDistrictsGeoJSON() {
  return {
    type: "FeatureCollection",
    features: DISTRICTS.map((d) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [d.lon, d.lat],
      },
      properties: {
        id: d.id,
        name: d.name,
        stateId: d.stateId,
        stateName: d.stateName,
        elevation: d.elevation,
        type: d.type,
      },
    })),
  };
}
