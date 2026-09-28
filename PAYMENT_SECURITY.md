# VIP payment activation

VIP checkout is intentionally paused. Previously, an authenticated call to
`POST /api/auth/upgrade` granted VIP immediately, and the separate
`AuraFitness/backend` demo accepted an unauthenticated, unsigned JSON webhook.
Neither request proves that a bank transfer occurred. Both self-service grant
paths now fail closed; the frontend does not present its transfer QR.

Do not re-enable checkout by changing only the frontend. Before accepting
payments, integrate a real payment provider and verify incoming events on the
server using the provider's documented signature/authentication method, the
merchant account, amount, currency, unique order reference, transaction status
and transaction ID. Persist orders and processed transaction IDs so a replay
or reused reference cannot grant VIP twice. Match the authenticated customer
to the server-created order and update the premium state only after verification.
Use an actual payment event to test success; never treat a client click or a
customer-provided email as evidence of payment. Handle refunds and cancellation
according to the provider's verified status rather than displaying a refund
claim on downgrade.

Existing premium users can still sign in and downgrade. Polling retains its
session on transient failures; it is not a payment verification mechanism.
