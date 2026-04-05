# Test Design Specifications (IEEE 829 Standard)
**Project:** Customizable Inventory Management System
**Prepared by:** QA Automation Team

## 1. Test Design Specification Identifier
`CIMS-TDS-001`

## 2. White Box Test Cases (Branch Coverage)

### Objective:
Assure robust logic for cryptographic security primitives (`backend/app/core/security.py`).

| Case ID | Function Tested | Branch Scenario | Expected Outcome |
|---------|-----------------|-----------------|------------------|
| WB-01 | `hash_password` & `verify_password` | Valid payload hash / Good match boolean branch | Password transforms and verifies `True` |
| WB-02 | `verify_password` | Bad match boolean branch | Function returns `False` without exception |
| WB-03 | `create_access_token` | `org_id is None` branch | Token created with standard scopes only |
| WB-04 | `create_access_token` | `org_id is not None` branch | Token incorporates `org_id` inside payload |
| WB-05 | `_encode_token` | PyJWT returning `bytes` (v1) | Bytes block safely decoded to string |
| WB-06 | `_encode_token` | PyJWT returning `string` (v2) | Pass-through mapping maintained |

## 3. Black Box Test Cases (BVA & EP)

### Objective:
Verify boundary conditions for API Registration.

| Case ID | Input Vector (Equivalence Partition) | Payload | Expected Outcome |
|---------|--------------------------------------|---------|------------------|
| BB-01 | Invalid Email Partition (No Domain) | `email: "bad-email"` | HTTP 422 - Unprocessable Entity |
| BB-02 | Valid Partition Limit | `email: "@test.com"` | HTTP 422 (Pydantic failure schema) |
| BB-03 | Missing Fields Partition | `email: "a@a.com"` (no pass/name) | HTTP 422 |
| BB-04 | Boundary Value Analysis (Price Validation)| `unit_price: -5.00` | HTTP 4XX / Validation Rejection |

## 4. UI Automation Test Cases (Selenium)

### Objective:
Ensure high-level UI workflows boot correctly.

| Case ID | Path Navigated | Condition Examined | Expected Outcome |
|---------|----------------|--------------------|------------------|
| UI-01 | `GET /` | Window title properties | Title reads "Inventory..." |
| UI-02 | `GET /login` | DOM elements visibility | Email & Password `input` nodes exist and are manipulable |
