console.log("Hello from the content-script");

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received from the background script");
  console.log(request);
  console.log(sender);
  console.log(sendResponse);

  if (request.type === "words") {
    console.log("Words received from the background script");
    const randomWord =
      request.words[Math.floor(Math.random() * request.words.length)];
    console.log(randomWord);

    const dd = findNodeByContent(randomWord);
    console.log(dd);
  }
  // sendResponse({
  //     message: "Hello from the content-script"
  // });
});

const findNodeByContent = (text, root = document.body) => {
  console.log("findNodeByContent");
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  const nodeList = [];

  while (treeWalker.nextNode()) {
    const node = treeWalker.currentNode;

    if (node.nodeType === Node.TEXT_NODE && wordInString(node.textContent, text)) {
      console.log(node);

      //replace text with translation span
      // node.parentNode.innerHtml = node.parentNode.innerHtml.replace(
      //   text,
      //   `<span>Bora uhai</span>`
      // );


      node.parentNode.innerHtml.replace(
        text,
        `<span>Bora uhai</span>`
      );

      node.parentNode.style.backgroundColor = "yellow";


      nodeList.push(node.parentNode);
      // node.style.backgroundColor = "yellow";
    }
  }

  return nodeList;
};

const wordInString = (s, word) => new RegExp('\\b' + word + '\\b', 'i').test(s);
