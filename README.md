# Bunny API (Vercel proxy)

## Kaise use hoga

```
https://your-project.vercel.app/api?key=bunny&text=hii
```

- `key` → tumhara secret key (default: `bunny`, env var se change kar sakte ho)
- `text` → jo text post karna hai

## Deploy steps (GitHub → Vercel)

1. Ye folder GitHub repo me push karo:
   ```
   git init
   git add .
   git commit -m "bunny api"
   git branch -M main
   git remote add origin https://github.com/<username>/bunny-api.git
   git push -u origin main
   ```

2. [vercel.com](https://vercel.com) pe jao → **Add New Project** → apna GitHub repo import karo → **Deploy** click karo.
   (Koi extra build settings nahi lagti, Vercel khud detect kar lega.)

3. (Optional) Apni key change karni ho to:
   - Vercel Dashboard → Project → **Settings → Environment Variables**
   - Naam: `API_KEYS`, Value: `bunny,anotherkey123` (comma se multiple keys)
   - Redeploy karo

## Response example

```json
{
  "status": true,
  "message": "Successfully Send",
  "session": "z68wEWDwyoNQ",
  "text": "hii",
  "auto_delete_minutes": 10,
  "creator": "@th3bunny | BUNNY M"
}
```

Galat key doge to:
```json
{
  "status": false,
  "message": "Invalid or missing key ❌"
}
```
