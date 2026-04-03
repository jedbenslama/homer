async function convertMp4BlobToGif(blob, fps = 10, quality = 10, width = 0) {
  // ensure the offscreen document exists
  const offscreenUrl = "offscreen.html";
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [chrome.runtime.getURL(offscreenUrl)]
  });
  if (!contexts.length) {
    await chrome.offscreen.createDocument({
      url: offscreenUrl,
      reasons: ["DOM_PARSER"],
      justification: "Convert MP4 video frames to GIF using canvas and video elements"
    });
  }

  // read blob as data URL to pass via messaging
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

  // send to offscreen document for conversion
  const response = await chrome.runtime.sendMessage({
    type: "CONVERT_MP4_TO_GIF",
    dataUrl,
    fps,
    quality,
    width
  });

  if (response.error) throw new Error(response.error);
  return response.gifDataUrl;
}

async function downloadFileUrl(responsegraphql){
  try{
    responsegraphql.data.tweet_result_by_rest_id.result.legacy.entities.media.forEach(async (element) => {
      if(element.type=="photo"){
        filename = element.media_url_https.split("/media/")[1];
        const file = await fetch(element.media_url_https, { method: "GET" });
        const blob = await file.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          chrome.downloads.download({ url: reader.result, filename: filename });
        };
        reader.readAsDataURL(blob);
      }else{
          isgif = element.video_info.variants[1] ? false : true;
          filename = 'twittervideoswoohoo/' + (element.video_info.variants[1] ? element.video_info.variants[1].url.match(/(?<=.+?x.+?\/).+?\..+?(?=\?)/)[0] : element.video_info.variants[0].url.split("tweet_video/")[1]);
          
          if(!isgif){
            const file = await fetch(element.video_info.variants[element.video_info.variants.length - 1].url, { method: "GET" });
            const blob = await file.blob();
            const reader = new FileReader();

            reader.onloadend = () => {
              chrome.downloads.download({ url: reader.result, filename: filename });
            };
            reader.readAsDataURL(blob)
        }else{
          filename = filename.replace(".mp4", '.gif');
          const file = await fetch(element.video_info.variants[element.video_info.variants.length - 1].url, { method: "GET" });
          const blob = await file.blob();
          const gifDataUrl = await convertMp4BlobToGif(blob);
          chrome.downloads.download({ url: gifDataUrl, filename: filename });
        };
      }
      });
  }catch(e){
    responsegraphql.data.tweet_result_by_rest_id.result.quoted_tweet_results.result.legacy.entities.media.forEach(async (element) => {
      if(element.type=="photo"){
        filename = element.media_url_https.split("/media/")[1];
        const file = await fetch(element.media_url_https, { method: "GET" });
        const blob = await file.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          chrome.downloads.download({ url: reader.result, filename: filename });
        };
        reader.readAsDataURL(blob);
      }else{
          isgif = element.video_info.variants[1] ? false : true;
          filename = 'twittervideoswoohoo/' + (element.video_info.variants[1] ? element.video_info.variants[1].url.match(/(?<=.+?x.+?\/).+?\..+?(?=\?)/)[0] : element.video_info.variants[0].url.split("tweet_video/")[1]);
          if(!isgif){
          const file = await fetch(element.video_info.variants[element.video_info.variants.length - 1].url, { method: "GET" });
          const blob = await file.blob();
          const reader = new FileReader();

          reader.onloadend = () => {
            chrome.downloads.download({ url: reader.result, filename: filename });
          };
          reader.readAsDataURL(blob);
        }else{
          filename = filename.replace(".mp4", '.gif');
          const file = await fetch(element.video_info.variants[element.video_info.variants.length - 1].url, { method: "GET" });
          const blob = await file.blob();
          const gifDataUrl = await convertMp4BlobToGif(blob);
          chrome.downloads.download({ url: gifDataUrl, filename: filename });
        }
      }
      });
  }
  return 1;

}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if(msg.type == "DOWNLOAD_FILE_URL"){
    downloadFileUrl(msg.responsegraphql)
      .then((result) => sendResponse(result))
      .catch((err) => {
        console.log(err);
        sendResponse({ error: err.message });
      });;
  }

    
  return true;
});
