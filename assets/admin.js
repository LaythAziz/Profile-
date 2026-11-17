import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const SUPABASE_URL = 'https://nbqvdvtaqvfwkcvmhled.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_0CUY19touCOxCcF6hu7sFQ_MIMxNmRn';
const OWNER_EMAIL = 'laythaziz.3@gmail.com';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const requestForm = document.querySelector('#request-form');
const verifyForm = document.querySelector('#verify-form');
const feedback = document.querySelector('#feedback');
const sendButton = document.querySelector('#send-code');
const verifyButton = document.querySelector('#verify-code');
const resendButton = document.querySelector('#resend-code');
const otpInput = document.querySelector('#otp');

function message(text, error = false) {
  feedback.textContent = text;
  feedback.classList.toggle('error', error);
}
function busy(button, value) { button.disabled = value; }

async function sendCode() {
  busy(sendButton, true);
  message('جارٍ إرسال رمز التحقق إلى Gmail…');
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: OWNER_EMAIL,
      options: { shouldCreateUser: true }
    });
    if (error) throw error;
    requestForm.hidden = true;
    verifyForm.hidden = false;
    otpInput.focus();
    message('إذا كان البريد مهيأً لاستقبال رسائل المشروع، ستصلك رسالة تحتوي رمزاً من 6 أرقام. تحقق أيضاً من Spam.');
  } catch (error) {
    message(error.message || 'تعذر إرسال الرمز. تحقق من إعدادات البريد وحاول لاحقاً.', true);
  } finally { busy(sendButton, false); }
}

requestForm.addEventListener('submit', event => { event.preventDefault(); sendCode(); });
resendButton.addEventListener('click', sendCode);

verifyForm.addEventListener('submit', async event => {
  event.preventDefault();
  const token = otpInput.value.trim();
  if (!/^\d{6}$/.test(token)) return message('أدخل رمز التحقق المكوّن من 6 أرقام.', true);
  busy(verifyButton, true);
  message('جارٍ التحقق من الرمز والصلاحيات…');
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: OWNER_EMAIL,
      token,
      type: 'email'
    });
    if (error) throw error;
    if (!data.user || data.user.email?.toLowerCase() !== OWNER_EMAIL) {
      await supabase.auth.signOut();
      throw new Error('هذا الحساب غير مخوّل للدخول.');
    }
    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select('role,is_active')
      .eq('user_id', data.user.id)
      .maybeSingle();
    if (adminError) throw adminError;
    if (!admin || admin.role !== 'owner' || admin.is_active !== true) {
      await supabase.auth.signOut();
      throw new Error('تم التحقق من البريد، لكن هذا الحساب غير مسجل كمالك للوحة.');
    }
    message('تم التحقق بنجاح. صلاحية المالك مؤكدة.');
    // The authenticated shell is intentionally not exposed until the protected
    // admin dashboard routes and data actions are connected.
    window.location.href = '/admin-dashboard.html';
  } catch (error) {
    message(error.message || 'رمز غير صحيح أو منتهي الصلاحية.', true);
  } finally { busy(verifyButton, false); }
});

const { data: { session } } = await supabase.auth.getSession();
if (session?.user?.email?.toLowerCase() === OWNER_EMAIL) {
  const { data: admin } = await supabase.from('admin_users').select('role,is_active').eq('user_id', session.user.id).maybeSingle();
  if (admin?.role === 'owner' && admin.is_active) window.location.href = '/admin-dashboard.html';
}
