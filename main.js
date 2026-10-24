import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const bagCount = document.querySelector('.bag-count');
let cartCount = Number(localStorage.getItem('velva-cart-count') || 0);
const cartItems = JSON.parse(localStorage.getItem('velva-cart-items') || '[]');
if (bagCount) bagCount.textContent = String(cartCount);

/* ── THEMES ── */
const themeVariables = {
  sage:  ['#7b8b4d','#5e6d39','#dfe4cd','#f5f5ef','#eee9df'],
  rose:  ['#b46c78','#8f4f5c','#f0dfe2','#fff7f5','#f5e8e2'],
  sand:  ['#b27b3f','#805426','#ead9bd','#fbf5eb','#f2e5d1'],
  night: ['#6b9aa5','#355963','#d9e8e9','#eef6f5','#dce9e7'],
  terra: ['#b75d43','#87412f','#f0d6cd','#fff4ef','#f4e1d7']
};
function setTheme(name) {
  const colors = themeVariables[name] || themeVariables.sage;
  document.documentElement.dataset.theme = name in themeVariables ? name : 'sage';
  ['--sage','--sage-dark','--sage-light','--cream','--sand'].forEach((v, i) => document.documentElement.style.setProperty(v, colors[i]));
  localStorage.setItem('velva-theme', name in themeVariables ? name : 'sage');
}
document.querySelectorAll('.theme-toggle').forEach((toggle) => {
  const menu = document.createElement('div');
  menu.className = 'theme-menu'; menu.hidden = true;
  Object.entries(themeVariables).forEach(([n, colors]) => {
    const opt = document.createElement('button'); opt.className = 'theme-option'; opt.type = 'button';
    opt.innerHTML = '<i class="theme-swatch" style="background:' + colors[0] + '"></i>' + n[0].toUpperCase() + n.slice(1);
    opt.addEventListener('click', () => { setTheme(n); menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); });
    menu.appendChild(opt);
  });
  toggle.parentElement?.appendChild(menu);
  toggle.addEventListener('click', () => { menu.hidden = !menu.hidden; toggle.setAttribute('aria-expanded', String(!menu.hidden)); });
});
setTheme(localStorage.getItem('velva-theme') || 'sage');

/* ── MISC ── */
document.querySelector('.mobile-toggle')?.addEventListener('click', () => document.querySelector('.main-nav')?.classList.toggle('mobile-open'));
document.querySelector('.contact-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const m = document.querySelector('.form-message');
  if (m) m.textContent = 'Thank you — your note is on its way to our team.';
  e.currentTarget.reset();
});
document.querySelectorAll('.newsletter').forEach((f) => f.addEventListener('submit', (e) => {
  e.preventDefault();
  const inp = f.querySelector('input');
  if (inp) { inp.value = "You're on the list"; inp.disabled = true; }
}));

