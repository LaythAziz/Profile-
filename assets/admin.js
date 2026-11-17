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
const emailInput = document.querySelector('#email');

function enteredEmail() { return emailInput.value.trim().toLowerCase(); }

function message(text, error = false) {
  feedback.textContent = text;
  feedback.classList.toggle('error', error);
}
function busy(button, value) { button.disabled = value; }

async function sendCode() {
  const email = enteredEmail();
  if (!email || !emailInput.validity.valid) return message('اكتب بريداً إلكترونياً صحيحاً أولاً.', true);
  if (email !== OWNER_EMAIL) return message('هذا البريد غير مخوّل للدخول إلى لوحة الإدارة.', true);
  busy(sendButton, true);
  message('جارٍ إرسال رمز التحقق إلى Gmail…');
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }
    });
    if (error) throw error;
    requestForm.hidden = true;
    verifyForm.hidden = false;
    otpInput.focus();
    message('تم إرسال رمز التحقق. افتح Gmail وانسخ الرمز كاملاً (من 6 إلى 10 أرقام)، ثم أدخله هنا.');
  } catch (error) {
    const detail = String(error.message || '');
    if (/rate limit|too many requests|over_email_send_rate_limit/i.test(detail)) {
      message('خدمة البريد وصلت حد الإرسال المؤقت. لا تضغط إرسال مرة أخرى الآن؛ نحتاج تفعيل SMTP مخصص ثم نعيد المحاولة.', true);
    } else {
      message(detail || 'تعذر إرسال الرمز. تحقق من البريد وحاول لاحقاً.', true);
    }
  } finally { busy(sendButton, false); }
}

requestForm.addEventListener('submit', event => { event.preventDefault(); sendCode(); });
resendButton.addEventListener('click', sendCode);

verifyForm.addEventListener('submit', async event => {
  event.preventDefault();
  const token = otpInput.value.trim();
  if (!/^\d{6,10}$/.test(token)) return message('أدخل رمز التحقق كاملاً (من 6 إلى 10 أرقام).', true);
  busy(verifyButton, true);
  message('جارٍ التحقق من الرمز والصلاحيات…');
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: enteredEmail(),
      token,
      type: 'email'
    });
    if (error) throw error;
    if (!data.user || data.user.email?.toLowerCase() !== enteredEmail() || data.user.email?.toLowerCase() !== OWNER_EMAIL) {
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
    window.location.replace('/control-center.html');
  } catch (error) {
    message(error.message || 'رمز غير صحيح أو منتهي الصلاحية.', true);
  } finally { busy(verifyButton, false); }
});

const { data: { session } } = await supabase.auth.getSession();
if (session?.user?.email?.toLowerCase() === OWNER_EMAIL) {
  const { data: admin } = await supabase.from('admin_users').select('role,is_active').eq('user_id', session.user.id).maybeSingle();
  if (admin?.role === 'owner' && admin.is_active) window.location.href = '/control-center.html';
}
