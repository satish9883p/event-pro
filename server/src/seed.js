import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Event from './models/Event.js';
import FunctionHall from './models/FunctionHall.js';
import Location from './models/Location.js';
import Booking from './models/Booking.js';
import Registration from './models/Registration.js';
import Chat from './models/Chat.js';
import Venue from './models/Venue.js';
import VenueBooking from './models/VenueBooking.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// ─── All 36 States & Union Territories of India ────────────────────────────
const INDIA_LOCATIONS = [
  // STATES
  {
    state: 'Andhra Pradesh',
    districts: [
      { district: 'Krishna', areas: ['Vijayawada', 'Machilipatnam', 'Gudivada', 'Benz Circle', 'Poranki'] },
      { district: 'Guntur', areas: ['Guntur City', 'Tenali', 'Narasaraopet', 'Mangalagiri', 'Tadepalli'] },
      { district: 'Visakhapatnam', areas: ['Gajuwaka', 'Rushikonda', 'MVP Colony', 'Steel Plant', 'Vizianagaram Road'] },
      { district: 'East Godavari', areas: ['Rajahmundry', 'Kakinada', 'Amalapuram', 'Samalkot', 'Pithapuram'] },
      { district: 'West Godavari', areas: ['Eluru', 'Bhimavaram', 'Tanuku', 'Palakol', 'Tadepalligudem'] },
      { district: 'Nellore', areas: ['Nellore City', 'Kavali', 'Gudur', 'Atmakur', 'Kovur'] },
      { district: 'Kurnool', areas: ['Kurnool City', 'Adoni', 'Nandyal', 'Dhone', 'Yemmiganur'] },
      { district: 'Kadapa', areas: ['Kadapa City', 'Proddatur', 'Badvel', 'Pulivendula', 'Rajampet'] },
      { district: 'Chittoor', areas: ['Tirupati', 'Chittoor City', 'Madanapalle', 'Srikalahasti', 'Puttur'] },
      { district: 'Srikakulam', areas: ['Srikakulam City', 'Narasannapeta', 'Palasa', 'Rajam', 'Etcherla'] },
    ],
  },
  {
    state: 'Telangana',
    districts: [
      { district: 'Hyderabad', areas: ['Hitec City', 'Banjara Hills', 'Jubilee Hills', 'Ameerpet', 'Madhapur', 'Kondapur', 'Gachibowli', 'Begumpet'] },
      { district: 'Rangareddy', areas: ['Shamshabad', 'Rajendranagar', 'Hayathnagar', 'Ibrahimpatnam', 'LB Nagar'] },
      { district: 'Medchal-Malkajgiri', areas: ['Kompally', 'Secunderabad', 'Malkajgiri', 'Alwal', 'Quthbullapur'] },
      { district: 'Warangal', areas: ['Warangal City', 'Hanamkonda', 'Kazipet', 'Narsampet', 'Parkal'] },
      { district: 'Nizamabad', areas: ['Nizamabad City', 'Bodhan', 'Armoor', 'Yellareddy', 'Kamareddy'] },
      { district: 'Karimnagar', areas: ['Karimnagar City', 'Ramagundam', 'Peddapalli', 'Mancherial', 'Jagtial'] },
      { district: 'Khammam', areas: ['Khammam City', 'Kothagudem', 'Yellandu', 'Sattupalli', 'Wyra'] },
      { district: 'Nalgonda', areas: ['Nalgonda City', 'Miryalaguda', 'Suryapet', 'Bhongir', 'Nagarjunasagar'] },
      { district: 'Mahbubnagar', areas: ['Mahbubnagar City', 'Jadcherla', 'Narayanpet', 'Wanaparthy', 'Gadwal'] },
    ],
  },
  {
    state: 'Tamil Nadu',
    districts: [
      { district: 'Chennai', areas: ['T. Nagar', 'Anna Nagar', 'Adyar', 'Mylapore', 'Velachery', 'Nungambakkam', 'Perambur', 'Egmore'] },
      { district: 'Coimbatore', areas: ['Coimbatore City', 'Ganapathy', 'Peelamedu', 'Saibaba Colony', 'Hopes College'] },
      { district: 'Madurai', areas: ['Madurai City', 'Anna Nagar Madurai', 'Tallakulam', 'Pasumalai', 'Goripalayam'] },
      { district: 'Tiruchirappalli', areas: ['Trichy City', 'Cantonment', 'Srirangam', 'Ariyamangalam', 'Thuvakudi'] },
      { district: 'Salem', areas: ['Salem City', 'Fairlands', 'Suramangalam', 'Kondalampatti', 'Attur'] },
      { district: 'Tirunelveli', areas: ['Tirunelveli City', 'Palayamkottai', 'Ambasamudram', 'Tenkasi', 'Cheranmahadevi'] },
      { district: 'Vellore', areas: ['Vellore City', 'Katpadi', 'Gudiyatham', 'Tirupathur', 'Ambur'] },
      { district: 'Erode', areas: ['Erode City', 'Bhavani', 'Gobichettipalayam', 'Perundurai', 'Sathyamangalam'] },
    ],
  },
  {
    state: 'Karnataka',
    districts: [
      { district: 'Bengaluru Urban', areas: ['Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar', 'HSR Layout', 'Electronic City', 'Marathahalli', 'Rajajinagar'] },
      { district: 'Mysuru', areas: ['Mysuru City', 'Vijayanagar', 'Kuvempunagar', 'Nazarbad', 'Hebbal Mysuru'] },
      { district: 'Hubballi-Dharwad', areas: ['Hubballi City', 'Dharwad', 'Unkal', 'Vidyanagar', 'Gokul Road'] },
      { district: 'Mangaluru', areas: ['Mangaluru City', 'Kadri', 'Kankanady', 'Bejai', 'Attavar'] },
      { district: 'Belagavi', areas: ['Belagavi City', 'Tilakwadi', 'Hindwadi', 'Kakati', 'Gokak'] },
      { district: 'Kalaburagi', areas: ['Kalaburagi City', 'Aland', 'Afzalpur', 'Chincholi', 'Jewargi'] },
      { district: 'Ballari', areas: ['Ballari City', 'Hospet', 'Sandur', 'Siruguppa', 'Kampli'] },
      { district: 'Shivamogga', areas: ['Shivamogga City', 'Sagara', 'Bhadravati', 'Hosanagar', 'Sagar'] },
    ],
  },
  {
    state: 'Maharashtra',
    districts: [
      { district: 'Mumbai City', areas: ['Bandra West', 'Andheri West', 'Powai', 'Lower Parel', 'Worli', 'Dadar', 'Fort'] },
      { district: 'Mumbai Suburban', areas: ['Borivali', 'Malad', 'Kandivali', 'Goregaon', 'Vile Parle', 'Santacruz', 'Kurla'] },
      { district: 'Pune', areas: ['Koregaon Park', 'Hadapsar', 'Kharadi', 'Viman Nagar', 'Wakad', 'Aundh', 'Hinjewadi'] },
      { district: 'Thane', areas: ['Thane City', 'Navi Mumbai', 'Airoli', 'Vashi', 'Kharghar', 'Panvel', 'Belapur'] },
      { district: 'Nashik', areas: ['Nashik City', 'Nashik Road', 'Gangapur Road', 'Dwarka', 'Satpur'] },
      { district: 'Nagpur', areas: ['Nagpur City', 'Dharampeth', 'Sitabuldi', 'Sadar', 'Civil Lines', 'Wardha Road'] },
      { district: 'Aurangabad', areas: ['Aurangabad City', 'CIDCO', 'Garkheda', 'Beed Bypass', 'Waluj'] },
      { district: 'Kolhapur', areas: ['Kolhapur City', 'Shahupuri', 'Shivaji Park', 'Kalamba', 'Kasba Bawada'] },
    ],
  },
  {
    state: 'Uttar Pradesh',
    districts: [
      { district: 'Lucknow', areas: ['Gomti Nagar', 'Hazratganj', 'Vikas Nagar', 'Alambagh', 'Aliganj', 'Indira Nagar', 'Mahanagar'] },
      { district: 'Agra', areas: ['Tajganj', 'Kamla Nagar', 'Civil Lines Agra', 'Raja Mandi', 'Shahganj'] },
      { district: 'Varanasi', areas: ['Sigra', 'Lanka', 'BHU Area', 'Assi', 'Sonarpura'] },
      { district: 'Kanpur Nagar', areas: ['Swaroop Nagar', 'Civil Lines Kanpur', 'Kidwai Nagar', 'Govind Nagar', 'Panki'] },
      { district: 'Prayagraj', areas: ['Civil Lines Prayagraj', 'Allenganj', 'George Town', 'Luker Ganj', 'Naini'] },
      { district: 'Ghaziabad', areas: ['Indirapuram', 'Vaishali', 'Crossing Republik', 'Raj Nagar Extension', 'Mohan Nagar'] },
      { district: 'Noida', areas: ['Sector 18', 'Sector 62', 'Sector 137', 'Greater Noida West', 'Sector 63'] },
      { district: 'Meerut', areas: ['Meerut City', 'Shastri Nagar', 'Brahampuri', 'Pallavpuram', 'Modipuram'] },
    ],
  },
  {
    state: 'Rajasthan',
    districts: [
      { district: 'Jaipur', areas: ['C-Scheme', 'Vaishali Nagar', 'Mansarovar', 'Malviya Nagar', 'Civil Lines Jaipur', 'Tonk Road', 'Ajmer Road'] },
      { district: 'Jodhpur', areas: ['Shastri Nagar', 'Sardarpura', 'Paota', 'Ratanada', 'Basni'] },
      { district: 'Udaipur', areas: ['Udaipur City', 'Hiran Magri', 'Bhuwana', 'Sevashram', 'Ambamata'] },
      { district: 'Kota', areas: ['Kota City', 'Vigyan Nagar', 'Talwandi', 'Aerodrome Circle', 'Dadabari'] },
      { district: 'Bikaner', areas: ['Bikaner City', 'Sadul Ganj', 'Ganga Shahar', 'Rani Bazar', 'Lalgarh'] },
      { district: 'Ajmer', areas: ['Ajmer City', 'Vaishali Nagar Ajmer', 'Adarsh Nagar', 'Civil Lines Ajmer', 'Nasirabad'] },
    ],
  },
  {
    state: 'Madhya Pradesh',
    districts: [
      { district: 'Bhopal', areas: ['Kolar Road', 'Arera Colony', 'TT Nagar', 'Shahpura', 'Hoshangabad Road', 'MP Nagar'] },
      { district: 'Indore', areas: ['Vijay Nagar', 'Palasia', 'Rau', 'Nipania', 'Bhawarkuan', 'Rajwada Area'] },
      { district: 'Gwalior', areas: ['Lashkar', 'Thatipur', 'Morar', 'City Centre', 'Hazira'] },
      { district: 'Jabalpur', areas: ['Civil Lines Jabalpur', 'Adhartal', 'Napier Town', 'Gorakhpur Jabalpur', 'Vijay Nagar Jabalpur'] },
      { district: 'Ujjain', areas: ['Ujjain City', 'Freeganj', 'Mahakal Area', 'Nanakheda', 'Dewas Road'] },
    ],
  },
  {
    state: 'Gujarat',
    districts: [
      { district: 'Ahmedabad', areas: ['Navrangpura', 'CG Road', 'Satellite', 'Prahlad Nagar', 'SG Highway', 'Vastrapur', 'Bodakdev'] },
      { district: 'Surat', areas: ['Adajan', 'Vesu', 'Pal', 'Athwa', 'Udhna', 'Katargam', 'Ring Road Surat'] },
      { district: 'Vadodara', areas: ['Alkapuri', 'Fatehganj', 'Subhanpura', 'Gotri', 'Waghodia Road'] },
      { district: 'Rajkot', areas: ['Rajkot City', 'Kalawad Road', 'Gondal Road', '150 Feet Ring Road', 'Aji Dam Road'] },
      { district: 'Bhavnagar', areas: ['Bhavnagar City', 'Kalanala', 'Waghawadi Road', 'Sardarnagar Bhavnagar', 'Kumbharwada'] },
      { district: 'Gandhinagar', areas: ['Sector 11', 'Sector 21', 'Sector 30', 'Infocity', 'Kudasan'] },
    ],
  },
  {
    state: 'West Bengal',
    districts: [
      { district: 'Kolkata', areas: ['Park Street', 'Salt Lake', 'New Town', 'Behala', 'Tollygunge', 'Alipore', 'Ballygunge', 'Rajarhat'] },
      { district: 'North 24 Parganas', areas: ['Barasat', 'Barrackpore', 'Belghoria', 'Madhyamgram', 'Birati'] },
      { district: 'South 24 Parganas', areas: ['Budge Budge', 'Sonarpur', 'Rajpur', 'Garia', 'Narendrapur'] },
      { district: 'Howrah', areas: ['Howrah City', 'Shibpur', 'Liluah', 'Bally', 'Domjur'] },
      { district: 'Hooghly', areas: ['Chinsurah', 'Chandannagar', 'Serampore', 'Rishra', 'Uttarpara'] },
      { district: 'Darjeeling', areas: ['Darjeeling Town', 'Siliguri', 'Kurseong', 'Kalimpong', 'Mirik'] },
    ],
  },
  {
    state: 'Bihar',
    districts: [
      { district: 'Patna', areas: ['Boring Road', 'Bailey Road', 'Kankarbagh', 'Rajendra Nagar', 'Ashiana Nagar', 'Exhibition Road'] },
      { district: 'Gaya', areas: ['Gaya City', 'Bodh Gaya', 'Sherghati', 'Tikari', 'Wazirganj'] },
      { district: 'Muzaffarpur', areas: ['Muzaffarpur City', 'Motijheel', 'Brahmpura', 'Mithanpura', 'Ahiyapur'] },
      { district: 'Bhagalpur', areas: ['Bhagalpur City', 'Tatarpur', 'Adampur', 'Champanagar', 'Sabour'] },
    ],
  },
  {
    state: 'Punjab',
    districts: [
      { district: 'Ludhiana', areas: ['Model Town Ludhiana', 'Civil Lines Ludhiana', 'Sarabha Nagar', 'BRS Nagar', 'Dugri'] },
      { district: 'Amritsar', areas: ['Ranjit Avenue', 'Lawrence Road', 'Green Avenue', 'Raja Garden', 'Mall Road Amritsar'] },
      { district: 'Jalandhar', areas: ['Model Town Jalandhar', 'Civil Lines Jalandhar', 'Guru Nanak Colony', 'Saini Mohalla', 'New Jawahar Nagar'] },
      { district: 'Patiala', areas: ['Patiala City', 'Model Town Patiala', 'Urban Estate', 'Leela Bhavan', 'Tripuri'] },
      { district: 'Mohali', areas: ['Phase 5', 'Phase 7', 'Phase 9', 'Sector 68', 'Sector 70', 'Aerocity Mohali'] },
    ],
  },
  {
    state: 'Haryana',
    districts: [
      { district: 'Gurugram', areas: ['DLF Phase 1', 'DLF Phase 4', 'Sohna Road', 'Golf Course Road', 'Sector 14', 'Sector 56'] },
      { district: 'Faridabad', areas: ['Sector 15 Faridabad', 'Sector 21C', 'NIT', 'Greater Faridabad', 'Old Faridabad'] },
      { district: 'Hisar', areas: ['Hisar City', 'Urban Estate Hisar', 'Model Town Hisar', 'Rajgarh Colony', 'Defence Colony Hisar'] },
      { district: 'Rohtak', areas: ['Civil Lines Rohtak', 'Subhash Nagar', 'Model Town Rohtak', 'Shastri Nagar Rohtak', 'Delhi Road Rohtak'] },
    ],
  },
  {
    state: 'Kerala',
    districts: [
      { district: 'Thiruvananthapuram', areas: ['Kowdiar', 'Pattom', 'Technopark', 'Kazhakoottam', 'Vattiyoorkavu', 'Museum Road'] },
      { district: 'Kochi', areas: ['Kakkanad', 'Panampilly Nagar', 'Infopark', 'Marine Drive', 'Edapally', 'Aluva', 'Vytilla'] },
      { district: 'Kozhikode', areas: ['Kozhikode City', 'Calicut Beach', 'Chevayur', 'Nadakkavu', 'Ulliyeri'] },
      { district: 'Thrissur', areas: ['Thrissur City', 'Ollur', 'Punkunnam', 'Thissur Round', 'Guruvayur Road'] },
      { district: 'Kollam', areas: ['Kollam City', 'Kadappakada', 'Kundara', 'Paravur', 'Kottiyam'] },
      { district: 'Kannur', areas: ['Kannur City', 'Thaliparamba', 'Thalassery', 'Mattannur', 'Iritty'] },
    ],
  },
  {
    state: 'Odisha',
    districts: [
      { district: 'Khordha', areas: ['Bhubaneswar City', 'Unit 1', 'Unit 4', 'Patia', 'Chandrasekharpur', 'Khandagiri'] },
      { district: 'Cuttack', areas: ['Cuttack City', 'CDA', 'Buxi Bazar', 'Link Road', 'Dolamundai'] },
      { district: 'Ganjam', areas: ['Berhampur', 'Brahmapur', 'Chhatrapur', 'Hinjilicut', 'Kabisuryanagar'] },
    ],
  },
  {
    state: 'Jharkhand',
    districts: [
      { district: 'Ranchi', areas: ['Ashok Nagar Ranchi', 'Harmu', 'Doranda', 'Lalpur', 'Kantatoli'] },
      { district: 'Dhanbad', areas: ['Dhanbad City', 'Jharia', 'Sindri', 'Katras', 'Govindpur'] },
      { district: 'Jamshedpur', areas: ['Sakchi', 'Bistupur', 'Telco', 'Mango', 'Adityapur'] },
    ],
  },
  {
    state: 'Assam',
    districts: [
      { district: 'Kamrup Metropolitan', areas: ['Guwahati City', 'Dispur', 'Paltan Bazaar', 'Pan Bazar', 'Bhangagarh', 'Ambari'] },
      { district: 'Dibrugarh', areas: ['Dibrugarh City', 'Doomdooma', 'Tinsukia', 'Digboi', 'Namrup'] },
      { district: 'Jorhat', areas: ['Jorhat City', 'Cinnamara', 'Teok', 'Mariani', 'Titabor'] },
    ],
  },
  {
    state: 'Chhattisgarh',
    districts: [
      { district: 'Raipur', areas: ['Shankar Nagar', 'Civil Lines Raipur', 'Pandri', 'VIP Road Raipur', 'Devendra Nagar'] },
      { district: 'Durg', areas: ['Bhilai Steel City', 'Supela', 'Nehru Nagar Bhilai', 'Durg City', 'Risali'] },
    ],
  },
  {
    state: 'Uttarakhand',
    districts: [
      { district: 'Dehradun', areas: ['Rajpur Road', 'Indira Nagar Dehradun', 'Clement Town', 'Rispana', 'Karanpur'] },
      { district: 'Haridwar', areas: ['Haridwar City', 'Roorkee', 'Jwalapur', 'Kankhal', 'Manglaur'] },
      { district: 'Nainital', areas: ['Haldwani', 'Ramnagar', 'Bhimtal', 'Nainital City', 'Lalkua'] },
    ],
  },
  {
    state: 'Himachal Pradesh',
    districts: [
      { district: 'Shimla', areas: ['Shimla City', 'Chotta Shimla', 'New Shimla', 'Rampur', 'Rohru'] },
      { district: 'Kangra', areas: ['Dharamshala', 'Palampur', 'Nurpur', 'Mcleodganj', 'Baijnath'] },
    ],
  },
  {
    state: 'Goa',
    districts: [
      { district: 'North Goa', areas: ['Panaji', 'Mapusa', 'Calangute', 'Candolim', 'Baga', 'Anjuna', 'Vagator', 'Arpora'] },
      { district: 'South Goa', areas: ['Margao', 'Vasco da Gama', 'Ponda', 'Cortalim', 'Curchorem'] },
    ],
  },
  {
    state: 'Manipur',
    districts: [
      { district: 'Imphal West', areas: ['Imphal City', 'Lamphel', 'Kwakeithel', 'Uripok', 'Sagolband'] },
      { district: 'Imphal East', areas: ['Porompat', 'Keisampat', 'Patsoi', 'Thangmeiband', 'Lilong'] },
    ],
  },
  {
    state: 'Meghalaya',
    districts: [
      { district: 'East Khasi Hills', areas: ['Shillong City', 'Laitumkhrah', 'Mawlai', 'Rynjah', 'Jhalupara'] },
      { district: 'West Garo Hills', areas: ['Tura City', 'Phulbari', 'Rongara', 'Betasing', 'Dalu'] },
    ],
  },
  {
    state: 'Tripura',
    districts: [
      { district: 'West Tripura', areas: ['Agartala City', 'Battala', 'Motor Stand', 'Akhaura Road', 'Airport Road Agartala'] },
    ],
  },
  {
    state: 'Mizoram',
    districts: [
      { district: 'Aizawl', areas: ['Aizawl City', 'Zonuam', 'Bawngkawn', 'Ramhlun', 'Kulikawn'] },
    ],
  },
  {
    state: 'Nagaland',
    districts: [
      { district: 'Kohima', areas: ['Kohima City', 'Naga Bazaar', 'PR Hill', 'Midland', 'Kensington'] },
      { district: 'Dimapur', areas: ['Dimapur City', 'Sovima', 'Purana Bazar', 'New Market Dimapur', 'Duncan Basti'] },
    ],
  },
  {
    state: 'Arunachal Pradesh',
    districts: [
      { district: 'Papum Pare', areas: ['Itanagar', 'Naharlagun', 'Nirjuli', 'Banderdewa', 'Chimpu'] },
    ],
  },
  {
    state: 'Sikkim',
    districts: [
      { district: 'East Sikkim', areas: ['Gangtok City', 'MG Marg', 'Tadong', 'Ranipool', 'Namchi'] },
    ],
  },
  // UNION TERRITORIES
  {
    state: 'Delhi',
    districts: [
      { district: 'New Delhi', areas: ['Connaught Place', 'Lajpat Nagar', 'Defence Colony', 'Greater Kailash', 'Khan Market', 'Hauz Khas'] },
      { district: 'South Delhi', areas: ['Saket', 'Vasant Kunj', 'Malviya Nagar', 'Mehrauli', 'Chhatarpur'] },
      { district: 'North Delhi', areas: ['Model Town Delhi', 'Rohini', 'Pitampura', 'Ashok Vihar', 'Shalimar Bagh'] },
      { district: 'West Delhi', areas: ['Janakpuri', 'Rajouri Garden', 'Paschim Vihar', 'Uttam Nagar', 'Vikaspuri'] },
      { district: 'East Delhi', areas: ['Preet Vihar', 'Mayur Vihar', 'Patparganj', 'Laxmi Nagar', 'Krishna Nagar'] },
    ],
  },
  {
    state: 'Jammu & Kashmir',
    districts: [
      { district: 'Srinagar', areas: ['Lal Chowk', 'Hazratbal', 'Rajbagh', 'Jawahar Nagar', 'Hyderpora'] },
      { district: 'Jammu', areas: ['Jammu City', 'Gandhi Nagar Jammu', 'Trikuta Nagar', 'Bakshi Nagar', 'Bathindi'] },
    ],
  },
  {
    state: 'Ladakh',
    districts: [
      { district: 'Leh', areas: ['Leh Town', 'Main Bazaar', 'Changspa', 'Sheynam', 'Choglumsar'] },
    ],
  },
  {
    state: 'Chandigarh',
    districts: [
      { district: 'Chandigarh', areas: ['Sector 17', 'Sector 22', 'Sector 35', 'Industrial Area Phase 1', 'Sector 9'] },
    ],
  },
  {
    state: 'Puducherry',
    districts: [
      { district: 'Puducherry', areas: ['White Town', 'Lawspet', 'Oulgaret', 'Ariyankuppam', 'Villianur'] },
    ],
  },
  {
    state: 'Andaman and Nicobar Islands',
    districts: [
      { district: 'South Andaman', areas: ['Port Blair', 'Aberdeen Bazaar', 'Chatham', 'Bambooflat', 'Prothrapur'] },
    ],
  },
  {
    state: 'Lakshadweep',
    districts: [
      { district: 'Lakshadweep', areas: ['Kavaratti', 'Agatti', 'Andretti', 'Kalpeni'] },
    ],
  },
  {
    state: 'Dadra and Nagar Haveli and Daman and Diu',
    districts: [
      { district: 'Daman', areas: ['Daman City', 'Somnath', 'Moti Daman', 'Nani Daman'] },
      { district: 'Dadra & Nagar Haveli', areas: ['Silvassa', 'Naroli', 'Khanvel', 'Sayli'] },
    ],
  },
];

