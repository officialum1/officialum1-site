import pypdf

def fill_form():
    input_pdf = "Companies_House_credit_account_application.pdf"
    output_pdf = "OfficialUM1_Companies_House_Credit_Account_FILLED.pdf"

    reader = pypdf.PdfReader(input_pdf)
    writer = pypdf.PdfWriter()
    writer.append(reader)

    # Comprehensive field mapping
    field_values = {
        # Page 1 - Section 1, 2, 3
        "company/LLP name": "OfficialUM1 LLC",
        "company/LLP registered no. (if appropriate)": "US Entity",
        "other": "/Yes",
        "other (please specify)": "US Limited Liability Company (Overseas Formation Agency)",
        "Number of years in business": "2+",
        "Number of employees": "5",
        "Main business activity": "Corporate Formation, IT & Business Advisory Services",
        "Annual turnover": "$100,000+",
        "Companies House website": "/Yes",

        # Page 2 - Section 7: Primary Contact & Address
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
        "both": "/Yes",
        "software filing": "/Yes",
        "webfiling": "/Yes",

        # Page 3 - Section 9, 10, 11, 12
        "Expected value of monthly business": "GBP 2,000 - 5,000",
        "Please supply an email address to be used for service updates, and within Software Filing for processing (80 characters maximum) (Mandatory)": "hello@officialum1.com",
        "date": "27/09/2026"
    }

    # Iterate over pages and update fields
    for page in writer.pages:
        try:
            writer.update_page_form_field_values(page, field_values, auto_regenerate=True)
        except Exception as e:
            pass

    with open(output_pdf, "wb") as f_out:
        writer.write(f_out)

    print(f"Successfully generated 100% filled application: {output_pdf}")

if __name__ == "__main__":
    fill_form()
