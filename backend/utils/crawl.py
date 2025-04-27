import asyncio, hashlib
from urllib.parse import urlparse
from playwright.async_api import async_playwright


async def safe_goto(page, url, retries=3):
    for attempt in range(retries):
        try:
            await page.goto(url, timeout=10000)
            await page.wait_for_load_state("domcontentloaded")
            return True
        except Exception as e:
            print(f"Attempt {attempt + 1} failed for {url}: {e}")
    print(f"❌ Giving up on {url}")
    return False


async def get_page_html(page):
    return await page.content()


def hash_html(content):
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


async def get_page_links(page, base_domain):
    links = await page.eval_on_selector_all(
        "a[href]", "elements => elements.map(el => el.href)"
    )
    return {link for link in links if urlparse(link).netloc == base_domain}


async def crawl_target_site(target_url: str):
    base_domain = urlparse(target_url).netloc
    page_htmls = {}
    seen = set()
    to_visit = {target_url}
    discovered_pages = []
    html_snapshots = {}

    print("🚀 Starting Smart Crawl...")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        while (
            to_visit and len(discovered_pages) < 5
        ):  ##SWITCH ON/OFF FOR CRAWLING LIMIT HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            url = to_visit.pop()
            print(f"🌐 Visiting: {url}")
            seen.add(url)

            if not await safe_goto(page, url):
                continue

            # 🎯 Capture visible elements at the page level
            visible_element_texts = set()

            try:
                visible_elements = await page.query_selector_all(
                    "button, a, input, select, textarea, label, details, summary"
                )
                for el in visible_elements:
                    if await el.is_visible():
                        try:
                            text_content = (await el.inner_text()).strip()
                            if text_content:
                                visible_element_texts.add(text_content)
                        except:
                            continue
            except Exception as e:
                print(f"⚠️ Could not capture visible elements: {e}")

            # 🖱️ Simulate hover over all possible elements before scanning
            hover_targets = await page.query_selector_all("img, div, figure, button, a")

            for el in hover_targets:
                try:
                    if await el.is_visible():
                        await el.hover()
                        await asyncio.sleep(0.2)  # short wait for menu to appear
                except Exception as e:
                    print(f"⚠️ Could not hover over element: {e}")

            await asyncio.sleep(1.5)  # wait for dynamic menus

            # 🎯 3. RE-capture visible elements AFTER hover
            visible_element_texts.clear()
            try:
                visible_elements = await page.query_selector_all(
                    "button, a, input, select, textarea, label, details, summary"
                )
                for el in visible_elements:
                    if await el.is_visible():
                        try:
                            text_content = (await el.inner_text()).strip()
                            if text_content:
                                visible_element_texts.add(text_content)
                        except:
                            continue
            except Exception as e:
                print(f"⚠️ Could not re-capture visible elements: {e}")

            # 📄 4. THEN capture final HTML for splitting into chunks

            html = await get_page_html(page)
            html_hash = hash_html(html)

            if html_hash in html_snapshots.values():
                print(f"⚡ Skipping duplicate page: {url}")
                continue

            discovered_pages.append(url)
            html_snapshots[url] = html_hash
            page_htmls[url] = html[:15000]  # Optional: truncate huge HTMLs

            links = await get_page_links(page, base_domain)
            for link in links:
                if link not in seen and link not in to_visit:
                    to_visit.add(link)

        await browser.close()

    print(f"✅ Found {len(discovered_pages)} pages.")

    from pprint import pprint

    pprint(discovered_pages)

    return discovered_pages, visible_element_texts


# example output
"""
['https://the-internet.herokuapp.com/',
 'https://the-internet.herokuapp.com/exit_intent',
 'https://the-internet.herokuapp.com/upload',
 'https://the-internet.herokuapp.com/digest_auth',
 'https://the-internet.herokuapp.com/abtest']
"""

if __name__ == "__main__":
    asyncio.run(crawl_target_site("https://the-internet.herokuapp.com/"))
