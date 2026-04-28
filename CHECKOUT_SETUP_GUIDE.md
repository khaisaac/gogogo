# 📋 Checkout System Setup Checklist

Semua komponen sudah diimplementasikan. Berikut adalah checklist untuk production setup:

## ✅ Database
- [x] Migration sudah di-run di Supabase
- Tabel bookings: field baru ditambah (payment_status, payment_type, deposit_amount, balance_amount, refund_*, etc)
- Tabel refunds: created untuk audit trail

## ✅ Environment Variables (Pastikan sudah set)

Tambahkan ke `.env.local` atau Vercel/hosting:

```
# Cron Security
CRON_SECRET=your-secret-here

# Email
RESEND_API_KEY=your-resend-key
ADMIN_EMAIL=admin@trekkingmountrinjani.com

# Site URL (untuk email links)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## ✅ Payment Flow (End-to-End)

### Checkout Process:
1. Customer fills form dengan detail (Full Name, Passport, Nationality, etc)
2. Pilih Payment Option: Full (100%) atau Deposit (30%)
3. Submit → Create Booking → Get PayPal Order → Redirect ke PayPal
4. Customer login ke PayPal & approve
5. Return ke `/booking/success?booking_id=...&token=...`
6. Auto-capture PayPal order
7. Update `bookings.payment_status` → `deposit_paid` atau `fully_paid`
8. Redirect ke `/dashboard` (My Bookings)

### Status Flow:
```
pending → deposit_paid (30% paid)
pending → fully_paid (100% paid)
```

## ✅ Admin Dashboard Features

Navigate to: `/admin/bookings`

### Features:
- View semua bookings dengan payment status
- Filter: All, Pending Payment, Paid, Refund Requests
- Click "View" → Modal dengan detail lengkap
- Refund section dengan Approve/Reject buttons

### Refund Workflow:
1. Customer: Request Refund di `/dashboard` → My Bookings
2. Modal form: Select reason (min 10 chars)
3. Submit → Create refund record
4. Admin: Approve/Reject dari dashboard
5. Customer: Email notification tentang status

## ✅ Deposit Reminder Email (Cron Job)

### Setup:
Cron endpoint: `/api/cron/payment-reminder`

#### Option 1: Vercel Cron (Recommended)
Create file `vercel.json` di root:
```json
{
  "crons": [
    {
      "path": "/api/cron/payment-reminder",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

Runs every 30 minutes. Akan send email hanya ke bookings yang:
- payment_status = 'deposit_paid'
- payment_type = 'deposit'
- balance_amount > 0
- deposit_reminder_sent = false
- updated_at antara 24-48 jam lalu

#### Option 2: External Cron Service
Gunakan: cron-job.org, easycron.com, atau Vercel Cron

Request:
```
GET /api/cron/payment-reminder
Header: Authorization: Bearer {CRON_SECRET}
```

## ✅ My Bookings (Dashboard) Features

User dapat:
1. Lihat semua bookings mereka dengan status
2. Lihat payment status (Fully Paid, Deposit Paid, Pending, Failed)
3. Lihat balance due (jika deposit)
4. **Request Refund** button (hanya jika eligible):
   - Trek belum lewat
   - Belum ada refund request sebelumnya
   - Booking sudah dibayar
5. Lihat refund status jika ada request

## ✅ Payment Methods

Saat ini hanya **PayPal**:
- Tidak ada DOKU lagi
- Semua payment via PayPal

## 🔧 Manual Testing Checklist

### Test 1: Full Payment Checkout
- [ ] Fill semua form fields
- [ ] Select "Pay in Full (100%)"
- [ ] Submit → redirects ke PayPal
- [ ] Approve di PayPal → redirect ke success page
- [ ] Cek database: `bookings.payment_status` = `fully_paid`
- [ ] Cek `/dashboard` → booking muncul dengan "Fully Paid"
- [ ] Terima email konfirmasi (2 email: customer + admin)

### Test 2: Deposit Checkout
- [ ] Fill form, select "Pay Deposit Only (30%)"
- [ ] Amount to pay: 30% dari total
- [ ] Submit → PayPal → Approve
- [ ] Success page: "Deposit Paid" + "Balance Remaining: $X"
- [ ] Database: `payment_status` = `deposit_paid`, `balance_amount` set
- [ ] Dashboard: Tombol "Pay Balance Due" muncul

### Test 3: Pay Balance
- [ ] Customer: Klik "Pay Balance Due" dari booking
- [ ] Masuk ke `/booking/pay-balance?booking_id=...`
- [ ] Modal muncul dengan amount yg benar
- [ ] Submit → PayPal → Approve
- [ ] Redirect ke success
- [ ] Database: `payment_status` = `fully_paid`
- [ ] Dashboard: Update ke "Fully Paid"

### Test 4: Deposit Reminder Email
- [ ] Create booking dengan deposit
- [ ] Wait 24-25 hours (atau manual test):
  ```bash
  curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
    https://your-domain.com/api/cron/payment-reminder
  ```
- [ ] Check email inbox
- [ ] Email berisi: remaining balance, payment link, trek date

### Test 5: Refund Request
- [ ] Go to `/dashboard` → My Bookings
- [ ] Klik "Request Refund" pada booking yg eligible
- [ ] Fill reason
- [ ] Submit → success message
- [ ] Database: `refund_status` = `requested`, `refund_reason` saved
- [ ] Admin dapat email notification
- [ ] Admin: Go to `/admin/bookings`
- [ ] Filter "Refund Requests"
- [ ] Click View → Modal
- [ ] Klik "Approve Refund" atau "Reject"
- [ ] Customer: Check email untuk status update

## 📧 Emails Terkirim

1. **Booking Confirmation** (saat checkout berhasil)
   - Ke: Customer
   - Content: Booking details, total price, next steps

2. **Admin Notification** (saat checkout berhasil)
   - Ke: ADMIN_EMAIL
   - Content: Guest info, booking details, all fields (passport, gender, etc)

3. **Deposit Reminder** (24 jam setelah deposit paid)
   - Ke: Customer (hanya untuk deposit)
   - Content: Balance due, payment link, trek date
   - Sent via Cron job

4. **Refund Request Notification** (saat customer request)
   - Ke: ADMIN_EMAIL
   - Content: Guest info, booking, refund amount, reason

5. **Refund Status** (saat admin approve/reject)
   - Ke: Customer
   - Content: Approval/Rejection, reason, next steps

## 🐛 Debugging Commands

### Check Cron Secret Setup:
```bash
echo $CRON_SECRET  # Should print your secret
```

### Manual Cron Test:
```bash
curl -v -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/payment-reminder
```

### Database Check (Supabase):
```sql
-- Check bookings with payment status
SELECT id, full_name, payment_status, payment_type, deposit_amount, balance_amount, refund_status
FROM bookings
ORDER BY created_at DESC
LIMIT 10;

-- Check refunds
SELECT * FROM refunds ORDER BY requested_at DESC LIMIT 10;

-- Check payments
SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;
```

## 🚀 Production Deployment

1. Set all env variables di hosting (Vercel, etc)
2. Deploy code (should have no breaking changes)
3. Setup Vercel Cron (edit `vercel.json`)
4. Test satu kali full flow di production
5. Monitor emails & cron logs
6. Done! ✅

## 📌 Future Enhancements (Optional)

- [ ] Integrate PayPal refund API untuk auto-refund (saat ini: approved only)
- [ ] Add DOKU kembali jika diperlukan
- [ ] SMS reminder via WhatsApp (ganti/tambah email)
- [ ] Auto-confirm booking 2 hari sebelum trek
- [ ] Invoice generation PDF
- [ ] Multi-currency support
