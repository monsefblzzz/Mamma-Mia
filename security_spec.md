# Security Spec

## Data Invariants
- An order's ID must be a valid string.
- The status of an order must only be updated by authorized staff or admins (for simplicity we might just say anyone can read/write for now, or use anonymous auth if possible). Actually, the app has a store manager concept? Let's check how Auth is done.
