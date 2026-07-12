# Mazhai Boutique - EmailJS Checkout Setup Guide

## Overview
The checkout form now sends order details directly to your email using EmailJS, without requiring any server-side code or payment processing.

## Setup Instructions

### 1. Create an EmailJS Account
- Visit [emailjs.com](https://www.emailjs.com/)
- Sign up for a free account
- Verify your email address

### 2. Add an Email Service
1. Go to **"Email Services"** in your dashboard
2. Click **"Add New Service"**
3. Select your email provider (Gmail, Outlook, Yahoo, or Custom SMTP)
4. Follow the prompts to authorize the service
5. Copy your **Service ID** (format: `service_XXXXXXXXX`)

### 3. Create an Email Template
1. Go to **"Email Templates"** in your dashboard
2. Click **"Create New Template"**
3. Name it (e.g., "Mazhai Boutique Order Notification")
4. Use the template below:

```
Subject: New Order from Mazhai Boutique - {{customer_name}}

Hello,

A new order has been received from your online store!

---

CUSTOMER INFORMATION:
Name: {{customer_name}}
Phone: {{customer_phone}}
Email: {{customer_email}}
Delivery Address: {{customer_address}}

---

ORDER DETAILS:
{{order_details}}

GRAND TOTAL: {{grand_total}}

---

Please contact the customer soon to confirm delivery and payment details.

Best regards,
Mazhai Boutique Automated Order System
```

5. Once saved, copy your **Template ID** (format: `template_XXXXXXXXX`)

### 4. Get Your Public Key
1. Go to **"Account"** → **"API Keys"** in your dashboard
2. Copy your **Public Key** (starts with `YOUR_PUBLIC_KEY_...`)

### 5. Update the Checkout Page
In `app/checkout/page.tsx`, replace these three lines at the top:

```javascript
const EMAILJS_SERVICE_ID = "service_YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "template_YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
```

With your actual credentials:

```javascript
const EMAILJS_SERVICE_ID = "service_abc123def456";
const EMAILJS_TEMPLATE_ID = "template_xyz789uvw012";
const EMAILJS_PUBLIC_KEY = "your_actual_public_key_here";
```

### 6. Test the Form
1. Navigate to `/checkout` on your local dev server
2. Add an item to your cart
3. Fill in the form (Name, Phone, Address)
4. Click "Place Order"
5. Check your email to verify the order was received

## Features Implemented

✅ **Form Validation**
- Requires: Full Name, Phone (10 digits), Delivery Address
- Optional: Email
- Clear error messages for invalid input

✅ **Order Summary Display**
- Shows cart items with thumbnails
- Displays quantities and individual prices
- Shows grand total

✅ **Email Integration**
- Formats cart items into readable text
- Sends to your configured email
- Includes customer and order details

✅ **User Experience**
- Button shows "Processing..." while sending
- Button is disabled to prevent duplicate submissions
- Beautiful success message after email sends
- Cart automatically clears on success

✅ **Styling**
- Premium, minimal boutique aesthetic
- Elegant typography and spacing
- Soft rose/cream color palette
- Responsive design for mobile and desktop

## Environment Variables (Optional)

For production deployment on Vercel, you can use environment variables:

1. Create a `.env.local` file in your project root:
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123def456
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xyz789uvw012
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_actual_public_key_here
```

2. Update the checkout page to use these:
```javascript
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";
```

## Troubleshooting

**Q: Email not sending?**
- A: Verify your Service ID and Template ID are correct
- Check EmailJS dashboard for any error logs
- Ensure your email service is properly authorized

**Q: "Processing" button never completes?**
- A: Check browser console for EmailJS errors
- Verify your Public Key is correct
- Check that your email service is active in EmailJS

**Q: Template variables showing as blank?**
- A: Ensure template parameter names exactly match:
  - `{{customer_name}}`
  - `{{customer_phone}}`
  - `{{customer_email}}`
  - `{{customer_address}}`
  - `{{order_details}}`
  - `{{grand_total}}`

## Rate Limits

EmailJS free tier includes:
- 200 emails per day
- Unlimited email addresses
- No credit card required

For higher volume, upgrade your EmailJS plan.

## Security Notes

- The Public Key is safe to expose (it's meant to be used in frontend code)
- Never commit your actual keys to version control
- Use environment variables for sensitive credentials in production
- EmailJS handles SMTP security automatically
