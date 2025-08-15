# Known issues and limitations

- Deleting bundle cannot be done yet by API through ZAF, this is a product limitation for now.
There's a workaround present in the code using an inbound Webhook to start a Zis flow to delete other bundles.
- Pagination is for now not handled.