export interface CityNode {
  name: string;
  lat: number;
  lng: number;
}

export interface LgaEntry {
  name: string;
  lat: number;
  lng: number;
  cities: string[];
}

export interface StateEntry {
  name: string;
  capital: string;
  zone: string;
  lat: number;
  lng: number;
  lgas: LgaEntry[];
}

/**
 * Comprehensive Nigerian States & Local Government Areas directory.
 * All 33 LGAs of Oyo State (pilot region) include accurate coordinates and towns/cities;
 * all 36 States + FCT Abuja include their official LGAs and capital/major towns.
 */
export const NIGERIA_LOCATIONS: StateEntry[] = [
  {
    name: 'Oyo State',
    capital: 'Ibadan',
    zone: 'South West',
    lat: 7.3775,
    lng: 3.947,
    lgas: [
      { name: 'Afijio', lat: 7.752, lng: 3.924, cities: ['Jobele', 'Ilora', 'Fiditi', 'Awe', 'Iware'] },
      { name: 'Akinyele', lat: 7.5308, lng: 3.9125, cities: ['Moniya', 'Akinyele', 'Ojoo', 'Ijaye', 'Iroko', 'Ikereku'] },
      { name: 'Atiba', lat: 7.855, lng: 3.938, cities: ['Ofa Meta', 'Oyo', 'Aafin', 'Akeetan', 'Agunpopo'] },
      { name: 'Atisbo', lat: 8.567, lng: 3.45, cities: ['Tede', 'Ago-Are', 'Ofiki', 'Irawo', 'Basi'] },
      { name: 'Egbeda', lat: 7.379, lng: 4.049, cities: ['Egbeda', 'Olodo', 'Alakia', 'Erunmu', 'Ayede'] },
      { name: 'Ibadan North', lat: 7.422, lng: 3.904, cities: ['Agodi', 'Bodija', 'Samonda', 'Mokola', 'Sango'] },
      { name: 'Ibadan North-East', lat: 7.397, lng: 3.936, cities: ['Iwo Road', 'Agugu', 'Basorun', 'Oje'] },
      { name: 'Ibadan North-West', lat: 7.392, lng: 3.876, cities: ['Onireke', 'Dugbe', 'Eleyele', 'Adamasingba'] },
      { name: 'Ibadan South-East', lat: 7.358, lng: 3.908, cities: ['Mapo', 'Molete', 'Felele', 'Odinjo'] },
      { name: 'Ibadan South-West', lat: 7.362, lng: 3.858, cities: ['Ring Road', 'Oluyole', 'Challenge', 'Apata'] },
      { name: 'Ibarapa Central', lat: 7.436, lng: 3.285, cities: ['Igbo-Ora', 'Idere'] },
      { name: 'Ibarapa East', lat: 7.542, lng: 3.42, cities: ['Eruwa', 'Lanlate'] },
      { name: 'Ibarapa North', lat: 7.721, lng: 3.22, cities: ['Ayete', 'Tapa', 'Igangan'] },
      { name: 'Ido', lat: 7.469, lng: 3.758, cities: ['Ido', 'Omi-Adio', 'Akufo', 'Apete', 'Bakatari'] },
      { name: 'Irepo', lat: 9.083, lng: 3.85, cities: ['Kisi', 'Igboho Road', 'Adagbangba'] },
      { name: 'Iseyin', lat: 7.971, lng: 3.592, cities: ['Iseyin', 'Ado-Awaye', 'Osoogun', 'Ekehun'] },
      { name: 'Itesiwaju', lat: 8.215, lng: 3.55, cities: ['Otu', 'Okaka', 'Komu', 'Baba Ode', 'Ipapo'] },
      { name: 'Iwajowa', lat: 7.983, lng: 3.067, cities: ['Iwere-Ile', 'Iganna', 'Idiko-Ile', 'Ilaji'] },
      { name: 'Kajola', lat: 8.033, lng: 3.35, cities: ['Okeho', 'Ilero', 'Ilua', 'Ayegun', 'Imia'] },
      { name: 'Lagelu', lat: 7.485, lng: 4.045, cities: ['Iyana-Offa', 'Lalupon', 'Ejioku', 'Oyedeji'] },
      { name: 'Ogbomoso North', lat: 8.141, lng: 4.245, cities: ['Kinnira', 'Sabo', 'Takie', 'Ogbomoso'] },
      { name: 'Ogbomoso South', lat: 8.112, lng: 4.238, cities: ['Arowomole', 'Akata', 'Ijeru', 'Oke-Ola'] },
      { name: 'Ogo Oluwa', lat: 7.943, lng: 4.132, cities: ['Ajaawa', 'Odo-Oba', 'Pontela', 'Iwo-Ate'] },
      { name: 'Olorunsogo', lat: 8.833, lng: 3.767, cities: ['Igbeti', 'Aba-Ilorin', 'Agbele'] },
      { name: 'Oluyole', lat: 7.258, lng: 3.872, cities: ['Idi-Ayunre', 'Podo', 'Orita Challenge', 'Olomi'] },
      { name: 'Ona Ara', lat: 7.326, lng: 4.022, cities: ['Akanran', 'Gbedun', 'Amuloko', 'Olorunsogo'] },
      { name: 'Oorelope', lat: 8.833, lng: 3.75, cities: ['Igboho', 'Sooro', 'Bonni'] },
      { name: 'Ori Ire', lat: 8.316, lng: 4.135, cities: ['Ikoyi-Ile', 'Oolo', 'Tewure', 'Iluju'] },
      { name: 'Oyo East', lat: 7.8526, lng: 3.948, cities: ['Kosobo', 'Oyo', 'Owode', 'Apaara', 'Jabata'] },
      { name: 'Oyo West', lat: 7.841, lng: 3.912, cities: ['Ojongbodu', 'Iseke', 'Fasola', 'Opapa'] },
      { name: 'Saki East', lat: 8.675, lng: 3.633, cities: ['Ago-Amodu', 'Sepeteri', 'Ogbooro', 'Oje-Owode'] },
      { name: 'Saki West', lat: 8.667, lng: 3.393, cities: ['Saki', 'Ekokan', 'Wasangare', 'Sango'] },
      { name: 'Surulere', lat: 8.052, lng: 4.355, cities: ['Iresa-Adu', 'Iregba', 'Oko', 'Gambari'] },
    ],
  },
  {
    name: 'Abia State',
    capital: 'Umuahia',
    zone: 'South East',
    lat: 5.525,
    lng: 7.492,
    lgas: makeSimpleLgas(5.525, 7.492, [
      'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South',
      'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West',
      'Umuahia North', 'Umuahia South', 'Umu Nneochi',
    ]),
  },
  {
    name: 'Adamawa State',
    capital: 'Yola',
    zone: 'North East',
    lat: 9.203,
    lng: 12.495,
    lgas: makeSimpleLgas(9.203, 12.495, [
      'Demsa', 'Fufore', 'Ganye', 'Gayuk', 'Gombi', 'Grie', 'Hong', 'Jada', 'Lamurde', 'Madagali',
      'Maiha', 'Mayo Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song',
      'Toungo', 'Yola North', 'Yola South',
    ]),
  },
  {
    name: 'Akwa Ibom State',
    capital: 'Uyo',
    zone: 'South South',
    lat: 5.037,
    lng: 7.912,
    lgas: makeSimpleLgas(5.037, 7.912, [
      'Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno',
      'Ibesikpo Asutan', 'Ibiono-Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu',
      'Mbo', 'Mkpat-Enin', 'Nsit-Atai', 'Nsit-Ibom', 'Nsit-Ubium', 'Obot Akara', 'Okobo', 'Onna',
      'Oron', 'Oruk Anam', 'Udung-Uko', 'Ukanafun', 'Uruan', 'Urue-Offong/Oruko', 'Uyo',
    ]),
  },
  {
    name: 'Anambra State',
    capital: 'Awka',
    zone: 'South East',
    lat: 6.21,
    lng: 7.074,
    lgas: makeSimpleLgas(6.21, 7.074, [
      'Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum',
      'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North',
      'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi',
    ]),
  },
  {
    name: 'Bauchi State',
    capital: 'Bauchi',
    zone: 'North East',
    lat: 10.315,
    lng: 9.844,
    lgas: makeSimpleLgas(10.315, 9.844, [
      'Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Gamawa', 'Ganjuwa', 'Giade',
      'Itas/Gadau', 'Jamaare', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa',
      'Toro', 'Warji', 'Zaki',
    ]),
  },
  {
    name: 'Bayelsa State',
    capital: 'Yenagoa',
    zone: 'South South',
    lat: 4.926,
    lng: 6.267,
    lgas: makeSimpleLgas(4.926, 6.267, [
      'Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa',
    ]),
  },
  {
    name: 'Benue State',
    capital: 'Makurdi',
    zone: 'North Central',
    lat: 7.733,
    lng: 8.521,
    lgas: makeSimpleLgas(7.733, 8.521, [
      'Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala',
      'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu',
      'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya',
    ]),
  },
  {
    name: 'Borno State',
    capital: 'Maiduguri',
    zone: 'North East',
    lat: 11.831,
    lng: 13.151,
    lgas: makeSimpleLgas(11.831, 13.151, [
      'Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala',
      'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala/Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa',
      'Magumeri', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani',
    ]),
  },
  {
    name: 'Cross River State',
    capital: 'Calabar',
    zone: 'South South',
    lat: 4.975,
    lng: 8.341,
    lgas: makeSimpleLgas(4.975, 8.341, [
      'Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal',
      'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja',
      'Yakuur', 'Yala',
    ]),
  },
  {
    name: 'Delta State',
    capital: 'Asaba',
    zone: 'South South',
    lat: 6.198,
    lng: 6.731,
    lgas: makeSimpleLgas(6.198, 6.731, [
      'Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North East',
      'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North',
      'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Uvwie',
      'Warri North', 'Warri South', 'Warri South West',
    ]),
  },
  {
    name: 'Ebonyi State',
    capital: 'Abakaliki',
    zone: 'South East',
    lat: 6.324,
    lng: 8.113,
    lgas: makeSimpleLgas(6.324, 8.113, [
      'Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo',
      'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha',
    ]),
  },
  {
    name: 'Edo State',
    capital: 'Benin City',
    zone: 'South South',
    lat: 6.335,
    lng: 5.603,
    lgas: makeSimpleLgas(6.335, 5.603, [
      'Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West',
      'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba Okha', 'Orhionmwon', 'Oredo',
      'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Uhunmwonde',
    ]),
  },
  {
    name: 'Ekiti State',
    capital: 'Ado-Ekiti',
    zone: 'South West',
    lat: 7.621,
    lng: 5.221,
    lgas: makeSimpleLgas(7.621, 5.221, [
      'Ado Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure', 'Gbonyin',
      'Ido Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun/Ifelodun', 'Ise/Orun', 'Moba', 'Oye',
    ]),
  },
  {
    name: 'Enugu State',
    capital: 'Enugu',
    zone: 'South East',
    lat: 6.458,
    lng: 7.546,
    lgas: makeSimpleLgas(6.458, 7.546, [
      'Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Etiti',
      'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka',
      'Oji River', 'Udenu', 'Udi', 'Uzo-Uwani',
    ]),
  },
  {
    name: 'FCT Abuja',
    capital: 'Abuja',
    zone: 'North Central',
    lat: 9.0765,
    lng: 7.3986,
    lgas: makeSimpleLgas(9.0765, 7.3986, [
      'Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Abuja Municipal (AMAC)',
    ]),
  },
  {
    name: 'Gombe State',
    capital: 'Gombe',
    zone: 'North East',
    lat: 10.289,
    lng: 11.167,
    lgas: makeSimpleLgas(10.289, 11.167, [
      'Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada',
      'Shongom', 'Yamaltu/Deba',
    ]),
  },
  {
    name: 'Imo State',
    capital: 'Owerri',
    zone: 'South East',
    lat: 5.485,
    lng: 7.035,
    lgas: makeSimpleLgas(5.485, 7.035, [
      'Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South',
      'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre',
      'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema', 'Okigwe', 'Orlu', 'Orsu', 'Oru East', 'Oru West',
      'Owerri Municipal', 'Owerri North', 'Owerri West', 'Onuimo',
    ]),
  },
  {
    name: 'Jigawa State',
    capital: 'Dutse',
    zone: 'North West',
    lat: 11.759,
    lng: 9.338,
    lgas: makeSimpleLgas(11.759, 9.338, [
      'Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel',
      'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kazaure', 'Kiri Kasama',
      'Kiyawa', 'Kaugama', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar',
      'Taura', 'Yankwashi',
    ]),
  },
  {
    name: 'Kaduna State',
    capital: 'Kaduna',
    zone: 'North West',
    lat: 10.51,
    lng: 7.416,
    lgas: makeSimpleLgas(10.51, 7.416, [
      'Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jemaa', 'Kachia', 'Kaduna North',
      'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi',
      'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria',
    ]),
  },
  {
    name: 'Kano State',
    capital: 'Kano',
    zone: 'North West',
    lat: 12.002,
    lng: 8.592,
    lgas: makeSimpleLgas(12.002, 8.592, [
      'Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu',
      'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa',
      'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi',
      'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono',
      'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil',
    ]),
  },
  {
    name: 'Katsina State',
    capital: 'Katsina',
    zone: 'North West',
    lat: 12.989,
    lng: 7.6,
    lgas: makeSimpleLgas(12.989, 7.6, [
      'Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume', 'Danja', 'Dan Musa',
      'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara',
      'Kankia', 'Katsina', 'Kurfi', 'Kusada', 'MaiAdua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu',
      'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango',
    ]),
  },
  {
    name: 'Kebbi State',
    capital: 'Birnin Kebbi',
    zone: 'North West',
    lat: 12.453,
    lng: 4.197,
    lgas: makeSimpleLgas(12.453, 4.197, [
      'Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Fakai',
      'Gwandu', 'Jega', 'Kalgo', 'Koko/Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru',
      'Wasagu/Danko', 'Yauri', 'Zuru',
    ]),
  },
  {
    name: 'Kogi State',
    capital: 'Lokoja',
    zone: 'North Central',
    lat: 7.802,
    lng: 6.733,
    lgas: makeSimpleLgas(7.802, 6.733, [
      'Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela Odolu', 'Ijumu',
      'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa Muro', 'Ofu', 'Ogori/Magongo', 'Okehi', 'Okene', 'Olamaboro',
      'Omala', 'Yagba East', 'Yagba West',
    ]),
  },
  {
    name: 'Kwara State',
    capital: 'Ilorin',
    zone: 'North Central',
    lat: 8.496,
    lng: 4.542,
    lgas: makeSimpleLgas(8.496, 4.542, [
      'Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West',
      'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Pategi',
    ]),
  },
  {
    name: 'Lagos State',
    capital: 'Ikeja',
    zone: 'South West',
    lat: 6.5244,
    lng: 3.3792,
    lgas: makeSimpleLgas(6.5244, 3.3792, [
      'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti Osa',
      'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland',
      'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere',
    ]),
  },
  {
    name: 'Nasarawa State',
    capital: 'Lafia',
    zone: 'North Central',
    lat: 8.491,
    lng: 8.515,
    lgas: makeSimpleLgas(8.491, 8.515, [
      'Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa',
      'Nasarawa Egon', 'Obi', 'Toto', 'Wamba',
    ]),
  },
  {
    name: 'Niger State',
    capital: 'Minna',
    zone: 'North Central',
    lat: 9.615,
    lng: 6.547,
    lgas: makeSimpleLgas(9.615, 6.547, [
      'Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha',
      'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Moya', 'Paikoro',
      'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi',
    ]),
  },
  {
    name: 'Ogun State',
    capital: 'Abeokuta',
    zone: 'South West',
    lat: 7.1475,
    lng: 3.3619,
    lgas: makeSimpleLgas(7.1475, 3.3619, [
      'Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South', 'Ewekoro',
      'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Imeko Afon',
      'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Shagamu',
    ]),
  },
  {
    name: 'Ondo State',
    capital: 'Akure',
    zone: 'South West',
    lat: 7.2571,
    lng: 5.2058,
    lgas: makeSimpleLgas(7.2571, 5.2058, [
      'Akoko North-East', 'Akoko North-West', 'Akoko South-East', 'Akoko South-West', 'Akure North',
      'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje', 'Ile Oluji/Okeigbo', 'Irele', 'Odigbo',
      'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo',
    ]),
  },
  {
    name: 'Osun State',
    capital: 'Osogbo',
    zone: 'South West',
    lat: 7.7827,
    lng: 4.5418,
    lgas: makeSimpleLgas(7.7827, 4.5418, [
      'Atakunmosa East', 'Atakunmosa West', 'Aiyedaade', 'Aiyedire', 'Boluwaduro', 'Boripe',
      'Ede North', 'Ede South', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Egbedore',
      'Ejigbo', 'Ifedayo', 'Ifelodun', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole',
      'Isokan', 'Iwo', 'Obokun', 'Odo Otin', 'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo',
    ]),
  },
  {
    name: 'Plateau State',
    capital: 'Jos',
    zone: 'North Central',
    lat: 9.8965,
    lng: 8.8583,
    lgas: makeSimpleLgas(9.8965, 8.8583, [
      'Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kanke',
      'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', 'QuaAn Pan', 'Riyom',
      'Shendam', 'Wase',
    ]),
  },
  {
    name: 'Rivers State',
    capital: 'Port Harcourt',
    zone: 'South South',
    lat: 4.8156,
    lng: 7.0498,
    lgas: makeSimpleLgas(4.8156, 7.0498, [
      'Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru', 'Bonny',
      'Degema', 'Eleme', 'Emuoha', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio/Akpor',
      'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai',
    ]),
  },
  {
    name: 'Sokoto State',
    capital: 'Sokoto',
    zone: 'North West',
    lat: 13.0059,
    lng: 5.2476,
    lgas: makeSimpleLgas(13.0059, 5.2476, [
      'Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela', 'Isa',
      'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South',
      'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo',
    ]),
  },
  {
    name: 'Taraba State',
    capital: 'Jalingo',
    zone: 'North East',
    lat: 8.8937,
    lng: 11.3596,
    lgas: makeSimpleLgas(8.8937, 11.3596, [
      'Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karim Lamido', 'Kumi',
      'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing',
    ]),
  },
  {
    name: 'Yobe State',
    capital: 'Damaturu',
    zone: 'North East',
    lat: 11.747,
    lng: 11.9608,
    lgas: makeSimpleLgas(11.747, 11.9608, [
      'Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko',
      'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari',
    ]),
  },
  {
    name: 'Zamfara State',
    capital: 'Gusau',
    zone: 'North West',
    lat: 12.1628,
    lng: 6.6745,
    lgas: makeSimpleLgas(12.1628, 6.6745, [
      'Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi', 'Gusau', 'Kaura Namoda',
      'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Chafe', 'Zurmi',
    ]),
  },
];

