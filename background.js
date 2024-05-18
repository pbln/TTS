let selectedVoice; 

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: "parent",
    title: "Speak Up",
    contexts: ["selection"]
  });

  // Child menu item for speaking text
  chrome.contextMenus.create({
    id: "speak",
    parentId: "parent",
    title: "Speak Text",
    contexts: ["selection"]
  });

  // Child menu item for getting definition
  chrome.contextMenus.create({
    id: "definition",
    parentId: "parent",
    title: "Definition",
    contexts: ["selection"]
  });

});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "speak") {
    if (selectedVoice) {
      chrome.tts.speak(info.selectionText, { "voiceName": selectedVoice.voiceName, 'lang': selectedVoice.lang, 'rate': 1.0 });
    } else {
      chrome.tts.speak(info.selectionText, { 'rate': 1.0 }); // Fallback if no voice is selected
    }
  } else if (info.menuItemId === "definition") {
    getDefinition(info.selectionText, async function(definition) {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl:'icon.png',
        title: 'Definition',
        message: definition
      });
    });
  }
});


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'SET_SELECTED_VOICE') {
    selectedVoice = JSON.parse(message.voice);
    console.log('Received selected voice in background script:', selectedVoice);
  }
});

function getDefinition(word, callback) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}` ; 
  fetch(url)
  .then( response => response.json())
  .then(data =>{
    if (data && data.length > 0 && data[0].meanings && data[0].meanings.length > 0) {
      const definition = data[0].meanings[0].definitions[0].definition;
      callback(definition);
    } else {
      callback("No defination found");
    }
  })
  .catch(err =>{
    console.error(err)
  })

  }