/* ── HELPERS ── */
function escapeHtml(v) {
  return String(v).replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function showNotice(msg, isError = false) {
  const n = document.querySelector('#accountNotice');
  if (n) { n.textContent = msg; n.className = isError ? 'account-notice error' : 'account-notice'; }
}
function openAccountModal(mode) {
  authMode = mode || 'signin';
  if (authMode === 'signin') return window.location.href = 'signin.html?next=shop.html';
  const modal = document.querySelector('#accountModal');
  if (!modal) return;
  modal.hidden = false;
  renderAuthForm();
}
function closeAccountModal() {
  const m = document.querySelector('#accountModal');
  if (m) m.hidden = true;
}

/* ── AUTH UI ── */
let authMode = 'signin';

function renderAuthForm() {
  const wrap = document.querySelector('#authFormWrap');
  const title = document.querySelector('#authTitle');
  const copy = document.querySelector('#authCopy');
  if (!wrap || !title || !copy) return;
  if (authMode === 'signup') {
    title.textContent = 'Create account';
    copy.textContent = 'Fill in your details to join Velva.';
    wrap.innerHTML = [
      '<div class="auth-row">',
        '<input name="first_name" type="text" required placeholder="First name" autocomplete="given-name">',
        '<input name="last_name" type="text" required placeholder="Last name" autocomplete="family-name">',
      '</div>',
      '<input name="email" type="email" required placeholder="Gmail address" autocomplete="email">',
      '<input name="password" type="password" required minlength="8" placeholder="Password (min 8 chars, 1 number)" autocomplete="new-password">',
      '<input name="phone" type="tel" required placeholder="Phone: 03XX XXXXXXX" pattern="03[0-9]{9}" autocomplete="tel">',
      '<button class="btn btn-sage" type="submit">Create account</button>',
      '<button class="auth-switch" type="button">Already have an account? Sign in</button>'
    ].join('');
  } else {
    title.textContent = 'Sign in to order';
    copy.textContent = 'Sign in to place your WhatsApp order.';
    wrap.innerHTML = [
      '<input name="email" type="email" required placeholder="Gmail address" autocomplete="email">',
      '<input name="password" type="password" required placeholder="Password" autocomplete="current-password">',
      '<button class="btn btn-sage" type="submit">Sign in</button>',
      '<button class="auth-switch" type="button">New here? Create account</button>'
    ].join('');
  }
  wrap.querySelector('.auth-switch')?.addEventListener('click', () => {
    if (authMode === 'signin') return window.location.href = 'signup.html';
    authMode = 'signin';
    renderAuthForm();
  });
}

function buildAuthModal() {
  if (document.querySelector('#accountModal')) return;
  const modal = document.createElement('div');
  modal.id = 'accountModal'; modal.className = 'account-modal'; modal.hidden = true;
  modal.innerHTML = [
    '<div class="account-card">',
      '<button class="modal-close" type="button" aria-label="Close">\xd7</button>',
      '<p class="eyebrow">YOUR VELVA ACCOUNT</p>',
      '<h2 id="authTitle"></h2>',
      '<p id="authCopy" class="account-copy"></p>',
      '<form id="accountForm"><div id="authFormWrap"></div></form>',
      '<p id="accountNotice" class="account-notice" role="status"></p>',
    '</div>'
  ].join('');
  document.body.appendChild(modal);
  modal.querySelector('.modal-close')?.addEventListener('click', closeAccountModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeAccountModal(); });
  modal.querySelector('#accountForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') || '');
    const password = String(data.get('password') || '');
    if (authMode === 'signup') {
      const phone = String(data.get('phone') || '');
      const firstName = String(data.get('first_name') || '');
      const lastName = String(data.get('last_name') || '');
      if (!/^03[0-9]{9}$/.test(phone)) return showNotice('Phone must be 11 digits starting with 03.', true);
      if (!/(?=.*[0-9])(?=.*[a-zA-Z]).{8,}/.test(password)) return showNotice('Password needs at least 8 characters including 1 number.', true);
      const { data: sd, error: se } = await supabase.auth.signUp({ email, password });
      if (se) return showNotice(se.message, true);
      if (sd.user) await supabase.from('velva_profiles').insert({ id: sd.user.id, first_name: firstName, last_name: lastName, phone });
      showNotice('Account created! You can now sign in.');
      authMode = 'signin'; renderAuthForm();
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return showNotice(error.message, true);
      closeAccountModal();
      document.dispatchEvent(new CustomEvent('velva-signed-in'));
      updateHeaderAuth();
    }
  });
}

async function updateHeaderAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  document.querySelectorAll('.header-actions button').forEach((btn) => {
    if (btn.querySelector('.bi-person') || btn.querySelector('.bi-person-check')) {
      btn.innerHTML = user ? '<i class="bi bi-person-check"></i>' : '<i class="bi bi-person"></i>';
    }
  });
}

buildAuthModal();
renderAuthForm();
updateHeaderAuth();
document.querySelectorAll('.header-actions button').forEach((btn) => {
  if (btn.querySelector('.bi-person')) btn.addEventListener('click', () => openAccountModal('signin'));
});

const signupPageForm = document.querySelector('#signupPageForm');
signupPageForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const notice = document.querySelector('#signupNotice');
  const setSignupNotice = (message, error = false) => { if (notice) { notice.textContent = message; notice.className = error ? 'account-notice error' : 'account-notice'; } };
  const password = String(data.get('password') || '');
  const country = String(data.get('country') || '');
  const selectedCountry = form.querySelector('select[name="country"]')?.selectedOptions[0];
  const countryCode = selectedCountry?.dataset.code || '+92';
  const rawPhone = String(data.get('phone') || '').replace(/[^0-9]/g, '');
  const phone = countryCode + rawPhone.replace(/^0+/, '');
  if (!/(?=.*[0-9])(?=.*[a-zA-Z]).{8,}/.test(password)) return setSignupNotice('Password needs at least 8 characters including 1 number.', true);
  if (rawPhone.length < 7 || rawPhone.length > 14) return setSignupNotice('Please enter a valid phone number.', true);
  const { data: signupData, error: signupError } = await supabase.auth.signUp({ email: String(data.get('email')), password });
  if (signupError) return setSignupNotice('Account could not be created. Please check your details and try again.', true);
  if (!signupData.user) return setSignupNotice('Account could not be created. Please try again.', true);
  const { error: profileError } = await supabase.from('velva_profiles').insert({ id: signupData.user.id, first_name: String(data.get('first_name')), last_name: String(data.get('last_name')), country, phone_country_code: countryCode, phone });
  if (profileError) return setSignupNotice('Account created, but profile details could not be saved.', true);
  setSignupNotice('Account created successfully. Redirecting to the store…');
  window.setTimeout(() => { window.location.href = 'index.html'; }, 900);
});

