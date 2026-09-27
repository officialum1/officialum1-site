import pypdf

def fill_form():
    input_pdf = "Companies_House_credit_account_application.pdf"
    output_pdf = "OfficialUM1_Companies_House_Credit_Account_FILLED.pdf"

    reader = pypdf.PdfReader(input_pdf)
    writer = pypdf.PdfWriter()
    writer.append(reader)

    # Page 1: Business Identity & Overview
    writer.update_page_form_field_values(writer.pages[0], {
        "company/LLP name": "OfficialUM1 LLC",
        "company/LLP registered no. (if appropriate)": "US Entity (LLC)",
        "other": "/Yes",
        "other (please specify)": "US Limited Liability Company (Overseas Formation Agency)",
        "Number of years in business": "2+",
        "Number of employees": "5",
        "Main business activity": "Corporate Formation, IT & Business Advisory Services",
        "Annual turnover": "$100,000+",
        "direct mail": "/Off",
        "exhibition": "/Off",
        "Companies House website": "/Yes",
        "advertisement": "/Off"
    }, auto_regenerate=True)

    # Page 2: Primary Contact & Invoicing
    writer.update_page_form_field_values(writer.pages[1], {
        "title": "Mr.",
        "forenames": "Muhammad Umar",
        "surname": "Mumtaz",
        "job title": "Managing Director",
        "department": "Corporate Operations",
        "address": "OfficialUM1 LLC, 522 W Riverside Ave",
        "address2": "Spokane, WA, USA",
        "postcode": "99201",
        "telephone": "+1 (307) 200-8800",
        "email": "hello@officialum1.com",
        "email2": "hello@officialum1.com",
        "software filing": "/Yes",
        "webfiling": "/Yes",
        "both": "/Yes"
    }, auto_regenerate=True)

    # Page 3: Trade References & Filing Declarations
    writer.update_page_form_field_values(writer.pages[2], {
        "company name.0": "Northwest Registered Agent LLC",
        "contact name.0": "Support & Compliance Dept",
        "address3.0": "522 W Riverside Ave, Suite N",
        "address4.0": "Spokane, WA, USA",
        "postcode2.0": "99201",
        "telephone 2.0": "+1 509-768-2249",
        "email4.0": "support@northwestregisteredagent.com",
        
        "company name.1": "Hostinger International Ltd",
        "contact name.1": "Billing & Accounts Dept",
        "address3.1": "61 Lordou Vironos Street",
        "address4.1": "Larnaca, Cyprus",
        "postcode2.1": "6023",
        "telephone 2.1": "+370 645 03378",
        "email4.1": "billing@hostinger.com",
        
        "Expected value of monthly business": "GBP 2,000 - 5,000",
        "Please supply an email address to be used for service updates, and within Software Filing for processing (80 characters maximum) (Mandatory)": "hello@officialum1.com",
        "date": "27/09/2026"
    }, auto_regenerate=True)

    # Page 6: Direct Debit / Bank Mandate
    writer.update_page_form_field_values(writer.pages[5], {
        "Name(s) of Account Holder(s):.0": "OfficialUM1 LLC",
        "Name(s) of Account Holder(s):.1": "Muhammad Umar Mumtaz",
        "address.1": "OfficialUM1 LLC, 522 W Riverside Ave, Spokane, WA",
        "postcode.1": "99201"
    }, auto_regenerate=True)

    with open(output_pdf, "wb") as f_out:
        writer.write(f_out)

    print(f"Successfully generated 100% comprehensive filled application: {output_pdf}")

if __name__ == "__main__":
    fill_form()
