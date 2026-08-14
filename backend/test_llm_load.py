import asyncio
import time
import httpx
from typing import Dict

# The endpoint we want to test. Ensure your backend is running on port 8000!
# We will test the "Ask Fred" endpoint for meeting ID 1.
# (Make sure meeting ID 1 exists in your DB, which it does if you ran seed_data.py)
API_URL = "http://localhost:8000/api/v1/meetings/1/ask"

# Load test parameters
CONCURRENT_REQUESTS = 5    # Number of parallel requests
TOTAL_REQUESTS = 20        # Total number of requests to send

# Test questions to cycle through
QUESTIONS = [
    "What were the main action items?",
    "Did anyone mention the budget?",
    "Summarize the Q3 product roadmap discussion.",
    "Who is responsible for the mobile app redesign?",
    "Were there any delays mentioned for the enterprise dashboard?",
]


async def fetch_ask_fred(client: httpx.AsyncClient, index: int, question: str) -> Dict:
    start_time = time.time()
    payload = {"question": question}
    
    try:
        response = await client.post(API_URL, json=payload, timeout=45.0)
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            return {
                "id": index,
                "status": "success",
                "status_code": response.status_code,
                "duration": duration,
                "answer_length": len(data.get("answer", "")),
                "error": None
            }
        else:
            return {
                "id": index,
                "status": "error",
                "status_code": response.status_code,
                "duration": duration,
                "answer_length": 0,
                "error": response.text
            }
            
    except Exception as e:
        duration = time.time() - start_time
        return {
            "id": index,
            "status": "exception",
            "status_code": None,
            "duration": duration,
            "answer_length": 0,
            "error": str(e)
        }


async def run_load_test():
    print(f"🚀 Starting LLM Reliability & Limit Test...")
    print(f"🎯 Target: {API_URL}")
    print(f"⚙️ Config: {TOTAL_REQUESTS} total requests, {CONCURRENT_REQUESTS} concurrently.\n")
    
    # We use a semaphore to limit concurrency to avoid instant connection drops
    semaphore = asyncio.Semaphore(CONCURRENT_REQUESTS)
    
    async def bounded_fetch(client, index, question):
        async with semaphore:
            # Add a tiny delay between starting requests to avoid perfect synchronicity
            await asyncio.sleep(0.1 * (index % 5))
            return await fetch_ask_fred(client, index, question)
            
    start_time = time.time()
    
    async with httpx.AsyncClient() as client:
        tasks = []
        for i in range(TOTAL_REQUESTS):
            q = QUESTIONS[i % len(QUESTIONS)]
            tasks.append(bounded_fetch(client, i+1, q))
            
        print("⏳ Firing requests and waiting for LLM responses...\n")
        results = await asyncio.gather(*tasks)
        
    total_time = time.time() - start_time
    
    # Analyze results
    success_count = sum(1 for r in results if r["status"] == "success")
    error_count = sum(1 for r in results if r["status"] != "success")
    
    durations = [r["duration"] for r in results if r["status"] == "success"]
    avg_duration = sum(durations) / len(durations) if durations else 0
    max_duration = max(durations) if durations else 0
    min_duration = min(durations) if durations else 0
    
    print("-" * 50)
    print("📊 LOAD TEST RESULTS (Gemini)")
    print("-" * 50)
    print(f"Total Requests: {TOTAL_REQUESTS}")
    print(f"Successful:   ✅ {success_count} ({(success_count/TOTAL_REQUESTS)*100:.1f}%)")
    print(f"Failed:       ❌ {error_count} ({(error_count/TOTAL_REQUESTS)*100:.1f}%)")
    print(f"Total Time:   ⏱️ {total_time:.2f} seconds")
    print(f"Avg Latency:  ⚡ {avg_duration:.2f} seconds")
    print(f"Min Latency:  🚀 {min_duration:.2f} seconds")
    print(f"Max Latency:  🐢 {max_duration:.2f} seconds")
    print("-" * 50)
    
    if error_count > 0:
        print("\n⚠️ Errors encountered (Rate limits / Timeouts):")
        for r in results:
            if r["status"] != "success":
                print(f"  Req {r['id']}: [HTTP {r['status_code']}] {r['error']}")


if __name__ == "__main__":
    # Ensure asyncio works nicely on Windows
    import sys
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
    asyncio.run(run_load_test())
