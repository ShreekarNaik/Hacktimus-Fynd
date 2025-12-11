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
