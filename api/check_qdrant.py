import asyncio
from app.utils.vector_store import get_qdrant_client

async def check():
    client = get_qdrant_client()
    cols = await client.get_collections()
    print('Collections:', [c.name for c in cols.collections])
    
    # Check points count
    for col in cols.collections:
        info = await client.get_collection(col.name)
        print(f'Collection {col.name}: {info.points_count} points')

asyncio.run(check())