const signinPageForm = document.querySelector('#signinPageForm');
signinPageForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const notice = document.querySelector('#signinNotice');
  const setSigninNotice = (message, error = false) => { if (notice) { notice.textContent = message; notice.className = error ? 'account-notice error' : 'account-notice'; } };
  const { error } = await supabase.auth.signInWithPassword({ email: String(data.get('email')), password: String(data.get('password')) });
  if (error) return setSigninNotice('Sign in failed. Please check your email and password.', true);
  const next = new URLSearchParams(window.location.search).get('next');
  window.location.href = next === 'shop.html' ? 'shop.html' : 'index.html';
});
document.querySelector('#resetPasswordButton')?.addEventListener('click', async () => {
  const email = String(new FormData(signinPageForm || document.createElement('form')).get('email') || '');
  const notice = document.querySelector('#signinNotice');
  if (!email) { if (notice) { notice.textContent = 'Enter your email first.'; notice.className = 'account-notice error'; } return; }
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/signin.html' });
  if (notice) notice.textContent = error ? 'Password reset could not be started.' : 'If that email is registered, a reset link has been sent.';
});
if (new URLSearchParams(window.location.search).get('signin') === '1') openAccountModal('signin');

/* ── PRODUCT RATINGS ── */
const productRatings = [4.9, 4.8, 4.7, 4.9, 4.6, 4.8, 4.7, 4.9];
document.querySelectorAll('.product-card').forEach((card, index) => {
  const meta = card.querySelector('.product-meta');
  if (!meta) return;
  const key = 'velva-rating-' + index;
  const saved = Number(localStorage.getItem(key) || productRatings[index % productRatings.length]);
  const el = card.querySelector('.product-rating') || document.createElement('div');
  el.className = 'product-rating';
  if (!el.querySelector('.rate-product')) {
    if (!el.querySelector('small')) el.innerHTML = '<span class="rating-stars">\u2605\u2605\u2605\u2605\u2605</span><small>' + saved.toFixed(1) + ' customer rating</small>';
    const rateBtn = document.createElement('button'); rateBtn.className = 'rate-product'; rateBtn.type = 'button'; rateBtn.textContent = 'Rate'; el.appendChild(rateBtn);
  }
  if (!card.querySelector('.product-rating')) meta.prepend(el);
  el.querySelector('.rate-product')?.addEventListener('click', () => {
    const v = Number(window.prompt('Rate 1 to 5:', String(saved)) || saved);
    if (v < 1 || v > 5 || Number.isNaN(v)) return;
    localStorage.setItem(key, String(v));
    const small = el.querySelector('small'); if (small) small.textContent = v.toFixed(1) + ' your rating';
  });
});

/* ── ADD TO BAG ── */
document.querySelectorAll('.add-button').forEach((btn) => btn.addEventListener('click', () => {
  const card = btn.closest('.product-card');
  const name = card?.querySelector('h3')?.textContent || 'Velva product';
  const price = Number((card?.querySelector('strong')?.textContent || '0').replace(/[^0-9]/g, ''));
  cartItems.push({ name, price, quantity: 1 });
  localStorage.setItem('velva-cart-items', JSON.stringify(cartItems));
  cartCount += 1; localStorage.setItem('velva-cart-count', String(cartCount));
  if (bagCount) bagCount.textContent = String(cartCount);
  const orig = btn.textContent; btn.textContent = 'Added to bag'; btn.classList.add('added');
  window.setTimeout(() => { btn.textContent = orig; btn.classList.remove('added'); }, 1400);
}));

