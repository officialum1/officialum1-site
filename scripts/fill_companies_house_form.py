import pypdf

def fill_form():
    input_pdf = "Companies_House_credit_account_application.pdf"
    output_pdf = "OfficialUM1_Companies_House_Credit_Account_FILLED.pdf"

    reader = pypdf.PdfReader(input_pdf)
    writer = pypdf.PdfWriter()
    writer.append(reader)

    # Dictionary of field values
    field_values = {
        # Section 1: Presenter Details
        "company/LLP name": "OfficialUM1 LLC",
        "company/LLP registered no": "US Entity",
        "company/LLP registered no. (if appropriate)": "US Entity",
        
        # Section 2: Trading Status
        "other": "/Yes",
        "other (please specify)": "US Limited Liability Company (Overseas Formation Agency)",
        
        # Section 3: Business Activity
        "Number of years in business": "2+",
        "Number of employees": "5",
        "Main business activity": "Corporate Formation, IT & Business Advisory Services",
        "Annual turnover": "$100,000+",
        
        # Section 6: Electronic Invoicing
        "Contact name": "Muhammad Umar Mumtaz",
        "Job title": "Managing Director",
        "Email address": "hello@officialum1.com",
        "Telephone number": "+1 (307) 200-8800",
        
        # Section 7: Primary Contact & Address
        "Title": "Mr.",
        "Forename(s)": "Muhammad Umar",
        "Surname": "Mumtaz",
        "Contact name.1": "Muhammad Umar Mumtaz",
        "Job title.1": "Managing Director",
        "Email address.1": "hello@officialum1.com",
        "Website address": "https://officialum1.com",
        
        # Section 8: Method of filing
        "Both": "/Yes",
        "both": "/Yes",
        "Software": "/Yes",
        "WebFiling": "/Yes",
        
        # Section 9: Trade References
        "1. Company name": "Northwest Registered Agent LLC",
        "Contact name.2": "Support & Billing Dept",
        "Address": "522 W. Riverside Ave, Suite N, Spokane, WA",
        "Postcode": "99201",
        "Email address.2": "support@northwestregisteredagent.com",
        
        "2. Company name": "Hostinger International Ltd",
        "Contact name.3": "Billing Dept",
        "Address": "61 Lordou Vironos Street, 6023 Larnaca",
        "Postcode": "6023",
        "Email address.3": "billing@hostinger.com",
        
        # Section 11: Software notification
        "Email address.4": "hello@officialum1.com",
        
        # Section 12: Declaration
        "Print name": "Muhammad Umar Mumtaz",
        "Position": "Managing Director",
        "Date": "2026-09-27"
    }

    # Update page fields
    for page in writer.pages:
        writer.update_page_form_field_values(page, field_values, auto_regenerate=True)

    with open(output_pdf, "wb") as f_out:
        writer.write(f_out)

    print(f"Successfully generated pre-filled application: {output_pdf}")

if __name__ == "__main__":
    fill_form()
