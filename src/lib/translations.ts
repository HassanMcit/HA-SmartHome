// ─── Central Translations File ─────────────────────────────────────────────
// All UI strings for Arabic (ar) and English (en)

export type Lang = 'ar' | 'en';

const translations = {
  // ─── Navigation ──────────────────────────────────────────────────────────
  nav_home: { ar: 'الرئيسية', en: 'Home' },
  nav_transactions: { ar: 'المعاملات', en: 'Transactions' },
  nav_budgets: { ar: 'الميزانية', en: 'Budget' },
  nav_savings: { ar: 'الادخار', en: 'Savings' },
  nav_bills: { ar: 'الفواتير', en: 'Bills' },
  nav_reminders: { ar: 'ذكّرني', en: 'Reminders' },
  nav_split: { ar: 'شيل معايا', en: 'Split Bill' },
  nav_ai: { ar: 'تحليل ذكي', en: 'AI Analysis' },
  nav_admin: { ar: 'لوحة التحكم', en: 'Admin Panel' },
  nav_settings: { ar: 'الإعدادات', en: 'Settings' },
  nav_logout: { ar: 'تسجيل الخروج', en: 'Logout' },
  nav_management: { ar: 'الإدارة', en: 'Management' },
  nav_main: { ar: 'الرئيسية', en: 'Main' },
  nav_more: { ar: 'المزيد', en: 'More' },
  nav_more_menu: { ar: 'القائمة الإضافية', en: 'Additional Menu' },

  // ─── Theme & Language ─────────────────────────────────────────────────────
  theme_light: { ar: 'الوضع الفاتح', en: 'Light Mode' },
  theme_dark: { ar: 'الوضع الداكن', en: 'Dark Mode' },
  lang_switch_to_en: { ar: 'English', en: 'عربي' },

  // ─── App Name ─────────────────────────────────────────────────────────────
  app_name: { ar: 'مدبّر', en: 'Mudabber' },
  app_subtitle: { ar: 'إدارة المنزل', en: 'Home Management' },
  app_tagline: { ar: 'مدير النظام', en: 'System Admin' },

  // ─── Dashboard Home ───────────────────────────────────────────────────────
  dashboard_title: { ar: 'الرئيسية', en: 'Dashboard' },
  dashboard_subtitle: { ar: 'نظرة عامة على نشاطك المالي هذا الشهر', en: 'Overview of your financial activity this month' },
  welcome: { ar: 'مرحباً', en: 'Welcome' },
  loading: { ar: 'جاري التحميل', en: 'Loading' },

  // Stats Cards
  total_balance: { ar: 'إجمالي الرصيد', en: 'Total Balance' },
  income_this_month: { ar: 'الدخل هذا الشهر', en: 'Income This Month' },
  expenses_this_month: { ar: 'المصروفات هذا الشهر', en: 'Expenses This Month' },

  // Bills alert
  bills_alert_title: { ar: 'تنبيه فواتير مستحقة!', en: 'Unpaid Bills Alert!' },
  bills_alert_desc_1: { ar: 'لديك', en: 'You have' },
  bills_alert_desc_2: { ar: 'فواتير تنتظر الدفع، بإجمالي', en: 'bills waiting for payment, totaling' },
  bills_pay_now: { ar: 'سدد الآن', en: 'Pay Now' },

  // Panels
  recent_transactions: { ar: 'أحدث المعاملات', en: 'Recent Transactions' },
  no_recent_transactions: { ar: 'لا توجد معاملات حديثة', en: 'No recent transactions' },
  expense_breakdown: { ar: 'توزيع المصروفات', en: 'Expense Breakdown' },
  no_expense_data: { ar: 'لا توجد بيانات مصروفات', en: 'No expense data' },
  of_total: { ar: 'من الإجمالي', en: 'of total' },
  data_load_error: { ar: 'حدث خطأ في تحميل البيانات', en: 'Error loading data' },

  // ─── Admin Panel ──────────────────────────────────────────────────────────
  admin_title: { ar: 'لوحة الإدارة', en: 'Admin Panel' },
  admin_subtitle: { ar: 'إدارة المستخدمين وطلبات التسجيل', en: 'Manage users and registration requests' },
  admin_total_users: { ar: 'إجمالي المستخدمين', en: 'Total Users' },
  admin_pending: { ar: 'طلبات معلقة', en: 'Pending Requests' },
  admin_family_income: { ar: 'دخل العائلة', en: 'Family Income' },
  admin_family_expenses: { ar: 'مصروفات العائلة', en: 'Family Expenses' },
  admin_current_users: { ar: 'المستخدمين الحاليين', en: 'Current Users' },
  admin_no_users: { ar: 'لا يوجد مستخدمين', en: 'No users found' },
  admin_role_badge: { ar: 'مدير', en: 'Admin' },
  admin_pending_requests: { ar: 'طلبات التسجيل المعلقة', en: 'Pending Registration Requests' },
  admin_no_pending: { ar: 'لا توجد طلبات معلقة', en: 'No pending requests' },
  admin_approve: { ar: 'قبول', en: 'Approve' },
  admin_reject: { ar: 'رفض', en: 'Reject' },
  admin_promote: { ar: 'ترقية', en: 'Promote' },
  admin_demote: { ar: 'عزله', en: 'Demote' },
  admin_reset_codes_title: { ar: 'أكواد استعادة كلمة المرور النشطة', en: 'Active Password Reset Codes' },
  admin_expires: { ar: 'ينتهي', en: 'Expires' },
  admin_past_requests: { ar: 'سجل الطلبات السابقة', en: 'Past Requests History' },
  admin_no_history: { ar: 'لا يوجد سجل', en: 'No history' },
  admin_status_approved: { ar: 'مقبول', en: 'Approved' },
  admin_status_rejected: { ar: 'مرفوض', en: 'Rejected' },
  admin_unauthorized: { ar: 'غير مصرح', en: 'Unauthorized' },
  admin_unauthorized_msg: { ar: 'هذه الصفحة مخصصة لمدير النظام فقط', en: 'This page is for system admins only' },
  admin_resend_welcome: { ar: 'إعادة إرسال دليل الترحيب', en: 'Resend Welcome Guide' },
  admin_forgot_password: { ar: 'إرسال كود استعادة كلمة المرور', en: 'Send Password Reset Code' },
  admin_send_eid_email: { ar: 'إرسال تهنئة عيد الأضحى', en: 'Send Eid Al-Adha Greetings' },
  admin_send_eid_desc: { ar: 'إرسال تهنئة عيد الأضحى المبارك مع شرح الميزات الجديدة لجميع مستخدمي النظام الحاليين عبر البريد الإلكتروني.', en: 'Send Eid Al-Adha congratulations email with explanations of new features to all current system users via email.' },

  // ─── Login Page ───────────────────────────────────────────────────────────
  login_title: { ar: 'تسجيل الدخول', en: 'Login' },
  login_welcome: { ar: 'مرحباً بعودتك', en: 'Welcome Back' },
  login_subtitle: { ar: 'سجّل دخولك للمتابعة', en: 'Sign in to continue' },
  login_email: { ar: 'البريد الإلكتروني', en: 'Email Address' },
  login_password: { ar: 'كلمة المرور', en: 'Password' },
  login_btn: { ar: 'تسجيل الدخول', en: 'Sign In' },
  login_forgot: { ar: 'نسيت كلمة المرور؟', en: 'Forgot password?' },
  login_no_account: { ar: 'ليس لديك حساب؟', en: "Don't have an account?" },
  login_register: { ar: 'اطلب الانضمام', en: 'Request to Join' },
  login_error: { ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة', en: 'Invalid email or password' },

  // ─── Transactions ─────────────────────────────────────────────────────────
  transactions_title: { ar: 'المعاملات', en: 'Transactions' },
  transactions_subtitle: { ar: 'سجل جميع المعاملات المالية', en: 'All financial transactions record' },
  add_income: { ar: 'إضافة دخل', en: 'Add Income' },
  add_expense: { ar: 'إضافة مصروف', en: 'Add Expense' },
  income: { ar: 'دخل', en: 'Income' },
  expense: { ar: 'مصروف', en: 'Expense' },
  amount: { ar: 'المبلغ', en: 'Amount' },
  category: { ar: 'الفئة', en: 'Category' },
  description: { ar: 'الوصف', en: 'Description' },
  date: { ar: 'التاريخ', en: 'Date' },
  save: { ar: 'حفظ', en: 'Save' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  delete: { ar: 'حذف', en: 'Delete' },
  edit: { ar: 'تعديل', en: 'Edit' },
  no_transactions: { ar: 'لا توجد معاملات', en: 'No transactions found' },

  // ─── Budgets ──────────────────────────────────────────────────────────────
  budgets_title: { ar: 'الميزانية', en: 'Budget' },
  budgets_subtitle: { ar: 'تحكم في إنفاقك الشهري', en: 'Control your monthly spending' },
  add_budget: { ar: 'إضافة ميزانية', en: 'Add Budget' },
  no_budgets: { ar: 'لا توجد ميزانيات', en: 'No budgets set' },
  spent: { ar: 'المنفق', en: 'Spent' },
  remaining: { ar: 'المتبقي', en: 'Remaining' },

  // ─── Savings ──────────────────────────────────────────────────────────────
  savings_title: { ar: 'الادخار', en: 'Savings' },
  savings_subtitle: { ar: 'أهدافك الادخارية', en: 'Your savings goals' },
  add_saving: { ar: 'هدف جديد', en: 'New Goal' },
  no_savings: { ar: 'لا توجد أهداف ادخار', en: 'No savings goals' },
  target: { ar: 'الهدف', en: 'Target' },
  current: { ar: 'المحقق', en: 'Achieved' },
  deposit: { ar: 'إيداع', en: 'Deposit' },

  // ─── Bills ────────────────────────────────────────────────────────────────
  bills_title: { ar: 'الفواتير', en: 'Bills' },
  bills_subtitle: { ar: 'إدارة الفواتير والالتزامات', en: 'Manage bills and commitments' },
  add_bill: { ar: 'إضافة فاتورة', en: 'Add Bill' },
  no_bills: { ar: 'لا توجد فواتير', en: 'No bills' },
  due_date: { ar: 'تاريخ الاستحقاق', en: 'Due Date' },
  paid: { ar: 'مدفوع', en: 'Paid' },
  unpaid: { ar: 'غير مدفوع', en: 'Unpaid' },
  recurring: { ar: 'متكرر', en: 'Recurring' },

  // ─── Reminders ────────────────────────────────────────────────────────────
  reminders_title: { ar: 'التذكيرات', en: 'Reminders' },
  reminders_subtitle: { ar: 'مهامك وتذكيراتك', en: 'Your tasks and reminders' },
  add_reminder: { ar: 'إضافة تذكير', en: 'Add Reminder' },
  no_reminders: { ar: 'لا توجد تذكيرات', en: 'No reminders' },

  // ─── AI Analysis ──────────────────────────────────────────────────────────
  ai_title: { ar: 'التحليل الذكي', en: 'AI Analysis' },
  ai_subtitle: { ar: 'تقرير ذكي لمصروفاتك', en: 'Smart report on your expenses' },

  // ─── Settings ─────────────────────────────────────────────────────────────
  settings_title: { ar: 'الإعدادات', en: 'Settings' },
  settings_subtitle: { ar: 'إدارة حسابك وتفضيلاتك', en: 'Manage your account and preferences' },
  settings_name: { ar: 'الاسم', en: 'Full Name' },
  settings_email: { ar: 'البريد الإلكتروني', en: 'Email' },
  settings_change_password: { ar: 'تغيير كلمة المرور', en: 'Change Password' },
  settings_current_password: { ar: 'كلمة المرور الحالية', en: 'Current Password' },
  settings_new_password: { ar: 'كلمة المرور الجديدة', en: 'New Password' },
  settings_save: { ar: 'حفظ التغييرات', en: 'Save Changes' },
  settings_avatar: { ar: 'الصورة الشخصية', en: 'Profile Photo' },

  // ─── Common ───────────────────────────────────────────────────────────────
  confirm: { ar: 'تأكيد', en: 'Confirm' },
  close: { ar: 'إغلاق', en: 'Close' },
  search: { ar: 'بحث', en: 'Search' },
  filter: { ar: 'تصفية', en: 'Filter' },
  all: { ar: 'الكل', en: 'All' },
  error_server: { ar: 'حدث خطأ في الخادم', en: 'Server error occurred' },
  unknown_user: { ar: 'مستخدم غير معروف', en: 'Unknown user' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key]?.[lang] ?? key;
}

export default translations;
