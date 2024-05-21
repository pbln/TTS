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
  


 
  chrome.tts.getVoices((voices)=> {
    voices.forEach((voice)=> {
      const option = document.createElement("option");
      option.value = JSON.stringify({ voiceName: voice.voiceName, lang: voice.lang }); // to things in value since two voices were with same lang 
      option.text = `${voice.voiceName} (${voice.lang})`;
      select.appendChild(option);
    });
  });

  
  chrome.storage.local.get('selectedvoice', function(data) {
    if (data.selectedvoice) {
      select.value = data.selectedvoice;
    }
  });

  
  select.addEventListener('change', function() {
    const selectedVoice = select.value;
    console.log( "new log :" , selectedVoice)
    chrome.storage.local.set({ selectedvoice: selectedVoice }, function() {
    chrome.runtime.sendMessage({ type: 'SET_SELECTED_VOICE', voice:selectedVoice });
    });
  });
});
