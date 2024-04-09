// main.js

let codeEditor;
let currentFileHandle;
let isFileSaved = true;

function onWindowClose() {
  Neutralino.app.exit();
}

Neutralino.init();
Neutralino.events.on("windowClose", onWindowClose);

document.addEventListener("DOMContentLoaded", function () {
  // Simulate a delay for the splash screen
  setTimeout(function () {
    // Get the splash screen element
    const splashScreen = document.getElementById("splash-screen");

    // Start the fade out effect
    splashScreen.style.transition = "opacity 1s ease-out";
    splashScreen.style.opacity = 0;

    // Wait for the transition to finish, then redirect
    setTimeout(function () {
      window.location.href = "index2.html";
    }, 1000); // Adjust the delay for the transition (in milliseconds) as needed
  }, 10000); // Adjust the delay for the splash screen (in milliseconds) as needed

  const newFileHexagon = document.querySelector('.hexagon-wrapper:nth-child(1) .hexagon');
  const openFileHexagon = document.querySelector('.hexagon-wrapper:nth-child(2) .hexagon');
  const saveFileHexagon = document.querySelector('.hexagon-wrapper:nth-child(3) .hexagon');
  const closeFileHexagon = document.querySelector('.hexagon-wrapper:nth-child(4) .hexagon');

  newFileHexagon.addEventListener('click', createNewFile);
  openFileHexagon.addEventListener('click', openFile);
  saveFileHexagon.addEventListener('click', saveFile);
  closeFileHexagon.addEventListener('click', closeFile);
});

// Function to create the code editor
function createCodeEditor() {
  const editorContainer = document.createElement('div');
  editorContainer.className = 'editor-container';

  codeEditor = document.createElement('textarea');
  codeEditor.id = 'code-editor';

  const closeButton = document.createElement('button');
  closeButton.id = 'close-editor';
  closeButton.textContent = 'Close';
  closeButton.addEventListener('click', closeFile);

  editorContainer.appendChild(codeEditor);
  editorContainer.appendChild(closeButton);
  document.body.appendChild(editorContainer);

  // Add event listener to track changes in the code editor
  codeEditor.addEventListener('input', function() {
    isFileSaved = false;
    codeEditor.style.backgroundColor = 'lightgray';
  });
}

// Function to remove the code editor
function removeCodeEditor() {
  const editorContainer = codeEditor.parentElement;
  editorContainer.remove();
  codeEditor = null;
  currentFileHandle = null;
  isFileSaved = true;
}

// Function to create a new file
function createNewFile() {
  if (!isFileSaved) {
    alert('Please save or discard changes in the current file before creating a new file.');
    return;
  }

  // Check if the code editor already exists
  const existingEditor = document.getElementById('code-editor');
  if (existingEditor) {
    // If the code editor exists, clear its contents
    existingEditor.value = '';
    existingEditor.style.backgroundColor = 'lightgray';
    currentFileHandle = null;
  } else {
    // If the code editor doesn't exist, create it
    createCodeEditor();
  }
  
  isFileSaved = false;
}

// Function to open a file
async function openFile() {
  if (codeEditor && !isFileSaved) {
    const confirmOpen = confirm('Are you sure you want to open a new file without saving the current file?');
    if (!confirmOpen) {
      return;
    }
  }

  try {
    const selectedFile = await Neutralino.os.showOpenDialog();
    
    if (selectedFile && selectedFile.length > 0) {
      const filePath = selectedFile[0];
      const content = await Neutralino.filesystem.readFile(filePath);

      if (!codeEditor) {
        createCodeEditor();
      }

      codeEditor.value = content;
      currentFileHandle = filePath;
      codeEditor.style.backgroundColor = 'white';
      isFileSaved = true;

      console.log('File opened successfully');
    }
  } catch (err) {
    console.error('Failed to open file:', err);
  }
}

// Function to save a file
async function saveFile() {
  if (codeEditor) {
    const content = codeEditor.value;
    try {
      if (currentFileHandle) {
        // Save changes to the existing file
        await Neutralino.filesystem.writeFile(currentFileHandle, content);
        codeEditor.style.backgroundColor = 'white';
        isFileSaved = true;
      } else {
        // Save as a new file
        const selectedFile = await Neutralino.os.showSaveDialog();
        if (selectedFile) {
          await Neutralino.filesystem.writeFile(selectedFile, content);
          currentFileHandle = selectedFile;
          codeEditor.style.backgroundColor = 'white';
          isFileSaved = true;
        }
      }
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  } else {
    alert('No file is currently open.');
  }
}

// Function to close a file
async function closeFile() {
  if (codeEditor) {
    if (!isFileSaved) {
      const confirmClose = confirm('Are you sure you want to exit without saving the file?');
      if (confirmClose) {
        removeCodeEditor();
      } else {
        return;
      }
    } else {
      removeCodeEditor();
    }
  }
}