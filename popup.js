document.addEventListener('DOMContentLoaded', function() {
  const select = document.getElementById("voice_select");

  document.getElementById('pause').addEventListener('click', function() {
    chrome.tts.pause();
  });
  document.getElementById('stop').addEventListener('click', function() {
    chrome.tts.stop();
  });
  document.getElementById('resume').addEventListener('click', function() {
    chrome.tts.resume();
  });
  


  // Get available voices and populate the select box
  chrome.tts.getVoices(function(voices) {
    voices.forEach(function(voice) {
      const option = document.createElement("option");
      option.value = JSON.stringify({ voiceName: voice.voiceName, lang: voice.lang });
      option.text = `${voice.voiceName} (${voice.lang})`;
      select.appendChild(option);
    });
  });

  // Load the saved voice selection
  chrome.storage.local.get('selectedvoice', function(data) {
    if (data.selectedvoice) {
      select.value = data.selectedvoice;
    }
  });

  // Save the selected voice and send it to the background script when the user changes the selection
  select.addEventListener('change', function() {
    const selectedVoice = select.value;
    chrome.storage.local.set({ selectedvoice: selectedVoice }, function() {
      // Confirm the voice has been saved by retrieving it again
      chrome.storage.local.get('selectedvoice', function(data) {
        console.log('Selected voice:', data.selectedvoice);
        if (data.selectedvoice) {
          select.value = data.selectedvoice;
        }

        // Send the selected voice to the background script
        chrome.runtime.sendMessage({ type: 'SET_SELECTED_VOICE', voice: data.selectedvoice });
      });
    });
  });
});
