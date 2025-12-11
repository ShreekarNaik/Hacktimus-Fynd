# Workflows

## Get Redeem URL

Making the following request
curl --location --request GET "https://asia-south1.workflow.boltic.app/9a88c940-1bb1-4ecc-8be3-ec3c0030b097/get_redeem_link?coupon=%7B%7Bglobal_variables.coupon_code%7D%7D&cart_id=%7B%7Bglobal_variables.cart_id%7D%7D" \
 --header "Content-Type: application/json"

would lead to getting a response like:
Status 200 OK
{"url":"https://craftkart.fynd.io/cart/bag"}
or
Status 400 Bad Request
{"error":"Invalid Coupon"}

## Migrate Users

> (No connection is needed to the backend/frontend)
> A scheduled workflow that runs every 1000 minutes to migrate users from platform that are not present in the boltic table.

## Create Users in DB

> (No connection is needed to the backend/frontend)

Auto adds newly signed up users to the boltic users table (Auto Called by webhook).

## Abandoned Cart Trigger

> Detects when a user abandons their cart and triggers a re-engagement flow.
>
> - **Backend Integration Requirements :** Expose a POST endpoint `/abandoned_cart` that returns a game URL for the user. (with user_id in query params and cart_json in state params)

Fetches cart/user details, checks if cart value meets a threshold, and sends an SMS with a game link for a discount if not purchased. If purchased, sends a thank-you SMS.
**Notes:**

- SMS delivery uses Boltic SMS integration.
- Cart/user info is fetched via Fynd Platform APIs and Boltic Tables.
- The workflow logs events and updates abandonment records for analytics.

## Make Coupon

> Generates a personalized coupon for a user and sends it via SMS. Triggered using a POST request to the `/make_coupon` endpoint with the relevant details like coupon code, user id, the coupon body as specified in the "Make Coupon.json"
