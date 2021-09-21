browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
  console.log(sender);
  console.log(sendResponse);
  console.log("Hello from the background");

  browser.tabs.executeScript({
    file: "content-script.js",
  });
});
