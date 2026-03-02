import asyncio
import google.generativeai as genai

genai.configure(api_key='AIzaSyAkGM1K_PyS7kZW41A4iL5toeKG7Xt8G1s')

async def test():
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = await asyncio.to_thread(model.generate_content, "What is ROS 2? Answer in 2 sentences.")
        print("Response:", response.text)
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
