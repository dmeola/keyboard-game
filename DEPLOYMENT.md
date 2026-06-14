# KeyJr Deployment Guide

This document covers the full deployment pipeline: GitHub → Vercel → Cloudflare DNS → `keyjr.com`.

---

## 1. Connect GitHub Repo to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in.
2. Click **"Add New… → Project"**.
3. Under **"Import Git Repository"**, select your GitHub account and find `keyboard-game`.
4. Click **"Import"**.
5. Vercel auto-detects Next.js. Leave all settings at defaults — `vercel.json` handles them.
6. Click **"Deploy"**. Your site will be live at a `*.vercel.app` URL within ~1 minute.

Every push to `main` will trigger an automatic re-deploy.

---

## 2. Add `keyjr.com` as a Custom Domain in Vercel

1. In your Vercel project dashboard, go to **Settings → Domains**.
2. Type `keyjr.com` in the domain field and click **"Add"**.
3. Also add `www.keyjr.com` (Vercel will redirect it to the apex domain automatically).
4. Vercel will display a **CNAME record** to add in your DNS provider. It looks like:

   ```
   Type:  CNAME
   Name:  @  (or blank, for the apex)
   Value: cname.vercel-dns.com
   ```

   > **Note:** For apex domains (`keyjr.com`) Cloudflare uses its "CNAME flattening" feature, so a CNAME on `@` works. Vercel may also show an A record option — either works with Cloudflare proxied.

5. Keep this tab open — you'll add the record in the next step.

---

## 3. Configure Cloudflare DNS

### First: Point Namecheap nameservers to Cloudflare

1. Log in to [Cloudflare](https://dash.cloudflare.com) and click **"Add a Site"**.
2. Enter `keyjr.com` and select the **Free plan**.
3. Cloudflare will scan existing DNS records. Continue to the next step.
4. Cloudflare provides two nameservers, e.g.:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
   (Your actual nameservers will be unique to your account.)

5. Log in to [Namecheap](https://namecheap.com):
   - Go to **Domain List → Manage** for `keyjr.com`.
   - Under **Nameservers**, select **Custom DNS**.
   - Replace the existing nameservers with the two Cloudflare nameservers.
   - Save. Propagation takes **5–30 minutes** (sometimes up to 48h).

### Then: Add the Vercel CNAME in Cloudflare

Once your nameservers have propagated to Cloudflare:

1. In Cloudflare dashboard, go to **DNS → Records**.
2. Add a new record:

   | Type  | Name | Target                  | Proxy status |
   |-------|------|-------------------------|--------------|
   | CNAME | `@`  | `cname.vercel-dns.com`  | **Proxied** ☁️ |

3. Also add for `www`:

   | Type  | Name  | Target                  | Proxy status |
   |-------|-------|-------------------------|--------------|
   | CNAME | `www` | `cname.vercel-dns.com`  | **Proxied** ☁️ |

4. Enable **"Always Use HTTPS"** in Cloudflare: go to **SSL/TLS → Edge Certificates** and toggle it on.

5. Set SSL/TLS mode to **"Full (strict)"** for end-to-end encryption (Cloudflare → Vercel).

---

## 4. Verify the Setup

1. Back in Vercel **Settings → Domains**, the domain should show a green checkmark ✅ within a few minutes.
2. Visit `https://keyjr.com` — you should see the KeyJr home page served over HTTPS.
3. Check `https://www.keyjr.com` redirects to the apex.

---

## 5. Ongoing Deployments

| Action | Result |
|--------|--------|
| `git push origin main` | Auto-deploys to production at `keyjr.com` |
| Open a Pull Request | Creates a preview deployment at a unique Vercel URL |
| Merge PR to `main` | Promotes preview to production |

---

## Environment Variables

No environment variables are required for the basic app. If you add API integrations in the future:

1. Go to Vercel → **Settings → Environment Variables**.
2. Add the variable for **Production**, **Preview**, and **Development** environments.
3. Redeploy to pick up the new values.

See `.env.example` for the list of variables.