function makeSimpleLgas(baseLat: number, baseLng: number, names: string[]): LgaEntry[] {
  return names.map((name, idx) => {
    const angle = (idx / Math.max(names.length, 1)) * Math.PI * 2;
    const radius = 0.08;
    return {
      name,
      lat: Number((baseLat + Math.sin(angle) * radius).toFixed(4)),
      lng: Number((baseLng + Math.cos(angle) * radius).toFixed(4)),
      cities: [name],
    };
  });
}

function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function matchStateName(raw: string | undefined): StateEntry | undefined {
  if (!raw) return undefined;
  const clean = stripDiacritics(raw).toLowerCase().replace(/\s*state\s*/g, '').trim();
  return NIGERIA_LOCATIONS.find((s) => {
    const target = stripDiacritics(s.name).toLowerCase().replace(/\s*state\s*/g, '').trim();
    return target === clean || clean.includes(target) || target.includes(clean);
  });
}

function matchLgaName(stateEntry: StateEntry, raw: string | undefined): LgaEntry | undefined {
  if (!raw) return undefined;
  const clean = stripDiacritics(raw)
    .toLowerCase()
    .replace(/\b(lga|local government|local government area|municipal)\b/g, '')
    .trim();
  return stateEntry.lgas.find((l) => {
    const t = stripDiacritics(l.name).toLowerCase();
    return t === clean || clean.includes(t) || t.includes(clean);
  });
}

