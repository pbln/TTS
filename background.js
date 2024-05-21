let selectedVoice; 

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: "parent",
    title: "BrowseWise",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "add_note",
    parentId: "parent",
    title: "Add to Note",
    contexts: ["selection"]
  });


  chrome.contextMenus.create({
    id: "speak",
    parentId: "parent",
    title: "Speak Text",
    contexts: ["selection"]
  });

  
  chrome.contextMenus.create({
    id: "definition",
    parentId: "parent",
    title: "Definition",
    contexts: ["selection"]
  });

  
  chrome.contextMenus.create({
    id: "highlight",
    parentId: "parent",
    title: "Highlight Text",
    contexts: ["selection"]
  });
});

// handling all context menus 
//1.
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "speak") {
    if (selectedVoice) {
      chrome.tts.speak(info.selectionText, { "voiceName": selectedVoice.voiceName, 'lang': selectedVoice.lang, 'rate': 1.0 });
    } else {
      chrome.tts.speak(info.selectionText, { 'rate': 1.0 }); 
    }
  } 
//2.
  else if (info.menuItemId === "definition") {
    getDefinition(info.selectionText, async(definition)=>{
      await chrome.notifications.create({  //to display as chrome notification
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Definition',
        message: definition
      });
    });
  }
//3.
  else if (info.menuItemId === "highlight") {
    chrome.scripting.executeScript({ //to inject js or css to the target context
      target: { tabId: tab.id },
      function: highlightSelectedText
    });
  }
//4. 
  else if (info.menuItemId === "add_note") {
    chrome.scripting.executeScript({  //the syntax is injection , callback
      target: { tabId: tab.id },
      function: copyToClipboard,
      args: [info.selectionText]
    }, () => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: openNotePopup,
        args: [info.selectionText]
      });
    });
  } 
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'SET_SELECTED_VOICE') {
    selectedVoice = JSON.parse(message.voice); //parse method is used to make a js object
    console.log('Received selected voice in background script:', selectedVoice);
  }
  else if (message.type === 'SAVE_NOTE') {
    chrome.storage.local.get('notes', function(data) {
      const notes = data.notes || [];
      notes.push({ heading: message.heading, content: message.content });
      chrome.storage.local.set({ notes }, function() {
        sendResponse({ status: 'saved' });
      });
    });
    return true;
  }
});

function getDefinition(word, callback) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`; 
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0 && data[0].meanings && data[0].meanings.length > 0) {
        const definition = data[0].meanings[0].definitions[0].definition;
        callback(definition);
      } else {
        callback("No definition found");
      }
    })
    .catch(err => {
      console.error(err);
      callback("Error fetching definition");
    });
}

function highlightSelectedText() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = 'yellow';
    span.style.color = 'black';
    span.appendChild(range.extractContents());
    range.insertNode(span);
  }
}

function openNotePopup() {
  const noteContent = window.prompt('Enter note content:' , "Press ctrl+V to paste selected text");
  const noteHeading = window.prompt('Enter note heading:');
  if (noteHeading && noteContent) {
    chrome.runtime.sendMessage({ type: 'SAVE_NOTE', heading: noteHeading, content: noteContent });
  }
}

async function copyToClipboard(text, callback) {

  try{
    await navigator.clipboard.writeText(text).then(callback).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }catch(error){
    console.error(error)
  }
  
}