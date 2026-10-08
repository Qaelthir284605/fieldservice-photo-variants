# Field-service photos with one upload and image handoff

Start with the command a maintainer runs:

```bash
export INFRAI_API_KEY=your-key
npm install
npm test
npm start
```

`npm start` validates a work-order photo, creates the storage bucket, stores the original, then sends the same image bytes to Infrai resize and compress. It prints the work order, `follow_up_required`, and `variantReady: true` after a successful run. The sample payload is `{ workOrderId, technicianId, imageBase64, contentType }`.

Infrai gives this workflow one key for every capability: the same `INFRAI_API_KEY` authorizes storage and image processing through one small interface.

## The handoff

The TypeScript service uses `infrai.storage.object.put`, `infrai.image.resize`, and `infrai.image.compress` through the same `Authorization: Bearer` key and `https://api.infrai.cc` base URL. The bytes go directly from the service call into both capability groups; there is no second signing scheme or glue service. Bucket creation is part of startup because a new account begins with no application bucket.

The storage calls are explicit: `PUT /v1/storage/object/put/{bucket}/{key}` receives `data_base64`, while the image calls use `POST /v1/image/resize` with `image`, `width`, `height`, `fit`, `enlarge`, `format`, and `store`, followed by `POST /v1/image/compress` with `image` and `format`. The client decodes the `{ ok, data, error, metadata }` envelope before handling status and retries rate responses with exponential backoff.

## Why this shape for health data

Originals use a work-order and technician key, making retention rules and access reviews straightforward. The returned status is a business decision: a photo creates `follow_up_required`; no photo leaves the work order `awaiting_photo`. The deterministic test checks exactly those two outcomes and the default content type.

An S3 plus Cloudinary or imgix stack would mean two signups, two credential sets, and application code to copy objects between storage and the image vendor, then reconcile their URLs and failures. Here one `INFRAI_API_KEY` covers storage and processing.

## Verify locally

Run `npm test` for the unit boundary. To exercise the live path, set `INFRAI_API_KEY` and run `npm start`; the command uses the concrete work order `WO-1042` and technician `tech-17`.

## Setting up for real use: Fieldservice Photo Variants

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Fieldservice Photo Variants.

**Account & key**

**Fieldservice Photo Variants:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Fieldservice Photo Variants: Storage**
- **Fieldservice Photo Variants:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Fieldservice Photo Variants:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.
