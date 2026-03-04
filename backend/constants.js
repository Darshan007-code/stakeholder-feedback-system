const DEPARTMENTS = [
  "Computer Science & Engineering (CSE)",
  "Electronics & Communication Engineering (ECE)",
  "Electrical & Electronics Engineering (EEE)",
  "Mechanical Engineering (ME)",
  "Civil Engineering (CE)",
  "Information Science & Engineering (ISE)",
  "Artificial Intelligence & Machine Learning (AI&ML)",
  "Data Science (DS)",
  "Chemical Engineering",
  "Biotechnology",
  "Aerospace Engineering",
  "Automobile Engineering"
];

const DEPARTMENT_SUBJECTS = {
  "Computer Science & Engineering (CSE)": ["Data Structures", "Algorithms", "Operating Systems", "Computer Networks", "Database Management Systems"],
  "Electronics & Communication Engineering (ECE)": ["Digital Electronics", "Microprocessors", "Signal Processing", "VLSI Design", "Communication Systems"],
  "Electrical & Electronics Engineering (EEE)": ["Power Systems", "Control Systems", "Electrical Machines", "Power Electronics", "Circuit Theory"],
  "Mechanical Engineering (ME)": ["Thermodynamics", "Fluid Mechanics", "Heat Transfer", "Machine Design", "Manufacturing Process"],
  "Civil Engineering (CE)": ["Structural Analysis", "Geotechnical Engineering", "Surveying", "Transportation Engineering", "Environmental Engineering"],
  "Information Science & Engineering (ISE)": ["Web Technology", "Software Engineering", "Machine Learning", "Cloud Computing", "Big Data Analytics"],
  "Artificial Intelligence & Machine Learning (AI&ML)": ["Neural Networks", "Natural Language Processing", "Computer Vision", "Robotics", "Reinforcement Learning"],
  "Data Science (DS)": ["Statistics for DS", "Data Visualization", "Predictive Modeling", "Big Data Systems", "Deep Learning"],
  "Chemical Engineering": ["Mass Transfer", "Reaction Engineering", "Process Control", "Thermodynamics", "Transport Phenomena"],
  "Biotechnology": ["Cell Biology", "Genetics", "Bioinformatics", "Molecular Biology", "Bioprocess Engineering"],
  "Aerospace Engineering": ["Aerodynamics", "Propulsion", "Flight Mechanics", "Aircraft Structures", "Spacecraft Dynamics"],
  "Automobile Engineering": ["Automotive Engines", "Chassis Design", "Vehicle Dynamics", "Transmission Systems", "Electric Vehicles"]
};

const FEEDBACK_CATEGORIES = [
  "Teaching",
  "Lab Facilities",
  "Library",
  "Hostel",
  "Transport",
  "Administration",
  "Safety"
];

module.exports = { DEPARTMENTS, DEPARTMENT_SUBJECTS, FEEDBACK_CATEGORIES };
