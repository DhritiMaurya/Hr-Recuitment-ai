from docx import Document
from pypdf import PdfReader

def extract(document):
    
    replacements = { #Replaces certain text so the computer can read information without crashing
                "\ufffd": "",
                "●": " ",
                "•": " ",
                "▪": " ",
                "◦": " ",
                "–": "-",
                "—": "-"
            }
    
    if ".pdf" in document:
        reader = PdfReader(document) #Read the PDF

        resume_pages = [] #We add all pages to this list

        for page in reader.pages: #Reads each page of resume
        
            page_text = page.extract_text() #We read the page

            for old, new in replacements.items(): #Replace any old (buggy) text with new text within the page
                page_text = page_text.replace(old, new)

            resume_pages.append(page_text) #Adds the edited page the resume_page list 


        return "\n".join(resume_pages) # Combine all pages to form the new and text edited resume
    

    elif ".docx" in document:
        
        text = ""
        file = Document(document) #Laod the document
        
        for p in file.paragraphs: #add each sentence in text
            text += p.text + "\n"
            
        for old, new in replacements.items(): #replace any character (e.g. bullet points, hyphens)
            text = text.replace(old, new) #This does the replacements

        return text
