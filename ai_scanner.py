import json
import anthropic
from parser import extract

SYSTEM_PROMPT = """You are an ATS parser.

Rules:
- Return ONLY valid JSON.
- No markdown.
- No explanations.
- ATS score must be an integer from 0 to 100.
- Extract all technical and professional skills.
- If information is missing, use empty strings or empty arrays.
"""

client = anthropic.Anthropic(api_key="") #input api key


def parse_json_response(raw_text):
    text = raw_text.strip()

    if text.startswith("```"):
        text = text.strip("`").lstrip("json").strip()

    return json.loads(text)

def aiscanner(resume, required_skills):

  prompt = f"""
  Analyze this resume.

  Extract:
  - Name
  - Skills
  - Experience
  - Education

  Compare skills against REQUIRED SKILLS.

  Calculate ATS Score:
  (score = matched required skills / total required skills * 100)

  Return ONLY valid JSON in this exact shape:

  {{
    "name": "",
    "score": 0,
    "skills": [],
    "matched_skills": [],
    "missing_skills": [],
    "experience": {{
      "title": "",
      "company": "",
      "duration": "",
      "description": ""
    }},
    "education": {{
      "degree": "",
      "institution": "",
      "year": ""
    }}
  }}

  REQUIRED SKILLS:
  {required_skills}

  RESUME:
  {resume}
  """

  response = client.messages.create(
  model="claude-haiku-4-5-20251001",
  max_tokens=1500,
  system=SYSTEM_PROMPT,
  messages=[
      {"role": "user", "content": prompt}
  ],
  )

  return parse_json_response(response.content[0].text)


def process_resume(file_path, required_skills):

    text = extract(file_path)

    parsed = aiscanner(text, required_skills)

    return parsed

if __name__ == "__main__":
    print(process_resume("ALyssa Gregory.docx", ["Bilingual", "Communication", "Customer Service"])["score"])
    
