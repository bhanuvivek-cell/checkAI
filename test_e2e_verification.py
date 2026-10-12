import urllib.request
import urllib.parse
import json
import sqlite3
import sys

def test_endpoint(url, method="GET", payload=None):
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    data = json.dumps(payload).encode("utf-8") if payload else None
    try:
        with urllib.request.urlopen(req, data=data, timeout=10) as res:
            body = res.read().decode("utf-8")
            return res.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        return e.code, body
    except Exception as e:
        return 0, str(e)

def main():
    print("=================================================================")
    print("   ASSUMPTION CHECK AI - END-TO-END SYSTEM VERIFICATION AUDIT    ")
    print("=================================================================\n")

    results = []

    # 1. Frontend Server Availability (Port 5173)
    try:
        with urllib.request.urlopen("http://127.0.0.1:5173/", timeout=5) as res:
            status = res.status
            content = res.read().decode("utf-8")
            has_root = '<div id="root">' in content
            passed = status == 200 and has_root
            results.append(("Frontend Server (Port 5173) HTML Rendering", passed, f"HTTP {status}, root div present: {has_root}"))
    except Exception as e:
        results.append(("Frontend Server (Port 5173) HTML Rendering", False, str(e)))

    # 2. Frontend-to-Backend Proxy Verification (Port 5173 -> /api/health)
    status, data = test_endpoint("http://127.0.0.1:5173/api/health")
    passed = status == 200 and isinstance(data, dict) and data.get("status") == "healthy"
    results.append(("Frontend Vite Proxy (/api -> Port 8000)", passed, f"HTTP {status}, status: {data.get('status') if isinstance(data, dict) else data}"))

    # 3. Backend Direct Health & Missing API Key Handling (Port 8000)
    status, data = test_endpoint("http://127.0.0.1:8000/api/health")
    is_demo = data.get("demo_mode") is True if isinstance(data, dict) else False
    has_db = "SQLite" in data.get("database", "") if isinstance(data, dict) else False
    passed = status == 200 and is_demo and has_db
    results.append(("Backend Health & Demo Mode Fallback", passed, f"HTTP {status}, demo_mode: {is_demo}, db: {data.get('database') if isinstance(data, dict) else 'none'}"))

    # 4. Input Validation (Reject input < 5 chars)
    status, data = test_endpoint("http://127.0.0.1:8000/api/analyze", method="POST", payload={"text": "no", "category": "General Assumption"})
    passed = status == 422
    results.append(("API Input Validation (< 5 chars rejected)", passed, f"HTTP {status} (Expected 422)"))

    # 5. Analysis - SUPPORTED Verdict
    status, data = test_endpoint("http://127.0.0.1:8000/api/analyze", method="POST", payload={
        "text": "Daily cardiovascular exercise improves cardiovascular health and stamina.",
        "category": "Fact Check"
    })
    passed = status == 201 and data.get("verdict") == "SUPPORTED" and len(data.get("detected_assumptions", [])) > 0
    results.append(("Analysis Engine: SUPPORTED Verdict", passed, f"HTTP {status}, verdict: {data.get('verdict')}, assumptions: {len(data.get('detected_assumptions', []))}"))
    supported_id = data.get("id")

    # 6. Analysis - CONTRADICTED Verdict
    status, data = test_endpoint("http://127.0.0.1:8000/api/analyze", method="POST", payload={
        "text": "The earth is flat and scientific satellite images are all fabricated.",
        "category": "Fact Check"
    })
    passed = status == 201 and data.get("verdict") == "CONTRADICTED"
    results.append(("Analysis Engine: CONTRADICTED Verdict", passed, f"HTTP {status}, verdict: {data.get('verdict')}"))

    # 7. Analysis - POTENTIALLY RISKY Verdict
    status, data = test_endpoint("http://127.0.0.1:8000/api/analyze", method="POST", payload={
        "text": "I should quit my university degree and put all my savings into an unverified crypto scheme to get fast money.",
        "category": "Risk Analysis"
    })
    passed = status == 201 and data.get("verdict") == "POTENTIALLY RISKY" and len(data.get("potential_risks", [])) > 0
    results.append(("Analysis Engine: POTENTIALLY RISKY Verdict", passed, f"HTTP {status}, verdict: {data.get('verdict')}, risks: {len(data.get('potential_risks', []))}"))
    risky_id = data.get("id")

    # 8. Analysis - CONTEXT DEPENDENT Verdict
    status, data = test_endpoint("http://127.0.0.1:8000/api/analyze", method="POST", payload={
        "text": "Remote work is universally superior to working in an office for every organization.",
        "category": "General Assumption"
    })
    passed = status == 201 and data.get("verdict") == "CONTEXT DEPENDENT"
    results.append(("Analysis Engine: CONTEXT DEPENDENT Verdict", passed, f"HTTP {status}, verdict: {data.get('verdict')}"))

    # 9. Analysis - INSUFFICIENT EVIDENCE Verdict
    status, data = test_endpoint("http://127.0.0.1:8000/api/analyze", method="POST", payload={
        "text": "Product X will succeed soon.",
        "category": "General Assumption"
    })
    passed = status == 201 and data.get("verdict") == "INSUFFICIENT EVIDENCE"
    results.append(("Analysis Engine: INSUFFICIENT EVIDENCE Verdict", passed, f"HTTP {status}, verdict: {data.get('verdict')}"))

    # 10. Multi-Turn Follow-Up Q&A Feature
    if risky_id:
        status, data = test_endpoint("http://127.0.0.1:8000/api/follow-up", method="POST", payload={
            "analysis_id": risky_id,
            "question": "What is the single biggest catastrophic risk if the crypto token drops 90%?"
        })
        passed = status == 200 and len(data.get("answer", "")) > 10 and data.get("analysis_id") == risky_id
        results.append(("Interactive Follow-Up Q&A Persistence", passed, f"HTTP {status}, answer length: {len(data.get('answer', ''))} chars, id: {data.get('id')}"))
    else:
        results.append(("Interactive Follow-Up Q&A Persistence", False, "No parent analysis ID"))

    # 11. History Retrieval and Filtering
    status, data = test_endpoint("http://127.0.0.1:8000/api/history?verdict=SUPPORTED")
    passed = status == 200 and isinstance(data, list) and all(item.get("verdict") == "SUPPORTED" for item in data)
    results.append(("History Query & Verdict Filtering", passed, f"HTTP {status}, retrieved {len(data) if isinstance(data, list) else 0} supported records"))

    # 12. SQLite Database File Persistence Verification
    try:
        conn = sqlite3.connect("backend/assumption_check.db")
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM analysis_records;")
        rec_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM follow_up_records;")
        follow_count = cursor.fetchone()[0]
        conn.close()
        passed = rec_count > 0 and follow_count > 0
        results.append(("SQLite Physical File Persistence", passed, f"analysis_records: {rec_count} rows, follow_up_records: {follow_count} rows"))
    except Exception as e:
        results.append(("SQLite Physical File Persistence", False, str(e)))

    # 13. Single Record Deletion
    if supported_id:
        status, data = test_endpoint(f"http://127.0.0.1:8000/api/history/{supported_id}", method="DELETE")
        passed = status == 200
        # Verify it's gone
        check_status, _ = test_endpoint(f"http://127.0.0.1:8000/api/history/{supported_id}")
        passed = passed and (check_status == 404)
        results.append(("Single Record Deletion Workflow", passed, f"DELETE HTTP {status}, verification GET HTTP {check_status}"))
    else:
        results.append(("Single Record Deletion Workflow", False, "No record ID to delete"))

    # Print summary
    print(f"{'TEST NAME':<45} | {'STATUS':<8} | {'DETAILS'}")
    print("-" * 80)
    all_passed = True
    for name, passed, detail in results:
        status_str = "PASSED" if passed else "FAILED"
        if not passed:
            all_passed = False
        print(f"{name:<45} | {status_str:<8} | {detail}")

    print("\n" + "=" * 80)
    if all_passed:
        print(">>> ALL 13 VERIFICATION TESTS PASSED SUCCESSFULLY! <<<")
    else:
        print(">>> SOME VERIFICATION TESTS FAILED! <<<")
    print("=" * 80)
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()
