// Complete timetable data from BMS accountability tracker
// All 19 weeks of MBBS/BDS Semester 1

const TIMETABLE_DATA = {
    1: {
        days: {
            'Tuesday': [
                { time: '09:00', activity: 'Briefing', lecturer: 'Dr. Sylvester Chabunya (Coordinator)' },
                { time: '10:00', activity: 'Science & Medicine', lecturer: 'Dr. Yohane Gadama' },
                { time: '11:00', activity: 'Life skills 1: HIV Module', lecturer: 'Prof E Umar' },
                { time: '14:00', activity: 'Literature searching', lecturer: 'Diana Mawindo' }
            ],
            'Wednesday': [
                { time: '08:00', activity: 'Introduction to biomolecules', lecturer: 'Dr. Jana' },
                { time: '09:00', activity: 'Introduction to public health', lecturer: 'Dr. Charles Mangani' },
                { time: '10:00', activity: 'Introduction to anthropology & social determinants of health: Malawi', lecturer: 'Dr. Lucinda Manda' }
            ],
            'Thursday': [
                { time: '09:00', activity: 'Introduction to anatomy', lecturer: 'Dr. A Mwakikunga' },
                { time: '10:00', activity: 'Introduction to microbiology & overview of microorganisms', lecturer: 'Dr. R Mkakosya' },
                { time: '11:00', activity: 'Introduction to Pharmacology', lecturer: 'Blessings Thuboy' }
            ],
            'Friday': [
                { time: '09:00', activity: 'Introduction of cells', lecturer: 'Mr. LH Tembo' },
                { time: '10:00', activity: 'Chemistry of carbohydrates', lecturer: 'T. Nyondo' },
                { time: '14:00', activity: 'Introduction to microscopy', lecturer: 'Dr. J Manda' }
            ]
        }
    },
    2: {
        days: {
            'Monday': [
                { time: '09:00', activity: 'Cell structure & cell organelles', lecturer: 'W. Pihri' },
                { time: '10:00', activity: 'Chemistry of amino acids', lecturer: 'T. Nyondo' },
                { time: '14:00', activity: 'Introduction to the DR – 1st Patient', lecturer: 'Dr. J. Manda' }
            ],
            'Tuesday': [
                { time: '08:00', activity: 'Professionalism (Ethics)', lecturer: 'Dr. Lucinda Manda-Taylor' },
                { time: '09:00', activity: 'Introduction to cytoskeleton, mitosis & meiosis', lecturer: 'W. Pihri' },
                { time: '10:00', activity: 'Biochemistry of nucleic acids', lecturer: 'S. Nayupe' },
                { time: '11:00', activity: 'Demography: general population issues', lecturer: 'Dr. Paul Kawale' },
                { time: '14:00', activity: 'Professionalism (Clinical)', lecturer: 'Dr. Lucinda Manda-Taylor' }
            ],
            'Wednesday': [
                { time: '08:00', activity: 'DNA & RNA Synthesis (Replication/transcription)', lecturer: 'S. Nayupe' },
                { time: '09:00', activity: 'RNA translation (genetic code & protein synthesis)', lecturer: 'S. Nayupe' },
                { time: '10:00', activity: 'Introduction to Epidemiology', lecturer: 'Dr. Fatsani Ngwalangwa' }
            ],
            'Thursday': [
                { time: '08:00', activity: 'Intro to anthropology & medicine: focus on Malawi', lecturer: 'Dr. Blessings Nkhangamwa' },
                { time: '09:00', activity: 'Epithelial function - use liver as example', lecturer: 'T. Mwambyale' },
                { time: '11:00', activity: 'Protein structure', lecturer: 'T. Nyondo' },
                { time: '14:00', activity: 'Primary tissues 1: surface epithelium', lecturer: 'L.H Tembo' }
            ],
            'Friday': [
                { time: '08:00', activity: 'Cell membrane structure', lecturer: 'T. Mwambyale' },
                { time: '09:00', activity: 'Post-translational Modification', lecturer: 'S. Nayupe' },
                { time: '11:00', activity: 'Primary tissue 1: Glands', lecturer: 'H. Tembo' },
                { time: '14:00', activity: 'Clinical Skills – Basic life support 1', lecturer: 'Dr. Yankho Zolowere / Dr. Chikondi Mwale / Dr. T Kachitosi' }
            ]
        }
    },
    3: {
        days: {
            'Monday': [
                { time: '08:00', activity: 'Chemistry of lipids: Classification, nomenclature', lecturer: 'T. Nyondo' },
                { time: '09:00', activity: 'Primary tissue 2: connective tissue CT proper', lecturer: 'Dr. J Manda' },
                { time: '11:00', activity: 'Primary tissue 2: connective tissue (bone, growth & epiphyseal plates)', lecturer: 'L. Tembo' },
                { time: '14:00', activity: 'Statistical tools for public health 3.1: summary statistics', lecturer: 'A Kumitawa' }
            ],
            'Tuesday': [
                { time: '08:00', activity: 'Demography 4-census methods', lecturer: 'Dr. Paul Kawale' },
                { time: '09:00', activity: 'Community health', lecturer: 'Dr. Tinashe Tizifa' },
                { time: '10:00', activity: 'Introduction to pathology, histopathology', lecturer: 'Dr. M Mulenga' },
                { time: '11:00', activity: 'Primary tissue 2: connective tissue, cartilage', lecturer: 'Dr. J Manda' }
            ],
            'Wednesday': [
                { time: '08:00', activity: 'Primary tissue 2: connective tissue - specialized', lecturer: 'Brian Matundu' },
                { time: '09:00', activity: 'Cell injury and death', lecturer: 'Dr. M Mulenga' },
                { time: '10:00', activity: 'Tools for public health 1.1: introduction to epidemiology', lecturer: 'Dr. Takondwa Msosa' },
                { time: '11:00', activity: 'Primary tissue 3: muscles', lecturer: 'Dr. J Manda' }
            ],
            'Thursday': [
                { time: '09:00', activity: 'Primary tissue 4: Nervous tissue, nerve regeneration', lecturer: 'L.H Tembo' },
                { time: '10:00', activity: 'Enzymes 1', lecturer: 'T. Nyondo' },
                { time: '11:00', activity: 'Enzymes 2', lecturer: 'T. Nyondo' },
                { time: '14:00', activity: 'Practical: Epithelia and glands', lecturer: 'L. Tembo / B. Matundu / W. Phiri' }
            ],
            'Friday': [
                { time: '10:00', activity: 'Homeostasis', lecturer: 'T Mwambyale' },
                { time: '11:00', activity: 'Life skills: sexuality', lecturer: 'Prof E Umar' },
                { time: '14:00', activity: 'Computer practical: Malawi data pyramid', lecturer: 'A Kumitawa' }
            ]
        }
    },
    4: {
        days: {
            'Monday': [
                { time: '08:00', activity: 'PUBLIC HOLIDAY - No academic activities', lecturer: '' }
            ],
            'Tuesday': [
                { time: '08:00', activity: 'Practical: Primary tissues (CT-proper, cartilage, bone, muscles & neurons)', lecturer: 'Dr. J Manda' },
                { time: '09:00', activity: 'Guided study: Epithelial function', lecturer: 'T Mwambale' },
                { time: '11:00', activity: 'Life skills: relationships', lecturer: 'Prof E Umar' },
                { time: '14:00', activity: 'Focused hospital visit 1', lecturer: 'Dr. Yankho Zolowere' }
            ],
            'Wednesday': [
                { time: '08:00', activity: 'Fluid compartments', lecturer: 'T Mwambale' },
                { time: '09:00', activity: 'Vesicular transport', lecturer: 'T Mwambale' },
                { time: '10:00', activity: 'Vitamins & minerals', lecturer: 'T. Nyondo' },
                { time: '11:00', activity: 'Cell growth, differentiation & adaptation', lecturer: 'L Tembo' }
            ],
            'Thursday': [
                { time: '08:00', activity: 'Life Skills: stress management', lecturer: 'Prof E Umar' },
                { time: '10:00', activity: 'Review of major body systems: lymphoreticular', lecturer: 'Dr. J Manda' },
                { time: '11:00', activity: 'Body fluid pressures', lecturer: 'T Mwambale' },
                { time: '14:00', activity: 'Postmortem', lecturer: 'Dr. Charles Dzamalala' }
            ],
            'Friday': [
                { time: '09:00', activity: 'Life Skills: Practical', lecturer: 'Prof E Umar' },
                { time: '10:00', activity: 'Review of major body systems – musculoskeletal', lecturer: 'Dr. J Manda' },
                { time: '14:00', activity: 'Receptor theory: agonist/antagonist', lecturer: 'Blessings Thuboy' }
            ]
        }
    },
    5: {
        days: {
            'Monday': [
                { time: '09:00', activity: 'Review of major body systems: CVS & respiratory', lecturer: 'Dr. Mwakikunga' },
                { time: '10:00', activity: 'Movement across cell membrane', lecturer: 'T Mwambyale' },
                { time: '14:00', activity: 'Introduction to bacteriology – structure', lecturer: 'Dr. R Mlakosya' }
            ],
            'Tuesday': [
                { time: '09:00', activity: 'Introduction to bacteriology – classification of different bacteria', lecturer: 'Dr. R Mlakosya' },
                { time: '11:00', activity: 'Review of major body systems: GIT', lecturer: 'L Tembo' },
                { time: '14:00', activity: 'Inhibition – competitive/non-competitive', lecturer: 'Blessings Thuboy' }
            ],
            'Wednesday': [
                { time: '08:00', activity: 'Introduction to bacteriology – growth & physiology', lecturer: 'Dr. R Mlakosya' },
                { time: '09:00', activity: 'Cellular adaptation and differentiation', lecturer: 'Dr. Mulenga' },
                { time: '10:00', activity: 'Classification of diseases', lecturer: 'Dr. M Mulenga' },
                { time: '11:00', activity: 'NSAIDS', lecturer: 'B Thuboy' }
            ],
            'Thursday': [
                { time: '09:00', activity: 'Epidemiology: Dynamics of disease transmission 1', lecturer: 'Dr. Takondwa Mssosa' },
                { time: '10:00', activity: 'Intra & extracellular accumulations', lecturer: 'Dr. M Mulenga' },
                { time: '14:00', activity: 'Focused hospital visit 2', lecturer: 'Dr. Yankho Zolowere' }
            ],
            'Friday': [
                { time: '09:00', activity: 'Review of major body systems: neuro/endo', lecturer: 'L Tembo' },
                { time: '10:00', activity: 'Acute inflammation', lecturer: 'Dr. M Mulenga' },
                { time: '11:00', activity: 'Chronic inflammation', lecturer: 'Dr. M Mulenga' }
            ]
        }
    },
    6: {
        days: {
            'Monday': [
                { time: '09:00', activity: 'Introduction to immunology – innate and adaptive immune defences', lecturer: 'Dr. Tonney Nyirenda' },
                { time: '14:00', activity: 'Clinical skills – basic life support 2', lecturer: 'Dr. Yankho Zolower / Dr. Timothy Kachitosi / Dr. Chikondi Mwale' }
            ],
            'Tuesday': [
                { time: '08:00', activity: 'Glycolysis', lecturer: 'Dr. C Chingwanda' },
                { time: '10:00', activity: 'Gluconeogenesis', lecturer: 'Dr. C Chingwanda' }
            ],
            'Wednesday': [
                { time: '08:00', activity: 'Tissue preparation for microscopy', lecturer: 'Dr. J Manda' },
                { time: '10:00', activity: 'TCA Cycle', lecturer: 'Dr. C Chingwanda' },
                { time: '11:00', activity: 'Review of major body systems: GU/repro', lecturer: 'Dr. A Mwakikunga' }
            ],
            'Thursday': [
                { time: '08:00', activity: 'Concepts of validity and reliability of screening tests', lecturer: 'Dr. Tinasa Tizifa' },
                { time: '10:00', activity: 'Statistical tools for public health: probability', lecturer: 'Dr. Christopher Stanley' },
                { time: '11:00', activity: 'SBD: attitudes & values (reflection)', lecturer: 'Prof C Bandawe' },
                { time: '14:00', activity: 'Microbial staining practical', lecturer: 'Dr. Mikakosya' }
            ],
            'Friday': [
                { time: '08:00', activity: 'Chromosomes and chromosome abnormalities', lecturer: 'S. Nayupe' },
                { time: '09:00', activity: 'Embryology: week 1 of life', lecturer: 'Dr. A Mwakikunga' },
                { time: '11:00', activity: 'Statistical tools for public health: probability 2', lecturer: 'Dr. Christopher Stanley' },
                { time: '14:00', activity: 'Postmortem II', lecturer: 'Dr. Charles Dzamalala' }
            ]
        }
    },
    7: {
        days: {
            'Monday': [
                { time: '09:00', activity: 'Embryology: week 2 of life', lecturer: 'Dr. A Mwakikunga' },
                { time: '10:00', activity: 'Wound healing and tissue repair', lecturer: 'Dr. M Mulenga' },
                { time: '11:00', activity: 'Stat. tools in public health: hypothesis testing', lecturer: 'Dr. Jessie Khaki Sithole' },
                { time: '14:00', activity: 'Clinical skills – basic life support 3', lecturer: 'Dr. Yankho Zolowere / Dr. Timothy Kachitosi / Dr. Chikondi Mwale' }
            ],
            'Tuesday': [
                { time: '08:00', activity: 'Oxidative phosphorylation', lecturer: 'Dr. Jana' },
                { time: '10:00', activity: 'Embryology: week 3 of life', lecturer: 'Dr. A Mwakikunga' },
                { time: '11:00', activity: 'Introduction to autoimmunity: concepts', lecturer: 'Dr. M Mulenga' },
                { time: '14:00', activity: 'Statistical tools for public health: population & samples', lecturer: 'A Kumitawa' },
                { time: '15:00', activity: 'Validity & reliability of screening tests', lecturer: 'Dr. Tinashe Tizifa' }
            ],
            'Wednesday': [
                { time: '09:00', activity: 'Mechanism of action of surface hormones', lecturer: 'M. Milozeni' },
                { time: '10:00', activity: 'Epidemiology: measures of disease frequency 1', lecturer: 'Dr. Seke Kayuni' },
                { time: '11:00', activity: 'Neoplasma and carcinogenesis 1', lecturer: 'Dr.M Mulenga' },
                { time: '14:00', activity: 'Neoplasma and carcinogenesis 2', lecturer: 'Dr.M Mulenga' },
                { time: '15:00', activity: 'Genetics & environmental causes of disease', lecturer: 'Dr.M Mulenga' }
            ],
            'Thursday': [
                { time: '09:00', activity: 'Mechanism of action of intracellular hormones', lecturer: 'M. Milozeni' },
                { time: '10:00', activity: 'Tumour pathology', lecturer: 'Dr. M Mulenga' },
                { time: '11:00', activity: 'Introduction to antivirals', lecturer: 'B Thuboy' },
                { time: '14:00', activity: 'Epidemiology: measures of disease frequency 2', lecturer: 'Dr. Seke Kayuni' }
            ],
            'Friday': [
                { time: '08:00', activity: 'Statistical tools for public health: Summary Statistics', lecturer: 'Emma Malonda' },
                { time: '10:00', activity: 'Viral oncogenes', lecturer: 'Dr. M Mulenga' },
                { time: '11:00', activity: 'Gene and gene structure', lecturer: 'S. Nayupe' },
                { time: '14:00', activity: 'Body plan practical (GU/repro/neuro)', lecturer: 'Dr. Mwakikunga / Phiri / Matundu' }
            ]
        }
    },
    8: {
        days: {
            'Monday': [
                { time: '09:00', activity: 'Clinical reasoning 1: history examination', lecturer: 'Dr. V Namasiu' },
                { time: '10:00', activity: 'Clinical reasoning 2: investigations & diagnosis', lecturer: 'Dr. V Namasiu' },
                { time: '11:00', activity: 'Statistics 6: hypothesis testing – means', lecturer: 'Dr. Jessie Khaki Sithole' },
                { time: '14:00', activity: 'Clinical skills Vital signs', lecturer: 'Dr. Yankho Zolwere' }
            ],
            'Tuesday': [
                { time: '08:00', activity: 'Statistical tools for public health: sampling distribution', lecturer: 'A Kumiatawa' },
                { time: '10:00', activity: 'Epidemiology: measures of mortality', lecturer: 'Dr. Ndoliwe Chihana' },
                { time: '14:00', activity: 'Guided study: HIV & cancer', lecturer: 'Dr. C Mwale' }
            ],
            'Wednesday': [
                { time: '08:00', activity: 'REVISION/MAKE-UP CLASSES', lecturer: '' }
            ],
            'Thursday': [
                { time: '08:00', activity: 'REVISION/MAKE-UP CLASSES', lecturer: '' }
            ],
            'Friday': [
                { time: '08:00', activity: 'REVISION/MAKE-UP CLASSES', lecturer: '' }
            ]
        }
    },
    9: {
        days: {
            'Monday': [
                { time: '09:00', activity: 'MID SEMESTER EXAMINATIONS', lecturer: '' },
                { time: '14:00', activity: 'MID SEMESTER EXAMINATIONS', lecturer: '' }
            ],
            'Tuesday': [
                { time: '09:00', activity: 'MID SEMESTER EXAMINATIONS', lecturer: '' }
            ],
            'Wednesday': [
                { time: '09:00', activity: 'MID SEMESTER EXAMINATIONS', lecturer: '' }
            ],
            'Thursday': [
                { time: '09:00', activity: 'MID SEMESTER EXAMINATIONS', lecturer: '' }
            ],
            'Friday': [
                { time: '09:00', activity: 'MID SEMESTER EXAMINATIONS', lecturer: '' }
            ]
        }
    },
    10: {
        days: {
            'Monday': [
                { time: '00:00', activity: 'MID SEMESTER BREAK', lecturer: '' }
            ],
            'Tuesday': [
                { time: '00:00', activity: 'MID SEMESTER BREAK', lecturer: '' }
            ],
            'Wednesday': [
                { time: '00:00', activity: 'MID SEMESTER BREAK', lecturer: '' }
            ],
            'Thursday': [
                { time: '00:00', activity: 'MID SEMESTER BREAK', lecturer: '' }
            ],
            'Friday': [
                { time: '00:00', activity: 'MID SEMESTER BREAK', lecturer: '' }
            ]
        }
    },
    11: {
        days: {
            'Monday': [
                { time: '09:00', activity: 'Shoulder region', lecturer: 'Dr. Manjatika' },
                { time: '11:00', activity: 'Epidemiology: descriptive epidemiology 1', lecturer: 'Dr Ndoliwe Chihana' },
                { time: '14:00', activity: 'Epidemiology: descriptive epidemiology 2', lecturer: 'Dr Ndoliwe Chihana' }
            ],
            'Tuesday': [
                { time: '09:00', activity: 'Shoulder joint', lecturer: 'Dr. Manjatika' },
                { time: '10:00', activity: 'Breast & pectoral region', lecturer: 'Dr. Manjatika' },
                { time: '14:00', activity: 'Bones of the upper limb DR – Guided Study', lecturer: 'Dr. Manjatika' }
            ],
            'Wednesday': [
                { time: '09:00', activity: 'Axilla & axillary vessels', lecturer: 'Dr. Manjatika' },
                { time: '11:00', activity: 'Statistics: hypothesis testing – means', lecturer: 'A Kumitawa' }
            ],
            'Thursday': [
                { time: '09:00', activity: 'Brachial plexus', lecturer: 'Dr. Manjatika' },
                { time: '10:00', activity: 'Introduction to chemical pathology I', lecturer: 'S. Nayupe' },
                { time: '11:00', activity: 'Introduction to chemical pathology II', lecturer: 'S. Nayupe' },
                { time: '14:00', activity: 'Practical: Pectoral region', lecturer: 'Dr. Manjatika / Matundu / Phiri' }
            ],
            'Friday': [
                { time: '09:00', activity: 'Clinical enzymology', lecturer: 'M. Mlozeni' },
                { time: '10:00', activity: 'Introduction to fungi', lecturer: 'Dr. R Mlakosya' }
            ]
        }
    },
    12: {
        days: {
            'Monday': [
                { time: '09:00', activity: 'Data analysis/interpretation of results - categorical', lecturer: 'A Kurnitawa' },
                { time: '10:00', activity: 'Structure of neurons/synapse (physiology)', lecturer: 'Dr. M Gwedela' },
                { time: '11:00', activity: 'Collagen diseases', lecturer: 'Dr. M Mulenga' },
                { time: '14:00', activity: 'Practical: Axilla', lecturer: 'Dr. Manjatika / Matundu / Phiri' }
            ],
            'Tuesday': [
                { time: '08:00', activity: 'Statistics: hypothesis testing – Chi Square Tests', lecturer: 'Emma Malonda' },
                { time: '10:00', activity: 'Introduction to breast cancer', lecturer: 'Dr. M Mulenga' },
                { time: '11:00', activity: 'Autoimmune diseases', lecturer: 'Dr. M Mulenga' },
                { time: '14:00', activity: 'Practical: Muscle types – anatomy (Histo)', lecturer: 'Dr. J Manda / Matundu / Phiri' }
            ],
            'Wednesday': [
                { time: '09:00', activity: 'Resting membrane potential', lecturer: 'Dr. M Gwedela' },
                { time: '11:00', activity: 'Infections of bone and joints 2 – histopathology', lecturer: 'Dr. M Mulenga' }
            ],
            'Thursday': [
                { time: '08:00', activity: 'Graded potential', lecturer: 'Dr. M Gwedeia' },
                { time: '09:00', activity: 'Tumour markers', lecturer: 'Dr. C Chingwanda' },
                { time: '11:00', activity: 'Correlation', lecturer: 'A Kumitawa' },
                { time: '14:00', activity: 'Practical: Bone tumours', lecturer: 'Dr. M Mulenga' }
            ],
            'Friday': [
                { time: '09:00', activity: 'Action potential', lecturer: 'Dr. M Gwedeia' },
                { time: '10:00', activity: 'Tumours of bone & cartilage', lecturer: 'Dr. M Mulenga' },
                { time: '11:00', activity: 'Tumours of bone & cartilage 2', lecturer: 'Dr. M Mulenga' }
            ]
        }
    },
    13: {
        days: {
            'Monday': [
                { time: '09:00', activity: 'Conduction of action potential by nerve fibers', lecturer: 'Dr. Mayeso Gwedela' },
                { time: '11:00', activity: 'Oxidation of fatty acids', lecturer: 'Dr. Jana' },
                { time: '14:00', activity: 'Introduction to antibiotics', lecturer: 'Prof C Msefula' }
            ],
            'Tuesday': [
                { time: '08:00', activity: 'Antibiotics acting on the cell wall', lecturer: 'Prof. C Msefula' },
                { time: '10:00', activity: 'Arm (anterior & posterior compartments)', lecturer: 'Dr. Manjatika' },
                { time: '11:00', activity: 'Introduction of autonomic system', lecturer: 'Dr. Mayeso Gwedela' },
                { time: '14:00', activity: 'Simple linear regression', lecturer: 'Dr. Jessie Khaki Sithole' }
            ],
            'Wednesday': [
                { time: '08:00', activity: 'ANS Function (normal, abnormal & lack of activity)', lecturer: 'Dr. Mayeso Gwedela' },
                { time: '09:00', activity: 'Antibiotics acting on protein synthesis', lecturer: 'Prof C Msefula' },
                { time: '10:00', activity: 'Forearm', lecturer: 'Dr. Manjatika' }
            ],
            'Thursday': [
                { time: '11:00', activity: 'Confidence interval', lecturer: 'Vincent Samuel' },
                { time: '14:00', activity: 'Practical: shoulder region', lecturer: 'Dr. Manjatika / Matundu / Phiri' }
            ],
            'Friday': [
                { time: '08:00', activity: 'Elbow & wrist', lecturer: 'Dr. A Mwakikunga' },
                { time: '09:00', activity: 'Muscle Types', lecturer: 'Dr. M Gwedela' },
                { time: '10:00', activity: 'Intro to parasitology – protozoa & helminths', lecturer: 'Prof C Msefula' },
                { time: '14:00', activity: 'Clinical skills – vital signs', lecturer: 'Dr. Yankho Zolwere' }
            ]
        }
    },
    14: {
        days: {
            'Monday': [
                { time: '09:00', activity: 'Neuromuscular Junction', lecturer: 'Dr. M Gwedela' },
                { time: '10:00', activity: 'Application of statistics to public health', lecturer: 'A Kumitawa' },
                { time: '11:00', activity: 'Introduction to virology', lecturer: 'Dr. Tonney Nyirenda' },
                { time: '14:00', activity: 'Demography 1: general population issues', lecturer: 'Dr. Paul Kawale' }
            ],
            'Tuesday': [
                { time: '09:00', activity: 'Twitch, summation & tetany', lecturer: 'Dr. M Gwedela' },
                { time: '10:00', activity: 'Hand 1', lecturer: 'Dr. Manjatika' },
                { time: '11:00', activity: 'Hand 2', lecturer: 'Dr. Manjatika' },
                { time: '14:00', activity: 'Practical on the arm', lecturer: 'Dr. Manjatika / Matundu / Phiri' }
            ],
            'Wednesday': [
                { time: '08:00', activity: 'Bias in study measurements', lecturer: 'Dr. Charles Mangani' },
                { time: '09:00', activity: 'Viral replication and major virus groups', lecturer: 'Dr. Tonney Nyirenda' },
                { time: '10:00', activity: 'Pharmacokinetic 1', lecturer: 'B Thuboy' },
                { time: '11:00', activity: 'Pharmacokinetics 2', lecturer: 'B Thuboy' }
            ],
            'Thursday': [
                { time: '08:00', activity: 'Brachial plexus injury and entire upper limb nerve lesions', lecturer: 'Dr. Manjatika' },
                { time: '10:00', activity: 'Development of the limbs', lecturer: 'Dr. Mwakikunga' },
                { time: '14:00', activity: 'Practical: Forearm', lecturer: 'Dr. Manjatika / Matundu / Phiri' }
            ],
            'Friday': [
                { time: '09:00', activity: 'Descriptive epidemiology – practical', lecturer: 'Prof V Mwapasa' },
                { time: '11:00', activity: 'Guided study: Back 1 – osteology', lecturer: 'T Kaledzera' },
                { time: '14:00', activity: 'Back 2 – muscles', lecturer: 'T Kaledzera' },
                { time: '15:00', activity: 'Microbial genetics', lecturer: 'Dr. David Chaima' }
            ]
        }
    },
    15: {
        days: {
            'Monday': [
                { time: '09:00', activity: 'Development of the back', lecturer: 'Dr. A Mwakikunga' },
                { time: '11:00', activity: 'Developing tools for conducting qualitative research', lecturer: 'Dr. Limbanazo Matandika' },
                { time: '14:00', activity: 'Spinal nerves/cauda equina', lecturer: 'T Kaledzera' }
            ],
            'Tuesday': [
                { time: '08:00', activity: 'Introduction to diagnostic microbiology', lecturer: 'Dr. D Kulapani' },
                { time: '10:00', activity: 'Muscle fatigue & cramps', lecturer: 'Dr. M Gwedela' },
                { time: '11:00', activity: 'Gluteal region', lecturer: 'T Kaledzera' }
            ],
            'Wednesday': [
                { time: '09:00', activity: 'Osteology of the lower limb', lecturer: 'T Kaledzera' },
                { time: '11:00', activity: 'Pharmacodynamics', lecturer: 'B Thuboy' }
            ],
            'Thursday': [
                { time: '09:00', activity: 'Back of thigh & popliteal fossa', lecturer: 'T Kaledzera' },
                { time: '11:00', activity: 'Prevention and control of infectious diseases', lecturer: 'Dr. David Kulapani' },
                { time: '14:00', activity: 'Medial compartment of the thigh', lecturer: 'T Kaledzera' }
            ],
            'Friday': [
                { time: '08:00', activity: 'Anterior compartment of thigh & femoral triangle', lecturer: 'T Kaledzera' },
                { time: '10:00', activity: 'ANS receptors – cholinergic (pharmacology)', lecturer: 'B Thuboy' },
                { time: '14:00', activity: 'Practical: Hand', lecturer: 'Dr. Manjatika / Matundu / Phiri' }
            ]
        }
    },
    16: {
        days: {
            'Monday': [
                { time: '09:00', activity: 'Excitation - contraction coupling: skeletal, cardiac & smooth', lecturer: 'Dr. Mayeso Gwedela' },
                { time: '11:00', activity: 'Dystrophies', lecturer: 'Dr. M Mulenga' },
                { time: '14:00', activity: 'Practical: Diagnostic microbiology', lecturer: 'Dr. David Kulpani' }
            ],
            'Tuesday': [
                { time: '09:00', activity: 'Anterior compartment of leg & dorsum of foot', lecturer: 'T Kaledzera' },
                { time: '11:00', activity: 'ANS receptors – adrenergic (pharmacology)', lecturer: 'B. Thuboy' },
                { time: '14:00', activity: 'Practical: Front of thigh including femoral triangle', lecturer: 'T Kaledzera / Matundu / Phiri' }
            ],
            'Wednesday': [
                { time: '09:00', activity: 'Mechanism of antibiotics resistance', lecturer: 'Dr. D Kulpani' },
                { time: '10:00', activity: 'Knee Joint', lecturer: 'T Kaledzera' },
                { time: '11:00', activity: 'Demography 2: census methods', lecturer: 'Dr. Paul Kawale' },
                { time: '14:00', activity: 'Muscle tumors', lecturer: 'Dr. M Mulenga' },
                { time: '15:00', activity: 'Inflammatory muscle disorders', lecturer: 'Dr. M Mulenga' }
            ],
            'Thursday': [
                { time: '08:00', activity: 'Hip Joint', lecturer: 'T Kaledzera' },
                { time: '10:00', activity: 'Approach to a limping child', lecturer: 'Dr. Tadala M\'mela' },
                { time: '11:00', activity: 'Anatomy of the anterior & lateral compartment of the leg', lecturer: 'Dr. J Manda' },
                { time: '14:00', activity: 'Practical: gluteal region, back of thigh, popliteal fossa', lecturer: 'T Kaledzera / Matundu / Phiri' }
            ],
            'Friday': [
                { time: '08:00', activity: 'Tools for conducting surveys', lecturer: 'Vincent Samuel' },
                { time: '10:00', activity: 'Approach to a child with joint swelling', lecturer: 'Dr. Tadala M\'mela' },
                { time: '11:00', activity: 'Phaeochromocytoma/paraganglioma', lecturer: 'Dr M Mulenga' },
                { time: '14:00', activity: 'Autonomic neuropathies', lecturer: 'Dr. M Mulenga' }
            ]
        }
    },
    17: {
        days: {
            'Monday': [
                { time: '09:00', activity: 'Posterior compartment and sole of foot', lecturer: 'Dr. Manjatika' },
                { time: '11:00', activity: 'Peripheral nerve anatomy & nerve lesions of the lower limb', lecturer: 'Dr. J Manda' },
                { time: '14:00', activity: 'Simple linear regression using Epi info: Practical', lecturer: 'Vincent Samuel' }
            ],
            'Tuesday': [
                { time: '08:00', activity: 'Case study on protease inhibitor & link to plasma lipids', lecturer: 'Dr. M Sande' },
                { time: '09:00', activity: 'Demography: fertility', lecturer: 'Dr. Paul Kawale' },
                { time: '11:00', activity: 'Gait', lecturer: 'W. Pihri' },
                { time: '14:00', activity: 'Clinical skills - lower extremities examination (joint and surface examination)', lecturer: 'Dr. Yankho Zolwere' }
            ],
            'Wednesday': [
                { time: '09:00', activity: 'Community health', lecturer: 'Dr. Tinashe Tizifa' },
                { time: '10:00', activity: 'Clinical examination of the joints', lecturer: 'Dr. Charles Sungani' }
            ],
            'Thursday': [
                { time: '09:00', activity: 'Infections of the bone & joints 1', lecturer: 'Dr. D Kulapani' },
                { time: '14:00', activity: 'Clinical skills - upper extremities examination (joint & surface examination)', lecturer: 'Dr. Yankho Zolowere' }
            ],
            'Friday': [
                { time: '08:00', activity: 'Community health: Practical', lecturer: 'Dr. Tinashe Tizifa' },
                { time: '14:00', activity: 'Practical: Data analysis using Epi info/Stata', lecturer: 'Dr. Jessie Khaki Sothole / Vincent Samuel' }
            ]
        }
    },
    18: {
        days: {
            'Monday': [
                { time: '08:00', activity: 'Remodeling and fracture healing', lecturer: 'Dr. Charles Sungani' },
                { time: '10:00', activity: 'Diseases of the back in Malawi (TB, degenerative, malignant)', lecturer: 'Dr. K Mwafulirwa' },
                { time: '14:00', activity: 'Local anaesthetic', lecturer: 'Dr. Hope Mabinba' }
            ],
            'Tuesday': [
                { time: '08:00', activity: 'Congenital muscle & bone disorders', lecturer: 'Dr. Charles Sungani' },
                { time: '09:00', activity: 'Organophosphate poisoning & antidote', lecturer: 'Dr. Chikondi Mwale' },
                { time: '10:00', activity: 'Surgical treatment of bone and joint infection', lecturer: 'Dr. C. Sungani' },
                { time: '14:00', activity: 'OSPE Sample', lecturer: 'Dr. Sylvester Chabunya (Yr. Coordinator)' }
            ],
            'Wednesday': [
                { time: '08:00', activity: 'MAKE-UP CLASSES/REVISION', lecturer: '' }
            ],
            'Thursday': [
                { time: '08:00', activity: 'PUBLIC HOLIDAY', lecturer: '' }
            ],
            'Friday': [
                { time: '08:00', activity: 'MAKE-UP CLASSES/REVISION', lecturer: '' }
            ]
        }
    },
    19: {
        days: {
            'Monday': [
                { time: '08:00', activity: 'WEEK OF PEACE/STUDY WEEK', lecturer: '' }
            ],
            'Tuesday': [
                { time: '08:00', activity: 'WEEK OF PEACE/STUDY WEEK', lecturer: '' }
            ],
            'Wednesday': [
                { time: '08:00', activity: 'WEEK OF PEACE/STUDY WEEK', lecturer: '' }
            ],
            'Thursday': [
                { time: '08:00', activity: 'WEEK OF PEACE/STUDY WEEK', lecturer: '' }
            ],
            'Friday': [
                { time: '08:00', activity: 'WEEK OF PEACE/STUDY WEEK', lecturer: '' }
            ]
        }
    }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TIMETABLE_DATA;
}