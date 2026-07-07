# Postflow Setup Guide

This guide will help you set up Postflow as a production-ready SaaS application with Stripe payments and Supabase authentication.

## Prerequisites

- Node.js 18+ and npm/pnpm
- A Supabase account (https://supabase.com)
- An OpenAI API key (https://platform.openai.com/api-keys)
- A Stripe account (https://stripe.com)
- A GitHub OAuth App (https://github.com/settings/developers)

---

## 1. Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Copy your **Project URL** and **Anon Key** from the project settings

### 1.2 Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query and paste the contents of `supabase_schema.sql`
3. Click **Run** to execute the schema

This will create the following tables:
- **profiles**: User account information and subscription status
- **posts**: Generated posts with metadata
- **captures**: Freeform text captures for structuring

### 1.3 Enable GitHub OAuth

1. In Supabase, go to **Authentication** → **Providers**
2. Enable **GitHub** and add your GitHub OAuth credentials:
   - Client ID
   - Client Secret
3. Set the redirect URL to: `https://your-domain.com/auth/callback`

---

## 2. GitHub OAuth Setup

### 2.1 Create a GitHub OAuth App

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the form:
   - **Application name**: Postflow
   - **Homepage URL**: `https://your-domain.com`
   - **Authorization callback URL**: `https://your-domain.com/auth/callback`
4. Copy your **Client ID** and **Client Secret**

### 2.2 Add to Supabase

1. In Supabase, go to **Authentication** → **Providers** → **GitHub**
2. Paste your GitHub Client ID and Client Secret
3. Save

---

## 3. OpenAI Setup

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. (Optional) Set usage limits to prevent unexpected charges

---

## 4. Stripe Setup

### 4.1 Create Stripe Products and Prices

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Navigate to **Products**
3. Create two products:

**Product 1: Free Plan**
- Name: Postflow Free
- No price needed (free tier)

**Product 2: Pro Plan**
- Name: Postflow Pro
- Price: $29/month
- Billing interval: Monthly
- Copy the **Price ID** (starts with `price_`)

### 4.2 Set Up Webhooks

1. In Stripe, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://your-domain.com/api/stripe/webhook`
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing Secret**

---

## 5. Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in all the values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRICE_ID_PRO=price_xxxxxxxxxxxxx

# App URL (for local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. Local Development

### 6.1 Install Dependencies

```bash
npm install
# or
pnpm install
```

### 6.2 Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

The app will be available at `http://localhost:3000`

### 6.3 Test the Full Flow

1. Go to `http://localhost:3000`
2. Click "Get Started" or "Start building workflow"
3. Connect your GitHub account
4. Select a repository and commits
5. Generate posts
6. Go to `/pricing` to test the checkout flow

---

## 7. Production Deployment

### 7.1 Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - All the variables from `.env.local`
   - Make sure `NEXT_PUBLIC_APP_URL` is set to your production domain
5. Deploy

### 7.2 Update Callback URLs

After deploying, update the following:

**Supabase:**
- Go to **Authentication** → **URL Configuration**
- Set **Redirect URLs** to `https://your-domain.com/auth/callback`

**GitHub OAuth App:**
- Update **Authorization callback URL** to `https://your-domain.com/auth/callback`

**Stripe Webhooks:**
- Update the webhook endpoint to `https://your-domain.com/api/stripe/webhook`

---

## 8. Subscription Features

### 8.1 Free Plan

- 1 post per week
- GitHub integration
- Basic post generation

### 8.2 Pro Plan ($29/month)

- Unlimited posts
- GitHub integration
- Advanced AI generation
- Priority support
- Custom tone profiles

### 8.3 Implementing Feature Gates

To gate features behind the Pro subscription, check the `is_subscribed` flag in the database:

```typescript
const { data: profile } = await supabase
  .from("profiles")
  .select("is_subscribed")
  .eq("id", userId)
  .single();

if (!profile?.is_subscribed) {
  return NextResponse.json(
    { error: "This feature requires a Pro subscription" },
    { status: 403 }
  );
}
```

---

## 9. Monitoring and Maintenance

### 9.1 Monitor Stripe Events

- Check webhook logs in Stripe Dashboard → **Developers** → **Webhooks**
- Monitor subscription status in your Supabase `profiles` table

### 9.2 Monitor API Usage

- OpenAI: Check usage at [platform.openai.com/account/usage](https://platform.openai.com/account/usage)
- Supabase: Check usage in your project dashboard

### 9.3 Handle Errors

- Check server logs in Vercel Dashboard
- Monitor Supabase logs in the project dashboard
- Check Stripe logs for payment failures

---

## 10. Common Issues

### "Invalid Stripe API Key"

- Make sure `STRIPE_SECRET_KEY` is set correctly
- Use the **Secret Key**, not the **Publishable Key**

### "GitHub OAuth Failed"

- Verify the GitHub OAuth App credentials are correct
- Check that the callback URL matches exactly

### "Supabase Connection Failed"

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check that Row Level Security (RLS) policies are enabled

### "Webhook Not Triggering"

- Verify the webhook endpoint is accessible
- Check that the signing secret is correct
- Use Stripe CLI to test: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

---

## 11. Next Steps

1. **Customize Pricing**: Modify `/components/pricing-page.tsx` to match your pricing strategy
2. **Add Analytics**: Integrate Mixpanel, Amplitude, or Plausible
3. **Email Notifications**: Set up email confirmations for subscriptions
4. **Customer Support**: Add a support chat or email form
5. **Legal Pages**: Add Terms of Service and Privacy Policy

---

## Support

For issues or questions, refer to:
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [OpenAI Docs](https://platform.openai.com/docs)
