import google.generativeai as genai

# Test the API key
api_key = input("Enter your NEW Gemini API key: ").strip()

try:
    genai.configure(api_key=api_key)
    
    print("\nChecking available models...")
    models = genai.list_models()
    
    print("\nAvailable models for generateContent:")
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            print(f"  - {model.name}")
    
    print("\nTesting with gemini-2.0-flash...")
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content("Say hello in one word")
    print(f"SUCCESS! Response: {response.text}")
    
except Exception as e:
    print(f"\nERROR: {e}")
    print("\nThis API key has quota issues.")
    print("Possible reasons:")
    print("1. The API key was created in a project that already used free tier today")
    print("2. The API key needs billing enabled")
    print("3. The Gemini API is not enabled for this project")
