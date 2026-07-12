#!/usr/bin/env python3
from pathlib import Path
import re
import sys
import os
import shutil

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]


def clean_html(filename: str) -> str:
    html = (ROOT / filename).read_text(encoding="utf-8")
    html = re.sub(r'<link\s+rel="stylesheet"[^>]*>', '', html, flags=re.I)
    html = re.sub(r'<script\s+src="[^"]+"\s*></script>', '', html, flags=re.I)
    return html


def install_local_storage(page, data):
    page.evaluate(
        """data => {
          window.__storageData = {...data};
          Object.defineProperty(window, 'localStorage', {
            configurable: true,
            value: {
              getItem(key) { return Object.prototype.hasOwnProperty.call(window.__storageData, key) ? window.__storageData[key] : null; },
              setItem(key, value) { window.__storageData[key] = String(value); },
              removeItem(key) { delete window.__storageData[key]; },
              clear() { window.__storageData = {}; },
              key(index) { return Object.keys(window.__storageData)[index] ?? null; },
              get length() { return Object.keys(window.__storageData).length; }
            }
          });
        }""",
        data,
    )


def dump_local_storage(page):
    return page.evaluate("({...window.__storageData})")


def load_page(page, filename: str, storage_data: dict, mobile=False):
    page.set_viewport_size({"width": 390, "height": 844} if mobile else {"width": 1366, "height": 900})
    page.set_content(clean_html(filename), wait_until="domcontentloaded")
    install_local_storage(page, storage_data)
    if filename == "index.html":
        page.add_style_tag(path=str(ROOT / "assets/css/landing.css"))
        page.add_script_tag(path=str(ROOT / "assets/js/landing.js"))
        page.evaluate("window.dispatchEvent(new Event('load'))")
    else:
        page.add_style_tag(path=str(ROOT / "assets/css/styles.css"))
        for script in ["missions-data.js", "storage.js", "mock-evaluator.js", "app.js"]:
            page.add_script_tag(path=str(ROOT / "assets/js" / script))
        page.evaluate("document.dispatchEvent(new Event('DOMContentLoaded', {bubbles: true}))")
    return page


def state(page):
    return page.evaluate("WorldmakerStorage.getState()")


def main():
    with sync_playwright() as p:
        browser_path = os.environ.get("WORLDMAKER_CHROMIUM") or shutil.which("chromium") or shutil.which("google-chrome")
        launch_options = {"headless": True, "args": ["--no-sandbox", "--disable-dev-shm-usage"]}
        if browser_path:
            launch_options["executable_path"] = browser_path
        browser = p.chromium.launch(**launch_options)
        page = browser.new_page()
        storage = {}

        # 1. Required page structure and navigation links.
        for filename, selector in [
            ("index.html", "main"),
            ("hq.html", "#mission-map"),
            ("mission.html", "#submission-form"),
            ("progress.html", "#progress-list"),
            ("parent.html", "#parent-attempts"),
        ]:
            load_page(page, filename, storage)
            expect(page.locator(selector)).to_be_visible()
        load_page(page, "index.html", storage)
        expect(page.locator(".stage")).to_have_count(7)
        expect(page.locator('a.btn-hq[href="hq.html"]')).to_have_count(2)
        required_hrefs = page.locator("a[href]").evaluate_all("els => els.map(a => a.getAttribute('href'))")
        assert "hq.html" in required_hrefs

        # 2. Fresh state and 15-mission map.
        load_page(page, "hq.html", {})
        fresh = state(page)
        assert fresh["unlockedMissions"] == ["V1-M01"]
        expect(page.locator("#mission-map .mission-node")).to_have_count(15)
        expect(page.locator("#mission-map a.mission-node")).to_have_count(1)
        storage = dump_local_storage(page)

        # 3. NEEDS_FIX.
        load_page(page, "mission.html", storage)
        page.locator("details.prototype-tools summary").click()
        page.locator('[data-sample="fix"]').click()
        page.locator("#submission-form").evaluate("form => form.requestSubmit()")
        assert state(page)["latestMockReview"]["status"] == "NEEDS_FIX"
        expect(page.locator("#feedback-status")).to_have_text("Needs Fix")
        storage = dump_local_storage(page)

        # 4. NEEDS_EVIDENCE.
        page.locator('[data-sample="evidence"]').click()
        page.locator("#submission-form").evaluate("form => form.requestSubmit()")
        assert state(page)["latestMockReview"]["status"] == "NEEDS_EVIDENCE"
        expect(page.locator("#feedback-status")).to_have_text("Needs Evidence")
        storage = dump_local_storage(page)

        # 5. APPROVED and schema-shaped object.
        page.locator('[data-sample="approved"]').click()
        page.locator("#submission-form").evaluate("form => form.requestSubmit()")
        approved = state(page)
        assert approved["latestMockReview"]["status"] == "APPROVED"
        expect(page.locator("#feedback-status")).to_have_text("Approved")
        review = approved["latestMockReview"]
        required_fields = {
            "status", "mission_id", "attempt_number", "headline", "approved_requirements",
            "main_problem", "explanation", "next_action", "tests_to_repeat", "hint_level",
            "understanding_question", "parent_summary", "unlock_next_mission", "next_mission_id",
            "confidence", "missing_evidence", "reviewed_evidence", "regressions",
            "suspicious_input_detected", "suspicious_input_note", "block_type"
        }
        assert set(review) == required_fields

        # 6. V1-M02 unlock controlled by application state.
        assert approved["currentMission"] == "V1-M02"
        assert "V1-M02" in approved["unlockedMissions"]
        storage = dump_local_storage(page)

        # 7. Persistence after simulated refresh/new page document.
        before = approved
        load_page(page, "mission.html", storage)
        after = state(page)
        assert before == after
        expect(page.locator("#later-mission-panel")).to_be_visible()
        expect(page.locator("#later-title")).to_have_text("Build the Island")

        # 8. Parent View synchronization and read-only behavior.
        load_page(page, "parent.html", storage)
        expect(page.locator("#parent-current")).to_contain_text("V1-M02")
        expect(page.locator("#parent-status")).to_have_text("Approved")
        expect(page.locator("#parent-approved")).to_contain_text("V1-M01")
        expect(page.locator("#parent-attempts .attempt")).to_have_count(3)
        assert page.get_by_text("Approve Mission", exact=False).count() == 0

        # 9. Reset control.
        page.on("dialog", lambda dialog: dialog.accept())
        page.locator("#reset-progress").click()
        reset = state(page)
        assert reset["unlockedMissions"] == ["V1-M01"]
        assert reset["attempts"] == []
        assert reset["approvedMissions"] == []
        storage = dump_local_storage(page)

        # 10. Responsive layout: no page-level horizontal overflow at 390px.
        for filename in ["index.html", "hq.html", "mission.html", "progress.html", "parent.html"]:
            load_page(page, filename, storage, mobile=True)
            overflow = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
            assert overflow <= 2, f"{filename}: horizontal overflow {overflow}px"

        browser.close()

    print("PASS: navigation/page structure")
    print("PASS: fresh-state Mission 1 lock state")
    print("PASS: NEEDS_FIX")
    print("PASS: NEEDS_EVIDENCE")
    print("PASS: APPROVED and schema fields")
    print("PASS: automatic V1-M02 unlock")
    print("PASS: localStorage persistence across page documents")
    print("PASS: Parent View synchronization")
    print("PASS: Reset Prototype Progress")
    print("PASS: responsive mobile overflow checks")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise
