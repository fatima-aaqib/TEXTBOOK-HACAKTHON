import google.generativeai as genai

genai.configure(api_key='AIzaSyAVLM5sWgjmCJHo1dyzXWOevSNGBWc318U')

print("Available models:")
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"  - {model.name}")
