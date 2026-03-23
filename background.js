async function fetchTweeload(url) {
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();

  const match = text.match(/(https:\/\/downloads\.acxcdn\.com.+?)(?=")/);
  if (!match) {
    throw new Error("No download URL found in response");
  }

  const downloadUrl = match[0];

  const file = await fetch(downloadUrl, { method: "GET" });
  const disposition = file.headers.get("content-disposition") || "";
  const nameMatch = disposition.match(/filename=["']?(.+?)["']?(?:;|$)/);
  const originalName = nameMatch ? nameMatch[1].trim() : `${Date.now()}.mp4`;
  const filename = `twittervideoswoohoo/${originalName}`;

  var isgif = false;
  if (text.includes('</div></div></div><table><tr><th>Resolution</th><th>Download</th></tr><tr><td>Unknown</td><td><a download class="btn download__item__info__actions__button" href="') && filename.endsWith(".mp4")){
    isgif = true;
  }
  if(isgif){
    var media_id = url.split("i/status/")[1];
    var form1 = new FormData();
    form1.append('action', 'fetch');
    form1.append('url', 'https://x.com/i/status/'+media_id);

    response1 = await fetch('https://convertico.com/twitter-gif-downloader/twitter-gif-downloader.php', {
      method: 'POST',
      body: form1
    });
    var parsed = JSON.parse(await response1.text());
    console.log(parsed);


    var form2 = new FormData();
    form2.append('action', 'convert_to_gif');
    form2.append('video_url', parsed.media[0].url);
    form2.append('filename', "twitter-gif-"+media_id);
    form2.append('fps', 20);
    form2.append('width', 800);
    form2.append('lossy', 80);

    response2 = await fetch('https://convertico.com/twitter-gif-downloader/twitter-gif-downloader.php', {
      method: 'POST',
      body: form2
    });

    parsed = JSON.parse(await response2.text());
    console.log(parsed);
    chrome.downloads.download({ url: "https://convertico.com/twitter-gif-downloader/"+parsed.file_url, filename: parsed.filename });
    
  }else{

    const blob = await file.blob();
    const reader = new FileReader();

    reader.onloadend = () => {
      chrome.downloads.download({ url: reader.result, filename: filename });
    };
    reader.readAsDataURL(blob);
  }


  return 1;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "FETCH_TWEELOAD") return true;

  fetchTweeload(msg.url)
    .then((result) => sendResponse(result))
    .catch((err) => {
      console.log(err);
      sendResponse({ error: err.message });
    });

  return true;
});