function findNearestLgaInState(stateEntry: StateEntry, lat: number, lng: number): LgaEntry {
  let nearest = stateEntry.lgas[0];
  let minDistance = Infinity;
  for (const lga of stateEntry.lgas) {
    const d = haversineDistanceKm(lat, lng, lga.lat, lga.lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = lga;
    }
  }
  return nearest;
}

export interface ReverseGeocodeResult {
  state: string;
  lga: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  displayName: string;
  source: 'nominatim-osm' | 'nigeria-spatial-index';
}

export async function reverseGeocodeCoordinates(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  // 1. Try OpenStreetMap Nominatim reverse geocoding
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AgroLens-NASA-SpaceApps-2026/1.0 (hello@agrolens.ng)',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = (await res.json()) as {
        display_name?: string;
        address?: {
          state?: string;
          county?: string;
          state_district?: string;
          municipality?: string;
          city?: string;
          town?: string;
          village?: string;
          suburb?: string;
          country?: string;
        };
      };
      const addr = json.address || {};
      const matchedState = matchStateName(addr.state);
      const rawLga = addr.county || addr.municipality || addr.state_district;
      const rawCity = addr.city || addr.town || addr.village || addr.suburb;

      let matchedLga = matchedState ? matchLgaName(matchedState, rawLga) : undefined;
      if (matchedState && !matchedLga && rawCity) {
        const cleanCity = stripDiacritics(rawCity).toLowerCase().trim();
        matchedLga =
          matchLgaName(matchedState, rawCity) ||
          matchedState.lgas.find((l) =>
            l.cities.some((c) => stripDiacritics(c).toLowerCase() === cleanCity)
          );
      }
      if (matchedState && !matchedLga) {
        matchedLga = findNearestLgaInState(matchedState, lat, lng);
      }

      const detectedCity =
        rawCity ||
        matchedLga?.cities[0] ||
        matchedState?.capital ||
        'Local Area';

      if (matchedState) {
        return {
          state: matchedState.name,
          lga: matchedLga?.name || rawLga || matchedState.lgas[0].name,
          city: detectedCity,
          country: addr.country || 'Nigeria',
          latitude: lat,
          longitude: lng,
          displayName: json.display_name || `${detectedCity}, ${matchedLga?.name || matchedState.name}`,
          source: 'nominatim-osm',
        };
      }

      if (addr.state || addr.city || addr.town) {
        return {
          state: addr.state || 'Oyo State',
          lga: rawLga || addr.city || 'Local Area',
          city: detectedCity,
          country: addr.country || 'Nigeria',
          latitude: lat,
          longitude: lng,
          displayName: json.display_name || `${detectedCity}, ${addr.state || ''}`,
          source: 'nominatim-osm',
        };
      }
    }
  } catch {
    // Fall through to deterministic Nigeria spatial index
  }

  // 2. Deterministic nearest-LGA spatial index fallback
  let nearestState = NIGERIA_LOCATIONS[0];
  let nearestLga = nearestState.lgas[0];
  let minDistance = Infinity;

  for (const st of NIGERIA_LOCATIONS) {
    for (const lga of st.lgas) {
      const dist = haversineDistanceKm(lat, lng, lga.lat, lga.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestState = st;
        nearestLga = lga;
      }
    }
  }

  return {
    state: nearestState.name,
    lga: nearestLga.name,
    city: nearestLga.cities[0] || nearestState.capital,
    country: 'Nigeria',
    latitude: lat,
    longitude: lng,
    displayName: `${nearestLga.cities[0] || nearestLga.name}, ${nearestLga.name}, ${nearestState.name}`,
    source: 'nigeria-spatial-index',
  };
}

