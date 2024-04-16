# Reverse Proxy

An HTTP reverse proxy implemented in nodejs with the following capapibilies:

- Forwarding requests to a specified backend server configured by regex path
- Rate limiting request per client.
- Whitelisted clients ips that bypasses the rate limiter.
- Collects metrics of use by regex paths.
- Obtain query string access token for requested resources.
- Configurable path for required access token.
- Logs all request and responses in mongodb.
- Custom error pages for different status codes.
- Custom error pages for specific http status codes.