/* ── PLACE ORDER ── */
async function placeOrder() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return openAccountModal('signin');
  if (!cartItems.length) return window.alert('Please add at least one product to your bag first.');
  const { data: profile } = await supabase.from('velva_profiles').select('first_name,last_name').eq('id', user.id).maybeSingle();
  const customerName = profile ? (profile.first_name + ' ' + profile.last_name) : (user.email?.split('@')[0] || 'Customer');
  const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const { data: order, error } = await supabase.from('velva_orders').insert({
    customer_name: customerName, customer_email: user.email, items: cartItems, total_amount: total
  }).select('id').maybeSingle();
  if (error || !order) return window.alert(error?.message || 'Order could not be created.');
  const msg = 'New Velva order ' + order.id + '%0ACustomer: ' + customerName + '%0A' + cartItems.map((i) => i.name + ' x' + i.quantity).join('%0A') + '%0ATotal: Rs. ' + total;
  window.open('https://wa.me/923000000000?text=' + msg, '_blank', 'noopener');
}
if (document.querySelector('.shop-toolbar')) {
  const orderBtn = document.createElement('button');
  orderBtn.className = 'btn btn-sage order-button'; orderBtn.type = 'button'; orderBtn.textContent = 'Order on WhatsApp';
  orderBtn.addEventListener('click', placeOrder);
  document.querySelector('.shop-toolbar')?.appendChild(orderBtn);
}

/* ── KIND WORDS TICKER ── */
const kindWordsData = [
  { text: 'My face feels soft, calm, and genuinely hydrated.', name: 'Amna', city: 'Karachi' },
  { text: 'The cleanser is gentle but still feels like it really works.', name: 'Hira', city: 'Islamabad' },
  { text: 'Moonlit Oil gave me the glow I was looking for.', name: 'Zara', city: 'Lahore' },
  { text: 'Beautiful packaging and even better formulas.', name: 'Maham', city: 'Multan' },
  { text: 'Cloud Cream is now part of my bedtime ritual.', name: 'Iqra', city: 'Faisalabad' }
];
const wordsSection = document.querySelector('.words-section');
if (wordsSection) {
  const existingGrid = wordsSection.querySelector('.words-grid');
  if (existingGrid) existingGrid.remove();
  const container = wordsSection.querySelector('.container');
  const ticker = document.createElement('div'); ticker.className = 'kw-ticker';
  const trackWrap = document.createElement('div'); trackWrap.className = 'kw-track-wrap'; trackWrap.setAttribute('aria-hidden', 'true');
  const items = kindWordsData.map((r) => '\u2605\u2605\u2605\u2605\u2605  "' + r.text + '"  \u2014 ' + r.name + ', ' + r.city).join('   \u00b7   ');
  const trackInner = document.createElement('div'); trackInner.className = 'kw-track'; trackInner.textContent = items + '   \u00b7   ' + items;
  trackWrap.appendChild(trackInner);
  const slide = document.createElement('div'); slide.className = 'kw-slide'; slide.setAttribute('aria-live', 'polite');
  const starsEl = document.createElement('div'); starsEl.className = 'kw-stars'; starsEl.textContent = '\u2605\u2605\u2605\u2605\u2605';
  const quoteEl = document.createElement('blockquote'); quoteEl.className = 'kw-quote';
  const citeEl = document.createElement('cite'); citeEl.className = 'kw-cite';
  slide.appendChild(starsEl); slide.appendChild(quoteEl); slide.appendChild(citeEl);
  ticker.appendChild(trackWrap); ticker.appendChild(slide);
  if (container) container.appendChild(ticker);
  let current = 0;
  function showReview(index) {
    const r = kindWordsData[index];
    slide.classList.remove('kw-enter'); void slide.offsetWidth; slide.classList.add('kw-enter');
    quoteEl.textContent = '"' + r.text + '"';
    citeEl.textContent = '\u2014 ' + r.name + ', ' + r.city;
  }
  showReview(0);
  window.setInterval(() => { current = (current + 1) % kindWordsData.length; showReview(current); }, 3000);
}

/* ── BRAND LOGO ON PRODUCTS ── */
document.querySelectorAll('.product-photo').forEach((photo) => {
  if (photo.querySelector('.brand-product-mark')) return;
  const mark = document.createElement('img'); mark.className = 'brand-product-mark';
  mark.src = 'image_e12da7e5-removebg-preview.png'; mark.alt = 'Velva';
  photo.appendChild(mark);
});

