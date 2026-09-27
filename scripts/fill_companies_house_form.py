import pypdf
import pymupdf

def fill_all_pages():
    input_pdf = "Companies_House_credit_account_application.pdf"
    filled_temp = "temp_filled.pdf"
    final_output = "OfficialUM1_Companies_House_Credit_Account_FILLED.pdf"

    # Step 1: Base Form Fields with pypdf
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

    # Page 2: Primary Contact
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

    # Step 2: PyMuPDF - Draw Ballpoint Blue Ink & Realistic Handwritten Signatures
    doc = pymupdf.open(filled_temp)
    BLUE_INK = (0.04, 0.14, 0.52)  # Royal Blue Ballpoint Pen Ink

    # ----------------------------------------------------
    # PAGE 2: Section 6 Character Boxes (hello@officialum1.com)
    # ----------------------------------------------------
    p2 = doc[1]
    email_str = "hello@officialum1.com"
    start_x_p2 = 163
    box_w_p2 = 13.8
    y_row1_p2 = 490
    for idx, char in enumerate(email_str):
        p2.insert_text((start_x_p2 + idx * box_w_p2, y_row1_p2), char.upper(), fontsize=11, fontname="courier", color=BLUE_INK)

    # ----------------------------------------------------
    # PAGE 3: Section 12 Handwritten Signature & Flourish
    # ----------------------------------------------------
    p3 = doc[2]
    # Handwritten signature text
    p3.insert_text((75, 626), "M. Umar Mumtaz", fontsize=22, fontname="times-italic", color=BLUE_INK)
    # Realistic pen flourish underline
    shape3 = p3.new_shape()
    shape3.draw_bezier(
        pymupdf.Point(72, 632),
        pymupdf.Point(140, 638),
        pymupdf.Point(210, 628),
        pymupdf.Point(265, 633)
    )
    shape3.finish(color=BLUE_INK, width=1.4)
    shape3.commit()

    # ----------------------------------------------------
    # PAGE 6: Direct Debit Mandate (Ballpoint Blue Ink Writing)
    # ----------------------------------------------------
    p6 = doc[5]
    
    # Account Holders
    p6.insert_text((35, 235), "Muhammad Umar Mumtaz", fontsize=12, fontname="times-bold", color=BLUE_INK)
    p6.insert_text((35, 250), "OfficialUM1 LLC", fontsize=10, fontname="times-italic", color=BLUE_INK)

    # 8-Digit Account Number: 03905664 (Ballpoint ink in boxes)
    acc_num = "03905664"
    start_x_acc = 38
    box_w_acc = 24.5
    for i, digit in enumerate(acc_num):
        p6.insert_text((start_x_acc + i * box_w_acc, 298), digit, fontsize=15, fontname="courier", color=BLUE_INK)

    # 6-Digit Sort Code: 23 14 86 (Ballpoint ink in pairs)
    sort_pairs = ["23", "14", "86"]
    sort_x = [45, 115, 185]
    for pair, x in zip(sort_pairs, sort_x):
        p6.insert_text((x, 363), pair, fontsize=15, fontname="courier", color=BLUE_INK)

    # Bank Name & Full Postal Address in Ballpoint Ink
    p6.insert_text((120, 442), "Barclays Bank PLC", fontsize=11, fontname="times-bold", color=BLUE_INK)
    p6.insert_text((35, 498), "Level 25, 1 Churchill Place", fontsize=11, fontname="times-roman", color=BLUE_INK)
    p6.insert_text((35, 516), "London", fontsize=11, fontname="times-roman", color=BLUE_INK)
    p6.insert_text((85, 558), "E14 5HP", fontsize=11, fontname="times-bold", color=BLUE_INK)

    # Handwritten Signature on Page 6
    p6.insert_text((325, 516), "M. Umar Mumtaz", fontsize=22, fontname="times-italic", color=BLUE_INK)
    shape6 = p6.new_shape()
    shape6.draw_bezier(
        pymupdf.Point(322, 523),
        pymupdf.Point(380, 528),
        pymupdf.Point(440, 520),
        pymupdf.Point(485, 524)
    )
    shape6.finish(color=BLUE_INK, width=1.4)
    shape6.commit()

    # Date in Ballpoint Ink
    p6.insert_text((325, 560), "27 / 09 / 2026", fontsize=12, fontname="times-roman", color=BLUE_INK)

    doc.save(final_output)
    doc.close()
    
    import os
    if os.path.exists(filled_temp):
        os.remove(filled_temp)

    print(f"Successfully generated 100% complete ballpoint-signed application: {final_output}")

if __name__ == "__main__":
    fill_all_pages()