// ─── Budget-tiered Function Halls for Key Cities ───────────────────────────
const HALLS_DATA = [
  // ──────────────────────────────────────────────────────────────────────────
  // ── 1. Andhra Pradesh – Krishna (Vijayawada, Benz Circle, Poranki, Machilipatnam)
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Grand Celebration Hall',
    description: 'A premier banquet hall in the heart of Vijayawada with world-class amenities for weddings, conventions, and grand events.',
    state: 'Andhra Pradesh', district: 'Krishna', area: 'Vijayawada',
    fullAddress: 'Survey No. 45, Benz Circle, Vijayawada, Krishna, Andhra Pradesh – 520010',
    capacity: 1200, price: 45000, type: 'Banquet Hall', acType: 'Central AC',
    parking: '200+ Cars with Valet', stage: '50x30 ft Grand Stage', catering: 'In-House & Outside Allowed',
    facilities: ['Central Air Conditioning', '24x7 Power Backup', 'Grand Stage', 'Valet Parking', 'Green Rooms', 'Bridal Suite', 'LED Projection'],
    availableTimeSlots: ['Morning Slot (08:00 AM – 02:00 PM)', 'Evening Slot (04:00 PM – 10:00 PM)', 'Full Day (08:00 AM – 11:00 PM)'],
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545232979-fbf68fe9b1a2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.9, reviewCount: 142,
    additionalServices: [
      { name: 'Floral Stage & Arch Decoration', price: 15000 },
      { name: 'DJ + Sound System', price: 8000 },
      { name: 'Catering (per plate)', price: 650 },
    ],
  },
  {
    name: 'Amaravati Royal Palace Mandapam',
    description: 'Ultra-luxurious royal convention palace with Rajasthani carved pillars, massive chandelier hall, and sprawling lawn.',
    state: 'Andhra Pradesh', district: 'Krishna', area: 'Vijayawada',
    fullAddress: 'Beside Swarna Bharathi Enclave, MG Road, Vijayawada – 520008',
    capacity: 2200, price: 95000, type: 'Marriage Hall', acType: 'Central AC',
    parking: '350+ Cars with Valet', stage: '70x40 ft Royal Stage', catering: 'In-House & Outside Allowed',
    facilities: ['Luxury Central AC', 'Royal Mandap Stage', 'VIP Guest Suites', 'Valet Parking', 'Fountain Courtyard'],
    availableTimeSlots: ['Morning Slot (07:00 AM – 02:00 PM)', 'Evening Slot (04:00 PM – 11:00 PM)', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1545232979-fbf68fe9b1a2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 5.0, reviewCount: 98,
    additionalServices: [
      { name: 'Grand Royal Mandap & Floral Decor', price: 35000 },
      { name: 'Traditional Shehnai & Nadaswaram', price: 12000 },
      { name: 'Buffet Catering Setup', price: 800 },
    ],
  },
  {
    name: 'Sri Krishna Kalyana Vedika',
    description: 'Traditional and auspicious marriage mandapam with Vedic design, pure vegetarian kitchen, and spacious dining hall.',
    state: 'Andhra Pradesh', district: 'Krishna', area: 'Vijayawada',
    fullAddress: 'Labbipet, Bandar Road, Vijayawada – 520010',
    capacity: 700, price: 28000, type: 'Kalyana Mandapam', acType: 'Central AC',
    parking: '120 Cars', stage: '35x25 ft Traditional Stage', catering: 'Pure Veg Catering In-House',
    facilities: ['Central AC', 'Homam & Rituals Allowed', 'Dining Hall for 350', 'Bridal Dressing Rooms', 'Power Backup'],
    availableTimeSlots: ['Morning Muhurtham (05:00 AM – 02:00 PM)', 'Evening Reception (04:00 PM – 10:00 PM)', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.6, reviewCount: 76,
    additionalServices: [
      { name: 'Marigold & Jasmine Mandap Decor', price: 10000 },
      { name: 'Purohit & Pooja Arrangement', price: 5000 },
    ],
  },
  {
    name: 'Prakasam Heritage Function Hall',
    description: 'Budget-conscious event hall perfect for engagements, birthday parties, and intimate family ceremonies.',
    state: 'Andhra Pradesh', district: 'Krishna', area: 'Vijayawada',
    fullAddress: 'Old Bus Stand Road, Governorpet, Vijayawada – 520002',
    capacity: 350, price: 14000, type: 'Community Hall', acType: 'Split AC',
    parking: '40 Cars + 80 Two-wheelers', stage: '22x16 ft Stage', catering: 'Outside Allowed',
    facilities: ['Split AC', 'Sound System', 'Power Backup', 'Changing Rooms'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot'],
    images: [
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.3, reviewCount: 45,
    additionalServices: [{ name: 'Basic Balloon & Floral Decor', price: 4000 }],
  },
  {
    name: 'The Crystal Chandelier Banquet',
    description: 'Gleaming, contemporary crystal chandelier ballroom right at Benz Circle with five-star catering options.',
    state: 'Andhra Pradesh', district: 'Krishna', area: 'Benz Circle',
    fullAddress: 'Opp. Trendset Mall, Benz Circle, Vijayawada – 520010',
    capacity: 850, price: 52000, type: 'Banquet Hall', acType: 'Central AC',
    parking: '180 Cars with Valet', stage: '45x25 ft Designer Stage', catering: 'In-House Chef Menu',
    facilities: ['Italian Marble Flooring', 'Crystal Chandeliers', 'Valet Parking', 'Central AC', 'Acoustic Soundproofing'],
    availableTimeSlots: ['Morning Slot (08:00 AM – 02:00 PM)', 'Evening Slot (04:00 PM – 11:00 PM)'],
    images: [
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.8, reviewCount: 92,
    additionalServices: [
      { name: 'Crystal Theme Lighting & Decor', price: 20000 },
      { name: 'Live DJ & Acoustic Lighting', price: 12000 },
    ],
  },
  {
    name: 'Krishna Valley Convention',
    description: 'Spacious and accessible convention hall ideal for corporate conferences, receptions, and community gatherings.',
    state: 'Andhra Pradesh', district: 'Krishna', area: 'Benz Circle',
    fullAddress: 'MG Road, Benz Circle, Vijayawada, Krishna – 520010',
    capacity: 600, price: 25000, type: 'Convention Hall', acType: 'Central AC',
    parking: '100+ Cars', stage: '30x20 ft Stage', catering: 'In-House Catering',
    facilities: ['Central AC', 'Power Backup', 'Parking', 'LED Screen', 'Dining Area'],
    availableTimeSlots: ['Morning Slot (08:00 AM – 02:00 PM)', 'Evening Slot (04:00 PM – 10:00 PM)'],
    images: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.5, reviewCount: 87,
    additionalServices: [{ name: 'Basic Decoration', price: 5000 }, { name: 'Sound System', price: 4000 }],
  },
  {
    name: 'Poranki Grand Gardens & Lawns',
    description: 'Enchanting open-air wedding lawns with illuminated palm trees, modern banquet hall, and fireworks clearance.',
    state: 'Andhra Pradesh', district: 'Krishna', area: 'Poranki',
    fullAddress: 'Poranki Bypass Road, Vijayawada, Krishna – 521137',
    capacity: 1600, price: 48000, type: 'Party Lawn', acType: 'Central AC',
    parking: '250 Cars', stage: '60x35 ft Outdoor Stage + Indoor Hall', catering: 'In-House & Outside Allowed',
    facilities: ['Open-air Lawn', 'Indoor AC Hall', 'Fairy Light Decor', '24x7 Power Backup', 'Large Dining Area'],
    availableTimeSlots: ['Evening Reception (04:00 PM – 11:30 PM)', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.7, reviewCount: 110,
    additionalServices: [
      { name: 'Lawn Lighting & Canopy Setup', price: 25000 },
      { name: 'Live Barbecue & Mocktail Counters', price: 15000 },
    ],
  },
  {
    name: 'Poranki Community Hall',
    description: 'Budget-friendly hall for intimate family gatherings, baby showers, and neighborhood celebrations.',
    state: 'Andhra Pradesh', district: 'Krishna', area: 'Poranki',
    fullAddress: 'NH-16 Service Road, Poranki, Vijayawada, Krishna – 521137',
    capacity: 300, price: 10000, type: 'Community Hall', acType: 'Split AC',
    parking: '50 Cars', stage: '20x15 ft Stage', catering: 'Outside Caterers Allowed',
    facilities: ['Split AC', 'Power Backup', 'Basic Stage', 'Parking'],
    availableTimeSlots: ['Morning Slot (08:00 AM – 02:00 PM)', 'Evening Slot (04:00 PM – 09:00 PM)'],
    images: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.2, reviewCount: 54,
    additionalServices: [{ name: 'Floral Decoration', price: 3000 }],
  },
  {
    name: 'Bandar Royal Heritage Hall',
    description: 'Historic seaport heritage hall in Machilipatnam with high wooden rafters and coastal charm.',
    state: 'Andhra Pradesh', district: 'Krishna', area: 'Machilipatnam',
    fullAddress: 'Main Road, Near Old Court, Machilipatnam – 521001',
    capacity: 800, price: 22000, type: 'Heritage Convention Hall', acType: 'Central AC',
    parking: '100 Cars', stage: '40x25 ft Stage', catering: 'Outside Allowed',
    facilities: ['Heritage Architecture', 'Central AC', 'Large Dining Court', 'Power Backup'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.4, reviewCount: 38,
    additionalServices: [{ name: 'Traditional Floral Setup', price: 7000 }],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ── 2. Andhra Pradesh – Guntur & Visakhapatnam
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Spices Grand Convention Guntur',
    description: 'Major exhibition and marriage convention center with massive parking in Guntur City.',
    state: 'Andhra Pradesh', district: 'Guntur', area: 'Guntur City',
    fullAddress: 'Ring Road, Near Collectorate, Guntur – 522004',
    capacity: 1500, price: 58000, type: 'Convention Center', acType: 'Central AC',
    parking: '300 Cars', stage: '60x30 ft Stage', catering: 'In-House & Outside Allowed',
    facilities: ['Central AC', 'High Ceiling Hall', 'Guest Rooms', 'LED Lighting', 'Valet'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.8, reviewCount: 88,
    additionalServices: [{ name: 'Grand Stage Decoration', price: 20000 }],
  },
  {
    name: 'Mangalagiri Divine Kalyana Mandapam',
    description: 'Near the famous temple foothills, peaceful spiritual environment with grand marriage stage.',
    state: 'Andhra Pradesh', district: 'Guntur', area: 'Mangalagiri',
    fullAddress: 'Temple Road, Mangalagiri, Guntur – 522503',
    capacity: 900, price: 32000, type: 'Kalyana Mandapam', acType: 'Central AC',
    parking: '150 Cars', stage: '45x28 ft Traditional Stage', catering: 'Pure Veg Allowed',
    facilities: ['Central AC', 'Temple Ritual Friendly', 'Dining Hall', 'Rooms for Bride & Groom'],
    availableTimeSlots: ['Morning Muhurtham', 'Evening Reception', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.7, reviewCount: 65,
    additionalServices: [{ name: 'Temple Flower Decor', price: 12000 }],
  },
  {
    name: 'Bay Breeze Beachfront Convention',
    description: 'Premier seaside luxury destination hall in Rushikonda with breathtaking Bay of Bengal views.',
    state: 'Andhra Pradesh', district: 'Visakhapatnam', area: 'Rushikonda',
    fullAddress: 'Beach Road, Rushikonda, Visakhapatnam – 530045',
    capacity: 2000, price: 125000, type: 'Convention Center', acType: 'Central AC',
    parking: '400+ Cars', stage: '70x40 ft Oceanview Stage', catering: 'Luxury 5-Star Catering',
    facilities: ['Ocean View Lawn', 'Glass Banquet Hall', 'Valet Parking', 'Luxury AC', 'Honeymoon Suite'],
    availableTimeSlots: ['Morning Slot', 'Sunset & Evening Slot', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.9, reviewCount: 160,
    additionalServices: [
      { name: 'Destination Beach Floral Setup', price: 45000 },
      { name: 'Live Acoustic & Sound', price: 20000 },
    ],
  },
  {
    name: 'Vizag Grand Ballroom MVP',
    description: 'Centrally located luxury banquet in MVP Colony, known for corporate galas and grand receptions.',
    state: 'Andhra Pradesh', district: 'Visakhapatnam', area: 'MVP Colony',
    fullAddress: 'Sector 3, MVP Colony, Visakhapatnam – 530017',
    capacity: 900, price: 58000, type: 'Banquet Hall', acType: 'Central AC',
    parking: '180 Cars with Valet', stage: '45x30 ft Stage', catering: 'In-House Catering',
    facilities: ['Central AC', 'Crystal Chandeliers', 'Modern AV Setup', 'Power Backup'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot'],
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.8, reviewCount: 114,
    additionalServices: [{ name: 'Ballroom Lighting & Decor', price: 22000 }],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ── 3. Telangana – Hyderabad (Hitec City, Banjara Hills, Jubilee Hills, Madhapur, Gachibowli, Ameerpet)
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Cyber Pearl Convention Center',
    description: 'State-of-the-art international conference and wedding complex in Hitec City with high-capacity ballrooms.',
    state: 'Telangana', district: 'Hyderabad', area: 'Hitec City',
    fullAddress: 'Phase 2, Hitec City, Madhapur, Hyderabad – 500081',
    capacity: 2500, price: 160000, type: 'Convention Center', acType: 'Central AC',
    parking: '500+ Cars with Valet', stage: '80x50 ft Conference Stage', catering: 'Exclusive In-House',
    facilities: ['Luxury Central AC', '5-Star Catering', 'Grand Ballroom', 'Executive Lounge', 'Simultaneous Translation', 'Live Streaming'],
    availableTimeSlots: ['Morning Session (07:00 AM – 02:00 PM)', 'Evening Session (03:00 PM – 10:00 PM)', 'Full Day (07:00 AM – 11:00 PM)'],
    images: [
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.9, reviewCount: 235,
    additionalServices: [
      { name: 'Premium Floral Décor', price: 50000 },
      { name: 'Celebrity DJ & Sound', price: 30000 },
      { name: 'Luxury Catering (per plate)', price: 1800 },
    ],
  },
  {
    name: 'Silicon Valley Grand Ballroom',
    description: 'Opulent tech-corridor wedding banquet with ambient RGB mood lighting, glass atrium, and VIP greenrooms.',
    state: 'Telangana', district: 'Hyderabad', area: 'Hitec City',
    fullAddress: 'Cyber Towers Road, Hitec City, Hyderabad – 500081',
    capacity: 1200, price: 90000, type: 'Banquet Hall', acType: 'Central AC',
    parking: '250 Cars', stage: '50x35 ft Stage', catering: 'In-House & Outside Allowed',
    facilities: ['Central AC', 'Ambient Mood Lighting', 'High-speed Fiber WiFi', 'Valet Parking', 'Bridal Suite'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.8, reviewCount: 140,
    additionalServices: [
      { name: 'Theme Decor & Stage Arch', price: 30000 },
      { name: 'DJ & Sound Console', price: 18000 },
    ],
  },
  {
    name: 'Tech Hub Executive Hall',
    description: 'Mid-range smart hall in Hitec City, tailored for product launches, corporate seminars, and cocktail parties.',
    state: 'Telangana', district: 'Hyderabad', area: 'Hitec City',
    fullAddress: 'Near Mindspace, Hitec City, Hyderabad – 500081',
    capacity: 500, price: 38000, type: 'Banquet Hall', acType: 'Central AC',
    parking: '100 Cars', stage: '30x20 ft Stage', catering: 'In-House Catering',
    facilities: ['Smart AV System', 'Central AC', 'High Speed WiFi', 'Podium & Mics'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot'],
    images: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.5, reviewCount: 62,
    additionalServices: [{ name: 'Corporate Branding Setup', price: 12000 }],
  },
  {
    name: 'Banjara Hills Majestic Palace',
    description: 'Iconic luxury banquet venue on Road No. 12 with palace-style arches, golden chandeliers, and terrace gardens.',
    state: 'Telangana', district: 'Hyderabad', area: 'Banjara Hills',
    fullAddress: 'Road No. 12, Banjara Hills, Hyderabad – 500034',
    capacity: 1400, price: 130000, type: 'Banquet Hall', acType: 'Central AC',
    parking: '300+ Cars with Valet', stage: '65x35 ft Stage', catering: 'Royal Nizami & Global Menu',
    facilities: ['Nizami Architecture', 'Central AC', 'Bridal Suite', 'Valet Parking', 'LED Walls', 'Terrace Garden'],
    availableTimeSlots: ['Morning Slot (08:00 AM – 02:00 PM)', 'Evening Slot (04:00 PM – 11:30 PM)', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1545232979-fbf68fe9b1a2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.9, reviewCount: 188,
    additionalServices: [
      { name: 'Royal Nizami Decor Setup', price: 55000 },
      { name: 'Live Ghazal & Sufi Troupe', price: 35000 },
    ],
  },
  {
    name: 'Hilltop Elegance Banquet',
    description: 'Standard modern banquet hall with sweeping city skyline views from Banjara Hills.',
    state: 'Telangana', district: 'Hyderabad', area: 'Banjara Hills',
    fullAddress: 'Road No. 1, Banjara Hills, Hyderabad – 500034',
    capacity: 650, price: 42000, type: 'Banquet Hall', acType: 'Central AC',
    parking: '120 Cars', stage: '35x22 ft Stage', catering: 'In-House & Outside Allowed',
    facilities: ['Central AC', 'City View Terrace', 'Valet Parking', 'Power Backup'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot'],
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.6, reviewCount: 78,
    additionalServices: [{ name: 'Floral Stage Decoration', price: 15000 }],
  },
  {
    name: 'Jubilee Grand Lawns & Pavilions',
    description: 'Exquisite open-air luxury wedding lawn nestled in the serene Jubilee Hills greens with crystal pavilion.',
    state: 'Telangana', district: 'Hyderabad', area: 'Jubilee Hills',
    fullAddress: 'Road No. 36, Jubilee Hills, Hyderabad – 500033',
    capacity: 2000, price: 145000, type: 'Party Lawn', acType: 'Central AC',
    parking: '400+ Cars with Valet', stage: '75x40 ft Glass Pavilion Stage', catering: 'Multi-Cuisine Gourmet',
    facilities: ['Manicured Lawn', 'Air-Conditioned Dining Pavilion', 'Fairylight Canopy', 'VIP Lounge', 'Valet'],
    availableTimeSlots: ['Evening Slot (04:00 PM – 12:00 AM)', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.9, reviewCount: 204,
    additionalServices: [
      { name: 'Fairylight & Floral Canopy Decor', price: 60000 },
      { name: 'Live Symphony Band', price: 40000 },
    ],
  },
  {
    name: 'Financial District Convention Center',
    description: 'Cutting-edge mega convention complex in Gachibowli with 3 interconnected halls and outdoor deck.',
    state: 'Telangana', district: 'Hyderabad', area: 'Gachibowli',
    fullAddress: 'Financial District, Nanakramguda, Gachibowli, Hyderabad – 500032',
    capacity: 1800, price: 115000, type: 'Convention Center', acType: 'Central AC',
    parking: '450 Cars', stage: '60x40 ft Stage', catering: 'In-House Executive Catering',
    facilities: ['Central AC', 'Acoustic Soundproofing', 'Automated Lighting', 'VIP Suites', 'Bus Parking'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.8, reviewCount: 156,
    additionalServices: [{ name: 'AV & Digital Stage Production', price: 35000 }],
  },
  {
    name: 'Ameerpet Metro Pride Banquet',
    description: 'Affordable and well-connected banquet hall right next to Ameerpet metro interchange.',
    state: 'Telangana', district: 'Hyderabad', area: 'Ameerpet',
    fullAddress: 'SR Nagar Main Road, Ameerpet, Hyderabad – 500038',
    capacity: 450, price: 20000, type: 'Banquet Hall', acType: 'Central AC',
    parking: '80 Cars', stage: '28x18 ft Stage', catering: 'Outside Allowed',
    facilities: ['Central AC', 'Next to Metro', 'Power Backup', 'Dining Hall'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.4, reviewCount: 85,
    additionalServices: [{ name: 'Basic Floral & Balloon Decor', price: 5000 }],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ── 4. Karnataka – Bengaluru Urban (Indiranagar, Koramangala, Whitefield)
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Sapphire Grand Convention & Lawns',
    description: 'Premium wedding venue with both indoor ballroom and open-air lawns in Indiranagar.',
    state: 'Karnataka', district: 'Bengaluru Urban', area: 'Indiranagar',
    fullAddress: '12th Main, HAL 2nd Stage, Indiranagar, Bengaluru – 560038',
    capacity: 1800, price: 110000, type: 'Convention Hall', acType: 'Central AC',
    parking: '350+ Cars', stage: '70x40 ft Stage + Outdoor Lawns', catering: 'Exclusive Catering',
    facilities: ['Air-Conditioned Hall', 'Outdoor Lawns', 'Premium Décor', 'Live Kitchen', 'Guest Suites', 'Valet Parking'],
    availableTimeSlots: ['Morning Slot (07:00 AM – 02:00 PM)', 'Evening Slot (04:00 PM – 11:00 PM)', 'Full Day (07:00 AM – 11:00 PM)'],
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.9, reviewCount: 215,
    additionalServices: [
      { name: 'Royal Floral Decoration', price: 40000 },
      { name: 'Photography + Videography', price: 25000 },
      { name: 'Catering (per plate)', price: 1400 },
    ],
  },
  {
    name: 'Indiranagar Clubview Ballroom',
    description: 'Classy, mid-size boutique ballroom on 100ft road with warm wood paneling and ambient acoustics.',
    state: 'Karnataka', district: 'Bengaluru Urban', area: 'Indiranagar',
    fullAddress: '100ft Road, Indiranagar, Bengaluru – 560038',
    capacity: 650, price: 55000, type: 'Banquet Hall', acType: 'Central AC',
    parking: '120 Cars with Valet', stage: '35x20 ft Stage', catering: 'In-House Continental & Indian',
    facilities: ['Central AC', 'Boutique Interior', 'Cocktail Bar Lounge', 'Valet'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot'],
    images: [
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.7, reviewCount: 89,
    additionalServices: [{ name: 'Boutique Floral Arrangement', price: 18000 }],
  },
  {
    name: 'Koramangala Prestige Hall',
    description: 'Modern banquet hall in tech-hub Koramangala, ideal for corporate events, product launches, and grand celebrations.',
    state: 'Karnataka', district: 'Bengaluru Urban', area: 'Koramangala',
    fullAddress: '80 Feet Road, 6th Block, Koramangala, Bengaluru – 560095',
    capacity: 800, price: 65000, type: 'Banquet Hall', acType: 'Central AC',
    parking: '150+ Cars', stage: '45x28 ft Stage', catering: 'In-House & Outside',
    facilities: ['Central AC', 'High-Speed WiFi', 'AV Equipment', 'Parking', 'Bridal Suite'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.7, reviewCount: 112,
    additionalServices: [{ name: 'Corporate Décor Package', price: 20000 }, { name: 'Sound & Lighting', price: 12000 }],
  },
  {
    name: 'ITPL Grand Convention Whitefield',
    description: 'Expansive tech-campus convention hall with seating for up to 2500 guests, equipped with hybrid streaming.',
    state: 'Karnataka', district: 'Bengaluru Urban', area: 'Whitefield',
    fullAddress: 'ITPB Main Road, Whitefield, Bengaluru – 560066',
    capacity: 2200, price: 135000, type: 'Convention Center', acType: 'Central AC',
    parking: '500+ Cars', stage: '80x45 ft Stage', catering: 'In-House 5-Star Catering',
    facilities: ['Central AC', 'Auditorium Seating Option', 'Live Webcast', 'Helipad Access', 'Valet'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.9, reviewCount: 178,
    additionalServices: [{ name: 'Mega Stage LED & Lighting', price: 45000 }],
  },
  {
    name: 'Whitefield Budget Banquet',
    description: 'Budget-friendly banquet hall in Whitefield for intimate events up to 300 guests.',
    state: 'Karnataka', district: 'Bengaluru Urban', area: 'Whitefield',
    fullAddress: 'Varthur Main Road, Whitefield, Bengaluru – 560066',
    capacity: 300, price: 16000, type: 'Banquet Hall', acType: 'Split AC',
    parking: '60 Cars', stage: '20x15 ft Stage', catering: 'Outside Allowed',
    facilities: ['Split AC', 'Parking', 'Power Backup'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot'],
    images: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.1, reviewCount: 43,
    additionalServices: [{ name: 'Decoration', price: 4000 }],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ── 5. Maharashtra – Mumbai (Bandra West, Lower Parel, Andheri West)
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'The Grand Palladium Bandra',
    description: 'Luxury 5-star convention center in the heart of Bandra West with Arabian Sea breeze and royal chandeliers.',
    state: 'Maharashtra', district: 'Mumbai City', area: 'Bandra West',
    fullAddress: 'Linking Road, Bandra West, Mumbai – 400050',
    capacity: 3000, price: 260000, type: 'Convention Center', acType: 'Central AC',
    parking: '600+ Cars with Valet', stage: '100x60 ft Grand Ballroom Stage', catering: '5-Star Exclusive',
    facilities: ['5-Star Luxury', 'Grand Ballroom', 'Presidential Suite', 'Helicopter Pad Nearby', 'Valet', 'Live Band Stage'],
    availableTimeSlots: ['Morning (07:00 AM – 02:00 PM)', 'Evening (04:00 PM – 12:00 AM)', 'Full Day (07:00 AM – 12:00 AM)'],
    images: [
      'https://images.unsplash.com/photo-1545232979-fbf68fe9b1a2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 5.0, reviewCount: 340,
    additionalServices: [
      { name: 'Celebrity Décor Designer', price: 150000 },
      { name: 'Live Band + Entertainment', price: 80000 },
      { name: '5-Star Catering (per plate)', price: 3500 },
    ],
  },
  {
    name: 'Sea Breeze Royal Banquet Bandra',
    description: 'Chic seaside ballroom on Carter Road offering unobstructed ocean views and sunset ceremonies.',
    state: 'Maharashtra', district: 'Mumbai City', area: 'Bandra West',
    fullAddress: 'Carter Road, Bandra West, Mumbai – 400050',
    capacity: 1000, price: 140000, type: 'Banquet Hall', acType: 'Central AC',
    parking: '200 Cars with Valet', stage: '50x30 ft Sea-Facing Stage', catering: 'In-House Gourmet',
    facilities: ['Sea-Facing Glass Wall', 'Central AC', 'Valet Parking', 'Bridal Suite', 'Sunset Deck'],
    availableTimeSlots: ['Sunset & Evening Slot', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.9, reviewCount: 162,
    additionalServices: [{ name: 'Coastal Floral Mandap', price: 45000 }],
  },
  {
    name: 'Lower Parel Heritage Banquet',
    description: 'High-ceiling industrial heritage-style banquet hall in Lower Parel, ideal for upscale urban weddings.',
    state: 'Maharashtra', district: 'Mumbai City', area: 'Lower Parel',
    fullAddress: 'Senapati Bapat Marg, Lower Parel, Mumbai – 400013',
    capacity: 1500, price: 125000, type: 'Banquet Hall', acType: 'Central AC',
    parking: '400 Cars', stage: '65x40 ft Heritage Stage', catering: 'Premium In-House',
    facilities: ['Heritage Décor', 'Premium AC', 'Valet Parking', 'Terrace Lawn', 'Bridal Suite'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.8, reviewCount: 215,
    additionalServices: [{ name: 'Premium Floral', price: 60000 }, { name: 'DJ & Sound', price: 35000 }],
  },
  {
    name: 'Andheri Standard Event Hall',
    description: 'Mid-range event hall in Andheri West near Versova Link Road, perfect for social celebrations.',
    state: 'Maharashtra', district: 'Mumbai City', area: 'Andheri West',
    fullAddress: 'Off Versova Link Road, Andheri West, Mumbai – 400053',
    capacity: 700, price: 58000, type: 'Banquet Hall', acType: 'Central AC',
    parking: '120 Cars', stage: '40x25 ft Stage', catering: 'In-House Available',
    facilities: ['Central AC', 'WiFi', 'AV', 'Parking', 'Stage Lighting'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.5, reviewCount: 104,
    additionalServices: [{ name: 'Decoration Package', price: 15000 }],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ── 6. Tamil Nadu – Chennai (T. Nagar, Nungambakkam, Adyar)
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Chennai Trade & Convention Center',
    description: 'Massive world-class trade exhibition and convention center in central Chennai for grand summits.',
    state: 'Tamil Nadu', district: 'Chennai', area: 'Nungambakkam',
    fullAddress: 'Nungambakkam High Road, Chennai – 600034',
    capacity: 5000, price: 210000, type: 'Convention Center', acType: 'Central AC',
    parking: '1000+ Cars', stage: '150x80 ft Exhibition Hall', catering: 'Multi-Cuisine Exclusive',
    facilities: ['World-Class AC', 'Exhibition Hall', 'Conference Suites', 'Business Center', '5G WiFi'],
    availableTimeSlots: ['Full Day (07:00 AM – 11:00 PM)'],
    images: [
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.9, reviewCount: 325,
    additionalServices: [{ name: 'Premium Exhibition Setup', price: 100000 }, { name: 'VIP Hospitality', price: 50000 }],
  },
  {
    name: 'T. Nagar Kalyana Mandapam',
    description: 'Renowned traditional kalyana mandapam with carved wooden entrance, nadaswaram acoustics, and dining hall.',
    state: 'Tamil Nadu', district: 'Chennai', area: 'T. Nagar',
    fullAddress: 'Pondy Bazaar Road, T. Nagar, Chennai – 600017',
    capacity: 850, price: 38000, type: 'Kalyana Mandapam', acType: 'Central AC',
    parking: '150 Cars', stage: '45x30 ft Traditional Stage', catering: 'Traditional South Indian Catering',
    facilities: ['Central AC', 'Traditional Décor', 'Bridal Room', 'Parking', 'Backup Generator', 'Pooja Hall'],
    availableTimeSlots: ['Morning Muhurtham (05:00 AM – 02:00 PM)', 'Evening Reception (04:00 PM – 10:00 PM)', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.7, reviewCount: 165,
    additionalServices: [{ name: 'Traditional Banana Trunk & Flower Decor', price: 18000 }, { name: 'South Indian Plantain Leaf Feast', price: 600 }],
  },
  {
    name: 'Adyar Riverview Banquet',
    description: 'Serene banquet venue overlooking the Adyar river estuary with manicured lawns and modern dining.',
    state: 'Tamil Nadu', district: 'Chennai', area: 'Adyar',
    fullAddress: 'Near Boat Club, Adyar, Chennai – 600020',
    capacity: 700, price: 34000, type: 'Banquet Hall', acType: 'Central AC',
    parking: '110 Cars', stage: '35x20 ft Stage', catering: 'In-House & Outside Allowed',
    facilities: ['River View Deck', 'Central AC', 'Parking', 'Power Backup'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot'],
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.6, reviewCount: 72,
    additionalServices: [{ name: 'Deck Lighting & Decor', price: 14000 }],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ── 7. Delhi – New Delhi & South Delhi (Connaught Place, Hauz Khas, Chhatarpur)
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Connaught Place Convention Hall',
    description: 'Iconic heritage convention center in the heart of CP, surrounded by colonial colonnades.',
    state: 'Delhi', district: 'New Delhi', area: 'Connaught Place',
    fullAddress: 'Outer Circle, Connaught Place, New Delhi – 110001',
    capacity: 2000, price: 185000, type: 'Convention Center', acType: 'Central AC',
    parking: '450 Cars with Valet', stage: '75x45 ft Stage', catering: 'Premium Gourmet Catering',
    facilities: ['Luxury AC', 'Conference Rooms', 'Grand Ballroom', 'Business Lounge', 'Valet'],
    availableTimeSlots: ['Morning (07:00 AM – 02:00 PM)', 'Evening (03:00 PM – 11:00 PM)', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1545232979-fbf68fe9b1a2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.9, reviewCount: 280,
    additionalServices: [{ name: 'Premier Décor', price: 80000 }, { name: 'AV & Lighting', price: 40000 }],
  },
  {
    name: 'Chhatarpur Royal Farmhouse Mandapam',
    description: 'Sprawling 4-acre luxury farmhouse in Chhatarpur with grand Roman pillars, reflection pool, and crystal ballroom.',
    state: 'Delhi', district: 'South Delhi', area: 'Chhatarpur',
    fullAddress: 'Chhatarpur Mandir Road, South Delhi – 110074',
    capacity: 2500, price: 220000, type: 'Party Lawn', acType: 'Central AC',
    parking: '600 Cars with Valet', stage: '90x50 ft Royal Palace Stage', catering: 'Gourmet World Cuisine',
    facilities: ['4-Acre Royal Lawn', 'Glass Air-Conditioned Pavilion', 'Reflection Pool', 'Bridal Cottage', 'Valet'],
    availableTimeSlots: ['Evening Grand Reception (04:00 PM – 01:00 AM)', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 5.0, reviewCount: 310,
    additionalServices: [
      { name: 'Royal Destination Floral Canopy', price: 120000 },
      { name: 'Live DJ, Dhol & Fireworks', price: 65000 },
    ],
  },
  {
    name: 'Hauz Khas Village Banquet',
    description: 'Trendy rooftop and banquet venue with historical medieval monument views and lush park surroundings.',
    state: 'Delhi', district: 'South Delhi', area: 'Hauz Khas',
    fullAddress: 'Hauz Khas Village, South Delhi – 110016',
    capacity: 650, price: 75000, type: 'Banquet Hall', acType: 'Central AC',
    parking: '100 Cars with Valet', stage: '35x25 ft Stage + Terrace', catering: 'Gourmet In-House',
    facilities: ['Central AC', 'Terrace Garden', 'Gourmet Kitchen', 'AV System', 'Valet'],
    availableTimeSlots: ['Evening Slot', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.6, reviewCount: 145,
    additionalServices: [{ name: 'Floral Décor', price: 25000 }],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ── 8. Rajasthan – Jaipur (C-Scheme, Mansarovar)
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Jaipur Palace Convention Hall',
    description: 'Heritage royal palace-style convention hall with hand-carved Rajasthani jharokhas and marble courtyards.',
    state: 'Rajasthan', district: 'Jaipur', area: 'C-Scheme',
    fullAddress: 'Prithviraj Road, C-Scheme, Jaipur – 302001',
    capacity: 2000, price: 135000, type: 'Heritage Convention Hall', acType: 'Central AC',
    parking: '400+ Cars', stage: '80x50 ft Royal Stage', catering: 'Royal Rajasthani Catering',
    facilities: ['Heritage Architecture', 'Luxury AC', 'Elephant Entrance Gate', 'Royal Banquet', 'Guest Palace Rooms'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot', 'Full Day'],
    images: [
      'https://images.unsplash.com/photo-1545232979-fbf68fe9b1a2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.9, reviewCount: 260,
    additionalServices: [
      { name: 'Royal Wedding Décor', price: 75000 },
      { name: 'Folk Artists & Ghoomar Troupe', price: 30000 },
    ],
  },
  {
    name: 'Pink City Royal Haveli Mandapam',
    description: 'Authentic heritage haveli with open courtyards, fountain square, and traditional Shekhawati frescoes.',
    state: 'Rajasthan', district: 'Jaipur', area: 'Mansarovar',
    fullAddress: 'Madhyam Marg, Mansarovar, Jaipur – 302020',
    capacity: 1100, price: 68000, type: 'Heritage Convention Hall', acType: 'Central AC',
    parking: '200 Cars', stage: '45x30 ft Haveli Stage', catering: 'In-House Rajasthani Rasoi',
    facilities: ['Haveli Courtyard', 'Central AC', 'Fountain Setup', 'Valet Parking'],
    availableTimeSlots: ['Morning Slot', 'Evening Slot'],
    images: [
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.8, reviewCount: 118,
    additionalServices: [{ name: 'Royal Marigold & Candle Setup', price: 25000 }],
  },
];

// ─── Sample Events (Pan-India) ──────────────────────────────────────────────
const EVENTS_DATA = [
  {
    title: 'Andhra Pradesh Business Summit 2026',
    description: 'Annual business networking summit connecting entrepreneurs and industry leaders across Andhra Pradesh.',
    category: 'Business', organizer: 'AP CII Chapter',
    date: new Date('2026-10-15'), startTime: '09:00', endTime: '18:00',
    venue: 'Grand Celebration Hall', location: 'Vijayawada, Andhra Pradesh',
    state: 'Andhra Pradesh', district: 'Krishna', area: 'Vijayawada',
    capacity: 800, availableSlots: 800, price: 999,
    registrationDeadline: new Date('2026-10-10'),
    contactEmail: 'ap.summit@eventpro.com',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
  },
  {
    title: 'Hyderabad Tech Conclave 2026',
    description: 'Premier technology conference featuring AI, Cloud, and Digital Transformation sessions.',
    category: 'Technical', organizer: 'HYSEA',
    date: new Date('2026-10-25'), startTime: '08:00', endTime: '19:00',
    venue: 'Cyber Pearl Convention Center', location: 'Hyderabad, Telangana',
    state: 'Telangana', district: 'Hyderabad', area: 'Hitec City',
    capacity: 1500, availableSlots: 1500, price: 1499,
    registrationDeadline: new Date('2026-10-20'),
    contactEmail: 'hyderabad.tech@eventpro.com',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
  },
  {
    title: 'Bengaluru Cultural & Music Fest',
    description: 'A vibrant celebration of Karnataka classical music, dance, and regional culture.',
    category: 'Cultural', organizer: 'Karnataka Sangeetha Sabha',
    date: new Date('2026-11-08'), startTime: '16:00', endTime: '22:00',
    venue: 'Sapphire Grand Convention', location: 'Bengaluru, Karnataka',
    state: 'Karnataka', district: 'Bengaluru Urban', area: 'Indiranagar',
    capacity: 1000, availableSlots: 1000, price: 499,
    registrationDeadline: new Date('2026-11-05'),
    contactEmail: 'blr.culture@eventpro.com',
    image: 'https://images.unsplash.com/photo-1465479423260-c4afc24172c6?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
  },
  {
    title: 'Mumbai Corporate Leadership Summit',
    description: 'Fortune 500 leaders and startup founders gather to discuss the future of Indian business.',
    category: 'Business', organizer: 'CII Mumbai',
    date: new Date('2026-11-20'), startTime: '09:00', endTime: '18:00',
    venue: 'Grand Palladium Bandra', location: 'Mumbai, Maharashtra',
    state: 'Maharashtra', district: 'Mumbai City', area: 'Bandra West',
    capacity: 2000, availableSlots: 2000, price: 2999,
    registrationDeadline: new Date('2026-11-15'),
    contactEmail: 'mumbai.summit@eventpro.com',
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
  },
  {
    title: 'Delhi International Trade Fair 2026',
    description: 'India\'s largest trade exhibition showcasing products from 50+ countries and 200+ industries.',
    category: 'Business', organizer: 'ITPO Delhi',
    date: new Date('2026-11-30'), startTime: '10:00', endTime: '20:00',
    venue: 'Connaught Place Convention Hall', location: 'New Delhi',
    state: 'Delhi', district: 'New Delhi', area: 'Connaught Place',
    capacity: 5000, availableSlots: 5000, price: 199,
    registrationDeadline: new Date('2026-11-25'),
    contactEmail: 'delhi.trade@eventpro.com',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
  },
  {
    title: 'Chennai Sangeet Utsav 2026',
    description: 'A 3-day classical music festival celebrating the best of Carnatic traditions.',
    category: 'Music', organizer: 'Chennai Music Academy',
    date: new Date('2026-12-05'), startTime: '17:00', endTime: '22:00',
    venue: 'T. Nagar Kalyana Mandapam', location: 'Chennai, Tamil Nadu',
    state: 'Tamil Nadu', district: 'Chennai', area: 'T. Nagar',
    capacity: 600, availableSlots: 600, price: 299,
    registrationDeadline: new Date('2026-12-01'),
    contactEmail: 'chennai.music@eventpro.com',
    image: 'https://images.unsplash.com/photo-1465479423260-c4afc24172c6?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB for clean reset...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully.');

    const restoreLocationsOnly = process.env.RESTORE_LOCATIONS_ONLY === 'true';

    if (!restoreLocationsOnly) {
      await User.deleteMany({});
      await FunctionHall.deleteMany({});
      await Event.deleteMany({});
      await Booking.deleteMany({});
      await Registration.deleteMany({});
      await Chat.deleteMany({});
      await Venue.deleteMany({});
      await VenueBooking.deleteMany({});
    }

    await Location.deleteMany({});

    const locationDocs = INDIA_LOCATIONS.flatMap((stateData) => (
      stateData.districts.map((districtData) => ({
        state: stateData.state,
        district: districtData.district,
        areas: districtData.areas,
      }))
    ));
    await Location.insertMany(locationDocs);

    console.log(restoreLocationsOnly
      ? 'Location hierarchy restored without changing users, venues, halls, events, or bookings.'
      : 'Database cleared. No users, venues, halls, events, bookings, reviews, registrations, or chat history remain.');
    console.log(`Restored ${locationDocs.length} platform location nodes for State, District, and Area filters.`);
    console.log('You can now create fresh venue and user data from the application.');
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
