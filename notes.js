document.addEventListener('DOMContentLoaded', function() {
    const notesContainer = document.getElementById('notesContainer');
  
    function loadNotes() {
      chrome.storage.local.get('notes',(data)=>{
        const notes= data.notes || [];
        notesContainer.innerHTML = '';
        notes.forEach((note,index) => {
            const noteEl = document.createElement("div");
            noteEl.className='note';
            noteEl.innerHTML=`
            <h2 class="note-heading">${note.heading}</h2>
            <p class="note-content">${note.content}</p>
            <button data-index="${index}" class="delete-button"> Delete </button>
            `
            notesContainer.appendChild(noteEl);
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function() {
              const index = this.getAttribute('data-index');
              deleteNote(index);
            });
          });
    

      })
    }
  
    function deleteNote(index) {
      chrome.storage.local.get('notes', function(data) {
        const notes = data.notes || [];
        notes.splice(index, 1);
        chrome.storage.local.set({ notes }, function() {
          loadNotes();
        });
      });
    }
  
    loadNotes();
  });
  