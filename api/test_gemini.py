import asyncio
import google.generativeai as genai

genai.configure(api_key='AIzaSyAVLM5sWgjmCJHo1dyzXWOevSNGBWc318U')

async def test():
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = await asyncio.to_thread(model.generate_content, "What is ROS 2?")
    print("Response:", response.text)

asyncio.run(test())