export async function forwardGeocodePlace(query: string): Promise<{
  state: string;
  lga: string;
  city: string;
  latitude: number;
  longitude: number;
  source: string;
} | null> {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // Check local Nigeria LGA & city index first for instant accurate match
  for (const st of NIGERIA_LOCATIONS) {
    for (const lga of st.lgas) {
      const cityMatch = lga.cities.find((c) => c.toLowerCase() === q || c.toLowerCase().includes(q));
      if (lga.name.toLowerCase() === q || cityMatch) {
        return {
          state: st.name,
          lga: lga.name,
          city: cityMatch || lga.cities[0] || lga.name,
          latitude: lga.lat,
          longitude: lga.lng,
          source: 'nigeria-spatial-index',
        };
      }
    }
  }

  // Try OpenStreetMap Nominatim search scoped to Nigeria
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
      `${query}, Nigeria`
    )}&addressdetails=1&limit=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AgroLens-NASA-SpaceApps-2026/1.0 (hello@agrolens.ng)',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const results = (await res.json()) as Array<{
        lat: string;
        lon: string;
        address?: {
          state?: string;
          county?: string;
          municipality?: string;
          city?: string;
          town?: string;
          village?: string;
        };
      }>;
      if (results[0]) {
        const hit = results[0];
        const lat = Number(hit.lat);
        const lng = Number(hit.lon);
        const rev = await reverseGeocodeCoordinates(lat, lng);
        return {
          state: rev.state,
          lga: rev.lga,
          city: hit.address?.city || hit.address?.town || hit.address?.village || rev.city,
          latitude: Number(lat.toFixed(5)),
          longitude: Number(lng.toFixed(5)),
          source: 'nominatim-osm',
        };
      }
    }
  } catch {
    // Ignore network error
  }

  return null;
}