/* ── ADMIN PRODUCT MANAGER ── */
const adminGate = document.querySelector('#adminGate');
const adminApp = document.querySelector('#adminApp');
const adminLoginForm = document.querySelector('#adminLoginForm');
const adminNotice = document.querySelector('#adminNotice');
const productForm = document.querySelector('#productForm');
const productList = document.querySelector('#adminProductList');
const productNotice = document.querySelector('#productNotice');
const ordersList = document.querySelector('#adminOrders');
const lowStockList = document.querySelector('#lowStockList');
let adminProducts = [];
function adminMessage(text, error = false) {
  if (adminNotice) { adminNotice.textContent = text; adminNotice.className = error ? 'account-notice error' : 'account-notice'; }
  if (productNotice) { productNotice.textContent = text; productNotice.className = error ? 'account-notice error' : 'account-notice'; }
}
async function isApprovedAdmin(userId) {
  const { data, error } = await supabase.from('velva_admins').select('user_id').eq('user_id', userId).maybeSingle();
  return !error && Boolean(data);
}
function renderAdminProducts() {
  if (!productList) return;
  productList.innerHTML = adminProducts.length ? adminProducts.map((p) => '<div class="admin-product-item"><img src="' + escapeHtml(p.image_url) + '" alt=""><span><strong>' + escapeHtml(p.name) + '</strong><small>Rs. ' + escapeHtml(p.price) + ' · ' + escapeHtml(p.average_rating) + ' / 5 · ' + escapeHtml(p.stock_quantity) + ' in stock</small></span><button class="admin-delete-product" type="button" data-id="' + escapeHtml(p.id) + '">Remove</button></div>').join('') : '<p class="text-muted">No products have been added yet.</p>';
  productList.querySelectorAll('.admin-delete-product').forEach((button) => button.addEventListener('click', async () => {
    const { error } = await supabase.from('velva_products').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', button.dataset.id);
    if (error) return adminMessage('Could not update this product.', true);
    await loadAdminData();
  }));
}
async function loadAdminData() {
  const [productsResponse, ordersResponse] = await Promise.all([
    supabase.from('velva_products').select('id,name,price,image_url,stock_quantity,average_rating,is_active').order('created_at', { ascending: false }),
    supabase.from('velva_orders').select('id,customer_name,created_at,status,total_amount').order('created_at', { ascending: false }).limit(8)
  ]);
  if (productsResponse.error || ordersResponse.error) return adminMessage('Could not load store data.', true);
  adminProducts = productsResponse.data || [];
  renderAdminProducts();
  if (ordersList) ordersList.innerHTML = (ordersResponse.data || []).map((order) => '<tr><td>' + escapeHtml(order.id.slice(0, 8)) + '</td><td>' + escapeHtml(order.customer_name) + '</td><td>' + new Date(order.created_at).toLocaleDateString() + '</td><td><span class="status pending">' + escapeHtml(order.status) + '</span></td><td>Rs. ' + escapeHtml(order.total_amount) + '</td></tr>').join('') || '<tr><td colspan="5">No orders yet.</td></tr>';
  const lowStock = adminProducts.filter((product) => product.is_active && product.stock_quantity < 10);
  if (lowStockList) lowStockList.innerHTML = lowStock.length ? lowStock.map((product) => '<div class="stock-row"><span><strong>' + escapeHtml(product.name) + '</strong><small>Only ' + escapeHtml(product.stock_quantity) + ' left</small></span></div>').join('') : '<p class="text-muted">All products have healthy stock.</p>';
}
async function openAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isApprovedAdmin(user.id))) {
    if (adminApp) adminApp.hidden = true;
    if (adminGate) adminGate.hidden = false;
    return;
  }
  if (adminGate) adminGate.hidden = true;
  if (adminApp) adminApp.hidden = false;
  await loadAdminData();
}
adminLoginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(adminLoginForm);
  const { error } = await supabase.auth.signInWithPassword({ email: String(data.get('email')), password: String(data.get('password')) });
  if (error) return adminMessage('Sign in failed. Check your admin email and password.', true);
  await openAdmin();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isApprovedAdmin(user.id))) { await supabase.auth.signOut(); adminMessage('This account is not approved for admin access.', true); }
});
document.querySelector('#adminResetButton')?.addEventListener('click', async () => {
  const email = String(new FormData(adminLoginForm || document.createElement('form')).get('email') || '');
  if (!email) return adminMessage('Enter your admin email first.', true);
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/admin.html' });
  adminMessage(error ? 'Password reset could not be started.' : 'If that email is registered, a reset link has been sent.');
});
document.querySelector('.admin-signout')?.addEventListener('click', async () => { await supabase.auth.signOut(); window.location.reload(); });
productForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(productForm);
  const name = String(data.get('name') || '').trim();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  const { error } = await supabase.from('velva_products').insert({ name, slug, price: Number(data.get('price')), average_rating: Number(data.get('rating')), stock_quantity: Number(data.get('stock')), image_url: String(data.get('image')), is_active: true });
  if (error) return adminMessage('Could not save this product. Check the details and try again.', true);
  productForm.reset(); adminMessage('Product saved.'); await loadAdminData();
});
if (adminGate) openAdmin();
