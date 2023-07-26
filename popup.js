//SAVER 

const inputEl = document.getElementById("input-el");
const saveTextBtnEl = document.getElementById("save-text-btn");
const saveUrlBtnEl = document.getElementById("save-url-btn");
const showBtnEl = document.getElementById("show-btn");
const hideBtnEl = document.getElementById("hide-btn");
const deleteBtnEl = document.getElementById("delete-all-btn");
const messageEl = document.getElementById("message-el");
const ulEl = document.getElementById("ul-el");


// Detect if dark mode is enabled in Chrome. If yes, Saver toggles to dark mode.
function changeMode(){
    let element = document.body;
    element.classList.toggle("dark-mode");
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    //alert("Dark mode enabled!");
    changeMode();
}



let myLinks = localStorage.getItem("myLinks");
if( !myLinks ) {
    localStorage.setItem("mylinks", "")
}


saveUrlBtnEl.addEventListener("click", function() {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        let activeTab = tabs[0].url;

        myLinks += `
                <li>
                    <a target='_blank' href='${activeTab}'>
                    ${activeTab}
                    </a>
                </li>            
            `
        localStorage.setItem("myLinks", myLinks);
        messageEl.hidden = false;
        messageEl.textContent = "Item saved !";
        inputEl.value = "";
        setTimeout(() => {
            messageEl.hidden = true;
        }, 1000);
    });  
})

saveTextBtnEl.addEventListener("click", function() {
    if(inputEl.textContent === null)    return
    myLinks += `
                <li>
                    ${inputEl.value}
                </li>            
            `

    localStorage.setItem("myLinks", myLinks);
    messageEl.hidden = false;
    messageEl.textContent = "Item saved !";
    inputEl.value = "";
    setTimeout(() => {
        messageEl.hidden = true;
    }, 1000);
})

showBtnEl.addEventListener("click", function() {
    ulEl.innerHTML = localStorage.getItem("myLinks");
})

hideBtnEl.addEventListener("click", function() {
    ulEl.textContent = "";
})

deleteBtnEl.addEventListener("click", function() {
    localStorage.removeItem("myLinks");
    myLinks = "";
    ulEl.textContent = "";    
})





//YT BOOKMARK

import { getActiveTabURL } from "./utils.js";

const addNewBookmark = (bookmarks, bookmark) => {
  const bookmarkTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");

  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";
  controlsElement.className = "bookmark-controls";

  setBookmarkAttributes("play", onPlay, controlsElement);
  setBookmarkAttributes("delete", onDelete, controlsElement);

  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  newBookmarkElement.appendChild(bookmarkTitleElement);
  newBookmarkElement.appendChild(controlsElement);
  bookmarks.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks=[]) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  if (currentBookmarks.length > 0) {
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i];
      addNewBookmark(bookmarksElement, bookmark);
    }
  } else {
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
  }

  return;
};

const onPlay = async e => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async e => {
  const activeTab = await getActiveTabURL();
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const bookmarkElementToDelete = document.getElementById(
    "bookmark-" + bookmarkTime
  );

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  chrome.tabs.sendMessage(activeTab.id, {
    type: "DELETE",
    value: bookmarkTime,
  }, viewBookmarks);
};

const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");

  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getActiveTabURL();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

      viewBookmarks(currentVideoBookmarks);
    });
  } else {
    const container = document.getElementsByClassName("container")[0];

    container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
  }
});

