# B2B Musteri Portalı (Phase 4B)

Ayri Next.js uygulamasi; ERP panelinden bagimsiz calisir.

## Gelistirme

1. API: `api-stage/server` icinde Nest ayakta olsun (varsayilan `http://localhost:3001`).
2. `cp .env.example .env.local` — `B2B_API_BASE_URL` API kok adresi.
3. `npm install`
4. `npm run dev` — portal [http://localhost:3100](http://localhost:3100)

## Kimlik

- Giris: `POST /api/b2b/login` (Next route) → httpOnly `b2b_token` cookie.
- API cagrilari: `/api/b2b/data/...` proxy; `x-b2b-domain` istemciden gider (hostname veya login formundaki domain).

Localhostta B2B domain alanina veritabaninda kayitli `B2BDomain.domain` degerini yazin.

**Satis temsilcisi:** API isteklerinde ek header `x-b2b-acting-customer-id: <B2BCustomer.id>` (proxy uzerinden iletilmeli). İstemci tarafinda bu header henuz otomatik eklenmiyor; Postman veya ozellestirilmis fetch ile deneyin.

## Sayfalar

- `/login`, `/dashboard`, `/catalog`, `/cart`, `/orders`, `/orders/[id]`
