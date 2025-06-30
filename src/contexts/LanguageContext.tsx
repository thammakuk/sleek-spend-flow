
import { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'ml' | 'kn' | 'gu' | 'mr' | 'bn' | 'pa';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    history: 'History',
    insights: 'Insights',
    budgets: 'Budgets',
    settings: 'Settings',
    
    // Common
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    update: 'Update',
    create: 'Create',
    amount: 'Amount',
    description: 'Description',
    category: 'Category',
    date: 'Date',
    
    // Expenses
    addExpense: 'Add Expense',
    totalSpent: 'Total Spent',
    recentExpenses: 'Recent Expenses',
    expenseHistory: 'Expense History',
    
    // Budget
    budgetManager: 'Budget Manager',
    addBudget: 'Add Budget',
    createBudget: 'Create Budget',
    editBudget: 'Edit Budget',
    budgetLimit: 'Budget Limit',
    monthly: 'Monthly',
    yearly: 'Yearly',
    overallBudget: 'Overall Budget',
    budgetProgress: 'Budget Progress',
    
    // Settings
    language: 'Language',
    profile: 'Profile',
    logout: 'Logout',
  },
  hi: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    history: 'इतिहास',
    insights: 'अंतर्दृष्टि',
    budgets: 'बजट',
    settings: 'सेटिंग्स',
    
    // Common
    add: 'जोड़ें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    update: 'अपडेट करें',
    create: 'बनाएं',
    amount: 'राशि',
    description: 'विवरण',
    category: 'श्रेणी',
    date: 'तारीख',
    
    // Expenses
    addExpense: 'खर्च जोड़ें',
    totalSpent: 'कुल खर्च',
    recentExpenses: 'हाल के खर्च',
    expenseHistory: 'खर्च इतिहास',
    
    // Budget
    budgetManager: 'बजट प्रबंधक',
    addBudget: 'बजट जोड़ें',
    createBudget: 'बजट बनाएं',
    editBudget: 'बजट संपादित करें',
    budgetLimit: 'बजट सीमा',
    monthly: 'मासिक',
    yearly: 'वार्षिक',
    overallBudget: 'समग्र बजट',
    budgetProgress: 'बजट प्रगति',
    
    // Settings
    language: 'भाषा',
    profile: 'प्रोफ़ाइल',
    logout: 'लॉगआउट',
  },
  ta: {
    // Navigation
    dashboard: 'டாஷ்போர்டு',
    history: 'வரலாறு',
    insights: 'நுண்ணறிவு',
    budgets: 'பட்ஜெட்',
    settings: 'அமைப்புகள்',
    
    // Common
    add: 'சேர்க்கவும்',
    edit: 'திருத்து',
    delete: 'நீக்கு',
    cancel: 'ரத்து செய்',
    save: 'சேமி',
    update: 'புதுப்பிக்கவும்',
    create: 'உருவாக்கு',
    amount: 'தொகை',
    description: 'விளக்கம்',
    category: 'வகை',
    date: 'தேதி',
    
    // Expenses
    addExpense: 'செலவு சேர்க்கவும்',
    totalSpent: 'மொத்த செலவு',
    recentExpenses: 'சமீபத்திய செலவுகள்',
    expenseHistory: 'செலவு வரலாறு',
    
    // Budget
    budgetManager: 'பட்ஜெட் மேலாளர்',
    addBudget: 'பட்ஜெட் சேர்க்கவும்',
    createBudget: 'பட்ஜெட் உருவாக்கு',
    editBudget: 'பட்ஜெட் திருத்து',
    budgetLimit: 'பட்ஜெட் வரம்பு',
    monthly: 'மாதாந்திர',
    yearly: 'வருடாந்திர',
    overallBudget: 'ஒட்டுமொத்த பட்ஜெட்',
    budgetProgress: 'பட்ஜெட் முன்னேற்றம்',
    
    // Settings
    language: 'மொழி',
    profile: 'சுயவிவரം',
    logout: 'வெளியேறு',
  },
  te: {
    // Navigation
    dashboard: 'డాష్‌బోర్డ్',
    history: 'చరిత్ర',
    insights: 'అంతర్దృష్టులు',
    budgets: 'బడ్జెట్‌లు',
    settings: 'సెట్టింగ్‌లు',
    
    // Common
    add: 'జోడించు',
    edit: 'సవరించు',
    delete: 'తొలగించు',
    cancel: 'రద్దు చేయి',
    save: 'సేవ్ చేయి',
    update: 'అప్‌డేట్ చేయి',
    create: 'సృష్టించు',
    amount: 'మొత్తం',
    description: 'వివరణ',
    category: 'వర్గం',
    date: 'తేదీ',
    
    // Expenses
    addExpense: 'ఖర్చు జోడించు',
    totalSpent: 'మొత్తం ఖర్చు',
    recentExpenses: 'ఇటీవలి ఖర్చులు',
    expenseHistory: 'ఖర్చుల చరిత్ర',
    
    // Budget
    budgetManager: 'బడ్జెట్ మేనేజర్',
    addBudget: 'బడ్జెట్ జోడించు',
    createBudget: 'బడ్జెట్ సృష్టించు',
    editBudget: 'బడ్జెట్ సవరించు',
    budgetLimit: 'బడ్జెట్ పరిమితి',
    monthly: 'నెలవారీ',
    yearly: 'వార్షిక',
    overallBudget: 'మొత్తం బడ్జెట్',
    budgetProgress: 'బడ్జెట్ పురోగతి',
    
    // Settings
    language: 'భాష',
    profile: 'ప్రొఫైల్',
    logout: 'లాగ్ అవుట్',
  },
  ml: {
    // Navigation
    dashboard: 'ഡാഷ്ബോർഡ്',
    history: 'ചരിത്രം',
    insights: 'ഉൾക്കാഴ്ചകൾ',
    budgets: 'ബഡ്ജറ്റുകൾ',
    settings: 'ക്രമീകരണങ്ങൾ',
    
    // Common
    add: 'ചേർക്കുക',
    edit: 'എഡിറ്റ് ചെയ്യുക',
    delete: 'ഇല്ലാതാക്കുക',
    cancel: 'റദ്ദാക്കുക',
    save: 'സംരക്ഷിക്കുക',
    update: 'അപ്ഡേറ്റ് ചെയ്യുക',
    create: 'സൃഷ്ടിക്കുക',
    amount: 'തുക',
    description: 'വിവരണം',
    category: 'വിഭാഗം',
    date: 'തീയതി',
    
    // Expenses
    addExpense: 'ചെലവ് ചേർക്കുക',
    totalSpent: 'മൊത്തം ചെലവ്',
    recentExpenses: 'സമീപകാല ചെലവുകൾ',
    expenseHistory: 'ചെലവ് ചരിത്രം',
    
    // Budget
    budgetManager: 'ബഡ്ജറ്റ് മാനേജർ',
    addBudget: 'ബഡ്ജറ്റ് ചേർക്കുക',
    createBudget: 'ബഡ്ജറ്റ് സൃഷ്ടിക്കുക',
    editBudget: 'ബഡ്ജറ്റ് എഡിറ്റ് ചെയ്യുക',
    budgetLimit: 'ബഡ്ജറ്റ് പരിധി',
    monthly: 'മാസിക',
    yearly: 'വാർഷിക',
    overallBudget: 'മൊത്തത്തിലുള്ള ബഡ്ജറ്റ്',
    budgetProgress: 'ബഡ്ജറ്റ് പുരോഗതി',
    
    // Settings
    language: 'ഭാഷ',
    profile: 'പ്രൊഫൈൽ',
    logout: 'ലോഗ് ഔട്ട്',
  },
  kn: {
    // Navigation
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    history: 'ಇತಿಹಾಸ',
    insights: 'ಒಳನೋಟಗಳು',
    budgets: 'ಬಜೆಟ್‌ಗಳು',
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    
    // Common
    add: 'ಸೇರಿಸಿ',
    edit: 'ಸಂಪಾದಿಸಿ',
    delete: 'ಅಳಿಸಿ',
    cancel: 'ರದ್ದುಗೊಳಿಸಿ',
    save: 'ಉಳಿಸಿ',
    update: 'ನವೀಕರಿಸಿ',
    create: 'ರಚಿಸಿ',
    amount: 'ಮೊತ್ತ',
    description: 'ವಿವರಣೆ',
    category: 'ವರ್ಗ',
    date: 'ದಿನಾಂಕ',
    
    // Expenses
    addExpense: 'ವೆಚ್ಚವನ್ನು ಸೇರಿಸಿ',
    totalSpent: 'ಒಟ್ಟು ವೆಚ್ಚ',
    recentExpenses: 'ಇತ್ತೀಚಿನ ವೆಚ್ಚಗಳು',
    expenseHistory: 'ವೆಚ್ಚದ ಇತಿಹಾಸ',
    
    // Budget
    budgetManager: 'ಬಜೆಟ್ ಮ್ಯಾನೇಜರ್',
    addBudget: 'ಬಜೆಟ್ ಸೇರಿಸಿ',
    createBudget: 'ಬಜೆಟ್ ರಚಿಸಿ',
    editBudget: 'ಬಜೆಟ್ ಸಂಪಾದಿಸಿ',
    budgetLimit: 'ಬಜೆಟ್ ಮಿತಿ',
    monthly: 'ಮಾಸಿಕ',
    yearly: 'ವಾರ್ಷಿಕ',
    overallBudget: 'ಒಟ್ಟಾರೆ ಬಜೆಟ್',
    budgetProgress: 'ಬಜೆಟ್ ಪ್ರಗತಿ',
    
    // Settings
    language: 'ಭಾಷೆ',
    profile: 'ಪ್ರೊಫೈಲ್',
    logout: 'ಲಾಗ್ ಔಟ್',
  },
  gu: {
    // Navigation
    dashboard: 'ડેશબોર્ડ',
    history: 'ઇતિહાસ',
    insights: 'સૂઝ',
    budgets: 'બજેટ',
    settings: 'સેટિંગ્સ',
    
    // Common
    add: 'ઉમેરો',
    edit: 'સંપાદિત કરો',
    delete: 'ડિલીટ કરો',
    cancel: 'રદ કરો',
    save: 'સેવ કરો',
    update: 'અપડેટ કરો',
    create: 'બનાવો',
    amount: 'રકમ',
    description: 'વર્ણન',
    category: 'શ્રેણી',
    date: 'તારીખ',
    
    // Expenses
    addExpense: 'ખર્ચ ઉમેરો',
    totalSpent: 'કુલ ખર્ચ',
    recentExpenses: 'તાજેતરના ખર્ચ',
    expenseHistory: 'ખર્ચનો ઇતિહાસ',
    
    // Budget
    budgetManager: 'બજેટ મેનેજર',
    addBudget: 'બજેટ ઉમેરો',
    createBudget: 'બજેટ બનાવો',
    editBudget: 'બજેટ સંપાદિત કરો',
    budgetLimit: 'બજેટ મર્યાદા',
    monthly: 'માસિક',
    yearly: 'વાર્ષિક',
    overallBudget: 'એકંદર બજેટ',
    budgetProgress: 'બજેટ પ્રગતિ',
    
    // Settings
    language: 'ભાષા',
    profile: 'પ્રોફાઇલ',
    logout: 'લોગ આઉટ',
  },
  mr: {
    // Navigation
    dashboard: 'डॅशबोर्ड',
    history: 'इतिहास',
    insights: 'अंतर्दृष्टी',
    budgets: 'बजेट',
    settings: 'सेटिंग्ज',
    
    // Common
    add: 'जोडा',
    edit: 'संपादित करा',
    delete: 'हटवा',
    cancel: 'रद्द करा',  
    save: 'जतन करा',
    update: 'अपडेट करा',
    create: 'तयार करा',
    amount: 'रक्कम',
    description: 'वर्णन',
    category: 'श्रेणी',
    date: 'तारीख',
    
    // Expenses
    addExpense: 'खर्च जोडा',
    totalSpent: 'एकूण खर्च',
    recentExpenses: 'अलीकडील खर्च',
    expenseHistory: 'खर्चाचा इतिहास',
    
    // Budget
    budgetManager: 'बजेट व्यवस्थापक',
    addBudget: 'बजेट जोडा',
    createBudget: 'बजेट तयार करा',
    editBudget: 'बजेट संपादित करा',
    budgetLimit: 'बजेट मर्यादा',
    monthly: 'मासिक',
    yearly: 'वार्षिक',
    overallBudget: 'एकूण बजेट',
    budgetProgress: 'बजेट प्रगती',
    
    // Settings
    language: 'भाषा',
    profile: 'प्रोफाइल',
    logout: 'लॉग आउट',
  },
  bn: {
    // Navigation
    dashboard: 'ড্যাশবোর্ড',
    history: 'ইতিহাস',
    insights: 'অন্তর্দৃষ্টি',
    budgets: 'বাজেট',
    settings: 'সেটিংস',
    
    // Common
    add: 'যোগ করুন',
    edit: 'সম্পাদনা করুন',
    delete: 'মুছে ফেলুন',
    cancel: 'বাতিল করুন',
    save: 'সংরক্ষণ করুন',
    update: 'আপডেট করুন', 
    create: 'তৈরি করুন',
    amount: 'পরিমাণ',
    description: 'বিবরণ',
    category: 'শ্রেণী',
    date: 'তারিখ',
    
    // Expenses
    addExpense: 'খরচ যোগ করুন',
    totalSpent: 'মোট খরচ',
    recentExpenses: 'সাম্প্রতিক খরচ',
    expenseHistory: 'খরচের ইতিহাস',
    
    // Budget
    budgetManager: 'বাজেট ম্যানেজার',
    addBudget: 'বাজেট যোগ করুন',
    createBudget: 'বাজেট তৈরি করুন',
    editBudget: 'বাজেট সম্পাদনা করুন',
    budgetLimit: 'বাজেট সীমা',
    monthly: 'মাসিক',
    yearly: 'বার্ষিক',
    overallBudget: 'সামগ্রিক বাজেট',
    budgetProgress: 'বাজেট অগ্রগতি',
    
    // Settings
    language: 'ভাষা',
    profile: 'প্রোফাইল',
    logout: 'লগ আউট',
  },
  pa: {
    // Navigation
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    history: 'ਇਤਿਹਾਸ',
    insights: 'ਸੂਝ',
    budgets: 'ਬਜਟ',
    settings: 'ਸੈਟਿੰਗਾਂ',
    
    // Common
    add: 'ਸ਼ਾਮਲ ਕਰੋ',
    edit: 'ਸੰਪਾਦਿਤ ਕਰੋ',
    delete: 'ਮਿਟਾਓ',
    cancel: 'ਰੱਦ ਕਰੋ',
    save: 'ਸੇਵ ਕਰੋ',
    update: 'ਅਪਡੇਟ ਕਰੋ',
    create: 'ਬਣਾਓ',
    amount: 'ਰਕਮ',
    description: 'ਵਰਣਨ',
    category: 'ਸ਼੍ਰੇਣੀ',
    date: 'ਤਾਰੀਖ',
    
    // Expenses
    addExpense: 'ਖਰਚ ਸ਼ਾਮਲ ਕਰੋ',
    totalSpent: 'ਕੁੱਲ ਖਰਚ',
    recentExpenses: 'ਤਾਜ਼ਾ ਖਰਚੇ',
    expenseHistory: 'ਖਰਚ ਇਤਿਹਾਸ',
    
    // Budget
    budgetManager: 'ਬਜਟ ਮੈਨੇਜਰ',
    addBudget: 'ਬਜਟ ਸ਼ਾਮਲ ਕਰੋ',
    createBudget: 'ਬਜਟ ਬਣਾਓ',
    editBudget: 'ਬਜਟ ਸੰਪਾਦਿਤ ਕਰੋ',
    budgetLimit: 'ਬਜਟ ਸੀਮਾ',
    monthly: 'ਮਾਸਿਕ',
    yearly: 'ਸਾਲਾਨਾ',
    overallBudget: 'ਸਮੁੱਚਾ ਬਜਟ',
    budgetProgress: 'ਬਜਟ ਪ੍ਰਗਤੀ',
    
    // Settings
    language: 'ਭਾਸ਼ਾ',
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    logout: 'ਲੌਗ ਆਊਟ',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('expense-tracker-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('expense-tracker-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
