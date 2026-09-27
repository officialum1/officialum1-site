import pypdf
import pymupdf

def fill_and_sign():
    input_pdf = "Companies_House_credit_account_application.pdf"
    filled_temp = "temp_filled.pdf"
    final_output = "OfficialUM1_Companies_House_Credit_Account_FILLED.pdf"

    # Step 1: Fill Form Fields using pypdf
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
        "Companies House website": "/Yes",
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

    # Page 3: Trade References & Volume
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

    with open(filled_temp, "wb") as f_out:
        writer.write(f_out)

    # Step 2: Visual Direct Debit & Signature stamping with PyMuPDF
    doc = pymupdf.open(filled_temp)

    # Page 3 Signature
    p3 = doc[2]
    sig_rect_p3 = pymupdf.Rect(65, 608, 320, 638)
    p3.insert_textbox(sig_rect_p3, "Muhammad Umar Mumtaz", fontsize=18, fontname="times-italic", color=(0.05, 0.15, 0.45))

    # Page 6: Direct Debit Mandate
    p6 = doc[5]
    
    # Account Holders
    p6.insert_text((35, 235), "Muhammad Umar Mumtaz / OfficialUM1 LLC", fontsize=11, fontname="helv", color=(0, 0, 0))

    # Account Number: 03905664 (8 digits spaced across boxes)
    acc_num = "03905664"
    start_x = 38
    box_width = 24.5
    for i, ch in enumerate(acc_num):
        p6.insert_text((start_x + i * box_width, 298), ch, fontsize=14, fontname="helv", color=(0, 0, 0))

    # Sort Code: 23 14 86 (3 pairs of 2 digits)
    sort_pairs = ["23", "14", "86"]
    sort_x = [45, 115, 185]
    for pair, x in zip(sort_pairs, sort_x):
        p6.insert_text((x, 363), pair, fontsize=14, fontname="helv", color=(0, 0, 0))

    # Bank Name & Address
    p6.insert_text((120, 442), "Barclays Bank PLC", fontsize=11, fontname="helv", color=(0, 0, 0))
    p6.insert_text((35, 500), "Level 25, 1 Churchill Place", fontsize=11, fontname="helv", color=(0, 0, 0))
    p6.insert_text((35, 518), "London", fontsize=11, fontname="helv", color=(0, 0, 0))
    p6.insert_text((85, 558), "E14 5HP", fontsize=11, fontname="helv", color=(0, 0, 0))

    # Page 6 Signature & Date
    sig_rect_p6 = pymupdf.Rect(320, 498, 520, 528)
    p6.insert_textbox(sig_rect_p6, "Muhammad Umar Mumtaz", fontsize=18, fontname="times-italic", color=(0.05, 0.15, 0.45))

    p6.insert_text((320, 560), "27/09/2026", fontsize=11, fontname="helv", color=(0, 0, 0))

    doc.save(final_output)
    doc.close()
    
    import os
    if os.path.exists(filled_temp):
        os.remove(filled_temp)

    print(f"Generated 100% complete and signed application: {final_output}")

if __name__ == "__main__":
    fill_and_sign()
