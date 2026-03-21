async function fetchTweeload(url) {
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();

  const match = text.match(/(https:\/\/downloads\.acxcdn\.com.+?)(?=")/);
  if (!match) {
    throw new Error("No download URL found in response");
  }

  const downloadUrl = match[0];

  const head = await fetch(downloadUrl, { method: "HEAD" });
  const disposition = head.headers.get("content-disposition") || "";
  const nameMatch = disposition.match(/filename=["']?(.+?)["']?(?:;|$)/);
  const originalName = nameMatch ? nameMatch[1].trim() : `${Date.now()}.mp4`;
  const filename = `twittervideoswoohoo/${originalName}`;

  chrome.downloads.download({ url: downloadUrl, filename: filename});

  return { downloadUrl };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "FETCH_TWEELOAD") return true;

  fetchTweeload(msg.url)
    .then((result) => sendResponse(result))
    .catch((err) => {
      alert("err demande a noctu ou cplc jsp");
      sendResponse({ error: err.message });
    });

  return true;
});
