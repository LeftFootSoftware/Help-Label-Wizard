# Opening the app when Preview doesn’t open Admin

If you press **P** (Preview) and click **App home** but the Admin tab never opens or stays blank:

## 1. Open Admin first, then the app

Don’t rely on the Preview link. Open the app from Admin yourself:

1. **Open Admin in a new tab**  
   Go to: **https://admin.shopify.com/store/test-store-01-4**  
   (Use your dev store handle if different.)

2. **Sign in** if the browser asks.

3. **Open the app**  
   In the left sidebar: **Apps** → **Label Wizard Dev** (or your dev app name).  
   Or go directly to: **https://admin.shopify.com/store/test-store-01-4/apps/label-wizard-dev**

4. The app loads inside Admin. If it errors, the **red dev error overlay** should appear on the page with the message and stack.

## 2. Allow pop-ups (if you want to use Preview)

The “App home” link opens a new tab. If that tab never appears:

- **Chrome:** Address bar → click the pop-up blocked icon → “Always allow …”
- Or: Settings → Privacy and security → Site settings → Pop-ups and redirects → add an exception for the dev console URL (e.g. `*.trycloudflare.com` or the URL where you clicked Preview).

## 3. Use the tunnel URL with `shop` (optional)

With `npm run dev` running, copy the **Using URL** from the terminal (e.g. `https://xxx.trycloudflare.com`). In a new tab open:

```text
https://<that-url>/auth/login?shop=test-store-01-4.myshopify.com
```

Replace `<that-url>` with the tunnel URL. That starts the OAuth flow; when it finishes, you’ll be in Admin with the app embedded.
