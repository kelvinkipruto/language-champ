// const fs = require("fs");
const fetch = require("node-fetch");

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
  console.log(sender);
  console.log(sendResponse);
  console.log("Hello from the background");

  browser.tabs.executeScript({
    file: "content-script.js",
  });
});

browser.runtime.onInstalled.addListener(async (details) => {
  console.log("onInstalled", details);
  await checkIfCommonWordsSet();
});

// browser.tabs.onCreated.addListener((details) => {
//   console.log("New tab opened :" + details)
//   console.log(details.url)
//   console.log(details.id)
// })

// function getPageBody() {
//   return document.documentElement.outerHTML;
// }

function DOMtoString(document_root) {
  // console.log("DOMtoString");
  // console.log(document_root);
  var html = "",
    node = document_root.firstChild;
  while (node) {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        html += node.outerHTML;
        break;
      case Node.TEXT_NODE:
        html += node.nodeValue;
        break;
      case Node.CDATA_SECTION_NODE:
        html += "<![CDATA[" + node.nodeValue + "]]>";
        break;
      case Node.COMMENT_NODE:
        html += "<!--" + node.nodeValue + "-->";
        break;
      case Node.DOCUMENT_TYPE_NODE:
        // (X)HTML documents are identified by public identifiers
        html +=
          "<!DOCTYPE " +
          node.name +
          (node.publicId ? ' PUBLIC "' + node.publicId + '"' : "") +
          (!node.publicId && node.systemId ? " SYSTEM" : "") +
          (node.systemId ? ' "' + node.systemId + '"' : "") +
          ">\n";
        break;
    }
    node = node.nextSibling;
  }
  return html;
}

async function checkIfCommonWordsSet() {
  // chrome.storage.local.remove(["commonWords"]);

  console.log("checkIfCommonWordsSet");
  chrome.storage.local.get(["commonWords"], (result) => {
    console.log(result);
    // console.log("Retrieved name: " + result['commonWords']);
    // if common words are not set, set them
    if (!result.commonWords) {
      console.log("commonWords not set");
      console.log("Setting commonWords");

      fetch("https://my.api.mockaroo.com/commonword.json?key=a94dd180")
        .then((response) => response.json())
        .then((res) => {
          // console.log(res)

          chrome.storage.local.set({ commonWords: res }, () => {
            console.log("commonWords set");
          });
        });
    }
  });
}

browser.tabs.onActivated.addListener(async (data) => {
  console.log("tab activated :" + data);
  console.log(data.tabId);

  chrome.tabs.executeScript(
    {
      code: "(" + DOMtoString + ")(document);",
    },
    (result) => {
      const html = new DOMParser().parseFromString(result[0], "text/html");
      console.log(html);

      const body = html.getElementsByTagName("body")[0];

      //only attributes
      const childNodes = Array.from(body.childNodes).filter(
        (node) => node.nodeType === 1
      );
      console.log(childNodes);

      let possibleNodes = [];
      childNodes.forEach((node) => {
        const allnodes = getNodeData(node, []);
        possibleNodes = possibleNodes.concat(allnodes);
      });
      console.log(possibleNodes);

      const shuffledNodes = possibleNodes.sort(() => 0.5 - Math.random());
      // console.log(shuffledNodes);

      const selectedNodes = shuffledNodes.slice(
        0,
        Math.floor(shuffledNodes.length * 1)
      );
      console.log(selectedNodes);
      // selectedNodes.forEach((node) => {
      //   // node.classList.add("languageChamp");
      // });

      chrome.storage.local.get(["commonWords"], (result) => {
        const pp = result.commonWords.map((word) => word.words.toLowerCase());
        console.log(pp);
        const compatibleNodes = selectedNodes
          .filter((node) => {
            addIdsToNodes(node);
            //add class to node
            // node.classList.add("languageChamp");
            // console.log(node.classList);
            //  let sentenceWords = node.innerText.split(" ");
            return node;
          })
          .map((node) => node.innerText.toLowerCase().split(" "))
          .map((ss) => ss.filter((r) => r.match(/^[a-zA-Z]+$/)));

        const existingWords = Array.from([
          ...new Set(
            compatibleNodes.flat().filter((word) => pp.includes(word))
          ),
        ]);

        // console.log(compatibleNodes);
        console.log(existingWords);
        sendWords(existingWords);
      });
    }
  );
});

function getNodeData(node, nodeList) {
  // const disallowedNodeNames = ["style", "code", "time"];
  const allowedNodeTags = [
    "div",
    "p",
    "span",
    "strong",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "li",
    "ol",
    "table",
    "tr",
    "td",
    "th",
    "thead",
    "tbody",
    "tfoot",
    "caption",
    "colgroup",
    "col",
    "pre",
    "section",
    "script",
    "br",
  ];
  if (node.children.length > 0) {
    for (const child of node.children) {
      getNodeData(child, nodeList);
    }
  } else {
    if (
      node.innerText !== "" &&
      node.innerHTML !== "" &&
      !node.hidden &&
      !isHidden(node) &&
      checkIfStringStartsWith(node.nodeName.toLowerCase(), allowedNodeTags)
      // allowedNodeTags.includes(node.nodeName.toLowerCase())
    )
      nodeList.push(node);
  }
  return nodeList;
}

function isHidden(el) {
  var style = window.getComputedStyle(el);
  return style.display === "none" || style.visibility === "hidden";
}

function checkIfStringStartsWith(str, substrs) {
  return substrs.some((substr) =>
    str.toLowerCase().startsWith(substr.toLowerCase())
  );
}

function addIdsToNodes(node) {
  // console.log(node.nodeName);

  [...document.querySelectorAll(node.nodeName)]
    // .filter(t => t.innerText === node.innerText)
    .map((k) => k.classList.add("languageChamp"));
}

function sendWords(wordlist) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log("sending tb data");
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "words",
      words: wordlist,
    });
  });
  // chrome.runtime.sendMessage({
  //   type: "words",
  //   words: wordlist,
  // }, (response) => {
  //   console.log(response);
  // })
  // console.log(wordlist);
  // var stocks = document.querySelectorAll(".languageChamp");

  // console.log(stocks);
}
